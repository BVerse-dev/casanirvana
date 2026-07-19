import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import { useListNotices } from "@/hooks/useNotices";
import { useRouter } from "next/navigation";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

const PhotoCard = () => {
  const router = useRouter();
  const { data: notices, isLoading } = useListNotices();
  
  // Get notices with media (images or videos), but limit to ones with valid URLs
  const mediaNotices = notices 
    ? notices
        .filter(notice => (notice.image_url && notice.image_url.startsWith('http')) || (notice.video_url && notice.video_url.startsWith('http')))
        .slice(0, 12)
    : [];

  const handleMediaClick = (noticeId: string) => {
    router.push(`/post/details?id=${noticeId}`);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="d-flex border-bottom border-dashed">
        <CardTitle as={"a"}>Photo And Video</CardTitle>
        <div className="ms-auto">
          <Link href="/post" className="text-muted fw-semibold">
            See all
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="g-0">
          {isLoading ? (
            <Col className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Col>
          ) : (
            <>
              {/* Render database media notices */}
              {mediaNotices.map((notice) => (
                <Col lg={4} key={notice.id}>
                  <div 
                    className="d-block m-1 position-relative"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleMediaClick(notice.id)}
                  >
                    {notice.video_url ? (
                      <div className="position-relative">
                        <video 
                          src={notice.video_url}
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <IconifyIcon icon="solar:play-circle-bold" className="fs-24 text-white" />
                        </div>
                      </div>
                    ) : notice.image_url ? (
                      <Image 
                        src={notice.image_url} 
                        alt={notice.title} 
                        className="img-fluid rounded"
                        width={100}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : null}
                  </div>
                </Col>
              ))}
              {mediaNotices.length === 0 ? (
                <Col className="text-center py-3 text-muted">
                  No media notices available.
                </Col>
              ) : null}
            </>
          )}
        </Row>
      </CardBody>
    </Card>
  );
};

export default PhotoCard;
