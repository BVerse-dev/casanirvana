import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import { blogData } from "../data";
import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";
import Link from "next/link";
import { useListNotices } from "@/hooks/useNotices";
import { useRouter } from "next/navigation";

const Blogs = () => {
  const router = useRouter();
  const { data: notices, isLoading } = useListNotices();
  
  // Get latest 5 notices sorted by creation date
  const latestNotices = notices 
    ? notices
        .sort((a, b) => new Date(b.created_at || b.posted_at || 0).getTime() - new Date(a.created_at || a.posted_at || 0).getTime())
        .slice(0, 5)
    : [];

  // Extract unique categories/tags from notices
  const categories = notices 
    ? [...new Set(notices.flatMap(notice => notice.tags || []))]
        .filter(tag => tag && tag.trim())
        .slice(0, 5) // Show max 5 categories
    : ['Community Guidelines', 'Safety & Security', 'Amenity Management', 'Maintenance Updates', 'Visitor Policies'];

  const handleNoticeClick = (noticeId: string) => {
    router.push(`/post/details?id=${noticeId}`);
  };

  return (
    <Card>
      <CardBody>
        <form className="app-search d-none d-md-block me-auto">
          <div className="position-relative">
            <input
              type="search"
              className="form-control"
              placeholder="Search"
              autoComplete="off"
            />
            <IconifyIcon
              icon="solar:magnifer-broken"
              className="search-widget-icon"
            />
          </div>
        </form>
        <div>
          <div className="mt-4 border-bottom border-dashed pb-2">
            <CardTitle as={"h4"}>Categories</CardTitle>
          </div>
          <div className="my-3 ms-2">
            {categories.map((category, idx) => (
              <div className="form-check mb-2" key={idx}>
                <input
                  className="form-check-input fs-16"
                  type="checkbox"
                  id={`flexCheck${idx}`}
                  defaultChecked={idx === 0}
                />
                <label
                  className="form-check-label text-dark ms-2"
                  htmlFor={`flexCheck${idx}`}
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="border-bottom border-dashed pb-2">
            <CardTitle as={"h4"}>Latest Notices</CardTitle>
          </div>
          <ul className="list-unstyled my-3">
            {isLoading ? (
              <li className="text-center py-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </li>
            ) : latestNotices.length > 0 ? (
              latestNotices.map((notice) => (
                <li className="mb-3 pb-3 border-bottom" key={notice.id}>
                  <div className="d-flex">
                    <div 
                      className="me-3 flex-shrink-0" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleNoticeClick(notice.id)}
                    >
                      {notice.image_url ? (
                        <Image
                          src={notice.image_url}
                          alt={notice.title}
                          className="rounded img-fluid"
                          width={100}
                          height={80}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '100px', height: '80px' }}>
                          <IconifyIcon icon="solar:file-text-bold-duotone" className="fs-24 text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <span 
                        onClick={() => handleNoticeClick(notice.id)}
                        style={{ cursor: 'pointer' }}
                        className="text-dark fw-medium fs-15 d-block mb-1"
                      >
                        {notice.title.length > 50 ? `${notice.title.substring(0, 50)}...` : notice.title}
                      </span>
                      <p className="text-muted mb-1 fs-6">
                        <IconifyIcon icon="ti:calendar-due" className="me-1" />
                        {new Date(notice.created_at || notice.posted_at || new Date()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })}
                      </p>
                      <small className="text-muted">
                        By {notice.author_name}
                      </small>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              // Fallback to static data if no database notices
              blogData.map((item, idx) => (
                <li className="mb-3 pb-3 border-bottom" key={idx}>
                  <Row>
                    <Col lg={4}>
                      <Link className="me-3" href="">
                        <Image
                          src={item.image}
                          alt="small"
                          className="img-fluid rounded"
                        />
                      </Link>
                    </Col>
                    <Col lg={8}>
                      <Link href="" className="text-dark fw-medium fs-15">
                        {item.title}{" "}
                      </Link>
                      <p className="text-muted mb-0">
                        <IconifyIcon icon="ti:calendar-due" />
                        {item.date.toLocaleString("en-us", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </Col>
                  </Row>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="mt-4">
          <div className="border-bottom border-dashed pb-2">
            <CardTitle as={"h4"}>Text Widget</CardTitle>
          </div>
          <p className="mt-3 text-muted">
            Our blog delivers valuable content designed to help you excel in
            your role. Explore our articles, interviews, and expert commentary
            to gain valuable insights, expand your knowledge, and stay ahead of
            the curve. Whether you&apos;re seeking practical tips, strategic
            advice, or inspiration for your career, Admin Nexus is here to
            support your journey to success.
          </p>
        </div>
        <div className="mt-4">
          <div className="border-bottom border-dashed pb-2">
            <CardTitle as={"h4"}>Tags</CardTitle>
          </div>
          <div className="d-flex gap-2 flex-wrap mt-3">
            {categories.slice(0, 6).map((tag, idx) => (
              <span key={idx} className="badge bg-light text-dark px-2 py-1 fs-12">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Blogs;
