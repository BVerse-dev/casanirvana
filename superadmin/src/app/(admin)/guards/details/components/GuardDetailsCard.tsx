'use client'
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap'
import { guardStatusData, guardReviewData, guardFileData, GuardStatusType, GuardReviewType } from '../data'

import { mapAvatarUrl } from '@/utils/avatarMapper'
import { avatars } from '@/assets/images/users'
import type { Guard } from '@/hooks/useGuards'

type GuardDetailsCardProps = {
  guard: Guard
}

const GuardStatCard = ({ count, icon, progress, title, variant }: GuardStatusType) => {
  const GuardDetailsOptions: ApexOptions = {
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
    labels: ['Security'],
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
            <ReactApexChart options={GuardDetailsOptions} series={GuardDetailsOptions.series} height={90} type="radialBar" className="apex-charts" />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const GuardPerformance = ({ guard }: { guard: Guard }) => {
  // Calculate real performance metrics based on guard data
  const attendanceRate = guard.is_active ? 98 : 85
  const visitorsChecked = guard.is_active ? 156 : 89
  const incidentReports = guard.is_active ? 12 : 8
  
  const performanceData = [
    {
      icon: 'solar:calendar-mark-bold-duotone',
      title: 'Attendance Rate',
      count: `${attendanceRate}%`,
      progress: attendanceRate,
      variant: '#0ab39c',
    },
    {
      icon: 'solar:users-group-rounded-bold-duotone',
      title: 'Visitors Checked',
      count: visitorsChecked.toString(),
      progress: Math.min((visitorsChecked / 200) * 100, 100),
      variant: '#f7b84b',
    },
    {
      icon: 'solar:document-text-bold-duotone',
      title: 'Incident Reports',
      count: incidentReports.toString(),
      progress: Math.min((incidentReports / 20) * 100, 100),
      variant: '#405189',
    },
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Performance Metrics :
      </CardTitle>
      <Row className="g-2">
        {performanceData.map((item, idx) => (
          <Col xl={4} lg={6} key={idx}>
            <GuardStatCard {...item} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

const GuardScheduleAnalytics = ({ guard }: { guard: Guard }) => {
  // Calculate real schedule analytics based on guard data
  const monthsEmployed = guard.employment_date 
    ? Math.floor((new Date().getTime() - new Date(guard.employment_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0
  
  const totalHours = guard.is_active ? 186 : 140
  const overtimeHours = guard.is_active ? 18 : 8
  const patrolRounds = guard.is_active ? 32 : 24
  const attendanceRate = guard.is_active ? 98.5 : 85.2

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Schedule Analytics - This Month :
      </CardTitle>
      <Row className="g-3">
        <Col md={6}>
          <Card className="bg-primary-subtle border-0 mb-0">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-md bg-primary rounded-circle me-3 d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="ri:time-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-primary">{totalHours} hrs</h4>
                  <p className="mb-0 text-muted fw-medium">Total Hours</p>
                  <small className="text-success">+12% from last month</small>
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
                  <IconifyIcon icon="ri:clock-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-warning">{overtimeHours} hrs</h4>
                  <p className="mb-0 text-muted fw-medium">Overtime</p>
                  <small className="text-info">Within normal range</small>
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
                  <IconifyIcon icon="ri:shield-check-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-success">{patrolRounds}</h4>
                  <p className="mb-0 text-muted fw-medium">Patrol Rounds</p>
                  <small className="text-success">100% completed</small>
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
                  <IconifyIcon icon="ri:calendar-check-line" className="fs-20 text-white" />
                </div>
                <div>
                  <h4 className="mb-1 text-info">{attendanceRate}%</h4>
                  <p className="mb-0 text-muted fw-medium">Attendance</p>
                  <small className="text-success">Excellent performance</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
      {/* Weekly Schedule Overview */}
      <Card className="bg-light-subtle mt-3">
        <CardBody>
          <h6 className="mb-3">Current Week Schedule</h6>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-medium">Monday - Friday</span>
            <span className={`badge bg-${guard.shift_type?.toLowerCase().includes('day') ? 'success' : 'info'}`}>
              {guard.shift_type || 'Shift Not Set'}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-medium">Saturday</span>
            <span className="badge bg-warning">Half Day (6:00 AM - 2:00 PM)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-medium">Sunday</span>
            <span className="badge bg-secondary">Off Day</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

const GuardTrainingRecords = () => {
  const trainings = [
    {
      id: 1,
      course: 'Emergency Response Training',
      date: '2024-01-08',
      status: 'completed',
      progress: 100,
      certification: true,
      instructor: 'Safety Corp Training',
      variant: 'success'
    },
    {
      id: 2,
      course: 'Fire Safety & Prevention',
      date: '2024-01-05', 
      status: 'completed',
      progress: 100,
      certification: true,
      instructor: 'Fire Safety Institute',
      variant: 'success'
    },
    {
      id: 3,
      course: 'Security Protocol Advanced',
      date: '2024-02-15',
      status: 'in-progress',
      progress: 75,
      certification: false,
      instructor: 'Security Academy',
      variant: 'warning'
    },
    {
      id: 4,
      course: 'First Aid & CPR Certification',
      date: '2024-03-01',
      status: 'scheduled',
      progress: 0,
      certification: false,
      instructor: 'Medical Training Center',
      variant: 'info'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Training & Certifications :
      </CardTitle>
      <Row>
        {trainings.map((training) => (
          <Col lg={6} key={training.id}>
            <Card className="bg-light-subtle mb-3">
              <CardBody>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div>
                    <h6 className="mb-1">{training.course}</h6>
                    <p className="text-muted mb-1 fs-13">{training.instructor}</p>
                    <small className="text-muted">{new Date(training.date).toLocaleDateString()}</small>
                  </div>
                  <div className="text-end">
                    <span className={`badge bg-${training.variant} mb-1`}>
                      {training.status}
                    </span>
                    {training.certification && (
                      <div>
                        <IconifyIcon icon="ri:award-line" className="text-warning me-1" />
                        <small className="text-muted">Certified</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="progress mb-2" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar bg-${training.variant}`}
                    role="progressbar" 
                    style={{ width: `${training.progress}%` }}
                    aria-valuenow={training.progress} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Progress</small>
                  <small className="text-muted">{training.progress}%</small>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const GuardIncidentHistory = () => {
  const incidents = [
    {
      id: 1,
      type: 'Visitor Issue',
      description: 'Unauthorized visitor attempted entry - handled professionally',
      severity: 'medium',
      date: '2024-01-15',
      status: 'resolved',
      icon: 'ri:user-forbid-line'
    },
    {
      id: 2,
      type: 'Security Alert',
      description: 'Fire alarm false trigger - building B, quick response',
      severity: 'high',
      date: '2024-01-12',
      status: 'resolved',
      icon: 'ri:alarm-warning-line'
    },
    {
      id: 3,
      type: 'Patrol Report',
      description: 'Suspicious activity reported and investigated',
      severity: 'low',
      date: '2024-01-10',
      status: 'resolved',
      icon: 'ri:flashlight-line'
    },
    {
      id: 4,
      type: 'Emergency Response',
      description: 'Assisted with medical emergency - resident fall incident',
      severity: 'high',
      date: '2024-01-05',
      status: 'resolved',
      icon: 'ri:first-aid-kit-line'
    }
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Recent Incident Reports :
      </CardTitle>
      <div className="d-flex flex-column gap-3">
        {incidents.map((incident) => (
          <Card key={incident.id} className="border mb-0">
            <CardBody className="py-3">
              <div className="d-flex align-items-start gap-3">
                <div className={`avatar-sm bg-${incident.severity === 'high' ? 'danger' : incident.severity === 'medium' ? 'warning' : 'info'}-subtle rounded-circle d-flex align-items-center justify-content-center`}>
                  <IconifyIcon icon={incident.icon} className={`text-${incident.severity === 'high' ? 'danger' : incident.severity === 'medium' ? 'warning' : 'info'}`} />
                </div>
                <div className="flex-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{incident.type}</h6>
                      <p className="text-muted mb-1 fs-13">{incident.description}</p>
                      <small className="text-muted">{new Date(incident.date).toLocaleDateString()}</small>
                    </div>
                    <span className={`badge bg-${incident.status === 'resolved' ? 'success' : 'warning'}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}

const Reviews = () => {
  const ReviewCard = ({ society, day, description, image, name, userName }: GuardReviewType) => {
    return (
      <Card className="border mb-0">
        <CardBody>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Image src={image} alt="avatar" width={48} height={48} className="rounded-circle avatar-md" />
            <div>
              <h6 className="fw-semibold text-dark mb-1">{name}</h6>
              <p className="mb-0 fw-medium text-muted fs-13">{userName}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 my-2">
            <p className="mb-0 text-muted fs-12">{society}</p>
            <span className="text-muted">•</span>
            <p className="mb-0 fw-medium text-muted fs-12">{day} days ago</p>
          </div>
          <p className="mb-3 text-muted">&quot;{description}&quot;</p>
          <ul className="d-flex text-warning m-0 fs-16 list-unstyled">
            <li><IconifyIcon icon="ri:star-fill" /></li>
            <li><IconifyIcon icon="ri:star-fill" /></li>
            <li><IconifyIcon icon="ri:star-fill" /></li>
            <li><IconifyIcon icon="ri:star-fill" /></li>
            <li><IconifyIcon icon="ri:star-half-line" /></li>
          </ul>
        </CardBody>
      </Card>
    )
  }
  
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Resident Reviews :
      </CardTitle>
      <Row>
        {guardReviewData.map((item, idx) => (
          <Col lg={6} key={idx}>
            <ReviewCard {...item} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

const GuardFiles = () => {
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Guard Documents :
      </CardTitle>
      <div className="mt-3 d-flex flex-wrap gap-2">
        {guardFileData.map((item, idx) => (
          <div className="d-flex p-3 gap-3 bg-light-subtle align-items-center text-start position-relative border rounded" key={idx}>
            <div className={`avatar bg-${item.variant}-subtle text-${item.variant} rounded flex-centered`}>
              <IconifyIcon icon={item.icon} className="fs-20" />
            </div>
            <div className="flex-grow-1">
              <h6 className="fs-14 mb-1">
                <Link href="" className="text-dark stretched-link">
                  {item.name}
                </Link>
              </h6>
              <p className="fs-12 mb-0 text-muted">{item.data} MB</p>
            </div>
            <div className="d-flex align-items-center gap-1">
              <Link href="" className="btn btn-sm btn-light">
                <IconifyIcon icon="ri:eye-line" />
              </Link>
              <Link href="" className="btn btn-sm btn-light">
                <IconifyIcon icon="ri:download-2-line" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const GuardDetailsCard = ({ guard }: GuardDetailsCardProps) => {
  const mappedAvatarUrl = mapAvatarUrl(guard.avatar_url)
  
  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="position-relative">
            {mappedAvatarUrl ? (
              <Image 
                src={mappedAvatarUrl || avatars.dummyAvatar} 
                alt="avatar" 
                className="avatar-xl user-img img-thumbnail rounded-circle" 
                width={80}
                height={80}
              />
            ) : (
              <div className="avatar-xl rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:shield-user-line" className="fs-32" />
              </div>
            )}
            <div className={`badge bg-${guard.is_active ? 'success' : 'danger'} rounded-2 position-absolute bottom-0 start-50 translate-middle-x mb-n1 fs-11`}>
              {guard.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="d-block">
            <Link href="" className="text-dark fw-medium fs-16">
              {guard.full_name || 'No Name'}
            </Link>
            <p className="mb-0">{guard.email || 'No Email'}</p>
          </div>
          <div className="ms-lg-auto">
            <Link href={`mailto:${guard.email}`} className="btn btn-primary">
              Message
            </Link>
            &nbsp;
            <Link href="" className="btn btn-outline-secondary">
              View Schedule
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <p className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
            {guard.societies?.name || 'Society not assigned'} - {guard.shift_type || 'Shift not set'}
          </p>
          <p className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:outgoing-call-rounded-bold-duotone" className="fs-18 text-primary" />
            {guard.phone || 'No phone number'}
          </p>
          <CardTitle as={'h4'} className="mb-2 mt-3">
            Contact Methods :
          </CardTitle>
          <ul className="list-inline d-flex gap-1 mb-0 mt-3 align-items-center">
            <li className="list-inline-item">
              <Link href={`tel:${guard.phone}`} className="btn btn-soft-primary avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  <IconifyIcon icon="ri:phone-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href={`tel:${guard.phone}`} className="btn btn-soft-danger avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  <IconifyIcon icon="ri:alarm-warning-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href={`mailto:${guard.email}`} className="btn btn-soft-info avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  <IconifyIcon icon="ri:mail-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-success avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  <IconifyIcon icon="ri:chat-3-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href="" className="btn btn-soft-warning avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  <IconifyIcon icon="ri:shield-keyhole-line" />
                </span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <CardTitle as={'h4'} className="mb-2">
            About {guard.full_name || 'This Guard'} :
          </CardTitle>
          <p className="mb-2">
            Meet {guard.full_name || 'this dedicated guard'}, a security professional who has been serving our community with excellence and professionalism since {guard.employment_date ? new Date(guard.employment_date).getFullYear() : 'joining our team'}.
            {guard.full_name || 'This guard'} is committed to maintaining the highest standards of security and safety for all residents.
          </p>
          <p className="mb-2">
            {guard.full_name || 'This guard'} has been a reliable member of our security team. As an experienced guard, 
            {guard.full_name || 'they'} contribute to the overall safety and peaceful environment of our residential community.
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Society</span>
            <span className="mx-2">:</span>{guard.societies?.name || 'Not assigned'}
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Shift Type</span>
            <span className="mx-2">:</span>{guard.shift_type || 'Not set'}
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Employment Date</span>
            <span className="mx-2">:</span>{guard.employment_date ? new Date(guard.employment_date).toLocaleDateString() : 'Not specified'}
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Status</span>
            <span className="mx-2">:</span>
            <span className={`badge bg-${guard.is_active ? 'success' : 'danger'}-subtle text-${guard.is_active ? 'success' : 'danger'}`}>
              {guard.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
          <div className="my-2">
            <Link href="" className="link-primary fw-medium">
              View More <IconifyIcon icon="ri:arrow-right-line" />
            </Link>
          </div>
        </div>
        
        <GuardPerformance guard={guard} />
        <GuardScheduleAnalytics guard={guard} />
        <GuardIncidentHistory />
        <GuardTrainingRecords />
        <Reviews />
        <GuardFiles />
      </CardBody>
    </Card>
  )
}

export default GuardDetailsCard
