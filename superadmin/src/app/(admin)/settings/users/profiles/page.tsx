'use client';

import { useState, useMemo } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useListUserProfiles, 
  useCreateUserProfile, 
  useUpdateUserProfile, 
  useDeleteUserProfile,
  useUserProfileStats,
  type UserProfile as SupabaseUserProfile 
} from '@/hooks/useUserProfiles';

// Use Supabase UserProfile type with mapping for UI compatibility
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'resident' | 'guard' | 'admin' | 'maintenance' | 'management' | 'user' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  unitNumber?: string;
  blockNumber?: string;
  emergencyContact?: string;
  joinDate: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

// Helper function to map Supabase UserProfile to UI UserProfile
const mapSupabaseToUI = (profile: SupabaseUserProfile): UserProfile => ({
  id: profile.id,
  firstName: profile.first_name,
  lastName: profile.last_name,
  email: profile.email,
  phone: profile.phone || undefined,
  avatar: profile.avatar_url || undefined,
  role: profile.role,
  status: profile.status,
  unitNumber: profile.unit_id || undefined, // TODO: Map from units table
  blockNumber: profile.block_number || undefined,
  emergencyContact: profile.emergency_contact || undefined,
  joinDate: profile.created_at || new Date().toISOString(),
  lastLogin: profile.last_login || undefined,
  twoFactorEnabled: profile.two_factor_enabled,
  emailVerified: profile.email_verified,
  phoneVerified: profile.phone_verified,
  preferences: profile.preferences,
});

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  unitNumber?: string;
  blockNumber?: string;
  emergencyContact?: string;
  password?: string;
  twoFactorEnabled?: boolean;
  sendWelcomeEmail?: boolean;
}

// Form validation schema
const userSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().optional(),
  role: yup.string().required('Role is required'),
  unitNumber: yup.string().when('role', {
    is: 'resident',
    then: (schema) => schema.required('Unit number is required for residents'),
    otherwise: (schema) => schema.optional(),
  }),
  blockNumber: yup.string().optional(),
  emergencyContact: yup.string().optional(),
  password: yup.string().min(8, 'Password must be at least 8 characters').optional(),
  status: yup.string().required('Status is required'),
  twoFactorEnabled: yup.boolean().optional(),
  sendWelcomeEmail: yup.boolean().optional(),
});

const UserProfilesPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'resident',
      unitNumber: '',
      blockNumber: '',
      emergencyContact: '',
      password: '',
      status: 'active',
      twoFactorEnabled: false,
      sendWelcomeEmail: true,
    }
  });

  // Memoize filters to prevent unnecessary re-renders - use stable empty object when no filters
  const filters = useMemo(() => {
    const hasSearch = searchTerm && searchTerm.trim().length > 0;
    const hasRoleFilter = filterRole !== 'all';
    const hasStatusFilter = filterStatus !== 'all';
    
    // If no filters are applied, return stable empty object
    if (!hasSearch && !hasRoleFilter && !hasStatusFilter) {
      return { page: 1, pageSize: 50 };
    }
    
    return {
      ...(hasSearch && { search: searchTerm.trim() }),
      ...(hasRoleFilter && { role: filterRole }),
      ...(hasStatusFilter && { status: filterStatus }),
      page: 1,
      pageSize: 50
    };
  }, [searchTerm, filterRole, filterStatus]);

  console.log('🔍 Component filters:', { searchTerm, filterRole, filterStatus, finalFilters: filters });

  // Real Supabase hooks
  const { 
    data: userProfilesData, 
    isLoading: loadingProfiles, 
    error: profilesError,
    isError,
    isFetching
  } = useListUserProfiles(filters);

  const { data: statsData } = useUserProfileStats();
  const createUserMutation = useCreateUserProfile();
  const updateUserMutation = useUpdateUserProfile();
  const deleteUserMutation = useDeleteUserProfile();

  // Derived loading state from mutations
  const loading = createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending;

  // Map Supabase data to UI format
  const users: UserProfile[] = userProfilesData?.data ? 
    userProfilesData.data.map(mapSupabaseToUI) : [];

  // Enhanced debug info
  console.log('🎯 User Profiles Component Debug:', {
    step1_filters: filters,
    step2_queryState: {
      isLoading: loadingProfiles,
      isFetching,
      isError,
      hasData: !!userProfilesData,
      error: profilesError?.message
    },
    step3_rawData: {
      userProfilesData,
      dataCount: userProfilesData?.count,
      dataArrayLength: userProfilesData?.data?.length
    },
    step4_transformedData: {
      usersLength: users.length,
      firstUser: users[0]?.email,
      sampleUser: users[0] ? {
        id: users[0].id,
        name: `${users[0].firstName} ${users[0].lastName}`,
        email: users[0].email,
        role: users[0].role
      } : null
    }
  });

  const roles = [
    { value: 'resident', label: 'Resident' },
    { value: 'guard', label: 'Security Guard' },
    { value: 'admin', label: 'Administrator' },
    { value: 'maintenance', label: 'Maintenance Staff' },
    { value: 'management', label: 'Management' },
    { value: 'user', label: 'User' },
    { value: 'superadmin', label: 'Super Administrator' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending', label: 'Pending Verification' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        // Update existing user
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          role: data.role,
          status: data.status,
          block_number: data.blockNumber || undefined,
          emergency_contact: data.emergencyContact || undefined,
          two_factor_enabled: data.twoFactorEnabled || false,
        });
      } else {
        // Create new user
        await createUserMutation.mutateAsync({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          role: data.role,
          status: data.status,
          block_number: data.blockNumber || undefined,
          emergency_contact: data.emergencyContact || undefined,
          two_factor_enabled: data.twoFactorEnabled || false,
          send_welcome_email: data.sendWelcomeEmail || false,
          password: data.password || undefined,
        });
      }
      
      setShowSuccess(true);
      setShowCreateModal(false);
      setShowEditModal(false);
      reset();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      // TODO: Show error message to user
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      unitNumber: user.unitNumber || '',
      blockNumber: user.blockNumber || '',
      emergencyContact: user.emergencyContact || '',
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      sendWelcomeEmail: false,
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      // TODO: Show error message to user
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      suspended: 'danger',
      pending: 'warning'
    };
    return <Badge bg={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      resident: 'primary',
      guard: 'info',
      admin: 'danger',
      maintenance: 'warning',
      management: 'dark'
    };
    return <Badge bg={variants[role as keyof typeof variants]}>{role}</Badge>;
  };

  return (
    <>
      <PageTitle 
        title="User Profiles" 
        subName="Manage user accounts and profiles"
      />

      {/* Debug information display */}
      {process.env.NODE_ENV === 'development' && (
        <Alert variant="info" className="mb-3">
          <div><strong>Debug Info:</strong></div>
          <div>Loading: {loadingProfiles ? 'Yes' : 'No'}</div>
          <div>Users Count: {users.length}</div>
          <div>Raw Data Count: {userProfilesData?.count || 0}</div>
          <div>Raw Data Array Length: {userProfilesData?.data?.length || 0}</div>
          <div>Error: {profilesError?.message || 'None'}</div>
          <div>Hook Response Keys: {userProfilesData ? Object.keys(userProfilesData).join(', ') : 'None'}</div>
          {userProfilesData?.data?.length && (
            <div>First User: {userProfilesData.data[0].first_name} {userProfilesData.data[0].last_name}</div>
          )}
        </Alert>
      )}

      {showSuccess && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="material-symbols:check" className="me-2" />
          User operation completed successfully!
        </Alert>
      )}

      {profilesError && (
        <Alert variant="danger" className="d-flex align-items-center">
          <IconifyIcon icon="material-symbols:error" className="me-2" />
          Error loading user profiles: {profilesError.message}
        </Alert>
      )}

      {loadingProfiles && (
        <Alert variant="info" className="d-flex align-items-center">
          <IconifyIcon icon="material-symbols:loading" className="me-2" />
          Loading user profiles...
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="user-profiles" title="User Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'list')}
              className="mb-4"
            >
              <Tab eventKey="list" title="All Users">
                {/* Controls */}
                <Row className="mb-4">
                  <Col md={3}>
                    <InputGroup>
                      <InputGroup.Text>
                        <IconifyIcon icon="material-symbols:search" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
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
                      <IconifyIcon icon="material-symbols:list" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('grid')}
                    >
                      <IconifyIcon icon="material-symbols:grid-view" />
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      className="w-100"
                    >
                      <IconifyIcon icon="material-symbols:add" className="me-2" />
                      Add User
                    </Button>
                  </Col>
                </Row>

                {/* Users List/Grid */}
                {viewMode === 'list' ? (
                  <Card>
                    <div className="table-responsive">
                      <Table className="table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>User</th>
                            <th>Contact</th>
                            <th>Role</th>
                            <th>Unit</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Security</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm rounded-circle bg-primary d-flex align-items-center justify-content-center me-3">
                                    <span className="text-white fw-bold">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <h6 className="mb-0">{user.firstName} {user.lastName}</h6>
                                    <small className="text-muted">{user.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{user.phone || 'N/A'}</div>
                                  {user.emergencyContact && (
                                    <small className="text-muted">Emergency: {user.emergencyContact}</small>
                                  )}
                                </div>
                              </td>
                              <td>{getRoleBadge(user.role)}</td>
                              <td>
                                {user.unitNumber ? (
                                  <div>
                                    <strong>{user.unitNumber}</strong>
                                    {user.blockNumber && <div className="small text-muted">Block {user.blockNumber}</div>}
                                  </div>
                                ) : 'N/A'}
                              </td>
                              <td>{getStatusBadge(user.status)}</td>
                              <td>
                                {user.lastLogin ? (
                                  <div>
                                    <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                                    <small className="text-muted">{new Date(user.lastLogin).toLocaleTimeString()}</small>
                                  </div>
                                ) : 'Never'}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  {user.twoFactorEnabled && (
                                    <Badge bg="success" className="small">2FA</Badge>
                                  )}
                                  {user.emailVerified && (
                                    <Badge bg="info" className="small">Email ✓</Badge>
                                  )}
                                  {user.phoneVerified && (
                                    <Badge bg="info" className="small">Phone ✓</Badge>
                                  )}
                                </div>
                              </td>
                              <td>
                                <Dropdown>
                                  <Dropdown.Toggle variant="outline-primary" size="sm">
                                    <IconifyIcon icon="material-symbols:more-vert" />
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleEditUser(user)}>
                                      <IconifyIcon icon="material-symbols:edit" className="me-2" />
                                      Edit
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                      <IconifyIcon icon="material-symbols:visibility" className="me-2" />
                                      View Details
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                      <IconifyIcon icon="material-symbols:lock-reset" className="me-2" />
                                      Reset Password
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      className="text-danger"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <IconifyIcon icon="material-symbols:delete" className="me-2" />
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
                    {filteredUsers.map((user) => (
                      <Col md={6} lg={4} key={user.id} className="mb-4">
                        <Card className="h-100">
                          <Card.Body className="text-center">
                            <div className="avatar-lg rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3">
                              <span className="text-white fw-bold fs-4">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <h5 className="mb-1">{user.firstName} {user.lastName}</h5>
                            <p className="text-muted mb-2">{user.email}</p>
                            <div className="mb-3">
                              {getRoleBadge(user.role)}
                              <span className="mx-2">•</span>
                              {getStatusBadge(user.status)}
                            </div>
                            {user.unitNumber && (
                              <div className="mb-3">
                                <strong>Unit: {user.unitNumber}</strong>
                                {user.blockNumber && <div className="small">Block {user.blockNumber}</div>}
                              </div>
                            )}
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <IconifyIcon icon="material-symbols:edit" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <IconifyIcon icon="material-symbols:delete" />
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
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <IconifyIcon icon="material-symbols:download" className="me-2" />
                      Export
                    </Button>
                    <Button variant="outline-primary" size="sm">
                      <IconifyIcon icon="material-symbols:upload" className="me-2" />
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
                        <h3 className="text-primary">{users.length}</h3>
                        <p className="mb-0">Total Users</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-success">{users.filter(u => u.status === 'active').length}</h3>
                        <p className="mb-0">Active Users</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-info">{users.filter(u => u.role === 'resident').length}</h3>
                        <p className="mb-0">Residents</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h3 className="text-warning">{users.filter(u => u.twoFactorEnabled).length}</h3>
                        <p className="mb-0">2FA Enabled</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={6}>
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Users by Role</h6>
                      </Card.Header>
                      <Card.Body>
                        {roles.map(role => {
                          const count = users.filter(u => u.role === role.value).length;
                          const percentage = users.length ? (count / users.length) * 100 : 0;
                          return (
                            <div key={role.value} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{role.label}</span>
                                <span>{count}</span>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar" 
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
                        <h6 className="mb-0">Users by Status</h6>
                      </Card.Header>
                      <Card.Body>
                        {statuses.map(status => {
                          const count = users.filter(u => u.status === status.value).length;
                          const percentage = users.length ? (count / users.length) * 100 : 0;
                          return (
                            <div key={status.value} className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{status.label}</span>
                                <span>{count}</span>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
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
                <SelectFormInput
                  control={control}
                  name="role"
                  label="Role"
                  containerClassName="mb-3"
                  options={roles}
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
              {watch('role') === 'resident' && (
                <>
                  <Col md={6}>
                    <TextFormInput
                      control={control}
                      name="unitNumber"
                      label="Unit Number"
                      placeholder="e.g., A-101"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <TextFormInput
                      control={control}
                      name="blockNumber"
                      label="Block Number"
                      placeholder="e.g., A"
                      containerClassName="mb-3"
                    />
                  </Col>
                </>
              )}
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="emergencyContact"
                  label="Emergency Contact"
                  placeholder="Emergency contact number"
                  containerClassName="mb-3"
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
                <Form.Check
                  type="checkbox"
                  label="Enable Two-Factor Authentication"
                  {...control.register('twoFactorEnabled')}
                  className="mb-3"
                />
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  label="Send welcome email to user"
                  {...control.register('sendWelcomeEmail')}
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
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Creating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="material-symbols:add" className="me-2" />
                  Create User
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="firstName"
                  label="First Name"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="lastName"
                  label="Last Name"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="email"
                  type="email"
                  label="Email Address"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="phone"
                  label="Phone Number"
                  containerClassName="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  control={control}
                  name="role"
                  label="Role"
                  containerClassName="mb-3"
                  options={roles}
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
              {watch('role') === 'resident' && (
                <>
                  <Col md={6}>
                    <TextFormInput
                      control={control}
                      name="unitNumber"
                      label="Unit Number"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <TextFormInput
                      control={control}
                      name="blockNumber"
                      label="Block Number"
                      containerClassName="mb-3"
                    />
                  </Col>
                </>
              )}
              <Col md={6}>
                <TextFormInput
                  control={control}
                  name="emergencyContact"
                  label="Emergency Contact"
                  containerClassName="mb-3"
                />
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  label="Enable Two-Factor Authentication"
                  {...control.register('twoFactorEnabled')}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Updating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="material-symbols:save" className="me-2" />
                  Update User
                </>
              )}
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
          <div className="text-center">
            <IconifyIcon icon="material-symbols:warning" className="text-warning mb-3" style={{ fontSize: '3rem' }} />
            <h5>Are you sure?</h5>
            <p className="text-muted">
              This will permanently delete the user <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> and all associated data. This action cannot be undone.
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
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="material-symbols:delete" className="me-2" />
                Delete User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserProfilesPage;
