'use client'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardTitle, Col, Row, Badge, Button } from 'react-bootstrap'

type AmenityType = {
  id: string
  name: string
  description: string
  amenity_type: string
  is_paid: boolean
  price_per_hour?: number
  capacity?: number
  is_active: boolean
  advance_booking_hours: number
  booking_limit_per_day: number
  availability_start: string
  availability_end: string
  cancellation_policy: string
  rules_and_regulations: string
  maintenance_schedule: string
  contact_person: string
  contact_number: string
  community_id: string
  image_urls?: string[]
  created_at: string
  updated_at: string
  societies?: { name: string }
}

type AmenityDetailsCardProps = {
  amenity: AmenityType
}

const AmenityStatCard = ({ count, icon, progress, title, variant }: any) => {
  const AmenityDetailsOptions: ApexOptions = {
    series: [progress],
    chart: {
      width: 90,
      height: 90,
      type: 'radialBar',
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: '50%',
        },
        track: {
          margin: 0,
          background: variant,
        },
        dataLabels: {
          show: false,
        },
      },
    },
    grid: {
      padding: {
        top: -15,
        bottom: -15,
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Usage'],
    colors: [variant],
  }
  return (
    <Card className="mb-0 shadow-none border">
      <CardBody>
        <Row className="justify-content-between align-items-center">
          <Col xl={5}>
            <div className="avatar bg-primary bg-opacity-10 rounded mb-3 flex-centered">
              <IconifyIcon icon={icon} width={28} height={28} className="fs-28 text-primary" />
            </div>
            <p className="fw-medium fs-15 mb-1">{title}</p>
            <p className="mb-0 fw-semibold text-dark fs-20">{count}</p>
          </Col>
          <Col lg={6}>
            <ReactApexChart options={AmenityDetailsOptions} series={AmenityDetailsOptions.series} height={90} type="radialBar" className="apex-charts" />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const AmenityPerformance = ({ amenity }: { amenity: AmenityType }) => {
  const performanceData = [
    {
      count: '95%',
      icon: 'ri:heart-line',
      progress: 95,
      title: 'User Satisfaction',
      variant: '#28a745'
    },
    {
      count: '78%',
      icon: 'ri:calendar-check-line',
      progress: 78,
      title: 'Utilization Rate',
      variant: '#007bff'
    },
    {
      count: '142',
      icon: 'ri:group-line',
      progress: 85,
      title: 'Monthly Bookings',
      variant: '#ffc107'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Performance Metrics :
      </CardTitle>
      <Row className="g-2">
        {performanceData.map((item, idx) => (
          <Col xl={4} lg={6} key={idx}>
            <AmenityStatCard {...item} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

const AmenityBookingAnalytics = ({ amenity }: { amenity: AmenityType }) => {
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Booking Analytics - This Month :
      </CardTitle>
      <Row className="g-3">
        <Col md={6}>
          <Card className="bg-primary-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:calendar-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-primary">248 hrs</h4>
                  <p className="mb-0 text-muted fw-medium">Total Booked Hours</p>
                  <small className="text-success">+18% from last month</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="bg-warning-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-warning rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:money-rupee-circle-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-warning">$37,200</h4>
                  <p className="mb-0 text-muted fw-medium">Monthly Revenue</p>
                  <small className="text-success">+22% from last month</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="bg-success-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-success rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:user-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-success">89</h4>
                  <p className="mb-0 text-muted fw-medium">Unique Users</p>
                  <small className="text-info">Active community</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="bg-info-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-info rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:star-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-info">4.8</h4>
                  <p className="mb-0 text-muted fw-medium">Average Rating</p>
                  <small className="text-success">Excellent feedback</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
      {/* Operating Hours */}
      <Card className="bg-light-subtle mt-3">
        <CardBody>
          <h6 className="mb-3">Operating Schedule</h6>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-medium">Daily Operating Hours</span>
            <span className="badge bg-success">{amenity.availability_start} - {amenity.availability_end}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-medium">Advance Booking Required</span>
            <span className="badge bg-warning">{amenity.advance_booking_hours} hours ahead</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-medium">Daily Booking Limit</span>
            <span className="badge bg-info">{amenity.booking_limit_per_day} bookings per day</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

const AmenityMaintenanceRecords = () => {
  const maintenanceData = [
    {
      id: 1,
      task: 'Pool Chemical Balance Check',
      date: '2024-01-08',
      status: 'completed',
      technician: 'Pool Maintenance Team',
      priority: 'routine',
      variant: 'success'
    },
    {
      id: 2,
      task: 'Water Filter Replacement',
      date: '2024-01-05', 
      status: 'completed',
      technician: 'Aqua Tech Services',
      priority: 'high',
      variant: 'success'
    },
    {
      id: 3,
      task: 'Pool Deck Deep Cleaning',
      date: '2024-02-15',
      status: 'in-progress',
      technician: 'Cleaning Services Co.',
      priority: 'medium',
      variant: 'warning'
    },
    {
      id: 4,
      task: 'Pump & Motor Inspection',
      date: '2024-03-01',
      status: 'scheduled',
      technician: 'Technical Maintenance',
      priority: 'routine',
      variant: 'info'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Maintenance & Service Records :
      </CardTitle>
      <Row>
        {maintenanceData.map((maintenance) => (
          <Col lg={6} key={maintenance.id}>
            <Card className="bg-light-subtle mb-3">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h6 className="mb-1">{maintenance.task}</h6>
                    <p className="text-muted mb-1 fs-13">{maintenance.technician}</p>
                    <small className="text-muted">{new Date(maintenance.date).toLocaleDateString()}</small>
                  </div>
                  <div className="text-end">
                    <span className={`badge bg-${maintenance.variant} mb-1`}>
                      {maintenance.status}
                    </span>
                    <div>
                      <span className={`badge bg-${maintenance.priority === 'high' ? 'danger' : maintenance.priority === 'medium' ? 'warning' : 'secondary'}-subtle text-${maintenance.priority === 'high' ? 'danger' : maintenance.priority === 'medium' ? 'warning' : 'secondary'}`}>
                        {maintenance.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div 
                    className={`progress-bar bg-${maintenance.variant}`}
                    style={{ 
                      width: maintenance.status === 'completed' ? '100%' : 
                             maintenance.status === 'in-progress' ? '65%' : '0%' 
                    }}
                  ></div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const AmenityDetailsCard = ({ amenity }: AmenityDetailsCardProps) => {
  // Function to get the appropriate icon for each amenity type
  const getAmenityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "recreation":
        return "ri:game-line";
      case "fitness":
        return "ri:run-line";
      case "sports":
        return "ri:football-line";
      case "event space":
        return "ri:calendar-event-line";
      case "educational":
        return "ri:book-open-line";
      case "utility":
        return "ri:tools-line";
      default:
        return "ri:building-line";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardBody>
        {/* Header Section */}
        <Row className="mb-4">
          <Col xl={12}>
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex align-items-start gap-3 flex-1 me-4">
                <div className="avatar-lg bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                  <IconifyIcon 
                    icon={getAmenityIcon(amenity.amenity_type || "")}
                    className="fs-28 text-primary" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2">{amenity.name}</h3>
                  <p className="text-muted mb-3 fs-14 pe-3" style={{ lineHeight: '1.6', maxWidth: '90%' }}>
                    {amenity.description}
                  </p>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <Badge bg={amenity.is_active ? 'success' : 'danger'} className="fs-11">
                      <IconifyIcon icon={amenity.is_active ? 'ri:check-line' : 'ri:close-line'} className="me-1" />
                      {amenity.is_active ? 'Available' : 'Unavailable'}
                    </Badge>
                    <Badge bg={amenity.is_paid ? 'warning' : 'success'} className="fs-11">
                      <IconifyIcon icon={amenity.is_paid ? 'ri:money-rupee-circle-line' : 'ri:gift-line'} className="me-1" />
                      {amenity.is_paid ? `$${amenity.price_per_hour}/hr` : 'Free'}
                    </Badge>
                    <Badge bg="info" className="fs-11">
                      <IconifyIcon icon="ri:map-pin-line" className="me-1" />
                      {amenity.societies?.name || 'Casa Nirvana'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-end d-flex flex-column gap-2 flex-shrink-0" style={{ minWidth: '180px' }}>
                <Button variant="outline-primary" size="sm" className="w-100">
                  <IconifyIcon icon="ri:edit-line" className="me-1" />
                  Edit
                </Button>
                <Button variant="primary" size="sm" className="w-100">
                  <IconifyIcon icon="ri:calendar-line" className="me-1" />
                  View Bookings
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Quick Info Cards */}
        <Row className="g-3 mb-4">
          <Col lg={3} md={6}>
            <Card className="bg-primary-subtle border-0 h-100">
              <CardBody className="text-center">
                <IconifyIcon icon="ri:group-line" className="fs-24 text-primary mb-2" />
                <h5 className="mb-1 text-primary">{amenity.capacity || 'Unlimited'}</h5>
                <p className="mb-0 text-muted fs-13">Capacity</p>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="bg-success-subtle border-0 h-100">
              <CardBody className="text-center">
                <IconifyIcon icon="ri:time-line" className="fs-24 text-success mb-2" />
                <h5 className="mb-1 text-success">12</h5>
                <p className="mb-0 text-muted fs-13">Operating Hours</p>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="bg-warning-subtle border-0 h-100">
              <CardBody className="text-center">
                <IconifyIcon icon="ri:calendar-check-line" className="fs-24 text-warning mb-2" />
                <h5 className="mb-1 text-warning">{amenity.advance_booking_hours}h</h5>
                <p className="mb-0 text-muted fs-13">Advance Booking</p>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="bg-info-subtle border-0 h-100">
              <CardBody className="text-center">
                <IconifyIcon icon="ri:repeat-line" className="fs-24 text-info mb-2" />
                <h5 className="mb-1 text-info">{amenity.booking_limit_per_day}</h5>
                <p className="mb-0 text-muted fs-13">Daily Limit</p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Contact & Management Info */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="bg-light-subtle h-100">
              <CardBody>
                <h6 className="mb-3">
                  <IconifyIcon icon="ri:user-settings-line" className="me-2" />
                  Management Contact
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <Image src={avatar2} alt="manager" width={48} height={48} className="rounded-circle" />
                  <div>
                    <h6 className="mb-1">{amenity.contact_person}</h6>
                    <p className="text-muted mb-1 fs-13">Facility Manager</p>
                    <p className="text-muted mb-0 fs-13">
                      <IconifyIcon icon="ri:phone-line" className="me-1" />
                      {amenity.contact_number}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="bg-light-subtle h-100">
              <CardBody>
                <h6 className="mb-3">
                  <IconifyIcon icon="ri:price-tag-3-line" className="me-2" />
                  Pricing Information
                </h6>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-md bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="ri:money-rupee-circle-line" className="fs-20 text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-1">
                      {amenity.is_paid ? `$${amenity.price_per_hour}` : 'Free'}
                      {amenity.is_paid && <small className="text-muted fs-13 ms-1">per hour</small>}
                    </h5>
                    <p className="text-muted mb-0 fs-13">
                      {amenity.is_paid ? 'Paid Amenity' : 'Complimentary Service'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Features & Rules */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="border h-100">
              <CardBody>
                <h6 className="mb-3">
                  <IconifyIcon icon="ri:star-line" className="me-2" />
                  Amenity Features
                </h6>
                <div className="row g-2">
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <IconifyIcon icon="ri:check-line" className="text-success fs-14" />
                      <span className="fs-13">Type: {amenity.amenity_type}</span>
                    </div>
                  </div>
                  {amenity.capacity && (
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-2">
                        <IconifyIcon icon="ri:check-line" className="text-success fs-14" />
                        <span className="fs-13">Capacity: {amenity.capacity} people</span>
                      </div>
                    </div>
                  )}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <IconifyIcon icon="ri:check-line" className="text-success fs-14" />
                      <span className="fs-13">{amenity.is_paid ? 'Paid Service' : 'Free Service'}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <IconifyIcon icon="ri:check-line" className="text-success fs-14" />
                      <span className="fs-13">Operating Hours: {amenity.availability_start} - {amenity.availability_end}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="border h-100">
              <CardBody>
                <h6 className="mb-3">
                  <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                  Rules & Guidelines
                </h6>
                <div className="row g-2">
                  <div className="col-12">
                    <div className="d-flex align-items-start gap-2">
                      <IconifyIcon icon="ri:information-line" className="text-warning fs-14 mt-1" />
                      <span className="fs-13">Advance booking required: {amenity.advance_booking_hours} hours</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start gap-2">
                      <IconifyIcon icon="ri:information-line" className="text-warning fs-14 mt-1" />
                      <span className="fs-13">Daily booking limit: {amenity.booking_limit_per_day} bookings</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start gap-2">
                      <IconifyIcon icon="ri:information-line" className="text-warning fs-14 mt-1" />
                      <span className="fs-13">Cancellation Policy: {amenity.cancellation_policy}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start gap-2">
                      <IconifyIcon icon="ri:information-line" className="text-warning fs-14 mt-1" />
                      <span className="fs-13">Rules: {amenity.rules_and_regulations}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Performance & Analytics Sections */}
        <AmenityPerformance amenity={amenity} />
        <AmenityBookingAnalytics amenity={amenity} />
        <AmenityMaintenanceRecords />
      </CardBody>
    </Card>
  )
}

export default AmenityDetailsCard
