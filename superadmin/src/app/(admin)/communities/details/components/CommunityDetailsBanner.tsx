import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, Col, Row, Badge } from 'react-bootstrap'
import type { Database } from "@/lib/database.types";
import { mapPropertyUrl, mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";
import { useListUnits } from "@/hooks/useUnits";

type Society = Database["public"]["Tables"]["societies"]["Row"];

interface CommunityDetailsBannerProps {
  society: Society;
}

const CommunityDetailsBanner = ({ society }: CommunityDetailsBannerProps) => {
  // Fetch real unit data for this society
  const { data: unitsData } = useListUnits({ 
    societyId: society.id, 
    pageSize: 1000 // Get all units for accurate count
  });
  
  const units = unitsData?.data || [];
  const totalUnits = units.length;
  const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
  
  // Mock data for fields not in database yet - TODO: Add these to schema later
  const establishedYear = 2020; // TODO: Add to schema
  const type = 'Residential Complex'; // TODO: Add to schema
  
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Get the property image for this society
  const societyImage = mapSocietyToPropertyImage(society.name);

  return (
    <Row className="mb-4">
      <Col lg={12}>
        {/* Hero Banner */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="position-relative">
            <div 
              className="d-flex align-items-end"
              style={{ 
                height: '340px',
                backgroundImage: `linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.30) 50%, rgba(139, 92, 246, 0.25) 100%), url(${societyImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="position-absolute inset-0" style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 60%, rgba(0, 0, 0, 0.15) 100%)'
              }}></div>
              <div className="position-relative z-1 p-4 text-white w-100">
                <Row className="align-items-end">
                  <Col lg={8}>
                    <div className="mb-3">
                      <Badge bg="light" text="dark" className="mb-2 rounded-pill px-3 py-2 fw-medium">
                        <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-2" style={{ fontSize: '14px' }} />
                        {type}
                      </Badge>
                      <Badge bg="warning" text="dark" className="mb-2 ms-2 rounded-pill px-3 py-2 fw-medium">
                        <IconifyIcon icon="solar:calendar-mark-bold-duotone" className="me-2" style={{ fontSize: '14px' }} />
                        Est. {establishedYear}
                      </Badge>
                    </div>
                    <h1 className="text-white mb-3 fw-bold display-6">{society.name}</h1>
                    <p className="text-white mb-0 d-flex align-items-center opacity-90 fs-16">
                      <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="me-2" style={{ fontSize: '20px' }} />
                      {society.address || 'Address not available'}, {society.city || society.state || 'Area not specified'}
                    </p>
                  </Col>
                  <Col lg={4}>
                    <div className="d-flex justify-content-center">
                      {/* Dashboard-Style Analytics Card */}
                      <Card className="border-0 shadow-sm" style={{ width: '280px' }}>
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
                              <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
                                {occupancyRate}%{" "}
                                <Badge bg="success" className="fs-11">
                                  <IconifyIcon icon="ri:arrow-up-line" />
                                  {totalUnits > 0 ? '5.2%' : '0%'}
                                </Badge>
                              </h3>
                            </Col>
                            <Col xs={6}>
                              {/* Simple Circular Progress Chart */}
                              <div style={{ width: "80px", height: "80px", margin: "0 auto" }}>
                                <svg viewBox="0 0 80 80" className="w-100 h-100">
                                  {/* Background circle */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="none"
                                    stroke="#e9ecef"
                                    strokeWidth="6"
                                  />
                                  {/* Progress circle */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="none"
                                    stroke="var(--bs-primary)"
                                    strokeWidth="6"
                                    strokeDasharray={`${(occupancyRate / 100) * 201} 201`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    transform="rotate(-90 40 40)"
                                  />
                                  <text
                                    x="40"
                                    y="46"
                                    textAnchor="middle"
                                    className="fill-primary fw-bold"
                                    style={{ fontSize: '14px' }}
                                  >
                                    {occupancyRate}%
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
