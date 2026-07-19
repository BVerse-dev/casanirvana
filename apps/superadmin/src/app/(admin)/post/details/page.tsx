"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Badge, Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";

import PageTitle from "@/components/PageTitle";
import {
  formatNoticeLabel,
  getNoticeStatus,
  useDeleteNotice,
  useGetNotice,
} from "@/hooks/useNotices";
import { useCreateComment, useListComments } from "@/hooks/useComments";

const getStatusVariant = (status?: string | null) => {
  switch (getNoticeStatus({ status })) {
    case "draft":
      return "secondary";
    case "archived":
      return "dark";
    case "published":
    default:
      return "success";
  }
};

const getPriorityVariant = (priority?: string | null) => {
  switch (priority) {
    case "urgent":
      return "danger";
    case "high":
      return "warning";
    case "low":
      return "success";
    case "medium":
    default:
      return "info";
  }
};

const NoticeDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const noticeId = searchParams.get("id") || "";
  const { data: notice, isLoading, error } = useGetNotice(noticeId);
  const { data: comments = [] } = useListComments(noticeId);
  const createComment = useCreateComment();
  const deleteNotice = useDeleteNotice();
  const [commentText, setCommentText] = useState("");
  const [feedback, setFeedback] = useState<{ variant: "success" | "danger"; message: string } | null>(null);

  const totalComments = useMemo(
    () => comments.reduce((count, comment) => count + 1 + (comment.replies?.length || 0), 0),
    [comments],
  );

  const handleDelete = async () => {
    if (!notice?.id) return;
    if (!window.confirm(`Delete \"${notice.title}\"? This cannot be undone.`)) return;

    setFeedback(null);
    try {
      await deleteNotice.mutateAsync(notice.id);
      router.push("/post");
    } catch (deleteError) {
      console.error("Failed to delete notice:", deleteError);
      setFeedback({ variant: "danger", message: "Failed to delete notice." });
    }
  };

  const handleCommentSubmit = async () => {
    if (!notice?.id || !commentText.trim()) return;
    setFeedback(null);

    try {
      await createComment.mutateAsync({
        notice_id: notice.id,
        author_name: session?.user?.name || session?.user?.email || "Administrator",
        author_avatar: session?.user?.image || undefined,
        content: commentText.trim(),
      });
      setCommentText("");
      setFeedback({ variant: "success", message: "Comment posted successfully." });
    } catch (commentError) {
      console.error("Failed to create comment:", commentError);
      setFeedback({ variant: "danger", message: "Failed to post comment." });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setFeedback({ variant: "success", message: "Notice link copied to clipboard." });
    } catch (copyError) {
      console.error("Failed to copy link:", copyError);
      setFeedback({ variant: "danger", message: "Failed to copy notice link." });
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="Notice Details" subName="Communication" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 320 }}>
          <Spinner animation="border" />
        </div>
      </>
    );
  }

  if (error || !notice) {
    return (
      <>
        <PageTitle title="Notice Details" subName="Communication" />
        <Alert variant="danger">{error ? "Failed to load this notice." : "Notice not found."}</Alert>
        <Link href="/post" className="btn btn-outline-secondary btn-sm">
          Back to Notices
        </Link>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Notice Details" subName="Communication" />

      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Link href="/post" className="btn btn-outline-secondary btn-sm">
              Back to Notices
            </Link>
            <div className="d-flex gap-2 flex-wrap">
              <Link href={`/post/edit?id=${notice.id}`} className="btn btn-outline-primary btn-sm">
                Edit Notice
              </Link>
              <Button variant="outline-secondary" size="sm" onClick={() => void handleCopyLink()}>
                Copy Link
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => void handleDelete()} disabled={deleteNotice.isPending}>
                Delete
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          {feedback ? (
            <Alert variant={feedback.variant} dismissible onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          ) : null}

          <Card className="mb-4">
            <CardBody>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg={getStatusVariant(notice.status)}>{formatNoticeLabel(getNoticeStatus(notice))}</Badge>
                <Badge bg={getPriorityVariant(notice.priority)}>{formatNoticeLabel(notice.priority || "medium")}</Badge>
                {notice.is_featured ? <Badge bg="primary">Featured</Badge> : null}
                {notice.category ? <Badge bg="light" text="dark" className="border">{formatNoticeLabel(notice.category)}</Badge> : null}
              </div>
              <h2 className="mb-3">{notice.title}</h2>
              <div className="text-muted d-flex flex-wrap gap-4 mb-4 fs-13">
                <span>{notice.author_name || "Administrator"}</span>
                <span>{new Date(notice.posted_at || notice.created_at || new Date().toISOString()).toLocaleString()}</span>
                <span>{notice.communities?.name || "All Communities"}</span>
              </div>

              <div className="mb-4 rounded overflow-hidden bg-light" style={{ minHeight: 260 }}>
                {notice.image_url ? (
                  <img src={notice.image_url} alt={notice.title} className="w-100" style={{ objectFit: "cover", maxHeight: 420 }} />
                ) : notice.video_url ? (
                  <video src={notice.video_url} className="w-100" controls style={{ maxHeight: 420 }} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: 260 }}>
                    No media attached
                  </div>
                )}
              </div>

              <div className="mb-4" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {notice.body}
              </div>

              {notice.tags?.length ? (
                <div className="d-flex flex-wrap gap-2">
                  {notice.tags.map((tag) => (
                    <Badge bg="light" text="dark" className="border" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Comments
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Form.Group className="mb-3">
                <Form.Label>Post Public Comment</Form.Label>
                <Form.Control as="textarea" rows={3} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a resident-visible comment on this notice..." />
                <Form.Text className="text-muted">Comments posted here are visible to residents who can access this notice.</Form.Text>
              </Form.Group>
              <div className="d-flex justify-content-end mb-4">
                <Button onClick={() => void handleCommentSubmit()} disabled={createComment.isPending || !commentText.trim()}>
                  {createComment.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>

              <div className="d-grid gap-3">
                {comments.length ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border rounded p-3">
                      <div className="d-flex justify-content-between gap-3 mb-2">
                        <div>
                          <div className="fw-semibold">{comment.author_name}</div>
                          <div className="text-muted fs-13">{new Date(comment.created_at).toLocaleString()}</div>
                        </div>
                        <Badge bg="light" text="dark" className="border">
                          {Number(comment.likes_count || 0)} likes
                        </Badge>
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{comment.content}</div>
                      {comment.replies?.length ? (
                        <div className="mt-3 d-grid gap-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-light rounded p-2 ms-3">
                              <div className="fw-semibold fs-13">{reply.author_name}</div>
                              <div className="text-muted fs-12 mb-1">{new Date(reply.created_at).toLocaleString()}</div>
                              <div className="fs-13" style={{ whiteSpace: "pre-wrap" }}>{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">No comments have been posted yet.</p>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Engagement
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Views</span>
                <span className="fw-semibold">{Number(notice.views_count || 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Likes</span>
                <span className="fw-semibold">{Number(notice.likes_count || 0)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Comments</span>
                <span className="fw-semibold">{totalComments}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                Publication Details
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Community</span>
                <span className="fw-semibold">{notice.communities?.name || "All Communities"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Posted</span>
                <span className="fw-semibold">{new Date(notice.posted_at || notice.created_at || new Date().toISOString()).toLocaleDateString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Updated</span>
                <span className="fw-semibold">{notice.updated_at ? new Date(notice.updated_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Media</span>
                <span className="fw-semibold">{notice.video_url ? "Video" : notice.image_url ? "Image" : "None"}</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default NoticeDetailsPage;
