"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Badge } from "react-bootstrap";
import { useListAmenityBookings } from "@/hooks/useAmenities";

const BookingsAnalytics = () => {
  const { data: bookings = [] } = useListAmenityBookings();

  // Process data for analytics
  const processBookingsData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyBookings = last7Days.map(date => {
      const dayBookings = bookings.filter(booking => 
        booking.booking_date === date
      );
      return {
        date,
        total: dayBookings.length,
        confirmed: dayBookings.filter(b => b.status === 'confirmed').length,
        pending: dayBookings.filter(b => b.status === 'pending').length,
        revenue: dayBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      };
    });

    return dailyBookings;
  };

  // Get amenity performance data
  const getAmenityPerformance = () => {
    const amenityStats = bookings.reduce((acc, booking) => {
      const amenityName = booking.amenities?.name || 'Unknown';
      if (!acc[amenityName]) {
        acc[amenityName] = {
          name: amenityName,
          bookings: 0,
          revenue: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0
        };
      }
      
      acc[amenityName].bookings += 1;
      acc[amenityName].revenue += booking.total_amount || 0;
      
      if (booking.status === 'confirmed') acc[amenityName].confirmed += 1;
      else if (booking.status === 'pending') acc[amenityName].pending += 1;
      else if (booking.status === 'cancelled') acc[amenityName].cancelled += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(amenityStats).sort((a: any, b: any) => b.bookings - a.bookings);
  };

  const dailyData = processBookingsData();
  const amenityPerformance = getAmenityPerformance();
  const maxBookings = Math.max(...dailyData.map(d => d.total), 1);

  // Calculate trends
  const currentWeekBookings = dailyData.reduce((sum, day) => sum + day.total, 0);
  const currentWeekRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailyBookings = currentWeekBookings / 7;

  return (
    <Row className="mb-4">
      <Col xl={8}>
        <Card className="h-100">
          <CardHeader className="border-bottom">
            <CardTitle as="h4" className="mb-0">
              <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2" />
              Booking Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <Row className="g-3">
                <Col sm={4}>
                  <div className="text-center p-3 bg-primary-subtle rounded-3">
                    <h5 className="text-primary mb-1">{currentWeekBookings}</h5>
                    <p className="text-muted small mb-0">Total This Week</p>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="text-center p-3 bg-success-subtle rounded-3">
                    <h5 className="text-success mb-1">${currentWeekRevenue.toLocaleString()}</h5>
                    <p className="text-muted small mb-0">Revenue This Week</p>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="text-center p-3 bg-info-subtle rounded-3">
                    <h5 className="text-info mb-1">{avgDailyBookings.toFixed(1)}</h5>
                    <p className="text-muted small mb-0">Avg Daily Bookings</p>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Simple Bar Chart */}
            <div className="chart-container">
              <div className="d-flex align-items-end justify-content-between" style={{ height: '200px', gap: '8px' }}>
                {dailyData.map((day, index) => {
                  const height = (day.total / maxBookings) * 160;
                  const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <div key={day.date} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                      <div className="position-relative mb-2" style={{ height: '160px', display: 'flex', alignItems: 'end' }}>
                        <div
                          className="bg-primary rounded-top position-relative"
                          style={{ 
                            height: `${height}px`, 
                            width: '40px',
                            minHeight: day.total > 0 ? '8px' : '2px',
                            transition: 'height 0.3s ease'
                          }}
                          title={`${day.total} bookings on ${dayName}`}
                        >
                          {day.total > 0 && (
                            <span className="position-absolute top-0 start-50 translate-middle-x text-white small fw-semibold" style={{ marginTop: '-20px' }}>
                              {day.total}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="fw-semibold small text-muted">{dayName}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>
                          {new Date(day.date).getDate()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-3 border-top">
              <div className="d-flex align-items-center justify-content-center gap-4">
                <div className="d-flex align-items-center">
                  <div className="bg-primary rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                  <span className="small text-muted">Daily Bookings</span>
                </div>
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="solar:arrow-up-bold" className="text-success me-1" />
                  <span className="small text-success">+15.2% vs last week</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      <Col xl={4}>
        <Card className="h-100">
          <CardHeader className="border-bottom">
            <CardTitle as="h4" className="mb-0">
              <IconifyIcon icon="solar:star-bold-duotone" className="me-2" />
              Amenity Performance
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {amenityPerformance.slice(0, 5).map((amenity: any, index: number) => {
                const successRate = amenity.bookings > 0 ? (amenity.confirmed / amenity.bookings) * 100 : 0;
                
                return (
                  <div key={amenity.name} className="p-3 border rounded-3 mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <Badge bg={index === 0 ? 'warning' : index === 1 ? 'success' : index === 2 ? 'info' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">{amenity.name}</h6>
                          <small className="text-muted">{amenity.bookings} bookings</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold text-success">${amenity.revenue.toLocaleString()}</div>
                        <small className="text-muted">{successRate.toFixed(0)}% success</small>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="flex-grow-1 bg-light rounded" style={{ height: '4px' }}>
                        <div 
                          className="bg-success rounded h-100" 
                          style={{ width: `${successRate}%`, transition: 'width 0.3s ease' }}
                        ></div>
                      </div>
                      <small className="text-muted fw-medium">{successRate.toFixed(0)}%</small>
                    </div>

                    <div className="d-flex justify-content-between">
                      <small className="text-success">
                        <IconifyIcon icon="solar:check-circle-bold" className="me-1" />
                        {amenity.confirmed} confirmed
                      </small>
                      {amenity.pending > 0 && (
                        <small className="text-warning">
                          <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                          {amenity.pending} pending
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {amenityPerformance.length === 0 && (
              <div className="text-center py-4">
                <IconifyIcon icon="solar:chart-2-bold-duotone" className="fs-48 text-muted mb-2" />
                <p className="text-muted">No booking data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingsAnalytics;
