'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Modal,
  Button,
  Badge,
  Table,
  InputGroup,
  Row,
  Col,
  FormControl,
  FormSelect,
  FormLabel,
  ProgressBar,
  Pagination,
  Alert,
  Form,
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
  LineElement,
  PointElement,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  useListCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useCampaignsAnalytics,
  type Campaign,
} from '@/hooks/useNotificationCampaigns'
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime'
import { toast } from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement)

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0))

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'Not scheduled'
  }

  return new Date(value).toLocaleString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const buildPerformanceChart = (campaigns: Campaign[]) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().split('T')[0]
    return {
      key,
      label: date.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' }),
      sent: 0,
      delivered: 0,
      opened: 0,
    }
  })

  const buckets = new Map(days.map((day) => [day.key, day]))

  campaigns.forEach((campaign) => {
    const sourceDate = campaign.sent_at || campaign.createdAt || campaign.created_at
    if (!sourceDate) {
      return
    }

    const key = new Date(sourceDate).toISOString().split('T')[0]
    const bucket = buckets.get(key)
    if (!bucket) {
      return
    }

    bucket.sent += campaign.sentCount || 0
    bucket.delivered += campaign.deliveredCount || 0
    bucket.opened += campaign.openedCount || 0
  })

  return {
    labels: days.map((day) => day.label),
    datasets: [
      {
        label: 'Sent',
        data: days.map((day) => day.sent),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.12)',
        tension: 0.35,
      },
      {
        label: 'Delivered',
        data: days.map((day) => day.delivered),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.12)',
        tension: 0.35,
      },
      {
        label: 'Opened',
        data: days.map((day) => day.opened),
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.12)',
        tension: 0.35,
      },
    ],
  }
}

const NotificationCampaignsView = () => {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms' as 'sms' | 'email' | 'push' | 'in-app',
    template: '',
    audience: '',
    recipientsCount: '',
    scheduledDate: '',
    budget: '',
  })

  const { data: campaigns = [], isLoading, error } = useListCampaigns({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    limit: 200,
    offset: 0,
  })
  const { data: analytics, isLoading: analyticsLoading } = useCampaignsAnalytics()
  const createCampaignMutation = useCreateCampaign()
  const updateCampaignMutation = useUpdateCampaign()
  const deleteCampaignMutation = useDeleteCampaign()

  useNotificationRealtime({
    channelName: 'superadmin-notification-campaigns',
    tables: ['notification_campaigns'],
    queryKeys: [['campaigns'], ['campaigns-analytics'], ['notification_campaigns'], ['notification_analytics']],
  })

  const statusColors: Record<string, string> = {
    draft: 'secondary',
    scheduled: 'info',
    active: 'primary',
    completed: 'success',
    paused: 'warning',
    processing: 'warning',
    delivered: 'success',
    failed: 'danger',
  }

  const typeColors: Record<string, string> = {
    sms: 'success',
    email: 'primary',
    push: 'warning',
    'in-app': 'info',
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus
      const matchesType = selectedType === 'all' || campaign.type === selectedType
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !query ||
        campaign.name.toLowerCase().includes(query) ||
        campaign.audience.toLowerCase().includes(query) ||
        campaign.template.toLowerCase().includes(query)

      return matchesStatus && matchesType && matchesSearch
    })
  }, [campaigns, searchTerm, selectedStatus, selectedType])

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)

  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)
  const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent || 0), 0)
  const budgetUsedPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const statsData = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((campaign) => ['active', 'processing', 'scheduled'].includes(campaign.status)).length,
    totalSent: analytics?.totalSent || campaigns.reduce((sum, campaign) => sum + (campaign.sentCount || 0), 0),
    totalDelivered: analytics?.totalDelivered || campaigns.reduce((sum, campaign) => sum + (campaign.deliveredCount || 0), 0),
    totalOpened: analytics?.totalOpened || campaigns.reduce((sum, campaign) => sum + (campaign.openedCount || 0), 0),
    totalBudget,
    totalSpent,
    deliveryRate: analytics?.deliveryRate || 0,
    openRate: analytics?.openRate || 0,
    clickRate: analytics?.clickRate || 0,
  }

  const performanceData = useMemo(() => buildPerformanceChart(filteredCampaigns), [filteredCampaigns])

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sms',
      template: '',
      audience: '',
      recipientsCount: '',
      scheduledDate: '',
      budget: '',
    })
  }

  const handleCreateCampaign = async () => {
    if (!formData.name.trim() || !formData.audience.trim()) {
      toast.error('Campaign name and audience are required.')
      return
    }

    try {
      await createCampaignMutation.mutateAsync({
        name: formData.name.trim(),
        title: formData.name.trim(),
        type: formData.type,
        template: formData.template.trim() || undefined,
        audience: formData.audience.trim(),
        recipients_count: formData.recipientsCount ? Number(formData.recipientsCount) : undefined,
        scheduled_at: formData.scheduledDate || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
      })

      toast.success('Campaign created successfully.')
      setShowCreateModal(false)
      resetForm()
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to create campaign.')
    }
  }

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowDetailsModal(true)
  }

  const handleStatusUpdate = async (campaign: Campaign, status: Campaign['status']) => {
    try {
      const updates: Record<string, unknown> = { status }
      if (status === 'processing' && !campaign.sent_at) {
        updates.sent_at = new Date().toISOString()
      }

      const updatedCampaign = await updateCampaignMutation.mutateAsync({
        id: campaign.id,
        updates,
      })

      if (selectedCampaign?.id === updatedCampaign.id) {
        setSelectedCampaign(updatedCampaign)
      }

      toast.success(`Campaign ${status === 'processing' ? 'started' : status}.`)
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to update campaign.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) {
      return
    }

    try {
      await deleteCampaignMutation.mutateAsync(campaignToDelete.id)
      if (selectedCampaign?.id === campaignToDelete.id) {
        setSelectedCampaign(null)
        setShowDetailsModal(false)
      }
      toast.success('Campaign deleted successfully.')
      setCampaignToDelete(null)
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to delete campaign.')
    }
  }

  const getDeliveryRate = (campaign: Campaign) =>
    campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0.0'

  const getOpenRate = (campaign: Campaign) =>
    campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) : '0.0'

  const getClickRate = (campaign: Campaign) =>
    campaign.openedCount > 0 ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1) : '0.0'

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notification Campaigns</h1>
          <p className="text-muted">Create, manage, and track delivery performance across channels</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <IconifyIcon icon="ri:add-line" className="me-2" />
          Create Campaign
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-primary-subtle rounded p-2">
                    <IconifyIcon icon="ri:megaphone-line" className="text-primary fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Total Campaigns</p>
                  <h4 className="mb-0">{statsData.totalCampaigns}</h4>
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
                    <IconifyIcon icon="ri:play-circle-line" className="text-success fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Active / Scheduled</p>
                  <h4 className="mb-0">{statsData.activeCampaigns}</h4>
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
                    <IconifyIcon icon="ri:send-plane-line" className="text-info fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Delivered</p>
                  <h4 className="mb-0">{statsData.totalDelivered.toLocaleString()}</h4>
                  <small className="text-muted">Open rate {statsData.openRate.toFixed(1)}%</small>
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
                    <IconifyIcon icon="ri:money-dollar-circle-line" className="text-warning fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Tracked Budget</p>
                  <h4 className="mb-0">{formatMoney(statsData.totalSpent)}</h4>
                  <small className="text-muted">
                    {statsData.totalBudget > 0 ? `${formatMoney(statsData.totalBudget)} allocated` : 'No budget tracked'}
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <Nav variant="tabs" className="nav-tabs-custom">
            <NavItem>
              <NavLink active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} className="cursor-pointer">
                <IconifyIcon icon="ri:megaphone-line" className="me-2" />
                Campaigns
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} className="cursor-pointer">
                <IconifyIcon icon="ri:line-chart-line" className="me-2" />
                Performance
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
        <CardBody>
          {activeTab === 'campaigns' && (
            <div className="tab-pane active">
              <Row className="mb-4">
                <Col md={3}>
                  <FormLabel>Campaign Status</FormLabel>
                  <FormSelect
                    value={selectedStatus}
                    onChange={(event) => {
                      setSelectedStatus(event.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="processing">Processing</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </FormSelect>
                </Col>
                <Col md={3}>
                  <FormLabel>Campaign Type</FormLabel>
                  <FormSelect
                    value={selectedType}
                    onChange={(event) => {
                      setSelectedType(event.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="in-app">In-App</option>
                  </FormSelect>
                </Col>
                <Col md={6}>
                  <FormLabel>Search Campaigns</FormLabel>
                  <InputGroup>
                    <InputGroup.Text>
                      <IconifyIcon icon="ri:search-line" />
                    </InputGroup.Text>
                    <FormControl
                      type="text"
                      placeholder="Search by campaign name, audience, or template..."
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </InputGroup>
                </Col>
              </Row>

              {error && (
                <Alert variant="danger" className="mb-3">
                  <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                  Error loading campaigns: {error.message}
                </Alert>
              )}

              <div className="table-responsive">
                <Table className="table-hover">
                  <thead>
                    <tr>
                      <th>Campaign Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Audience</th>
                      <th>Performance</th>
                      <th>Budget</th>
                      <th>Scheduled</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="d-flex justify-content-center align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status" />
                            Loading campaigns...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-muted">
                          <IconifyIcon icon="ri:inbox-line" className="fs-2 mb-2 d-block" />
                          No campaigns found
                        </td>
                      </tr>
                    ) : (
                      paginatedCampaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td>
                            <div>
                              <strong>{campaign.name}</strong>
                              <div className="text-muted small">{campaign.template || 'No template label provided'}</div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={typeColors[campaign.type]} className="text-uppercase">
                              {campaign.type}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={statusColors[campaign.status] || 'secondary'} className="text-capitalize">
                              {campaign.status}
                            </Badge>
                          </td>
                          <td>
                            <div>
                              <strong>{campaign.audience || 'Unspecified audience'}</strong>
                              <div className="text-muted small">{campaign.audienceCount.toLocaleString()} recipients</div>
                            </div>
                          </td>
                          <td>
                            {campaign.sentCount > 0 ? (
                              <div className="small">
                                <div>Sent: {campaign.sentCount.toLocaleString()}</div>
                                <div>Delivery: {getDeliveryRate(campaign)}%</div>
                                <div>Open Rate: {getOpenRate(campaign)}%</div>
                              </div>
                            ) : (
                              <span className="text-muted">No delivery activity yet</span>
                            )}
                          </td>
                          <td>
                            {campaign.budget ? (
                              <div>
                                <div>{formatMoney(campaign.spent)} / {formatMoney(campaign.budget)}</div>
                                <ProgressBar
                                  variant="info"
                                  now={campaign.budget > 0 ? Math.min(((campaign.spent || 0) / campaign.budget) * 100, 100) : 0}
                                  style={{ height: '4px' }}
                                />
                              </div>
                            ) : (
                              <span className="text-muted">No budget tracked</span>
                            )}
                          </td>
                          <td>{formatDateTime(campaign.scheduledDate)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-info" onClick={() => handleViewDetails(campaign)}>
                                <IconifyIcon icon="ri:eye-line" />
                              </Button>
                              {['draft', 'scheduled', 'paused'].includes(campaign.status) && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleStatusUpdate(campaign, 'processing')}
                                >
                                  <IconifyIcon icon={campaign.status === 'paused' ? 'ri:play-line' : 'ri:send-plane-line'} />
                                </Button>
                              )}
                              {campaign.status === 'processing' && (
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => handleStatusUpdate(campaign, 'paused')}
                                >
                                  <IconifyIcon icon="ri:pause-line" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline-danger" onClick={() => setCampaignToDelete(campaign)}>
                                <IconifyIcon icon="ri:delete-bin-line" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {filteredCampaigns.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted">Show:</span>
                      <Form.Select
                        size="sm"
                        style={{ width: 'auto' }}
                        value={itemsPerPage}
                        onChange={(event) => {
                          setItemsPerPage(Number(event.target.value))
                          setCurrentPage(1)
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </Form.Select>
                      <span className="text-muted">entries</span>
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <Pagination className="mb-0">
                      <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                      {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index
                        if (pageNum <= totalPages) {
                          return (
                            <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                              {pageNum}
                            </Pagination.Item>
                          )
                        }
                        return null
                      })}
                      <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
                    </Pagination>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="tab-pane active">
              {analyticsLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border me-2" role="status" />
                  Loading analytics data...
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <Alert variant="light" className="border mb-0">
                  No campaign performance data is available for the current filters.
                </Alert>
              ) : (
                <Row>
                  <Col md={12}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Campaign Performance Overview</h5>
                      </CardHeader>
                      <CardBody>
                        <Line
                          data={performanceData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { position: 'top' as const },
                              title: {
                                display: true,
                                text: 'Delivery activity over the last 7 days',
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
                  <Col md={4} className="mt-4">
                    <Card className="h-100">
                      <CardBody>
                        <h6 className="text-muted">Delivery Rate</h6>
                        <h3 className="mb-1">{statsData.deliveryRate.toFixed(1)}%</h3>
                        <small className="text-muted">{statsData.totalDelivered.toLocaleString()} delivered from {statsData.totalSent.toLocaleString()} sent</small>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4} className="mt-4">
                    <Card className="h-100">
                      <CardBody>
                        <h6 className="text-muted">Open Rate</h6>
                        <h3 className="mb-1">{statsData.openRate.toFixed(1)}%</h3>
                        <small className="text-muted">{statsData.totalOpened.toLocaleString()} opens recorded</small>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4} className="mt-4">
                    <Card className="h-100">
                      <CardBody>
                        <h6 className="text-muted">Budget Utilization</h6>
                        <h3 className="mb-1">{budgetUsedPct.toFixed(1)}%</h3>
                        <small className="text-muted">
                          {statsData.totalBudget > 0 ? `${formatMoney(statsData.totalSpent)} spent of ${formatMoney(statsData.totalBudget)}` : 'No tracked budget'}
                        </small>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Campaign Type</FormLabel>
                  <FormSelect
                    value={formData.type}
                    onChange={(event) => setFormData({ ...formData, type: event.target.value as Campaign['type'] })}
                  >
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="push">Push Notification</option>
                    <option value="in-app">In-App Notification</option>
                  </FormSelect>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Template Label</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.template}
                    onChange={(event) => setFormData({ ...formData, template: event.target.value })}
                    placeholder="Optional template or campaign reference"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.audience}
                    onChange={(event) => setFormData({ ...formData, audience: event.target.value })}
                    placeholder="e.g. all-residents, overdue-residents, guards"
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Planned Recipient Count</FormLabel>
                  <FormControl
                    type="number"
                    min={0}
                    value={formData.recipientsCount}
                    onChange={(event) => setFormData({ ...formData, recipientsCount: event.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Budget (Optional)</FormLabel>
                  <FormControl
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.budget}
                    onChange={(event) => setFormData({ ...formData, budget: event.target.value })}
                    placeholder="Budget in GH₵"
                  />
                </div>
              </Col>
            </Row>
            <div className="mb-3">
              <FormLabel>Schedule Date (Optional)</FormLabel>
              <FormControl
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(event) => setFormData({ ...formData, scheduledDate: event.target.value })}
              />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
            {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Campaign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Campaign Name:</strong> {selectedCampaign.name}
                </Col>
                <Col md={6}>
                  <strong>Type:</strong>{' '}
                  <Badge bg={typeColors[selectedCampaign.type]} className="text-uppercase">
                    {selectedCampaign.type}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong>{' '}
                  <Badge bg={statusColors[selectedCampaign.status] || 'secondary'} className="text-capitalize">
                    {selectedCampaign.status}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Template:</strong> {selectedCampaign.template || 'Not set'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Audience:</strong> {selectedCampaign.audience || 'Not set'}
                </Col>
                <Col md={6}>
                  <strong>Recipients:</strong> {selectedCampaign.audienceCount.toLocaleString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Created:</strong> {formatDateTime(selectedCampaign.createdAt)}
                </Col>
                <Col md={6}>
                  <strong>Scheduled:</strong> {formatDateTime(selectedCampaign.scheduledDate)}
                </Col>
              </Row>

              <h6 className="mt-4 mb-3">Performance Metrics</h6>
              <Row className="mb-3">
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.sentCount.toLocaleString()}</h4>
                    <small className="text-muted">Sent</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.deliveredCount.toLocaleString()}</h4>
                    <small className="text-muted">Delivered</small>
                    <div className="small text-success">{getDeliveryRate(selectedCampaign)}%</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.openedCount.toLocaleString()}</h4>
                    <small className="text-muted">Opened</small>
                    <div className="small text-info">{getOpenRate(selectedCampaign)}%</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.clickedCount.toLocaleString()}</h4>
                    <small className="text-muted">Clicked</small>
                    <div className="small text-warning">{getClickRate(selectedCampaign)}%</div>
                  </div>
                </Col>
              </Row>

              <h6 className="mt-4 mb-3">Budget Information</h6>
              <Row>
                <Col md={6}>
                  <strong>Total Budget:</strong> {selectedCampaign.budget ? formatMoney(selectedCampaign.budget) : 'Not tracked'}
                </Col>
                <Col md={6}>
                  <strong>Amount Spent:</strong> {selectedCampaign.spent ? formatMoney(selectedCampaign.spent) : formatMoney(0)}
                </Col>
              </Row>
              {selectedCampaign.budget ? (
                <ProgressBar
                  className="mt-2"
                  variant="warning"
                  now={selectedCampaign.budget > 0 ? Math.min(((selectedCampaign.spent || 0) / selectedCampaign.budget) * 100, 100) : 0}
                  label={`${selectedCampaign.budget > 0 ? (((selectedCampaign.spent || 0) / selectedCampaign.budget) * 100).toFixed(1) : '0.0'}%`}
                />
              ) : null}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedCampaign && ['draft', 'scheduled', 'paused'].includes(selectedCampaign.status) && (
            <Button
              variant="success"
              onClick={() => handleStatusUpdate(selectedCampaign, 'processing')}
              disabled={updateCampaignMutation.isPending}
            >
              {selectedCampaign.status === 'paused' ? 'Resume Campaign' : 'Start Campaign'}
            </Button>
          )}
          {selectedCampaign?.status === 'processing' && (
            <Button
              variant="warning"
              onClick={() => handleStatusUpdate(selectedCampaign, 'paused')}
              disabled={updateCampaignMutation.isPending}
            >
              Pause Campaign
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(campaignToDelete)} onHide={() => setCampaignToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {campaignToDelete ? `Delete "${campaignToDelete.name}"? This action cannot be undone.` : ''}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCampaignToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleteCampaignMutation.isPending}>
            {deleteCampaignMutation.isPending ? 'Deleting...' : 'Delete Campaign'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default NotificationCampaignsView
