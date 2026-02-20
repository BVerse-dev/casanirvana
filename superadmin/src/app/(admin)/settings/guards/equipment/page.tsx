'use client';

import { useState, useMemo } from 'react';
import { Card, Row, Col, Button, Badge, Tab, Tabs, Modal, Form, Alert, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import FallbackLoading from '@/components/FallbackLoading';

// Hooks
import {
  useEquipment,
  useEquipmentStats,
  useEquipmentAssignments,
  useMaintenanceRecords,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useCreateEquipmentAssignment,
  useReturnEquipment,
  useCreateMaintenanceRecord,
  useUpdateMaintenanceStatus,
  useGuardEquipmentRealtime,
  type Equipment,
  type EquipmentAssignment,
  type MaintenanceRecord,
  type CreateEquipmentData,
} from '@/hooks/useGuardEquipment';

// Using types from useGuardEquipment hook

const GuardEquipmentPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Equipment form validation schema
  const equipmentSchema = yup.object().shape({
    name: yup.string().required('Equipment name is required'),
    serialNumber: yup.string().required('Serial number is required'),
    category: yup.string().required('Category is required'),
    type: yup.string().required('Type is required'),
    brand: yup.string().required('Brand is required'),
    model: yup.string().required('Model is required'),
    purchaseDate: yup.string().required('Purchase date is required'),
    warrantyExpiry: yup.string().required('Warranty expiry is required'),
    condition: yup.string().required('Condition is required'),
    status: yup.string().required('Status is required'),
    location: yup.string().required('Location is required'),
    cost: yup.number().positive('Cost must be positive').required('Cost is required'),
    notes: yup.string()
  });

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(equipmentSchema),
    defaultValues: {
      name: '',
      serialNumber: '',
      category: 'security',
      type: '',
      brand: '',
      model: '',
      purchaseDate: '',
      warrantyExpiry: '',
      condition: 'excellent',
      status: 'available',
      location: '',
      cost: 0,
      notes: ''
    }
  });

  // Real-time subscription
  useGuardEquipmentRealtime();

  // Data fetching hooks
  const { data: equipment = [], isLoading: equipmentLoading, error: equipmentError } = useEquipment({
    category: filterCategory,
    status: filterStatus,
    search: searchTerm,
  });

  const { data: stats, isLoading: statsLoading } = useEquipmentStats();
  const { data: assignments = [], isLoading: assignmentsLoading } = useEquipmentAssignments();
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useMaintenanceRecords();

  // Mutation hooks
  const createEquipmentMutation = useCreateEquipment();
  const updateEquipmentMutation = useUpdateEquipment();
  const deleteEquipmentMutation = useDeleteEquipment();

  // Loading states
  if (equipmentLoading || statsLoading) {
    return <FallbackLoading />;
  }

  // Error states
  if (equipmentError) {
    return (
      <Alert variant="danger">
        <IconifyIcon icon="ri:error-warning-line" className="me-1" />
        Error loading equipment data: {equipmentError.message}
      </Alert>
    );
  }

  // Filtered equipment is now handled by the useEquipment hook
  const filteredEquipment = equipment;

  const onSubmit = async (values: CreateEquipmentData & { notes?: string }) => {
    try {
      if (editingEquipment) {
        // Update equipment
        await updateEquipmentMutation.mutateAsync({
          id: editingEquipment.id,
          data: values
        });
      } else {
        // Create new equipment
        await createEquipmentMutation.mutateAsync(values);
      }
      
      setShowModal(false);
      setEditingEquipment(null);
      reset();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setValue('name', equipment.name);
    setValue('serialNumber', equipment.serialNumber);
    setValue('category', equipment.category);
    setValue('type', equipment.type);
    setValue('brand', equipment.brand);
    setValue('model', equipment.model);
    setValue('purchaseDate', equipment.purchaseDate);
    setValue('warrantyExpiry', equipment.warrantyExpiry);
    setValue('condition', equipment.condition);
    setValue('status', equipment.status);
    setValue('location', equipment.location);
    setValue('cost', equipment.cost);
    setValue('notes', equipment.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipmentMutation.mutateAsync(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      available: 'success',
      assigned: 'primary',
      maintenance: 'warning',
      lost: 'danger',
      damaged: 'danger',
      retired: 'secondary'
    };
    return <Badge bg={variants[status]} className="text-capitalize">{status.replace('_', ' ')}</Badge>;
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, string> = {
      excellent: 'success',
      good: 'info',
      fair: 'warning',
      poor: 'danger',
      needs_repair: 'danger'
    };
    return <Badge bg={variants[condition]} className="text-capitalize">{condition.replace('_', ' ')}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      security: 'ri:shield-check-line',
      communication: 'ri:radio-line',
      safety: 'ri:shield-star-line',
      medical: 'ri:first-aid-kit-line',
      maintenance: 'ri:tools-line',
      technology: 'ri:computer-line'
    };
    return icons[category] || 'ri:tools-line';
  };

  // Use stats from hook or calculate fallback
  const displayStats = stats || {
    total: 0,
    available: 0,
    assigned: 0,
    maintenance: 0,
    lost: 0,
    damaged: 0,
    retired: 0,
    needMaintenance: 0,
    totalValue: 0,
    deployedValue: 0,
    maintenanceCost: 0,
    averageItemCost: 0,
  };

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: 'Settings', path: '/settings' },
          { label: 'Guards', path: '/settings/guards' },
          { label: 'Equipment', path: '/settings/guards/equipment', active: true },
        ]}
        title="Guard Equipment Management"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard title="Equipment Overview">
            <Row className="mb-4">
              <Col sm={6} md={3}>
                <Card className="border-0 bg-light-primary">
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:tools-line" className="fs-2 text-primary mb-2" />
                    <h4 className="text-primary mb-1">{displayStats.total}</h4>
                    <p className="text-muted mb-0">Total Equipment</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6} md={3}>
                <Card className="border-0 bg-light-success">
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:checkbox-circle-line" className="fs-2 text-success mb-2" />
                    <h4 className="text-success mb-1">{displayStats.available}</h4>
                    <p className="text-muted mb-0">Available</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6} md={3}>
                <Card className="border-0 bg-light-info">
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:user-settings-line" className="fs-2 text-info mb-2" />
                    <h4 className="text-info mb-1">{displayStats.assigned}</h4>
                    <p className="text-muted mb-0">Assigned</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm={6} md={3}>
                <Card className="border-0 bg-light-warning">
                  <Card.Body className="text-center">
                    <IconifyIcon icon="ri:tools-fill" className="fs-2 text-warning mb-2" />
                    <h4 className="text-warning mb-1">{displayStats.maintenance}</h4>
                    <p className="text-muted mb-0">In Maintenance</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'inventory')} className="nav-tabs-custom">
              <Tab eventKey="inventory" title="Equipment Inventory">
                <div className="pt-3">
                  <Row className="mb-3">
                    <Col md={8}>
                      <Row>
                        <Col md={4}>
                          <Form.Control
                            type="text"
                            placeholder="Search equipment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                          >
                            <option value="">All Categories</option>
                            <option value="security">Security</option>
                            <option value="communication">Communication</option>
                            <option value="safety">Safety</option>
                            <option value="medical">Medical</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="technology">Technology</option>
                          </Form.Select>
                        </Col>
                        <Col md={3}>
                          <Form.Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="assigned">Assigned</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="lost">Lost</option>
                            <option value="damaged">Damaged</option>
                            <option value="retired">Retired</option>
                          </Form.Select>
                        </Col>
                      </Row>
                    </Col>
                    <Col md={4} className="text-end">
                      <Button variant="primary" onClick={() => setShowModal(true)}>
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Add Equipment
                      </Button>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Equipment</th>
                          <th>Category</th>
                          <th>Serial Number</th>
                          <th>Status</th>
                          <th>Condition</th>
                          <th>Assigned To</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEquipment.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <IconifyIcon icon={getCategoryIcon(item.category)} className="fs-4 me-2 text-muted" />
                                <div>
                                  <h6 className="mb-0">{item.name}</h6>
                                  <small className="text-muted">{item.brand} {item.model}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-capitalize">{item.category}</td>
                            <td><code>{item.serialNumber}</code></td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td>{getConditionBadge(item.condition)}</td>
                            <td>
                              {item.assignedGuardName ? (
                                <span>{item.assignedGuardName}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{item.location}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                  title="Edit"
                                >
                                  <IconifyIcon icon="ri:edit-line" />
                                </Button>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEquipment(item);
                                    setShowAssignModal(true);
                                  }}
                                  title="Assign"
                                  disabled={item.status !== 'available'}
                                >
                                  <IconifyIcon icon="ri:user-add-line" />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEquipment(item);
                                    setShowMaintenanceModal(true);
                                  }}
                                  title="Maintenance"
                                >
                                  <IconifyIcon icon="ri:tools-line" />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(item.id)}
                                  title="Delete"
                                >
                                  <IconifyIcon icon="ri:delete-bin-line" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredEquipment.length === 0 && (
                    <div className="text-center py-4">
                      <IconifyIcon icon="ri:search-line" className="fs-1 text-muted mb-3" />
                      <h5>No equipment found</h5>
                      <p className="text-muted">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab eventKey="assignments" title="Assignments">
                <div className="pt-3">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Equipment</th>
                          <th>Guard</th>
                          <th>Assigned Date</th>
                          <th>Purpose</th>
                          <th>Condition</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => {
                          const equipmentItem = equipment.find(e => e.id === assignment.equipmentId);
                          return (
                            <tr key={assignment.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <IconifyIcon icon={getCategoryIcon(equipmentItem?.category || 'technology')} className="fs-4 me-2 text-muted" />
                                  <div>
                                    <h6 className="mb-0">{equipmentItem?.name}</h6>
                                    <small className="text-muted">{equipmentItem?.serialNumber}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{assignment.guardName}</td>
                              <td>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                              <td>{assignment.purpose}</td>
                              <td>{getConditionBadge(assignment.condition)}</td>
                              <td>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  title="Return Equipment"
                                >
                                  <IconifyIcon icon="ri:arrow-go-back-line" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tab>

              <Tab eventKey="maintenance" title="Maintenance">
                <div className="pt-3">
                  <Row className="mb-3">
                    <Col md={8}>
                      <Alert variant="info">
                        <IconifyIcon icon="ri:information-line" className="me-1" />
                        {displayStats.needMaintenance} equipment items need maintenance
                      </Alert>
                    </Col>
                    <Col md={4} className="text-end">
                      <Button variant="warning">
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Schedule Maintenance
                      </Button>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Equipment</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Performed By</th>
                          <th>Date</th>
                          <th>Cost</th>
                          <th>Status</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td>{record.equipmentName}</td>
                            <td className="text-capitalize">{record.type}</td>
                            <td>{record.description}</td>
                            <td>{record.performedBy}</td>
                            <td>{new Date(record.performedDate).toLocaleDateString()}</td>
                            <td>${record.cost.toLocaleString()}</td>
                            <td>
                              <Badge bg={record.status === 'completed' ? 'success' : record.status === 'in_progress' ? 'warning' : 'info'}>
                                {record.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={record.priority === 'urgent' ? 'danger' : record.priority === 'high' ? 'warning' : 'info'}>
                                {record.priority}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tab>

              <Tab eventKey="analytics" title="Analytics">
                <div className="pt-3">
                  <Row>
                    <Col md={6}>
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">Equipment Distribution by Category</h5>
                        </Card.Header>
                        <Card.Body>
                          {Object.entries(
                            equipment.reduce((acc, item) => {
                              acc[item.category] = (acc[item.category] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([category, count]) => (
                            <div key={category} className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-capitalize">{category}</span>
                                <span>{count} items</span>
                              </div>
                              <ProgressBar now={(count / equipment.length) * 100} />
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">Equipment Status Overview</h5>
                        </Card.Header>
                        <Card.Body>
                          {Object.entries(
                            equipment.reduce((acc, item) => {
                              acc[item.status] = (acc[item.status] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([status, count]) => (
                            <div key={status} className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-capitalize">{status.replace('_', ' ')}</span>
                                <span>{count} items</span>
                              </div>
                              <ProgressBar 
                                now={(count / equipment.length) * 100}
                                variant={status === 'available' ? 'success' : status === 'assigned' ? 'primary' : 'warning'}
                              />
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mt-4">
                    <Col md={12}>
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">Equipment Value & Cost Analysis</h5>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-primary">${equipment.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</h4>
                                <p className="text-muted mb-0">Total Equipment Value</p>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-success">${equipment.filter(e => e.status === 'assigned').reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</h4>
                                <p className="text-muted mb-0">Deployed Value</p>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-warning">${maintenanceRecords.reduce((sum, record) => sum + record.cost, 0).toLocaleString()}</h4>
                                <p className="text-muted mb-0">Maintenance Cost</p>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="text-center">
                                <h4 className="text-info">${(equipment.reduce((sum, item) => sum + item.cost, 0) / equipment.length).toFixed(0)}</h4>
                                <p className="text-muted mb-0">Average Item Cost</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Add/Edit Equipment Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingEquipment(null);
        reset();
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Equipment Name *</Form.Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        {...field}
                        isInvalid={!!errors.name}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Serial Number *</Form.Label>
                  <Controller
                    name="serialNumber"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        {...field}
                        isInvalid={!!errors.serialNumber}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.serialNumber?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Form.Select
                        {...field}
                        isInvalid={!!errors.category}
                      >
                        <option value="">Select Category</option>
                        <option value="security">Security</option>
                        <option value="communication">Communication</option>
                        <option value="safety">Safety</option>
                        <option value="medical">Medical</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="technology">Technology</option>
                      </Form.Select>
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.category?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        {...field}
                        isInvalid={!!errors.type}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.type?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cost ($) *</Form.Label>
                  <Controller
                    name="cost"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="number"
                        {...field}
                        isInvalid={!!errors.cost}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cost?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand *</Form.Label>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        {...field}
                        isInvalid={!!errors.brand}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.brand?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model *</Form.Label>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        {...field}
                        isInvalid={!!errors.model}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.model?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Date *</Form.Label>
                  <Controller
                    name="purchaseDate"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="date"
                        {...field}
                        isInvalid={!!errors.purchaseDate}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.purchaseDate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty Expiry *</Form.Label>
                  <Controller
                    name="warrantyExpiry"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="date"
                        {...field}
                        isInvalid={!!errors.warrantyExpiry}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.warrantyExpiry?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition *</Form.Label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <Form.Select
                        {...field}
                        isInvalid={!!errors.condition}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="needs_repair">Needs Repair</option>
                      </Form.Select>
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.condition?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Form.Select
                        {...field}
                        isInvalid={!!errors.status}
                      >
                        <option value="available">Available</option>
                        <option value="assigned">Assigned</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="lost">Lost</option>
                        <option value="damaged">Damaged</option>
                        <option value="retired">Retired</option>
                      </Form.Select>
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.status?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        {...field}
                        isInvalid={!!errors.location}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...field}
                  />
                )}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit(onSubmit)}
          >
            {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GuardEquipmentPage;
