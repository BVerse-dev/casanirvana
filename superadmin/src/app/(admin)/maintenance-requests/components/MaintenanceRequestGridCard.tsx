'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListMaintenanceRequests } from '@/hooks/useMaintenanceRequests'
import { ApexOptions } from 'apexcharts'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const formatMoney = (value?: number | null) => {
  const amount = Number(value || 0)
  return `GH₵${amount.toLocaleString()}`
}

const toRequestTypeKey = (value?: string | null) => (value || '').trim().toLowerCase()

const isUrgentPriority = (value?: string | null) => ['high', 'urgent'].includes((value || '').toLowerCase())

const getResolvedTimestamp = (request: { completed_at?: string | null; resolved_at?: string | null }) =>
  request.completed_at || request.resolved_at || null

const getAverageResolutionDays = (maintenanceRequests: Array<{ created_at?: string | null; completed_at?: string | null; resolved_at?: string | null }>) => {
  const resolvedDurations = maintenanceRequests
    .map((request) => {
      const startedAt = request.created_at ? new Date(request.created_at).getTime() : null
      const endedAt = getResolvedTimestamp(request) ? new Date(getResolvedTimestamp(request) as string).getTime() : null
      if (!startedAt || !endedAt || Number.isNaN(startedAt) || Number.isNaN(endedAt) || endedAt < startedAt) {
        return null
      }
      return (endedAt - startedAt) / (1000 * 60 * 60 * 24)
    })
    .filter((value): value is number => value !== null)

  if (!resolvedDurations.length) return null
  const average = resolvedDurations.reduce((sum, value) => sum + value, 0) / resolvedDurations.length
  return average
}

const buildMonthlyTrend = (maintenanceRequests: Array<{ created_at?: string | null }>) => {
  const labels: string[] = []
  const values: number[] = []
  const now = new Date()

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const label = date.toLocaleDateString('en-US', { month: 'short' })
    labels.push(label)

    const count = maintenanceRequests.filter((request) => {
      if (!request.created_at) return false
      const createdAt = new Date(request.created_at)
      return (
        createdAt.getFullYear() === date.getFullYear() &&
        createdAt.getMonth() === date.getMonth()
      )
    }).length

    values.push(count)
  }

  return { labels, values }
}

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

  const hvacRequests = maintenanceRequests.filter(r => toRequestTypeKey(r.request_type) === 'hvac').length
  const plumbingRequests = maintenanceRequests.filter(r => toRequestTypeKey(r.request_type) === 'plumbing').length
  const electricalRequests = maintenanceRequests.filter(r => toRequestTypeKey(r.request_type) === 'electrical').length
  const otherRequests = Math.max(maintenanceRequests.length - hvacRequests - plumbingRequests - electricalRequests, 0)
  const latestUpdatedAt = maintenanceRequests
    .map((request) => request.updated_at || request.created_at)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]
  
  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex align-items-center border-bottom border-dashed">
          <CardTitle as={'h4'} className="mb-0">
            Request Types
          </CardTitle>
          <span className="ms-auto badge bg-light-subtle text-muted border">
            {maintenanceRequests.length.toLocaleString()} total
          </span>
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
            <span className="text-dark fw-medium mb-0">
              {otherRequests.toLocaleString()}
            </span>{' '}
            Other Request Types
          </p>
        </CardBody>
        <CardFooter className="d-flex justify-content-between  py-2">
          <p className="text-muted mb-0 d-flex align-items-center gap-1">
            Last Updated <span>:</span>{' '}
            <span className="text-dark">
              {latestUpdatedAt ? new Date(latestUpdatedAt).toLocaleDateString() : 'No updates yet'}
            </span>
          </p>
          <Link href="/maintenance-requests" className="link-primary fw-medium">
            View More
          </Link>
        </CardFooter>
      </Card>
    </Col>
  )
}

const MaintenanceTrendChart = () => {
  const { data: maintenanceRequests = [] } = useListMaintenanceRequests()
  const highPriorityRequests = maintenanceRequests.filter(r => isUrgentPriority(r.priority)).length
  const monthlyTrend = buildMonthlyTrend(maintenanceRequests)
  
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
        data: monthlyTrend.values,
      },
    ],
    xaxis: {
      categories: monthlyTrend.labels,
      labels: {
        show: false,
      },
    },
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
                Urgent Requests
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
          <p className="text-white-50 fs-13 mb-0 mt-2">Six-month request volume trend</p>
        </CardBody>
      </Card>
    </Col>
  )
}

const MaintenanceMetrics = () => {
  const { data: maintenanceRequests = [] } = useListMaintenanceRequests()
  
  const totalCost = maintenanceRequests.reduce((sum, request) => {
    return sum + (request.estimated_cost || 0)
  }, 0)
  const averageResolutionDays = getAverageResolutionDays(maintenanceRequests)
  const now = new Date()
  const completedThisMonth = maintenanceRequests.filter((request) => {
    const resolvedTimestamp = getResolvedTimestamp(request)
    if (!resolvedTimestamp) return false
    const resolvedAt = new Date(resolvedTimestamp)
    return resolvedAt.getFullYear() === now.getFullYear() && resolvedAt.getMonth() === now.getMonth()
  }).length
  const activeRequests = maintenanceRequests.filter((request) => ['pending', 'in_progress'].includes(request.status)).length
  
  const cardData = [
    {
      title: 'Total Cost',
      value: formatMoney(totalCost),
      subtitle: `${maintenanceRequests.filter((request) => request.estimated_cost).length} requests with estimates`,
      icon: 'ri:money-dollar-circle-line',
      color: 'success',
    },
    {
      title: 'Avg Resolution',
      value: averageResolutionDays === null ? 'N/A' : `${averageResolutionDays.toFixed(1)} days`,
      subtitle: averageResolutionDays === null ? 'No resolved requests yet' : 'Based on resolved request history',
      icon: 'ri:time-line',
      color: 'warning',
    },
    {
      title: 'Resolved This Month',
      value: completedThisMonth.toString(),
      subtitle: 'Requests closed in the current month',
      icon: 'ri:checkbox-circle-line',
      color: 'info',
    },
    {
      title: 'Active Requests',
      value: activeRequests.toString(),
      subtitle: 'Pending or in-progress requests',
      icon: 'ri:loader-4-line',
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
                     <p className="mb-0 mt-2 text-muted fs-12">
                       {card.subtitle}
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
