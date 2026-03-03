'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardHeader, CardBody, CardTitle, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Table, Badge, Form } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import TextFormInput from '@/components/from/TextFormInput';
import PasswordFormInput from '@/components/from/PasswordFormInput';
import SelectFormInput from '@/components/from/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { useListProfiles } from '@/hooks/useProfiles';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Validation schema
const adminUserSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string(),
  role: yup.string().oneOf(['admin', 'superadmin']).required('Role is required'),
  password: yup.string().notRequired(),
  confirm_password: yup.string().notRequired(),
  is_active: yup.boolean(),
});

interface AdminUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'superadmin';
  password?: string;
  confirm_password?: string;
  is_active?: boolean;
}

const AdminUsersSettingsPage = () => {
  const { data: profiles, isLoading: loadingProfiles } = useListProfiles();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    const token = session?.accessToken as string | undefined;
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  const refreshProfiles = () => {
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AdminUserFormData>({
    resolver: yupResolver(adminUserSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'admin',
      password: '',
      confirm_password: '',
      is_active: true,
    },
  });

  // Filter admin/superadmin users only
  const adminUsers = profiles?.filter(profile => 
    ['admin', 'superadmin'].includes(profile.role) &&
    (filterRole === 'all' || profile.role === filterRole) &&
    (searchTerm === '' || 
      profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
    reset({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'admin',
      password: '',
      confirm_password: '',
      is_active: true,
    });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
    reset({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      password: '',
      confirm_password: '',
      is_active: user.is_active !== false,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        await fetchAdmin(`/admin/users/${userId}`, { method: 'DELETE' });
        setShowAlert({ type: 'success', message: 'Admin user deleted successfully!' });
        refreshProfiles();
        setTimeout(() => setShowAlert(null), 5000);
      } catch (error) {
        console.error('Error deleting admin user:', error);
        setShowAlert({ type: 'danger', message: 'Failed to delete admin user.' });
        setTimeout(() => setShowAlert(null), 5000);
      }
    }
  };

  const onSubmit = async (data: AdminUserFormData) => {
    try {
      setIsSubmitting(true);
      if (editingUser) {
        // Update existing user
        await fetchAdmin(`/admin/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
            phone: data.phone,
            is_active: data.is_active,
          }),
        });
        setShowAlert({ type: 'success', message: 'Admin user updated successfully!' });
        refreshProfiles();
      } else {
        // Invite new admin user
        await fetchAdmin(`/admin/invites`, {
          method: 'POST',
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            role: data.role,
            phone: data.phone,
          }),
        });
        setShowAlert({ type: 'success', message: 'Invite sent successfully!' });
        refreshProfiles();
      }
      
      setShowModal(false);
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error saving admin user:', error);
      setShowAlert({ type: 'danger', message: 'Failed to save admin user.' });
      setTimeout(() => setShowAlert(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'superadmin' },
  ];

  const filterRoleOptions = [
    { label: 'All Roles', value: 'all' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'superadmin' },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'danger';
      case 'admin':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loadingProfiles) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle subName="Identity & Access" title="Admin Users" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          <IconifyIcon 
            icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
            className="me-2" 
          />
          {showAlert.message}
        </Alert>
      )}

      <ComponentContainerCard title="Admin Users Settings" id="admin-users-settings">
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>
                <CardTitle className="mb-0">
                  <IconifyIcon icon="ri:admin-line" className="me-2" />
                  Admin Users Management
                </CardTitle>
              </Col>
              <Col xs="auto">
                <Button variant="primary" onClick={handleCreateUser}>
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Admin User
                </Button>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            {/* Search and Filter */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search admin users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                  {filterRoleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Admin Users Table */}
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm me-2">
                            <div className="avatar-title rounded-circle bg-primary text-white">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold">{user.first_name} {user.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <Badge bg={getRoleBadgeVariant(user.role)}>
                          {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.is_active !== false ? 'success' : 'danger'}>
                          {user.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <IconifyIcon icon="ri:edit-line" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <IconifyIcon icon="ri:delete-bin-line" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {adminUsers.length === 0 && (
                <div className="text-center py-4">
                  <IconifyIcon icon="ri:admin-line" className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                  <h5 className="text-muted">No admin users found</h5>
                  <p className="text-muted">Create your first admin user to get started.</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </ComponentContainerCard>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <ModalHeader closeButton>
          <Modal.Title>
            {editingUser ? 'Edit Admin User' : 'Add New Admin User'}
          </Modal.Title>
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      label="First Name"
                      placeholder="Enter first name"
                      control={control}
                      name="first_name"
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      label="Last Name"
                      placeholder="Enter last name"
                      control={control}
                      name="last_name"
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      label="Email Address"
                      type="email"
                      placeholder="Enter email address"
                      control={control}
                      name="email"
                      disabled={Boolean(editingUser)}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      control={control}
                      name="phone"
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      label="Role"
                      options={roleOptions}
                      control={control}
                      name="role"
                    />
                  )}
                />
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Form.Check
                      type="switch"
                      id="is_active"
                      label="Active User"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                  )}
                />
              </Col>
            </Row>

            {!editingUser && (
              <Row>
                <Col md={6}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordFormInput
                        label="Password"
                        placeholder="Enter password"
                        control={control}
                        name="password"
                        disabled={true}
                      />
                    )}
                  />
                </Col>
                <Col md={6}>
                  <Controller
                    name="confirm_password"
                    control={control}
                    render={({ field }) => (
                      <PasswordFormInput
                        label="Confirm Password"
                        placeholder="Confirm password"
                        control={control}
                        name="confirm_password"
                        disabled={true}
                      />
                    )}
                  />
                </Col>
              </Row>
            )}

            {editingUser && (
              <Row>
                <Col md={6}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordFormInput
                        label="New Password (optional)"
                        placeholder="Leave blank to keep current password"
                        control={control}
                        name="password"
                        disabled={true}
                      />
                    )}
                  />
                </Col>
                <Col md={6}>
                  <Controller
                    name="confirm_password"
                    control={control}
                    render={({ field }) => (
                      <PasswordFormInput
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        control={control}
                        name="confirm_password"
                        disabled={true}
                      />
                    )}
                  />
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting && <div className="spinner-border spinner-border-sm me-2" />}
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};

export default AdminUsersSettingsPage;
