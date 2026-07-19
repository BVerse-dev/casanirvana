"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Card, CardBody, Col, Spinner, Alert } from "react-bootstrap";
import { useListNotices, type Notice } from "@/hooks/useNotices";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Unified Notice Card Component - handles both video and image content from database
const NoticeCard = ({ notice }: { notice: Notice }) => {
  const router = useRouter();
  const displayTags = notice.tags && Array.isArray(notice.tags) ? notice.tags : ['General'];
  
  const handleCardClick = () => {
    router.push(`/post/details?id=${notice.id}`);
  };
  
  return (
    <Card 
      className="h-100" 
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      <CardBody className="p-2">
        <div className="ratio ratio-16x9">
          {notice.video_url ? (
            <iframe 
              src={notice.video_url}
              className="rounded"
              allowFullScreen
              style={{ pointerEvents: 'none' }} // Prevent iframe interaction during card click
            />
          ) : notice.image_url ? (
            <Image 
              src={notice.image_url}
              alt={notice.title}
              className="rounded"
              style={{ objectFit: 'cover' }}
              fill
              onError={(e) => {
                console.error('Image failed to load:', notice.image_url);
                // Hide the image and show the placeholder icon instead
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<div class="rounded bg-light d-flex align-items-center justify-content-center h-100"><i class="solar-file-text-bold-duotone fs-48 text-muted"></i></div>';
                }
              }}
            />
          ) : (
            <div className="rounded bg-light d-flex align-items-center justify-content-center">
              <IconifyIcon icon="solar:file-text-bold-duotone" className="fs-48 text-muted" />
            </div>
          )}
        </div>
        <span className="text-dark d-inline-block my-2">
          <span className="text-dark fs-18 fw-medium">
            {notice.title}
          </span>
          &nbsp;
          {displayTags.map((tag, idx) => (
            <span
              className={`badge px-2 py-1 bg-${tag == "Tutorial" || tag == "Tutorials" ? "success" : tag == "News" ? "warning" : tag == "Homes" ? "primary" : "danger"}-subtle text-${tag == "Tutorial" || tag == "Tutorials" ? "success" : tag == "News" ? "warning" : tag == "Homes" ? "primary" : "danger"} ms-1 `}
              key={idx}
            >
              {tag}
            </span>
          ))}
        </span>
        <p className="text-muted">{notice.body.length > 100 ? `${notice.body.substring(0, 100)}...` : notice.body}</p>
        <div className="d-flex align-items-center gap-1">
          <div className="d-block flex-grow-1">
            <span className="text-dark">
              <span className="text-dark fw-medium">
                {notice.author_name || 'Administrator'}
              </span>
            </span>
            <p className="text-muted mb-0">
              <Icon icon="ti:calendar-due" />
              {new Date(notice.posted_at || notice.created_at || new Date()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="ms-auto">
            <span>
              <button
                type="button"
                className="btn btn-soft-danger avatar-sm d-inline-flex align-items-center justify-content-center fs-20 rounded-circle"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking heart button
                  // Handle like action here if needed
                }}
              >
                <span>
                  <IconifyIcon icon="solar:heart-broken" />
                </span>
              </button>
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Posts = () => {
  const router = useRouter();
  // Fetch notices from database
  const { data: notices, isLoading, error } = useListNotices();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-4">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Failed to load notices: {error.message}
      </Alert>
    );
  }

  return (
    <>
      {/* Scrollable container for all posts */}
      <div 
        className="scrollable-posts" 
        style={{ 
          height: '800px', 
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '8px'
        }}
      >
        <style jsx>{`
          .scrollable-posts::-webkit-scrollbar {
            width: 6px;
          }
          .scrollable-posts::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .scrollable-posts::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          .scrollable-posts::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}</style>
        <div className="row g-3">
          {/* Render all notices from database */}
          {notices && notices.map((notice, idx) => (
            <Col xl={3} lg={6} key={`notice-${notice.id}`} className="mb-3">
              <NoticeCard notice={notice} />
            </Col>
          ))}
        </div>
      </div>
    </>
  );
};

export default Posts;
