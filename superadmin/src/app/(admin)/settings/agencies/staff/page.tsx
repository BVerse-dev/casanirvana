'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Nav, Tab, Button, Table, Badge, Form, Modal, ProgressBar, Alert, Pagination } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiUser, FiUserCheck, FiUserX, FiTrendingUp, FiCalendar, FiDollarSign, FiUserPlus, FiStar, FiBook, FiAward, FiActivity, FiBarChart, FiPieChart, FiTrendingUp as FiLineChart } from 'react-icons/fi';
import ReactApexChart from 'react-apexcharts';
import PageTitle from '@/components/PageTitle';
import { 
  useListAgencyStaff,
  useCreateAgencyStaff,
  useUpdateAgencyStaff,
  useDeleteAgencyStaff,
  useAgencyStaffStats,
  useAgencyStaffDepartmentStats,
  useAgencyStaffHiringTrend,
  type CreateAgencyStaffData
} from '@/hooks/useAgencyStaff';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import './timeline.css';

// Validation schema for staff member form
const staffSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  role: yup.string().required('Role is required'),
  department: yup.string().required('Department is required'),
  employee_id: yup.string().required('Employee ID is required'),
  date_of_joining: yup.string().required('Date of joining is required'),
  salary: yup.number().positive('Salary must be positive').required('Salary is required'),
});

type StaffFormData = yup.InferType<typeof staffSchema>;

const AgencyStaffPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hooks for data fetching and mutations
  const { data: staffList = [], isLoading, error, refetch } = useListAgencyStaff();
  const { data: stats } = useAgencyStaffStats();
  const { data: departmentData = [] } = useAgencyStaffDepartmentStats();
  
  // Extended department data with additional departments
  const extendedDepartmentData = [
    ...departmentData,
    { name: 'Customer Support', count: 8, percentage: 20 },
    { name: 'Finance', count: 5, percentage: 12.5 },
    { name: 'Human Resources', count: 3, percentage: 7.5 },
    { name: 'IT & Technology', count: 6, percentage: 15 }
  ];
  const { data: monthlyHiringData = [] } = useAgencyStaffHiringTrend();
  
  const createStaffMutation = useCreateAgencyStaff();
  const updateStaffMutation = useUpdateAgencyStaff();
  const deleteStaffMutation = useDeleteAgencyStaff();
  
  const queryClient = useQueryClient();

  // Real-time subscription for agency staff changes
  useEffect(() => {
    const channel = supabase
      .channel('public:agency_staff')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'agency_staff' 
      }, (payload) => {
        console.log('Agency staff change detected:', payload);
        
        // Invalidate and refetch all agency staff related queries
        queryClient.invalidateQueries({ queryKey: ['agency_staff'] });
        queryClient.invalidateQueries({ queryKey: ['agency_staff', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['agency_staff', 'department_stats'] });
        queryClient.invalidateQueries({ queryKey: ['agency_staff', 'hiring_trend'] });
        
        // Show a brief notification for real-time updates (optional)
        if (payload.eventType !== 'DELETE') {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<StaffFormData>({
    resolver: yupResolver(staffSchema)
  });

  const filteredStaff = staffList.filter((staff: any) => {
    const matchesSearch = `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const handleAddStaff = () => {
    setEditingStaff(null);
    reset();
    setShowModal(true);
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    Object.keys(staff).forEach(key => {
      if (key === 'first_name' || key === 'last_name' || key === 'email' || key === 'phone' || 
          key === 'role' || key === 'department' || key === 'employee_id' || 
          key === 'date_of_joining' || key === 'salary') {
        setValue(key as keyof StaffFormData, staff[key]);
      }
    });
    setShowModal(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaffMutation.mutateAsync(staffId);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    try {
      if (editingStaff) {
        await updateStaffMutation.mutateAsync({
          id: editingStaff.id,
          ...data,
        });
      } else {
        await createStaffMutation.mutateAsync(data as CreateAgencyStaffData);
      }
      setShowModal(false);
      reset();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      'Active': 'success',
      'Inactive': 'secondary',
      'On Leave': 'warning',
      'Terminated': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 95) return <Badge bg="success">Excellent</Badge>;
    if (performance >= 85) return <Badge bg="primary">Good</Badge>;
    if (performance >= 70) return <Badge bg="warning">Average</Badge>;
    return <Badge bg="danger">Needs Improvement</Badge>;
  };

  const totalStaff = stats?.totalStaff || 0;
  const activeStaff = stats?.activeStaff || 0;
  const inactiveStaff = stats?.inactiveStaff || 0;
  const avgPerformance = stats?.avgPerformance || 0;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error loading staff data</Alert.Heading>
        <p>{error.message}</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle title="Agency Staff Management" subName="Settings" />

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <FiUserCheck className="me-2" />
          Operation completed successfully!
        </Alert>
      )}
      
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="text-decoration-none">
                      <FiUsers className="me-2" />
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="staff-list" className="text-decoration-none">
                      <FiUser className="me-2" />
                      Staff Directory
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="activities" className="text-decoration-none">
                      <FiActivity className="me-2" />
                      Activities
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="analytics" className="text-decoration-none">
                      <FiBarChart className="me-2" />
                      Analytics
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              
              <Tab.Content>
                {/* Overview Tab */}
                <Tab.Pane eventKey="overview">
                  <Card.Body>
                    {/* Stats Cards Row */}
                    <Row className="mb-4">
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-primary text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-white-50 mb-1 d-block">Total Staff</small>
                                <h3 className="mb-0">{totalStaff}</h3>
                              </div>
                              <FiUsers size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-success text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-white-50 mb-1 d-block">Active Staff</small>
                                <h3 className="mb-0">{activeStaff}</h3>
                              </div>
                              <FiUserCheck size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-warning text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-white-50 mb-1 d-block">Avg Performance</small>
                                <h3 className="mb-0">{avgPerformance.toFixed(1)}%</h3>
                              </div>
                              <FiTrendingUp size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      {/* 4th Card - Inactive Staff */}
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-danger text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-white-50 mb-1 d-block">Inactive Staff</small>
                                <h3 className="mb-0">{inactiveStaff}</h3>
                              </div>
                              <FiUserX size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* Analytics Section */}
                    <Row className="mb-4">
                      {/* Department Distribution */}
                      <Col lg={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0">Staff by Department</h5>
                          </Card.Header>
                          <Card.Body>
                            {extendedDepartmentData.map((dept, index) => (
                              <div key={index} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="fw-medium">{dept.name}</span>
                                  <span className="text-muted">{dept.count} staff</span>
                                </div>
                                <ProgressBar 
                                  now={dept.percentage} 
                                  variant={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'warning' : index === 3 ? 'info' : index === 4 ? 'danger' : index === 5 ? 'secondary' : index === 6 ? 'dark' : 'light'}
                                  style={{ height: '8px' }}
                                />
                              </div>
                            ))}
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Recent Hires */}
                      <Col lg={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0">Recent Hires</h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="space-y-3">
                              {/* Recent Hire 1 */}
                              <div className="d-flex align-items-center p-3 border rounded mb-3">
                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                  <FiUserPlus className="text-white" size={20} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">Sarah Johnson</div>
                                  <div className="text-muted small">Marketing Specialist</div>
                                  <div className="text-success small">
                                    <FiCalendar className="me-1" size={12} />
                                    Hired 2 days ago
                                  </div>
                                </div>
                                <Badge bg="success">New</Badge>
                              </div>

                              {/* Recent Hire 2 */}
                              <div className="d-flex align-items-center p-3 border rounded mb-3">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                  <FiUserPlus className="text-white" size={20} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">Michael Chen</div>
                                  <div className="text-muted small">Sales Manager</div>
                                  <div className="text-primary small">
                                    <FiCalendar className="me-1" size={12} />
                                    Hired 1 week ago
                                  </div>
                                </div>
                                <Badge bg="primary">Recent</Badge>
                              </div>

                              {/* Recent Hire 3 */}
                              <div className="d-flex align-items-center p-3 border rounded mb-3">
                                <div className="bg-info rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                  <FiUserPlus className="text-white" size={20} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">Emily Rodriguez</div>
                                  <div className="text-muted small">Customer Support</div>
                                  <div className="text-info small">
                                    <FiCalendar className="me-1" size={12} />
                                    Hired 2 weeks ago
                                  </div>
                                </div>
                                <Badge bg="info">Recent</Badge>
                              </div>

                              {/* Recent Hire 4 */}
                              <div className="d-flex align-items-center p-3 border rounded">
                                <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                  <FiUserPlus className="text-white" size={20} />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-bold">David Kim</div>
                                  <div className="text-muted small">Operations Coordinator</div>
                                  <div className="text-warning small">
                                    <FiCalendar className="me-1" size={12} />
                                    Hired 3 weeks ago
                                  </div>
                                </div>
                                <Badge bg="warning">Recent</Badge>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* Staff Performance Overview */}
                    <Row className="mb-4">
                      <Col lg={12}>
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0">Staff Performance Overview</h5>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={3} className="text-center mb-3">
                                <div className="p-3 border rounded">
                                  <FiStar size={32} className="text-warning mb-2" />
                                  <h4 className="text-warning mb-1">4.2</h4>
                                  <p className="text-muted mb-0">Average Rating</p>
                                  <small className="text-success">+0.3 from last month</small>
                                </div>
                      </Col>
                              <Col md={3} className="text-center mb-3">
                                <div className="p-3 border rounded">
                                  <FiTrendingUp size={32} className="text-success mb-2" />
                                  <h4 className="text-success mb-1">87%</h4>
                                  <p className="text-muted mb-0">Performance Target</p>
                                  <small className="text-success">Above target</small>
                                </div>
                              </Col>
                              <Col md={3} className="text-center mb-3">
                                <div className="p-3 border rounded">
                                  <FiUserCheck size={32} className="text-primary mb-2" />
                                  <h4 className="text-primary mb-1">92%</h4>
                                  <p className="text-muted mb-0">Attendance Rate</p>
                                  <small className="text-primary">Excellent</small>
                                </div>
                              </Col>
                              <Col md={3} className="text-center mb-3">
                                <div className="p-3 border rounded">
                                  <FiAward size={32} className="text-info mb-2" />
                                  <h4 className="text-info mb-1">15</h4>
                                  <p className="text-muted mb-0">Awards This Month</p>
                                  <small className="text-info">Recognition</small>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>


                          </Card.Body>
                </Tab.Pane>

                {/* Staff List Tab */}
                <Tab.Pane eventKey="staff-list">
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <div className="position-relative">
                          <Form.Control
                            type="text"
                            placeholder="Search staff members..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="ps-5"
                          />
                          <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                        </div>
                      </Col>
                      <Col md={6} className="text-end">
                        <Button variant="primary" onClick={handleAddStaff}>
                          <FiPlus className="me-2" />
                          Add New Staff
                            </Button>
                      </Col>
                    </Row>

                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="table-dark">
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Performance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStaff.map((staff: any) => (
                            <tr key={staff.id}>
                              <td>{staff.employee_id}</td>
                              <td>{staff.first_name} {staff.last_name}</td>
                              <td>{staff.email}</td>
                              <td>{staff.role}</td>
                              <td>{staff.department}</td>
                              <td>{getStatusBadge(staff.status)}</td>
                              <td>{getPerformanceBadge(staff.performance)}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEditStaff(staff)}
                                  >
                                    <FiEdit2 />
                            </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteStaff(staff.id)}
                                  >
                                    <FiTrash2 />
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
                      <small className="text-muted">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStaff.length)} of {filteredStaff.length} staff (Page {currentPage} of {totalPages})
                      </small>
                      <Pagination className="mb-0">
                        <Pagination.First 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        />
                        <Pagination.Prev 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        />
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
                        <Pagination.Next 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        />
                        <Pagination.Last 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                        />
                      </Pagination>
                    </div>
                  </Card.Body>
                </Tab.Pane>

                {/* Activities Tab */}
                <Tab.Pane eventKey="activities">
                          <Card.Body>
                    <Row className="mb-4">
                      <Col lg={8}>
                        <h5 className="mb-3">Staff Activities Timeline</h5>
                        <p className="text-muted">Track all staff-related activities, events, and milestones in chronological order.</p>
                      </Col>
                      <Col lg={4} className="text-end">
                        <Button variant="outline-primary" size="sm">
                          <FiCalendar className="me-2" />
                          Filter Activities
                        </Button>
                      </Col>
                    </Row>

                            <div className="advanced-timeline">
                      {/* Recent Activities */}
                              <div className="timeline-item">
                                <div className="timeline-badge bg-success">
                          <FiUserPlus className="text-white" size={16} />
                                </div>
                                <div className="timeline-panel">
                                  <div className="timeline-heading">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="timeline-title mb-1">New Team Member Joined</h6>
                                        <p className="text-muted mb-0 small">Mike Johnson • Marketing Specialist</p>
                                      </div>
                                      <Badge bg="success" className="ms-2">New Hire</Badge>
                                    </div>
                                  </div>
                                  <div className="timeline-body">
                                    <p className="mb-2">Welcome Mike Johnson to the Marketing team! Mike brings 5+ years of digital marketing experience and will focus on social media campaigns.</p>
                                    <div className="d-flex align-items-center text-muted small">
                                      <FiCalendar className="me-1" size={12} />
                                      <span className="me-3">Joined: Jun 10, 2023</span>
                                      <FiDollarSign className="me-1" size={12} />
                                      <span>Salary: $55,000</span>
                                    </div>
                                  </div>
                                  <div className="timeline-footer">
                                    <small className="text-muted">
                                      <i className="ri-time-line me-1"></i>
                                      2 days ago • HR Department
                                    </small>
                                  </div>
                                </div>
                              </div>

                      {/* Performance Review */}
                              <div className="timeline-item">
                                <div className="timeline-badge bg-warning">
                                  <FiTrendingUp className="text-white" size={16} />
                                </div>
                                <div className="timeline-panel">
                                  <div className="timeline-heading">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="timeline-title mb-1">Performance Review Completed</h6>
                                        <p className="text-muted mb-0 small">Jane Smith • Property Manager</p>
                                      </div>
                                      <Badge bg="warning" className="ms-2">Review</Badge>
                                    </div>
                                  </div>
                                  <div className="timeline-body">
                                    <p className="mb-2">Quarterly performance review completed with excellent results. Jane exceeded her targets and showed strong leadership skills.</p>
                                    <div className="row g-2 mb-2">
                                      <div className="col-6">
                                        <div className="bg-light p-2 rounded small text-center">
                                          <strong className="text-success">88%</strong>
                                          <div className="text-muted">Performance Score</div>
                                        </div>
                                      </div>
                                      <div className="col-6">
                                        <div className="bg-light p-2 rounded small text-center">
                                          <strong className="text-primary">A+</strong>
                                          <div className="text-muted">Grade</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="timeline-footer">
                                    <small className="text-muted">
                                      <i className="ri-time-line me-1"></i>
                                      1 week ago • Performance Team
                                    </small>
                                  </div>
                                </div>
                              </div>

                      {/* Promotion */}
                              <div className="timeline-item">
                                <div className="timeline-badge bg-info">
                          <FiAward className="text-white" size={16} />
                                </div>
                                <div className="timeline-panel">
                                  <div className="timeline-heading">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="timeline-title mb-1">Staff Promotion</h6>
                                        <p className="text-muted mb-0 small">John Doe • Sales Department</p>
                                      </div>
                                      <Badge bg="info" className="ms-2">Promotion</Badge>
                                    </div>
                                  </div>
                                  <div className="timeline-body">
                                    <p className="mb-2">Congratulations to John Doe on his promotion to Senior Sales Agent! His dedication and outstanding performance earned this well-deserved advancement.</p>
                                    <div className="d-flex align-items-center text-muted small">
                                      <span className="me-3">
                                        <strong>From:</strong> Sales Agent
                                      </span>
                                      <span>
                                        <strong>To:</strong> Senior Sales Agent
                                      </span>
                                    </div>
                                  </div>
                                  <div className="timeline-footer">
                                    <small className="text-muted">
                                      <i className="ri-time-line me-1"></i>
                                      2 weeks ago • Management
                                    </small>
                                  </div>
                                </div>
                              </div>

                      {/* Training */}
                              <div className="timeline-item">
                                <div className="timeline-badge bg-primary">
                          <FiBook className="text-white" size={16} />
                                </div>
                                <div className="timeline-panel">
                                  <div className="timeline-heading">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="timeline-title mb-1">Training Program Completed</h6>
                                        <p className="text-muted mb-0 small">Sarah Wilson • Administrative Assistant</p>
                                      </div>
                                      <Badge bg="primary" className="ms-2">Training</Badge>
                                    </div>
                                  </div>
                                  <div className="timeline-body">
                                    <p className="mb-2">Sarah successfully completed the "Advanced Office Management" certification program with distinction.</p>
                                    <div className="bg-light p-2 rounded small">
                                      <strong>Course:</strong> Advanced Office Management<br/>
                                      <strong>Duration:</strong> 40 hours<br/>
                                      <strong>Score:</strong> 95%
                                    </div>
                                  </div>
                                  <div className="timeline-footer">
                                    <small className="text-muted">
                                      <i className="ri-time-line me-1"></i>
                                      3 weeks ago • Training Department
                                    </small>
                                  </div>
                                </div>
                              </div>

                      {/* Leave Request */}
                              <div className="timeline-item">
                                <div className="timeline-badge bg-secondary">
                                  <FiCalendar className="text-white" size={16} />
                                </div>
                                <div className="timeline-panel">
                                  <div className="timeline-heading">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="timeline-title mb-1">Leave Request Approved</h6>
                                        <p className="text-muted mb-0 small">David Brown • Sales Agent</p>
                                      </div>
                                      <Badge bg="secondary" className="ms-2">Leave</Badge>
                                    </div>
                                  </div>
                                  <div className="timeline-body">
                                    <p className="mb-2">Approved vacation leave request for family vacation. Temporary coverage arranged with team members.</p>
                                    <div className="d-flex align-items-center text-muted small">
                                      <span className="me-3">
                                        <strong>Duration:</strong> 2 weeks
                                      </span>
                                      <span>
                                        <strong>Type:</strong> Annual Leave
                                      </span>
                                    </div>
                                  </div>
                                  <div className="timeline-footer">
                                    <small className="text-muted">
                                      <i className="ri-time-line me-1"></i>
                                      1 month ago • HR Department
                                    </small>
                                  </div>
                                </div>
                              </div>

                      {/* Salary Adjustment */}
                      <div className="timeline-item">
                        <div className="timeline-badge bg-success">
                          <FiDollarSign className="text-white" size={16} />
                        </div>
                        <div className="timeline-panel">
                          <div className="timeline-heading">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="timeline-title mb-1">Salary Adjustment</h6>
                                <p className="text-muted mb-0 small">Lisa Chen • Operations Manager</p>
                              </div>
                              <Badge bg="success" className="ms-2">Salary</Badge>
                            </div>
                          </div>
                          <div className="timeline-body">
                            <p className="mb-2">Annual salary review completed with merit increase based on exceptional performance and market adjustments.</p>
                            <div className="d-flex align-items-center text-muted small">
                              <span className="me-3">
                                <strong>Previous:</strong> $65,000
                              </span>
                              <span>
                                <strong>New:</strong> $68,500 (+5.4%)
                                      </span>
                                    </div>
                                  </div>
                                  <div className="timeline-footer">
                                    <small className="text-muted">
                                      <i className="ri-time-line me-1"></i>
                                      1 month ago • HR Department
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                </Tab.Pane>

                {/* Analytics Tab */}
                <Tab.Pane eventKey="analytics">
                  <Card.Body>
                    <Row className="mb-4">
                      <Col lg={8}>
                        <h5 className="mb-3">Staff Analytics & Insights</h5>
                        <p className="text-muted">Comprehensive analytics and insights about staff performance, trends, and key metrics.</p>
                      </Col>
                      <Col lg={4} className="text-end">
                        <Button variant="outline-primary" size="sm">
                          <FiBarChart className="me-2" />
                          Export Report
                        </Button>
                      </Col>
                    </Row>

                    {/* Key Metrics Cards */}
                    <Row className="mb-4">
                      <Col lg={3} md={6} className="mb-3">
                        <Card className="text-center border-0 shadow-sm">
                          <Card.Body>
                            <FiTrendingUp size={32} className="text-success mb-2" />
                            <h4 className="text-success mb-1">87.5%</h4>
                            <p className="text-muted mb-0">Avg Performance</p>
                            <small className="text-success">+2.3% from last month</small>
                  </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={3} md={6} className="mb-3">
                        <Card className="text-center border-0 shadow-sm">
                          <Card.Body>
                            <FiCalendar size={32} className="text-primary mb-2" />
                            <h4 className="text-primary mb-1">8.2</h4>
                            <p className="text-muted mb-0">Avg Tenure (months)</p>
                            <small className="text-muted">Across all departments</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={3} md={6} className="mb-3">
                        <Card className="text-center border-0 shadow-sm">
                          <Card.Body>
                            <FiDollarSign size={32} className="text-warning mb-2" />
                            <h4 className="text-warning mb-1">$52K</h4>
                            <p className="text-muted mb-0">Avg Salary</p>
                            <small className="text-warning">+5.2% from last year</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={3} md={6} className="mb-3">
                        <Card className="text-center border-0 shadow-sm">
                          <Card.Body>
                            <FiStar size={32} className="text-info mb-2" />
                            <h4 className="text-info mb-1">4.2</h4>
                            <p className="text-muted mb-0">Avg Rating</p>
                            <small className="text-info">Based on reviews</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* Staff Retention Analysis */}
                    <Row className="mb-4">
                      <Col lg={12}>
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Staff Retention Analysis</h6>
                          </Card.Header>
                  <Card.Body>
                            <Row>
                              <Col md={4}>
                                <div className="text-center mb-3">
                                  <h3 className="text-success mb-1">92%</h3>
                                  <p className="text-muted mb-0">Retention Rate</p>
                                  <small className="text-success">Above industry average</small>
                        </div>
                      </Col>
                              <Col md={4}>
                                <div className="text-center mb-3">
                                  <h3 className="text-primary mb-1">3.2%</h3>
                                  <p className="text-muted mb-0">Turnover Rate</p>
                                  <small className="text-primary">Low turnover</small>
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="text-center mb-3">
                                  <h3 className="text-warning mb-1">15</h3>
                                  <p className="text-muted mb-0">Avg Days to Hire</p>
                                  <small className="text-warning">Efficient process</small>
                                </div>
                      </Col>
                    </Row>
                            <hr />
                            <Row>
                              <Col md={6}>
                                <h6 className="mb-3">Top Retention Factors</h6>
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Career Growth</span>
                                    <span className="text-success">85%</span>
                                </div>
                                  <ProgressBar now={85} variant="success" style={{ height: '6px' }} />
                    </div>
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Work-Life Balance</span>
                                    <span className="text-primary">78%</span>
                                  </div>
                                  <ProgressBar now={78} variant="primary" style={{ height: '6px' }} />
                                </div>
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span>Compensation</span>
                                    <span className="text-warning">72%</span>
                                  </div>
                                  <ProgressBar now={72} variant="warning" style={{ height: '6px' }} />
                                </div>
                              </Col>
                              <Col md={6}>
                                <h6 className="mb-3">Recent Improvements</h6>
                                <ul className="list-unstyled">
                                  <li className="mb-2">
                                    <FiStar className="text-success me-2" size={14} />
                                    Enhanced training programs
                                  </li>
                                  <li className="mb-2">
                                    <FiStar className="text-success me-2" size={14} />
                                    Flexible work arrangements
                                  </li>
                                  <li className="mb-2">
                                    <FiStar className="text-success me-2" size={14} />
                                    Performance-based bonuses
                                  </li>
                                  <li className="mb-2">
                                    <FiStar className="text-success me-2" size={14} />
                                    Employee recognition program
                                  </li>
                                </ul>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* Analytics Charts Row 1 */}
                    <Row className="mb-4">
                      <Col lg={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Department Distribution</h6>
                          </Card.Header>
                          <Card.Body>
                            <ReactApexChart
                              options={{
                                chart: {
                                  type: 'donut',
                                  height: 300,
                                },
                                labels: ['Sales', 'Operations', 'Marketing', 'Administration'],
                                colors: ['#007bff', '#28a745', '#ffc107', '#17a2b8'],
                                legend: {
                                  position: 'bottom',
                                },
                                dataLabels: {
                                  enabled: true,
                                  formatter: function (val: string) {
                                    return val + "%"
                                  }
                                },
                                plotOptions: {
                                  pie: {
                                    donut: {
                                      size: '70%',
                                    }
                                  }
                                }
                              }}
                              series={[35, 25, 20, 20]}
                              type="donut"
                              height={300}
                            />
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Performance Ratings Distribution</h6>
                          </Card.Header>
                          <Card.Body>
                            <ReactApexChart
                              options={{
                                chart: {
                                  type: 'bar',
                                  height: 300,
                                },
                                xaxis: {
                                  categories: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
                                },
                                colors: ['#28a745', '#007bff', '#ffc107', '#dc3545'],
                                plotOptions: {
                                  bar: {
                                    horizontal: true,
                                    borderRadius: 4,
                                  }
                                },
                                dataLabels: {
                                  enabled: true,
                                },
                                yaxis: {
                                  labels: {
                                    style: {
                                      fontSize: '12px'
                                    }
                                  }
                                }
                              }}
                              series={[{
                                name: 'Staff Count',
                                data: [12, 18, 8, 2]
                              }]}
                              type="bar"
                              height={300}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* Analytics Charts Row 2 */}
                    <Row className="mb-4">
                      <Col lg={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Monthly Hiring Trends</h6>
                          </Card.Header>
                          <Card.Body>
                            <ReactApexChart
                              options={{
                                chart: {
                                  type: 'line',
                                  height: 300,
                                },
                                xaxis: {
                                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                },
                                colors: ['#007bff'],
                                stroke: {
                                  curve: 'smooth',
                                  width: 3,
                                },
                                markers: {
                                  size: 5,
                                },
                                dataLabels: {
                                  enabled: false,
                                },
                                grid: {
                                  borderColor: '#f1f1f1',
                                }
                              }}
                              series={[{
                                name: 'New Hires',
                                data: [2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 1, 2]
                              }]}
                              type="line"
                              height={300}
                            />
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col lg={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Salary Distribution by Department</h6>
                          </Card.Header>
                          <Card.Body>
                            <ReactApexChart
                              options={{
                                chart: {
                                  type: 'bar',
                                  height: 300,
                                },
                                xaxis: {
                                  categories: ['Sales', 'Operations', 'Marketing', 'Administration'],
                                },
                                colors: ['#28a745', '#007bff', '#ffc107', '#17a2b8'],
                                plotOptions: {
                                  bar: {
                                    borderRadius: 4,
                                    columnWidth: '60%',
                                  }
                                },
                                dataLabels: {
                                  enabled: true,
                                  formatter: function (val: number) {
                                    return '$' + (val / 1000) + 'K'
                                  }
                                },
                                yaxis: {
                                  labels: {
                                    formatter: function (val: number) {
                                      return '$' + (val / 1000) + 'K'
                                    }
                                  }
                                }
                              }}
                              series={[{
                                name: 'Average Salary',
                                data: [55000, 62000, 48000, 45000]
                              }]}
                              type="bar"
                              height={300}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab.Pane>
              </Tab.Content>
            </Card>
          </Col>
        </Row>
      </Tab.Container>

      {/* Add/Edit Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('first_name')}
                    isInvalid={!!errors.first_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.first_name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('last_name')}
                    isInvalid={!!errors.last_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.last_name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email')}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('phone')}
                    isInvalid={!!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select {...register('role')} isInvalid={!!errors.role}>
                    <option value="">Select Role</option>
                    <option value="Sales Agent">Sales Agent</option>
                    <option value="Property Manager">Property Manager</option>
                    <option value="Marketing Specialist">Marketing Specialist</option>
                    <option value="Administrative Assistant">Administrative Assistant</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Select {...register('department')} isInvalid={!!errors.department}>
                    <option value="">Select Department</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Administration">Administration</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.department?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('employee_id')}
                    isInvalid={!!errors.employee_id}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.employee_id?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Date of Joining</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('date_of_joining')}
                    isInvalid={!!errors.date_of_joining}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.date_of_joining?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('salary')}
                    isInvalid={!!errors.salary}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.salary?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AgencyStaffPage;
