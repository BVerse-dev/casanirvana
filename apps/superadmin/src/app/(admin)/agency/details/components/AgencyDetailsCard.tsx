'use client'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Card as BSCard, CardBody, CardTitle, Col, Row } from 'react-bootstrap'
import { propertyFileData, propertyStatusData, PropertyStatusType } from '../data'
import { getAgencyPropertyImage } from '@/utils/avatarMapper'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: '90px'}}>Loading chart...</div>
})

const AgencyStatCard = ({ count, icon, progress, title, variant }: PropertyStatusType) => {
  const AgencyDetailsOptions: ApexOptions = {
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
    labels: ['Cricket'],
    colors: [variant],
  }
  return (
    <BSCard className="mb-0 shadow-none border">
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
            <ReactApexChart options={AgencyDetailsOptions} series={AgencyDetailsOptions.series} height={90} type="radialBar" className="apex-charts" />
          </Col>
        </Row>
      </CardBody>
    </BSCard>
  )
}

const PropertyStatus = () => {
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Management Portfolio Overview :
      </CardTitle>
      <Row className="g-2">
        {propertyStatusData.map((item, idx) => (
          <Col xl={4} lg={6} key={idx}>
            <AgencyStatCard {...item} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

const PropertyFile = () => {
  return (
    <>
      <CardTitle as={'h4'} className="mt-4">
        Property File :
      </CardTitle>
      <div className="mt-3 d-flex flex-wrap gap-2">
        {propertyFileData.map((item, idx) => (
          <div className="d-flex p-2 gap-2 bg-light-subtle align-items-center text-start position-relative border rounded" key={idx}>
            <IconifyIcon icon={item.icon} className={`text-${item.variant} fs-24`} />
            <div>
              <h4 className="fs-14 mb-1">
                <Link href="" className="text-dark stretched-link">
                  {item.name}
                </Link>
              </h4>
              <p className="fs-12 mb-0">{item.data} MB</p>
            </div>
            <IconifyIcon icon="ri:download-cloud-line" className=" fs-20 text-muted" />
          </div>
        ))}
      </div>
    </>
  )
}

const AgencyAnalytics = () => {
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Property Management Performance - This Month :
      </CardTitle>
      <Row className="g-3">
        <Col md={6}>
          <BSCard className="bg-primary-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:building-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-primary">12</h4>
                  <p className="mb-0 text-muted fw-medium">Managed Societies</p>
                  <small className="text-success">+2 new this quarter</small>
                </div>
              </div>
            </CardBody>
          </BSCard>
        </Col>
        <Col md={6}>
          <BSCard className="bg-success-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-success rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:money-dollar-circle-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-success">$485K</h4>
                  <p className="mb-0 text-muted fw-medium">Monthly Management Revenue</p>
                  <small className="text-success">+12.5% from last month</small>
                </div>
              </div>
            </CardBody>
          </BSCard>
        </Col>
        <Col md={6}>
          <BSCard className="bg-warning-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-warning rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:tools-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-warning">48</h4>
                  <p className="mb-0 text-muted fw-medium">Active Maintenance Tickets</p>
                  <small className="text-success">-15% from last month</small>
                </div>
              </div>
            </CardBody>
          </BSCard>
        </Col>
        <Col md={6}>
          <BSCard className="bg-info-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-info rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:star-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-info">4.8</h4>
                  <p className="mb-0 text-muted fw-medium">Resident Satisfaction Rating</p>
                  <small className="text-success">+0.3 this month</small>
                </div>
              </div>
            </CardBody>
          </BSCard>
        </Col>
      </Row>
      
      {/* Weekly Performance Overview */}
      <Row className="mt-3">
        <Col lg={12}>
          <BSCard className="bg-light-subtle border-0">
            <CardBody>
              <h6 className="text-muted mb-3">Weekly Management Overview</h6>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-primary mb-1">142</h5>
                    <small className="text-muted">Maintenance Requests Completed</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-success mb-1">28</h5>
                    <small className="text-muted">New Amenity Bookings</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-warning mb-1">16</h5>
                    <small className="text-muted">Society Meetings Held</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-info mb-1">94%</h5>
                    <small className="text-muted">Average Occupancy Rate</small>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </BSCard>
        </Col>
      </Row>
    </div>
  )
}

const PropertyManagementTraining = () => {
  const trainings = [
    {
      course: 'Property Management License Certification',
      status: 'completed',
      progress: 100,
      certification: true,
      variant: 'success'
    },
    {
      course: 'Advanced Maintenance Management',
      status: 'completed', 
      progress: 100,
      certification: true,
      variant: 'success'
    },
    {
      course: 'Community Relations & Resident Services',
      status: 'in-progress',
      progress: 75,
      certification: false,
      variant: 'primary'
    },
    {
      course: 'Financial Management for HOAs',
      status: 'scheduled',
      progress: 0,
      certification: false,
      variant: 'secondary'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Management Team Training & Certifications :
      </CardTitle>
      <Row className="g-3">
        {trainings.map((training, idx) => (
          <Col lg={6} key={idx}>
            <BSCard className="border mb-0">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{training.course}</h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge bg-${training.variant}`}>
                        {training.status.charAt(0).toUpperCase() + training.status.slice(1)}
                      </span>
                      {training.certification && (
                        <IconifyIcon icon="ri:verified-badge-line" className="text-success fs-16" />
                      )}
                    </div>
                  </div>
                  <div className="text-end">
                    <h5 className={`mb-0 text-${training.variant}`}>{training.progress}%</h5>
                  </div>
                </div>
                <div className="progress mb-2" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar bg-${training.variant}`}
                    style={{ width: `${training.progress}%` }}
                  />
                </div>
                <small className="text-muted">
                  {training.status === 'completed' && 'Certification earned'}
                  {training.status === 'in-progress' && 'Expected completion: Next month'}
                  {training.status === 'scheduled' && 'Starts next quarter'}
                </small>
              </CardBody>
            </BSCard>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const RecentActivities = () => {
  const activities = [
    {
      type: 'maintenance_completed',
      title: 'Major Maintenance Project Completed',
      description: 'Elevator modernization completed for Greenfield Heights society',
      time: '2 hours ago',
      icon: 'ri:tools-line',
      variant: 'success'
    },
    {
      type: 'new_society',
      title: 'New Society Added to Portfolio',
      description: 'Paradise Gardens - 150 units now under management',
      time: '5 hours ago',
      icon: 'ri:building-line',
      variant: 'primary'
    },
    {
      type: 'resident_meeting',
      title: 'Monthly Society Meeting',
      description: 'AGM conducted for Silver Oak Apartments residents',
      time: '1 day ago',
      icon: 'ri:group-line',
      variant: 'info'
    },
    {
      type: 'occupancy_update',
      title: 'Occupancy Rate Improved',
      description: 'Oakwood Residences reached 98% occupancy this month',
      time: '2 days ago',
      icon: 'ri:home-line',
      variant: 'warning'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Recent Management Activities :
      </CardTitle>
      <div className="timeline-container">
        {activities.map((activity, idx) => (
          <div key={idx} className="d-flex align-items-start gap-3 mb-3">
            <div className={`avatar-sm bg-${activity.variant}-subtle rounded-circle d-flex align-items-center justify-content-center`}>
              <IconifyIcon icon={activity.icon} className={`text-${activity.variant} fs-16`} />
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">{activity.title}</h6>
              <p className="text-muted mb-1 fs-13">{activity.description}</p>
              <small className="text-muted">{activity.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ManagementCompliance = () => {
  const licenses = [
    {
      name: 'Property Management License',
      status: 'Active',
      expiry: 'Dec 2025',
      variant: 'success'
    },
    {
      name: 'Community Association Manager License',
      status: 'Active', 
      expiry: 'Mar 2026',
      variant: 'success'
    },
    {
      name: 'Building Operations Certification',
      status: 'Active',
      expiry: 'Aug 2025',
      variant: 'success'
    },
    {
      name: 'Insurance & Bonding',
      status: 'Renewal Due',
      expiry: 'Jul 2025',
      variant: 'warning'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Management Licenses & Compliance :
      </CardTitle>
      <div className="row g-2">
        {licenses.map((license, idx) => (
          <div key={idx} className="col-lg-6">
            <div className="d-flex justify-content-between align-items-center p-3 bg-light-subtle rounded border">
              <div>
                <h6 className="mb-1 fs-14">{license.name}</h6>
                <small className="text-muted">Expires: {license.expiry}</small>
              </div>
              <span className={`badge bg-${license.variant}`}>{license.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ManagementPerformance = () => {
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Management Performance Insights :
      </CardTitle>
      <Row className="g-3">
        <Col lg={6}>
          <BSCard className="border-0 bg-gradient-primary text-white">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="text-white mb-1">Total Units Managed</h5>
                  <h3 className="text-white mb-2">1,840</h3>
                  <small className="text-white-50">Across 12 societies</small>
                </div>
                <div className="avatar-md bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:building-line" className="text-white fs-24" />
                </div>
              </div>
            </CardBody>
          </BSCard>
        </Col>
        <Col lg={6}>
          <BSCard className="border-0 bg-gradient-success text-white">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="text-white mb-1">Avg. Maintenance Response</h5>
                  <h3 className="text-white mb-2">4.2hrs</h3>
                  <small className="text-white-50">-25% from last year</small>
                </div>
                <div className="avatar-md bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:time-line" className="text-white fs-24" />
                </div>
              </div>
            </CardBody>
          </BSCard>
        </Col>
      </Row>
    </div>
  )
}

// Main component - now all dependencies are defined above
const AgencyDetailsCard = ({ agency }: { agency?: any }) => {
  // Get the agency avatar from the mapping utility (same as list view)
  const agencyAvatar = getAgencyPropertyImage(agency)
  
  return (
    <BSCard>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="position-relative">
            {agencyAvatar ? (
              <Image src={agencyAvatar} alt="agency-avatar" width={80} height={80} className="avatar-xl user-img img-thumbnail rounded-circle" />
            ) : (
              <div className="avatar-xl bg-primary rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:building-4-line" className="fs-24 text-white" />
              </div>
            )}
            <div className="badge bg-success rounded-2 position-absolute bottom-0 start-50 translate-middle-x mb-n1 fs-11"># 1</div>
          </div>
          <div className="d-block">
            <Link href="" className="text-dark fw-medium fs-16">
              {agency?.name || 'Agency Name'}
            </Link>
            <p className="mb-0">{agency?.email || 'No email provided'}</p>
          </div>
          <div className="ms-lg-auto">
            <Link href="" className="btn btn-primary">
              Message
            </Link>
            &nbsp;
            <Link href="" className="btn btn-outline-secondary">
              Schedule Meeting
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <p className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
            Lincoln Drive Harrisburg, PA 17101 U.S.A
          </p>
          <p className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:outgoing-call-rounded-bold-duotone" className="fs-18 text-primary" />
            +123 864-357-7713
          </p>
          <CardTitle as={'h4'} className="mb-2 mt-3">
            Social Media :
          </CardTitle>
          <ul className="list-inline d-flex gap-1 mb-0 mt-3 align-items-center">
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-primary avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:facebook-fill" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-danger avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:instagram-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-info avatar-sm d-flex align-items-center justify-content-center  fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:twitter-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-success avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:whatsapp-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-warning avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:mail-line" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <CardTitle as={'h4'} className="mb-2">
            About Property Management Company :
          </CardTitle>
          <p className="mb-2">
            Meet Michael, a dedicated and experienced property management professional who is committed to ensuring exceptional living experiences for all residents.
            With a passion for creating well-maintained communities, Michael brings a wealth of knowledge and expertise to every society under management.
          </p>
          <p className="mb-2">
            Michael has been a prominent figure in the property management industry for over a decade. His career began with a focus on residential communities,
            quickly expanding to include commercial properties and mixed-use developments. Michael&apos;s extensive experience and deep
            understanding of community management allow him to handle even the most complex operational challenges with ease.
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Management Company</span>
            <span className="mx-2">:</span>Prestige Property Management
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Management License</span>
            <span className="mx-2">:</span>PM-5758-2048-3944
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">CAM Certificate</span>
            <span className="mx-2">:</span>CAM-9275-PC-55685
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Service Areas</span>
            <span className="mx-2">:</span>Lincoln Drive Harrisburg
          </p>
          <div className="my-2">
            <Link href="" className="link-primary fw-medium">
              View More <IconifyIcon icon="ri:arrow-right-line" />
            </Link>
          </div>
        </div>
        <AgencyAnalytics />
        <PropertyStatus />
        <PropertyManagementTraining />
        <RecentActivities />
        <ManagementCompliance />
        <ManagementPerformance />
        <PropertyFile />
      </CardBody>
    </BSCard>
  )
}

export default AgencyDetailsCard
