import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle, Button, Form } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface ComplaintCommentsProps {
  complaintId: string;
  comments?: Comment[];
}

const ComplaintComments = ({ complaintId, comments = [] }: ComplaintCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample comments data
  const sampleComments: Comment[] = [
    {
      id: "1",
      author: "Admin User",
      role: "Admin",
      content: "Thank you for reporting this issue. We have assigned a technician to investigate the problem.",
      timestamp: "2024-11-15T10:00:00Z",
    },
    {
      id: "2",
      author: "Sarah Johnson",
      role: "Resident",
      content: "The issue is getting worse. Water is now dripping onto the floor below. Please expedite the repair.",
      timestamp: "2024-11-15T14:30:00Z",
    },
  ];

  const allComments = comments.length > 0 ? comments : sampleComments;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add comment logic here
    console.log("Adding comment:", newComment);
    
    setNewComment("");
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-primary-subtle text-primary";
      case "resident":
        return "bg-info-subtle text-info";
      case "maintenance":
        return "bg-warning-subtle text-warning";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h5" className="mb-0">
          <IconifyIcon icon="ri:chat-3-line" className="me-2" />
          Comments & Updates ({allComments.length})
        </CardTitle>
      </CardHeader>
      <CardBody>
        {/* Comments List */}
        <div className="comments-list mb-4">
          {allComments.map((comment) => (
            <div key={comment.id} className="comment-item mb-3 pb-3 border-bottom">
              <div className="d-flex align-items-start">
                <div className="avatar-sm bg-primary bg-opacity-10 rounded flex-centered me-3">
                  <IconifyIcon 
                    icon={comment.role === "Admin" ? "ri:admin-line" : "ri:user-line"} 
                    className="fs-16 text-primary" 
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fs-14">{comment.author}</h6>
                      <span className={`badge py-1 px-2 fs-12 ${getRoleBadgeClass(comment.role)}`}>
                        {comment.role}
                      </span>
                    </div>
                    <small className="text-muted">{formatDate(comment.timestamp)}</small>
                  </div>
                  <p className="mb-0 text-muted fs-13 lh-base">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <Form onSubmit={handleSubmitComment}>
          <div className="mb-3">
            <Form.Label className="fw-medium">Add Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a comment or update about this complaint..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="d-flex justify-content-end">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
        </Form>
      </CardBody>
    </Card>
  );
};

export default ComplaintComments;
