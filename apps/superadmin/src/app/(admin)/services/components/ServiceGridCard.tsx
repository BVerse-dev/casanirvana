'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { useListServices } from '@/hooks/useServices'

const ServicesChart = () => {
  const { data: services = [] } = useListServices()
  
  // Calculate real service statistics
  const activeServices = services.filter(service => service.is_active).length
  const inactiveServices = services.filter(service => !service.is_active).length
  const totalServices = services.length

  const GridOptions: ApexOptions = {
    chart: {
      height: 123,
      type: 'donut',
    },
    series: [activeServices, inactiveServices], // Real data from Supabase
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: false,
            total: {
              showAlways: true,
              show: true,
            },
          },
        },
      },
    },
    labels: ['Active', 'Inactive'],
    colors: ['#027ef4', '#f0934e'],
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  }
  return (
    <Col xl={6} lg={12}>
      <Card>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={7}>
              <h4 className="text-dark mb-1">Welcome Back, Admin</h4>
              <p className="fs-14">This is your services management dashboard</p>
              <Row className="align-items-center text-center mb-2">
                <Col lg={7} className="border-end border-light">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <div id="grid-chart" className="apex-charts" />
                      <ReactApexChart options={GridOptions} series={GridOptions.series} height={123} type="donut" className="apex-charts mb-4" />
                    </Col>
                    <Col lg={6}>
                      <h5>Services</h5>
                      <h2 className="fw-semibold text-dark">{totalServices}</h2>
                    </Col>
                  </Row>
                </Col>
                <Col lg={5}>
                  <div className="ps-2">
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-primary" />
                      {activeServices} Active
                    </p>
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-warning" />
                      {inactiveServices} Inactive
                    </p>
                    <p className="d-flex align-items-center gap-2 mb-0 text-muted fs-13">
                      <IconifyIcon icon="ri:circle-fill" className="text-success" />
                      All synced with Supabase
                    </p>
                  </div>
                </Col>
              </Row>
              <p className="text-muted mb-0 d-flex align-items-center gap-1">
                Last Updated <span>:</span> <span className="text-dark">4 day ago</span>
              </p>
            </Col>
            <Col lg={5} className="text-end">
              <div className="text-center">
                <IconifyIcon icon="solar:settings-bold-duotone" className="fs-48 text-primary mb-2" />
                <h6 className="text-muted">Service Management</h6>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  )
}

const DevelopmentTask = () => {
  const { data: services = [] } = useListServices()
  
  // Calculate service statistics
  const totalServices = services.length
  const categories = [...new Set(services.map(service => service.category).filter(Boolean))].length
  const recentServices = services.filter(service => {
    if (!service.created_at) return false
    const createdDate = new Date(service.created_at)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return createdDate >= monthAgo
  }).length

  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex align-items-center border-bottom border-dashed">
          <CardTitle as={'h4'} className="mb-0">
            Service Categories
          </CardTitle>
          <div className="ms-auto">
            <Dropdown>
              <DropdownToggle as={'a'} className="drop-arrow-none card-drop p-0 " data-bs-toggle="dropdown" aria-expanded="false">
                <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>Download</DropdownItem>
                <DropdownItem>Share</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={5}>
              <h5 className="text-dark fw-medium mb-1">{totalServices}</h5>
              <p className="text-muted mb-0">Total services </p>
            </Col>
            <Col lg={4} xs={3} className="text-center">
              <h5 className="text-dark fw-medium mb-1">{categories}</h5>
              <p className="text-muted mb-0">Categories</p>
            </Col>
            <Col xl={3} xs={3} className="text-end">
              <h5 className="text-dark fw-medium mb-1">{recentServices}</h5>
              <p className="text-muted mb-0">New</p>
            </Col>
          </Row>
          <div className="progress progress-lg bg-light-subtle rounded-0 gap-1 overflow-visible mt-2" style={{ height: 10 }}>
            <div className="progress-bar bg-primary rounded-pill" role="progressbar" style={{ width: '40%' }}></div>
            <div className="progress-bar bg-warning rounded-pill" role="progressbar" style={{ width: '30%' }}></div>
            <div className="progress-bar bg-info rounded-pill" role="progressbar" style={{ width: '30%' }}></div>
          </div>
          <p className="mb-0 mt-3">
            <span className="text-success fw-medium mb-0">
              <IconifyIcon icon="ri:arrow-up-line" />
              24.2%
            </span>{' '}
            vs last month
          </p>
        </CardBody>
        <CardFooter className="d-flex justify-content-between  py-2">
          <p className="text-muted mb-0 d-flex align-items-center gap-1">
            Last Updated <span>:</span> <span className="text-dark">12 hour ago</span>
          </p>
          <Link href="" className="link-primary fw-medium">
            View More
          </Link>
        </CardFooter>
      </Card>
    </Col>
  )
}

const ActiveServices = () => {
  const { data: services = [] } = useListServices()
  const activeServiceCount = services.filter(service => service.is_active).length

  const ActiveServicesOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 115,
      sparkline: {
        enabled: true,
      },
    },
    series: [
      {
        data: [15, 25, 30, 22, 35, 18, 28, 20, 32, 24, 29],
      },
    ],
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    markers: {
      size: 0,
    },
    colors: ['#ffffff'],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName) {
            return ''
          },
        },
      },
      marker: {
        show: false,
      },
    },
  }
  return (
    <Col xl={3} lg={6}>
      <Card className="bg-primary bg-gradient">
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <CardTitle as={'h4'} className="mb-2 text-white">
                Total Active Services{' '}
              </CardTitle>
              <p className="text-white fw-medium fs-24 mb-0">{activeServiceCount}</p>
            </div>
            <div>
              <div className="avatar-md bg-light rounded flex-centered">
                <IconifyIcon icon="ri:service-line" width={32} height={32} className="fs-32 text-primary" />
              </div>
            </div>
          </div>
          <div id="active_services" data-colors="#ffffff" className="apex-charts" />
          <ReactApexChart options={ActiveServicesOptions} series={ActiveServicesOptions.series} height={115} type="line" className="apex-charts" />
        </CardBody>
      </Card>
    </Col>
  )
}

const ServiceGridCard = () => {
  return (
    <Row>
      <ServicesChart />
      <DevelopmentTask />
      <ActiveServices />
    </Row>
  )
}

export default ServiceGridCard
