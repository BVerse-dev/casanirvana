"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { useResidentDashboardStats } from "@/hooks/useResidentDashboard";
import { useListCommunities } from "@/hooks/useCommunities";
import { useState } from "react";

const ResidentsBySociety = () => {
  const { data: dashboardStats, isLoading } = useResidentDashboardStats();
  const { data: allSocieties, isLoading: societiesLoading } = useListCommunities();
  const [selectedSociety, setSelectedSociety] = useState<string>("All Societies");

  if (isLoading) {
    return (
      <Col lg={7}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Residents by Society</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: '300px' }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  // Filter society data based on selection
  const allSocietyData = dashboardStats?.allResidentsPerSociety || [
    { societyName: 'Casa Nirvana A', count: 95, percentage: 30 },
    { societyName: 'Casa Nirvana B', count: 82, percentage: 26 },
    { societyName: 'Casa Nirvana C', count: 71, percentage: 22 },
    { societyName: 'Casa Nirvana D', count: 68, percentage: 22 },
    { societyName: 'Green Valley Apartments', count: 45, percentage: 14 },
    { societyName: 'Sunset Heights', count: 38, percentage: 12 },
    { societyName: 'Garden View Apartments', count: 32, percentage: 10 },
    { societyName: 'Sunrise Residency', count: 28, percentage: 9 }
  ];

  const societyData = selectedSociety === "All Societies" 
    ? allSocietyData.slice(0, 4) // Show top 4 when "All Societies" is selected
    : allSocietyData.filter(society => society.societyName === selectedSociety);

  const totalResidents = societyData.reduce((sum, society) => sum + society.count, 0);

  return (
    <Col lg={7}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <CardTitle as={"h4"}>Residents by Society</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {selectedSociety}{" "}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setSelectedSociety("All Societies")}>
                All Societies
              </DropdownItem>
              {!societiesLoading && allSocieties?.data?.map((society: any) => (
                <DropdownItem 
                  key={society.id} 
                  onClick={() => setSelectedSociety(society.name)}
                >
                  {society.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <Row className="justify-content-between mt-1">
            <Col lg={6}>
              <div className="d-flex align-items-center gap-2">
                <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
                  <IconifyIcon
                    icon="solar:users-group-two-rounded-broken"
                    width={32}
                    height={32}
                    className="fs-32 text-primary"
                  />
                </div>
                <div>
                  <p className="mb-0 fs-20 text-dark fw-medium">{totalResidents}</p>
                  <small>(Total Residents)</small>
                </div>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-center mb-3">
                  <div className="position-relative" style={{ width: '140px', height: '140px' }}>
                    <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                      {societyData.map((society, idx) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
                        const radius = 58;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDasharray = (society.percentage / 100) * circumference;
                        const previousPercentages = societyData.slice(0, idx).reduce((acc, prev) => acc + prev.percentage, 0);
                        const strokeDashoffset = -(previousPercentages / 100) * circumference;
                        
                        return (
                          <circle
                            key={idx}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke={colors[idx % colors.length]}
                            strokeWidth="14"
                            strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                        );
                      })}
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fs-16 fw-bold text-dark">{societyData.length}</div>
                      <div className="fs-12 text-muted">Societies</div>
                    </div>
                  </div>
                </div>
                
                {/* Chart Legend */}
                <div className="mt-2">
                  {societyData.slice(0, 3).map((society, idx) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
                    return (
                      <div key={idx} className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle me-2" 
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              backgroundColor: colors[idx % colors.length] 
                            }}
                          ></div>
                          <span className="fs-12 text-muted">{society.societyName.length > 12 ? society.societyName.substring(0, 12) + '...' : society.societyName}</span>
                        </div>
                        <span className="fs-12 fw-medium text-dark">{society.percentage}%</span>
                      </div>
                    );
                  })}
                  {societyData.length > 3 && (
                    <div className="text-center mt-2">
                      <small className="text-muted fs-11">
                        <IconifyIcon icon="ri:more-line" className="me-1" />
                        +{societyData.length - 3} more
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </Col>
            <Col lg={5} dir="ltr">
              <div className="p-3 bg-light-subtle rounded border border-light">
                {societyData.map((society, idx) => (
                  <div key={idx}>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-1">
                        <IconifyIcon
                          icon="solar:home-2-broken"
                          className="fs-16 align-middle me-1 text-primary"
                        />{" "}
                        <span className="align-middle">{society.societyName}</span>
                      </p>
                      <p className="mb-0 fs-13 fw-semibold">{society.count}</p>
                    </div>
                    <Row className="align-items-center mb-3">
                      <Col>
                        <ProgressBar
                          now={society.percentage}
                          variant={idx === 0 ? "primary" : idx === 1 ? "success" : idx === 2 ? "warning" : "info"}
                          className="mt-2 progress-soft progress-sm"
                          role="progressbar"
                        />
                      </Col>
                      <Col xs={"auto"}>
                        <p className="mb-0 fs-12 text-muted fw-medium">
                          {society.percentage}%
                        </p>
                      </Col>
                    </Row>
                  </div>
                ))}
                <div className="mt-2 pt-1 text-center">
                  <Link href="/societies/add" className="link-primary icons-center">
                    Add Society&nbsp;
                    <IconifyIcon icon="ri:add-line" />
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ResidentsBySociety;

