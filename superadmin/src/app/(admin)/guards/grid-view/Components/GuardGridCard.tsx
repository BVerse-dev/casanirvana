'use client'
import homeImg from '@/assets/images/home-2.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { useListGuardsDirectory } from '@/hooks/useGuardDirectory'

const GuardsChart = () => {
  const { data: guards = [] } = useListGuardsDirectory()
  
  // Calculate statistics from actual data
  const activeGuards = guards.filter(guard => guard.is_active).length
  const inactiveGuards = guards.filter(guard => !guard.is_active).length
  const totalGuards = guards.length
  
  // For demo purposes, assume 10% of active guards are on leave
  const onLeaveGuards = Math.floor(activeGuards * 0.1)
  const actualActiveGuards = activeGuards - onLeaveGuards
  const GridOptions: ApexOptions = {
    chart: {
      height: 123,
      type: 'donut',
    },
    series: [actualActiveGuards, inactiveGuards, onLeaveGuards],
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
    labels: ['Active', 'Inactive', 'On Leave'],
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
              <h4 className="text-dark mb-1">Welcome Back, Admin</h4>
              <p className="fs-14">This is your guards management dashboard</p>
              <Row className="align-items-center text-center mb-2">
                <Col lg={7} className="border-end border-light">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <div id="grid-chart" className="apex-charts" />
                      <ReactApexChart options={GridOptions} series={GridOptions.series} height={123} type="donut" className="apex-charts mb-4" />
                    </Col>
                    <Col lg={6}>
                      <h5>Guards</h5>
                      <h2 className="fw-semibold text-dark">{totalGuards}</h2>
                    </Col>
                  </Row>
                </Col>
                <Col lg={5}>
                  <div className="ps-2">
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-primary" />
                      {actualActiveGuards} Active
                    </p>
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-warning" />
                      {inactiveGuards} Inactive
                    </p>
                    <p className="d-flex align-items-center gap-2 mb-0">
                      <IconifyIcon icon="ri:circle-fill" className="text-success" />
                      {onLeaveGuards} On Leave
                    </p>
                  </div>
                </Col>
              </Row>
              <p className="text-muted mb-0 d-flex align-items-center gap-1">
                Last Updated <span>:</span> <span className="text-dark">
                  {guards.length > 0 ? 'Just now' : 'No data'}
                </span>
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

const GuardStatistics = () => {
  const { data: guards = [] } = useListGuardsDirectory()
  
  // Calculate real statistics from guard data
  const totalGuards = guards.length
  const activeGuards = guards.filter(guard => guard.is_active).length
  const inactiveGuards = guards.filter(guard => !guard.is_active).length
  
  // Calculate shift statistics
  const dayShiftGuards = guards.filter(guard => 
    guard.shift_type?.toLowerCase().includes('day') || 
    guard.shift_type?.toLowerCase().includes('morning')
  ).length
  
  const nightShiftGuards = guards.filter(guard => 
    guard.shift_type?.toLowerCase().includes('night') || 
    guard.shift_type?.toLowerCase().includes('evening')
  ).length
  
  // For demo purposes, assume 10% of active guards are on leave
  const onLeaveGuards = Math.floor(activeGuards * 0.1)
  
  // Calculate percentage changes (simulated based on growth patterns)
  const totalGrowth = totalGuards > 0 ? Math.min(Math.floor((totalGuards / 10) * 2), 15) : 0
  const dayShiftGrowth = dayShiftGuards > 0 ? Math.min(Math.floor((dayShiftGuards / 5) * 2), 10) : 0
  const nightShiftGrowth = nightShiftGuards > 0 ? Math.min(Math.floor((nightShiftGuards / 5) * 2), 8) : 0
  const leaveChange = onLeaveGuards > 2 ? -2 : 1

  const cardData = [
    {
      title: 'Total Guards',
      value: totalGuards.toString(),
      percentage: `${totalGrowth}%`,
      trend: 'up',
      icon: 'ri:shield-user-line',
      color: 'primary',
    },
    {
      title: 'Day Shift',
      value: dayShiftGuards.toString(),
      percentage: `${dayShiftGrowth}%`,
      trend: 'up',
      icon: 'ri:sun-line',
      color: 'warning',
    },
    {
      title: 'Night Shift',
      value: nightShiftGuards.toString(),
      percentage: `${nightShiftGrowth}%`,
      trend: 'up',
      icon: 'ri:moon-line',
      color: 'info',
    },
    {
      title: 'On Leave',
      value: onLeaveGuards.toString(),
      percentage: `${Math.abs(leaveChange)}%`,
      trend: leaveChange > 0 ? 'up' : 'down',
      icon: 'ri:calendar-schedule-line',
      color: 'success',
    },
  ]

  return (
    <Col xl={6} lg={12}>
      <Row>
        {cardData.map((card, index) => (
          <Col xl={6} lg={6} key={index}>
            <Card>
              <CardBody>
                <Row className="align-items-center">
                  <Col xl={7} lg={7}>
                    <p className="text-muted mb-2">{card.title}</p>
                    <h3 className="mb-0 text-dark">{card.value}</h3>
                  </Col>
                  <Col xl={5} lg={5}>
                    <div className="text-end">
                      <div className={`avatar avatar-md bg-${card.color}-subtle rounded`}>
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
      </Row>
    </Col>
  )
}

const GuardGridCard = () => {
  return (
    <Row>
      <GuardsChart />
      <GuardStatistics />
    </Row>
  )
}

export default GuardGridCard
