'use client'

import homeImg from '@/assets/images/home-2.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { GuardDirectoryItem } from '@/hooks/useGuardDirectory'
import type { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Row } from 'react-bootstrap'

const toGuardStatus = (guard: GuardDirectoryItem) => {
  if (guard.assignment_status === 'awaiting_assignment') return 'awaiting_assignment'
  if (guard.is_active === false || guard.assignment_status === 'inactive') return 'inactive'
  return 'assigned'
}

const formatDateLabel = (value?: string | null) => {
  if (!value) return 'No provisioning date'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'No provisioning date'
    : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

type GuardGridCardProps = {
  guards: GuardDirectoryItem[]
}

const GuardsChart = ({ guards }: GuardGridCardProps) => {
  const assignedGuards = guards.filter((guard) => toGuardStatus(guard) === 'assigned').length
  const awaitingAssignment = guards.filter((guard) => toGuardStatus(guard) === 'awaiting_assignment').length
  const inactiveGuards = guards.filter((guard) => toGuardStatus(guard) === 'inactive').length
  const totalGuards = guards.length
  const latestProvisionedAt = guards
    .map((guard) => guard.created_at || guard.employment_date)
    .filter(Boolean)
    .sort()
    .at(-1)

  const chartOptions: ApexOptions = {
    chart: {
      height: 123,
      type: 'donut',
    },
    series: [assignedGuards, awaitingAssignment, inactiveGuards],
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
          },
        },
      },
    },
    labels: ['Assigned', 'Awaiting Assignment', 'Inactive'],
    colors: ['#027ef4', '#47ad94', '#f0934e'],
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
                      <ReactApexChart
                        options={chartOptions}
                        series={chartOptions.series}
                        height={123}
                        type="donut"
                        className="apex-charts mb-4"
                      />
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
                      {assignedGuards} Assigned
                    </p>
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-success" />
                      {awaitingAssignment} Awaiting Assignment
                    </p>
                    <p className="d-flex align-items-center gap-2 mb-0">
                      <IconifyIcon icon="ri:circle-fill" className="text-warning" />
                      {inactiveGuards} Inactive
                    </p>
                  </div>
                </Col>
              </Row>
              <p className="text-muted mb-0 d-flex align-items-center gap-1">
                Latest provisioning activity <span>:</span>{' '}
                <span className="text-dark">{formatDateLabel(latestProvisionedAt)}</span>
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

const GuardStatistics = ({ guards }: GuardGridCardProps) => {
  const totalGuards = guards.length
  const dayShiftGuards = guards.filter((guard) => (guard.active_assignment_shift_type || guard.shift_type || '').toLowerCase().match(/day|morning/)).length
  const nightShiftGuards = guards.filter((guard) => (guard.active_assignment_shift_type || guard.shift_type || '').toLowerCase().match(/night|evening/)).length
  const awaitingAssignment = guards.filter((guard) => guard.assignment_status === 'awaiting_assignment').length
  const percentOfTotal = (value: number) => totalGuards > 0 ? `${Math.round((value / totalGuards) * 100)}%` : '0%'

  const cardData = [
    {
      title: 'Total Guards',
      value: totalGuards.toString(),
      percentage: totalGuards > 0 ? '100%' : '0%',
      icon: 'ri:shield-user-line',
      color: 'primary',
    },
    {
      title: 'Day Shift',
      value: dayShiftGuards.toString(),
      percentage: percentOfTotal(dayShiftGuards),
      icon: 'ri:sun-line',
      color: 'warning',
    },
    {
      title: 'Night Shift',
      value: nightShiftGuards.toString(),
      percentage: percentOfTotal(nightShiftGuards),
      icon: 'ri:moon-line',
      color: 'info',
    },
    {
      title: 'Awaiting Assignment',
      value: awaitingAssignment.toString(),
      percentage: percentOfTotal(awaitingAssignment),
      icon: 'ri:user-received-2-line',
      color: 'success',
    },
  ]

  return (
    <Col xl={6} lg={12}>
      <Row>
        {cardData.map((card) => (
          <Col xl={6} lg={6} key={card.title}>
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
                      <p className="mb-0 mt-2 text-success">
                        <IconifyIcon icon="ri:percent-line" className="me-1" />
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

const GuardGridCard = ({ guards }: GuardGridCardProps) => {
  return (
    <Row>
      <GuardsChart guards={guards} />
      <GuardStatistics guards={guards} />
    </Row>
  )
}

export default GuardGridCard
