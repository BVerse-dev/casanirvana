'use client'

import { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormControl,
  FormLabel,
  FormSelect,
  InputGroup,
  Modal,
  Pagination,
  Row,
  Table,
} from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  useCreateCampaign,
  useDeleteCampaign,
  useListCampaigns,
  useUpdateCampaign,
  type Campaign,
} from '@/hooks/useNotificationCampaigns'
import { useNotificationRealtime } from '@/hooks/useNotificationRealtime'
import { useListNotificationTemplates } from '@/hooks/useNotificationTemplates'

const formatDateTime = (value?: string | null, fallback = 'Not scheduled') => {
  if (!value) {
    return fallback
  }

  return new Date(value).toLocaleString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (amount?: number | null) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0))

const CHANNEL_META: Record<Campaign['type'], { label: string; badge: string; icon: string; help: string }> = {
  sms: {
    label: 'SMS',
    badge: 'success',
    icon: 'ri:message-2-line',
    help: 'Use concise copy for time-sensitive resident and staff messaging.',
  },
  email: {
    label: 'Email',
    badge: 'primary',
    icon: 'ri:mail-line',
    help: 'Best for longer-form notices, billing communication, and official summaries.',
  },
  push: {
    label: 'Push',
    badge: 'warning',
    icon: 'ri:notification-3-line',
    help: 'Use for urgent app alerts where quick visibility matters most.',
  },
  'in-app': {
    label: 'In-App',
    badge: 'info',
    icon: 'ri:chat-4-line',
    help: 'Keep long-running journeys and contextual updates inside the platform experience.',
  },
}

const STATUS_META: Record<Campaign['status'], { label: string; badge: string }> = {
  draft: { label: 'Draft', badge: 'secondary' },
  scheduled: { label: 'Scheduled', badge: 'info' },
  active: { label: 'Active', badge: 'primary' },
  completed: { label: 'Delivered', badge: 'success' },
  paused: { label: 'Paused', badge: 'warning' },
  processing: { label: 'In Flight', badge: 'primary' },
  delivered: { label: 'Delivered', badge: 'success' },
  failed: { label: 'Failed', badge: 'danger' },
}

type WorkflowKey = 'all' | 'draft' | 'scheduled' | 'active' | 'completed' | 'failed'

const WORKFLOW_FILTERS: Array<{
  key: WorkflowKey
  label: string
  matches: (campaign: Campaign) => boolean
}> = [
  { key: 'all', label: 'All campaigns', matches: () => true },
  { key: 'draft', label: 'Drafts', matches: (campaign) => campaign.status === 'draft' },
  { key: 'scheduled', label: 'Scheduled', matches: (campaign) => campaign.status === 'scheduled' },
  { key: 'active', label: 'In flight', matches: (campaign) => ['processing', 'active'].includes(campaign.status) },
  { key: 'completed', label: 'Delivered', matches: (campaign) => ['completed', 'delivered'].includes(campaign.status) },
  { key: 'failed', label: 'Needs attention', matches: (campaign) => ['failed', 'paused'].includes(campaign.status) },
]

const AUDIENCE_PRESETS = [
  { value: 'all-residents', label: 'All residents' },
  { value: 'all-guards', label: 'All guards' },
  { value: 'community-admins', label: 'Community admins' },
  { value: 'overdue-residents', label: 'Residents with unpaid charges' },
  { value: 'custom', label: 'Custom audience' },
]

interface TemplateOption {
  id: string
  name: string
  type: Campaign['type']
  category: string
  status: string
  variables: string[]
}

const getDeliveryRate = (campaign: Campaign) =>
  campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0.0'

const getOpenRate = (campaign: Campaign) =>
  campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) : '0.0'

const getClickRate = (campaign: Campaign) =>
  campaign.openedCount > 0 ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1) : '0.0'

const getCampaignWindowLabel = (campaign: Campaign) => {
  if (campaign.status === 'scheduled' && campaign.scheduled_at) {
    return `Scheduled for ${formatDateTime(campaign.scheduled_at)}`
  }

  if (campaign.sent_at) {
    return `Last sent ${formatDateTime(campaign.sent_at, 'Not sent')}`
  }

  return `Updated ${formatDateTime(campaign.updated_at, 'Not updated')}`
}

const NotificationCampaignsView = () => {
  const router = useRouter()

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowKey>('all')
  const [selectedType, setSelectedType] = useState<'all' | Campaign['type']>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms' as Campaign['type'],
    templateId: '',
    audiencePreset: 'all-residents',
    audience: '',
    recipientsCount: '',
    scheduledDate: '',
    budget: '',
  })

  const { data: campaigns = [], isLoading, error } = useListCampaigns({ limit: 200, offset: 0 })
  const { data: templates = [] } = useListNotificationTemplates()
  const createCampaignMutation = useCreateCampaign()
  const updateCampaignMutation = useUpdateCampaign()
  const deleteCampaignMutation = useDeleteCampaign()

  useNotificationRealtime({
    channelName: 'superadmin-notification-campaigns',
    tables: ['notification_campaigns', 'notification_templates'],
    queryKeys: [['campaigns'], ['notification-templates'], ['notification_campaigns']],
  })

  const templateOptions = useMemo<TemplateOption[]>(() => {
    return templates.map((template) => ({
      id: String(template.id ?? ''),
      name: template.template_name || template.name || 'Untitled template',
      type: ((template.type || 'sms') as Campaign['type']) || 'sms',
      category: template.category || 'general',
      status: template.status || 'draft',
      variables: template.variables || [],
    }))
  }, [templates])

  const filteredTemplateOptions = useMemo(() => {
    return templateOptions.filter((template) => template.status !== 'archived' && template.type === formData.type)
  }, [formData.type, templateOptions])

  const selectedTemplate = useMemo(
    () => templateOptions.find((template) => template.id === formData.templateId) ?? null,
    [formData.templateId, templateOptions]
  )

  const workflowCounts = useMemo(() => {
    return WORKFLOW_FILTERS.reduce<Record<WorkflowKey, number>>((accumulator, workflow) => {
      accumulator[workflow.key] = campaigns.filter(workflow.matches).length
      return accumulator
    }, { all: 0, draft: 0, scheduled: 0, active: 0, completed: 0, failed: 0 })
  }, [campaigns])

  const filteredCampaigns = useMemo(() => {
    const workflowMatcher = WORKFLOW_FILTERS.find((workflow) => workflow.key === selectedWorkflow)?.matches ?? (() => true)
    const query = searchTerm.trim().toLowerCase()

    return campaigns.filter((campaign) => {
      const matchesWorkflow = workflowMatcher(campaign)
      const matchesType = selectedType === 'all' || campaign.type === selectedType
      const matchesSearch =
        !query ||
        campaign.name.toLowerCase().includes(query) ||
        campaign.audience.toLowerCase().includes(query) ||
        campaign.template.toLowerCase().includes(query)

      return matchesWorkflow && matchesType && matchesSearch
    })
  }, [campaigns, searchTerm, selectedType, selectedWorkflow])

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)

  const operationsSummary = useMemo(() => {
    return {
      total: campaigns.length,
      drafts: workflowCounts.draft,
      scheduled: workflowCounts.scheduled,
      inflight: workflowCounts.active,
      attention: workflowCounts.failed,
      delivered: workflowCounts.completed,
    }
  }, [campaigns.length, workflowCounts])

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sms',
      templateId: '',
      audiencePreset: 'all-residents',
      audience: '',
      recipientsCount: '',
      scheduledDate: '',
      budget: '',
    })
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetForm()
  }

  const handleCreateCampaign = async (status: 'draft' | 'scheduled' | 'processing') => {
    if (!formData.name.trim()) {
      toast.error('Campaign name is required.')
      return
    }

    const audience = formData.audiencePreset === 'custom' ? formData.audience.trim() : formData.audiencePreset
    if (!audience) {
      toast.error('Select or enter a target audience before creating the campaign.')
      return
    }

    if (status === 'scheduled' && !formData.scheduledDate) {
      toast.error('Pick a delivery time before scheduling this campaign.')
      return
    }

    try {
      await createCampaignMutation.mutateAsync({
        name: formData.name.trim(),
        title: formData.name.trim(),
        type: formData.type,
        template: selectedTemplate?.name,
        template_id: selectedTemplate ? Number(selectedTemplate.id) : null,
        audience,
        recipients_count: formData.recipientsCount ? Number(formData.recipientsCount) : undefined,
        scheduled_at:
          status === 'processing' ? undefined : formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        status,
        sent_at: status === 'processing' ? new Date().toISOString() : undefined,
      })

      toast.success(
        status === 'draft'
          ? 'Campaign saved as draft.'
          : status === 'scheduled'
            ? 'Campaign scheduled successfully.'
            : 'Campaign moved into the delivery queue.'
      )
      closeCreateModal()
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
      if (status === 'scheduled' && !campaign.scheduled_at) {
        updates.scheduled_at = new Date().toISOString()
      }

      const updatedCampaign = await updateCampaignMutation.mutateAsync({
        id: campaign.id,
        updates,
      })

      if (selectedCampaign?.id === updatedCampaign.id) {
        setSelectedCampaign(updatedCampaign)
      }

      toast.success(
        status === 'processing'
          ? 'Campaign moved into the delivery queue.'
          : status === 'paused'
            ? 'Campaign paused.'
            : status === 'scheduled'
              ? 'Campaign moved back to scheduled.'
              : `Campaign ${STATUS_META[status].label.toLowerCase()}.`
      )
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

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Notification Campaigns</h1>
          <p className="text-muted mb-0">
            Run one cross-channel delivery queue for push, SMS, email, and in-app communication.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="light" onClick={() => router.push('/notifications/templates')}>
            <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
            Template Library
          </Button>
          <Button variant="light" onClick={() => router.push('/notifications/analytics')}>
            <IconifyIcon icon="ri:bar-chart-box-line" className="me-2" />
            View Reports
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <IconifyIcon icon="ri:add-line" className="me-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-primary-subtle rounded p-2">
                  <IconifyIcon icon="ri:megaphone-line" className="text-primary fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Total campaigns</p>
                  <h4 className="mb-0">{operationsSummary.total}</h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-info-subtle rounded p-2">
                  <IconifyIcon icon="ri:calendar-schedule-line" className="text-info fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Drafts + scheduled</p>
                  <h4 className="mb-0">{operationsSummary.drafts + operationsSummary.scheduled}</h4>
                  <small className="text-muted">{operationsSummary.scheduled} waiting to send</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-success-subtle rounded p-2">
                  <IconifyIcon icon="ri:send-plane-line" className="text-success fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">In flight</p>
                  <h4 className="mb-0">{operationsSummary.inflight}</h4>
                  <small className="text-muted">{operationsSummary.delivered} delivered this cycle</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-danger-subtle rounded p-2">
                  <IconifyIcon icon="ri:error-warning-line" className="text-danger fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Needs attention</p>
                  <h4 className="mb-0">{operationsSummary.attention}</h4>
                  <small className="text-muted">Paused or failed delivery jobs</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <div className="d-flex flex-column gap-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="mb-1">Cross-channel queue</h5>
                <p className="text-muted mb-0">Use one workflow for drafts, scheduled sends, live deliveries, and follow-up remediation.</p>
              </div>
              <ButtonGroup aria-label="Campaign workflow filters">
                {WORKFLOW_FILTERS.map((workflow) => (
                  <Button
                    key={workflow.key}
                    variant={selectedWorkflow === workflow.key ? 'primary' : 'light'}
                    onClick={() => {
                      setSelectedWorkflow(workflow.key)
                      setCurrentPage(1)
                    }}
                  >
                    {workflow.label}
                    <Badge bg={selectedWorkflow === workflow.key ? 'light' : 'secondary'} text={selectedWorkflow === workflow.key ? 'dark' : undefined} className="ms-2">
                      {workflowCounts[workflow.key]}
                    </Badge>
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {(['all', 'sms', 'email', 'push', 'in-app'] as const).map((type) => {
                const isActive = selectedType === type
                const meta = type === 'all' ? null : CHANNEL_META[type]
                return (
                  <Button
                    key={type}
                    variant={isActive ? 'dark' : 'light'}
                    size="sm"
                    onClick={() => {
                      setSelectedType(type)
                      setCurrentPage(1)
                    }}
                  >
                    {meta ? <IconifyIcon icon={meta.icon} className="me-2" /> : null}
                    {type === 'all' ? 'All channels' : meta?.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Row className="mb-4">
            <Col lg={8}>
              <FormLabel>Search campaigns</FormLabel>
              <InputGroup>
                <InputGroup.Text>
                  <IconifyIcon icon="ri:search-line" />
                </InputGroup.Text>
                <FormControl
                  type="text"
                  placeholder="Search by name, audience, or linked template..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                  }}
                />
              </InputGroup>
            </Col>
            <Col lg={4}>
              <FormLabel>Rows per page</FormLabel>
              <FormSelect
                value={itemsPerPage}
                onChange={(event) => {
                  setItemsPerPage(Number(event.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </FormSelect>
            </Col>
          </Row>

          {selectedType !== 'all' ? (
            <Alert variant="light" className="border mb-4">
              <div className="d-flex align-items-start gap-2">
                <IconifyIcon icon={CHANNEL_META[selectedType].icon} className="fs-5 mt-1" />
                <div>
                  <strong>{CHANNEL_META[selectedType].label} workflow</strong>
                  <div className="text-muted">{CHANNEL_META[selectedType].help}</div>
                </div>
              </div>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="danger" className="mb-3">
              <IconifyIcon icon="ri:error-warning-line" className="me-2" />
              Error loading campaigns: {error.message}
            </Alert>
          ) : null}

          <div className="table-responsive">
            <Table className="table-hover align-middle">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Channel</th>
                  <th>Workflow</th>
                  <th>Audience</th>
                  <th>Delivery Window</th>
                  <th>Reach</th>
                  <th>Linked Template</th>
                  <th className="text-end">Actions</th>
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
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <IconifyIcon icon="ri:inbox-line" className="fs-2 mb-2 d-block" />
                      No campaigns match the current workflow and channel filters.
                    </td>
                  </tr>
                ) : (
                  paginatedCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <div>
                          <strong>{campaign.name}</strong>
                          <div className="text-muted small">Created {formatDateTime(campaign.createdAt, 'Not created')}</div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={CHANNEL_META[campaign.type].badge} className="text-uppercase">
                          {CHANNEL_META[campaign.type].label}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={STATUS_META[campaign.status].badge}>{STATUS_META[campaign.status].label}</Badge>
                      </td>
                      <td>
                        <div>
                          <strong>{campaign.audience || 'Unspecified audience'}</strong>
                          <div className="text-muted small">{campaign.audienceCount.toLocaleString()} planned recipients</div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div>{getCampaignWindowLabel(campaign)}</div>
                          {campaign.scheduled_at && campaign.status !== 'scheduled' ? (
                            <div className="text-muted">Scheduled {formatDateTime(campaign.scheduled_at)}</div>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div>Sent {campaign.sentCount.toLocaleString()}</div>
                          <div>Delivered {getDeliveryRate(campaign)}%</div>
                          <div>Opened {getOpenRate(campaign)}%</div>
                        </div>
                      </td>
                      <td>
                        {campaign.template ? (
                          <div>
                            <strong>{campaign.template}</strong>
                            {campaign.budget ? <div className="text-muted small">Budget {formatMoney(campaign.budget)}</div> : null}
                          </div>
                        ) : (
                          <span className="text-muted">No linked template</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-info" onClick={() => handleViewDetails(campaign)}>
                            <IconifyIcon icon="ri:eye-line" />
                          </Button>
                          {['draft', 'scheduled', 'paused', 'failed'].includes(campaign.status) ? (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleStatusUpdate(campaign, 'processing')}
                            >
                              <IconifyIcon icon="ri:send-plane-line" />
                            </Button>
                          ) : null}
                          {campaign.status === 'processing' ? (
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleStatusUpdate(campaign, 'paused')}
                            >
                              <IconifyIcon icon="ri:pause-line" />
                            </Button>
                          ) : null}
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

          {filteredCampaigns.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
              <span className="text-muted">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
              </span>
              {totalPages > 1 ? (
                <Pagination className="mb-0">
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index
                    return pageNum <= totalPages ? (
                      <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </Pagination.Item>
                    ) : null
                  })}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
                </Pagination>
              ) : null}
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Modal show={showCreateModal} onHide={closeCreateModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Campaign name</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Resident billing reminder"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Channel</FormLabel>
                  <FormSelect
                    value={formData.type}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        type: event.target.value as Campaign['type'],
                        templateId: '',
                      })
                    }
                  >
                    {Object.entries(CHANNEL_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </Col>
            </Row>
            <Alert variant="light" className="border">
              <div className="d-flex align-items-start gap-2">
                <IconifyIcon icon={CHANNEL_META[formData.type].icon} className="fs-5 mt-1" />
                <div>
                  <strong>{CHANNEL_META[formData.type].label} campaign</strong>
                  <div className="text-muted">{CHANNEL_META[formData.type].help}</div>
                </div>
              </div>
            </Alert>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Linked template</FormLabel>
                  <FormSelect
                    value={formData.templateId}
                    onChange={(event) => setFormData({ ...formData, templateId: event.target.value })}
                  >
                    <option value="">Create without linking a template</option>
                    {filteredTemplateOptions.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </FormSelect>
                  <div className="form-text">
                    Templates are managed centrally so campaign operations stay clean and reusable.
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Audience</FormLabel>
                  <FormSelect
                    value={formData.audiencePreset}
                    onChange={(event) => setFormData({ ...formData, audiencePreset: event.target.value })}
                  >
                    {AUDIENCE_PRESETS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </Col>
            </Row>
            {formData.audiencePreset === 'custom' ? (
              <div className="mb-3">
                <FormLabel>Custom audience definition</FormLabel>
                <FormControl
                  type="text"
                  value={formData.audience}
                  onChange={(event) => setFormData({ ...formData, audience: event.target.value })}
                  placeholder="e.g. Casa Nirvana block A residents with unpaid water bills"
                />
              </div>
            ) : null}
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Planned recipient count</FormLabel>
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
                  <FormLabel>Budget (optional)</FormLabel>
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
            <div className="mb-0">
              <FormLabel>Schedule for later</FormLabel>
              <FormControl
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(event) => setFormData({ ...formData, scheduledDate: event.target.value })}
              />
              <div className="form-text">Leave blank to keep the campaign as a draft or push it into the queue immediately.</div>
            </div>
            {selectedTemplate ? (
              <Alert variant="light" className="border mt-3 mb-0">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <strong>{selectedTemplate.name}</strong>
                    <div className="text-muted small text-capitalize">
                      {selectedTemplate.category} · {selectedTemplate.status}
                    </div>
                  </div>
                  <span className="text-muted small">{selectedTemplate.variables.length} variables</span>
                </div>
              </Alert>
            ) : null}
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={closeCreateModal}>
            Cancel
          </Button>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="light"
              onClick={() => handleCreateCampaign('draft')}
              disabled={createCampaignMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => handleCreateCampaign('scheduled')}
              disabled={createCampaignMutation.isPending}
            >
              Schedule Send
            </Button>
            <Button
              variant="primary"
              onClick={() => handleCreateCampaign('processing')}
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? 'Submitting...' : 'Send to Queue'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Campaign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCampaign ? (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Campaign name:</strong> {selectedCampaign.name}
                </Col>
                <Col md={6}>
                  <strong>Channel:</strong>{' '}
                  <Badge bg={CHANNEL_META[selectedCampaign.type].badge}>{CHANNEL_META[selectedCampaign.type].label}</Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Workflow:</strong>{' '}
                  <Badge bg={STATUS_META[selectedCampaign.status].badge}>{STATUS_META[selectedCampaign.status].label}</Badge>
                </Col>
                <Col md={6}>
                  <strong>Linked template:</strong> {selectedCampaign.template || 'No linked template'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Audience:</strong> {selectedCampaign.audience || 'Not set'}
                </Col>
                <Col md={6}>
                  <strong>Planned recipients:</strong> {selectedCampaign.audienceCount.toLocaleString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Created:</strong> {formatDateTime(selectedCampaign.createdAt, 'Not created')}
                </Col>
                <Col md={6}>
                  <strong>Delivery window:</strong>{' '}
                  {selectedCampaign.status === 'scheduled'
                    ? formatDateTime(selectedCampaign.scheduled_at)
                    : formatDateTime(selectedCampaign.sent_at, 'Not sent yet')}
                </Col>
              </Row>

              <h6 className="mt-4 mb-3">Delivery Metrics</h6>
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

              <h6 className="mt-4 mb-3">Operations Context</h6>
              <Row>
                <Col md={6}>
                  <strong>Budget:</strong> {selectedCampaign.budget ? formatMoney(selectedCampaign.budget) : 'Not tracked'}
                </Col>
                <Col md={6}>
                  <strong>Spend:</strong> {formatMoney(selectedCampaign.spent || 0)}
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <strong>Last updated:</strong> {formatDateTime(selectedCampaign.updated_at, 'Not updated')}
                </Col>
                <Col md={6}>
                  <strong>Failed deliveries:</strong> {selectedCampaign.failed_count.toLocaleString()}
                </Col>
              </Row>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedCampaign && ['draft', 'scheduled', 'paused', 'failed'].includes(selectedCampaign.status) ? (
            <Button
              variant="success"
              onClick={() => handleStatusUpdate(selectedCampaign, 'processing')}
              disabled={updateCampaignMutation.isPending}
            >
              Send to Queue
            </Button>
          ) : null}
          {selectedCampaign?.status === 'processing' ? (
            <Button
              variant="warning"
              onClick={() => handleStatusUpdate(selectedCampaign, 'paused')}
              disabled={updateCampaignMutation.isPending}
            >
              Pause Campaign
            </Button>
          ) : null}
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
