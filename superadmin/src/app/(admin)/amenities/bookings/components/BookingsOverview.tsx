"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardTitle, Col, Row, ProgressBar } from "react-bootstrap";
import { useListAmenityBookings } from "@/hooks/useAmenities";

const BookingsOverview = () => {
  const { data: bookings = [] } = useListAmenityBookings();

  // Calculate booking statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  
  // Calculate revenue
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, booking) => sum + booking.total_amount, 0);
  
  const pendingRevenue = bookings
    .filter((b) => b.payment_status === "pending")
    .reduce((sum, booking) => sum + booking.total_amount, 0);

  // Calculate percentages for progress bars
  const confirmedPercentage = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
  const pendingPercentage = totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0;
  const cancelledPercentage = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

  // Get popular amenities
  const amenityBookingCounts = bookings.reduce((acc, booking) => {
    const amenityName = booking.amenities?.name || 'Unknown';
    acc[amenityName] = (acc[amenityName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularAmenities = Object.entries(amenityBookingCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

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
                      icon="solar:chart-square-bold-duotone"
                      className="fs-24 text-white"
                    />
                  </div>
                  <div>
                    <CardTitle as="h3" className="text-white mb-1">
                      Bookings Overview
                    </CardTitle>
                    <p className="text-white-75 mb-0">
                      Real-time amenity booking insights and performance metrics
                    </p>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Confirmed Bookings</span>
                      <span className="text-white fw-semibold">{confirmedBookings}/{totalBookings}</span>
                    </div>
                    <ProgressBar 
                      now={confirmedPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    >
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${confirmedPercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Pending Approval</span>
                      <span className="text-white fw-semibold">{pendingBookings}/{totalBookings}</span>
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
                      <span className="text-white-75">Cancelled Bookings</span>
                      <span className="text-white fw-semibold">{cancelledBookings}/{totalBookings}</span>
                    </div>
                    <ProgressBar 
                      now={cancelledPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${cancelledPercentage}%` }}
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
                        +12.5% vs last month
                      </span>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col lg={4}>
                <div className="text-center">
                  <div className="mb-3">
                    <h2 className="text-white display-6 fw-bold mb-1">{totalBookings}</h2>
                    <p className="text-white-75 mb-0">Total Bookings</p>
                  </div>
                  
                  {popularAmenities.length > 0 && (
                    <div className="bg-white bg-opacity-10 rounded-3 p-3">
                      <h6 className="text-white mb-2">
                        <IconifyIcon icon="solar:fire-bold" className="me-1" />
                        Popular Amenities
                      </h6>
                      {popularAmenities.map(([amenity, count], index) => (
                        <div key={amenity} className="d-flex align-items-center justify-content-between mb-1">
                          <span className="text-white-75 small">{amenity}</span>
                          <span className="text-white fw-semibold small">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingsOverview;
