'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, Modal, Button, Form, Badge, Table, InputGroup, Row, Col, FormControl, FormSelect, FormLabel, ProgressBar, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useListCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useCampaignsAnalytics, type Campaign } from '@/hooks/useNotificationCampaigns'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement)

const NotificationCampaignsView = () => {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: 'sms' as 'sms' | 'email' | 'push' | 'in-app',
    template: '',
    audience: '',
    scheduledDate: '',
    budget: ''
  })

  // Fetch real data using hooks
  const { data: campaigns = [], isLoading, error } = useListCampaigns({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    type: selectedType !== 'all' ? selectedType : undefined,
    limit: 20,
    offset: 0
  })

  const { data: analytics, isLoading: analyticsLoading } = useCampaignsAnalytics()
  const createCampaignMutation = useCreateCampaign()
  const updateCampaignMutation = useUpdateCampaign()
  const deleteCampaignMutation = useDeleteCampaign()

  // Mock analytics data fallback
  const mockAnalytics = {
    totalSent: 2632,
    totalDelivered: 2607,
    totalOpened: 1162,
    totalClicked: 435,
    deliveryRate: 99.1,
    openRate: 44.6,
    clickRate: 16.5
  }

  const statusColors: Record<string, string> = {
    draft: 'secondary',
    scheduled: 'warning',
    active: 'primary',
    completed: 'success',
    paused: 'danger',
    processing: 'info',
    delivered: 'success',
    failed: 'danger'
  }

  const typeColors: Record<string, string> = {
    sms: 'success',
    email: 'primary',
    push: 'warning',
    'in-app': 'info'
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus
    const matchesType = selectedType === 'all' || campaign.type === selectedType
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.audience.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)

  // Stats data - use real analytics when available, fallback to campaign data
  const statsData = analytics ? {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length,
    totalSent: analytics.totalSent || campaigns.reduce((sum: number, c: Campaign) => sum + (c.sentCount || 0), 0),
    totalBudget: campaigns.reduce((sum: number, c: Campaign) => sum + (c.budget || 0), 0),
    totalSpent: campaigns.reduce((sum: number, c: Campaign) => sum + (c.spent || 0), 0)
  } : {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length,
    totalSent: campaigns.reduce((sum: number, c: Campaign) => sum + (c.sentCount || 0), 0),
    totalBudget: campaigns.reduce((sum: number, c: Campaign) => sum + (c.budget || 0), 0),
    totalSpent: campaigns.reduce((sum: number, c: Campaign) => sum + (c.spent || 0), 0)
  }

  // Performance data for chart
  const performanceData = {
    labels: ['Jan 15', 'Jan 16', 'Jan 17', 'Jan 18', 'Jan 19', 'Jan 20', 'Jan 21'],
    datasets: [
      {
        label: 'Sent',
        data: [120, 190, 300, 500, 200, 300, 450],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      },
      {
        label: 'Delivered',
        data: [115, 185, 295, 490, 195, 295, 440],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4
      },
      {
        label: 'Opened',
        data: [45, 78, 120, 200, 89, 145, 210],
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        tension: 0.4
      }
    ]
  }

  const handleCreateCampaign = async () => {
    try {
      await createCampaignMutation.mutateAsync({
        name: formData.name,
        title: formData.name, // Use name as title
        type: formData.type,
        template: formData.template,
        audience: formData.audience,
        scheduled_at: formData.scheduledDate || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined
      })
      setShowCreateModal(false)
      setFormData({
        name: '',
        type: 'sms',
        template: '',
        audience: '',
        scheduledDate: '',
        budget: ''
      })
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowDetailsModal(true)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaignMutation.mutateAsync(campaignId)
      } catch (error) {
        console.error('Error deleting campaign:', error)
      }
    }
  }

  const getDeliveryRate = (campaign: Campaign) => {
    return campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0'
  }

  const getOpenRate = (campaign: Campaign) => {
    return campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) : '0'
  }

  const getClickRate = (campaign: Campaign) => {
    return campaign.openedCount > 0 ? ((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1) : '0'
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notification Campaigns</h1>
          <p className="text-muted">Create, manage and track your notification campaigns</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <IconifyIcon icon="ri:add-line" className="me-2" />
          Create Campaign
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
        </div>
        <div className="col-md-3">
          <Card className="border-0 shadow-sm">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm bg-success-subtle rounded p-2">
                    <IconifyIcon icon="ri:play-circle-line" className="text-success fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Active Campaigns</p>
                  <h4 className="mb-0">{statsData.activeCampaigns}</h4>
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
                    <IconifyIcon icon="ri:send-plane-line" className="text-info fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Total Sent</p>
                  <h4 className="mb-0">{statsData.totalSent.toLocaleString()}</h4>
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
                    <IconifyIcon icon="ri:money-dollar-circle-line" className="text-warning fs-4" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Budget Used</p>
                  <h4 className="mb-0">${statsData.totalSpent} / ${statsData.totalBudget}</h4>
                  <ProgressBar 
                    variant="warning" 
                    now={(statsData.totalSpent / statsData.totalBudget) * 100} 
                    style={{ height: '4px' }}
                  />
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
                active={activeTab === 'campaigns'}
                onClick={() => setActiveTab('campaigns')}
                className="cursor-pointer"
              >
                <IconifyIcon icon="ri:megaphone-line" className="me-2" />
                Campaigns
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
          </Nav>
        </CardHeader>
        <CardBody>
          <div className="tab-content">
            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="tab-pane active">
                {/* Filters */}
                <Row className="mb-4">
                  <Col md={3}>
                    <FormLabel>Campaign Status</FormLabel>
                    <FormSelect
                      value={selectedStatus}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </FormSelect>
                  </Col>
                  <Col md={3}>
                    <FormLabel>Campaign Type</FormLabel>
                    <FormSelect
                      value={selectedType}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
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
                        placeholder="Search by campaign name or audience..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                </Row>

                {/* Campaigns Table */}
                <div className="table-responsive">
                  {error && (
                    <div className="alert alert-danger mb-3">
                      <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                      Error loading campaigns: {error.message}
                    </div>
                  )}
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
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
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
                        paginatedCampaigns.map((campaign: Campaign) => (
                        <tr key={campaign.id}>
                          <td>
                            <div>
                              <strong>{campaign.name}</strong>
                              <div className="text-muted small">Template: {campaign.template}</div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={typeColors[campaign.type]} className="text-uppercase">
                              {campaign.type}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={statusColors[campaign.status]} className="text-capitalize">
                              {campaign.status}
                            </Badge>
                          </td>
                          <td>
                            <div>
                              <strong>{campaign.audience}</strong>
                              <div className="text-muted small">{campaign.audienceCount.toLocaleString()} recipients</div>
                            </div>
                          </td>
                          <td>
                            {campaign.sentCount > 0 ? (
                              <div className="small">
                                <div>Sent: {campaign.sentCount}</div>
                                <div>Open Rate: {getOpenRate(campaign)}%</div>
                                <div>Click Rate: {getClickRate(campaign)}%</div>
                              </div>
                            ) : (
                              <span className="text-muted">Not sent</span>
                            )}
                          </td>
                          <td>
                            {campaign.budget ? (
                              <div>
                                <div>${campaign.spent} / ${campaign.budget}</div>
                                <ProgressBar 
                                  variant="info" 
                                  now={(campaign.spent! / campaign.budget) * 100} 
                                  style={{ height: '4px' }}
                                />
                              </div>
                            ) : (
                              <span className="text-muted">Free</span>
                            )}
                          </td>
                          <td>
                            {campaign.scheduledDate ? (
                              new Date(campaign.scheduledDate).toLocaleString()
                            ) : (
                              <span className="text-muted">Not scheduled</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => handleViewDetails(campaign)}
                              >
                                <IconifyIcon icon="ri:eye-line" />
                              </Button>
                              <Button size="sm" variant="outline-primary">
                                <IconifyIcon icon="ri:edit-line" />
                              </Button>
                              {campaign.status === 'active' && (
                                <Button size="sm" variant="outline-warning">
                                  <IconifyIcon icon="ri:pause-line" />
                                </Button>
                              )}
                              {campaign.status === 'draft' && (
                                <Button size="sm" variant="outline-success">
                                  <IconifyIcon icon="ri:play-line" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                              >
                                <IconifyIcon icon="ri:delete-bin-line" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">Show:</span>
                        <Form.Select
                          size="sm"
                          style={{ width: 'auto' }}
                          value={itemsPerPage}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
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
                )}
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="tab-pane active">
                {analyticsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading analytics data...
                  </div>
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
                                legend: {
                                  position: 'top' as const
                                },
                                title: {
                                  display: true,
                                  text: 'Campaign Performance Metrics (Last 7 Days)'
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
                  </Row>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Create Campaign Modal */}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Campaign Type</FormLabel>
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
                  <FormLabel>Template</FormLabel>
                  <FormSelect
                    value={formData.template}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, template: e.target.value })}
                  >
                    <option value="">Select template</option>
                    <option value="welcome">Welcome SMS</option>
                    <option value="property-alert">Property Alert Email</option>
                    <option value="payment-reminder">Payment Reminder</option>
                    <option value="appointment-reminder">Appointment Reminder</option>
                  </FormSelect>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Target Audience</FormLabel>
                  <FormSelect
                    value={formData.audience}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, audience: e.target.value })}
                  >
                    <option value="">Select audience</option>
                    <option value="all-users">All Community Members</option>
                    <option value="active-seekers">Active Property Seekers</option>
                    <option value="new-registrations">New Community Members</option>
                    <option value="premium-subscribers">Premium Subscribers</option>
                  </FormSelect>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Schedule Date</FormLabel>
                  <FormControl
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FormLabel>Budget (Optional)</FormLabel>
                  <FormControl
                    type="number"
                    value={formData.budget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="Enter budget amount"
                  />
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateCampaign}>
            Create Campaign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Campaign Details Modal */}
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
                  <Badge bg={statusColors[selectedCampaign.status]} className="text-capitalize">
                    {selectedCampaign.status}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Template:</strong> {selectedCampaign.template}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Audience:</strong> {selectedCampaign.audience}
                </Col>
                <Col md={6}>
                  <strong>Recipients:</strong> {selectedCampaign.audienceCount.toLocaleString()}
                </Col>
              </Row>
              
              <h6 className="mt-4 mb-3">Performance Metrics</h6>
              <Row className="mb-3">
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.sentCount}</h4>
                    <small className="text-muted">Sent</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.deliveredCount}</h4>
                    <small className="text-muted">Delivered</small>
                    <div className="small text-success">{getDeliveryRate(selectedCampaign)}%</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.openedCount}</h4>
                    <small className="text-muted">Opened</small>
                    <div className="small text-info">{getOpenRate(selectedCampaign)}%</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <h4 className="mb-1">{selectedCampaign.clickedCount}</h4>
                    <small className="text-muted">Clicked</small>
                    <div className="small text-warning">{getClickRate(selectedCampaign)}%</div>
                  </div>
                </Col>
              </Row>

              {selectedCampaign.budget && (
                <div>
                  <h6 className="mt-4 mb-3">Budget Information</h6>
                  <Row>
                    <Col md={6}>
                      <strong>Total Budget:</strong> ${selectedCampaign.budget}
                    </Col>
                    <Col md={6}>
                      <strong>Amount Spent:</strong> ${selectedCampaign.spent}
                    </Col>
                  </Row>
                  <ProgressBar 
                    className="mt-2"
                    variant="warning" 
                    now={(selectedCampaign.spent! / selectedCampaign.budget) * 100} 
                    label={`${((selectedCampaign.spent! / selectedCampaign.budget) * 100).toFixed(1)}%`}
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            Edit Campaign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default NotificationCampaignsView
