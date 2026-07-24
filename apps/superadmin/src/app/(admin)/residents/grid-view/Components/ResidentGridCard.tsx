'use client'

import homeImg from '@/assets/images/home-2.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { Resident } from '@/hooks/useResidents'
import type { ApexOptions } from 'apexcharts'
import Image from 'next/image'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap'

const ResidentsChart = ({ residents }: { residents: Resident[] }) => {
  const activeResidents = residents.filter((resident) => resident.status === 'active' || resident.is_active).length
  const pendingResidents = residents.filter((resident) => resident.status === 'pending').length
  const inactiveResidents = Math.max(0, residents.length - activeResidents - pendingResidents)

  const options: ApexOptions = {
    chart: { height: 123, type: 'donut' },
    series: [activeResidents, inactiveResidents, pendingResidents],
    legend: { show: false },
    stroke: { width: 0 },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: false, total: { showAlways: true, show: true } } } } },
    labels: ['Active', 'Inactive', 'Pending'],
    colors: ['#027ef4', '#f0934e', '#47ad94'],
    dataLabels: { enabled: false },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  }

  return (
    <Col xl={6} lg={12}>
      <Card>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={7}>
              <h4 className="text-dark mb-1">Welcome Back, Admin</h4>
              <p className="fs-14">This is your residents management dashboard</p>
              <Row className="align-items-center text-center mb-2">
                <Col lg={7} className="border-end border-light">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <ReactApexChart options={options} series={options.series} height={123} type="donut" className="apex-charts mb-4" />
                    </Col>
                    <Col lg={6}>
                      <h5>Residents</h5>
                      <h2 className="fw-semibold text-dark">{residents.length}</h2>
                    </Col>
                  </Row>
                </Col>
                <Col lg={5}>
                  <div className="ps-2">
                    <p className="d-flex align-items-center mb-2 gap-2"><IconifyIcon icon="ri:circle-fill" className="text-primary" />{activeResidents} Active</p>
                    <p className="d-flex align-items-center mb-2 gap-2"><IconifyIcon icon="ri:circle-fill" className="text-warning" />{inactiveResidents} Inactive</p>
                    <p className="d-flex align-items-center gap-2 mb-0"><IconifyIcon icon="ri:circle-fill" className="text-success" />{pendingResidents} Pending</p>
                  </div>
                </Col>
              </Row>
              <p className="text-muted mb-0 d-flex align-items-center gap-1">Status <span>:</span> <span className="text-dark">Live directory data</span></p>
            </Col>
            <Col lg={5} className="text-end">
              <Image src={homeImg} alt="Community residence" className="img-fluid" priority />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  )
}

const UnitStatistics = ({ residents }: { residents: Resident[] }) => {
  const assignedResidents = residents.filter((resident) => Boolean(resident.unit_id)).length
  const unassignedResidents = residents.length - assignedResidents
  const representedUnits = new Set(residents.map((resident) => resident.unit_id).filter(Boolean)).size
  const assignmentRate = residents.length > 0 ? Math.round((assignedResidents / residents.length) * 100) : 0

  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex align-items-center border-bottom border-dashed">
          <CardTitle as="h4" className="mb-0">Unit Statistics</CardTitle>
          <div className="ms-auto">
            <Dropdown>
              <DropdownToggle as="a" className="drop-arrow-none card-drop p-0" aria-label="Resident directory shortcuts">
                <IconifyIcon width={16} height={16} icon="ri:arrow-down-s-line" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem as={Link} href="/units?view=grid">View Units</DropdownItem>
                <DropdownItem as={Link} href="/residents?view=list">View Resident List</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={5}><h5 className="text-dark fw-medium mb-1">{representedUnits}</h5><p className="text-muted mb-0">Units Linked</p></Col>
            <Col lg={4} xs={6} className="text-center"><h5 className="text-dark fw-medium mb-1">{assignedResidents}</h5><p className="text-muted mb-0">Assigned</p></Col>
            <Col xl={3} xs={6} className="text-end"><h5 className="text-dark fw-medium mb-1">{unassignedResidents}</h5><p className="text-muted mb-0">Unassigned</p></Col>
          </Row>
          <div className="progress progress-lg bg-light-subtle rounded-0 gap-1 overflow-visible mt-2" style={{ height: 10 }}>
            <div className="progress-bar bg-primary rounded-pill" role="progressbar" aria-label="Assigned residents" aria-valuenow={assignmentRate} aria-valuemin={0} aria-valuemax={100} style={{ width: `${assignmentRate}%` }} />
            <div className="progress-bar bg-warning rounded-pill" role="progressbar" aria-label="Unassigned residents" aria-valuenow={100 - assignmentRate} aria-valuemin={0} aria-valuemax={100} style={{ width: `${100 - assignmentRate}%` }} />
          </div>
          <p className="mb-0 mt-3"><span className="text-success fw-medium mb-0"><IconifyIcon icon="ri:home-check-line" /> {assignmentRate}%</span>{' '}Assignment Rate</p>
        </CardBody>
        <CardFooter className="d-flex justify-content-between py-2">
          <p className="text-muted mb-0">Current directory page</p>
          <Link href="/units?view=grid" className="link-primary fw-medium">View More</Link>
        </CardFooter>
      </Card>
    </Col>
  )
}

const ActiveResidents = ({ residents }: { residents: Resident[] }) => {
  const activeResidents = residents.filter((resident) => resident.status === 'active' || resident.is_active).length
  const chronological = [...residents].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
  const trend = chronological.length > 0
    ? chronological.map((_, index) => chronological.slice(0, index + 1).filter((resident) => resident.status === 'active' || resident.is_active).length)
    : [0]
  const options: ApexOptions = {
    chart: { type: 'line', height: 115, sparkline: { enabled: true } },
    series: [{ data: trend }],
    stroke: { width: 2, curve: 'smooth' },
    markers: { size: 0 },
    colors: ['#ffffff'],
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } },
  }

  return (
    <Col xl={3} lg={6}>
      <Card className="bg-primary bg-gradient">
        <CardBody>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div><CardTitle as="h4" className="mb-2 text-white">Total Active Residents</CardTitle><p className="text-white fw-medium fs-24 mb-0">{activeResidents}</p></div>
            <div className="avatar-md bg-light rounded flex-centered"><IconifyIcon icon="ri:group-line" width={32} height={32} className="fs-32 text-primary" /></div>
          </div>
          <ReactApexChart options={options} series={options.series} height={115} type="line" className="apex-charts" />
        </CardBody>
      </Card>
    </Col>
  )
}

const ResidentGridCard = ({ residents }: { residents: Resident[] }) => (
  <Row>
    <ResidentsChart residents={residents} />
    <UnitStatistics residents={residents} />
    <ActiveResidents residents={residents} />
  </Row>
)

export default ResidentGridCard
