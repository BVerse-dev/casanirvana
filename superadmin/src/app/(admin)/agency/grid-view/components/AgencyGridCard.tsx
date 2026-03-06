'use client'
import homeImg from '@/assets/images/home-2.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from '@/components/ReactBootstrap'
import { useListAgenciesDirectory } from '@/hooks/useAgencyDirectory'

// Dynamically import ReactApexChart to prevent SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="d-flex justify-content-center p-4"><div className="spinner-border spinner-border-sm" role="status"></div></div>
})

const AgenciesChart = ({ agencies, isLoading, error, refetch }: {
  agencies: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}) => {
  // Calculate real community statistics
  const totalSocieties = agencies.reduce((total, agency) => total + (agency.managed_societies || 0), 0);

  // Handle force refresh
  const handleRefresh = () => {
    refetch();
  };
  const activeSocieties = Math.floor(totalSocieties * 0.85); // 85% active
  const pendingSocieties = Math.floor(totalSocieties * 0.10); // 10% pending  
  const inactiveSocieties = totalSocieties - activeSocieties - pendingSocieties; // remainder inactive

  const GridOptions: ApexOptions = {
    chart: {
      height: 123,
      type: 'donut',
    },
    series: [activeSocieties, pendingSocieties, inactiveSocieties],
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
    labels: ['Active', 'Pending', 'Inactive'],
    colors: ['#027ef4', '#f0934e', '#47ad94'],
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
              <h4 className="text-dark mb-1">Welcome Back , Gaston</h4>
              <p className="fs-14">This is your communities portfolio report</p>
              <Row className="align-items-center text-center mb-2">
                <Col lg={7} className="border-end border-light">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <ReactApexChart 
                        options={GridOptions} 
                        series={GridOptions.series} 
                        height={123} 
                        type="donut" 
                        className="apex-charts mb-0" 
                      />
                    </Col>
                    <Col lg={6}>
                      <h5>Communities</h5>
                      <h2 className="fw-semibold text-dark">{totalSocieties}</h2>
                    </Col>
                  </Row>
                </Col>
                <Col lg={5}>
                  <div className="ps-2">
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-primary" />
                      {activeSocieties} Active
                    </p>
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-warning" />
                      {pendingSocieties} Pending
                    </p>
                    <p className="d-flex align-items-center gap-2 mb-0">
                      <IconifyIcon icon="ri:circle-fill" className="text-success" />
                      {inactiveSocieties} Inactive
                    </p>
                  </div>
                </Col>
              </Row>
              <p className="text-muted mb-0 d-flex align-items-center gap-1">
                Last Updated <span>:</span> <span className="text-dark">4 day ago</span>
              </p>
            </Col>
            <Col lg={5} className="text-end">
              <Image src={homeImg} alt="home" className="img-fluid" />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  )
}

const DevelopmentTask = ({ agencies }: { agencies: any[] }) => {
  // Calculate totals
  const totalSocieties = agencies.reduce((total, agency) => total + (agency.managed_societies || 0), 0);
  const pendingSocieties = Math.floor(totalSocieties * 0.12); // Assuming 12% are pending
  const daysLeft = 4; // Sample value

  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex align-items-center border-bottom border-dashed">
          <CardTitle as={'h4'} className="mb-0">
            Development Task
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
              <h5 className="text-dark fw-medium mb-1">{totalSocieties}</h5>
              <p className="text-muted mb-0">Total communities </p>
            </Col>
            <Col lg={4} xs={3} className="text-center">
              <h5 className="text-dark fw-medium mb-1">{pendingSocieties}</h5>
              <p className="text-muted mb-0">Pending</p>
            </Col>
            <Col xl={3} xs={3} className="text-end">
              <h5 className="text-dark fw-medium mb-1">{daysLeft}</h5>
              <p className="text-muted mb-0">Day Left</p>
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
              34.4%
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

const SealProperties = ({ agencies }: { agencies: any[] }) => {
  // Calculate the number of active agencies
  const activeAgenciesCount = agencies.filter(agency => agency.is_active).length;

  const SealPropertiesOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 115,
      sparkline: {
        enabled: true,
      },
    },
    series: [
      {
        data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54],
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
                Total Active Agencies{' '}
              </CardTitle>
              <p className="text-white fw-medium fs-24 mb-0">{activeAgenciesCount}</p>
            </div>
            <div>
              <div className="avatar-md bg-light rounded flex-centered">
                <IconifyIcon icon="ri:building-4-line" width={32} height={32} className="fs-32 text-primary" />
              </div>
            </div>
          </div>
          <div id="seal_properties" data-colors="#ffffff" className="apex-charts" />
          <ReactApexChart options={SealPropertiesOptions} series={SealPropertiesOptions.series} height={115} type="line" className="apex-charts" />
        </CardBody>
      </Card>
    </Col>
  )
}

const AgencyGridCard = () => {
  // Fetch agencies data once and pass it down to child components
  const { data: agencies = [], isLoading, error, refetch } = useListAgenciesDirectory();
  
  return (
    <Row>
      <AgenciesChart agencies={agencies} isLoading={isLoading} error={error} refetch={refetch} />
      <DevelopmentTask agencies={agencies} />
      <SealProperties agencies={agencies} />
    </Row>
  )
}

export default AgencyGridCard
