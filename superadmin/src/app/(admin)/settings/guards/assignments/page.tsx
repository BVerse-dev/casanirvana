'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useListCommunities } from "@/hooks/useCommunities";
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, Pagination } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useGuardAssignments, 
  useCommunityOverview, 
  useCreateAssignment, 
  useUpdateAssignment, 
  useDeleteAssignment,
  useGuardAssignmentsRealtime,
  type GuardAssignment,
  type Community,
  type CreateAssignmentData
} from '@/hooks/useGuardAssignments';
import { useListGuards } from '@/hooks/useGuards';

interface AssignmentFormData {
  guardId: string;
  communityId: string;
  buildingId: string;
  postLocation: string;
  assignmentType: string;
  shiftType: string;
  startDate: string;
  endDate: string;
  priority: string;
  responsibilities: string;
  notes: string;
}

const assignmentSchema = yup.object().shape({
  guardId: yup.string().required('Guard is required'),
  communityId: yup.string().required('Community is required'),
  postLocation: yup.string().required('Post location is required'),
  assignmentType: yup.string().required('Assignment type is required'),
  shiftType: yup.string().required('Shift type is required'),
  startDate: yup.string().required('Start date is required'),
  priority: yup.string().required('Priority is required'),
});

const GuardAssignmentsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<GuardAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignmentType, setFilterAssignmentType] = useState('all');
  const [filterCommunity, setFilterCommunity] = useState('all');
  
  // Pagination state for communities tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 cards per page (2 rows of 3)
  
  // Community details modal state
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);

  // Use hooks for data
  const { data: assignments = [], isLoading: assignmentsLoading, error: assignmentsError } = useGuardAssignments();
  const { data: communities = [], isLoading: communitiesLoading, error: communitiesError } = useCommunityOverview();
  const { data: guards = [] } = useListGuards();
  const { data: allCommunities = [] } = useListCommunities();
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();

  // Setup real-time updates
  useGuardAssignmentsRealtime();

  // Pagination logic for communities
  const totalPages = Math.ceil(communities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommunities = communities.slice(startIndex, endIndex);

  // Reset to first page when communities data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [communities.length]);

  // Handler for opening community details modal
  const handleViewCommunityDetails = (community: any) => {
    setSelectedCommunity(community);
    setShowCommunityModal(true);
  };

  // Handler for closing community details modal
  const handleCloseCommunityModal = () => {
    setShowCommunityModal(false);
    setSelectedCommunity(null);
  };

  // Handler for navigating to edit community page
  const handleEditCommunity = (community: any) => {
    // Close the modal first
    handleCloseCommunityModal();
    // Navigate to the communities edit page with the community ID
    router.push(`/communities/${community.id}/edit`);
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AssignmentFormData>({
    resolver: yupResolver(assignmentSchema),
    mode: 'onChange',
  });



  const handleCreateAssignment = async (data: AssignmentFormData) => {
    const responsibilities = data.responsibilities.split('\n').filter(r => r.trim());

    const assignmentData: CreateAssignmentData = {
      guardId: data.guardId,
      communityId: data.communityId,
      buildingId: data.buildingId || undefined,
      postLocation: data.postLocation,
      assignmentType: data.assignmentType as any,
      shiftType: data.shiftType as any,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      priority: data.priority as any,
      responsibilities,
      emergencyContact: '+1-555-0911',
      notes: data.notes,
    };

    if (editingAssignment) {
      await updateAssignmentMutation.mutateAsync({ 
        id: editingAssignment.id, 
        assignmentData 
      });
    } else {
      await createAssignmentMutation.mutateAsync(assignmentData);
    }

    setShowAssignmentModal(false);
    setEditingAssignment(null);
    reset();
  };

  const handleEditAssignment = (assignment: GuardAssignment) => {
    setEditingAssignment(assignment);
    reset({
      guardId: assignment.guardId,
      communityId: assignment.communityId,
      buildingId: assignment.buildingId || '',
      postLocation: assignment.postLocation,
      assignmentType: assignment.assignmentType,
      shiftType: assignment.shiftType,
      startDate: assignment.startDate,
      endDate: assignment.endDate || '',
      priority: assignment.priority,
      responsibilities: assignment.responsibilities.join('\n'),
      notes: assignment.notes || '',
    });
    setShowAssignmentModal(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignmentMutation.mutateAsync(id);
    }
  };

  const getStatusBadgeColor = (status: GuardAssignment['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      case 'completed': return 'info';
      case 'cancelled': return 'dark';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeColor = (priority: GuardAssignment['priority']) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getAssignmentTypeColor = (type: GuardAssignment['assignmentType']) => {
    switch (type) {
      case 'permanent': return 'primary';
      case 'temporary': return 'warning';
      case 'relief': return 'info';
      case 'on_call': return 'secondary';
      default: return 'light';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.communityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.postLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesType = filterAssignmentType === 'all' || assignment.assignmentType === filterAssignmentType;
    const matchesCommunity = filterCommunity === 'all' || assignment.communityId === filterCommunity;
    return matchesSearch && matchesStatus && matchesType && matchesCommunity;
  });

  // Show loading state
  if (assignmentsLoading || communitiesLoading) {
    return (
      <>
        <PageTitle 
          title="Community Assignments" 
          subName="Assign guards to communities, buildings, and specific posts"
        />
        <Row>
          <Col xs={12}>
            <ComponentContainerCard id="guard-assignments" title="Guard Community Assignments">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading assignments...</p>
              </div>
            </ComponentContainerCard>
          </Col>
        </Row>
      </>
    );
  }

  // Show error state
  if (assignmentsError || communitiesError) {
    return (
      <>
        <PageTitle 
          title="Community Assignments" 
          subName="Assign guards to communities, buildings, and specific posts"
        />
        <Row>
          <Col xs={12}>
            <ComponentContainerCard id="guard-assignments" title="Guard Community Assignments">
              <Alert variant="danger">
                <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                Failed to load data: {assignmentsError?.message || communitiesError?.message}
              </Alert>
            </ComponentContainerCard>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <PageTitle 
        title="Community Assignments" 
        subName="Assign guards to communities, buildings, and specific posts"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="guard-assignments" title="Guard Community Assignments">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'assignments')}
              className="mb-4"
            >
              <Tab eventKey="assignments" title="Current Assignments">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingAssignment(null);
                        reset();
                        setShowAssignmentModal(true);
                      }}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      New Assignment
                    </Button>
                    <Button variant="outline-secondary">
                      <IconifyIcon icon="ri:download-line" className="me-1" />
                      Export
                    </Button>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <InputGroup style={{ width: '300px' }}>
                      <Form.Control
                        type="text"
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary">
                        <IconifyIcon icon="ri:search-line" />
                      </Button>
                    </InputGroup>
                  </div>
                </div>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterAssignmentType}
                      onChange={(e) => setFilterAssignmentType(e.target.value)}
                    >
                      <option value="all">All Assignment Types</option>
                      <option value="permanent">Permanent</option>
                      <option value="temporary">Temporary</option>
                      <option value="relief">Relief</option>
                      <option value="on_call">On Call</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterCommunity}
                      onChange={(e) => setFilterCommunity(e.target.value)}
                    >
                      <option value="all">All Communities</option>
                      {communities.map(community => (
                        <option key={community.id} value={community.id}>{community.name}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Guard Details</th>
                          <th>Assignment</th>
                          <th>Community & Location</th>
                          <th>Duration</th>
                          <th>Status & Priority</th>
                          <th>Contact</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                                  <IconifyIcon icon="ri:shield-user-line" className="text-primary" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{assignment.guardName}</h6>
                                  <small className="text-muted">
                                    {assignment.guardLicense} | {assignment.guardPhone}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <Badge bg={getAssignmentTypeColor(assignment.assignmentType)} className="mb-1">
                                  {assignment.assignmentType.charAt(0).toUpperCase() + assignment.assignmentType.slice(1)}
                                </Badge>
                                <div className="small text-muted">
                                  {assignment.shiftType.charAt(0).toUpperCase() + assignment.shiftType.slice(1)} Shift
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{assignment.communityName}</div>
                                <small className="text-muted">
                                  {assignment.buildingName ? `${assignment.buildingName} - ` : ''}
                                  {assignment.postLocation}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{assignment.startDate}</div>
                                {assignment.endDate && (
                                  <small className="text-muted">to {assignment.endDate}</small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <Badge bg={getStatusBadgeColor(assignment.status)}>
                                  {assignment.status.toUpperCase()}
                                </Badge>
                                <Badge bg={getPriorityBadgeColor(assignment.priority)} className="small">
                                  {assignment.priority.toUpperCase()} PRIORITY
                                </Badge>
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                <div>
                                  <IconifyIcon icon="ri:phone-line" className="me-1" />
                                  {assignment.emergencyContact}
                                </div>
                                {assignment.replacementId && (
                                  <div className="text-info">
                                    <IconifyIcon icon="ri:user-shared-line" className="me-1" />
                                    {assignment.replacementName}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <IconifyIcon icon="ri:more-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEditAssignment(assignment)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:user-shared-line" className="me-1" />
                                    Reassign
                                  </Dropdown.Item>
                                  <Dropdown.Item>
                                    <IconifyIcon icon="ri:time-line" className="me-1" />
                                    Extend/Renew
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="text-danger"
                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                  >
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Remove Assignment
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="communities" title="Community Overview">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Community Security Overview</h5>
                  <Button variant="outline-primary">
                    <IconifyIcon icon="ri:refresh-line" className="me-1" />
                    Refresh Data
                  </Button>
                </div>

                <Row>
                  {paginatedCommunities.map((community) => (
                    <Col lg={6} xl={4} key={community.id} className="mb-4">
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                          <div className="d-flex align-items-start justify-content-between mb-3">
                            <div className="d-flex align-items-center">
                              <div className="avatar-md rounded-circle bg-info-subtle d-flex align-items-center justify-content-center me-3">
                                <IconifyIcon icon="ri:building-line" className="fs-24 text-info" />
                              </div>
                              <div>
                                <h6 className="mb-0">{community.name}</h6>
                                <Badge bg={community.securityRequirement === 'high' ? 'danger' : community.securityRequirement === 'medium' ? 'warning' : 'info'}>
                                  {community.securityRequirement.toUpperCase()} SECURITY
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="small text-muted mb-3">{community.address}</div>

                          <Row className="text-center mb-3">
                            <Col xs={6}>
                              <div className="small text-muted">Total Units</div>
                              <div className="fw-medium">{community.totalUnits}</div>
                            </Col>
                            <Col xs={6}>
                              <div className="small text-muted">Buildings</div>
                              <div className="fw-medium">{community.totalBuildings}</div>
                            </Col>
                          </Row>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small text-muted">Guard Coverage</span>
                              <span className="small fw-medium">
                                {community.currentGuards}/{community.requiredGuards}
                              </span>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className={`progress-bar ${community.currentGuards >= community.requiredGuards ? 'bg-success' : community.currentGuards >= community.requiredGuards * 0.7 ? 'bg-warning' : 'bg-danger'}`}
                                style={{ width: `${(community.currentGuards / community.requiredGuards) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="d-flex gap-1">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="flex-fill"
                              onClick={() => handleViewCommunityDetails(community)}
                            >
                              <IconifyIcon icon="ri:eye-line" className="me-1" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => {
                                setEditingAssignment(null);
                                reset({ communityId: community.id });
                                setShowAssignmentModal(true);
                              }}
                            >
                              <IconifyIcon icon="ri:user-add-line" />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <span className="text-muted small">
                      Showing {startIndex + 1}-{Math.min(endIndex, communities.length)} of {communities.length} communities
                    </span>
                    <Pagination className="mb-0">
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <Pagination.Ellipsis key={pageNum} />;
                        }
                        return null;
                      })}

                      <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </Tab>

              <Tab eventKey="analytics" title="Assignment Analytics">
                <Row>
                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Assignment Distribution</h6>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">Permanent Assignments</span>
                            <span className="small fw-medium">33%</span>
                          </div>
                          <div className="progress mb-2" style={{ height: '6px' }}>
                            <div className="progress-bar bg-primary" style={{ width: '33%' }} />
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">Temporary Assignments</span>
                            <span className="small fw-medium">33%</span>
                          </div>
                          <div className="progress mb-2" style={{ height: '6px' }}>
                            <div className="progress-bar bg-warning" style={{ width: '33%' }} />
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">Relief Assignments</span>
                            <span className="small fw-medium">34%</span>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div className="progress-bar bg-info" style={{ width: '34%' }} />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                        <h6 className="mb-3">Key Metrics</h6>
                        <Row className="text-center">
                          <Col xs={6} className="mb-3">
                            <div className="fs-4 fw-bold text-success">3</div>
                            <div className="small text-muted">Active Assignments</div>
                          </Col>
                          <Col xs={6} className="mb-3">
                            <div className="fs-4 fw-bold text-info">3</div>
                            <div className="small text-muted">Total Communities</div>
                          </Col>
                          <Col xs={6}>
                            <div className="fs-4 fw-bold text-warning">1</div>
                            <div className="small text-muted">Understaffed</div>
                          </Col>
                          <Col xs={6}>
                            <div className="fs-4 fw-bold text-primary">75%</div>
                            <div className="small text-muted">Coverage Rate</div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Alert variant="info" className="text-center">
                  <IconifyIcon icon="ri:pie-chart-line" className="me-2" />
                  Detailed assignment analytics and coverage maps would be implemented here
                </Alert>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Assignment Modal */}
      <Modal show={showAssignmentModal} onHide={() => setShowAssignmentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAssignment ? 'Edit Guard Assignment' : 'Create New Assignment'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateAssignment)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Controller
                  name="guardId"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Select Guard"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Guard...</option>
                      <option value="guard1">John Smith</option>
                      <option value="guard2">Mike Wilson</option>
                      <option value="guard3">Sarah Johnson</option>
                      <option value="guard4">David Brown</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="communityId"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Select Community"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Community...</option>
                      {communities.map(community => (
                        <option key={community.id} value={community.id}>{community.name}</option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="buildingId"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Building (Optional)"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Building...</option>
                      <option value="building1">Tower A</option>
                      <option value="building2">Tower B</option>
                      <option value="building3">Tower C</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="postLocation"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Post Location"
                      placeholder="e.g., Main Gate, Parking Area, Clubhouse"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="assignmentType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Assignment Type"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Type...</option>
                      <option value="permanent">Permanent</option>
                      <option value="temporary">Temporary</option>
                      <option value="relief">Relief</option>
                      <option value="on_call">On Call</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="shiftType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Shift Type"
                      containerClass="mb-3"
                      errors={errors}
                    >
                      <option value="">Choose Shift...</option>
                      <option value="day">Day Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="rotating">Rotating</option>
                      <option value="split">Split Shift</option>
                    </SelectFormInput>
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Start Date"
                      type="date"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="End Date (Optional)"
                      type="date"
                      containerClass="mb-3"
                      errors={errors}
                    />
                  )}
                />
              </Col>
            </Row>

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <SelectFormInput
                  {...field}
                  label="Priority Level"
                  containerClass="mb-3"
                  errors={errors}
                >
                  <option value="">Select Priority...</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </SelectFormInput>
              )}
            />

            <Controller
              name="responsibilities"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Responsibilities"
                  placeholder="Enter each responsibility on a new line"
                  rows={4}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextAreaFormInput
                  {...field}
                  label="Additional Notes (Optional)"
                  placeholder="Any additional notes or special instructions"
                  rows={3}
                  containerClass="mb-3"
                  errors={errors}
                />
              )}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssignmentModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!isValid}>
              {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Community Security Details Modal */}
      <Modal 
        show={showCommunityModal} 
        onHide={handleCloseCommunityModal} 
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <div className="avatar-md rounded-circle bg-info-subtle d-flex align-items-center justify-content-center me-3">
                <IconifyIcon icon="ri:building-line" className="fs-24 text-info" />
              </div>
              <div>
                <h5 className="mb-0">{selectedCommunity?.name}</h5>
                <Badge bg={
                  selectedCommunity?.securityRequirement === 'high' ? 'danger' : 
                  selectedCommunity?.securityRequirement === 'medium' ? 'warning' : 'info'
                }>
                  {selectedCommunity?.securityRequirement?.toUpperCase()} SECURITY
                </Badge>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCommunity && (
            <Row>
              {/* Left Column - Basic Info */}
              <Col lg={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="mb-3">
                      <IconifyIcon icon="ri:information-line" className="me-2" />
                      Basic Information
                    </h6>
                    
                    <div className="mb-3">
                      <small className="text-muted d-block">Community Name</small>
                      <div className="fw-medium">{selectedCommunity.name}</div>
                    </div>
                    
                    <div className="mb-3">
                      <small className="text-muted d-block">Address</small>
                      <div className="fw-medium">{selectedCommunity.address}</div>
                    </div>
                    
                    <Row>
                      <Col xs={6}>
                        <div className="mb-3">
                          <small className="text-muted d-block">Total Units</small>
                          <div className="fw-medium fs-20 text-primary">{selectedCommunity.totalUnits}</div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="mb-3">
                          <small className="text-muted d-block">Buildings</small>
                          <div className="fw-medium fs-20 text-info">{selectedCommunity.totalBuildings}</div>
                        </div>
                      </Col>
                    </Row>
                    
                    <div className="mb-3">
                      <small className="text-muted d-block">Security Level</small>
                      <Badge bg={
                        selectedCommunity.securityRequirement === 'high' ? 'danger' : 
                        selectedCommunity.securityRequirement === 'medium' ? 'warning' : 'info'
                      } className="px-3 py-2">
                        {selectedCommunity.securityRequirement?.toUpperCase()} SECURITY
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
                
                {/* Security Status Card */}
                <Card className="border-0 bg-light mt-3">
                  <Card.Body>
                    <h6 className="mb-3">
                      <IconifyIcon icon="ri:shield-check-line" className="me-2" />
                      Security Status
                    </h6>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Guard Coverage</small>
                        <span className="fw-medium">
                          {selectedCommunity.currentGuards}/{selectedCommunity.requiredGuards}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${
                            selectedCommunity.currentGuards >= selectedCommunity.requiredGuards ? 'bg-success' : 
                            selectedCommunity.currentGuards >= selectedCommunity.requiredGuards * 0.7 ? 'bg-warning' : 'bg-danger'
                          }`}
                          style={{ width: `${(selectedCommunity.currentGuards / selectedCommunity.requiredGuards) * 100}%` }}
                        />
                      </div>
                      <small className="text-muted">
                        {selectedCommunity.currentGuards >= selectedCommunity.requiredGuards 
                          ? 'Fully staffed' 
                          : `${selectedCommunity.requiredGuards - selectedCommunity.currentGuards} guard(s) needed`
                        }
                      </small>
                    </div>
                    
                    <Row>
                      <Col xs={6}>
                        <div className="text-center p-3 rounded bg-success-subtle">
                          <div className="fs-20 fw-bold text-success">{selectedCommunity.currentGuards}</div>
                          <small className="text-muted">Active Guards</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="text-center p-3 rounded bg-warning-subtle">
                          <div className="fs-20 fw-bold text-warning">{selectedCommunity.requiredGuards}</div>
                          <small className="text-muted">Required Guards</small>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Right Column - Security Analytics */}
              <Col lg={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="mb-3">
                      <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                      Security Analytics
                    </h6>
                    
                    {/* Security Metrics */}
                    <Row className="mb-3">
                      <Col xs={6}>
                        <div className="text-center p-3 rounded border">
                          <IconifyIcon icon="ri:shield-line" className="fs-24 text-primary mb-2" />
                          <div className="fw-medium">Security Score</div>
                          <div className="fs-20 fw-bold text-primary">
                            {selectedCommunity.currentGuards >= selectedCommunity.requiredGuards ? '95%' : 
                             selectedCommunity.currentGuards >= selectedCommunity.requiredGuards * 0.7 ? '75%' : '45%'}
                          </div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="text-center p-3 rounded border">
                          <IconifyIcon icon="ri:time-line" className="fs-24 text-info mb-2" />
                          <div className="fw-medium">Coverage Time</div>
                          <div className="fs-20 fw-bold text-info">24/7</div>
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Risk Assessment */}
                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Risk Assessment</small>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <Badge bg={
                            selectedCommunity.securityRequirement === 'high' ? 'danger' : 
                            selectedCommunity.securityRequirement === 'medium' ? 'warning' : 'success'
                          }>
                            {selectedCommunity.securityRequirement === 'high' ? 'HIGH RISK' : 
                             selectedCommunity.securityRequirement === 'medium' ? 'MEDIUM RISK' : 'LOW RISK'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Security Recommendations</small>
                      <div className="small">
                        {selectedCommunity.currentGuards < selectedCommunity.requiredGuards ? (
                          <Alert variant="warning" className="py-2 mb-2">
                            <IconifyIcon icon="ri:alert-line" className="me-1" />
                            Immediate action needed: Hire {selectedCommunity.requiredGuards - selectedCommunity.currentGuards} additional guard(s)
                          </Alert>
                        ) : (
                          <Alert variant="success" className="py-2 mb-2">
                            <IconifyIcon icon="ri:check-line" className="me-1" />
                            Security staffing is optimal
                          </Alert>
                        )}
                        
                        {selectedCommunity.securityRequirement === 'high' && (
                          <Alert variant="info" className="py-2 mb-2">
                            <IconifyIcon icon="ri:information-line" className="me-1" />
                            Consider additional security measures for high-risk area
                          </Alert>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
                
                {/* Quick Actions */}
                <Card className="border-0 bg-light mt-3">
                  <Card.Body>
                    <h6 className="mb-3">
                      <IconifyIcon icon="ri:settings-line" className="me-2" />
                      Quick Actions
                    </h6>
                    
                    <div className="d-grid gap-2">
                      <Button variant="primary" size="sm">
                        <IconifyIcon icon="ri:user-add-line" className="me-1" />
                        Assign New Guard
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:calendar-line" className="me-1" />
                        View Schedule
                      </Button>
                      <Button variant="outline-info" size="sm">
                        <IconifyIcon icon="ri:file-text-line" className="me-1" />
                        Security Report
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCommunityModal}>
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => handleEditCommunity(selectedCommunity)}
          >
            <IconifyIcon icon="ri:edit-line" className="me-1" />
            Edit Community
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GuardAssignmentsPage;
