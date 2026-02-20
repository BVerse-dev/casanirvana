'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Modal, Button, Form, Badge, Table, InputGroup, Row, Col, FormControl, FormSelect, FormLabel, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { 
  useListNotificationTemplates, 
  useCreateNotificationTemplate, 
  useUpdateNotificationTemplate, 
  useDeleteNotificationTemplate,
  useIncrementTemplateUsage,
  Template
} from '@/hooks/useNotificationTemplates'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

// Local interface for transformed template data
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

const NotificationTemplatesView = () => {
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TransformedTemplate | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms' as 'sms' | 'email' | 'push' | 'in-app',
    category: '',
    subject: '',
    content: '',
    variables: [] as string[]
  })

  // API hooks
  const { data: templates = [], isLoading, error } = useListNotificationTemplates()
  const createTemplate = useCreateNotificationTemplate()
  const updateTemplate = useUpdateNotificationTemplate()
  const deleteTemplate = useDeleteNotificationTemplate()
  const incrementUsage = useIncrementTemplateUsage()

  // Transform data from database format to frontend format
  const transformedTemplates = templates.map(template => ({
    id: template.id?.toString() || '',
    name: template.template_name || template.name || '',
    type: (template.type || 'sms') as 'sms' | 'email' | 'push' | 'in-app',
    category: template.category || '',
    subject: template.subject || '',
    content: template.template_content || template.content || '',
    variables: template.variables || [],
    createdAt: template.created_at ? new Date(template.created_at).toISOString().split('T')[0] : '',
    updatedAt: template.updated_at ? new Date(template.updated_at).toISOString().split('T')[0] : '',
    status: (template.status || 'draft') as 'active' | 'draft' | 'archived',
    usageCount: template.usage_count || 0,
    lastUsed: template.last_used ? new Date(template.last_used).toISOString().split('T')[0] : undefined
  }))

  const categories = ['all', 'onboarding', 'alerts', 'reminders', 'confirmations', 'marketing', 'support']
  const typeColors = {
    sms: 'success',
    email: 'primary',
    push: 'warning',
    'in-app': 'info'
  }

  const statusColors = {
    active: 'success',
    draft: 'warning',
    archived: 'secondary'
  }

  // Filter templates
  const filteredTemplates = transformedTemplates.filter(template => {
    const matchesType = selectedType === 'all' || template.type === selectedType
    const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesCategory && matchesSearch
  })

  // Pagination calculations
  const totalItems = filteredTemplates.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex)

  // Stats data
  const statsData = {
    totalTemplates: transformedTemplates.length,
    activeTemplates: transformedTemplates.filter(t => t.status === 'active').length,
    totalUsage: transformedTemplates.reduce((sum, t) => sum + t.usageCount, 0),
    draftTemplates: transformedTemplates.filter(t => t.status === 'draft').length
  }

  // Chart data
  const templateUsageData = {
    labels: transformedTemplates.map(t => t.name),
    datasets: [{
      label: 'Usage Count',
      data: transformedTemplates.map(t => t.usageCount),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  }

  const templateTypeData = {
    labels: ['SMS', 'Email', 'Push', 'In-App'],
    datasets: [{
      data: [
        transformedTemplates.filter(t => t.type === 'sms').length,
        transformedTemplates.filter(t => t.type === 'email').length,
        transformedTemplates.filter(t => t.type === 'push').length,
        transformedTemplates.filter(t => t.type === 'in-app').length
      ],
      backgroundColor: [
        'rgba(40, 167, 69, 0.8)',
        'rgba(0, 123, 255, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(23, 162, 184, 0.8)'
      ],
      borderWidth: 1
    }]
  }

  const handleCreateTemplate = async () => {
    try {
      await createTemplate.mutateAsync({
        name: formData.name,
        type: formData.type,
        category: formData.category,
        subject: formData.subject || undefined,
        content: formData.content,
        variables: formData.variables,
        status: 'draft'
      })
      setShowCreateModal(false)
      setFormData({
        name: '',
        type: 'sms',
        category: '',
        subject: '',
        content: '',
        variables: []
      })
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  const handlePreviewTemplate = async (template: TransformedTemplate) => {
    try {
      // Increment usage count when previewing
      await incrementUsage.mutateAsync(Number(template.id))
      setSelectedTemplate(template)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Error incrementing usage:', error)
      // Still show preview even if usage increment fails
      setSelectedTemplate(template)
      setShowPreviewModal(true)
    }
  }

  const extractVariables = (content: string) => {
    const matches = content.match(/\{\{([^}]+)\}\}/g)
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : []
  }

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
      variables: extractVariables(content)
    })
  }

  return (
    <div className="container-fluid p-4">
      {/* Loading State */}
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading notification templates...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Error loading templates: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Notification Templates</h1>
              <p className="text-muted">Manage and organize your notification templates</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <IconifyIcon icon="ri:add-line" className="me-2" />
              Create Template
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-primary-subtle rounded p-2">
                    <IconifyIcon icon="ri:file-list-3-line" className="text-primary fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Total Templates</p>
                  <h4 className="mb-0">{statsData.totalTemplates}</h4>
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
                    <IconifyIcon icon="ri:check-circle-line" className="text-success fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Active Templates</p>
                  <h4 className="mb-0">{statsData.activeTemplates}</h4>
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
                    <IconifyIcon icon="ri:bar-chart-line" className="text-info fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Total Usage</p>
                  <h4 className="mb-0">{statsData.totalUsage.toLocaleString()}</h4>
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
                    <IconifyIcon icon="ri:file-edit-line" className="text-warning fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Draft Templates</p>
                  <h4 className="mb-0">{statsData.draftTemplates}</h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom">
          <Nav variant="tabs" className="nav-tabs-custom">
            <NavItem>
              <NavLink
                active={activeTab === 'templates'}
                onClick={() => setActiveTab('templates')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:file-list-3-line" className="me-2" />
                Templates
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                Analytics
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>
        <CardBody>
          <div className="tab-content">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="tab-pane active">
                {/* Filters */}
                <Row className="mb-4">
                  <Col md={3}>
                    <FormLabel>Template Type</FormLabel>
                    <FormSelect
                      value={selectedType}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setSelectedType(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="push">Push</option>
                      <option value="in-app">In-App</option>
                    </FormSelect>
                  </Col>
                  <Col md={3}>
                    <FormLabel>Category</FormLabel>
                    <FormSelect
                      value={selectedCategory}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col md={6}>
                    <FormLabel>Search Templates</FormLabel>
                    <InputGroup>
                      <InputGroup.Text>
                        <IconifyIcon icon="ri:search-line" />
                      </InputGroup.Text>
                      <FormControl
                        type="text"
                        placeholder="Search by name or content..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </InputGroup>
                  </Col>
                </Row>

                {/* Templates Table */}
                <div className="table-responsive">
                  <Table className="table-hover">
                    <thead>
                      <tr>
                        <th>Template Name</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Variables</th>
                        <th>Status</th>
                        <th>Usage</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTemplates.map(template => (
                        <tr key={template.id}>
                          <td>
                            <div>
                              <strong>{template.name}</strong>
                              {template.subject && (
                                <div className="text-muted small">{template.subject}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <Badge bg={typeColors[template.type]} className="text-uppercase">
                              {template.type}
                            </Badge>
                          </td>
                          <td>{template.category}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {template.variables.map(variable => (
                                <Badge key={variable} bg="light" text="dark" className="small">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge bg={statusColors[template.status]} className="text-capitalize">
                              {template.status}
                            </Badge>
                          </td>
                          <td>
                            <div>
                              <strong>{template.usageCount}</strong>
                              {template.lastUsed && (
                                <div className="text-muted small">
                                  Last: {new Date(template.lastUsed).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{new Date(template.updatedAt).toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => handlePreviewTemplate(template)}
                              >
                                <IconifyIcon icon="ri:eye-line" />
                              </Button>
                              <Button size="sm" variant="outline-primary">
                                <IconifyIcon icon="ri:edit-line" />
                              </Button>
                              <Button size="sm" variant="outline-success">
                                <IconifyIcon icon="ri:file-copy-line" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Show</span>
                    <Form.Select
                      size="sm"
                      style={{ width: '80px' }}
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </Form.Select>
                    <span className="text-muted">entries</span>
                  </div>
                  
                  <div className="text-muted">
                    Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination className="mb-0">
                      <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                      {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                        if (pageNum <= totalPages) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        }
                        return null;
                      })}
                      <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
                    </Pagination>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="tab-pane active">
                <Row>
                  <Col md={8}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Template Usage Analytics</h5>
                      </CardHeader>
                      <CardBody>
                        <Bar
                          data={templateUsageData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top' as const
                              },
                              title: {
                                display: true,
                                text: 'Template Usage Count'
                              }
                            }
                          }}
                        />
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card>
                      <CardHeader>
                        <h5 className="mb-0">Templates by Type</h5>
                      </CardHeader>
                      <CardBody>
                        <Doughnut
                          data={templateTypeData}
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
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Create Template Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Template Name</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Template Type</FormLabel>
                  <FormSelect
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value as any })}
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
                  <FormLabel>Category</FormLabel>
                  <FormControl
                    type="text"
                    value={formData.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Onboarding, Alerts, Marketing"
                  />
                </div>
              </Col>
              {formData.type === 'email' && (
                <Col md={6}>
                  <div className="mb-3">
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl
                      type="text"
                      value={formData.subject}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter email subject"
                    />
                  </div>
                </Col>
              )}
            </Row>
            <div className="mb-3">
              <FormLabel>Template Content</FormLabel>
              <FormControl
                as="textarea"
                rows={6}
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleContentChange(e.target.value)}
                placeholder="Enter your template content. Use {{variable_name}} for dynamic content."
              />
              <div className="text-muted small mt-1">
                Use double curly braces for variables: {'{{user_name}}, {{amount}}, {{date}}'}
              </div>
            </div>
            {formData.variables.length > 0 && (
              <div className="mb-3">
                <FormLabel>Detected Variables</FormLabel>
                <div className="d-flex flex-wrap gap-2">
                  {formData.variables.map(variable => (
                    <Badge key={variable} bg="primary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateTemplate}>
            Create Template
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Template Modal */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Template Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedTemplate.name}
                </Col>
                <Col md={6}>
                  <strong>Type:</strong>{' '}
                  <Badge bg={typeColors[selectedTemplate?.type || 'sms']} className="text-uppercase">
                    {selectedTemplate?.type}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Category:</strong> {selectedTemplate?.category}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>{' '}
                  <Badge bg={statusColors[selectedTemplate?.status || 'draft']} className="text-capitalize">
                    {selectedTemplate?.status}
                  </Badge>
                </Col>
              </Row>
              {selectedTemplate?.subject && (
                <div className="mb-3">
                  <strong>Subject:</strong> {selectedTemplate.subject}
                </div>
              )}
              <div className="mb-3">
                <strong>Content:</strong>
                <div className="border rounded p-3 mt-2 bg-light">
                  {selectedTemplate?.content}
                </div>
              </div>
              <div className="mb-3">
                <strong>Variables:</strong>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {selectedTemplate?.variables?.map(variable => (
                    <Badge key={variable} bg="primary">
                      {variable}
                    </Badge>
                  )) || []}
                </div>
              </div>
              <Row>
                <Col md={6}>
                  <strong>Usage Count:</strong> {selectedTemplate?.usageCount || 0}
                </Col>
                <Col md={6}>
                  <strong>Last Updated:</strong> {selectedTemplate?.updatedAt ? new Date(selectedTemplate.updatedAt).toLocaleDateString() : 'N/A'}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            Use Template
          </Button>
        </Modal.Footer>
      </Modal>
      </>
      )}
    </div>
  )
}

export default NotificationTemplatesView
