'use client'
import trophyImg from '@/assets/images/trophy.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, CardFooter } from 'react-bootstrap'
import GuardDetailsCard from './GuardDetailsCard'
import type { Guard } from '@/hooks/useGuards'

// Guard Activity Chart Data
const guardActivityChart: ApexOptions = {
  chart: {
    type: "area" as const,
    height: 150,
    sparkline: {
      enabled: true,
    },
  },
  series: [
    {
      data: [12, 28, 15, 35, 22, 18, 30, 24, 19, 26, 31],
    },
  ],
  stroke: {
    width: 2,
    curve: "smooth" as const,
  },
  fill: {
    type: "gradient" as const,
    gradient: {
      shade: "light" as const,
      type: "vertical" as const,
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  markers: {
    size: 0,
  },
  colors: ["#28a745"],
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function (_seriesName: any) {
          return "";
        },
      },
    },
    marker: {
      show: false,
    },
  },
}

type GuardDetailsProps = {
  guard: Guard
}

const GuardDetails = ({ guard }: GuardDetailsProps) => {
  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={12}>
        <GuardDetailsCard guard={guard} />
      </Col>
      <Col xl={4} lg={12}>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Guard Performance Trophy</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <Image src={trophyImg} alt="trophy" width={120} height={120} />
              <h4 className="mt-3">
                Outstanding Security Service!
              </h4>
              <p className="text-muted">
                {guard.full_name || 'This guard'} has maintained exceptional performance standards with excellent attendance, professional conduct, 
                and outstanding security protocols.
              </p>

              <div className="d-flex justify-content-around mt-4">
                <div className="text-center">
                  <h5 className="fw-semibold text-success mb-2">
                    {guard.is_active ? '98%' : '85%'}
                  </h5>
                  <p className="text-muted mb-0">Attendance</p>
                </div>
                <div className="text-center">
                  <h5 className="fw-semibold text-primary mb-2">
                    {guard.is_active ? '4.8' : '4.2'}
                  </h5>
                  <p className="text-muted mb-0">Rating</p>
                </div>
                <div className="text-center">
                  <h5 className="fw-semibold text-warning mb-2">
                    {guard.employment_date 
                      ? Math.floor((new Date().getTime() - new Date(guard.employment_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
                      : 'N/A'
                    }
                  </h5>
                  <p className="text-muted mb-0">Months</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Recent Security Activities</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-success-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:shield-check-line" className="text-success" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Security Round Completed</h6>
                <p className="text-muted mb-1 fs-13">
                  {guard.full_name || 'Guard'} completed routine security patrol of {guard.societies?.name || 'assigned area'}
                </p>
                <small className="text-muted">2 hours ago</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:user-add-line" className="text-primary" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Visitor Registration</h6>
                <p className="text-muted mb-1 fs-13">Registered 5 visitors and issued temporary access cards</p>
                <small className="text-muted">4 hours ago</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:alarm-warning-line" className="text-warning" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Incident Report Filed</h6>
                <p className="text-muted mb-1 fs-13">Minor parking violation reported and resolved with resident</p>
                <small className="text-muted">Yesterday</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3">
              <div className="avatar-sm bg-info-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:time-line" className="text-info" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Shift Handover</h6>
                <p className="text-muted mb-1 fs-13">
                  Completed {guard.shift_type || 'shift'} handover with detailed security log notes
                </p>
                <small className="text-muted">Yesterday 6:00 PM</small>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Monthly Performance Statistics</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="row text-center">
              <div className="col-6">
                <div className="mb-3">
                  <h4 className="text-success">
                    {guard.is_active ? '156' : '89'}
                  </h4>
                  <p className="text-muted mb-0">Visitors Processed</p>
                </div>
              </div>
              <div className="col-6">
                <div className="mb-3">
                  <h4 className="text-primary">
                    {guard.is_active ? '28' : '22'}
                  </h4>
                  <p className="text-muted mb-0">Working Days</p>
                </div>
              </div>
              <div className="col-6">
                <div className="mb-3">
                  <h4 className="text-warning">
                    {guard.is_active ? '12' : '8'}
                  </h4>
                  <p className="text-muted mb-0">Security Reports</p>
                </div>
              </div>
              <div className="col-6">
                <div className="mb-0">
                  <h4 className="text-info">
                    {guard.is_active ? '3' : '1'}
                  </h4>
                  <p className="text-muted mb-0">Overtime Hours</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Equipment & Assets</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:shield-keyhole-line" className="text-primary" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Security Badge</h6>
                <p className="text-muted mb-1 fs-13">Digital access card with biometric verification</p>
                <small className="text-success">Active</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-success-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:radio-line" className="text-success" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Communication Device</h6>
                <p className="text-muted mb-1 fs-13">Two-way radio with emergency channel access</p>
                <small className="text-success">Working</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="avatar-sm bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:flashlight-line" className="text-warning" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Emergency Equipment</h6>
                <p className="text-muted mb-1 fs-13">Flashlight, first aid kit, and emergency whistle</p>
                <small className="text-success">Available</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3">
              <div className="avatar-sm bg-info-subtle rounded-circle d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:key-line" className="text-info" />
              </div>
              <div className="flex-1">
                <h6 className="mb-1">Master Keys</h6>
                <p className="text-muted mb-1 fs-13">Authorized access to common areas and emergency exits</p>
                <small className="text-success">Assigned</small>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Security Protocols</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light-subtle rounded">
              <div>
                <h6 className="mb-1">Visitor Verification</h6>
                <small className="text-muted">Identity and authorization check</small>
              </div>
              <span className="badge bg-success">Compliant</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light-subtle rounded">
              <div>
                <h6 className="mb-1">Emergency Response</h6>
                <small className="text-muted">Fire, medical, and security incidents</small>
              </div>
              <span className="badge bg-success">Certified</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light-subtle rounded">
              <div>
                <h6 className="mb-1">CCTV Monitoring</h6>
                <small className="text-muted">Surveillance system oversight</small>
              </div>
              <span className="badge bg-success">Active</span>
            </div>

            <div className="d-flex justify-content-between align-items-center p-2 bg-light-subtle rounded">
              <div>
                <h6 className="mb-1">Access Control</h6>
                <small className="text-muted">Entry and exit point management</small>
              </div>
              <span className="badge bg-success">Operational</span>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-success text-white" style={{ minHeight: '280px' }}>
          <CardBody className="p-4">
            <div className="d-flex align-items-start justify-content-between mb-3">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-sm rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center me-3">
                    <IconifyIcon icon="ri:shield-star-line" className="text-white fs-18" />
                  </div>
                  <div>
                    <h5 className="text-white mb-1">Guard Performance Overview</h5>
                    <div className="text-white-50 small">Excellence in Security Service</div>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-4">
                  <h2 className="text-white mb-0 me-2">4.9/5.0</h2>
                  <div>
                    <div className="text-white-75 small">
                      <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                      +0.3 this month
                    </div>
                    <div className="text-white-50 fs-12">Overall Rating</div>
                  </div>
                </div>
                
                <Row className="g-3">
                  <Col xs={6}>
                    <div>
                      <h4 className="text-white mb-1">98.5%</h4>
                      <div className="text-white-50 fs-13">Attendance Rate</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div>
                      <h4 className="text-white mb-1">156</h4>
                      <div className="text-white-50 fs-13">Hours This Month</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div>
                      <h4 className="text-white mb-1">24</h4>
                      <div className="text-white-50 fs-13">Security Rounds</div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div>
                      <h4 className="text-white mb-1">12</h4>
                      <div className="text-white-50 fs-13">Overtime Hours</div>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center flex-shrink-0">
                <IconifyIcon icon="ri:award-line" className="text-white fs-24" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="d-flex justify-content-between align-items-center pb-1">
            <CardTitle className="mb-0">Guard Activity Analytics</CardTitle>
            <Dropdown>
              <DropdownToggle
                as={"a"}
                className="btn btn-sm btn-outline-light rounded icons-center content-none"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Today{" "}
                <span>
                  {" "}
                  <IconifyIcon
                    className="ms-1"
                    width={16}
                    height={16}
                    icon="ri:arrow-down-s-line"
                  />
                </span>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>Today</DropdownItem>
                <DropdownItem>This Week</DropdownItem>
                <DropdownItem>This Month</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="d-flex align-items-center text-dark gap-2 mb-0">
                  247
                  <span className="badge text-success bg-success-subtle px-2 py-1 fs-12 ">
                    <IconifyIcon icon="ri:arrow-up-line" />
                    12.5%
                  </span>
                </h3>
                <small>(Total Activities)</small>
              </div>
              <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
                <IconifyIcon
                  icon="ri:shield-check-line"
                  width={32}
                  height={32}
                  className="fs-32 text-success "
                />
              </div>
            </div>
            <div className="mx-n3">
              <ReactApexChart
                options={guardActivityChart}
                series={guardActivityChart.series}
                height={150}
                type="area"
                className="apex-charts my-3"
              />
            </div>
            <Row className="mt-4 mb-1">
              <Col lg={6}>
                <div className="border rounded p-2">
                  <p className="mb-1 text-muted">
                    <IconifyIcon
                      icon="ri:eye-line"
                      className="text-dark"
                    />{" "}
                    Patrol Rounds
                  </p>
                  <p className="fs-18 text-dark fw-medium">
                    24 <span className="text-muted fs-14">68%</span>
                  </p>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-dark mb-0">Building</p>
                      <p className="mb-0">16</p>
                    </div>
                    <div className="text-end">
                      <p className="text-dark mb-0">Perimeter</p>
                      <p className="mb-0">8</p>
                    </div>
                  </div>
                  <div
                    className="progress progress-lg rounded-0 gap-1 overflow-visible mt-3 bg-light-subtle"
                    style={{ height: 10 }}
                  >
                    <div
                      className="progress-bar bg-success rounded-pill"
                      role="progressbar"
                      style={{ width: "70%" }}
                    ></div>
                    <div
                      className="progress-bar bg-primary rounded-pill"
                      role="progressbar"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <div className="border rounded p-2 text-end">
                  <p className="mb-1 text-muted">
                    <IconifyIcon icon="ri:user-add-line" className="text-dark" />{" "}
                    Visitor Logs
                  </p>
                  <p className="fs-18 text-dark fw-medium">
                    156 <span className="text-muted fs-14">32%</span>
                  </p>
                  <div className="d-flex justify-content-between">
                    <div className="text-start">
                      <p className="text-dark mb-0">Approved</p>
                      <p className="mb-0">142</p>
                    </div>
                    <div>
                      <p className="text-dark mb-0">Denied</p>
                      <p className="mb-0">14</p>
                    </div>
                  </div>
                  <div
                    className="progress progress-lg rounded-0 gap-1 overflow-visible mt-3 bg-light-subtle"
                    style={{ height: 10 }}
                  >
                    <div
                      className="progress-bar bg-success rounded-pill"
                      role="progressbar"
                      style={{ width: "91%" }}
                    ></div>
                    <div
                      className="progress-bar bg-warning rounded-pill"
                      role="progressbar"
                      style={{ width: "9%" }}
                    ></div>
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="border-top">
            <Row className="g-2">
              <Col lg={7}>
                <Button variant="success" className="w-100">
                  View Details
                </Button>
              </Col>
              <Col lg={5}>
                <Button variant="light" className="w-100">
                  Export Data
                </Button>
              </Col>
            </Row>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default GuardDetails
