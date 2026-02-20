"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import { Card, CardBody, CardHeader, CardTitle, Col, Spinner, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useListNotices } from "@/hooks/useNotices";

const FreshArticles = () => {
  const router = useRouter();
  const { data: notices, isLoading, error } = useListNotices();
  
  // Get the featured notice or most recent notice
  const featuredNotice = notices?.find(notice => notice.is_featured) || notices?.[0];
  
  const handleFreshArticleClick = () => {
    if (featuredNotice) {
      router.push(`/post/details?id=${featuredNotice.id}`);
    }
  };
  
  if (isLoading) {
    return (
      <Col xl={5} lg={12}>
        <Card style={{ height: '600px' }}>
          <CardHeader>
            <CardTitle as={"h4"}>Fresh Articles, News &amp; Updates</CardTitle>
          </CardHeader>
          <CardBody className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" size="sm" />
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error || !featuredNotice) {
    return (
      <Col xl={5} lg={12}>
        <Card style={{ height: '600px' }}>
          <CardHeader>
            <CardTitle as={"h4"}>Fresh Articles, News &amp; Updates</CardTitle>
          </CardHeader>
          <CardBody className="d-flex justify-content-center align-items-center">
            <Alert variant="warning">
              {error ? `Error: ${error.message}` : 'No featured articles available'}
            </Alert>
          </CardBody>
        </Card>
      </Col>
    );
  }
  
  return (
    <Col xl={5} lg={12}>
      <Card 
        style={{ height: '590px', cursor: 'pointer' }}
        onClick={handleFreshArticleClick}
      >
        <CardHeader>
          <CardTitle as={"h4"}>Fresh Articles, News &amp; Updates</CardTitle>
        </CardHeader>
        <CardBody className="d-flex flex-column">
          <style jsx>{`
            .scrollable-content::-webkit-scrollbar {
              width: 4px;
            }
            .scrollable-content::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 2px;
            }
            .scrollable-content::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 2px;
            }
            .scrollable-content::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }
          `}</style>
          <div className="position-relative" style={{ height: '200px' }}>
            {featuredNotice.image_url ? (
              <Image
                src={featuredNotice.image_url}
                alt={featuredNotice.title}
                className="rounded-3"
                style={{ objectFit: 'cover' }}
                fill
              />
            ) : featuredNotice.video_url ? (
              <iframe 
                src={featuredNotice.video_url}
                className="rounded-3 w-100 h-100"
                style={{ border: 'none' }}
                allowFullScreen
              />
            ) : (
              <div className="rounded-3 bg-light d-flex align-items-center justify-content-center h-100">
                <IconifyIcon icon="solar:file-text-bold-duotone" className="fs-48 text-muted" />
              </div>
            )}
          </div>
          <div className="mt-3 flex-grow-1 d-flex flex-column justify-content-between">
            <span>
              <span className="text-dark fs-18 fw-medium">
                {featuredNotice.title}
              </span>
              &nbsp;
              {featuredNotice.tags?.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className={`badge px-2 py-1 bg-${tag === "News" ? "warning" : tag === "Notice" ? "primary" : "success"}-subtle text-${tag === "News" ? "warning" : tag === "Notice" ? "primary" : "success"} ms-1`}
                >
                  {tag}
                </span>
              ))}
            </span>
            <div className="text-muted my-3 flex-grow-1 scrollable-content" style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              overflowX: 'hidden',
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}>
              <p className="mb-0" style={{ lineHeight: '1.5' }}>
                {featuredNotice.body.length > 300 
                  ? `${featuredNotice.body.substring(0, 300)}...` 
                  : featuredNotice.body
                }
              </p>
              {featuredNotice.body.length > 300 && (
                <small className="text-primary mt-2 d-block">
                  Click to read more →
                </small>
              )}
            </div>
            <div className="d-flex align-items-center gap-1">
              <div className="position-relative me-2">
                <Image
                  src={featuredNotice.author_avatar || '/images/users/avatar-6.jpg'}
                  alt="avatar"
                  className="avatar rounded-circle flex-shrink-0"
                  width={40}
                  height={40}
                />
              </div>
              <div className="d-block flex-grow-1">
                <span className="text-dark">
                  <span className="text-dark fw-medium">
                    {featuredNotice.author_name || 'Administrator'}
                  </span>
                </span>
                <p className="text-muted mb-0">
                  <IconifyIcon icon="ti:calendar-due" />
                  {new Date(featuredNotice.posted_at || featuredNotice.created_at || new Date()).toLocaleDateString('en-US', {
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
                      e.stopPropagation();
                      // Handle like action
                    }}
                  >
                    <span>
                      <IconifyIcon icon="solar:heart-broken" />
                    </span>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default FreshArticles;
