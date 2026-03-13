'use client'

import { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
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
  useCreateNotificationTemplate,
  useDeleteNotificationTemplate,
  useListNotificationTemplates,
  useUpdateNotificationTemplate,
} from '@/hooks/useNotificationTemplates'

interface TransformedTemplate {
  id: string
  name: string
  type: 'sms' | 'email' | 'push' | 'in-app'
  category: string
  subject?: string
  content: string
  variables: string[]
  createdAt: string
  updatedAt: string
  status: 'active' | 'draft' | 'archived'
  usageCount: number
  lastUsed?: string
}

const CHANNEL_META: Record<TransformedTemplate['type'], { label: string; badge: string; icon: string; help: string }> = {
  sms: {
    label: 'SMS',
    badge: 'success',
    icon: 'ri:message-2-line',
    help: 'Keep copy short and direct for urgent resident and guard communication.',
  },
  email: {
    label: 'Email',
    badge: 'primary',
    icon: 'ri:mail-line',
    help: 'Use structured content with subjects for official and longer-form updates.',
  },
  push: {
    label: 'Push',
    badge: 'warning',
    icon: 'ri:notification-3-line',
    help: 'Use concise attention-grabbing alerts for high-visibility app events.',
  },
  'in-app': {
    label: 'In-App',
    badge: 'info',
    icon: 'ri:chat-4-line',
    help: 'Best for contextual messages that should remain available inside the product.',
  },
}

const STATUS_META: Record<TransformedTemplate['status'], { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'success' },
  draft: { label: 'Draft', badge: 'warning' },
  archived: { label: 'Archived', badge: 'secondary' },
}

const CATEGORY_OPTIONS = ['all', 'general', 'onboarding', 'alerts', 'reminders', 'confirmations', 'marketing', 'support']

const formatDate = (value?: string) => {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const NotificationTemplatesView = () => {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'all' | TransformedTemplate['type']>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TransformedTemplate | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<TransformedTemplate | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms' as TransformedTemplate['type'],
    category: '',
    subject: '',
    content: '',
    variables: [] as string[],
  })

  const { data: templates = [], isLoading, error } = useListNotificationTemplates()
  const createTemplate = useCreateNotificationTemplate()
  const updateTemplate = useUpdateNotificationTemplate()
  const deleteTemplate = useDeleteNotificationTemplate()

  const transformedTemplates = useMemo<TransformedTemplate[]>(() => {
    return templates.map((template) => ({
      id: template.id?.toString() || '',
      name: template.template_name || template.name || '',
      type: (template.type || 'sms') as TransformedTemplate['type'],
      category: template.category || 'general',
      subject: template.subject || '',
      content: template.template_content || template.content || '',
      variables: template.variables || [],
      createdAt: template.created_at ? new Date(template.created_at).toISOString() : '',
      updatedAt: template.updated_at ? new Date(template.updated_at).toISOString() : '',
      status: (template.status || 'draft') as TransformedTemplate['status'],
      usageCount: template.usage_count || 0,
      lastUsed: template.last_used ? new Date(template.last_used).toISOString() : undefined,
    }))
  }, [templates])

  const filteredTemplates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return transformedTemplates.filter((template) => {
      const matchesType = selectedType === 'all' || template.type === selectedType
      const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)

      return matchesType && matchesCategory && matchesSearch
    })
  }, [searchTerm, selectedCategory, selectedType, transformedTemplates])

  const totalItems = filteredTemplates.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex)

  const stats = useMemo(() => {
    return {
      total: transformedTemplates.length,
      active: transformedTemplates.filter((template) => template.status === 'active').length,
      draft: transformedTemplates.filter((template) => template.status === 'draft').length,
      archived: transformedTemplates.filter((template) => template.status === 'archived').length,
    }
  }, [transformedTemplates])

  const coverage = useMemo(() => {
    return (['sms', 'email', 'push', 'in-app'] as const).map((type) => ({
      type,
      count: transformedTemplates.filter((template) => template.type === type).length,
    }))
  }, [transformedTemplates])

  const topTemplates = useMemo(() => {
    return [...transformedTemplates]
      .sort((left, right) => (right.usageCount || 0) - (left.usageCount || 0))
      .slice(0, 3)
  }, [transformedTemplates])

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'sms',
      category: '',
      subject: '',
      content: '',
      variables: [],
    })
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    resetForm()
  }

  const extractVariables = (content: string) => {
    const matches = content.match(/\{\{([^}]+)\}\}/g)
    return matches ? matches.map((match) => match.replace(/[{}]/g, '')) : []
  }

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
      variables: extractVariables(content),
    })
  }

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Template name and content are required.')
      return
    }

    try {
      await createTemplate.mutateAsync({
        name: formData.name.trim(),
        template_name: formData.name.trim(),
        type: formData.type,
        category: formData.category.trim() || 'general',
        subject: formData.type === 'email' ? formData.subject.trim() || null : null,
        content: formData.content,
        template_content: formData.content,
        variables: formData.variables,
        status: 'draft',
        usage_count: 0,
      })

      toast.success('Template created successfully.')
      closeCreateModal()
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to create template.')
    }
  }

  const handlePreviewTemplate = (template: TransformedTemplate) => {
    setSelectedTemplate(template)
    setShowPreviewModal(true)
  }

  const handleDuplicateTemplate = async (template: TransformedTemplate) => {
    try {
      await createTemplate.mutateAsync({
        name: `${template.name} Copy`,
        template_name: `${template.name} Copy`,
        type: template.type,
        category: template.category,
        subject: template.subject || null,
        content: template.content,
        template_content: template.content,
        variables: template.variables,
        status: 'draft',
        usage_count: 0,
      })

      toast.success('Template duplicated successfully.')
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to duplicate template.')
    }
  }

  const handleToggleStatus = async (template: TransformedTemplate) => {
    const nextStatus = template.status === 'archived' ? 'active' : 'archived'

    try {
      await updateTemplate.mutateAsync({
        id: Number(template.id),
        status: nextStatus,
      })

      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate({ ...template, status: nextStatus })
      }

      toast.success(`Template ${nextStatus === 'active' ? 'activated' : 'archived'}.`)
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to update template status.')
    }
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) {
      return
    }

    try {
      await deleteTemplate.mutateAsync(Number(templateToDelete.id))
      if (selectedTemplate?.id === templateToDelete.id) {
        setSelectedTemplate(null)
        setShowPreviewModal(false)
      }
      toast.success('Template deleted successfully.')
      setTemplateToDelete(null)
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to delete template.')
    }
  }

  if (isLoading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Loading notification templates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Notification Templates</h1>
          <p className="text-muted mb-0">
            Maintain one approved content library for all channels, then reuse it from the campaign queue.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="light" onClick={() => router.push('/notifications/campaigns')}>
            <IconifyIcon icon="ri:megaphone-line" className="me-2" />
            Campaign Queue
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <IconifyIcon icon="ri:add-line" className="me-2" />
            Create Template
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" role="alert" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Error loading templates: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      ) : null}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-primary-subtle rounded p-2">
                  <IconifyIcon icon="ri:file-list-3-line" className="text-primary fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Total templates</p>
                  <h4 className="mb-0">{stats.total}</h4>
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
                  <IconifyIcon icon="ri:check-circle-line" className="text-success fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Active</p>
                  <h4 className="mb-0">{stats.active}</h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-warning-subtle rounded p-2">
                  <IconifyIcon icon="ri:file-edit-line" className="text-warning fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Draft</p>
                  <h4 className="mb-0">{stats.draft}</h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-sm bg-secondary-subtle rounded p-2">
                  <IconifyIcon icon="ri:archive-line" className="text-secondary fs-4" />
                </div>
                <div>
                  <p className="text-muted mb-1">Archived</p>
                  <h4 className="mb-0">{stats.archived}</h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={9}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {(['all', 'sms', 'email', 'push', 'in-app'] as const).map((type) => {
                  const active = selectedType === type
                  return (
                    <Button
                      key={type}
                      size="sm"
                      variant={active ? 'dark' : 'light'}
                      onClick={() => {
                        setSelectedType(type)
                        setCurrentPage(1)
                      }}
                    >
                      {type === 'all' ? 'All channels' : CHANNEL_META[type].label}
                    </Button>
                  )
                })}
              </div>
              <Alert variant="light" className="border mb-0">
                Templates stay channel-specific, but the library stays unified so campaigns, reports, and approval workflows all reuse the same source of truth.
              </Alert>
            </CardBody>
          </Card>
        </Col>
        <Col lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h6 className="mb-3">Channel coverage</h6>
              <div className="d-flex flex-column gap-2">
                {coverage.map((entry) => (
                  <div key={entry.type} className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">{CHANNEL_META[entry.type].label}</span>
                    <Badge bg={CHANNEL_META[entry.type].badge}>{entry.count}</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <CardBody>
          <Row className="mb-4">
            <Col lg={4}>
              <FormLabel>Category</FormLabel>
              <FormSelect
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value)
                  setCurrentPage(1)
                }}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </FormSelect>
            </Col>
            <Col lg={4}>
              <FormLabel>Search templates</FormLabel>
              <InputGroup>
                <InputGroup.Text>
                  <IconifyIcon icon="ri:search-line" />
                </InputGroup.Text>
                <FormControl
                  type="text"
                  placeholder="Search by template name, content, or category..."
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

          <div className="table-responsive">
            <Table className="table-hover align-middle">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Channel</th>
                  <th>Category</th>
                  <th>Variables</th>
                  <th>Status</th>
                  <th>Usage</th>
                  <th>Last updated</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <IconifyIcon icon="ri:inbox-line" className="fs-2 mb-2 d-block" />
                      No templates match the current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedTemplates.map((template) => (
                    <tr key={template.id}>
                      <td>
                        <div>
                          <strong>{template.name}</strong>
                          {template.subject ? <div className="text-muted small">{template.subject}</div> : null}
                        </div>
                      </td>
                      <td>
                        <Badge bg={CHANNEL_META[template.type].badge} className="text-uppercase">
                          {CHANNEL_META[template.type].label}
                        </Badge>
                      </td>
                      <td className="text-capitalize">{template.category}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {template.variables.length > 0 ? (
                            template.variables.map((variable) => (
                              <Badge key={variable} bg="light" text="dark" className="small">
                                {variable}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted small">No variables</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={STATUS_META[template.status].badge}>{STATUS_META[template.status].label}</Badge>
                      </td>
                      <td>
                        <div>
                          <strong>{template.usageCount}</strong>
                          <div className="text-muted small">Last used {formatDate(template.lastUsed)}</div>
                        </div>
                      </td>
                      <td>{formatDate(template.updatedAt)}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-info" onClick={() => handlePreviewTemplate(template)}>
                            <IconifyIcon icon="ri:eye-line" />
                          </Button>
                          <Button size="sm" variant="outline-primary" onClick={() => handleDuplicateTemplate(template)}>
                            <IconifyIcon icon="ri:file-copy-line" />
                          </Button>
                          <Button size="sm" variant="outline-warning" onClick={() => handleToggleStatus(template)}>
                            <IconifyIcon icon={template.status === 'archived' ? 'ri:refresh-line' : 'ri:archive-line'} />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => setTemplateToDelete(template)}>
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

          {filteredTemplates.length > 0 ? (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
              <span className="text-muted">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} templates
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

      {topTemplates.length > 0 ? (
        <Card className="border-0 shadow-sm mt-4">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Most used templates</h5>
              <span className="text-muted small">Based on stored template usage counters</span>
            </div>
            <Row>
              {topTemplates.map((template) => (
                <Col md={4} key={template.id}>
                  <Card className="border h-100">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <strong>{template.name}</strong>
                          <div className="text-muted small text-capitalize">{template.category}</div>
                        </div>
                        <Badge bg={CHANNEL_META[template.type].badge}>{CHANNEL_META[template.type].label}</Badge>
                      </div>
                      <p className="text-muted small mb-3">{template.usageCount} recorded uses</p>
                      <Button variant="outline-info" size="sm" onClick={() => handlePreviewTemplate(template)}>
                        Preview template
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      ) : null}

      <Modal show={showCreateModal} onHide={closeCreateModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Template name</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Resident arrears reminder"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Channel</FormLabel>
                  <FormSelect
                    value={formData.type}
                    onChange={(event) => setFormData({ ...formData, type: event.target.value as TransformedTemplate['type'] })}
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
                  <strong>{CHANNEL_META[formData.type].label} template</strong>
                  <div className="text-muted">{CHANNEL_META[formData.type].help}</div>
                </div>
              </div>
            </Alert>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Category</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    placeholder="e.g. alerts, support, reminders"
                  />
                </div>
              </Col>
              {formData.type === 'email' ? (
                <Col md={6}>
                  <div className="mb-3">
                    <FormLabel>Email subject</FormLabel>
                    <FormControl
                      type="text"
                      value={formData.subject}
                      onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                      placeholder="Payment reminder for your unit"
                    />
                  </div>
                </Col>
              ) : null}
            </Row>
            <div className="mb-3">
              <FormLabel>Template content</FormLabel>
              <FormControl
                as="textarea"
                rows={6}
                value={formData.content}
                onChange={(event) => handleContentChange(event.target.value)}
                placeholder="Use {{resident_name}}, {{amount}}, {{community_name}}, and other variables where needed."
              />
              <div className="text-muted small mt-1">
                Use double curly braces for variables: {'{{resident_name}}, {{amount}}, {{date}}'}
              </div>
            </div>
            {formData.variables.length > 0 ? (
              <div className="mb-0">
                <FormLabel>Detected variables</FormLabel>
                <div className="d-flex flex-wrap gap-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} bg="primary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCreateModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateTemplate} disabled={createTemplate.isPending}>
            {createTemplate.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate ? (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedTemplate.name}
                </Col>
                <Col md={6}>
                  <strong>Channel:</strong>{' '}
                  <Badge bg={CHANNEL_META[selectedTemplate.type].badge}>{CHANNEL_META[selectedTemplate.type].label}</Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Category:</strong> {selectedTemplate.category}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>{' '}
                  <Badge bg={STATUS_META[selectedTemplate.status].badge}>{STATUS_META[selectedTemplate.status].label}</Badge>
                </Col>
              </Row>
              {selectedTemplate.subject ? (
                <div className="mb-3">
                  <strong>Subject:</strong> {selectedTemplate.subject}
                </div>
              ) : null}
              <div className="mb-3">
                <strong>Content:</strong>
                <div className="border rounded p-3 mt-2 bg-light">{selectedTemplate.content}</div>
              </div>
              <div className="mb-3">
                <strong>Variables:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.length > 0 ? (
                    selectedTemplate.variables.map((variable) => (
                      <Badge key={variable} bg="primary">
                        {variable}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted">No variables defined.</span>
                  )}
                </div>
              </div>
              <Row>
                <Col md={6}>
                  <strong>Usage count:</strong> {selectedTemplate.usageCount}
                </Col>
                <Col md={6}>
                  <strong>Last updated:</strong> {formatDate(selectedTemplate.updatedAt)}
                </Col>
              </Row>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(templateToDelete)} onHide={() => setTemplateToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {templateToDelete ? `Delete "${templateToDelete.name}"? This action cannot be undone.` : ''}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setTemplateToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTemplate} disabled={deleteTemplate.isPending}>
            {deleteTemplate.isPending ? 'Deleting...' : 'Delete Template'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default NotificationTemplatesView
