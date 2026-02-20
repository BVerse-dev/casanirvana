'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { supabase } from '@/lib/supabase';

// Hooks and types
import {
  useListGuards,
  useCreateGuard,
  useUpdateGuard,
  useDeleteGuard,
  useUpdateGuardStatus,
  type GuardFormData,
  transformDbDataToFormFormat,
} from '@/hooks/useGuards';

interface GuardProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'on_leave' | 'terminated';
  licenseNumber: string;
  employmentDate: string;
  shiftType: 'day' | 'night' | 'rotating' | 'flexible';
  emergencyContact: string;
  emergencyName: string;
  salary: number;
  lastLogin?: string;
  communityAssignment?: string;
  certifications: string[];
  experience: number; // years
  rating: number;
  totalShifts: number;
  completedShifts: number;
  address: string;
  dateOfBirth: string;
  bloodGroup?: string;
  medicalConditions?: string;
  skills: string[];
}

// Form validation schema - updated to match imported GuardFormData type
const guardSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  status: yup.string().required('Status is required'),
  licenseNumber: yup.string().required('License number is required'),
  employmentDate: yup.string().required('Employment date is required'),
  shiftType: yup.string().required('Shift type is required'),
  emergencyContact: yup.string().required('Emergency contact is required'),
  emergencyName: yup.string().required('Emergency contact name is required'),
  salary: yup.number().positive('Salary must be positive').required('Salary is required'),
  communityAssignment: yup.string().optional(),
  address: yup.string().required('Address is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  bloodGroup: yup.string().optional(),
  medicalConditions: yup.string().optional(),
  password: yup.string().min(8, 'Password must be at least 8 characters').optional(),
  sendWelcomeEmail: yup.boolean().optional(),
});

const GuardProfilesPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<GuardProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Supabase hooks
  const { data: guardsData = [], isLoading: isLoadingGuards, error: guardsError } = useListGuards();
  const createGuardMutation = useCreateGuard();
  const updateGuardMutation = useUpdateGuard(selectedGuard?.id || '');
  const deleteGuardMutation = useDeleteGuard();
  const updateStatusMutation = useUpdateGuardStatus();

  const loading = createGuardMutation.isPending || updateGuardMutation.isPending || deleteGuardMutation.isPending;

  // Real-time subscription for guards table updates
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('public:guards')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guards' }, () => {
        queryClient.invalidateQueries({ queryKey: ['guards'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<GuardFormData>({
    resolver: yupResolver(guardSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'active',
      licenseNumber: '',
      employmentDate: '',
      shiftType: 'day',
      emergencyContact: '',
      emergencyName: '',
      salary: 35000,
      communityAssignment: '',
      address: '',
      dateOfBirth: '',
      bloodGroup: '',
      medicalConditions: '',
      password: '',
      sendWelcomeEmail: true,
    }
  });

  // Transform Supabase data to UI format
  const guards: GuardProfile[] = guardsData.map(guard => {
    const nameParts = guard.full_name?.split(' ') || ['Unknown', 'Guard'];
    return {
      id: guard.id,
      firstName: nameParts[0] || 'Unknown',
      lastName: nameParts.slice(1).join(' ') || 'Guard',
      email: '', // Will be available after schema update
      phone: '', // Will be available after schema update
      avatar: '',
      status: guard.is_active ? 'active' : 'inactive' as any,
      licenseNumber: guard.license_number || '',
      employmentDate: guard.employment_date || '',
      shiftType: (guard.shift_type || 'day') as any,
      emergencyContact: guard.emergency_contact || '',
      emergencyName: '', // Will be available after schema update
      salary: guard.salary || 0,
      lastLogin: guard.updated_at || undefined,
      communityAssignment: '', // Will be available after schema update
      certifications: [], // Will be available after schema update
      experience: 0, // Will be available after schema update
      rating: 4.5, // Will be available after schema update
      totalShifts: 0, // Will be available after schema update
      completedShifts: 0, // Will be available after schema update
      address: '', // Will be available after schema update
      dateOfBirth: '', // Will be available after schema update
      bloodGroup: '', // Will be available after schema update
      medicalConditions: '', // Will be available after schema update
      skills: [], // Will be available after schema update
    };
  });

  const shiftTypes = [
    { value: 'day', label: 'Day Shift (6 AM - 6 PM)' },
    { value: 'night', label: 'Night Shift (6 PM - 6 AM)' },
    { value: 'rotating', label: 'Rotating Shifts' },
    { value: 'flexible', label: 'Flexible Hours' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' },
  ];

  const bloodGroups = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const filteredGuards = guards.filter(guard => {
    const matchesSearch = `${guard.firstName} ${guard.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guard.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guard.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guard.communityAssignment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = filterShift === 'all' || guard.shiftType === filterShift;
    const matchesStatus = filterStatus === 'all' || guard.status === filterStatus;
    
    return matchesSearch && matchesShift && matchesStatus;
  });

  const onSubmit = async (data: GuardFormData) => {
    try {
      if (selectedGuard) {
        // Update existing guard
        await updateGuardMutation.mutateAsync(data);
        toast.success('Guard updated successfully');
        setShowEditModal(false);
      } else {
        // Create new guard
        await createGuardMutation.mutateAsync(data);
        toast.success('Guard created successfully');
        setShowCreateModal(false);
      }
      reset();
    } catch (error) {
      console.error('Error saving guard:', error);
      toast.error('Failed to save guard');
    }
  };

  const handleEditGuard = (guard: GuardProfile) => {
    const formData = transformDbDataToFormFormat({
      id: guard.id,
      full_name: `${guard.firstName} ${guard.lastName}`,
      license_number: guard.licenseNumber,
      employment_date: guard.employmentDate,
      shift_type: guard.shiftType,
      emergency_contact: guard.emergencyContact,
      salary: guard.salary,
      is_active: guard.status === 'active',
      created_at: null,
      updated_at: null,
      employee_id: null,
      community_id: null,
      user_id: null,
    });
    
    setSelectedGuard(guard);
    reset(formData);
    setShowEditModal(true);
  };

  const handleDeleteGuard = (guard: GuardProfile) => {
    setSelectedGuard(guard);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedGuard) return;
    
    try {
      await deleteGuardMutation.mutateAsync(selectedGuard.id);
      toast.success('Guard deleted successfully');
      setShowDeleteModal(false);
      setSelectedGuard(null);
    } catch (error) {
      console.error('Error deleting guard:', error);
      toast.error('Failed to delete guard');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'danger',
      on_leave: 'warning',
      terminated: 'dark'
    };
    return <Badge bg={variants[status as keyof typeof variants]}>{status.replace('_', ' ')}</Badge>;
  };

  const getShiftBadge = (shift: string) => {
    const variants = {
      day: 'primary',
      night: 'dark',
      rotating: 'info',
      flexible: 'warning'
    };
    return <Badge bg={variants[shift as keyof typeof variants]}>{shift}</Badge>;
  };

  const calculateAttendance = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <>
      <PageTitle 
        title="Guard Profiles" 
        subName="Manage guard personal information and employment details"
      />

      {isLoadingGuards && (
        <Alert variant="info" className="d-flex align-items-center">
          <span className="spinner-border spinner-border-sm me-2" />
          Loading guards data...
        </Alert>
      )}

      {guardsError && (
        <Alert variant="danger" className="d-flex align-items-center">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Failed to load guards data. Please try again.
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="guard-profiles" title="Guard Profile Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'list')}
              className="mb-4"
            >
              <Tab eventKey="list" title="All Guards">
                {/* Controls */}
                <Row className="mb-4">
                  <Col md={3}>
                    <InputGroup>
                      <InputGroup.Text>
                        <IconifyIcon icon="ri:search-line" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search guards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={filterShift}
                      onChange={(e) => setFilterShift(e.target.value)}
                    >
                      <option value="all">All Shifts</option>
                      {shiftTypes.map(shift => (
                        <option key={shift.value} value={shift.value}>{shift.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3} className="d-flex gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('list')}
                    >
                      <IconifyIcon icon="ri:list-check" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('grid')}
                    >
                      <IconifyIcon icon="ri:grid-line" />
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      className="w-100"
                    >
                      <IconifyIcon icon="ri:user-add-line" className="me-2" />
                      Add Guard
                    </Button>
                  </Col>
                </Row>

                {/* Guards List/Grid */}
                {viewMode === 'list' ? (
                  <Card>
                    <div className="table-responsive">
                      <Table className="table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Guard</th>
                            <th>Contact</th>
                            <th>License</th>
                            <th>Shift</th>
                            <th>Assignment</th>
                            <th>Status</th>
                            <th>Performance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGuards.map((guard) => (
                            <tr key={guard.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm rounded-circle bg-primary d-flex align-items-center justify-content-center me-3">
                                    <span className="text-white fw-bold">
                                      {guard.firstName[0]}{guard.lastName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <h6 className="mb-0">{guard.firstName} {guard.lastName}</h6>
                                    <small className="text-muted">{guard.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{guard.phone}</div>
                                  <small className="text-muted">Emergency: {guard.emergencyContact}</small>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <strong>{guard.licenseNumber}</strong>
                                  <div className="small text-muted">{guard.experience} years exp.</div>
                                </div>
                              </td>
                              <td>{getShiftBadge(guard.shiftType)}</td>
                              <td>
                                {guard.communityAssignment ? (
                                  <div>
                                    <strong>{guard.communityAssignment}</strong>
                                  </div>
                                ) : (
                                  <span className="text-muted">Unassigned</span>
                                )}
                              </td>
                              <td>{getStatusBadge(guard.status)}</td>
                              <td>
                                <div>
                                  <div className="d-flex align-items-center">
                                    <IconifyIcon icon="ri:star-fill" className="text-warning me-1" />
                                    <span>{guard.rating}/5.0</span>
                                  </div>
                                  <small className="text-muted">
                                    {calculateAttendance(guard.completedShifts, guard.totalShifts)}% attendance
                                  </small>
                                </div>
                              </td>
                              <td>
                                <Dropdown>
                                  <Dropdown.Toggle variant="outline-primary" size="sm">
                                    <IconifyIcon icon="ri:more-line" />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleEditGuard(guard)}>
                                      <IconifyIcon icon="ri:edit-line" className="me-2" />
                                      Edit
                                    </Dropdown.Item>
                                    <Dropdown.Item href={`/guards/details?id=${guard.id}`}>
                                      <IconifyIcon icon="ri:eye-line" className="me-2" />
                                      View Details
                                    </Dropdown.Item>
                                    <Dropdown.Item href={`/settings/guards/schedules?guard=${guard.id}`}>
                                      <IconifyIcon icon="ri:calendar-line" className="me-2" />
                                      Manage Schedule
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      className="text-danger" 
                                      onClick={() => handleDeleteGuard(guard)}
                                    >
                                      <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
                                      Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>
                ) : (
                  <Row>
                    {filteredGuards.map((guard) => (
                      <Col md={6} lg={4} key={guard.id} className="mb-4">
                        <Card className="h-100">
                          <Card.Body className="text-center">
                            <div className="avatar-lg rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3">
                              <span className="text-white fw-bold fs-4">
                                {guard.firstName[0]}{guard.lastName[0]}
                              </span>
                            </div>
                            <h5 className="mb-1">{guard.firstName} {guard.lastName}</h5>
                            <p className="text-muted mb-2">{guard.licenseNumber}</p>
                            <div className="mb-3">
                              {getShiftBadge(guard.shiftType)}
                              <span className="mx-2">•</span>
                              {getStatusBadge(guard.status)}
                            </div>
                            <div className="mb-3">
                              <div className="d-flex justify-content-center align-items-center mb-1">
                                <IconifyIcon icon="ri:star-fill" className="text-warning me-1" />
                                <span>{guard.rating}/5.0</span>
                              </div>
                              <small className="text-muted">
                                {calculateAttendance(guard.completedShifts, guard.totalShifts)}% attendance
                              </small>
                            </div>
                            {guard.communityAssignment && (
                              <div className="mb-3">
                                <small className="text-muted">Assigned to:</small>
                                <div><strong>{guard.communityAssignment}</strong></div>
                              </div>
                            )}
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditGuard(guard)}
                              >
                                <IconifyIcon icon="ri:edit-line" />
                              </Button>
                              <Button
                                variant="outline-info"
                                size="sm"
                                as="a"
                                href={`/guards/details?id=${guard.id}`}
                              >
                                <IconifyIcon icon="ri:eye-line" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteGuard(guard)}
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

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Showing {filteredGuards.length} of {guards.length} guards
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <IconifyIcon icon="ri:download-line" className="me-2" />
                      Export
                    </Button>
                    <Button variant="outline-primary" size="sm">
                      <IconifyIcon icon="ri:upload-line" className="me-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </Tab>

              <Tab eventKey="analytics" title="Analytics">
                <Row>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-primary">{guards.length}</h3>
                        <p className="mb-0">Total Guards</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-success">{guards.filter(g => g.status === 'active').length}</h3>
                        <p className="mb-0">Active Guards</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-info">{guards.filter(g => g.shiftType === 'night').length}</h3>
                        <p className="mb-0">Night Shift</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-warning">
                          {guards.reduce((acc, g) => acc + calculateAttendance(g.completedShifts, g.totalShifts), 0) / guards.length || 0}%
                        </h3>
                        <p className="mb-0">Avg. Attendance</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Guards by Shift Type</h6>
                      </Card.Header>
                      <Card.Body>
                        {shiftTypes.map(shift => {
                          const count = guards.filter(g => g.shiftType === shift.value).length;
                          const percentage = guards.length > 0 ? Math.round((count / guards.length) * 100) : 0;
                          return (
                            <div key={shift.value} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{shift.label}</span>
                                <span>{count} ({percentage}%)</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Performance Overview</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Excellent (4.5+ rating)</span>
                            <span>{guards.filter(g => g.rating >= 4.5).length}</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${(guards.filter(g => g.rating >= 4.5).length / guards.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Good (4.0-4.4 rating)</span>
                            <span>{guards.filter(g => g.rating >= 4.0 && g.rating < 4.5).length}</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${(guards.filter(g => g.rating >= 4.0 && g.rating < 4.5).length / guards.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Average (3.5-3.9 rating)</span>
                            <span>{guards.filter(g => g.rating >= 3.5 && g.rating < 4.0).length}</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ width: `${(guards.filter(g => g.rating >= 3.5 && g.rating < 4.0).length / guards.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Create Guard Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Guard</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter email"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="licenseNumber"
                  label="Security License Number"
                  placeholder="Enter license number"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="employmentDate"
                  type="date"
                  label="Employment Date"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  control={control}
                  name="shiftType"
                  label="Shift Type"
                  containerClassName="mb-3"
                  options={shiftTypes}
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  control={control}
                  name="status"
                  label="Status"
                  containerClassName="mb-3"
                  options={statuses}
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="emergencyName"
                  label="Emergency Contact Name"
                  placeholder="Emergency contact person name"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="emergencyContact"
                  label="Emergency Contact Number"
                  placeholder="Emergency contact number"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="salary"
                  type="number"
                  label="Salary (Monthly)"
                  placeholder="Enter monthly salary"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="dateOfBirth"
                  type="date"
                  label="Date of Birth"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  control={control}
                  name="bloodGroup"
                  label="Blood Group"
                  containerClassName="mb-3"
                  options={bloodGroups}
                />
              </Col>
              <Col md={6}>
                <PasswordFormInput
                  control={control}
                  name="password"
                  label="Temporary Password"
                  placeholder="Leave empty for auto-generated"
                  containerClassName="mb-3"
                />
              </Col>
              <Col xs={12}>
                <TextAreaFormInput
                  control={control}
                  name="address"
                  label="Address"
                  placeholder="Enter complete address"
                  rows={3}
                  containerClassName="mb-3"
                />
              </Col>
              <Col xs={12}>
                <TextAreaFormInput
                  control={control}
                  name="medicalConditions"
                  label="Medical Conditions (Optional)"
                  placeholder="Any medical conditions or allergies"
                  rows={2}
                  containerClassName="mb-3"
                />
              </Col>
              <Col xs={12}>
                <Controller
                  name="sendWelcomeEmail"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="checkbox"
                      label="Send welcome email with login credentials"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mb-3"
                    />
                  )}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : (
                'Create Guard'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Guard Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Guard</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            {/* Same form fields as create modal */}
            <p className="text-muted mb-3">Editing: {selectedGuard?.firstName} {selectedGuard?.lastName}</p>
            {/* Add the same form fields here */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                'Update Guard'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Guard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <IconifyIcon icon="ri:error-warning-line" className="fs-48 text-danger mb-3" />
            <h5>Are you sure?</h5>
            <p className="text-muted">
              This will permanently delete <strong>{selectedGuard?.firstName} {selectedGuard?.lastName}</strong> and all associated data. This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete Guard'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GuardProfilesPage;
