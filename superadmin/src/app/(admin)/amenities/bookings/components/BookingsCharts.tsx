"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Badge } from "react-bootstrap";
import { useListAmenityBookings } from "@/hooks/useAmenities";

const BookingsCharts = () => {
  const { data: bookings = [] } = useListAmenityBookings();

  // Process data for weekly bookings chart
  const processWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayBookings = bookings.filter(booking => booking.booking_date === date);
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        date,
        day: dayName,
        total: dayBookings.length,
        confirmed: dayBookings.filter(b => b.status === 'confirmed').length,
        pending: dayBookings.filter(b => b.status === 'pending').length,
        revenue: dayBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      };
    });
  };

  // Process amenity performance data
  const processAmenityData = () => {
    const amenityStats = bookings.reduce((acc, booking) => {
      const amenityName = booking.amenities?.name || 'Unknown';
      if (!acc[amenityName]) {
        acc[amenityName] = {
          name: amenityName,
          bookings: 0,
          revenue: 0,
          confirmed: 0,
          pending: 0
        };
      }
      
      acc[amenityName].bookings += 1;
      acc[amenityName].revenue += booking.total_amount || 0;
      
      if (booking.status === 'confirmed') acc[amenityName].confirmed += 1;
      else if (booking.status === 'pending') acc[amenityName].pending += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(amenityStats)
      .sort((a: any, b: any) => b.bookings - a.bookings)
      .slice(0, 5);
  };

  // Process hourly distribution
  const processHourlyData = () => {
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      bookings: 0,
      label: hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`
    }));

    bookings.forEach(booking => {
      const hour = parseInt(booking.start_time.split(':')[0]);
      if (hour >= 0 && hour < 24) {
        hourlyStats[hour].bookings += 1;
      }
    });

    return hourlyStats.filter(h => h.hour >= 6 && h.hour <= 23); // Show only operational hours
  };

  const weeklyData = processWeeklyData();
  const amenityData = processAmenityData();
  const hourlyData = processHourlyData();
  
  const maxWeeklyBookings = Math.max(...weeklyData.map(d => d.total), 1);
  const maxHourlyBookings = Math.max(...hourlyData.map(d => d.bookings), 1);

  return (
    <Row className="mb-4">
      <Col xl={8}>
        <Card className="h-100">
          <CardHeader className="border-bottom bg-light">
            <div className="d-flex align-items-center justify-content-between">
              <CardTitle as="h4" className="mb-0">
                <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2 text-primary" />
                Booking Analytics Dashboard
              </CardTitle>
              <Badge bg="primary" className="px-3 py-2">
                Last 7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Row className="g-0">
              {/* Weekly Trend Chart */}
              <Col md={7} className="border-end">
                <div className="p-4">
                  <h6 className="mb-3 fw-semibold text-muted">
                    <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                    Weekly Booking Trends
                  </h6>
                  
                  <div className="d-flex align-items-end justify-content-between mb-3" style={{ height: '200px' }}>
                    {weeklyData.map((day, index) => {
                      const height = (day.total / maxWeeklyBookings) * 160;
                      const confirmedHeight = (day.confirmed / maxWeeklyBookings) * 160;
                      const pendingHeight = (day.pending / maxWeeklyBookings) * 160;
                      
                      return (
                        <div key={day.date} className="d-flex flex-column align-items-center flex-grow-1">
                          <div className="position-relative mb-2" style={{ height: '160px', width: '40px' }}>
                            {/* Total bar background */}
                            <div 
                              className="position-absolute bottom-0 w-100 bg-light rounded-top"
                              style={{ height: `${height}px` }}
                            />
                            
                            {/* Confirmed bookings */}
                            <div 
                              className="position-absolute bottom-0 w-100 bg-success rounded-top"
                              style={{ height: `${confirmedHeight}px` }}
                              title={`${day.confirmed} confirmed bookings`}
                            />
                            
                            {/* Pending bookings */}
                            <div 
                              className="position-absolute bg-warning rounded-top"
                              style={{ 
                                height: `${pendingHeight}px`,
                                width: '100%',
                                bottom: `${confirmedHeight}px`
                              }}
                              title={`${day.pending} pending bookings`}
                            />
                            
                            {/* Booking count label */}
                            {day.total > 0 && (
                              <div 
                                className="position-absolute text-center fw-bold small text-white"
                                style={{ 
                                  top: '-25px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '11px'
                                }}
                              >
                                {day.total}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <div className="fw-semibold small text-dark">{day.day}</div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>
                              {new Date(day.date).getDate()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex align-items-center justify-content-center gap-4 pt-2 border-top">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                      <small className="text-muted">Confirmed</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="bg-warning rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                      <small className="text-muted">Pending</small>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Hourly Distribution */}
              <Col md={5}>
                <div className="p-4">
                  <h6 className="mb-3 fw-semibold text-muted">
                    <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                    Peak Hours Analysis
                  </h6>
                  
                  <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {hourlyData
                      .filter(h => h.bookings > 0)
                      .sort((a, b) => b.bookings - a.bookings)
                      .slice(0, 8)
                      .map((hour, index) => {
                        const percentage = (hour.bookings / maxHourlyBookings) * 100;
                        
                        return (
                          <div key={hour.hour} className="d-flex align-items-center mb-2">
                            <div className="me-2" style={{ minWidth: '50px' }}>
                              <small className="text-muted fw-medium">{hour.label}</small>
                            </div>
                            <div className="flex-grow-1 me-2">
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className={`progress-bar ${
                                    index === 0 ? 'bg-danger' : 
                                    index === 1 ? 'bg-warning' : 
                                    index === 2 ? 'bg-info' : 'bg-primary'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div style={{ minWidth: '30px' }}>
                              <small className="fw-semibold text-dark">{hour.bookings}</small>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {hourlyData.filter(h => h.bookings > 0).length === 0 && (
                    <div className="text-center py-4">
                      <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-48 text-muted mb-2" />
                      <p className="text-muted small">No hourly data available</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>

      <Col xl={4}>
        <Card className="h-100">
          <CardHeader className="border-bottom bg-light">
            <CardTitle as="h4" className="mb-0">
              <IconifyIcon icon="solar:star-bold-duotone" className="me-2 text-warning" />
              Top Amenities
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {amenityData.map((amenity: any, index: number) => {
                const successRate = amenity.bookings > 0 ? (amenity.confirmed / amenity.bookings) * 100 : 0;
                
                return (
                  <div key={amenity.name} className="border rounded-3 p-3 mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <Badge bg={
                            index === 0 ? 'warning' : 
                            index === 1 ? 'success' : 
                            index === 2 ? 'info' : 
                            index === 3 ? 'primary' : 'secondary'
                          }>
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
                        />
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

            {amenityData.length === 0 && (
              <div className="text-center py-4">
                <IconifyIcon icon="solar:chart-2-bold-duotone" className="fs-48 text-muted mb-2" />
                <p className="text-muted">No amenity data available</p>
              </div>
            )}

            {/* Summary Stats */}
            {amenityData.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <div className="bg-light rounded-3 p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small text-muted">Total Amenities Active</span>
                    <span className="fw-semibold">{amenityData.length}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small text-muted">Average Success Rate</span>
                    <span className="fw-semibold text-success">
                      {(amenityData.reduce((sum, a) => sum + (a.confirmed / a.bookings * 100), 0) / amenityData.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="small text-muted">Top Performer</span>
                    <span className="fw-semibold text-primary">{amenityData[0]?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default BookingsCharts;
