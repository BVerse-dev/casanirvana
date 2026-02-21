"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import { Card, CardBody, Col, Row, Spinner, Alert } from "react-bootstrap";
import { useListNotices } from "@/hooks/useNotices";
import { useRouter } from "next/navigation";

const Articles = () => {
  const router = useRouter();
  const { data: notices, isLoading, error } = useListNotices();
  
  // Filter notices for featured articles
  const articles = notices?.filter(notice => 
    (notice.category || '').toLowerCase() === 'general' && 
    (notice.tags?.includes('Guidelines') || notice.tags?.includes('Notice'))
  ).slice(0, 4) || []; // Show first 4 articles
  
  const handleArticleClick = (article: any) => {
    router.push(`/post/details?id=${article.id}`);
  };
  
  if (isLoading) {
    return (
      <Col xl={7} lg={12}>
        <div className="d-flex justify-content-center align-items-center py-4">
          <Spinner animation="border" size="sm" />
        </div>
      </Col>
    );
  }

  if (error) {
    return (
      <Col xl={7} lg={12}>
        <Alert variant="danger">
          Failed to load articles: {error.message}
        </Alert>
      </Col>
    );
  }
  
  return (
    <Col xl={7} lg={12}>
      <Row>
        {articles.map((article, idx) => (
          <Col key={article.id} lg={6} className="mb-4">
            <Card 
              className="h-100" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleArticleClick(article)}
            >
                <CardBody className="p-3">
                  <Row className="align-items-center">
                    <Col xs={4}>
                      <div className="position-relative" style={{ height: '80px' }}>
                        {article.image_url ? (
                          <Image
                            src={article.image_url}
                            alt={article.title}
                            className="rounded"
                            style={{ objectFit: 'cover' }}
                            fill
                          />
                        ) : (
                          <div className="rounded bg-light d-flex align-items-center justify-content-center h-100">
                            <IconifyIcon icon="solar:file-text-bold-duotone" className="fs-24 text-muted" />
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={8}>
                      <div className="ps-2">
                        <h6 className="text-dark fw-medium mb-2" style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>
                          {article.title.length > 60 ? `${article.title.substring(0, 60)}...` : article.title}
                        </h6>
                        <p className="text-muted mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                          {article.body.length > 80 ? `${article.body.substring(0, 80)}...` : article.body}
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <Image
                              src={article.author_avatar || "/images/users/avatar-1.jpg"}
                              alt={article.author_name || "User"}
                              width={20}
                              height={20}
                              className="rounded-circle me-2"
                            />
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {article.author_name}
                            </span>
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {new Date(article.posted_at || article.created_at || new Date()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-2">
                          {article.tags?.slice(0, 2).map((tag: string, tagIdx: number) => (
                            <span
                              key={tagIdx}
                              className="badge bg-light text-dark border me-1"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle like action
                          }}
                          style={{ fontSize: '0.8rem' }}
                        >
                          <IconifyIcon icon="solar:heart-linear" className="me-1" />
                          {article.likes_count || 0}
                        </button>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle comment action
                          }}
                          style={{ fontSize: '0.8rem' }}
                        >
                          <IconifyIcon icon="solar:chat-round-linear" className="me-1" />
                          Comment
                        </button>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle share action
                          }}
                          style={{ fontSize: '0.8rem' }}
                        >
                          <IconifyIcon icon="solar:share-linear" className="me-1" />
                          Share
                        </button>
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        <IconifyIcon icon="solar:eye-linear" className="me-1" />
                        {article.views_count || 0}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>
    );
};

export default Articles;
