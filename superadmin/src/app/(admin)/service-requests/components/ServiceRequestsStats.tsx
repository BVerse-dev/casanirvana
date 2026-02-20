"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

interface ServiceRequestsStatsProps {
  serviceRequests: any[];
}

const ServiceRequestsStats = ({ serviceRequests }: ServiceRequestsStatsProps) => {
  const totalRequests = serviceRequests.length;
  const pendingRequests = serviceRequests.filter(req => req.status === 'pending').length;
  const inProgressRequests = serviceRequests.filter(req => req.status === 'in_progress').length;
  const completedRequests = serviceRequests.filter(req => req.status === 'completed').length;

  const stats = [
    {
      title: "Total Requests",
      value: totalRequests,
      icon: "solar:clipboard-list-broken",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      change: "+12.5%",
    },
    {
      title: "Pending",
      value: pendingRequests,
      icon: "solar:clock-circle-broken",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      change: "+8.3%",
    },
    {
      title: "In Progress", 
      value: inProgressRequests,
      icon: "solar:play-circle-broken",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      change: "+15.7%",
    },
    {
      title: "Completed",
      value: completedRequests,
      icon: "solar:check-circle-broken",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      change: "+24.1%",
    },
  ];

  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col xl={3} sm={6} key={index}>
          <Card 
            className="border-0 overflow-hidden position-relative"
            style={{
              background: stat.gradient,
              minHeight: '160px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              transition: 'all 0.3s ease',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
            }}
          >
            <CardBody className="p-4 position-relative d-flex flex-column justify-content-between h-100">
              {/* Background decoration icon - properly contained */}
              <div 
                className="position-absolute"
                style={{
                  top: '20px',
                  right: '20px',
                  fontSize: '2.5rem',
                  color: 'rgba(255, 255, 255, 0.15)',
                  zIndex: 1
                }}
              >
                <IconifyIcon icon={stat.icon} />
              </div>
              
              {/* Main content */}
              <div className="position-relative" style={{ zIndex: 2 }}>
                <div className="mb-3">
                  <IconifyIcon
                    icon={stat.icon}
                    className="fs-24 text-white mb-2"
                    style={{ display: 'block' }}
                  />
                </div>
                
                <div>
                  <h3 className="text-white fw-bold mb-1 display-6">{stat.value}</h3>
                  <p className="text-white mb-2 fs-15 fw-medium opacity-90">{stat.title}</p>
                </div>
              </div>

              {/* Growth indicator at bottom */}
              <div className="d-flex align-items-center justify-content-between mt-auto">
                <span className="text-white fs-13 fw-medium opacity-75">
                  <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                  {stat.change}
                </span>
                <span className="text-white fs-12 opacity-60">This month</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ServiceRequestsStats;
