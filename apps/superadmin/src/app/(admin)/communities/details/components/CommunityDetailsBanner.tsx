import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, Col, Row, Badge } from "react-bootstrap";

import { mapPropertyUrl, mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";

type CommunityBannerData = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  society_type?: string | null;
  established_year?: string | number | null;
  created_at?: string | null;
  image_url?: string | null;
};

type CommunityBannerSummary = {
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
};

interface CommunityDetailsBannerProps {
  community: CommunityBannerData;
  summary: CommunityBannerSummary;
}

const formatCommunityType = (value?: string | null) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Community";

const resolveEstablishedYear = (community: CommunityBannerData) => {
  if (typeof community.established_year === "number") return community.established_year;
  if (typeof community.established_year === "string" && community.established_year.trim()) {
    return community.established_year;
  }
  if (community.created_at) {
    return new Date(community.created_at).getFullYear();
  }
  return "N/A";
};

const CommunityDetailsBanner = ({ community, summary }: CommunityDetailsBannerProps) => {
  const propertyImageUrl =
    mapPropertyUrl(community.image_url || null) || mapSocietyToPropertyImage(community.name);
  const statusLabel = (community.status || "unknown").replace(/_/g, " ");

  return (
    <Row className="mb-4">
      <Col lg={12}>
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="position-relative">
            <div
              className="d-flex align-items-end"
              style={{
                height: "340px",
                backgroundImage: `linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.30) 50%, rgba(139, 92, 246, 0.25) 100%), url(${propertyImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div
                className="position-absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 60%, rgba(0, 0, 0, 0.15) 100%)",
                }}
              />
              <div className="position-relative z-1 p-4 text-white w-100">
                <Row className="align-items-end">
                  <Col lg={8}>
                    <div className="mb-3">
                      <Badge bg="light" text="dark" className="mb-2 rounded-pill px-3 py-2 fw-medium">
                        <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-2" style={{ fontSize: "14px" }} />
                        {formatCommunityType(community.society_type)}
                      </Badge>
                      <Badge bg="warning" text="dark" className="mb-2 ms-2 rounded-pill px-3 py-2 fw-medium">
                        <IconifyIcon icon="solar:calendar-mark-bold-duotone" className="me-2" style={{ fontSize: "14px" }} />
                        Est. {resolveEstablishedYear(community)}
                      </Badge>
                      <Badge
                        bg={community.status === "inactive" ? "secondary" : "success"}
                        className="mb-2 ms-2 rounded-pill px-3 py-2 fw-medium"
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                    <h1 className="text-white mb-3 fw-bold display-6">{community.name}</h1>
                    <p className="text-white mb-0 d-flex align-items-center opacity-90 fs-16">
                      <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="me-2" style={{ fontSize: "20px" }} />
                      {community.address || "Address not available"}
                      {community.city || community.state ? `, ${[community.city, community.state].filter(Boolean).join(", ")}` : ""}
                    </p>
                  </Col>
                  <Col lg={4}>
                    <div className="d-flex justify-content-center">
                      <Card className="border-0 shadow-sm" style={{ width: "280px" }}>
                        <CardBody>
                          <Row className="align-items-center justify-content-between">
                            <Col xs={6}>
                              <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
                                <IconifyIcon
                                  width={32}
                                  height={32}
                                  icon="solar:chart-square-bold-duotone"
                                  className="text-primary"
                                />
                              </div>
                              <p className="text-muted mb-2 mt-3">Occupancy Rate</p>
                              <h3 className="text-dark fw-bold mb-1">{summary.occupancyRate}%</h3>
                              <div className="text-muted small">
                                {summary.occupiedUnits} occupied of {summary.totalUnits} units
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div style={{ width: "80px", height: "80px", margin: "0 auto" }}>
                                <svg viewBox="0 0 80 80" className="w-100 h-100">
                                  <circle cx="40" cy="40" r="32" fill="none" stroke="#e9ecef" strokeWidth="6" />
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="none"
                                    stroke="var(--bs-primary)"
                                    strokeWidth="6"
                                    strokeDasharray={`${(summary.occupancyRate / 100) * 201} 201`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    transform="rotate(-90 40 40)"
                                  />
                                  <text
                                    x="40"
                                    y="46"
                                    textAnchor="middle"
                                    className="fill-primary fw-bold"
                                    style={{ fontSize: "14px" }}
                                  >
                                    {summary.occupancyRate}%
                                  </text>
                                </svg>
                              </div>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default CommunityDetailsBanner;
