'use client';

import { useState } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks - Now using real Supabase data
import {
  useListUserRoles,
  useCreateUserRole,
  useUpdateUserRole,
  useDeleteUserRole,
  useRoleStatistics,
  AVAILABLE_PERMISSIONS,
  ROLE_COLORS,
  type UserRoleWithUserCount,
  type CreateRoleFormData,
  type UpdateRoleFormData,
} from '@/hooks/useUserRoles';

interface UserRole {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
  isSystemRole: boolean;
  createdDate: string;
  updatedDate: string;
  status: 'active' | 'inactive';
}

interface RoleFormData {
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isDefault: boolean;
}

const roleValidationSchema = yup.object({
  name: yup.string().required('Role name is required').min(2, 'Role name must be at least 2 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  color: yup.string().required('Color is required'),
  permissions: yup.array().of(yup.string().required()).required().min(1, 'At least one permission is required'),
  isDefault: yup.boolean().required()
});

const availablePermissions = AVAILABLE_PERMISSIONS;
const roleColors = ROLE_COLORS;

export default function RolesManagementPage() {
  // Real data from Supabase
  const { 
    data: rolesData = [], 
    isLoading: rolesLoading, 
    error: rolesError 
  } = useListUserRoles();
  
  const { 
    data: statsData = { total: 0, active: 0, system: 0, totalUsers: 0 },
    isLoading: statsLoading 
  } = useRoleStatistics();
  
  const createRoleMutation = useCreateUserRole();
  const updateRoleMutation = useUpdateUserRole();
  const deleteRoleMutation = useDeleteUserRole();

  // Transform Supabase data to match original interface
  const roles: UserRole[] = rolesData.map(role => ({
    id: role.id,
    name: role.name,
    description: role.description,
    color: role.color,
    permissions: Array.isArray(role.permissions) ? role.permissions as string[] : [],
    userCount: role.userCount,
    isDefault: role.is_default,
    isSystemRole: role.is_system_role,
    createdDate: role.created_at || '',
    updatedDate: role.updated_at || '',
    status: role.status === 'active' ? 'active' : 'inactive'
  }));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('list');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<RoleFormData>({
    resolver: yupResolver(roleValidationSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#0d6efd',
      permissions: [],
      isDefault: false
    }
  });

  const selectedPermissions = watch('permissions') || [];

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const roleStats = {
    total: statsData.total,
    active: statsData.active,
    system: statsData.system,
    totalUsers: statsData.totalUsers
  };

  const openCreateModal = () => {
    reset();
    setShowCreateModal(true);
  };

  const openEditModal = (role: UserRole) => {
    setSelectedRole(role);
    reset({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: role.permissions,
      isDefault: role.isDefault
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (role: UserRole) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data: RoleFormData) => {
    if (showCreateModal) {
      await handleCreateRole(data);
    } else if (showEditModal) {
      await handleEditRole(data);
    }
  };

  const handleCreateRole = async (data: RoleFormData) => {
    try {
      const createData: CreateRoleFormData = {
        name: data.name,
        description: data.description,
        color: data.color,
        permissions: data.permissions,
        is_default: data.isDefault,
      };

      await createRoleMutation.mutateAsync(createData);
      toast.success(`Role "${data.name}" created successfully!`);
      setShowCreateModal(false);
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create role';
      toast.error(message);
    }
  };

  const handleEditRole = async (data: RoleFormData) => {
    if (!selectedRole) return;
    
    try {
      const updateData: UpdateRoleFormData = {
        id: selectedRole.id,
        name: data.name,
        description: data.description,
        color: data.color,
        permissions: data.permissions,
        is_default: data.isDefault,
      };

      await updateRoleMutation.mutateAsync(updateData);
      toast.success(`Role "${data.name}" updated successfully!`);
      setShowEditModal(false);
      setSelectedRole(null);
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update role';
      toast.error(message);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      await deleteRoleMutation.mutateAsync(selectedRole.id);
      toast.success(`Role "${selectedRole.name}" deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedRole(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete role';
      toast.error(message);
    }
  };

  const togglePermission = (permission: string) => {
    const current = selectedPermissions || [];
    if (current.includes(permission)) {
      setValue('permissions', current.filter(p => p !== permission));
    } else {
      setValue('permissions', [...current, permission]);
    }
  };

  const toggleAllPermissions = () => {
    if (selectedPermissions.length === availablePermissions.length) {
      setValue('permissions', []);
    } else {
      setValue('permissions', availablePermissions.map(p => p.value));
    }
  };

  // Show loading state
  if (rolesLoading || statsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (rolesError) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Roles</Alert.Heading>
        <p>Failed to load roles data. Please try again later.</p>
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle title="Roles Management" subName="Manage user roles and permissions" />
      
      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded bg-primary-subtle">
                    <div className="avatar-title text-primary">
                      <IconifyIcon icon="solar:users-group-rounded-bold-duotone" className="fs-24" />
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fw-semibold">{roleStats.total}</div>
                  <div className="text-muted">Total Roles</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded bg-success-subtle">
                    <div className="avatar-title text-success">
                      <IconifyIcon icon="solar:check-circle-bold-duotone" className="fs-24" />
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fw-semibold">{roleStats.active}</div>
                  <div className="text-muted">Active Roles</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded bg-warning-subtle">
                    <div className="avatar-title text-warning">
                      <IconifyIcon icon="solar:shield-check-bold-duotone" className="fs-24" />
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fw-semibold">{roleStats.system}</div>
                  <div className="text-muted">System Roles</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded bg-info-subtle">
                    <div className="avatar-title text-info">
                      <IconifyIcon icon="solar:user-id-bold-duotone" className="fs-24" />
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="fw-semibold">{roleStats.totalUsers}</div>
                  <div className="text-muted">Total Users</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="roles-management" title="Roles & Permissions">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'list')}
              className="mb-4"
            >
          <Tab eventKey="list" title="Roles List">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <InputGroup style={{ maxWidth: '300px' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputGroup.Text>
                    <IconifyIcon icon="solar:magnifer-linear" />
                  </InputGroup.Text>
                </InputGroup>
                
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ maxWidth: '150px' }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </div>
              
              <Button variant="primary" onClick={openCreateModal}>
                <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                Create Role
              </Button>
            </div>

            <div className="table-responsive">
              <Table hover className="table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '200px' }}>Role Name</th>
                    <th scope="col" style={{ width: '280px', minWidth: '280px' }}>Description</th>
                    <th scope="col" style={{ width: '200px' }}>Permissions</th>
                    <th scope="col" style={{ width: '80px' }}>Users</th>
                    <th scope="col" style={{ width: '80px' }}>Status</th>
                    <th scope="col" style={{ width: '100px' }}>Updated</th>
                    <th scope="col" style={{ width: '80px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle"
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: role.color
                            }}
                          />
                          <div>
                            <div className="fw-semibold">{role.name}</div>
                            {role.isDefault && (
                              <Badge bg="primary" className="mt-1">Default</Badge>
                            )}
                            {role.isSystemRole && (
                              <Badge bg="warning" className="mt-1 ms-1">System</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div 
                          className="text-muted" 
                          style={{ 
                            maxWidth: '250px',
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.4'
                          }}
                        >
                          {role.description.length > 60 
                            ? `${role.description.substring(0, 60)}...` 
                            : role.description
                          }
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {role.permissions.includes('all') ? (
                            <Badge bg="danger">All Permissions</Badge>
                          ) : (
                            role.permissions.slice(0, 2).map((perm) => (
                              <Badge key={perm} bg="secondary">{perm.replace('_', ' ')}</Badge>
                            ))
                          )}
                          {role.permissions.length > 2 && !role.permissions.includes('all') && (
                            <Badge bg="light" text="dark">+{role.permissions.length - 2} more</Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{role.userCount} users</Badge>
                      </td>
                      <td>
                        <Badge bg={role.status === 'active' ? 'success' : 'danger'}>
                          {role.status}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted">
                          {new Date(role.updatedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="ghost-primary" size="sm">
                            <IconifyIcon icon="solar:menu-dots-bold-duotone" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditModal(role)}>
                              <IconifyIcon icon="solar:pen-bold-duotone" className="me-1" />
                              Edit
                            </Dropdown.Item>
                            {!role.isSystemRole && (
                              <Dropdown.Item 
                                className="text-danger"
                                onClick={() => openDeleteModal(role)}
                              >
                                <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="me-1" />
                                Delete
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {filteredRoles.length === 0 && (
              <div className="text-center py-4">
                <div className="text-muted">No roles found</div>
              </div>
            )}
          </Tab>

          <Tab eventKey="permissions" title="Permission Matrix">
            <div className="table-responsive">
              <Table className="table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Permission</th>
                    {roles.map((role) => (
                      <th key={role.id} scope="col" className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <div
                            className="rounded-circle"
                            style={{
                              width: '6px',
                              height: '6px',
                              backgroundColor: role.color
                            }}
                          />
                          {role.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {availablePermissions.map((permission) => (
                    <tr key={permission.value}>
                      <td>
                        <div>
                          <div className="fw-semibold">{permission.label}</div>
                          <div className="text-muted small">{permission.group}</div>
                        </div>
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="text-center">
                          {role.permissions.includes('all') || role.permissions.includes(permission.value) ? (
                            <IconifyIcon icon="solar:check-circle-bold-duotone" className="text-success fs-18" />
                          ) : (
                            <IconifyIcon icon="solar:close-circle-bold-duotone" className="text-muted fs-18" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </ComponentContainerCard>
    </Col>
  </Row>

      {/* Create/Edit Role Modal */}
      <Modal show={showCreateModal || showEditModal} onHide={() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedRole(null);
        reset();
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {showCreateModal ? 'Create New Role' : 'Edit Role'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row className="g-3">
              <Col sm={6}>
                <Controller
                  name="name"
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
                {errors.name && <div className="text-danger small">{errors.name.message}</div>}
              </Col>
              <Col sm={6}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      label="Color"
                      options={roleColors}
                      control={control}
                      {...field}
                    />
                  )}
                />
                {errors.color && <div className="text-danger small">{errors.color.message}</div>}
              </Col>
              <Col sm={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextAreaFormInput
                      label="Description"
                      placeholder="Enter role description"
                      rows={3}
                      control={control}
                      {...field}
                    />
                  )}
                />
                {errors.description && <div className="text-danger small">{errors.description.message}</div>}
              </Col>
              <Col sm={12}>
                <Form.Check
                  type="checkbox"
                  label="Set as default role for new users"
                  checked={watch('isDefault')}
                  onChange={(e) => setValue('isDefault', e.target.checked)}
                />
              </Col>
            </Row>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Permissions</h6>
              <Button variant="outline-primary" size="sm" onClick={toggleAllPermissions}>
                {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <Row className="g-2">
              {availablePermissions.map((permission) => (
                <Col sm={6} key={permission.value}>
                  <Form.Check
                    type="checkbox"
                    label={permission.label}
                    checked={selectedPermissions.includes(permission.value)}
                    onChange={() => togglePermission(permission.value)}
                    disabled={permission.value === 'all' && selectedRole?.isSystemRole}
                  />
                  <div className="text-muted small">{permission.group}</div>
                </Col>
              ))}
            </Row>

            {errors.permissions && (
              <div className="text-danger small mt-1">{errors.permissions.message}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setSelectedRole(null);
              reset();
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
            >
              {(createRoleMutation.isPending || updateRoleMutation.isPending) && (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              )}
              {showCreateModal ? 'Create Role' : 'Update Role'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => {
        setShowDeleteModal(false);
        setSelectedRole(null);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="avatar-lg mx-auto mb-3">
              <div className="avatar-title bg-danger-subtle text-danger rounded-circle">
                <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="fs-36" />
              </div>
            </div>
            <h5>Are you sure?</h5>
            <p className="text-muted">
              Do you want to delete the role "{selectedRole?.name}"? 
              {selectedRole?.userCount && selectedRole.userCount > 0 && (
                <><br /><strong className="text-warning">Warning:</strong> {selectedRole.userCount} users are currently assigned to this role.</>
              )}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowDeleteModal(false);
            setSelectedRole(null);
          }}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteRole}
            disabled={deleteRoleMutation.isPending}
          >
            {deleteRoleMutation.isPending && (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            )}
            Delete Role
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
