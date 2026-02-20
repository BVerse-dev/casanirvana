'use client'
import homeImg from '@/assets/images/home-2.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListMaintenanceRequests } from '@/hooks/useMaintenanceRequests'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'

const MaintenanceOverviewChart = () => {
  const { data: maintenanceRequests = [] } = useListMaintenanceRequests()
  // Calculate maintenance request statistics
  const totalRequests = maintenanceRequests.length
  const completedRequests = maintenanceRequests.filter(r => r.status === 'completed').length
  const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
  
  // Calculate pending requests
  const pendingRequests = maintenanceRequests.filter(r => ['pending', 'in_progress'].includes(r.status)).length

  return (
    <Col xl={6} lg={12}>
      <Card className="bg-gradient-primary text-white border-0 overflow-hidden position-relative">
        <CardBody className="p-4">
          {/* Background decorative element */}
          <div className="position-absolute top-0 end-0 mt-n4 me-n4">
            <IconifyIcon 
              icon="ri:tools-line" 
              className="text-white-50 opacity-25" 
              style={{ fontSize: '120px' }}
            />
          </div>
          
          <div className="position-relative">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="text-white mb-0">Maintenance Overview</h5>
              <IconifyIcon icon="ri:settings-3-line" className="text-white fs-20" />
            </div>
            
            <div className="mb-3">
              <h2 className="text-white fw-bold mb-1">
                {completedRequests.toLocaleString()}
              </h2>
              <p className="text-white-50 mb-0 fs-14">
                of {totalRequests.toLocaleString()} total requests completed
              </p>
            </div>

            {/* Progress bar for completion rate */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-75 fs-13">Completion Rate</span>
                <span className="text-white fw-medium fs-13">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div className="bg-white bg-opacity-25 rounded" style={{ height: '6px' }}>
                <div 
                  className="bg-white rounded h-100 transition-all"
                  style={{ 
                    width: `${Math.min(completionRate, 100)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Pending requests indicator */}
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon 
                  icon={pendingRequests > 0 ? "ri:time-line" : "ri:check-line"} 
                  className={`fs-16 ${pendingRequests > 0 ? 'text-warning' : 'text-success'}`}
                />
                <span className="text-white-75 fs-13">Pending Requests</span>
              </div>
              <span className="text-white fw-medium">
                {pendingRequests.toLocaleString()}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

const RequestTypeStatistics = () => {
  const { data: maintenanceRequests = [] } = useListMaintenanceRequests()
  
  // Calculate request type statistics
  const hvacRequests = maintenanceRequests.filter(r => r.request_type === 'HVAC').length
  const plumbingRequests = maintenanceRequests.filter(r => r.request_type === 'Plumbing').length
  const electricalRequests = maintenanceRequests.filter(r => r.request_type === 'Electrical').length
  const generalRequests = maintenanceRequests.filter(r => ['General Repair', 'Maintenance', 'Installation', 'Renovation'].includes(r.request_type || '')).length
  
  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex align-items-center border-bottom border-dashed">
          <CardTitle as={'h4'} className="mb-0">
            Request Types
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
              <h5 className="text-dark fw-medium mb-1">{hvacRequests}</h5>
              <p className="text-muted mb-0">HVAC</p>
            </Col>
            <Col lg={4} xs={3} className="text-center">
              <h5 className="text-dark fw-medium mb-1">{plumbingRequests}</h5>
              <p className="text-muted mb-0">Plumbing</p>
            </Col>
            <Col xl={3} xs={3} className="text-end">
              <h5 className="text-dark fw-medium mb-1">{electricalRequests}</h5>
              <p className="text-muted mb-0">Electrical</p>
            </Col>
          </Row>
          <div className="progress progress-lg bg-light-subtle rounded-0 gap-1 overflow-visible mt-2" style={{ height: 10 }}>
            <div 
              className="progress-bar bg-primary rounded-pill" 
              role="progressbar" 
              style={{ width: `${maintenanceRequests.length > 0 ? (hvacRequests / maintenanceRequests.length) * 100 : 0}%` }}
            ></div>
            <div 
              className="progress-bar bg-warning rounded-pill" 
              role="progressbar" 
              style={{ width: `${maintenanceRequests.length > 0 ? (plumbingRequests / maintenanceRequests.length) * 100 : 0}%` }}
            ></div>
            <div 
              className="progress-bar bg-info rounded-pill" 
              role="progressbar" 
              style={{ width: `${maintenanceRequests.length > 0 ? (electricalRequests / maintenanceRequests.length) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="mb-0 mt-3">
            <span className="text-success fw-medium mb-0">
              <IconifyIcon icon="ri:arrow-up-line" />
              {generalRequests > 0 ? `${Math.round((generalRequests / maintenanceRequests.length) * 100)}%` : '0%'}
            </span>{' '}
            Other Types
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

const MaintenanceTrendChart = () => {
  const { data: maintenanceRequests = [] } = useListMaintenanceRequests()
  
  // Calculate high priority requests
  const highPriorityRequests = maintenanceRequests.filter(r => r.priority === 'high').length
  
  const MaintenanceTrendOptions: ApexOptions = {
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
                High Priority Requests{' '}
              </CardTitle>
              <p className="text-white fw-medium fs-24 mb-0">{highPriorityRequests}</p>
            </div>
            <div>
              <div className="avatar-md bg-light rounded flex-centered">
                <IconifyIcon icon="ri:alarm-warning-line" width={32} height={32} className="fs-32 text-primary" />
              </div>
            </div>
          </div>
          <div id="maintenance_trend" data-colors="#ffffff" className="apex-charts" />
          <ReactApexChart options={MaintenanceTrendOptions} series={MaintenanceTrendOptions.series} height={115} type="line" className="apex-charts" />
        </CardBody>
      </Card>
    </Col>
  )
}

const MaintenanceMetrics = () => {
  const { data: maintenanceRequests = [] } = useListMaintenanceRequests()
  
  // Calculate various metrics
  const totalCost = maintenanceRequests.reduce((sum, request) => {
    return sum + (request.estimated_cost || 0)
  }, 0)
  
  const avgResolutionTime = '3.2' // Mock data for average resolution time in days
  const customerSatisfaction = '4.7' // Mock customer satisfaction rating
  
  const cardData = [
    {
      title: 'Total Cost',
      value: `$${totalCost.toLocaleString()}`,
      percentage: '15%',
      trend: 'up',
      icon: 'ri:money-dollar-circle-line',
      color: 'success',
    },
    {
      title: 'Avg Resolution',
      value: `${avgResolutionTime} days`,
      percentage: '8%',
      trend: 'down',
      icon: 'ri:time-line',
      color: 'warning',
    },
    {
      title: 'Customer Rating',
      value: `${customerSatisfaction}/5.0`,
      percentage: '12%',
      trend: 'up',
      icon: 'ri:star-line',
      color: 'info',
    },
    {
      title: 'Urgent Requests',
      value: maintenanceRequests.filter(r => r.priority === 'high').length.toString(),
      percentage: '5%',
      trend: 'down',
      icon: 'ri:error-warning-line',
      color: 'danger',
    },
  ]

  return (
     <>
       {cardData.map((card, index) => (
         <Col xl={3} lg={6} key={index}>
           <Card>
             <CardBody>
               <Row className="align-items-center">
                 <Col xl={7} lg={7}>
                   <p className="text-muted mb-2">{card.title}</p>
                   <h3 className="mb-0 text-dark">{card.value}</h3>
                 </Col>
                 <Col xl={5} lg={5}>
                   <div className="text-end">
                     <div className={`avatar avatar-md bg-${card.color}-subtle rounded d-flex align-items-center justify-content-center`}>
                       <IconifyIcon icon={card.icon} className={`fs-20 text-${card.color}`} />
                     </div>
                     <p className={`mb-0 mt-2 text-${card.trend === 'up' ? 'success' : 'danger'}`}>
                       <IconifyIcon icon={`ri:arrow-${card.trend === 'up' ? 'up' : 'down'}-line`} className="me-1" />
                       {card.percentage}
                     </p>
                   </div>
                 </Col>
               </Row>
             </CardBody>
           </Card>
         </Col>
       ))}
     </>
  )
}


const MaintenanceRequestGridCard = () => {
  return (
    <Row>
      <MaintenanceOverviewChart />
      <RequestTypeStatistics />
      <MaintenanceTrendChart />
      <MaintenanceMetrics />
    </Row>
  )
}

export default MaintenanceRequestGridCard
