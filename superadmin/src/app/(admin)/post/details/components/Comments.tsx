import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import { useListComments, useCreateComment } from "@/hooks/useComments";
import avatarImg from "@/assets/images/users/avatar-6.jpg";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useSession } from "next-auth/react";

interface CommentsProps {
  noticeId?: string;
}

const Comments = ({ noticeId }: CommentsProps) => {
  const { data: session } = useSession();
  const { data: comments, isLoading, error } = useListComments(noticeId || '');
  const createCommentMutation = useCreateComment();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const currentAuthorName = session?.user?.name || session?.user?.email || "Administrator";
  const currentAuthorAvatar = session?.user?.image || "/images/users/avatar-6.jpg";

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !noticeId) return;
    
    try {
      await createCommentMutation.mutateAsync({
        notice_id: noticeId,
        author_name: currentAuthorName,
        author_avatar: currentAuthorAvatar,
        content: replyText.trim(),
        parent_id: parentId
      });
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Failed to load comments:', error);
    return (
      <div className="text-center py-3 text-muted">
        Failed to load comments
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  // Check if we need scrollable container (5 or more comments)
  const needsScrolling = comments.length >= 5;
  
  // Calculate consistent height based on typical comment height
  // Each comment is approximately 120px (avatar + content + padding + borders)
  const COMMENT_HEIGHT = 136;
  const CONTAINER_HEIGHT = COMMENT_HEIGHT * 5; // Height for 5 comments
  
  const commentsContent = (
    <>
      {comments.map((comment, idx) => (
        <div
          className={`ps-0  ${idx == 1 ? "pt-4" : "pt-3"}  ${idx == 0 && !needsScrolling && "border-top mt-3"}`}
          key={comment.id}
        >
          <div className="d-sm-flex align-items-top">
            <div className="position-relative">
              <Image
                src={comment.author_avatar || avatarImg}
                alt="avatar"
                className="avatar rounded-circle flex-shrink-0"
                width={40}
                height={40}
              />
            </div>
            <div className="flex-grow-1 ms-sm-3">
              <span>
                <Link href="" className="text-dark fw-medium">
                  {comment.author_name}
                </Link>
              </span>
              <p className="text-muted mb-2">
                {new Date(comment.created_at).toLocaleString("en-us", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p className="text-muted">{comment.content}</p>
              <div className="d-flex gap-3 fs-16">
                <Link href="" className="d-flex align-items-center text-dark">
                  <IconifyIcon
                    icon="solar:like-bold-duotone"
                    className="me-1"
                  />{" "}
                  {comment.likes_count || 0}
                </Link>
                <button 
                  className="btn btn-link p-0 d-flex align-items-center text-dark"
                  onClick={() => handleReply(comment.id)}
                >
                  <IconifyIcon
                    icon="solar:chat-square-call-bold"
                    className="me-1"
                  />
                  Reply
                </button>
              </div>
              
              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <textarea
                    className="form-control mb-2"
                    rows={3}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim() || createCommentMutation.isPending}
                    >
                      {createCommentMutation.isPending ? 'Posting...' : 'Post Reply'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={handleCancelReply}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Display replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ps-4 border-start border-2 border-light">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="d-sm-flex align-items-top py-2">
                      <div className="position-relative">
                        <Image
                          src={reply.author_avatar || avatarImg}
                          alt="avatar"
                          className="avatar-xs rounded-circle flex-shrink-0"
                          width={32}
                          height={32}
                        />
                      </div>
                      <div className="flex-grow-1 ms-sm-3">
                        <span>
                          <Link href="" className="text-dark fw-medium">
                            {reply.author_name}
                          </Link>
                        </span>
                        <p className="text-muted mb-1 fs-6">
                          {new Date(reply.created_at).toLocaleString("en-us", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          })}
                        </p>
                        <p className="text-muted fs-6">{reply.content}</p>
                        <div className="d-flex gap-2">
                          <button className="btn btn-link btn-sm p-0 text-muted">
                            <IconifyIcon icon="solar:heart-outline" className="me-1" />
                            {reply.likes_count || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link
              href=""
              data-bs-toggle="tooltip"
              data-bs-title="Comment"
              data-bs-placement="top"
            >
              <div className="avatar-sm flex-shrink-0 mt-2 ">
                <span className="avatar-title bg-light text-dark fs-4 rounded border border-dashed">
                  <IconifyIcon icon="solar:chat-square-bold-duotone" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </>
  );

  // Return with or without scrollable container based on comment count
  return needsScrolling ? (
    <>
      {/* Fixed border line that stays visible while comments scroll underneath */}
      <div className="border-top mt-3 mb-2"></div>
      <div 
        style={{ 
          height: `${CONTAINER_HEIGHT}px`, // Fixed height instead of maxHeight
          overflowY: 'auto',
          paddingRight: '8px'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 6px;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          div:hover::-webkit-scrollbar {
            opacity: 1;
          }
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}</style>
        <div style={{ paddingTop: '10px' }}>
          {commentsContent}
        </div>
      </div>
    </>
  ) : (
    commentsContent
  );
};

export default Comments;
