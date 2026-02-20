'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Nav, Tab, Button, Table, Badge, Form, Modal, Alert, Pagination } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiHome, FiKey, FiTrendingUp, FiDollarSign, FiUsers, FiCalendar, FiMapPin, FiStar, FiEye, FiSettings, FiBarChart } from 'react-icons/fi';
import { useAgencyServices, useCreateAgencyService, useUpdateAgencyService, useDeleteAgencyService } from '@/hooks/useAgencyServices';
import type { AgencyService } from '@/hooks/useAgencyServices';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Validation schema for service form
const serviceSchema = yup.object().shape({
  name: yup.string().required('Service name is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().required('Description is required'),
  basePrice: yup.number().positive('Base price must be positive').required('Base price is required'),
  commissionRate: yup.number().min(0, 'Commission rate must be 0 or greater').max(100, 'Commission rate cannot exceed 100%').required('Commission rate is required'),
  duration: yup.string().required('Duration is required'),
  availability: yup.string().required('Availability is required'),
  requirements: yup.string(),
  status: yup.string().required('Status is required'),
  targetMarket: yup.string().required('Target market is required'),
  features: yup.array().of(yup.string()),
  tags: yup.array().of(yup.string())
});

type ServiceFormData = yup.InferType<typeof serviceSchema>;

const categoryOptions = [
  'Listing Services', 'Valuation Services', 'Management Services', 
  'Staging Services', 'Legal Services', 'Advisory Services', 'Marketing Services'
];

const availabilityOptions = ['Available', 'Limited', 'Unavailable'];
const statusOptions = ['Active', 'Beta', 'Inactive', 'Discontinued'];
const targetMarketOptions = ['All Property Types', 'Luxury Properties', 'Investment Properties', 'Residential Sales', 'Commercial', 'Investors'];

const AgencyServicesPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ServiceFormData>({
    resolver: yupResolver(serviceSchema)
  });

  // --- Supabase hooks ---
  const { data: servicesList = [], isLoading, error } = useAgencyServices();
  const createService = useCreateAgencyService();
  const updateService = useUpdateAgencyService();
  const deleteService = useDeleteAgencyService();

  const queryClient = useQueryClient();

  // Real-time subscription for agency_services
  useEffect(() => {
    const channel = supabase
      .channel('public:agency_services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agency_services' }, () => {
        queryClient.invalidateQueries({ queryKey: ['agencyServices'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Filter services based on search and filters
  const filteredServices = servicesList.filter((service: AgencyService) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = !filterStatus || service.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculations
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  // --- Loading and error handling ---
  if (isLoading) return <div>Loading services...</div>;
  if (error) return <Alert variant="danger">Failed to load services: {error.message}</Alert>;

  // --- Add/Edit/Delete logic using hooks ---
  const handleAddService = () => {
    setEditingService(null);
    reset();
    setShowModal(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    Object.keys(service).forEach(key => {
      setValue(key as keyof ServiceFormData, service[key]);
    });
    setShowModal(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService.mutate(serviceId);
    }
  };

  const onSubmit = (data: ServiceFormData) => {
    // Map camelCase form fields to snake_case for DB
    const mappedData = {
      ...data,
      base_price: data.basePrice,
      commission_rate: data.commissionRate,
      target_market: data.targetMarket,
      features: (data.features || []).filter((f): f is string => typeof f === 'string'),
      tags: (data.tags || []).filter((t): t is string => typeof t === 'string'),
    };
    // Remove camelCase fields
    delete (mappedData as any).basePrice;
    delete (mappedData as any).commissionRate;
    delete (mappedData as any).targetMarket;
    if (editingService) {
      updateService.mutate({ id: editingService.id, ...mappedData });
    } else {
      // agency_id is required; set to a default or fetch from context if available
      createService.mutate({ ...mappedData, agency_id: editingService?.agency_id || '1' });
    }
    setShowModal(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      'Active': 'success',
      'Beta': 'warning',
      'Inactive': 'secondary',
      'Discontinued': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants: { [key: string]: string } = {
      'Available': 'success',
      'Limited': 'warning',
      'Unavailable': 'danger'
    };
    return <Badge bg={variants[availability] || 'secondary'}>{availability}</Badge>;
  };

  // Calculate statistics
  const totalServices = servicesList.length;
  const activeServices = servicesList.filter((s: AgencyService) => s.status === 'Active').length;
  const totalRevenue = servicesList.reduce((sum: number, s: AgencyService) => sum + (s.revenue ?? 0), 0);
  const totalBookings = servicesList.reduce((sum: number, s: AgencyService) => sum + (s.bookings ?? 0), 0);
  const avgRating = servicesList.length > 0 ? servicesList.reduce((sum: number, s: AgencyService) => sum + (s.rating ?? 0), 0) / servicesList.length : 0;

  return (
    <div className="container-fluid">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0 text-gray-800">Agency Services Management</h1>
          <p className="text-muted">Manage service offerings, pricing, and performance</p>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="text-decoration-none">
                      <FiBarChart className="me-2" />
                      Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="services" className="text-decoration-none">
                      <FiSettings className="me-2" />
                      Services Directory
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="performance" className="text-decoration-none">
                      <FiTrendingUp className="me-2" />
                      Performance Analytics
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="pricing" className="text-decoration-none">
                      <FiDollarSign className="me-2" />
                      Pricing & Commission
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  {/* Overview Tab */}
                  <Tab.Pane eventKey="overview">
                    <Row className="mb-4">
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-primary text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Total Services</h6>
                                <h3 className="mb-0">{totalServices}</h3>
                              </div>
                              <FiSettings size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-success text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Active Services</h6>
                                <h3 className="mb-0">{activeServices}</h3>
                              </div>
                              <FiEye size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-info text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Total Revenue</h6>
                                <h3 className="mb-0">${totalRevenue.toLocaleString()}</h3>
                              </div>
                              <FiDollarSign size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm bg-gradient-warning text-white">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="text-white-50 mb-1">Total Bookings</h6>
                                <h3 className="mb-0">{totalBookings}</h3>
                              </div>
                              <FiCalendar size={32} className="text-white-50" />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={8} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Service Category Performance</h6>
                          </Card.Header>
                          <Card.Body>
                            {categoryOptions.map(category => {
                              const categoryServices = servicesList.filter((s: AgencyService) => s.category === category);
                              const categoryRevenue = categoryServices.reduce((sum: number, s: AgencyService) => sum + (s.revenue ?? 0), 0);
                              const categoryBookings = categoryServices.reduce((sum: number, s: AgencyService) => sum + (s.bookings ?? 0), 0);
                              const maxRevenue = Math.max(...categoryOptions.map((cat: string) => 
                                servicesList.filter((s: AgencyService) => s.category === cat).reduce((sum: number, s: AgencyService) => sum + (s.revenue ?? 0), 0)
                              ));
                              const percentage = maxRevenue > 0 ? (categoryRevenue / maxRevenue) * 100 : 0;

                              return (
                                <div key={category} className="mb-4">
                                  <div className="d-flex justify-content-between mb-2">
                                    <div>
                                      <span className="font-weight-bold">{category}</span>
                                      <small className="text-muted ms-2">({categoryServices.length} services)</small>
                                    </div>
                                    <div className="text-end">
                                      <div className="font-weight-bold">${categoryRevenue.toLocaleString()}</div>
                                      <small className="text-muted">{categoryBookings} bookings</small>
                                    </div>
                                  </div>
                                  <div className="progress" style={{ height: '10px' }}>
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
                      <Col md={4} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Top Performing Services</h6>
                          </Card.Header>
                          <Card.Body>
                            {servicesList
                              .sort((a: AgencyService, b: AgencyService) => (b.revenue ?? 0) - (a.revenue ?? 0))
                              .slice(0, 5)
                              .map((service: AgencyService) => (
                                <div key={service.id} className="d-flex justify-content-between align-items-center mb-3">
                                  <div>
                                    <div className="font-weight-bold">{service.name}</div>
                                    <small className="text-muted">{service.category}</small>
                                  </div>
                                  <div className="text-end">
                                    <div className="font-weight-bold">${service.revenue?.toLocaleString()}</div>
                                    <div className="d-flex align-items-center">
                                      <FiStar className="text-warning me-1" size={14} />
                                      <small>{service.rating}</small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Services Directory Tab */}
                  <Tab.Pane eventKey="services">
                    <Row className="mb-3">
                      <Col md={8}>
                        <div className="d-flex gap-2">
                          <div className="position-relative flex-grow-1">
                            <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                            <Form.Control
                              type="text"
                              placeholder="Search services..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="ps-5"
                            />
                          </div>
                          <Form.Select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Categories</option>
                            {categoryOptions.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </Form.Select>
                          <Form.Select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            <option value="">All Status</option>
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </Form.Select>
                        </div>
                      </Col>
                      <Col md={4} className="text-end">
                        <Button variant="primary" onClick={handleAddService}>
                          <FiPlus className="me-2" />
                          Add New Service
                        </Button>
                      </Col>
                    </Row>

                    <Card className="shadow-sm">
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th>Service</th>
                              <th>Category</th>
                              <th>Pricing</th>
                              <th>Performance</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedServices.map((service: AgencyService) => (
                              <tr key={service.id}>
                                <td>
                                  <div>
                                    <div className="font-weight-bold">{service.name}</div>
                                    <small className="text-muted">{service.description.substring(0, 50)}...</small>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="info" className="me-1">{service.category}</Badge>
                                  <div className="mt-1">
                                    {getAvailabilityBadge(service.availability)}
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="font-weight-bold">${service.basePrice}</div>
                                    <small className="text-muted">{service.commissionRate}% commission</small>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="d-flex align-items-center mb-1">
                                      <FiStar className="text-warning me-1" size={14} />
                                      <span>{service.rating}</span>
                                    </div>
                                    <small className="text-success">{service.bookings} bookings</small>
                                  </div>
                                </td>
                                <td>{getStatusBadge(service.status)}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleEditService(service)}
                                    >
                                      <FiEdit2 />
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleDeleteService(service.id)}
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
                          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} services (Page {currentPage} of {totalPages})
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
                    </Card>
                  </Tab.Pane>

                  {/* Performance Analytics Tab */}
                  <Tab.Pane eventKey="performance">
                    <Row>
                      <Col md={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Revenue by Service</h6>
                          </Card.Header>
                          <Card.Body>
                            {servicesList
                              .sort((a: AgencyService, b: AgencyService) => (b.revenue ?? 0) - (a.revenue ?? 0))
                              .map((service: AgencyService) => {
                                const maxRevenue = Math.max(...servicesList.map((s: AgencyService) => s.revenue ?? 0));
                                const percentage = maxRevenue > 0 ? (service.revenue ?? 0 / maxRevenue) * 100 : 0;
                                return (
                                  <div key={service.id} className="mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                      <span className="font-weight-bold">{service.name}</span>
                                      <span className="text-muted">${service.revenue?.toLocaleString()}</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div 
                                        className="progress-bar bg-success" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Service Ratings & Completion</h6>
                          </Card.Header>
                          <Card.Body>
                            {servicesList
                              .sort((a: AgencyService, b: AgencyService) => (b.rating ?? 0) - (a.rating ?? 0))
                              .map((service: AgencyService) => (
                                <div key={service.id} className="mb-4 p-3 border rounded">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="font-weight-bold">{service.name}</span>
                                    <Badge bg="secondary">{service.bookings} bookings</Badge>
                                  </div>
                                  <div className="row">
                                    <div className="col-6">
                                      <div className="d-flex align-items-center">
                                        <FiStar className="text-warning me-2" />
                                        <span className="font-weight-bold">{service.rating}</span>
                                        <span className="text-muted ms-2">/ 5.0</span>
                                      </div>
                                    </div>
                                    <div className="col-6 text-end">
                                      <span className="font-weight-bold text-success">{service.completionRate}%</span>
                                      <span className="text-muted ms-1">completion</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Pricing & Commission Tab */}
                  <Tab.Pane eventKey="pricing">
                    <Row>
                      <Col md={8} className="mb-4">
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Service Pricing Overview</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="table-responsive">
                              <Table>
                                <thead>
                                  <tr>
                                    <th>Service</th>
                                    <th>Base Price</th>
                                    <th>Commission Rate</th>
                                    <th>Avg. Transaction</th>
                                    <th>Total Revenue</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {servicesList.map((service: AgencyService) => {
                                    const bookings = service.bookings ?? 0;
                                    const revenue = service.revenue ?? 0;
                                    const avgTransaction = bookings > 0 ? revenue / bookings : 0;
                                    return (
                                      <tr key={service.id}>
                                        <td>
                                          <div>
                                            <div className="font-weight-bold">{service.name}</div>
                                            <small className="text-muted">{service.category}</small>
                                          </div>
                                        </td>
                                        <td className="font-weight-bold">${service.basePrice}</td>
                                        <td>{service.commissionRate}%</td>
                                        <td>${avgTransaction.toFixed(0)}</td>
                                        <td className="font-weight-bold text-success">${service.revenue?.toLocaleString()}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="shadow-sm">
                          <Card.Header>
                            <h6 className="mb-0">Pricing Analytics</h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-4">
                              <h6 className="text-muted">Average Service Price</h6>
                              <h3 className="text-primary">${(servicesList.reduce((sum: number, s: AgencyService) => sum + (s.basePrice ?? 0), 0) / servicesList.length).toFixed(0)}</h3>
                            </div>
                            <div className="mb-4">
                              <h6 className="text-muted">Average Commission Rate</h6>
                              <h3 className="text-success">{(servicesList.reduce((sum: number, s: AgencyService) => sum + (s.commissionRate ?? 0), 0) / servicesList.length).toFixed(1)}%</h3>
                            </div>
                            <div className="mb-4">
                              <h6 className="text-muted">Revenue per Service</h6>
                              <h3 className="text-info">${(totalRevenue / servicesList.length).toFixed(0)}</h3>
                            </div>
                            <div className="mb-4">
                              <h6 className="text-muted">Bookings per Service</h6>
                              <h3 className="text-warning">{(totalBookings / servicesList.length).toFixed(0)}</h3>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>

      {/* Add/Edit Service Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingService ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name *</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('name')}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select {...register('category')} isInvalid={!!errors.category}>
                    <option value="">Select Category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.category?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('description')}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Price ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    {...register('basePrice')}
                    isInvalid={!!errors.basePrice}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.basePrice?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Commission Rate (%) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    {...register('commissionRate')}
                    isInvalid={!!errors.commissionRate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.commissionRate?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 30 days, 1 week"
                    {...register('duration')}
                    isInvalid={!!errors.duration}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.duration?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Availability *</Form.Label>
                  <Form.Select {...register('availability')} isInvalid={!!errors.availability}>
                    <option value="">Select Availability</option>
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.availability?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Market *</Form.Label>
                  <Form.Select {...register('targetMarket')} isInvalid={!!errors.targetMarket}>
                    <option value="">Select Target Market</option>
                    {targetMarketOptions.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.targetMarket?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select {...register('status')} isInvalid={!!errors.status}>
                    <option value="">Select Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="List any requirements or prerequisites"
                {...register('requirements')}
                isInvalid={!!errors.requirements}
              />
              <Form.Control.Feedback type="invalid">
                {errors.requirements?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingService ? 'Update Service' : 'Add Service'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AgencyServicesPage;
