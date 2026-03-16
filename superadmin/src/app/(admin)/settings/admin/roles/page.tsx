'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardHeader, CardBody, CardTitle, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter, Table, Badge, Form, Accordion } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import TextFormInput from '@/components/from/TextFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '@/hooks/useAdminApi';

// Validation schema
const roleSchema = yup.object({
  role_name: yup.string().required('Role name is required'),
  role_description: yup.string().optional(),
  permissions: yup.array().of(yup.string().required()).optional(),
});

interface RoleFormData {
  role_name: string;
  role_description?: string;
  permissions?: string[];
}

// Available permissions grouped by category
const permissionCategories = {
  'Profiles Management': [
    'read:all_profiles',
    'create:profiles', 
    'update:all_profiles',
    'delete:profiles',
    'read:own_profile',
    'update:own_profile',
  ],
  'Units Management': [
    'read:all_units',
    'create:units',
    'update:units',
    'delete:units',
  ],
  'Maintenance Requests': [
    'read:all_maintenance_requests',
    'create:maintenance_requests',
    'update:maintenance_requests',
    'delete:maintenance_requests',
    'read:own_maintenance_requests',
    'write:own_maintenance_requests',
  ],
  'Complaints Management': [
    'read:all_complaints',
    'create:complaints',
    'update:complaints',
    'delete:complaints',
    'read:own_complaints',
    'write:own_complaints',
  ],
  'Payments Management': [
    'read:all_payments',
    'create:payments',
    'update:payments',
    'delete:payments',
    'read:own_payments',
    'write:own_payments',
  ],
  'Visitor Management': [
    'read:all_visitor_passes',
    'create:visitor_passes',
    'update:visitor_passes',
    'delete:visitor_passes',
    'read:own_visitor_passes',
    'write:own_visitor_passes',
  ],
  'Notices Management': [
    'read:notices',
    'create:notices',
    'update:notices',
    'delete:notices',
  ],
  'Analytics & Reports': [
    'read:analytics',
    'read:reports',
  ],
  'Notifications': [
    'read:all_notifications',
    'write:all_notifications',
    'read:own_notifications',
  ],
  'System Settings': [
    'manage:settings',
    'manage:roles',
    'manage:users',
  ],
};

const defaultRoles = [
  {
    name: 'user',
    description: 'Regular community member',
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:notices',
      'read:own_maintenance_requests',
      'write:own_maintenance_requests',
      'read:own_complaints',
      'write:own_complaints',
      'read:own_payments',
      'read:own_visitor_passes',
      'write:own_visitor_passes',
      'read:own_notifications',
    ],
  },
  {
    name: 'guard',
    description: 'Security guard',
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:notices',
      'read:all_visitor_passes',
      'update:visitor_passes',
      'create:entry_logs',
      'read:entry_logs',
    ],
  },
  {
    name: 'admin',
    description: 'Community administrator',
    permissions: [
      'read:analytics',
      'read:all_profiles',
      'create:profiles',
      'update:all_profiles',
      'delete:profiles',
      'read:all_maintenance_requests',
      'update:maintenance_requests',
      'read:all_complaints',
      'update:complaints',
      'read:all_payments',
      'read:all_notifications',
      'write:all_notifications',
      'read:notices',
      'create:notices',
      'update:notices',
      'delete:notices',
    ],
  },
  {
    name: 'agency_manager',
    description: 'Agency manager',
    permissions: [
      'read:analytics',
      'read:all_profiles',
      'create:profiles',
      'update:all_profiles',
      'delete:profiles',
      'read:all_maintenance_requests',
      'update:maintenance_requests',
      'read:all_complaints',
      'update:complaints',
      'read:all_payments',
      'read:all_notifications',
      'write:all_notifications',
      'read:notices',
      'create:notices',
      'update:notices',
      'delete:notices',
    ],
  },
  {
    name: 'facility_manager',
    description: 'Facility manager',
    permissions: [
      'read:analytics',
      'read:all_profiles',
      'create:profiles',
      'update:all_profiles',
      'delete:profiles',
      'read:all_maintenance_requests',
      'update:maintenance_requests',
      'read:all_complaints',
      'update:complaints',
      'read:all_payments',
      'read:all_notifications',
      'write:all_notifications',
      'read:notices',
      'create:notices',
      'update:notices',
      'delete:notices',
    ],
  },
  {
    name: 'superadmin',
    description: 'System super administrator',
    permissions: Object.values(permissionCategories).flat(),
  },
];

const RolesPermissionsSettingsPage = () => {
  const { fetchAdmin, hasToken } = useAdminApi();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [roles, setRoles] = useState<Array<{ name: string; description: string; permissions: string[] }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: rolesData, isLoading: loadingRoles, error: rolesError } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: async () => fetchAdmin('/admin/roles'),
    enabled: hasToken,
  });

  useEffect(() => {
    if (!Array.isArray(rolesData)) return;
    const roleDefaults = new Map(defaultRoles.map(role => [role.name, role]));
    const normalized = rolesData.map((role: { role: string; permissions: string[] }) => ({
      name: role.role,
      description: roleDefaults.get(role.role)?.description || 'Custom role',
      permissions: role.permissions || [],
    }));
    setRoles(normalized);
  }, [rolesData]);

  useEffect(() => {
    if (roles.length === 0) {
      setSelectedRole('');
      return;
    }

    if (!roles.some((role) => role.name === selectedRole)) {
      setSelectedRole(roles[0].name);
    }
  }, [roles, selectedRole]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RoleFormData>({
    resolver: yupResolver(roleSchema),
    defaultValues: {
      role_name: '',
      role_description: '',
      permissions: [],
    },
  });

  const watchedPermissions = watch('permissions');

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowModal(true);
    reset({
      role_name: '',
      role_description: '',
      permissions: [],
    });
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setShowModal(true);
    reset({
      role_name: role.name,
      role_description: role.description,
      permissions: role.permissions,
    });
  };

  const handleDeleteRole = (roleName: string) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      setIsSubmitting(true);
      fetchAdmin(`/admin/roles/${encodeURIComponent(roleName)}`, { method: 'DELETE' })
        .then(() => {
          const updatedRoles = roles.filter(role => role.name !== roleName);
          setRoles(updatedRoles);
          if (selectedRole === roleName) {
            setSelectedRole(updatedRoles[0]?.name || '');
          }
          setShowAlert({ type: 'success', message: 'Role deleted successfully!' });
          queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
        })
        .catch((error) => {
          console.error('Error deleting role:', error);
          setShowAlert({
            type: 'danger',
            message: error instanceof Error ? error.message : 'Failed to delete role.',
          });
        })
        .finally(() => {
          setIsSubmitting(false);
          setTimeout(() => setShowAlert(null), 5000);
        });
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      setIsSubmitting(true);
      const roleData = {
        name: data.role_name.toLowerCase().replace(/\s+/g, '_'),
        description: data.role_description || '',
        permissions: data.permissions || [],
      };

      if (editingRole) {
        // Update existing role (handle rename if needed)
        if (editingRole.name !== roleData.name) {
          await fetchAdmin(`/admin/roles/${encodeURIComponent(editingRole.name)}`, { method: 'DELETE' });
        }
        await fetchAdmin(`/admin/roles/${encodeURIComponent(roleData.name)}/permissions`, {
          method: 'PUT',
          body: JSON.stringify({ permissions: roleData.permissions }),
        });
        const updatedRoles = roles.map(role =>
          role.name === editingRole.name ? roleData : role
        );
        setRoles(updatedRoles);
        setShowAlert({ type: 'success', message: 'Role updated successfully!' });
      } else {
        await fetchAdmin(`/admin/roles/${encodeURIComponent(roleData.name)}/permissions`, {
          method: 'PUT',
          body: JSON.stringify({ permissions: roleData.permissions }),
        });
        const updatedRoles = [...roles, roleData];
        setRoles(updatedRoles);
        setShowAlert({ type: 'success', message: 'Role created successfully!' });
      }
      
      setShowModal(false);
      setTimeout(() => setShowAlert(null), 5000);
    } catch (error) {
      console.error('Error saving role:', error);
      setShowAlert({
        type: 'danger',
        message: error instanceof Error ? error.message : 'Failed to save role.',
      });
      setTimeout(() => setShowAlert(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = watchedPermissions || [];
    if (checked) {
      setValue('permissions', [...currentPermissions, permission]);
    } else {
      setValue('permissions', currentPermissions.filter(p => p !== permission));
    }
  };

  const handleSelectAllInCategory = (categoryPermissions: string[], checked: boolean) => {
    const currentPermissions = watchedPermissions || [];
    if (checked) {
      const newPermissions = [...new Set([...currentPermissions, ...categoryPermissions])];
      setValue('permissions', newPermissions);
    } else {
      const filteredPermissions = currentPermissions.filter(p => !categoryPermissions.includes(p));
      setValue('permissions', filteredPermissions);
    }
  };

  const isAllCategorySelected = (categoryPermissions: string[]) => {
    const currentPermissions = watchedPermissions || [];
    return categoryPermissions.every(permission => currentPermissions.includes(permission));
  };

  const isSomeCategorySelected = (categoryPermissions: string[]) => {
    const currentPermissions = watchedPermissions || [];
    return categoryPermissions.some(permission => currentPermissions.includes(permission));
  };

  const getRoleDisplayName = (roleName: string) => {
    return roleName.charAt(0).toUpperCase() + roleName.slice(1).replace(/_/g, ' ');
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'superadmin':
        return 'danger';
      case 'admin':
        return 'warning';
      case 'agency_manager':
      case 'facility_manager':
        return 'primary';
      case 'guard':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loadingRoles) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (rolesError) {
    return (
      <>
        <PageTitle subName="Identity & Access" title="Roles & Permissions" />
        <Alert variant="danger">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          {rolesError instanceof Error
            ? rolesError.message
            : 'Failed to load roles. Reload this page before making changes.'}
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Identity & Access" title="Roles & Permissions" />

      {showAlert && (
        <Alert variant={showAlert.type} dismissible onClose={() => setShowAlert(null)}>
          <IconifyIcon 
            icon={showAlert.type === 'success' ? 'ri:check-line' : 'ri:error-warning-line'} 
            className="me-2" 
          />
          {showAlert.message}
        </Alert>
      )}

      <Row>
        <Col lg={4}>
          <ComponentContainerCard title="Roles Management" id="roles-card">
            <Card>
              <CardHeader>
                <Row className="align-items-center">
                  <Col>
                    <CardTitle className="mb-0">
                      <IconifyIcon icon="ri:shield-user-line" className="me-2" />
                      Roles
                    </CardTitle>
                  </Col>
                  <Col xs="auto">
                    <Button variant="primary" size="sm" onClick={handleCreateRole}>
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Add Role
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {roles.length === 0 ? (
                  <Alert variant="info" className="mb-0">
                    <IconifyIcon icon="ri:information-line" className="me-2" />
                    No role permission mappings are stored yet. Add a role to begin configuring permissions.
                  </Alert>
                ) : (
                  <div className="list-group list-group-flush">
                    {roles.map((role) => (
                      <div
                        key={role.name}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedRole === role.name ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRole(role.name)}
                      >
                        <div>
                          <div className="fw-semibold">{getRoleDisplayName(role.name)}</div>
                          <small className="text-muted">{role.permissions.length} permissions</small>
                        </div>
                        <div>
                          <Badge bg={getRoleBadgeVariant(role.name)}>
                            {getRoleDisplayName(role.name)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </ComponentContainerCard>
        </Col>

        <Col lg={8}>
          <ComponentContainerCard title="Permissions Management" id="permissions-card">
            <Card>
              <CardHeader>
                <Row className="align-items-center">
                  <Col>
                    <CardTitle className="mb-0">
                      <IconifyIcon icon="ri:key-2-line" className="me-2" />
                      Permissions for {getRoleDisplayName(selectedRole)}
                    </CardTitle>
                  </Col>
                  <Col xs="auto">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => {
                        const role = roles.find((item) => item.name === selectedRole);
                        if (role) {
                          handleEditRole(role);
                        }
                      }}
                      disabled={!selectedRole}
                    >
                      <IconifyIcon icon="ri:edit-line" className="me-1" />
                      Edit Role
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {selectedRole && (
                  <div>
                    <div className="mb-3">
                      <p className="text-muted">
                        {roles.find(r => r.name === selectedRole)?.description}
                      </p>
                    </div>

                    <Accordion>
                      {Object.entries(permissionCategories).map(([category, permissions], index) => {
                        const rolePermissions = roles.find(r => r.name === selectedRole)?.permissions || [];
                        const hasPermissions = permissions.some(p => rolePermissions.includes(p));
                        
                        return (
                          <Accordion.Item key={category} eventKey={index.toString()}>
                            <Accordion.Header>
                              <div className="d-flex align-items-center justify-content-between w-100 me-3">
                                <span>{category}</span>
                                <Badge bg={hasPermissions ? 'success' : 'light'} className="text-dark">
                                  {permissions.filter(p => rolePermissions.includes(p)).length} / {permissions.length}
                                </Badge>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              <div className="row">
                                {permissions.map((permission) => (
                                  <div key={permission} className="col-md-6 mb-2">
                                    <Form.Check
                                      type="checkbox"
                                      id={`${selectedRole}-${permission}`}
                                      label={permission.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      checked={rolePermissions.includes(permission)}
                                      disabled={true} // Read-only view
                                    />
                                  </div>
                                ))}
                              </div>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  </div>
                )}
              </CardBody>
            </Card>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Add/Edit Role Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <ModalHeader closeButton>
          <Modal.Title>
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </Modal.Title>
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Row className="mb-4">
              <Col md={6}>
                <Controller
                  name="role_name"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      label="Role Name"
                      placeholder="Enter role name"
                      control={control}
                      {...field}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="role_description"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      label="Description"
                      placeholder="Enter role description"
                      control={control}
                      {...field}
                    />
                  )}
                />
              </Col>
            </Row>

            <div className="mb-3">
              <h6>Permissions</h6>
              <p className="text-muted">Select the permissions for this role:</p>
            </div>

            <Accordion>
              {Object.entries(permissionCategories).map(([category, permissions], index) => (
                <Accordion.Item key={category} eventKey={index.toString()}>
                  <Accordion.Header>
                    <div className="d-flex align-items-center justify-content-between w-100 me-3">
                      <span>{category}</span>
                      <div className="d-flex align-items-center gap-2">
                        <Form.Check
                          type="checkbox"
                          id={`select-all-${category}`}
                          label="Select All"
                          checked={isAllCategorySelected(permissions)}
                          onChange={(e) => handleSelectAllInCategory(permissions, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Badge bg="primary">
                          {permissions.filter(p => (watchedPermissions || []).includes(p)).length} / {permissions.length}
                        </Badge>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="row">
                      {permissions.map((permission) => (
                        <div key={permission} className="col-md-6 mb-2">
                          <Form.Check
                            type="checkbox"
                            id={`permission-${permission}`}
                            label={permission.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            checked={(watchedPermissions || []).includes(permission)}
                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting && <div className="spinner-border spinner-border-sm me-2" />}
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};

export default RolesPermissionsSettingsPage;
