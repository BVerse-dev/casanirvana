'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Button, Badge, Table, Row, Col, FormControl, FormSelect, FormLabel } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useNotificationAnalytics, useChannelPerformance, useTopPerformingCampaigns, usePerformanceTrends, type AnalyticsFilters } from '@/hooks/useNotificationAnalytics'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

interface AnalyticsData {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
}

const NotificationAnalyticsView = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('7days')
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [campaignPage, setCampaignPage] = useState(1)
  const [campaignPageSize, setCampaignPageSize] = useState(10)

  // Build filters for API calls
  const filters: AnalyticsFilters = {
    dateRange: dateRange as any,
    channel: selectedChannel
  }

  // Fetch real data using hooks
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useNotificationAnalytics(filters)
  const { data: channelPerformance, isLoading: channelLoading } = useChannelPerformance(filters)
  const { data: topCampaignsResponse, isLoading: campaignsLoading } = useTopPerformingCampaigns(filters, campaignPage, campaignPageSize)
  const { data: trendsData, isLoading: trendsLoading } = usePerformanceTrends(filters)

  // Fallback to mock data for UI consistency
  const analyticsData = analytics || {
    totalSent: 15420,
    totalDelivered: 14890,
    totalOpened: 8934,
    totalClicked: 3456,
    deliveryRate: 96.6,
    openRate: 60.0,
    clickRate: 38.7,
    bounceRate: 3.4
  }

  // Performance data over time
  const performanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sent',
        data: [2100, 2300, 2500, 2200, 2800, 1900, 2100],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Delivered',
        data: [2050, 2250, 2420, 2150, 2720, 1850, 2050],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Opened',
        data: [1230, 1350, 1450, 1290, 1630, 1110, 1230],
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }
    ]
  }

  // Channel performance data - use real data when available
  const channelData = channelPerformance ? {
    labels: channelPerformance.map(ch => ch.type.charAt(0).toUpperCase() + ch.type.slice(1)),
    datasets: [{
      data: channelPerformance.map(ch => ch.totalSent),
      backgroundColor: [
        'rgba(0, 123, 255, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(23, 162, 184, 0.8)'
      ],
      borderWidth: 1
    }]
  } : {
    labels: ['Email', 'SMS', 'Push', 'In-App'],
    datasets: [{
      data: [45.2, 28.7, 15.6, 10.5],
      backgroundColor: [
        'rgba(0, 123, 255, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(23, 162, 184, 0.8)'
      ],
      borderWidth: 1
    }]
  }

  // Engagement trends
  const engagementData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Open Rate (%)',
        data: [58.2, 61.5, 59.8, 62.1],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4
      },
      {
        label: 'Click Rate (%)',
        data: [35.8, 38.2, 36.9, 39.5],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      }
    ]
  }

  // Top performing campaigns - use real data when available
  const topCampaignsData = topCampaignsResponse?.campaigns || [
    {
      name: 'New Property Listings Alert',
      type: 'email',
      sent: 1250,
      opened: 520,
      clicked: 186,
      openRate: 41.6,
      clickRate: 35.8
    },
    {
      name: 'Welcome Onboarding Series',
      type: 'in-app',
      sent: 320,
      opened: 245,
      clicked: 98,
      openRate: 76.6,
      clickRate: 40.0
    },
    {
      name: 'Payment Reminder Campaign',
      type: 'sms',
      sent: 89,
      opened: 87,
      clicked: 45,
      openRate: 97.8,
      clickRate: 51.7
    },
    {
      name: 'Appointment Reminders',
      type: 'push',
      sent: 145,
      opened: 89,
      clicked: 67,
      openRate: 61.4,
      clickRate: 75.3
    },
    {
      name: 'Weekly Newsletter',
      type: 'email',
      sent: 2340,
      opened: 890,
      clicked: 234,
      openRate: 38.0,
      clickRate: 26.3
    }
  ]

  const typeColors = {
    sms: 'success',
    email: 'primary',
    push: 'warning',
    'in-app': 'info'
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notification Analytics & Reports</h1>
          <p className="text-muted">Track performance and insights across all notification channels</p>
        </div>
        <div className="d-flex gap-2">
          <FormSelect
            value={dateRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </FormSelect>
          <Button variant="outline-primary">
            <IconifyIcon icon="ri:download-line" className="me-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {analyticsLoading ? (
        <div className="row mb-4">
          <div className="col-12 text-center py-5">
            <div className="spinner-border me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading analytics data...
          </div>
        </div>
      ) : analyticsError ? (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger">
              <IconifyIcon icon="ri:error-warning-line" className="me-2" />
              Error loading analytics: {analyticsError.message}
            </div>
          </div>
        </div>
      ) : (
        <div className="row mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-primary-subtle rounded p-2">
                    <IconifyIcon icon="ri:send-plane-line" className="text-primary fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Total Sent</p>
                  <h4 className="mb-0">{analyticsData.totalSent.toLocaleString()}</h4>
                  <small className="text-success">
                    <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                    +12.5% vs last period
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-success-subtle rounded p-2">
                    <IconifyIcon icon="ri:check-double-line" className="text-success fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Delivery Rate</p>
                  <h4 className="mb-0">{analyticsData.deliveryRate}%</h4>
                  <small className="text-success">
                    <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                    +0.8% vs last period
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-info-subtle rounded p-2">
                    <IconifyIcon icon="ri:eye-line" className="text-info fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Open Rate</p>
                  <h4 className="mb-0">{analyticsData.openRate}%</h4>
                  <small className="text-success">
                    <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                    +3.2% vs last period
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-warning-subtle rounded p-2">
                    <IconifyIcon icon="ri:cursor-line" className="text-warning fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Click Rate</p>
                  <h4 className="mb-0">{analyticsData.clickRate}%</h4>
                  <small className="text-success">
                    <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                    +1.9% vs last period
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      )}

      {/* Navigation Tabs */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <Nav variant="tabs" className="nav-tabs-custom">
            <NavItem>
              <NavLink
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:dashboard-line" className="me-2" />
                Overview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'performance'}
                onClick={() => setActiveTab('performance')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:line-chart-line" className="me-2" />
                Performance
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'channels'}
                onClick={() => setActiveTab('channels')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:smartphone-line" className="me-2" />
                Channels
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'campaigns'}
                onClick={() => setActiveTab('campaigns')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:megaphone-line" className="me-2" />
                Top Campaigns
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
        <CardBody>
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane active">
                <Row>
                  <Col md={8}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Performance Overview</h5>
                      </CardHeader>
                      <CardBody>
                        <Bar
                          data={performanceData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top' as const
                              },
                              title: {
                                display: true,
                                text: 'Notifications Performance (Last 7 Days)'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            }
                          }}
                        />
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-3">
                      <CardHeader>
                        <h5 className="mb-0">Channel Distribution</h5>
                      </CardHeader>
                      <CardBody>
                        <Doughnut
                          data={channelData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'bottom' as const
                              }
                            }
                          }}
                        />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <h6 className="mb-3">Quick Stats</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Bounce Rate</span>
                          <span className="text-danger">{analyticsData.bounceRate}%</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Avg. Response Time</span>
                          <span className="text-info">2.3 hours</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Best Performing Day</span>
                          <span className="text-success">Thursday</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Best Time to Send</span>
                          <span className="text-primary">10:00 AM</span>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="tab-pane active">
                <Row>
                  <Col md={12}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Engagement Trends</h5>
                      </CardHeader>
                      <CardBody>
                        <Line
                          data={engagementData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top' as const
                              },
                              title: {
                                display: true,
                                text: 'Open and Click Rates Over Time'
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100
                              }
                            }
                          }}
                        />
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={3}>
                    <Card className="text-center">
                      <CardBody>
                        <h3 className="text-primary">{analyticsData.totalSent}</h3>
                        <p className="text-muted mb-0">Total Sent</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <CardBody>
                        <h3 className="text-success">{analyticsData.totalDelivered}</h3>
                        <p className="text-muted mb-0">Total Delivered</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <CardBody>
                        <h3 className="text-info">{analyticsData.totalOpened}</h3>
                        <p className="text-muted mb-0">Total Opened</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <CardBody>
                        <h3 className="text-warning">{analyticsData.totalClicked}</h3>
                        <p className="text-muted mb-0">Total Clicked</p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Channels Tab */}
            {activeTab === 'channels' && (
              <div className="tab-pane active">
                <Row>
                  <Col md={6}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Channel Performance</h5>
                      </CardHeader>
                      <CardBody>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-medium">Email</span>
                            <span className="text-primary">45.2%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-primary" style={{ width: '45.2%' }}></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-medium">SMS</span>
                            <span className="text-success">28.7%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-success" style={{ width: '28.7%' }}></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-medium">Push Notifications</span>
                            <span className="text-warning">15.6%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-warning" style={{ width: '15.6%' }}></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-medium">In-App</span>
                            <span className="text-info">10.5%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div className="progress-bar bg-info" style={{ width: '10.5%' }}></div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Channel Metrics</h5>
                      </CardHeader>
                      <CardBody>
                        <div className="table-responsive">
                          <Table className="table-sm">
                            <thead>
                              <tr>
                                <th>Channel</th>
                                <th>Delivery Rate</th>
                                <th>Open Rate</th>
                                <th>Click Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><Badge bg="primary">Email</Badge></td>
                                <td>98.2%</td>
                                <td>24.5%</td>
                                <td>3.8%</td>
                              </tr>
                              <tr>
                                <td><Badge bg="success">SMS</Badge></td>
                                <td>99.1%</td>
                                <td>95.2%</td>
                                <td>12.7%</td>
                              </tr>
                              <tr>
                                <td><Badge bg="warning">Push</Badge></td>
                                <td>92.4%</td>
                                <td>78.9%</td>
                                <td>8.3%</td>
                              </tr>
                              <tr>
                                <td><Badge bg="info">In-App</Badge></td>
                                <td>100%</td>
                                <td>89.6%</td>
                                <td>15.2%</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Top Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="tab-pane active">
                <Card>
                  <CardHeader>
                    <h5 className="mb-0">Top Performing Campaigns</h5>
                  </CardHeader>
                  <CardBody>
                    <div className="table-responsive">
                      <Table className="table-hover">
                        <thead>
                          <tr>
                            <th>Campaign Name</th>
                            <th>Type</th>
                            <th>Sent</th>
                            <th>Opened</th>
                            <th>Clicked</th>
                            <th>Open Rate</th>
                            <th>Click Rate</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topCampaignsData.map((campaign: any, index: number) => (
                            <tr key={index}>
                              <td>
                                <strong>{campaign.name}</strong>
                              </td>
                              <td>
                                <Badge bg={typeColors[campaign.type as keyof typeof typeColors]} className="text-uppercase">
                                  {campaign.type}
                                </Badge>
                              </td>
                              <td>{campaign.sent.toLocaleString()}</td>
                              <td>{campaign.opened.toLocaleString()}</td>
                              <td>{campaign.clicked.toLocaleString()}</td>
                              <td>
                                <span className="fw-medium">{campaign.openRate}%</span>
                              </td>
                              <td>
                                <span className="fw-medium">{campaign.clickRate}%</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {campaign.openRate > 50 ? (
                                    <>
                                      <IconifyIcon icon="ri:arrow-up-line" className="text-success me-1" />
                                      <span className="text-success small">Excellent</span>
                                    </>
                                  ) : campaign.openRate > 30 ? (
                                    <>
                                      <IconifyIcon icon="ri:arrow-right-line" className="text-warning me-1" />
                                      <span className="text-warning small">Good</span>
                                    </>
                                  ) : (
                                    <>
                                      <IconifyIcon icon="ri:arrow-down-line" className="text-danger me-1" />
                                      <span className="text-danger small">Needs Improvement</span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default NotificationAnalyticsView
