'use client'

import { useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormSelect, Pagination, Row, Table } from 'react-bootstrap'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
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
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  useChannelPerformance,
  useNotificationAnalytics,
  usePerformanceTrends,
  useTopPerformingCampaigns,
  type AnalyticsFilters,
  type ChannelPerformance,
} from '@/hooks/useNotificationAnalytics'
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime'

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
  const grouped = new Map<string, { label: string; sent: number; delivered: number; opened: number; clicked: number }>()

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

const CHANNEL_META: Record<string, { label: string; badge: string }> = {
  sms: { label: 'SMS', badge: 'success' },
  email: { label: 'Email', badge: 'primary' },
  push: { label: 'Push', badge: 'warning' },
  'in-app': { label: 'In-App', badge: 'info' },
}

const NotificationAnalyticsView = () => {
  const router = useRouter()
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

  const deliveryTrendData = useMemo(() => {
    return {
      labels: groupedTrends.map((trend) => trend.label),
      datasets: [
        {
          label: 'Sent',
          data: groupedTrends.map((trend) => trend.sent),
          backgroundColor: 'rgba(54, 162, 235, 0.75)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Delivered',
          data: groupedTrends.map((trend) => trend.delivered),
          backgroundColor: 'rgba(75, 192, 192, 0.75)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    }
  }, [groupedTrends])

  const engagementTrendData = useMemo(() => {
    return {
      labels: groupedTrends.map((trend) => trend.label),
      datasets: [
        {
          label: 'Open Rate (%)',
          data: groupedTrends.map((trend) => (trend.delivered > 0 ? Number(((trend.opened / trend.delivered) * 100).toFixed(1)) : 0)),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.12)',
          tension: 0.35,
        },
        {
          label: 'Click Rate (%)',
          data: groupedTrends.map((trend) => (trend.opened > 0 ? Number(((trend.clicked / trend.opened) * 100).toFixed(1)) : 0)),
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.12)',
          tension: 0.35,
        },
      ],
    }
  }, [groupedTrends])

  const channelData = useMemo(() => {
    return {
      labels: channelPerformance.map((channel) => CHANNEL_META[channel.type]?.label || channel.type.toUpperCase()),
      datasets: [
        {
          data: channelPerformance.map((channel) => channel.totalSent),
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(0, 123, 255, 0.8)',
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
    return CHANNEL_META[ranked[0]?.type]?.label || ranked[0]?.type?.toUpperCase() || 'No data'
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
    link.download = `notification-reports-${dateRange}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Notification Reports</h1>
          <p className="text-muted mb-0">
            Review cross-channel delivery, engagement, and top campaign performance from one reporting workspace.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <FormSelect value={dateRange} onChange={(event) => setDateRange(event.target.value)} style={{ width: 'auto' }}>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </FormSelect>
          <FormSelect value={selectedChannel} onChange={(event) => setSelectedChannel(event.target.value)} style={{ width: 'auto' }}>
            <option value="all">All channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
            <option value="in-app">In-App</option>
          </FormSelect>
          <Button variant="light" onClick={() => router.push('/notifications/campaigns')}>
            <IconifyIcon icon="ri:megaphone-line" className="me-2" />
            Campaign Queue
          </Button>
          <Button variant="outline-primary" onClick={handleExportReport}>
            <IconifyIcon icon="ri:download-line" className="me-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {analyticsError ? (
        <Alert variant="danger" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Error loading analytics: {analyticsError.message}
        </Alert>
      ) : null}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <p className="text-muted mb-1">Total sent</p>
              <h4 className="mb-0">{analyticsLoading ? '—' : analyticsData.totalSent.toLocaleString()}</h4>
              <small className="text-muted">{analyticsData.totalCampaigns} campaigns</small>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <p className="text-muted mb-1">Delivery rate</p>
              <h4 className="mb-0">{analyticsLoading ? '—' : formatPercent(analyticsData.deliveryRate)}</h4>
              <small className="text-muted">{analyticsData.totalDelivered.toLocaleString()} delivered</small>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <p className="text-muted mb-1">Open rate</p>
              <h4 className="mb-0">{analyticsLoading ? '—' : formatPercent(analyticsData.openRate)}</h4>
              <small className="text-muted">{analyticsData.totalOpened.toLocaleString()} opens</small>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <p className="text-muted mb-1">Click rate</p>
              <h4 className="mb-0">{analyticsLoading ? '—' : formatPercent(analyticsData.clickRate)}</h4>
              <small className="text-muted">Bounce rate {formatPercent(analyticsData.bounceRate)}</small>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Delivery trend</h5>
            </CardHeader>
            <CardBody>
              {trendsLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border me-2" role="status" />
                  Loading trend data...
                </div>
              ) : groupedTrends.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No delivery trend data is available for the selected filters.
                </Alert>
              ) : (
                <Bar
                  data={deliveryTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: true, text: 'Sent vs delivered activity by day' },
                    },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Report snapshot</h5>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Best engagement day</span>
                <strong>{bestDay}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Top channel</span>
                <strong>{topChannel}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Delivered</span>
                <strong>{analyticsData.totalDelivered.toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Opened</span>
                <strong>{analyticsData.totalOpened.toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Clicked</span>
                <strong>{analyticsData.totalClicked.toLocaleString()}</strong>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Engagement trend</h5>
            </CardHeader>
            <CardBody>
              {groupedTrends.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No engagement trend data is available for the selected filters.
                </Alert>
              ) : (
                <Line
                  data={engagementTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: { display: true, text: 'Open and click rates over time' },
                    },
                    scales: { y: { beginAtZero: true, max: 100 } },
                  }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Channel mix</h5>
            </CardHeader>
            <CardBody>
              {channelLoading || channelPerformance.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No channel mix data is available.
                </Alert>
              ) : (
                <Doughnut
                  data={channelData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom' as const } },
                  }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <h5 className="mb-0">Channel comparison</h5>
                <Badge bg="light" text="dark">Cross-channel view</Badge>
              </div>
            </CardHeader>
            <CardBody>
              {channelPerformance.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No channel-level metrics are available.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table className="table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Channel</th>
                        <th>Campaigns</th>
                        <th>Sent</th>
                        <th>Delivery Rate</th>
                        <th>Open Rate</th>
                        <th>Click Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelPerformance.map((channel: ChannelPerformance) => {
                        const clickRate = channel.totalOpened > 0 ? (channel.totalClicked / channel.totalOpened) * 100 : 0

                        return (
                          <tr key={channel.type}>
                            <td>
                              <Badge bg={CHANNEL_META[channel.type]?.badge || 'secondary'} className="text-uppercase">
                                {CHANNEL_META[channel.type]?.label || channel.type}
                              </Badge>
                            </td>
                            <td>{channel.campaignCount}</td>
                            <td>{channel.totalSent.toLocaleString()}</td>
                            <td>{formatPercent(channel.deliveryRate)}</td>
                            <td>{formatPercent(channel.openRate)}</td>
                            <td>{formatPercent(clickRate)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <h5 className="mb-0">Top campaigns</h5>
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
                <Table className="table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Channel</th>
                      <th>Sent</th>
                      <th>Opened</th>
                      <th>Clicked</th>
                      <th>Open Rate</th>
                      <th>Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaignsData.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>
                          <strong>{campaign.name}</strong>
                        </td>
                        <td>
                          <Badge bg={CHANNEL_META[campaign.type]?.badge || 'secondary'} className="text-uppercase">
                            {CHANNEL_META[campaign.type]?.label || campaign.type}
                          </Badge>
                        </td>
                        <td>{campaign.sent.toLocaleString()}</td>
                        <td>{campaign.opened.toLocaleString()}</td>
                        <td>{campaign.clicked.toLocaleString()}</td>
                        <td>{formatPercent(campaign.openRate)}</td>
                        <td>{formatPercent(campaign.clickRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {(topCampaignsResponse?.totalPages || 1) > 1 ? (
                <div className="d-flex justify-content-end mt-3">
                  <Pagination className="mb-0">
                    <Pagination.Prev disabled={campaignPage === 1} onClick={() => setCampaignPage(Math.max(1, campaignPage - 1))} />
                    <Pagination.Item active>
                      Page {campaignPage} of {topCampaignsResponse?.totalPages || 1}
                    </Pagination.Item>
                    <Pagination.Next
                      disabled={campaignPage >= (topCampaignsResponse?.totalPages || 1)}
                      onClick={() => setCampaignPage(Math.min(topCampaignsResponse?.totalPages || 1, campaignPage + 1))}
                    />
                  </Pagination>
                </div>
              ) : null}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default NotificationAnalyticsView
