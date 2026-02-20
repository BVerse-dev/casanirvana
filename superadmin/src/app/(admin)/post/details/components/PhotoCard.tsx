import small1 from "@/assets/images/small/img-1.jpg";
import small10 from "@/assets/images/small/img-10.jpg";
import small2 from "@/assets/images/small/img-2.jpg";
import small3 from "@/assets/images/small/img-3.jpg";
import small4 from "@/assets/images/small/img-4.jpg";
import small5 from "@/assets/images/small/img-5.jpg";
import small6 from "@/assets/images/small/img-6.jpg";
import small7 from "@/assets/images/small/img-7.jpg";
import small8 from "@/assets/images/small/img-8.jpg";
import small9 from "@/assets/images/small/img-9.jpg";
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
        .slice(0, 6) // Reduced to 6 to fill with static images
    : [];
  
  // Fallback static images
  const staticImages = [
    small1, small2, small3, small4, small5, small6,
    small7, small8, small9, small10
  ];

  // Combine media notices with static images to ensure we always have 12 items
  const allMedia = [...mediaNotices];
  const remainingSlots = 12 - allMedia.length;
  const staticToAdd = staticImages.slice(0, remainingSlots);

  const handleMediaClick = (noticeId: string) => {
    router.push(`/post/details?id=${noticeId}`);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="d-flex border-bottom border-dashed">
        <CardTitle as={"a"}>Photo And Video</CardTitle>
        <div className="ms-auto">
          <Link href="" className="text-muted fw-semibold">
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
              
              {/* Fill remaining slots with static images */}
              {staticToAdd.map((item, idx) => (
                <Col lg={4} key={`static-${idx}`}>
                  <div className="d-block m-1">
                    <Image src={item} alt="gallery" className="img-fluid rounded" />
                  </div>
                </Col>
              ))}
            </>
          )}
        </Row>
      </CardBody>
    </Card>
  );
};

export default PhotoCard;
