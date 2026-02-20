"use client";

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  ProgressBar,
  Nav
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';
import AddComplianceRuleModal from './AddComplianceRuleModal';

const ComplianceMonitoring = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flagged' | 'aml' | 'rules'>('overview');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  
  // Sample data - would be fetched from API in production
  const complianceMetrics = {
    kyc_completion: 87.5,
    flagged_transactions: 14,
    high_risk_users: 8,
    suspicious_activity_reports: 3,
    aml_alerts: 6,
    rule_violations: 9,
  };
  
  const riskDistributionData = {
    series: [45, 35, 20],
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    colors: ['#0acf97', '#ffbc00', '#fa5c7c'],
  };
  
  // Risk trends chart options
  const riskTrendOptions: ApexOptions = {
    chart: {
      height: 280,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    colors: ['#39afd1', '#ffbc00', '#fa5c7c'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      axisBorder: {
        show: false,
      },
    },
    grid: {
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    }
  };
  
  const riskTrendSeries = [
    {
      name: 'Flagged Transactions',
      data: [8, 12, 15, 10, 14, 16, 14],
    },
    {
      name: 'False Positives',
      data: [6, 9, 11, 7, 10, 12, 10],
    },
    {
      name: 'Confirmed Violations',
      data: [2, 3, 4, 3, 4, 4, 4],
    },
  ];
  
  const flaggedTransactions = [
    {
      id: 'TRX-9005',
      date: '24 Sep 2023',
      user: 'David Wilson',
      amount: '$350.00',
      risk_level: 'high',
      flag_reason: 'Unusual destination country for this user',
      status: 'pending_review',
    },
    {
      id: 'TRX-9012',
      date: '23 Sep 2023',
      user: 'Sarah Miller',
      amount: '$2,500.00',
      risk_level: 'high',
      flag_reason: 'Amount above user average (5x typical)',
      status: 'pending_review',
    },
    {
      id: 'TRX-8998',
      date: '22 Sep 2023',
      user: 'John Adams',
      amount: '$950.00',
      risk_level: 'medium',
      flag_reason: 'Multiple transactions within 24 hours',
      status: 'cleared',
    },
    {
      id: 'TRX-8976',
      date: '21 Sep 2023',
      user: 'Maria Lopez',
      amount: '$1,200.00',
      risk_level: 'high',
      flag_reason: 'Recipient on watchlist',
      status: 'escalated',
    },
    {
      id: 'TRX-8945',
      date: '20 Sep 2023',
      user: 'Ahmed Hassan',
      amount: '$780.00',
      risk_level: 'medium',
      flag_reason: 'Unusual transaction pattern',
      status: 'pending_review',
    },
  ];
  
  const complianceRules = [
    {
      id: 'RULE-001',
      name: 'Large Transaction Alert',
      description: 'Flag transactions above $1,000',
      status: 'active',
      triggers: 42,
      last_triggered: '24 Sep 2023',
      risk_level: 'medium',
    },
    {
      id: 'RULE-002',
      name: 'Multiple Transactions',
      description: 'Flag if user makes more than 5 transactions within 24 hours',
      status: 'active',
      triggers: 18,
      last_triggered: '23 Sep 2023',
      risk_level: 'medium',
    },
    {
      id: 'RULE-003',
      name: 'Sanctioned Countries',
      description: 'Block transactions to sanctioned countries',
      status: 'active',
      triggers: 5,
      last_triggered: '20 Sep 2023',
      risk_level: 'high',
    },
    {
      id: 'RULE-004',
      name: 'High Risk Corridors',
      description: 'Apply enhanced due diligence for transactions to high-risk countries',
      status: 'active',
      triggers: 27,
      last_triggered: '24 Sep 2023',
      risk_level: 'high',
    },
    {
      id: 'RULE-005',
      name: 'Unusual Activity',
      description: 'Flag transactions that deviate from user\'s typical behavior',
      status: 'active',
      triggers: 31,
      last_triggered: '23 Sep 2023',
      risk_level: 'medium',
    },
  ];
  
  // Get risk level badge
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  // Get status badge
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'warning';
      case 'cleared':
        return 'success';
      case 'escalated':
        return 'danger';
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <>
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
              <Nav.Link eventKey="overview">
                <IconifyIcon icon="ri:dashboard-line" className="me-1" /> Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="flagged">
                <IconifyIcon icon="ri:flag-line" className="me-1" /> Flagged Transactions
                <Badge bg="danger" className="ms-1">{complianceMetrics.flagged_transactions}</Badge>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="aml">
                <IconifyIcon icon="ri:shield-keyhole-line" className="me-1" /> AML Reports
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="rules">
                <IconifyIcon icon="ri:file-list-3-line" className="me-1" /> Compliance Rules
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>
      
      {/* Compliance Overview */}
      {activeTab === 'overview' && (
        <>
          <Row>
            <Col md={6} lg={3}>
              <Card className="widget-flat">
                <Card.Body>
                  <div className="float-end">
                    <IconifyIcon icon="ri:user-follow-line" className="widget-icon bg-success-lighten text-success" />
                  </div>
                  <h5 className="fw-normal mt-0">KYC Completion</h5>
                  <h3 className="mt-3 mb-3">{complianceMetrics.kyc_completion}%</h3>
                  <ProgressBar 
                    now={complianceMetrics.kyc_completion} 
                    variant={complianceMetrics.kyc_completion > 80 ? 'success' : 'warning'}
                  />
                  <p className="mb-0 text-muted mt-2">
                    <span className="text-success me-2">
                      <IconifyIcon icon="ri:arrow-up-line" /> 5.27%
                    </span>
                    <span className="text-nowrap">Since last month</span>
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="widget-flat">
                <Card.Body>
                  <div className="float-end">
                    <IconifyIcon icon="ri:flag-line" className="widget-icon bg-warning-lighten text-warning" />
                  </div>
                  <h5 className="fw-normal mt-0">Flagged Transactions</h5>
                  <h3 className="mt-3 mb-3">{complianceMetrics.flagged_transactions}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-danger me-2">
                      <IconifyIcon icon="ri:arrow-up-line" /> 8.2%
                    </span>
                    <span className="text-nowrap">Since last week</span>
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="widget-flat">
                <Card.Body>
                  <div className="float-end">
                    <IconifyIcon icon="ri:user-warning-line" className="widget-icon bg-danger-lighten text-danger" />
                  </div>
                  <h5 className="fw-normal mt-0">High Risk Users</h5>
                  <h3 className="mt-3 mb-3">{complianceMetrics.high_risk_users}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-success me-2">
                      <IconifyIcon icon="ri:arrow-down-line" /> 1.2%
                    </span>
                    <span className="text-nowrap">Since last month</span>
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} lg={3}>
              <Card className="widget-flat">
                <Card.Body>
                  <div className="float-end">
                    <IconifyIcon icon="ri:file-warning-line" className="widget-icon bg-info-lighten text-info" />
                  </div>
                  <h5 className="fw-normal mt-0">SAR Reports</h5>
                  <h3 className="mt-3 mb-3">{complianceMetrics.suspicious_activity_reports}</h3>
                  <p className="mb-0 text-muted">
                    <span className="text-warning me-2">
                      <IconifyIcon icon="ri:arrow-right-line" /> 0.0%
                    </span>
                    <span className="text-nowrap">Since last month</span>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <Card.Title>Risk Monitoring Trends</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ReactApexChart
                    options={riskTrendOptions}
                    series={riskTrendSeries}
                    type="line"
                    height={280}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <Card.Title>User Risk Distribution</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ReactApexChart
                    options={{
                      chart: { type: 'donut' },
                      colors: riskDistributionData.colors,
                      labels: riskDistributionData.labels,
                      legend: {
                        position: 'bottom',
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: '70%',
                          }
                        }
                      }
                    }}
                    series={riskDistributionData.series}
                    type="donut"
                    height={250}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card>
            <Card.Header className="d-flex align-items-center">
              <Card.Title className="mb-0">Recent Flagged Transactions</Card.Title>
              <Button 
                variant="link" 
                className="p-0 ms-auto" 
                onClick={() => setActiveTab('flagged')}
              >
                View All <IconifyIcon icon="ri:arrow-right-line" />
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Risk Level</th>
                      <th>Flag Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flaggedTransactions.slice(0, 3).map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{transaction.date}</td>
                        <td>{transaction.user}</td>
                        <td>{transaction.amount}</td>
                        <td>
                          <Badge bg={getRiskBadgeVariant(transaction.risk_level)}>
                            {transaction.risk_level}
                          </Badge>
                        </td>
                        <td>{transaction.flag_reason}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(transaction.status)}>
                            {transaction.status === 'pending_review' ? 'Pending Review' : 
                             transaction.status === 'cleared' ? 'Cleared' : 'Escalated'}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="sm" size="sm">
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Flagged Transactions Tab */}
      {activeTab === 'flagged' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Flagged Transactions</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by ID, user, or reason..."
                  />
                  <Button variant="secondary">
                    <IconifyIcon icon="ri:search-line" />
                  </Button>
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select>
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select>
                  <option value="all">All Statuses</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="cleared">Cleared</option>
                  <option value="escalated">Escalated</option>
                </Form.Select>
              </Col>
            </Row>
            
            <div className="table-responsive">
              <Table className="table-centered table-nowrap mb-0">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Risk Level</th>
                    <th>Flag Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>{transaction.date}</td>
                      <td>{transaction.user}</td>
                      <td>{transaction.amount}</td>
                      <td>
                        <Badge bg={getRiskBadgeVariant(transaction.risk_level)}>
                          {transaction.risk_level}
                        </Badge>
                      </td>
                      <td>{transaction.flag_reason}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status === 'pending_review' ? 'Pending Review' : 
                           transaction.status === 'cleared' ? 'Cleared' : 'Escalated'}
                        </Badge>
                      </td>
                      <td>
                        {transaction.status === 'pending_review' && (
                          <div>
                            <Button variant="success" size="sm" className="me-1">
                              <IconifyIcon icon="ri:check-line" className="me-1" />
                              Clear
                            </Button>
                            <Button variant="danger" size="sm">
                              <IconifyIcon icon="ri:alert-line" className="me-1" />
                              Escalate
                            </Button>
                          </div>
                        )}
                        {transaction.status === 'cleared' && (
                          <Button variant="outline-secondary" size="sm">
                            <IconifyIcon icon="ri:history-line" className="me-1" />
                            View History
                          </Button>
                        )}
                        {transaction.status === 'escalated' && (
                          <Button variant="warning" size="sm">
                            <IconifyIcon icon="ri:eye-line" className="me-1" />
                            View Case
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* AML Reports Tab */}
      {activeTab === 'aml' && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">AML Compliance Reports</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="alert alert-info">
              <IconifyIcon icon="ri:information-line" className="me-1" />
              Anti-Money Laundering (AML) reports and documentation are generated monthly and on-demand.
            </div>
            
            <Row className="mb-3">
              <Col md={6}>
                <Card className="border mb-0">
                  <Card.Body>
                    <h5 className="mb-3">Generate New AML Report</h5>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Report Type</Form.Label>
                        <Form.Select>
                          <option>Monthly Compliance Summary</option>
                          <option>Suspicious Activity Report (SAR)</option>
                          <option>High-Risk Transaction Analysis</option>
                          <option>User Risk Assessment</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Date Range</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control type="date" />
                          </Col>
                          <Col>
                            <Form.Control type="date" />
                          </Col>
                        </Row>
                      </Form.Group>
                      
                      <Button variant="primary">
                        <IconifyIcon icon="ri:file-chart-line" className="me-1" />
                        Generate Report
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="border mb-0 h-100">
                  <Card.Body>
                    <h5 className="mb-3">Compliance Dashboard</h5>
                    <div className="mb-3">
                      <h6>AML Alerts</h6>
                      <ProgressBar className="mb-2">
                        <ProgressBar variant="danger" now={20} key={1} />
                        <ProgressBar variant="warning" now={30} key={2} />
                        <ProgressBar variant="success" now={50} key={3} />
                      </ProgressBar>
                      <div className="d-flex justify-content-between small">
                        <div><Badge bg="danger">High: {complianceMetrics.aml_alerts}</Badge></div>
                        <div><Badge bg="warning">Medium: 12</Badge></div>
                        <div><Badge bg="success">Cleared: 24</Badge></div>
                      </div>
                    </div>
                    
                    <div>
                      <h6>Required Actions</h6>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>SARs Due</span>
                        <Badge bg="danger">{complianceMetrics.suspicious_activity_reports}</Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Identity Verifications Pending</span>
                        <Badge bg="warning">8</Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Transaction Monitoring Review</span>
                        <Badge bg="info">Daily</Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <h5 className="mt-4 mb-3">Recent AML Reports</h5>
            <div className="table-responsive">
              <Table className="table-centered table-nowrap mb-0">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Report Type</th>
                    <th>Generated On</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>RPT-2023-09</td>
                    <td>Monthly Compliance Summary</td>
                    <td>01 Sep 2023</td>
                    <td>Aug 2023</td>
                    <td><Badge bg="success">Completed</Badge></td>
                    <td>
                      <Button variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:download-line" className="me-1" />
                        Download PDF
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>SAR-2023-08</td>
                    <td>Suspicious Activity Report</td>
                    <td>24 Aug 2023</td>
                    <td>24 Aug 2023</td>
                    <td><Badge bg="success">Submitted</Badge></td>
                    <td>
                      <Button variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                        View Report
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>RPT-2023-08</td>
                    <td>Monthly Compliance Summary</td>
                    <td>01 Aug 2023</td>
                    <td>Jul 2023</td>
                    <td><Badge bg="success">Completed</Badge></td>
                    <td>
                      <Button variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:download-line" className="me-1" />
                        Download PDF
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>SAR-2023-07</td>
                    <td>Suspicious Activity Report</td>
                    <td>15 Jul 2023</td>
                    <td>15 Jul 2023</td>
                    <td><Badge bg="success">Submitted</Badge></td>
                    <td>
                      <Button variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                        View Report
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Compliance Rules Tab */}
      {activeTab === 'rules' && (
        <Card>
          <Card.Header className="d-flex align-items-center">
            <Card.Title className="mb-0">Compliance Rules</Card.Title>
            <Button 
              variant="primary" 
              size="sm" 
              className="ms-auto"
              onClick={() => {
                setEditRule(null);
                setShowAddRuleModal(true);
              }}
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Add Rule
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="alert alert-warning">
              <IconifyIcon icon="ri:alert-line" className="me-1" />
              Changes to compliance rules require manager approval and are subject to audit.
            </div>
            
            <div className="table-responsive">
              <Table className="table-centered table-nowrap mb-0">
                <thead>
                  <tr>
                    <th>Rule ID</th>
                    <th>Rule Name</th>
                    <th>Description</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                    <th>Trigger Count</th>
                    <th>Last Triggered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.id}</td>
                      <td>{rule.name}</td>
                      <td>{rule.description}</td>
                      <td>
                        <Badge bg={getRiskBadgeVariant(rule.risk_level)}>
                          {rule.risk_level}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(rule.status)}>
                          {rule.status}
                        </Badge>
                      </td>
                      <td>{rule.triggers}</td>
                      <td>{rule.last_triggered}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => {
                            setEditRule(rule);
                            setShowAddRuleModal(true);
                          }}
                        >
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                        <Button variant="outline-secondary" size="sm" className="me-1">
                          <IconifyIcon icon="ri:eye-line" />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <IconifyIcon icon="ri:delete-bin-line" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            <div className="mt-4">
              <h5>Rule Performance</h5>
              <p className="text-muted">Analysis of rule effectiveness in detecting compliance issues</p>
              
              <Table className="table-sm table-centered">
                <thead className="table-light">
                  <tr>
                    <th>Rule</th>
                    <th>Triggers</th>
                    <th>False Positives</th>
                    <th>Effectiveness</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Large Transaction Alert</td>
                    <td>42</td>
                    <td>30 (71.4%)</td>
                    <td>
                      <ProgressBar now={28.6} variant="warning" className="mb-0" style={{ height: '5px' }} />
                    </td>
                  </tr>
                  <tr>
                    <td>Multiple Transactions</td>
                    <td>18</td>
                    <td>9 (50%)</td>
                    <td>
                      <ProgressBar now={50} variant="info" className="mb-0" style={{ height: '5px' }} />
                    </td>
                  </tr>
                  <tr>
                    <td>Sanctioned Countries</td>
                    <td>5</td>
                    <td>0 (0%)</td>
                    <td>
                      <ProgressBar now={100} variant="success" className="mb-0" style={{ height: '5px' }} />
                    </td>
                  </tr>
                  <tr>
                    <td>High Risk Corridors</td>
                    <td>27</td>
                    <td>12 (44.4%)</td>
                    <td>
                      <ProgressBar now={55.6} variant="info" className="mb-0" style={{ height: '5px' }} />
                    </td>
                  </tr>
                  <tr>
                    <td>Unusual Activity</td>
                    <td>31</td>
                    <td>15 (48.4%)</td>
                    <td>
                      <ProgressBar now={51.6} variant="info" className="mb-0" style={{ height: '5px' }} />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Add/Edit Compliance Rule Modal */}
      <AddComplianceRuleModal
        show={showAddRuleModal}
        onHide={() => setShowAddRuleModal(false)}
        onSave={handleSaveRule}
        editRule={editRule}
      />
    </>
  );

  // Handler for saving rule data
  function handleSaveRule(ruleData: any) {
    // In a real application, this would call an API to save the rule
    console.log('Saving compliance rule:', ruleData);
    
    // For now, just show a success message
    alert(editRule 
      ? `Rule ${ruleData.name} updated successfully!` 
      : `Rule ${ruleData.name} added successfully!`
    );
  }
};

export default ComplianceMonitoring;
