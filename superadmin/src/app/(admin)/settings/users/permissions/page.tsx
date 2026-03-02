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
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import {
  useListPermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  type Permission,
  type PermissionInsert
} from '@/hooks/useUserPermissions';

interface PermissionFormData {
  name: string;
  key: string;
  description: string;
  category: string;
  module: string;
  type: string;
}

const permissionValidationSchema = yup.object({
  name: yup.string().required('Permission name is required').min(3, 'Permission name must be at least 3 characters'),
  key: yup.string().required('Permission key is required').matches(/^[a-z_]+$/, 'Permission key must be lowercase with underscores only'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  category: yup.string().required('Category is required'),
  module: yup.string().required('Module is required'),
  type: yup.string().required('Permission type is required')
});

const permissionCategories = [
  { value: 'System', label: 'System' },
  { value: 'Administration', label: 'Administration' },
  { value: 'Security', label: 'Security' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Community', label: 'Community' },
  { value: 'Personal', label: 'Personal' }
];

const permissionModules = [
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'User Management', label: 'User Management' },
  { value: 'Visitor Management', label: 'Visitor Management' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Amenity Management', label: 'Amenity Management' },
  { value: 'Emergency Management', label: 'Emergency Management' },
  { value: 'Reports', label: 'Reports' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Communications', label: 'Communications' },
  { value: 'Payments', label: 'Payments' }
];

const permissionTypes = [
  { value: 'read', label: 'Read', color: 'info' },
  { value: 'write', label: 'Write', color: 'warning' },
  { value: 'delete', label: 'Delete', color: 'danger' },
  { value: 'execute', label: 'Execute', color: 'primary' },
  { value: 'admin', label: 'Admin', color: 'dark' }
];

export default function PermissionsManagementPage() {
  // Component state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('list');

  // Memoized filters to prevent unnecessary hook re-executions
  const filters = useMemo(() => ({
    search: searchTerm,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: 'all' as const,
    sortBy: 'created_at' as const,
    sortOrder: 'desc' as const,
    page: 1,
    pageSize: 50
  }), [searchTerm, categoryFilter, typeFilter]);

  // Supabase hooks
  const { data: permissionsResponse, isLoading, error } = useListPermissions(filters);
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();
  const deletePermissionMutation = useDeletePermission();

  const permissions = useMemo(
    () => permissionsResponse?.data || [],
    [permissionsResponse?.data]
  );

  const permissionStatsData = useMemo(() => {
    const byType = permissionTypes.reduce<Record<string, number>>((acc, type) => {
      acc[type.value] = permissions.filter((permission) => permission.type === type.value).length;
      return acc;
    }, {});

    const byCategory = permissions.reduce<Record<string, number>>((acc, permission) => {
      acc[permission.category] = (acc[permission.category] || 0) + 1;
      return acc;
    }, {});

    const byModule = permissions.reduce<Record<string, number>>((acc, permission) => {
      acc[permission.module] = (acc[permission.module] || 0) + 1;
      return acc;
    }, {});

    return {
      total: permissions.length,
      active: permissions.filter((permission) => permission.status === 'active').length,
      inactive: permissions.filter((permission) => permission.status === 'inactive').length,
      system: permissions.filter((permission) => permission.isSystemPermission).length,
      byType,
      byCategory,
      byModule,
    };
  }, [permissions]);

  // Filtered permissions based on current search and filters
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = searchTerm === '' || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || permission.category === categoryFilter;
    const matchesType = typeFilter === 'all' || permission.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Form handling
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<PermissionFormData>({
    resolver: yupResolver(permissionValidationSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
      category: '',
      module: '',
      type: ''
    }
  });

  const statsDisplay = permissionStatsData;

  const handleCreatePermission = async (data: PermissionFormData) => {
    try {
      console.log('Creating permission with data:', data);
      const permissionData: PermissionInsert = {
        ...data,
        type: data.type as any
      };
      
      await createPermissionMutation.mutateAsync(permissionData);
      setShowCreateModal(false);
      reset();
      console.log('Permission created successfully');
    } catch (error) {
      console.error('Failed to create permission:', error);
      alert(`Failed to create permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditPermission = async (data: PermissionFormData) => {
    if (!selectedPermission) return;
    
    try {
      console.log('Updating permission:', selectedPermission.id, data);
      await updatePermissionMutation.mutateAsync({
        id: selectedPermission.id,
        ...data,
        type: data.type as any
      });
      setShowEditModal(false);
      setSelectedPermission(null);
      reset();
      console.log('Permission updated successfully');
    } catch (error) {
      console.error('Failed to update permission:', error);
      alert(`Failed to update permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;
    
    try {
      console.log('Deleting permission:', selectedPermission.id);
      await deletePermissionMutation.mutateAsync(selectedPermission.id);
      setShowDeleteModal(false);
      setSelectedPermission(null);
      console.log('Permission deleted successfully');
    } catch (error) {
      console.error('Failed to delete permission:', error);
      alert(`Failed to delete permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openEditModal = (permission: Permission) => {
    console.log('Opening edit modal for permission:', permission.id);
    setSelectedPermission(permission);
    setValue('name', permission.name);
    setValue('key', permission.key);
    setValue('description', permission.description);
    setValue('category', permission.category);
    setValue('module', permission.module);
    setValue('type', permission.type);
    setShowEditModal(true);
  };

  const openDeleteModal = (permission: Permission) => {
    console.log('Opening delete modal for permission:', permission.id);
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  const getTypeColor = (type: string) => {
    const typeObj = permissionTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'secondary';
  };

  const groupPermissionsByCategory = () => {
    const groups: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });
    return groups;
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle title="Permission Management" />
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading permissions...</span>
          </div>
          <p className="mt-2">Loading permissions...</p>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageTitle title="Permission Management" />
        <Alert variant="danger">
          <IconifyIcon icon="material-symbols:error" className="me-2" />
          Error loading permissions: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </>
    );
  }

  const PermissionModal = ({ show, onHide, title, onSubmit }: any) => (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="name"
                label="Permission Name"
                placeholder="Enter permission name"
                control={control}
                errors={errors}
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="key"
                label="Permission Key"
                placeholder="e.g., users_create"
                control={control}
                errors={errors}
              />
            </Col>
          </Row>

          <TextAreaFormInput
            name="description"
            label="Description"
            placeholder="Enter permission description"
            rows={3}
            control={control}
            errors={errors}
          />

          <Row>
            <Col md={6}>
              <SelectFormInput
                name="category"
                label="Category"
                control={control}
                options={permissionCategories}
                errors={errors}
              />
            </Col>
            <Col md={6}>
              <SelectFormInput
                name="module"
                label="Module"
                control={control}
                options={permissionModules}
                errors={errors}
              />
            </Col>
          </Row>

          <SelectFormInput
            name="type"
            label="Permission Type"
            control={control}
            options={permissionTypes}
            errors={errors}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <IconifyIcon icon="material-symbols:save" className="me-1" />
            {title.includes('Create') ? 'Create Permission' : 'Update Permission'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  return (
    <>
      <PageTitle title="Permission Management" />
      
      <ComponentContainerCard 
        title="System Permissions"
        description="Manage granular permissions and access controls for your community management system"
      >
        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:security" className="fs-1 text-primary mb-2" />
                <h4 className="mb-1">{statsDisplay.total}</h4>
                <p className="text-muted mb-0">Total Permissions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:check-circle" className="fs-1 text-success mb-2" />
                <h4 className="mb-1">{statsDisplay.active}</h4>
                <p className="text-muted mb-0">Active Permissions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:admin-panel-settings" className="fs-1 text-warning mb-2" />
                <h4 className="mb-1">{statsDisplay.system}</h4>
                <p className="text-muted mb-0">System Permissions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <IconifyIcon icon="material-symbols:category" className="fs-1 text-info mb-2" />
                <h4 className="mb-1">{Object.keys(statsDisplay.byCategory).length}</h4>
                <p className="text-muted mb-0">Categories</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Row className="mb-4">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>
                <IconifyIcon icon="material-symbols:search" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {permissionCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {permissionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button 
              variant="primary" 
              className="w-100"
              onClick={() => setShowCreateModal(true)}
            >
              <IconifyIcon icon="material-symbols:add" className="me-1" />
              Create Permission
            </Button>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'list')} className="mb-4">
          <Tab eventKey="list" title="Permission List">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Key</th>
                  <th>Category</th>
                  <th>Module</th>
                  <th>Type</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>
                      <div>
                        <div className="fw-semibold">{permission.name}</div>
                        <small className="text-muted">{permission.description}</small>
                        {permission.isSystemPermission && (
                          <div>
                            <Badge bg="secondary" className="small">System Permission</Badge>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <code className="small">{permission.key}</code>
                    </td>
                    <td>
                      <Badge bg="light" text="dark">{permission.category}</Badge>
                    </td>
                    <td>{permission.module}</td>
                    <td>
                      <Badge bg={getTypeColor(permission.type)}>
                        {permission.type}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="info">{permission.roleCount}</Badge>
                    </td>
                    <td>
                      <Badge bg={permission.status === 'active' ? 'success' : 'warning'}>
                        {permission.status}
                      </Badge>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle 
                          variant="light" 
                          size="sm"
                          className="border-0"
                        >
                          <IconifyIcon icon="material-symbols:more-vert" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => openEditModal(permission)}>
                            <IconifyIcon icon="material-symbols:edit" className="me-2" />
                            Edit Permission
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="text-danger"
                            onClick={() => openDeleteModal(permission)}
                            disabled={permission.isSystemPermission}
                          >
                            <IconifyIcon icon="material-symbols:delete" className="me-2" />
                            Delete Permission
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="categories" title="By Category">
            {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
              <Card key={category} className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">
                    {category} 
                    <Badge bg="light" text="dark" className="ms-2">
                      {categoryPermissions.length} permissions
                    </Badge>
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {categoryPermissions.map(permission => (
                      <Col md={6} key={permission.id} className="mb-2">
                        <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                          <div>
                            <div className="fw-semibold small">{permission.name}</div>
                            <code className="text-muted small">{permission.key}</code>
                          </div>
                          <Badge bg={getTypeColor(permission.type)}>
                            {permission.type}
                          </Badge>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Tab>

          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Permissions by Type</h6>
                  </Card.Header>
                  <Card.Body>
                    {permissionTypes.map(type => (
                      <div key={type.value} className="d-flex justify-content-between align-items-center mb-2">
                        <Badge bg={type.color} className="me-2">{type.label}</Badge>
                        <span>{statsDisplay.byType[type.value] || 0} permissions</span>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Permissions by Category</h6>
                  </Card.Header>
                  <Card.Body>
                    {permissionCategories.map(category => (
                      <div key={category.value} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{category.label}</span>
                        <Badge bg="light" text="dark">
                          {statsDisplay.byCategory[category.value] || 0}
                        </Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </ComponentContainerCard>

      {/* Create Permission Modal */}
      <PermissionModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        title="Create New Permission"
        onSubmit={handleCreatePermission}
      />

      {/* Edit Permission Modal */}
      <PermissionModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedPermission(null);
          reset();
        }}
        title="Edit Permission"
        onSubmit={handleEditPermission}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <IconifyIcon icon="material-symbols:warning" className="me-2" />
            Are you sure you want to delete the permission &quot;{selectedPermission?.name}&quot;?
          </Alert>
          <p className="text-muted">
            This action cannot be undone. This permission will be removed from all roles.
          </p>
          {selectedPermission && selectedPermission.roleCount > 0 && (
            <Alert variant="warning">
              <strong>Warning:</strong> This permission is currently assigned to {selectedPermission.roleCount} role(s).
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePermission}>
            <IconifyIcon icon="material-symbols:delete" className="me-1" />
            Delete Permission
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
