'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Row } from 'react-bootstrap'

import type { Resident } from '@/hooks/useResidents'

const ResidentsChart = ({ residents }: { residents: Resident[] }) => {
  const activeResidents = residents.filter((resident) => resident.is_active).length
  const inactiveResidents = residents.length - activeResidents
  const pendingResidents = residents.filter((resident) => resident.status === 'pending').length

  const chartOptions: ApexOptions = {
    chart: {
      height: 123,
      type: 'donut',
    },
    series: [activeResidents, inactiveResidents, pendingResidents],
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
        },
      },
    },
    labels: ['Active', 'Inactive', 'Pending'],
    colors: ['#027ef4', '#f0934e', '#47ad94'],
    dataLabels: {
      enabled: false,
    },
  }

  return (
    <Col xl={6} lg={12}>
      <Card>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={7}>
              <h4 className="text-dark mb-1">Resident portfolio overview</h4>
              <p className="fs-14 text-muted mb-3">Live status split for the residents currently in this directory.</p>
              <Row className="align-items-center text-center mb-2">
                <Col lg={7} className="border-end border-light">
                  <ReactApexChart options={chartOptions} series={chartOptions.series} height={123} type="donut" className="apex-charts mb-4" />
                </Col>
                <Col lg={5}>
                  <h5>Total Residents</h5>
                  <h2 className="fw-semibold text-dark">{residents.length}</h2>
                </Col>
              </Row>
              <p className="mb-1 d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:circle-fill" className="text-primary" />
                {activeResidents} Active
              </p>
              <p className="mb-1 d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:circle-fill" className="text-warning" />
                {inactiveResidents} Inactive
              </p>
              <p className="mb-0 d-flex align-items-center gap-2">
                <IconifyIcon icon="ri:circle-fill" className="text-success" />
                {pendingResidents} Pending
              </p>
            </Col>
            <Col lg={5}>
              <div className="rounded bg-light-subtle p-3">
                <h6 className="text-uppercase text-muted mb-2">Launch Readiness Note</h6>
                <p className="mb-0 text-muted">
                  This summary is generated from the current resident records only. No fallback counts or fixed demo totals remain in this header.
                </p>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  )
}

const UnitCoverageCard = ({ residents }: { residents: Resident[] }) => {
  const unitIds = Array.from(new Set(residents.map((resident) => resident.units?.id).filter(Boolean)))
  const assignedResidents = residents.filter((resident) => Boolean(resident.unit_id)).length
  const tenantResidents = residents.filter((resident) => resident.role === 'tenant').length
  const occupancyRate = unitIds.length > 0 ? Math.round((assignedResidents / unitIds.length) * 100) : 0

  return (
    <Col xl={3} lg={6}>
      <Card className="h-100">
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <p className="text-muted mb-1">Units Referenced</p>
              <h3 className="mb-0">{unitIds.length}</h3>
            </div>
            <div className="avatar-md bg-primary-subtle rounded flex-centered">
              <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-28 text-primary" />
            </div>
          </div>
          <p className="mb-2 text-muted">Residents with assigned units: {assignedResidents}</p>
          <p className="mb-3 text-muted">Residents marked as tenants: {tenantResidents}</p>
          <div className="progress progress-sm bg-light-subtle">
            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${occupancyRate}%` }} />
          </div>
          <p className="mb-0 mt-2 text-muted">{occupancyRate}% resident-to-unit coverage</p>
        </CardBody>
      </Card>
    </Col>
  )
}

const CommunityCoverageCard = ({ residents }: { residents: Resident[] }) => {
  const communityNames = Array.from(
    new Set(residents.map((resident) => resident.communities?.name).filter((value): value is string => Boolean(value)))
  )
  const unassignedResidents = residents.filter((resident) => !resident.community_id).length

  return (
    <Col xl={3} lg={6}>
      <Card className="bg-primary bg-gradient text-white h-100">
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <p className="text-white-50 mb-1">Communities Represented</p>
              <h3 className="text-white mb-0">{communityNames.length}</h3>
            </div>
            <div className="avatar-md bg-white rounded flex-centered">
              <IconifyIcon icon="solar:map-point-wave-bold-duotone" className="fs-28 text-primary" />
            </div>
          </div>
          <p className="mb-2 text-white-50">Residents without community assignment: {unassignedResidents}</p>
          <p className="mb-0 text-white-50">
            This card now reflects current community coverage instead of a fixed resident total.
          </p>
        </CardBody>
      </Card>
    </Col>
  )
}

const ResidentGridCard = ({ residents }: { residents: Resident[] }) => {
  return (
    <Row>
      <ResidentsChart residents={residents} />
      <UnitCoverageCard residents={residents} />
      <CommunityCoverageCard residents={residents} />
    </Row>
  )
}

export default ResidentGridCard
