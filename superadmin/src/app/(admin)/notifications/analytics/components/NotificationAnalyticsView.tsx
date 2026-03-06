'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Button,
  Badge,
  Table,
  Row,
  Col,
  FormSelect,
  Alert,
} from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  useNotificationAnalytics,
  useChannelPerformance,
  useTopPerformingCampaigns,
  usePerformanceTrends,
  type AnalyticsFilters,
  type ChannelPerformance,
} from '@/hooks/useNotificationAnalytics'
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime'
import { toast } from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const buildTrendGroups = (
  trendsData: Array<{
    recipients_count?: number | null
    delivered_count?: number | null
    opened_count?: number | null
    clicked_count?: number | null
    created_at?: string | null
  }>
) => {
  const grouped = new Map<
    string,
    { label: string; sent: number; delivered: number; opened: number; clicked: number }
  >()

  trendsData.forEach((row) => {
    if (!row.created_at) {
      return
    }

    const date = new Date(row.created_at)
    const key = date.toISOString().split('T')[0]
    const label = date.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })
    const current = grouped.get(key) ?? { label, sent: 0, delivered: 0, opened: 0, clicked: 0 }
    current.sent += Number(row.recipients_count ?? 0)
    current.delivered += Number(row.delivered_count ?? 0)
    current.opened += Number(row.opened_count ?? 0)
    current.clicked += Number(row.clicked_count ?? 0)
    grouped.set(key, current)
  })

  return Array.from(grouped.values())
}

const formatPercent = (value: number) => `${value.toFixed(1).replace(/\.0$/, '')}%`

const NotificationAnalyticsView = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('7days')
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [campaignPage, setCampaignPage] = useState(1)
  const [campaignPageSize, setCampaignPageSize] = useState(10)

  const filters: AnalyticsFilters = {
    dateRange: dateRange as AnalyticsFilters['dateRange'],
    channel: selectedChannel,
  }

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useNotificationAnalytics(filters)
  const { data: channelPerformance = [], isLoading: channelLoading } = useChannelPerformance(filters)
  const { data: topCampaignsResponse, isLoading: campaignsLoading } = useTopPerformingCampaigns(filters, campaignPage, campaignPageSize)
  const { data: trendsData = [], isLoading: trendsLoading } = usePerformanceTrends(filters)

  useNotificationRealtime({
    channelName: 'superadmin-notification-analytics',
    tables: ['notification_campaigns'],
    queryKeys: [['notification-analytics'], ['channel-performance'], ['top-campaigns'], ['performance-trends']],
  })

  const analyticsData = analytics ?? {
    totalCampaigns: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  }

  const groupedTrends = useMemo(() => buildTrendGroups(trendsData as any[]), [trendsData])

  const performanceData = useMemo(() => {
    return {
      labels: groupedTrends.map((trend) => trend.label),
      datasets: [
        {
          label: 'Sent',
          data: groupedTrends.map((trend) => trend.sent),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Delivered',
          data: groupedTrends.map((trend) => trend.delivered),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Opened',
          data: groupedTrends.map((trend) => trend.opened),
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
        },
      ],
    }
  }, [groupedTrends])

  const engagementData = useMemo(() => {
    return {
      labels: groupedTrends.map((trend) => trend.label),
      datasets: [
        {
          label: 'Open Rate (%)',
          data: groupedTrends.map((trend) => (trend.delivered > 0 ? Number(((trend.opened / trend.delivered) * 100).toFixed(1)) : 0)),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.35,
        },
        {
          label: 'Click Rate (%)',
          data: groupedTrends.map((trend) => (trend.opened > 0 ? Number(((trend.clicked / trend.opened) * 100).toFixed(1)) : 0)),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.35,
        },
      ],
    }
  }, [groupedTrends])

  const channelData = useMemo(() => {
    return {
      labels: channelPerformance.map((channel) => channel.type.toUpperCase()),
      datasets: [
        {
          data: channelPerformance.map((channel) => channel.totalSent),
          backgroundColor: [
            'rgba(0, 123, 255, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(23, 162, 184, 0.8)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }, [channelPerformance])

  const topCampaignsData = topCampaignsResponse?.campaigns ?? []

  const bestDay = useMemo(() => {
    if (groupedTrends.length === 0) {
      return 'No data'
    }

    const ranked = [...groupedTrends].sort((left, right) => {
      const leftRate = left.delivered > 0 ? left.opened / left.delivered : 0
      const rightRate = right.delivered > 0 ? right.opened / right.delivered : 0
      return rightRate - leftRate
    })

    return ranked[0]?.label || 'No data'
  }, [groupedTrends])

  const topChannel = useMemo(() => {
    if (channelPerformance.length === 0) {
      return 'No data'
    }

    const ranked = [...channelPerformance].sort((left, right) => right.openRate - left.openRate)
    return ranked[0]?.type.toUpperCase() || 'No data'
  }, [channelPerformance])

  const handleExportReport = () => {
    if (groupedTrends.length === 0) {
      toast.error('No analytics data is available to export.')
      return
    }

    const rows = [
      ['date', 'sent', 'delivered', 'opened', 'clicked'],
      ...groupedTrends.map((trend) => [
        trend.label,
        String(trend.sent),
        String(trend.delivered),
        String(trend.opened),
        String(trend.clicked),
      ]),
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `notification-analytics-${dateRange}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const typeColors = {
    sms: 'success',
    email: 'primary',
    push: 'warning',
    'in-app': 'info',
  } as const

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notification Analytics & Reports</h1>
          <p className="text-muted">Track delivery, engagement, and top-performing campaigns</p>
        </div>
        <div className="d-flex gap-2">
          <FormSelect
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </FormSelect>
          <FormSelect
            value={selectedChannel}
            onChange={(event) => setSelectedChannel(event.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
            <option value="in-app">In-App</option>
          </FormSelect>
          <Button variant="outline-primary" onClick={handleExportReport}>
            <IconifyIcon icon="ri:download-line" className="me-2" />
            Export Report
          </Button>
        </div>
      </div>

      {analyticsError ? (
        <Alert variant="danger" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Error loading analytics: {analyticsError.message}
        </Alert>
      ) : (
        <Row className="mb-4">
          <Col md={3}>
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
                    <h4 className="mb-0">{analyticsLoading ? '—' : analyticsData.totalSent.toLocaleString()}</h4>
                    <small className="text-muted">{analyticsData.totalCampaigns} campaigns</small>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
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
                    <h4 className="mb-0">{analyticsLoading ? '—' : formatPercent(analyticsData.deliveryRate)}</h4>
                    <small className="text-muted">{analyticsData.totalDelivered.toLocaleString()} delivered</small>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
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
                    <h4 className="mb-0">{analyticsLoading ? '—' : formatPercent(analyticsData.openRate)}</h4>
                    <small className="text-muted">{analyticsData.totalOpened.toLocaleString()} opens</small>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
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
                    <h4 className="mb-0">{analyticsLoading ? '—' : formatPercent(analyticsData.clickRate)}</h4>
                    <small className="text-muted">Bounce rate {formatPercent(analyticsData.bounceRate)}</small>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <Nav variant="tabs" className="nav-tabs-custom">
            <NavItem>
              <NavLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} className="cursor-pointer">
                <IconifyIcon icon="ri:dashboard-line" className="me-2" />
                Overview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} className="cursor-pointer">
                <IconifyIcon icon="ri:line-chart-line" className="me-2" />
                Performance
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink active={activeTab === 'channels'} onClick={() => setActiveTab('channels')} className="cursor-pointer">
                <IconifyIcon icon="ri:smartphone-line" className="me-2" />
                Channels
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} className="cursor-pointer">
                <IconifyIcon icon="ri:megaphone-line" className="me-2" />
                Top Campaigns
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
        <CardBody>
          {activeTab === 'overview' && (
            <div className="tab-pane active">
              {trendsLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border me-2" role="status" />
                  Loading overview...
                </div>
              ) : groupedTrends.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No notification analytics are available for the selected filters.
                </Alert>
              ) : (
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
                              legend: { position: 'top' as const },
                              title: {
                                display: true,
                                text: 'Notifications performance by day',
                              },
                            },
                            scales: {
                              y: { beginAtZero: true },
                            },
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
                        {channelLoading || channelPerformance.length === 0 ? (
                          <Alert variant="light" className="border mb-0">
                            No channel distribution data is available.
                          </Alert>
                        ) : (
                          <Doughnut
                            data={channelData}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: { position: 'bottom' as const },
                              },
                            }}
                          />
                        )}
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <h6 className="mb-3">Quick Stats</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Bounce Rate</span>
                          <span className="text-danger">{formatPercent(analyticsData.bounceRate)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Total Campaigns</span>
                          <span className="text-info">{analyticsData.totalCampaigns}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Best Performing Day</span>
                          <span className="text-success">{bestDay}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Top Channel</span>
                          <span className="text-primary">{topChannel}</span>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="tab-pane active">
              {groupedTrends.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No engagement trend data is available.
                </Alert>
              ) : (
                <>
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
                                legend: { position: 'top' as const },
                                title: {
                                  display: true,
                                  text: 'Open and click rates over time',
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                },
                              },
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
                          <h3 className="text-primary">{analyticsData.totalSent.toLocaleString()}</h3>
                          <p className="text-muted mb-0">Total Sent</p>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <CardBody>
                          <h3 className="text-success">{analyticsData.totalDelivered.toLocaleString()}</h3>
                          <p className="text-muted mb-0">Total Delivered</p>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <CardBody>
                          <h3 className="text-info">{analyticsData.totalOpened.toLocaleString()}</h3>
                          <p className="text-muted mb-0">Total Opened</p>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <CardBody>
                          <h3 className="text-warning">{analyticsData.totalClicked.toLocaleString()}</h3>
                          <p className="text-muted mb-0">Total Clicked</p>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="tab-pane active">
              {channelPerformance.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No channel-level metrics are available.
                </Alert>
              ) : (
                <Row>
                  <Col md={6}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Channel Performance</h5>
                      </CardHeader>
                      <CardBody>
                        {channelPerformance.map((channel, index) => {
                          const variants = ['primary', 'success', 'warning', 'info']
                          const variant = variants[index % variants.length]
                          return (
                            <div className="mb-3" key={channel.type}>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-medium">{channel.type.toUpperCase()}</span>
                                <span className={`text-${variant}`}>{formatPercent(channel.openRate)}</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div className={`progress-bar bg-${variant}`} style={{ width: `${Math.min(channel.openRate, 100)}%` }} />
                              </div>
                            </div>
                          )
                        })}
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
                              {channelPerformance.map((channel: ChannelPerformance) => {
                                const clickRate =
                                  channel.totalOpened > 0 ? (channel.totalClicked / channel.totalOpened) * 100 : 0

                                return (
                                  <tr key={channel.type}>
                                    <td>
                                      <Badge bg={typeColors[channel.type as keyof typeof typeColors] || 'secondary'} className="text-uppercase">
                                        {channel.type}
                                      </Badge>
                                    </td>
                                    <td>{formatPercent(channel.deliveryRate)}</td>
                                    <td>{formatPercent(channel.openRate)}</td>
                                    <td>{formatPercent(clickRate)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </Table>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="tab-pane active">
              <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Top Performing Campaigns</h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Show</span>
                    <FormSelect
                      size="sm"
                      style={{ width: 'auto' }}
                      value={campaignPageSize}
                      onChange={(event) => {
                        setCampaignPageSize(Number(event.target.value))
                        setCampaignPage(1)
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </FormSelect>
                  </div>
                </CardHeader>
                <CardBody>
                  {campaignsLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border me-2" role="status" />
                      Loading campaigns...
                    </div>
                  ) : topCampaignsData.length === 0 ? (
                    <Alert variant="light" className="border mb-0">
                      No campaigns match the selected filters.
                    </Alert>
                  ) : (
                    <>
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
                            {topCampaignsData.map((campaign) => (
                              <tr key={campaign.id}>
                                <td>
                                  <strong>{campaign.name}</strong>
                                </td>
                                <td>
                                  <Badge bg={typeColors[campaign.type as keyof typeof typeColors] || 'secondary'} className="text-uppercase">
                                    {campaign.type}
                                  </Badge>
                                </td>
                                <td>{campaign.sent.toLocaleString()}</td>
                                <td>{campaign.opened.toLocaleString()}</td>
                                <td>{campaign.clicked.toLocaleString()}</td>
                                <td>{formatPercent(campaign.openRate)}</td>
                                <td>{formatPercent(campaign.clickRate)}</td>
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
                      {(topCampaignsResponse?.totalPages || 1) > 1 && (
                        <div className="d-flex justify-content-end mt-3">
                          <ul className="pagination mb-0">
                            <li className={`page-item ${campaignPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCampaignPage(Math.max(1, campaignPage - 1))}>
                                Previous
                              </button>
                            </li>
                            <li className="page-item disabled">
                              <span className="page-link">
                                Page {campaignPage} of {topCampaignsResponse?.totalPages || 1}
                              </span>
                            </li>
                            <li
                              className={`page-item ${
                                campaignPage >= (topCampaignsResponse?.totalPages || 1) ? 'disabled' : ''
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  setCampaignPage(
                                    Math.min(topCampaignsResponse?.totalPages || 1, campaignPage + 1)
                                  )
                                }
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default NotificationAnalyticsView
