import { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Form } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  useCreateComplaintComment,
  useListComplaintComments,
  type ComplaintCommentWithProfile,
} from "@/hooks/useComplaints";

interface ComplaintCommentsProps {
  complaintId: string;
}

const getAuthorName = (comment: ComplaintCommentWithProfile) => {
  const profile = comment.created_by_profile;
  if (!profile) return "Unknown User";
  const full = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  if (full) return full;
  if (profile.full_name) return profile.full_name;
  return profile.email || "Unknown User";
};

const getRoleLabel = (comment: ComplaintCommentWithProfile) => {
  const role = comment.created_by_profile?.role;
  if (!role) return "User";
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRoleBadgeClass = (roleLabel: string) => {
  const role = roleLabel.toLowerCase();
  if (role.includes("admin") || role.includes("superadmin")) {
    return "bg-primary-subtle text-primary";
  }
  if (role.includes("guard")) {
    return "bg-warning-subtle text-warning";
  }
  if (role.includes("committee")) {
    return "bg-info-subtle text-info";
  }
  return "bg-secondary-subtle text-secondary";
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ComplaintComments = ({ complaintId }: ComplaintCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const {
    data: comments = [],
    isLoading,
    error,
  } = useListComplaintComments(complaintId);
  const createCommentMutation = useCreateComplaintComment();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createCommentMutation.mutateAsync({
      complaintId,
      comment: newComment,
    });
    setNewComment("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h5" className="mb-0">
          <IconifyIcon icon="ri:chat-3-line" className="me-2" />
          Comments & Updates ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardBody>
        {error ? (
          <Alert variant="danger" className="mb-3">
            Failed to load comments: {(error as Error).message}
          </Alert>
        ) : null}

        <div className="comments-list mb-4">
          {isLoading ? (
            <div className="text-muted">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-muted">No comments yet.</div>
          ) : (
            comments.map((comment) => {
              const author = getAuthorName(comment);
              const roleLabel = getRoleLabel(comment);
              return (
                <div key={comment.id} className="comment-item mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-start">
                    <div className="avatar-sm bg-primary bg-opacity-10 rounded flex-centered me-3">
                      <IconifyIcon
                        icon={roleLabel.toLowerCase().includes("admin") ? "ri:admin-line" : "ri:user-line"}
                        className="fs-16 text-primary"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="mb-0 fs-14">{author}</h6>
                          <span className={`badge py-1 px-2 fs-12 ${getRoleBadgeClass(roleLabel)}`}>
                            {roleLabel}
                          </span>
                        </div>
                        <small className="text-muted">{formatDate(comment.created_at)}</small>
                      </div>
                      <p className="mb-0 text-muted fs-13 lh-base">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Form onSubmit={handleSubmitComment}>
          <div className="mb-3">
            <Form.Label className="fw-medium">Add Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a comment or update about this complaint..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={createCommentMutation.isPending}
            />
          </div>
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Posting...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
          {createCommentMutation.error ? (
            <Alert variant="danger" className="mt-3 mb-0">
              Failed to post comment: {(createCommentMutation.error as Error).message}
            </Alert>
          ) : null}
        </Form>
      </CardBody>
    </Card>
  );
};

export default ComplaintComments;
