'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Badge, Dropdown, Tab, Tabs } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="text-center">Loading chart...</div>
});

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { useListStaff, StaffMember } from '@/hooks/useListStaff';
import { useCreateStaff, CreateStaffData } from '@/hooks/useCreateStaff';
import { useUpdateStaff } from '@/hooks/useUpdateStaff';
import { useDeleteStaff } from '@/hooks/useDeleteStaff';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Using StaffMember interface from hooks

// Mock data removed - using real Supabase data now

// Form validation schema
const staffSchema = yup.object().shape({
  community_id: yup.string().required('Community ID is required'),
  employee_id: yup.string().required('Employee ID is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  department: yup.string().required('Department is required'),
  position: yup.string().required('Position is required'),
  hire_date: yup.date().nullable(),
  salary: yup.number().min(0, 'Salary must be positive'),
  emergency_contact_name: yup.string().required('Emergency contact name is required'),
  emergency_contact_phone: yup.string().required('Emergency contact phone is required'),
  address: yup.string().required('Address is required'),
});

const StaffManagement = () => {
  // Client-side check to prevent SSR issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hooks for data management
  const { data: staffData = [], isLoading, error } = useListStaff();
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();
  const queryClient = useQueryClient();

  // Debug logging
  console.log('🏢 StaffManagement: Component rendered');
  console.log('📊 StaffManagement: Data state:', { 
    staffData: staffData?.length, 
    isLoading, 
    error: error?.message 
  });

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [overviewCurrentPage, setOverviewCurrentPage] = useState(1);
  const [overviewItemsPerPage, setOverviewItemsPerPage] = useState(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStaffData>();

  // Real-time subscription for staff updates
  useEffect(() => {
    const channel = supabase
      .channel('public:community_staff')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_staff' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['community_staff'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Filter staff data
  const filteredStaff = useMemo(() => {
    const filtered = staffData.filter(staff => {
      const matchesSearch = searchTerm === '' || 
        staff.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCommunity = selectedCommunity === 'all' || staff.community_id === selectedCommunity;
      const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus;
      
      return matchesSearch && matchesCommunity && matchesDepartment && matchesStatus;
    });

    return filtered;
  }, [staffData, searchTerm, selectedCommunity, selectedDepartment, selectedStatus]);

  // Paginated staff data
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  }, [filteredStaff, currentPage, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredStaff.length);

  // Overview table pagination logic
  const overviewCommunities = Object.entries(
    staffData.reduce((acc, staff) => {
      const communityId = staff.community_id;
      if (!acc[communityId]) {
        acc[communityId] = {
          community_name: staff.community_name,
          total: 0,
          active: 0,
          departments: new Set(),
          totalPerformance: 0,
          totalAttendance: 0,
        };
      }
      acc[communityId].total++;
      if (staff.status === 'active') acc[communityId].active++;
      acc[communityId].departments.add(staff.department);
      acc[communityId].totalPerformance += staff.performance_rating;
      acc[communityId].totalAttendance += staff.attendance_percentage;
      return acc;
    }, {} as Record<string, any>)
  );
  
  const overviewTotalItems = overviewCommunities.length;
  const overviewTotalPages = Math.ceil(overviewTotalItems / overviewItemsPerPage);
  const overviewStartIndex = (overviewCurrentPage - 1) * overviewItemsPerPage;
  const overviewEndIndex = overviewStartIndex + overviewItemsPerPage;
  const paginatedOverviewCommunities = overviewCommunities.slice(overviewStartIndex, overviewEndIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCommunity, selectedDepartment, selectedStatus]);

  // Reset pagination when filtered results change
  useEffect(() => {
    if (currentPage > Math.ceil(filteredStaff.length / itemsPerPage) && filteredStaff.length > 0) {
      setCurrentPage(1);
    }
  }, [filteredStaff.length, itemsPerPage, currentPage]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!staffData || staffData.length === 0) {
      return {
        totalStaff: 0,
        activeStaff: 0,
        departmentCounts: {},
        avgPerformance: 0,
        avgAttendance: 0,
        onLeave: 0,
      };
    }

    const totalStaff = staffData.length;
    const activeStaff = staffData.filter(s => s.status === 'active').length;
    const departmentCounts = staffData.reduce((acc, staff) => {
      acc[staff.department] = (acc[staff.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgPerformance = totalStaff > 0 
      ? staffData.reduce((sum, staff) => sum + staff.performance_rating, 0) / totalStaff
      : 0;
    const avgAttendance = totalStaff > 0 
      ? staffData.reduce((sum, staff) => sum + staff.attendance_percentage, 0) / totalStaff
      : 0;
    
    return {
      totalStaff,
      activeStaff,
      departmentCounts,
      avgPerformance: avgPerformance.toFixed(1),
      avgAttendance: avgAttendance.toFixed(1),
      onLeave: staffData.filter(s => s.status === 'on_leave').length,
    };
  }, [staffData]);

  // Chart configurations
  const departmentChartOptions = {
    chart: { type: 'donut' as const },
    labels: Object.keys(statistics.departmentCounts),
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
    legend: { position: 'bottom' as const },
  };

  const performanceChartOptions = {
    chart: { type: 'bar' as const },
    xaxis: {
      categories: staffData.map(s => `${s.first_name} ${s.last_name}`),
    },
    colors: ['#3b82f6'],
  };

  const handleCreateOrUpdate = (data: CreateStaffData) => {
    if (editingStaff) {
      // Update existing staff
      updateStaffMutation.mutate({ id: editingStaff.id, ...data });
    } else {
      // Create new staff
      const newStaffData: CreateStaffData = {
        ...data,
        documents_verified: {
          id_proof: false,
          address_proof: false,
          police_verification: false,
          medical_certificate: false,
          educational_certificate: false,
        },
        performance_rating: 0,
        attendance_percentage: 0,
        documents_uploaded: false,
        background_check_status: 'pending',
        training_completed: false,
      };
      
      createStaffMutation.mutate(newStaffData);
    }
    
    setShowModal(false);
    setEditingStaff(null);
    reset();
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    reset(staff);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (staffToDelete) {
      deleteStaffMutation.mutate(staffToDelete);
      setStaffToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const getDepartmentBadge = (department: string) => {
    const colors: Record<string, string> = {
      security: 'primary',
      housekeeping: 'info',
      maintenance: 'warning',
      administration: 'success',
      management: 'danger',
      gardening: 'secondary',
      reception: 'dark',
      it: 'light',
    };
    return colors[department] || 'secondary';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      inactive: 'secondary',
      on_leave: 'warning',
      terminated: 'danger',
    };
    return colors[status] || 'secondary';
  };

  const formatEmploymentType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: 'Settings', path: '/settings' },
          { label: 'Communities', path: '/settings/communities' },
          { label: 'Staff Management', path: '/settings/communities/staff', active: true },
        ]}
        title="Staff Management"
      />

      <ComponentContainerCard>
        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <Row className="mb-4">
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:team-line" className="display-6 text-primary mb-2" />
                    <h3 className="mb-1">{statistics.totalStaff}</h3>
                    <p className="text-muted mb-0">Total Staff</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:user-3-line" className="display-6 text-success mb-2" />
                    <h3 className="mb-1">{statistics.activeStaff}</h3>
                    <p className="text-muted mb-0">Active Staff</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:star-line" className="display-6 text-warning mb-2" />
                    <h3 className="mb-1">{statistics.avgPerformance}</h3>
                    <p className="text-muted mb-0">Avg Performance</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl={3} md={6}>
                <Card className="text-center">
                  <Card.Body>
                    <IconifyIcon icon="ri:calendar-check-line" className="display-6 text-info mb-2" />
                    <h3 className="mb-1">{statistics.avgAttendance}%</h3>
                    <p className="text-muted mb-0">Avg Attendance</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>


            {/* Community-wise Staff Overview */}
            <Row className="mt-4">
              <Col lg={8}>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Community-wise Staff Overview</h5>
                    <Button variant="outline-primary" size="sm">
                      <IconifyIcon icon="ri:download-line" className="me-1" />
                      Export
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th>Community</th>
                            <th>Total Staff</th>
                            <th>Active</th>
                            <th>Departments</th>
                            <th>Avg Performance</th>
                            <th>Avg Attendance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedOverviewCommunities.map(([communityId, data]) => {
                            const avgPerformance = (data.totalPerformance / data.total).toFixed(1);
                            const avgAttendance = (data.totalAttendance / data.total).toFixed(1);
                            const activePercentage = (data.active / data.total) * 100;
                            
                            return (
                              <tr key={communityId}>
                                <td>
                                  <div className="fw-bold">{data.community_name}</div>
                                  <small className="text-muted">{data.departments.size} departments</small>
                                </td>
                                <td>
                                  <span className="fw-bold">{data.total}</span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <span className="me-2">{data.active}</span>
                                    <div className="progress" style={{ width: '60px', height: '6px' }}>
                                      <div 
                                        className="progress-bar bg-success" 
                                        style={{ width: `${activePercentage}%` }}
                                      ></div>
                                    </div>
                                    <small className="ms-2 text-muted">{activePercentage.toFixed(0)}%</small>
                                  </div>
                                </td>
                                                                 <td>
                                   <div className="d-flex flex-wrap gap-1">
                                     {(Array.from(data.departments) as string[]).slice(0, 3).map((dept: string) => (
                                       <Badge key={dept} bg={getDepartmentBadge(dept)} className="small">
                                         {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                       </Badge>
                                     ))}
                                     {data.departments.size > 3 && (
                                       <Badge bg="light" text="dark" className="small">
                                         +{data.departments.size - 3}
                                       </Badge>
                                     )}
                                   </div>
                                 </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <span className="me-1">{avgPerformance}</span>
                                    <IconifyIcon icon="ri:star-fill" className="text-warning" />
                                  </div>
                                </td>
                                <td>{avgAttendance}%</td>
                                <td>
                                  <Badge bg={activePercentage >= 80 ? 'success' : activePercentage >= 60 ? 'warning' : 'danger'}>
                                    {activePercentage >= 80 ? 'Excellent' : activePercentage >= 60 ? 'Good' : 'Needs Attention'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Overview Table Pagination */}
                    {overviewTotalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-4 px-3 pb-3">
                        <span className="text-muted small">
                          Showing {overviewStartIndex + 1}-{Math.min(overviewEndIndex, overviewTotalItems)} of {overviewTotalItems} communities
                        </span>
                        <nav>
                          <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${overviewCurrentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setOverviewCurrentPage(1)}
                                disabled={overviewCurrentPage === 1}
                              >
                                <IconifyIcon icon="ri:arrow-left-double-line" />
                              </button>
                            </li>
                            <li className={`page-item ${overviewCurrentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setOverviewCurrentPage(overviewCurrentPage - 1)}
                                disabled={overviewCurrentPage === 1}
                              >
                                <IconifyIcon icon="ri:arrow-left-s-line" />
                              </button>
                            </li>
                            
                            {Array.from({ length: Math.min(5, overviewTotalPages) }, (_, i) => {
                              let pageNumber;
                              if (overviewTotalPages <= 5) {
                                pageNumber = i + 1;
                              } else if (overviewCurrentPage <= 3) {
                                pageNumber = i + 1;
                              } else if (overviewCurrentPage >= overviewTotalPages - 2) {
                                pageNumber = overviewTotalPages - 4 + i;
                              } else {
                                pageNumber = overviewCurrentPage - 2 + i;
                              }

                              return (
                                <li key={pageNumber} className={`page-item ${overviewCurrentPage === pageNumber ? 'active' : ''}`}>
                                  <button 
                                    className="page-link" 
                                    onClick={() => setOverviewCurrentPage(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            })}

                            {overviewTotalPages > 5 && overviewCurrentPage < overviewTotalPages - 2 && (
                              <>
                                <li className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                                <li className="page-item">
                                  <button 
                                    className="page-link" 
                                    onClick={() => setOverviewCurrentPage(overviewTotalPages)}
                                  >
                                    {overviewTotalPages}
                                  </button>
                                </li>
                              </>
                            )}

                            <li className={`page-item ${overviewCurrentPage === overviewTotalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setOverviewCurrentPage(overviewCurrentPage + 1)}
                                disabled={overviewCurrentPage === overviewTotalPages}
                              >
                                <IconifyIcon icon="ri:arrow-right-s-line" />
                              </button>
                            </li>
                            <li className={`page-item ${overviewCurrentPage === overviewTotalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setOverviewCurrentPage(overviewTotalPages)}
                                disabled={overviewCurrentPage === overviewTotalPages}
                              >
                                <IconifyIcon icon="ri:arrow-right-double-line" />
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Quick Actions</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button variant="primary" size="sm">
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Add New Staff
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:download-line" className="me-1" />
                        Export Staff List
                      </Button>
                      <Button variant="outline-info" size="sm">
                        <IconifyIcon icon="ri:file-excel-line" className="me-1" />
                        Import Staff Data
                      </Button>
                      <Button variant="outline-success" size="sm">
                        <IconifyIcon icon="ri:calendar-line" className="me-1" />
                        Schedule Review
                      </Button>
                    </div>
                    
                    <hr />
                    
                    <h6 className="mb-3">Staff Insights</h6>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Top Department</small>
                        <small className="fw-bold">
                          {Object.keys(statistics.departmentCounts).length > 0 
                            ? Object.keys(statistics.departmentCounts).reduce((a, b) => 
                                statistics.departmentCounts[a] > statistics.departmentCounts[b] ? a : b
                              )
                            : 'N/A'
                          }
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Avg Tenure</small>
                        <small className="fw-bold">2.3 years</small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">On Leave</small>
                        <small className="fw-bold">{statistics.onLeave}</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          <Tab eventKey="staff-list" title="Staff List">
            <Row className="mb-3">
              <Col lg={3}>
                <Form.Control
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)}>
                  <option value="all">All Communities</option>
                  <option value="com-001">Green Valley Apartments</option>
                  <option value="com-002">Sunset Heights</option>
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <option value="all">All Departments</option>
                  <option value="security">Security</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="administration">Administration</option>
                  <option value="management">Management</option>
                  <option value="gardening">Gardening</option>
                  <option value="reception">Reception</option>
                  <option value="it">IT</option>
                </Form.Select>
              </Col>
              <Col lg={2}>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </Form.Select>
              </Col>
              <Col lg={3} className="text-end">
                <Form.Select 
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  size="sm"
                  className="d-inline-block me-2"
                  style={{ width: 'auto' }}
                >
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={30}>30 per page</option>
                </Form.Select>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  <IconifyIcon icon={viewMode === 'list' ? 'ri:layout-grid-line' : 'ri:list-unordered'} />
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setEditingStaff(null);
                    reset();
                    setShowModal(true);
                  }}
                >
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Staff
                </Button>
              </Col>
            </Row>

            {isLoading ? (
              <Card>
                <Card.Body className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading staff data...</p>
                </Card.Body>
              </Card>
            ) : error ? (
              <Card>
                <Card.Body className="text-center py-5">
                  <div className="text-danger">
                    <IconifyIcon icon="ri:error-warning-line" className="display-6 mb-2" />
                    <p>Error loading staff data: {error.message}</p>
                  </div>
                </Card.Body>
              </Card>
            ) : viewMode === 'list' ? (
              <Card>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Employee</th>
                          <th>Community</th>
                          <th>Department</th>
                          <th>Position</th>
                          <th>Employment Type</th>
                          <th>Shift</th>
                          <th>Salary</th>
                          <th>Performance</th>
                          <th>Attendance</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStaff.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="text-center py-4 text-muted">
                              {filteredStaff.length === 0 ? 'No staff members found' : 'No results on this page'}
                            </td>
                          </tr>
                        ) : (
                          paginatedStaff.map((staff) => (
                          <tr key={staff.id}>
                            <td>
                              <div>
                                <div className="fw-bold">{staff.first_name} {staff.last_name}</div>
                                <small className="text-muted">{staff.employee_id}</small>
                                <br />
                                <small className="text-muted">{staff.email}</small>
                              </div>
                            </td>
                            <td>{staff.community_name}</td>
                            <td>
                              <Badge bg={getDepartmentBadge(staff.department)}>
                                {staff.department.charAt(0).toUpperCase() + staff.department.slice(1)}
                              </Badge>
                            </td>
                            <td>{staff.position}</td>
                            <td>{formatEmploymentType(staff.employment_type)}</td>
                            <td className="text-capitalize">{staff.shift.replace('_', ' ')}</td>
                            <td>${staff.salary.toLocaleString()}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="me-1">{staff.performance_rating}</span>
                                <IconifyIcon icon="ri:star-fill" className="text-warning" />
                              </div>
                            </td>
                            <td>{staff.attendance_percentage}%</td>
                            <td>
                              <Badge bg={getStatusBadge(staff.status)}>
                                {staff.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  <IconifyIcon icon="ri:more-2-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEdit(staff)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-1" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="text-danger"
                                    onClick={() => {
                                      setStaffToDelete(staff.id);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {paginatedStaff.map((staff) => (
                  <Col lg={4} md={6} key={staff.id} className="mb-3">
                    <Card>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="mb-1">{staff.first_name} {staff.last_name}</h6>
                            <small className="text-muted">{staff.employee_id}</small>
                          </div>
                          <Badge bg={getStatusBadge(staff.status)}>
                            {staff.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="mb-2">
                          <Badge bg={getDepartmentBadge(staff.department)} className="me-2">
                            {staff.department.charAt(0).toUpperCase() + staff.department.slice(1)}
                          </Badge>
                          <small className="text-muted">{staff.position}</small>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted d-block">{staff.community_name}</small>
                          <small className="text-muted d-block">{staff.email}</small>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <small>
                            <IconifyIcon icon="ri:star-fill" className="text-warning me-1" />
                            {staff.performance_rating}
                          </small>
                          <small>{staff.attendance_percentage}% Attendance</small>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(staff)}>
                            <IconifyIcon icon="ri:edit-line" />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              setStaffToDelete(staff.id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <IconifyIcon icon="ri:delete-bin-line" />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* Pagination Controls */}
            {filteredStaff.length > 0 && (
              <Row className="mt-4">
                <Col lg={6}>
                  <div className="d-flex align-items-center">
                    <span className="text-muted">
                      Showing {startItem} to {endItem} of {filteredStaff.length} staff members
                    </span>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="d-flex justify-content-end">
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            <IconifyIcon icon="ri:arrow-left-double-line" />
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <IconifyIcon icon="ri:arrow-left-s-line" />
                          </button>
                        </li>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setCurrentPage(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                            <li className="page-item">
                              <button 
                                className="page-link" 
                                onClick={() => setCurrentPage(totalPages)}
                              >
                                {totalPages}
                              </button>
                            </li>
                          </>
                        )}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <IconifyIcon icon="ri:arrow-right-s-line" />
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                          >
                            <IconifyIcon icon="ri:arrow-right-double-line" />
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Col>
              </Row>
            )}
          </Tab>

          <Tab eventKey="analytics" title={
            <span><IconifyIcon icon="ri:bar-chart-line" className="me-2" />Analytics</span>
          }>
            <ComponentContainerCard title="Staff Analytics">
              {/* Top Row - Department Distribution & Performance Trends */}
              <Row className="mb-4">
                <Col lg={4} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent border-bottom-0 pb-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0 fw-semibold">Department Distribution</h5>
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                          <IconifyIcon icon="ri:pie-chart-line" className="text-primary" />
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="pt-2">
                      {isClient ? (
                        <ReactApexChart
                          options={departmentChartOptions}
                          series={Object.values(statistics.departmentCounts)}
                          type="donut"
                          height={280}
                        />
                      ) : (
                        <div className="text-center py-4">Loading chart...</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={8} className="mb-4">
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-transparent border-bottom-0 pb-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0 fw-semibold">Performance Ratings</h5>
                        <div className="bg-success bg-opacity-10 rounded-circle p-2">
                          <IconifyIcon icon="ri:bar-chart-line" className="text-success" />
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="pt-2">
                      {isClient ? (
                        <ReactApexChart
                          options={performanceChartOptions}
                          series={[{ name: 'Performance Rating', data: staffData.map(s => s.performance_rating) }]}
                          type="bar"
                          height={280}
                        />
                      ) : (
                        <div className="text-center py-4">Loading chart...</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

            </ComponentContainerCard>
          </Tab>
        </Tabs>
      </ComponentContainerCard>

      {/* Add/Edit Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateOrUpdate)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Community *</Form.Label>
                  <Form.Select {...register('community_id')} isInvalid={!!errors.community_id}>
                    <option value="">Select Community</option>
                    <option value="com-001">Green Valley Apartments</option>
                    <option value="com-002">Sunset Heights</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.community_id?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee ID *</Form.Label>
                  <Form.Control {...register('employee_id')} isInvalid={!!errors.employee_id} />
                  <Form.Control.Feedback type="invalid">{errors.employee_id?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control {...register('first_name')} isInvalid={!!errors.first_name} />
                  <Form.Control.Feedback type="invalid">{errors.first_name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control {...register('last_name')} isInvalid={!!errors.last_name} />
                  <Form.Control.Feedback type="invalid">{errors.last_name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control {...register('phone')} isInvalid={!!errors.phone} />
                  <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control type="email" {...register('email')} isInvalid={!!errors.email} />
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department *</Form.Label>
                  <Form.Select {...register('department')} isInvalid={!!errors.department}>
                    <option value="">Select Department</option>
                    <option value="security">Security</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="administration">Administration</option>
                    <option value="management">Management</option>
                    <option value="gardening">Gardening</option>
                    <option value="reception">Reception</option>
                    <option value="it">IT</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.department?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position *</Form.Label>
                  <Form.Control {...register('position')} isInvalid={!!errors.position} />
                  <Form.Control.Feedback type="invalid">{errors.position?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Employment Type *</Form.Label>
                  <Form.Select {...register('employment_type')} isInvalid={!!errors.employment_type}>
                    <option value="">Select Type</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="intern">Intern</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.employment_type?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Shift *</Form.Label>
                  <Form.Select {...register('shift')} isInvalid={!!errors.shift}>
                    <option value="">Select Shift</option>
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="rotating">Rotating</option>
                    <option value="flexible">Flexible</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.shift?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...register('status')} isInvalid={!!errors.status}>
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.status?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Joining Date *</Form.Label>
                  <Form.Control type="date" {...register('joining_date')} isInvalid={!!errors.joining_date} />
                  <Form.Control.Feedback type="invalid">{errors.joining_date?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Salary *</Form.Label>
                  <Form.Control type="number" {...register('salary')} isInvalid={!!errors.salary} />
                  <Form.Control.Feedback type="invalid">{errors.salary?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Name *</Form.Label>
                  <Form.Control {...register('emergency_contact_name')} isInvalid={!!errors.emergency_contact_name} />
                  <Form.Control.Feedback type="invalid">{errors.emergency_contact_name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Phone *</Form.Label>
                  <Form.Control {...register('emergency_contact_phone')} isInvalid={!!errors.emergency_contact_phone} />
                  <Form.Control.Feedback type="invalid">{errors.emergency_contact_phone?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control as="textarea" rows={3} {...register('address')} isInvalid={!!errors.address} />
              <Form.Control.Feedback type="invalid">{errors.address?.message}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingStaff ? 'Update' : 'Create'} Staff Member
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this staff member? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StaffManagement;
