'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap'
import { propertyFileData, reviewData, ReviewType } from '../data'
import { ResidentProfile } from '@/assets/data/residents'
import { mapAvatarUrl } from '@/utils/avatarMapper'
import { avatars } from '@/assets/images/users'
import { useResidentActivityStats } from '@/hooks/useResidentActivities'

type ResidentDetailsCardProps = {
  resident: ResidentProfile
}

type ResidentStatCardProps = {
  count: number
  icon: string
  progress: number
  title: string
  variant: string
}

const ResidentStatCard = ({ count, icon, progress, title, variant }: ResidentStatCardProps) => {
  const ResidentDetailsOptions: ApexOptions = {
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
    labels: ['Progress'],
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
            <ReactApexChart options={ResidentDetailsOptions} series={ResidentDetailsOptions.series} height={90} type="radialBar" className="apex-charts mb-4" />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const PropertyStatus = ({ residentId }: { residentId: string }) => {
  const { data: stats, isLoading } = useResidentActivityStats(residentId)

  if (isLoading) {
    return (
      <div className="mt-4">
        <CardTitle as={'h4'} className="mb-3">
          Resident Activity :
        </CardTitle>
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  const activityData = [
    {
      icon: 'solar:home-bold',
      title: 'Total Requests',
      count: stats?.totalRequests || 0,
      progress: Math.min((stats?.totalRequests || 0) * 10, 100), // Scale for visual
      variant: '#02bc9c',
    },
    {
      icon: 'solar:wallet-money-bold',
      title: 'Payments Made',
      count: stats?.paymentsMade || 0,
      progress: stats?.totalRequests ? Math.round((stats.paymentsMade / stats.totalRequests) * 100) : 0,
      variant: '#e1360d',
    },
    {
      icon: 'solar:hand-money-bold',
      title: 'Active Services',
      count: stats?.activeServices || 0,
      progress: Math.min((stats?.activeServices || 0) * 20, 100), // Scale for visual
      variant: '#027ef4',
    },
  ]

  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Resident Activity :
      </CardTitle>
      <Row className="g-2">
        {activityData.map((item, idx) => (
          <Col xl={4} lg={6} key={idx}>
            <ResidentStatCard {...item} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

const Reviews = () => {
  const ReviewCard = ({ country, day, description, image, name, userName }: ReviewType) => {
    return (
      <Card className="bg-light-subtle mb-0">
        <CardBody>
          <div className="d-flex align-items-center gap-2">
            <Image src={image} alt="avatar" className="rounded-circle avatar-md" />
            <div>
              <h5 className="fw-semibold text-dark mb-1">{name}</h5>
              <p className="m-0">
                @{userName} <span className="ms-1">({country})</span>
              </p>
            </div>
          </div>
          <p className="my-3">&quot;{description}&quot;</p>
          <ul className="d-flex text-warning m-0 fs-18  list-unstyled">
            <li>
              <IconifyIcon icon="ri:star-fill" />
            </li>
            <li>
              <IconifyIcon icon="ri:star-fill" />
            </li>
            <li>
              <IconifyIcon icon="ri:star-fill" />
            </li>
            <li>
              <IconifyIcon icon="ri:star-fill" />
            </li>
            <li>
              <IconifyIcon icon="ri:star-half-line" />
            </li>
          </ul>
          <p className="fw-medium text-muted mb-0">{day} Days Ago</p>
        </CardBody>
      </Card>
    )
  }
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Community Feedback :
      </CardTitle>
      <Row>
        {reviewData.map((item, idx) => (
          <Col lg={6} key={idx}>
            <ReviewCard {...item} />
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
        Resident Documents :
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

const ResidentDetailsCard = ({ resident }: ResidentDetailsCardProps) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="position-relative">
            {resident.avatar_url ? (
              <Image 
                src={mapAvatarUrl(resident.avatar_url) || avatars.dummyAvatar} 
                alt="avatar" 
                className="avatar-xl user-img img-thumbnail rounded-circle" 
                width={80}
                height={80}
              />
            ) : (
              <div className="avatar-xl user-img img-thumbnail rounded-circle bg-light-subtle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:user-line" className="fs-32" />
              </div>
            )}
            <div className={`badge bg-${resident.is_active ? 'success' : 'danger'} rounded-2 position-absolute bottom-0 start-50 translate-middle-x mb-n1 fs-11`}>
              {resident.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="d-block">
            <Link href={`/residents/edit?id=${resident.id}`} className="text-dark fw-medium fs-16">
              {resident.full_name}
            </Link>
            <p className="mb-0">{resident.email}</p>
          </div>
          <div className="ms-lg-auto">
            <Link href={`/messages?resident=${resident.id}`} className="btn btn-primary">
              Message
            </Link>
            &nbsp;
            <Link href={`/residents/edit?id=${resident.id}`} className="btn btn-outline-secondary">
              Edit Profile
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <p className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-18 text-primary" />
            {resident.societies?.name || 'Society not available'} - Unit {resident.units?.block}-{resident.units?.number}
          </p>
          <p className="d-flex align-items-center gap-2">
            <IconifyIcon icon="solar:outgoing-call-rounded-bold-duotone" className="fs-18 text-primary" />
            {resident.phone || 'Phone not available'}
          </p>
          <CardTitle as={'h4'} className="mb-2 mt-3">
            Social Media :
          </CardTitle>
          <ul className="list-inline d-flex gap-1 mb-0 mt-3 align-items-center">
            <li className="list-inline-item">
              <Link href={`https://facebook.com/search/top?q=${encodeURIComponent(resident.full_name)}`} target="_blank" className="btn btn-soft-primary avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:facebook-fill" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href={`https://instagram.com/${resident.full_name.replace(/\s+/g, '').toLowerCase()}`} target="_blank" className="btn btn-soft-danger avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:instagram-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href={`https://twitter.com/search?q=${encodeURIComponent(resident.full_name)}`} target="_blank" className="btn btn-soft-info avatar-sm d-flex align-items-center justify-content-center  fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:twitter-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href={`https://wa.me/${resident.phone?.replace(/[^\d]/g, '')}`} target="_blank" className="btn btn-soft-success avatar-sm d-flex align-items-center justify-content-center fs-20">
                <span>
                  {' '}
                  <IconifyIcon icon="ri:whatsapp-line" />
                </span>
              </Link>
            </li>
            <li className="list-inline-item">
              <Link href={`mailto:${resident.email}`} className="btn btn-soft-warning avatar-sm d-flex align-items-center justify-content-center fs-20">
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
            About {resident.full_name} :
          </CardTitle>
          <p className="mb-2">
            Meet {resident.full_name}, a valued resident of our community who has been an active member since {resident.created_at ? new Date(resident.created_at).getFullYear() : 'joining'}.
            {resident.full_name} is committed to making the community experience smooth and harmonious.
          </p>
          <p className="mb-2">
            {resident.full_name} has been a prominent member of our residential community. As an active resident, 
            {resident.full_name} contributes to the overall well-being and positive atmosphere of our society.
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Society</span>
            <span className="mx-2">:</span>{resident.societies?.name || 'Not specified'}
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Unit Number</span>
            <span className="mx-2">:</span>{resident.units?.block}-{resident.units?.number}
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Resident ID</span>
            <span className="mx-2">:</span>{resident.id}
          </p>
          <p className="mb-2">
            <span className="fw-medium text-dark">Status</span>
            <span className="mx-2">:</span>
            <span className={`badge bg-${resident.is_active ? 'success' : 'danger'}-subtle text-${resident.is_active ? 'success' : 'danger'} py-1 px-2 fs-13`}>
              {resident.is_active ? 'Active' : 'Inactive'}
            </span>
          </p>
          <div className="my-2">
            <Link href={`/residents/edit?id=${resident.id}`} className="link-primary fw-medium">
              Edit Profile <IconifyIcon icon="ri:arrow-right-line" />
            </Link>
          </div>
        </div>
        <PropertyStatus residentId={resident.id} />
        <Reviews />
        <PropertyFile />
      </CardBody>
    </Card>
  )
}

export default ResidentDetailsCard
