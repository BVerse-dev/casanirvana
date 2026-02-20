"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardTitle, Col, Row, ProgressBar } from "react-bootstrap";
import { useGetService } from "@/hooks/useServices";
import { useListServiceRequests } from "@/hooks/useServiceRequests";
import { useSearchParams } from "next/navigation";

const ServiceOverview = () => {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('id');
  
  const { data: service } = useGetService(serviceId || '');
  const { data: serviceRequests = [] } = useListServiceRequests(serviceId || '');

  // Calculate service statistics
  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter((req) => req.status === "pending").length;
  const inProgressRequests = serviceRequests.filter((req) => req.status === "in_progress").length;
  const completedRequests = serviceRequests.filter((req) => req.status === "completed").length;
  const cancelledRequests = serviceRequests.filter((req) => req.status === "cancelled").length;
  
  // Calculate revenue
  const totalRevenue = serviceRequests
    .filter((req) => req.status === "completed" && req.total_amount)
    .reduce((sum, request) => sum + (parseFloat(String(request.total_amount)) || 0), 0);
  
  const pendingRevenue = serviceRequests
    .filter((req) => req.status !== "completed" && req.status !== "cancelled" && req.total_amount)
    .reduce((sum, request) => sum + (parseFloat(String(request.total_amount)) || 0), 0);

  // Calculate percentages for progress bars
  const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;
  const pendingPercentage = totalRequests > 0 ? (pendingRequests / totalRequests) * 100 : 0;
  const inProgressPercentage = totalRequests > 0 ? (inProgressRequests / totalRequests) * 100 : 0;

  // Get priority distribution
  const priorityDistribution = serviceRequests.reduce((acc, request) => {
    const priority = (request as any).priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const highPriorityRequests = priorityDistribution.high || 0;
  const mediumPriorityRequests = priorityDistribution.medium || 0;
  const lowPriorityRequests = priorityDistribution.low || 0;

  // Get recent request trends
  const recentRequests = serviceRequests
    .filter(req => {
      if (!req.created_at) return false;
      const requestDate = new Date(req.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return requestDate >= weekAgo;
    }).length;

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      maintenance: 'solar:settings-bold-duotone',
      cleaning: 'solar:broom-bold-duotone',
      security: 'solar:shield-check-bold-duotone',
      utilities: 'solar:bolt-bold-duotone',
      landscaping: 'solar:leaf-bold-duotone',
      repair: 'solar:hammer-bold-duotone',
      plumbing: 'solar:water-drop-bold-duotone',
      electrical: 'solar:flash-bold-duotone',
      pest_control: 'solar:bug-bold-duotone',
      housekeeping: 'solar:home-2-bold-duotone',
      hvac: 'solar:wind-bold-duotone',
      default: 'solar:service-bold-duotone'
    };
    return categoryIcons[category] || categoryIcons.default;
  };

  if (!service) {
    return null;
  }

  return (
    <Row className="mb-4">
      <Col xl={12}>
        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardBody className="p-4">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-lg bg-white bg-opacity-20 rounded-circle flex-centered me-3">
                                         <IconifyIcon
                       icon={getCategoryIcon(service.category || 'default')}
                       className="fs-24 text-white"
                     />
                  </div>
                  <div>
                    <CardTitle as="h3" className="text-white mb-1">
                      {service.name} Overview
                    </CardTitle>
                    <p className="text-white-75 mb-2">
                      Real-time service request insights and performance metrics for {service.category} services
                    </p>
                    
                    {/* Brief Service Details */}
                    <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-0 w-100">
                      <div className="row g-4">
                        <div className="col-4">
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:tag-bold" className="text-white-75 me-2" />
                            <div>
                              <p className="text-white-75 mb-0 small">Category</p>
                              <p className="text-white fw-semibold mb-0 small text-capitalize">{service.category}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:dollar-bold" className="text-white-75 me-2" />
                            <div>
                              <p className="text-white-75 mb-0 small">Base Price</p>
                              <p className="text-white fw-semibold mb-0 small">${service.base_price || 'Custom'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="d-flex align-items-center">
                            <IconifyIcon icon="solar:clock-circle-bold" className="text-white-75 me-2" />
                            <div>
                              <p className="text-white-75 mb-0 small">Availability</p>
                              <p className="text-white fw-semibold mb-0 small">{service.is_active ? 'Active' : 'Inactive'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {service.description && (
                        <div className="mt-3 pt-3 border-top border-white border-opacity-20">
                          <p className="text-white-75 mb-0 small">
                            <IconifyIcon icon="solar:info-circle-bold" className="me-1" />
                            {service.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Completion Rate</span>
                      <span className="text-white fw-semibold">{completedRequests}/{totalRequests}</span>
                    </div>
                    <ProgressBar 
                      now={completionRate} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">In Progress</span>
                      <span className="text-white fw-semibold">{inProgressRequests}/{totalRequests}</span>
                    </div>
                    <ProgressBar 
                      now={inProgressPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${inProgressPercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Pending Requests</span>
                      <span className="text-white fw-semibold">{pendingRequests}/{totalRequests}</span>
                    </div>
                    <ProgressBar 
                      now={pendingPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${pendingPercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Total Revenue</span>
                      <span className="text-white fw-semibold">${totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white-75 small">Pending: ${pendingRevenue.toLocaleString()}</span>
                      <span className="text-success small">
                        <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                        +{completionRate.toFixed(1)}% completion rate
                      </span>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col lg={4}>
                <div className="text-center">
                  <div className="mb-3">
                    <h2 className="text-white display-6 fw-bold mb-1">{totalRequests}</h2>
                    <p className="text-white-75 mb-0">Total Requests</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-3">
                    <h6 className="text-white mb-2">
                      <IconifyIcon icon="solar:fire-bold" className="me-1" />
                      Priority Distribution
                    </h6>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-white-75 small">High Priority</span>
                      <span className="text-white fw-semibold small">{highPriorityRequests}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="text-white-75 small">Medium Priority</span>
                      <span className="text-white fw-semibold small">{mediumPriorityRequests}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white-75 small">Low Priority</span>
                      <span className="text-white fw-semibold small">{lowPriorityRequests}</span>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-3 p-3">
                    <h6 className="text-white mb-1">
                      <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                      This Week
                    </h6>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white-75 small">New Requests</span>
                      <span className="text-white fw-semibold">{recentRequests}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white-75 small">Base Price</span>
                      <span className="text-white fw-semibold">${service.base_price || 'Custom'}</span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ServiceOverview; 