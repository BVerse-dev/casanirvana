"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, Col, Row, ProgressBar } from "react-bootstrap";
import { useListAmenityBookings } from "@/hooks/useAmenities";

const BookingsInsights = () => {
  const { data: bookings = [] } = useListAmenityBookings();

  // Calculate comprehensive statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  
  // Calculate today's statistics
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.booking_date === today).length;
  const upcomingBookings = bookings.filter(b => new Date(b.booking_date) > new Date()).length;
  
  // Calculate revenue statistics
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, booking) => sum + booking.total_amount, 0);
  
  const pendingRevenue = bookings
    .filter((b) => b.payment_status === "pending")
    .reduce((sum, booking) => sum + booking.total_amount, 0);

  // Calculate percentages
  const confirmedPercentage = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
  const pendingPercentage = totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0;
  const cancelledPercentage = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
  const revenueConversion = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

  // Get peak booking hours
  const bookingHours = bookings.reduce((acc, booking) => {
    const hour = parseInt(booking.start_time.split(':')[0]);
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(bookingHours)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '14';

  const formatTime = (hour: string) => {
    const h = parseInt(hour);
    return h > 12 ? `${h - 12}:00 PM` : h === 12 ? '12:00 PM' : `${h}:00 AM`;
  };

  return (
    <Row className="mb-4">
      <Col xl={12}>
        <Card className="border-0 shadow-lg overflow-hidden">
          <div 
            className="position-relative" 
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minHeight: '280px'
            }}
          >
            {/* Background Pattern */}
            <div 
              className="position-absolute w-100 h-100 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
                backgroundSize: '30px 30px'
              }}
            />
            
            <CardBody className="p-4 position-relative">
              <Row className="align-items-center">
                <Col lg={8}>
                  <div className="d-flex align-items-center mb-4">
                    <div className="avatar-xl bg-white bg-opacity-20 rounded-circle flex-centered me-3 backdrop-filter blur-sm">
                      <IconifyIcon
                        icon="solar:chart-square-bold-duotone"
                        className="fs-28 text-white"
                      />
                    </div>
                    <div>
                      <h2 className="text-white mb-1 fw-bold">Booking Insights</h2>
                      <p className="text-white-75 mb-0 fs-16">
                        Comprehensive analytics and performance metrics
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <Row className="g-3 mb-4">
                    <Col md={3}>
                      <div className="bg-white bg-opacity-15 rounded-3 p-3 backdrop-filter blur-sm">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="avatar-sm bg-success bg-opacity-20 rounded-circle flex-centered">
                            <IconifyIcon icon="solar:calendar-check-bold" className="text-white" />
                          </div>
                          <span className="badge bg-success bg-opacity-20 text-white">
                            {confirmedPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <h4 className="text-white mb-1 fw-bold">{confirmedBookings}</h4>
                        <small className="text-white-75">Confirmed</small>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div className="bg-white bg-opacity-15 rounded-3 p-3 backdrop-filter blur-sm">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="avatar-sm bg-warning bg-opacity-20 rounded-circle flex-centered">
                            <IconifyIcon icon="solar:clock-circle-bold" className="text-white" />
                          </div>
                          <span className="badge bg-warning bg-opacity-20 text-white">
                            {pendingPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <h4 className="text-white mb-1 fw-bold">{pendingBookings}</h4>
                        <small className="text-white-75">Pending</small>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div className="bg-white bg-opacity-15 rounded-3 p-3 backdrop-filter blur-sm">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="avatar-sm bg-info bg-opacity-20 rounded-circle flex-centered">
                            <IconifyIcon icon="solar:calendar-bold" className="text-white" />
                          </div>
                          <span className="badge bg-info bg-opacity-20 text-white">Today</span>
                        </div>
                        <h4 className="text-white mb-1 fw-bold">{todaysBookings}</h4>
                        <small className="text-white-75">Today's Bookings</small>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div className="bg-white bg-opacity-15 rounded-3 p-3 backdrop-filter blur-sm">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="avatar-sm bg-primary bg-opacity-20 rounded-circle flex-centered">
                            <IconifyIcon icon="solar:clock-circle-outline" className="text-white" />
                          </div>
                          <span className="badge bg-primary bg-opacity-20 text-white">Peak</span>
                        </div>
                        <h4 className="text-white mb-1 fw-bold">{formatTime(peakHour)}</h4>
                        <small className="text-white-75">Peak Hour</small>
                      </div>
                    </Col>
                  </Row>

                  {/* Progress Bars Section */}
                  <div className="bg-white bg-opacity-10 rounded-3 p-3">
                    <h6 className="text-white mb-3 fw-semibold">
                      <IconifyIcon icon="solar:chart-2-bold" className="me-2" />
                      Booking Status Distribution
                    </h6>
                    
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75 small">Confirmed Bookings</span>
                            <span className="text-white fw-semibold small">{confirmedBookings}/{totalBookings}</span>
                          </div>
                          <div className="progress bg-white bg-opacity-20" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${confirmedPercentage}%` }}
                            />
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75 small">Pending Approval</span>
                            <span className="text-white fw-semibold small">{pendingBookings}/{totalBookings}</span>
                          </div>
                          <div className="progress bg-white bg-opacity-20" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ width: `${pendingPercentage}%` }}
                            />
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75 small">Revenue Conversion</span>
                            <span className="text-white fw-semibold small">{revenueConversion.toFixed(1)}%</span>
                          </div>
                          <div className="progress bg-white bg-opacity-20" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${revenueConversion}%` }}
                            />
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75 small">Cancellation Rate</span>
                            <span className="text-white fw-semibold small">{cancelledPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="progress bg-white bg-opacity-20" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-danger" 
                              style={{ width: `${cancelledPercentage}%` }}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col lg={4}>
                  <div className="text-center">
                    {/* Total Revenue Circle */}
                    <div className="position-relative d-inline-block mb-4">
                      <div 
                        className="rounded-circle bg-white bg-opacity-15 d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '140px', height: '140px' }}
                      >
                        <div className="text-center">
                          <div className="text-white fw-bold mb-1" style={{ fontSize: '24px' }}>
                            ${(totalRevenue / 1000).toFixed(1)}K
                          </div>
                          <small className="text-white-75">Total Revenue</small>
                        </div>
                      </div>
                      <div className="position-absolute top-0 start-0 w-100 h-100">
                        <svg className="w-100 h-100" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx="70"
                            cy="70"
                            r="60"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="70"
                            cy="70"
                            r="60"
                            stroke="#28a745"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${2 * Math.PI * 60 * (1 - revenueConversion / 100)}`}
                            className="transition-all duration-1000 ease-in-out"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white bg-opacity-10 rounded-3 p-3">
                      <Row className="g-2 text-center">
                        <Col xs={6}>
                          <div className="border-end border-white border-opacity-20">
                            <h5 className="text-white mb-1 fw-bold">{upcomingBookings}</h5>
                            <small className="text-white-75">Upcoming</small>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div>
                            <h5 className="text-white mb-1 fw-bold">${(pendingRevenue / 1000).toFixed(1)}K</h5>
                            <small className="text-white-75">Pending</small>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    {/* Growth Indicator */}
                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="solar:arrow-up-bold" className="text-success me-1" />
                        <span className="text-success small fw-semibold">+15.2% vs last month</span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingsInsights;
