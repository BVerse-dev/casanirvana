"use client";

import React, { useState } from 'react';
import { Row, Col, Card, Button, Nav, Form, InputGroup } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Components
import TransactionReportTable from './components/TransactionReportTable';
import RevenueByServiceChart from './components/RevenueByServiceChart';
import UserEngagementChart from './components/UserEngagementChart';
import ServiceUptimeChart from './components/ServiceUptimeChart';
import ErrorRateChart from './components/ErrorRateChart';
import ServiceAdoptionChart from './components/ServiceAdoptionChart';
import AdvancedFiltersModal from './components/AdvancedFiltersModal';
import ExportOptionsModal from './components/ExportOptionsModal';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'financial' | 'engagement' | 'performance'>('transactions');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    console.log('Applied filters:', filters);
    // Implement filter application logic
  };

  const handleExportReport = (options: any) => {
    console.log('Export report with options:', options);
    // Implement export functionality
  };

  return (
    <>
      <PageTitle title="Reports & Analytics" subName="Personal Hub Services" />
      
      {/* Date Range Selector */}
      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center gap-3">
          <div className="me-2">
            <span className="text-muted">Date Range:</span>
          </div>
          
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant={dateRange === 'today' ? 'primary' : 'light'} 
              size="sm"
              onClick={() => setDateRange('today')}
            >
              Today
            </Button>
            <Button 
              variant={dateRange === 'week' ? 'primary' : 'light'} 
              size="sm"
              onClick={() => setDateRange('week')}
            >
              This Week
            </Button>
            <Button 
              variant={dateRange === 'month' ? 'primary' : 'light'} 
              size="sm"
              onClick={() => setDateRange('month')}
            >
              This Month
            </Button>
            <Button 
              variant={dateRange === 'quarter' ? 'primary' : 'light'} 
              size="sm"
              onClick={() => setDateRange('quarter')}
            >
              This Quarter
            </Button>
            <Button 
              variant={dateRange === 'year' ? 'primary' : 'light'} 
              size="sm"
              onClick={() => setDateRange('year')}
            >
              This Year
            </Button>
            <Button 
              variant={dateRange === 'custom' ? 'primary' : 'light'} 
              size="sm"
              onClick={() => setDateRange('custom')}
            >
              Custom Range
            </Button>
          </div>
          
          {dateRange === 'custom' && (
            <div className="d-flex gap-2">
              <Form.Control
                type="date"
                size="sm"
                style={{ width: '140px' }}
                defaultValue="2023-09-01"
              />
              <div className="text-muted">to</div>
              <Form.Control
                type="date"
                size="sm"
                style={{ width: '140px' }}
                defaultValue="2023-09-30"
              />
              <Button variant="primary" size="sm">Apply</Button>
            </div>
          )}
          
          <div className="ms-auto">
            <Button variant="outline-secondary" size="sm" className="me-2">
              <IconifyIcon icon="ri:refresh-line" className="me-1" />
              Refresh Data
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setShowExportModal(true)}
            >
              <IconifyIcon icon="ri:download-2-line" className="me-1" />
              Export
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Top navigation tabs */}
      <Card className="mb-3">
        <Card.Body className="p-0">
          <Nav 
            variant="tabs" 
            className="nav-bordered" 
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k as any)}
          >
            <Nav.Item>
              <Nav.Link eventKey="transactions">
                <IconifyIcon icon="ri:exchange-line" className="me-1" />
                Transaction Reports
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="financial">
                <IconifyIcon icon="ri:money-dollar-circle-line" className="me-1" />
                Financial Reports
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="engagement">
                <IconifyIcon icon="ri:user-heart-line" className="me-1" />
                User Engagement
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="performance">
                <IconifyIcon icon="ri:dashboard-3-line" className="me-1" />
                System Performance
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* Transaction Reports Tab */}
      {activeTab === 'transactions' && (
        <>
          <Card className="mb-3">
            <Card.Header>
              <Card.Title className="mb-0">
                Transaction Summary
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={3} md={6}>
                  <Card className="mini-stats-wid">
                    <Card.Body>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium mb-2">Total Transactions</p>
                          <h4 className="mb-0">8,742</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-primary">
                            <IconifyIcon icon="ri:exchange-line" width={24} />
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="badge bg-soft-success text-success">
                          <i className="ri-arrow-up-line align-middle"></i> 12.5%
                        </span>
                        <span className="ms-1 text-muted font-size-13">from previous period</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={3} md={6}>
                  <Card className="mini-stats-wid">
                    <Card.Body>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium mb-2">Success Rate</p>
                          <h4 className="mb-0">96.8%</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-success align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-success">
                            <IconifyIcon icon="ri:check-double-line" width={24} />
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="badge bg-soft-success text-success">
                          <i className="ri-arrow-up-line align-middle"></i> 1.2%
                        </span>
                        <span className="ms-1 text-muted font-size-13">from previous period</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={3} md={6}>
                  <Card className="mini-stats-wid">
                    <Card.Body>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium mb-2">Avg. Response Time</p>
                          <h4 className="mb-0">1.2s</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-info align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-info">
                            <IconifyIcon icon="ri:timer-line" width={24} />
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="badge bg-soft-danger text-danger">
                          <i className="ri-arrow-up-line align-middle"></i> 0.1s
                        </span>
                        <span className="ms-1 text-muted font-size-13">from previous period</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={3} md={6}>
                  <Card className="mini-stats-wid">
                    <Card.Body>
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <p className="text-muted fw-medium mb-2">Total Value</p>
                          <h4 className="mb-0">$245,302</h4>
                        </div>
                        <div className="avatar-sm rounded-circle bg-warning align-self-center mini-stat-icon">
                          <span className="avatar-title rounded-circle bg-warning">
                            <IconifyIcon icon="ri:money-dollar-circle-line" width={24} />
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="badge bg-soft-success text-success">
                          <i className="ri-arrow-up-line align-middle"></i> 15.3%
                        </span>
                        <span className="ms-1 text-muted font-size-13">from previous period</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="d-flex align-items-center">
              <Card.Title className="mb-0">Cross-Service Transaction Report</Card.Title>
              <Form className="ms-auto d-flex gap-2">
                <Form.Select size="sm" style={{ width: '200px' }}>
                  <option>All Services</option>
                  <option>Airtime</option>
                  <option>Data</option>
                  <option>Money Transfer</option>
                  <option>Bill Payments</option>
                  <option>Insurance</option>
                  <option>Marketplace</option>
                </Form.Select>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search transactions..."
                    style={{ width: '200px' }}
                  />
                </InputGroup>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setShowFiltersModal(true)}
                >
                  <IconifyIcon icon="ri:filter-3-line" className="me-1" />
                  Filters
                </Button>
              </Form>
            </Card.Header>
            <Card.Body>
              <TransactionReportTable dateRange={dateRange} />
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Financial Reports Tab */}
      {activeTab === 'financial' && (
        <>
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Revenue by Service</Card.Title>
                </Card.Header>
                <Card.Body>
                  <RevenueByServiceChart dateRange={dateRange} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Revenue Distribution</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="text-center pt-3">
                    <div className="row justify-content-center">
                      <div className="col-sm-6 col-8">
                        <div style={{ height: '240px' }}>
                          {/* Placeholder for pie chart */}
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <IconifyIcon icon="ri:pie-chart-line" width={120} height={120} className="text-muted" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Row>
                        <Col md={4}>
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <span className="d-block p-1 bg-primary rounded-circle"></span>
                              </div>
                              <div className="flex-grow-1 ms-2">
                                <p className="text-muted mb-0">Airtime</p>
                                <h5 className="mb-0">32%</h5>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <span className="d-block p-1 bg-success rounded-circle"></span>
                              </div>
                              <div className="flex-grow-1 ms-2">
                                <p className="text-muted mb-0">Data</p>
                                <h5 className="mb-0">24%</h5>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <span className="d-block p-1 bg-warning rounded-circle"></span>
                              </div>
                              <div className="flex-grow-1 ms-2">
                                <p className="text-muted mb-0">Marketplace</p>
                                <h5 className="mb-0">18%</h5>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <span className="d-block p-1 bg-info rounded-circle"></span>
                              </div>
                              <div className="flex-grow-1 ms-2">
                                <p className="text-muted mb-0">Money Transfer</p>
                                <h5 className="mb-0">14%</h5>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <span className="d-block p-1 bg-danger rounded-circle"></span>
                              </div>
                              <div className="flex-grow-1 ms-2">
                                <p className="text-muted mb-0">Bill Payments</p>
                                <h5 className="mb-0">10%</h5>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mb-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <span className="d-block p-1 bg-secondary rounded-circle"></span>
                              </div>
                              <div className="flex-grow-1 ms-2">
                                <p className="text-muted mb-0">Insurance</p>
                                <h5 className="mb-0">2%</h5>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Commission & Fee Analysis</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Service</th>
                      <th>Transactions</th>
                      <th>Gross Revenue</th>
                      <th>Provider Fees</th>
                      <th>Platform Commission</th>
                      <th>Net Revenue</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Airtime</td>
                      <td>2,845</td>
                      <td>$42,675</td>
                      <td>$38,407</td>
                      <td>$4,268</td>
                      <td>$4,268</td>
                      <td><span className="badge bg-soft-success text-success">10.0%</span></td>
                    </tr>
                    <tr>
                      <td>Data</td>
                      <td>1,958</td>
                      <td>$39,160</td>
                      <td>$35,244</td>
                      <td>$3,916</td>
                      <td>$3,916</td>
                      <td><span className="badge bg-soft-success text-success">10.0%</span></td>
                    </tr>
                    <tr>
                      <td>Money Transfer</td>
                      <td>846</td>
                      <td>$84,600</td>
                      <td>$80,370</td>
                      <td>$4,230</td>
                      <td>$4,230</td>
                      <td><span className="badge bg-soft-success text-success">5.0%</span></td>
                    </tr>
                    <tr>
                      <td>Bill Payments</td>
                      <td>1,245</td>
                      <td>$37,350</td>
                      <td>$36,230</td>
                      <td>$1,120</td>
                      <td>$1,120</td>
                      <td><span className="badge bg-soft-warning text-warning">3.0%</span></td>
                    </tr>
                    <tr>
                      <td>Insurance</td>
                      <td>124</td>
                      <td>$12,400</td>
                      <td>$9,920</td>
                      <td>$2,480</td>
                      <td>$2,480</td>
                      <td><span className="badge bg-soft-success text-success">20.0%</span></td>
                    </tr>
                    <tr>
                      <td>Marketplace</td>
                      <td>724</td>
                      <td>$29,117</td>
                      <td>$23,294</td>
                      <td>$5,823</td>
                      <td>$5,823</td>
                      <td><span className="badge bg-soft-success text-success">20.0%</span></td>
                    </tr>
                    <tr className="table-active">
                      <td><strong>Total</strong></td>
                      <td><strong>7,742</strong></td>
                      <td><strong>$245,302</strong></td>
                      <td><strong>$223,465</strong></td>
                      <td><strong>$21,837</strong></td>
                      <td><strong>$21,837</strong></td>
                      <td><span className="badge bg-soft-success text-success">8.9%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* User Engagement Tab */}
      {activeTab === 'engagement' && (
        <>
          <Row>
            <Col xl={6}>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">User Engagement Metrics</Card.Title>
                </Card.Header>
                <Card.Body>
                  <UserEngagementChart dateRange={dateRange} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Service Adoption</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ServiceAdoptionChart dateRange={dateRange} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <Card.Title className="mb-0">User Activity Analysis</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Service</th>
                      <th>Active Users</th>
                      <th>New Users</th>
                      <th>Average Session</th>
                      <th>Sessions per User</th>
                      <th>Conversion Rate</th>
                      <th>Retention Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Airtime</td>
                      <td>1,845</td>
                      <td>245 <span className="text-success">+12%</span></td>
                      <td>1m 45s</td>
                      <td>1.5</td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-success" style={{width: '65%'}}></div></div><span className="ms-1">65%</span></td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-success" style={{width: '78%'}}></div></div><span className="ms-1">78%</span></td>
                    </tr>
                    <tr>
                      <td>Data</td>
                      <td>1,452</td>
                      <td>198 <span className="text-success">+8%</span></td>
                      <td>2m 10s</td>
                      <td>1.2</td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-success" style={{width: '72%'}}></div></div><span className="ms-1">72%</span></td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-success" style={{width: '81%'}}></div></div><span className="ms-1">81%</span></td>
                    </tr>
                    <tr>
                      <td>Money Transfer</td>
                      <td>652</td>
                      <td>87 <span className="text-success">+15%</span></td>
                      <td>3m 45s</td>
                      <td>1.1</td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-warning" style={{width: '45%'}}></div></div><span className="ms-1">45%</span></td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-warning" style={{width: '56%'}}></div></div><span className="ms-1">56%</span></td>
                    </tr>
                    <tr>
                      <td>Bill Payments</td>
                      <td>958</td>
                      <td>124 <span className="text-danger">-5%</span></td>
                      <td>2m 30s</td>
                      <td>1.3</td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-warning" style={{width: '52%'}}></div></div><span className="ms-1">52%</span></td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-success" style={{width: '68%'}}></div></div><span className="ms-1">68%</span></td>
                    </tr>
                    <tr>
                      <td>Insurance</td>
                      <td>105</td>
                      <td>32 <span className="text-success">+24%</span></td>
                      <td>4m 15s</td>
                      <td>1.0</td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-danger" style={{width: '28%'}}></div></div><span className="ms-1">28%</span></td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-danger" style={{width: '35%'}}></div></div><span className="ms-1">35%</span></td>
                    </tr>
                    <tr>
                      <td>Marketplace</td>
                      <td>485</td>
                      <td>142 <span className="text-success">+18%</span></td>
                      <td>5m 20s</td>
                      <td>2.1</td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-success" style={{width: '58%'}}></div></div><span className="ms-1">58%</span></td>
                      <td><div className="progress" style={{height: '5px'}}><div className="progress-bar bg-warning" style={{width: '62%'}}></div></div><span className="ms-1">62%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* System Performance Tab */}
      {activeTab === 'performance' && (
        <>
          <Row>
            <Col xl={6}>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Service Uptime</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ServiceUptimeChart dateRange={dateRange} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl={6}>
              <Card>
                <Card.Header>
                  <Card.Title className="mb-0">Error Rate by Service</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ErrorRateChart dateRange={dateRange} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">API Performance Metrics</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-centered table-nowrap mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>API Endpoint</th>
                      <th>Requests</th>
                      <th>Avg. Response Time</th>
                      <th>Success Rate</th>
                      <th>Error Rate</th>
                      <th>Timeout Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>/api/personal-hub/airtime/purchase</code></td>
                      <td>2,845</td>
                      <td>850ms <span className="text-success">-120ms</span></td>
                      <td>98.2%</td>
                      <td>1.5%</td>
                      <td>0.3%</td>
                      <td><span className="badge bg-success">Healthy</span></td>
                    </tr>
                    <tr>
                      <td><code>/api/personal-hub/data/purchase</code></td>
                      <td>1,958</td>
                      <td>920ms <span className="text-success">-50ms</span></td>
                      <td>97.8%</td>
                      <td>1.8%</td>
                      <td>0.4%</td>
                      <td><span className="badge bg-success">Healthy</span></td>
                    </tr>
                    <tr>
                      <td><code>/api/personal-hub/transfers/send</code></td>
                      <td>846</td>
                      <td>1250ms <span className="text-danger">+150ms</span></td>
                      <td>95.2%</td>
                      <td>2.8%</td>
                      <td>2.0%</td>
                      <td><span className="badge bg-warning">Degraded</span></td>
                    </tr>
                    <tr>
                      <td><code>/api/personal-hub/bills/pay</code></td>
                      <td>1,245</td>
                      <td>1100ms <span className="text-danger">+200ms</span></td>
                      <td>96.5%</td>
                      <td>2.5%</td>
                      <td>1.0%</td>
                      <td><span className="badge bg-warning">Degraded</span></td>
                    </tr>
                    <tr>
                      <td><code>/api/personal-hub/insurance/quote</code></td>
                      <td>356</td>
                      <td>780ms <span className="text-success">-20ms</span></td>
                      <td>99.1%</td>
                      <td>0.9%</td>
                      <td>0.0%</td>
                      <td><span className="badge bg-success">Healthy</span></td>
                    </tr>
                    <tr>
                      <td><code>/api/personal-hub/marketplace/orders</code></td>
                      <td>724</td>
                      <td>680ms <span className="text-success">-80ms</span></td>
                      <td>99.4%</td>
                      <td>0.5%</td>
                      <td>0.1%</td>
                      <td><span className="badge bg-success">Healthy</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="alert alert-warning mt-3">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="ri:error-warning-line" className="me-2" width={20} height={20} />
                  <div>
                    <h5 className="alert-heading">Performance Warning</h5>
                    <p className="mb-0">Transfer and Bill payment services are experiencing degraded performance. The team has been notified and is investigating the issue.</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Modals */}
      <AdvancedFiltersModal
        show={showFiltersModal}
        onHide={() => setShowFiltersModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />

      <ExportOptionsModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExportReport}
        reportType={activeTab}
      />
    </>
  );
};

export default ReportsPage;
