'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, Pagination } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dynamic from 'next/dynamic';

// Dynamic import for ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useCommunityProfiles, 
  useCommunityStats,
  useCreateCommunityProfile, 
  useUpdateCommunityProfile, 
  useDeleteCommunityProfile,
  useCommunityProfilesRealtime,
  type CommunityProfile,
  type CommunityFormData 
} from '@/hooks/useCommunityProfiles';

// Interfaces moved to hooks file

// Form validation schema
const communitySchema = yup.object({
  name: yup.string().required('Community name is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().required('Pincode is required').matches(/^[0-9]{6}$/, 'Invalid pincode'),
  phone: yup.string().optional(),
  email: yup.string().email('Invalid email address').optional(),
  website: yup.string().url('Invalid website URL').optional(),
  communityType: yup.string().required('Community type is required'),
  category: yup.string().required('Category is required'),
  status: yup.string().required('Status is required'),
  totalUnits: yup.number().positive('Must be positive').required('Total units is required'),
  totalBlocks: yup.number().positive('Must be positive').required('Total blocks is required'),
  totalFloors: yup.number().positive('Must be positive').required('Total floors is required'),
  establishedYear: yup.number().min(1900).max(new Date().getFullYear()).required('Established year is required'),
  registrationNumber: yup.string().optional(),
  chairman: yup.string().optional(),
  secretary: yup.string().optional(),
  treasurer: yup.string().optional(),
  maintenanceCharge: yup.number().min(0).required('Maintenance charge is required'),
  parkingSlots: yup.number().min(0).required('Parking slots is required'),
  securityDeposit: yup.number().min(0).required('Security deposit is required'),
  description: yup.string().optional(),
  bankName: yup.string().optional(),
  accountNumber: yup.string().optional(),
  ifscCode: yup.string().optional(),
  accountHolderName: yup.string().optional(),
});

const CommunityProfilesPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Hooks for data fetching and mutations
  const { data: communities = [], isLoading, error } = useCommunityProfiles(searchTerm, filterType, filterStatus);
  const { data: stats } = useCommunityStats();
  const createCommunityMutation = useCreateCommunityProfile();
  const updateCommunityMutation = useUpdateCommunityProfile();
  const deleteCommunityMutation = useDeleteCommunityProfile();
  
  // Real-time subscription
  useCommunityProfilesRealtime();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CommunityFormData>({
    resolver: yupResolver(communitySchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      website: '',
      communityType: 'residential',
      category: 'standard',
      status: 'active',
      totalUnits: 0,
      totalBlocks: 0,
      totalFloors: 0,
      establishedYear: new Date().getFullYear(),
      registrationNumber: '',
      chairman: '',
      secretary: '',
      treasurer: '',
      maintenanceCharge: 0,
      parkingSlots: 0,
      securityDeposit: 0,
      description: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
    }
  });

  // No mock data - using real Supabase data

  const communityTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'mixed', label: 'Mixed Use' },
    { value: 'gated_community', label: 'Gated Community' },
  ];

  const categoryOptions = [
    { value: 'premium', label: 'Premium' },
    { value: 'standard', label: 'Standard' },
    { value: 'budget', label: 'Budget' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'under_construction', label: 'Under Construction' },
    { value: 'maintenance', label: 'Under Maintenance' },
  ];

  const stateOptions = [
    { value: 'haryana', label: 'Haryana' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'rajasthan', label: 'Rajasthan' },
  ];

  const handleCreateCommunity = async (data: CommunityFormData) => {
    try {
      await createCommunityMutation.mutateAsync(data);
      setShowCreateModal(false);
      setShowSuccess(true);
      reset();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  const handleEditCommunity = async (data: CommunityFormData) => {
    if (!selectedCommunity) return;
    
    try {
      await updateCommunityMutation.mutateAsync({ id: selectedCommunity.id, formData: data });
      setShowEditModal(false);
      setSelectedCommunity(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating community:', error);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!selectedCommunity) return;
    
    try {
      await deleteCommunityMutation.mutateAsync(selectedCommunity.id);
      setShowDeleteModal(false);
      setSelectedCommunity(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting community:', error);
    }
  };

  const handleEdit = (community: CommunityProfile) => {
    setSelectedCommunity(community);
    reset({
      name: community.name,
      address: community.address,
      city: community.city,
      state: community.state,
      pincode: community.pincode,
      phone: community.phone || '',
      email: community.email || '',
      website: community.website || '',
      communityType: community.communityType,
      category: community.category,
      status: community.status,
      totalUnits: community.totalUnits,
      totalBlocks: community.totalBlocks,
      totalFloors: community.totalFloors,
      establishedYear: community.establishedYear,
      registrationNumber: community.registrationNumber || '',
      chairman: community.chairman || '',
      secretary: community.secretary || '',
      treasurer: community.treasurer || '',
      maintenanceCharge: community.maintenanceCharge,
      parkingSlots: community.parkingSlots,
      securityDeposit: community.securityDeposit,
      description: community.description || '',
      bankName: community.bankDetails.bankName || '',
      accountNumber: community.bankDetails.accountNumber || '',
      ifscCode: community.bankDetails.ifscCode || '',
      accountHolderName: community.bankDetails.accountHolderName || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (community: CommunityProfile) => {
    setSelectedCommunity(community);
    setShowDeleteModal(true);
  };

  const filteredCommunities = communities.filter((community: CommunityProfile) => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || community.communityType === filterType;
    const matchesStatus = filterStatus === 'all' || community.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus, viewMode, communities.length]);

  // Pagination logic
  const totalItems = filteredCommunities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCommunities = filteredCommunities.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'success', text: 'Active' },
      inactive: { bg: 'secondary', text: 'Inactive' },
      under_construction: { bg: 'warning', text: 'Under Construction' },
      maintenance: { bg: 'info', text: 'Under Maintenance' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      premium: { bg: 'primary', text: 'Premium' },
      standard: { bg: 'info', text: 'Standard' },
      budget: { bg: 'secondary', text: 'Budget' },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.standard;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <>
      <PageTitle title="Community Profiles" subName="Manage community information and configuration" />

      {showSuccess && (
        <Alert variant="success" className="mb-3">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          Operation completed successfully!
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="community-profiles" title="Community Profile Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'list')}
              className="mb-4"
            >
              <Tab eventKey="list" title="Community List">
                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading community profiles...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                    Error loading community profiles: {error.message}
                  </Alert>
                )}

                {/* Data Content */}
                {!isLoading && !error && (
                  <>
                    {/* Filters and Search */}
                <Row className="mb-4">
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <IconifyIcon icon="ri:search-line" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search communities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {communityTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <div className="d-flex gap-2">
                      <Button
                        variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <IconifyIcon icon="ri:list-unordered" />
                      </Button>
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <IconifyIcon icon="ri:grid-line" />
                      </Button>
                    </div>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      className="w-100"
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Add Community
                    </Button>
                  </Col>
                </Row>

                {/* Community List/Grid */}
                {viewMode === 'list' ? (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Community Name</th>
                          <th>Location</th>
                          <th>Type</th>
                          <th>Category</th>
                          <th>Units</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCommunities.map((community: CommunityProfile) => (
                          <tr key={community.id}>
                            <td>
                              <div>
                                <h6 className="mb-1">{community.name}</h6>
                                <small className="text-muted">{community.phone}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div>{community.city}, {community.state}</div>
                                <small className="text-muted">{community.pincode}</small>
                              </div>
                            </td>
                            <td>
                              <span className="text-capitalize">{community.communityType.replace('_', ' ')}</span>
                            </td>
                            <td>{getCategoryBadge(community.category)}</td>
                            <td>
                              <div>
                                <div>{community.totalUnits} units</div>
                                <small className="text-muted">{community.totalBlocks} blocks</small>
                              </div>
                            </td>
                            <td>{getStatusBadge(community.status)}</td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-primary" size="sm">
                                  <IconifyIcon icon="ri:more-2-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEdit(community)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-2" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleDelete(community)}>
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
                ) : (
                  <Row>
                    {paginatedCommunities.map((community: CommunityProfile) => (
                      <Col md={6} lg={4} key={community.id} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{community.name}</h6>
                            <Dropdown>
                              <Dropdown.Toggle variant="link" size="sm" className="p-0">
                                <IconifyIcon icon="ri:more-2-line" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(community)}>
                                  <IconifyIcon icon="ri:edit-line" className="me-2" />
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleDelete(community)}>
                                  <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <small className="text-muted">Location</small>
                              <div>{community.city}, {community.state}</div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Type & Category</small>
                              <div className="d-flex gap-2">
                                <span className="text-capitalize">{community.communityType.replace('_', ' ')}</span>
                                {getCategoryBadge(community.category)}
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Units</small>
                              <div>{community.totalUnits} units in {community.totalBlocks} blocks</div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Status</small>
                              <div>{getStatusBadge(community.status)}</div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Maintenance</small>
                              <div>${community.maintenanceCharge.toLocaleString()}/month</div>
                            </div>
                          </Card.Body>
                        </Card>
                                          </Col>
                  ))}
                  </Row>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted small">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} communities
                    </span>
                    <Pagination className="mb-0">
                      <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
                      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                        Math.max(0, currentPage - 3),
                        Math.min(totalPages, currentPage + 2)
                      ).map((page) => (
                        <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                          {page}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
                      <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                )}
                  </>
                )}
            </Tab>

              <Tab eventKey="statistics" title="Statistics">
                {/* Enhanced Statistics Dashboard */}
                
                {/* Key Metrics Cards - First Row */}
                <Row className="mb-4">
                  <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="avatar-lg bg-primary-subtle rounded-circle flex-centered me-3">
                            <IconifyIcon icon="ri:building-3-line" className="fs-24 text-primary" />
                          </div>
                          <div className="flex-grow-1">
                            <h3 className="mb-0">{stats?.totalCommunities || 0}</h3>
                            <p className="text-muted mb-0">Total Communities</p>
                            <small className="text-success">
                              <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                              12% from last month
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="avatar-lg bg-success-subtle rounded-circle flex-centered me-3">
                            <IconifyIcon icon="ri:checkbox-circle-line" className="fs-24 text-success" />
                          </div>
                          <div className="flex-grow-1">
                            <h3 className="mb-0">{stats?.activeCommunities || 0}</h3>
                            <p className="text-muted mb-0">Active Communities</p>
                            <small className="text-success">
                              <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                              {stats?.totalCommunities ? Math.round((stats.activeCommunities / stats.totalCommunities) * 100) : 0}% active rate
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="avatar-lg bg-info-subtle rounded-circle flex-centered me-3">
                            <IconifyIcon icon="ri:home-4-line" className="fs-24 text-info" />
                          </div>
                          <div className="flex-grow-1">
                            <h3 className="mb-0">{stats?.totalUnits || 0}</h3>
                            <p className="text-muted mb-0">Total Units</p>
                            <small className="text-info">
                              {stats?.averageUnitsPerCommunity || 0} avg per community
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col xl={3} md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="avatar-lg bg-warning-subtle rounded-circle flex-centered me-3">
                            <IconifyIcon icon="ri:money-dollar-circle-line" className="fs-24 text-warning" />
                          </div>
                          <div className="flex-grow-1">
                            <h3 className="mb-0">${((stats?.totalMaintenanceRevenue || 0) / 1000000).toFixed(1)}M</h3>
                            <p className="text-muted mb-0">Monthly Revenue</p>
                            <small className="text-warning">
                              ${stats?.maintenancePerUnit || 0} per unit
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Analytics Cards - Second Row */}
                <Row className="mb-4">
                  {/* Community Type Distribution */}
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Community Types</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {stats?.communityTypeBreakdown && (
                          <div>
                            {Object.entries(stats.communityTypeBreakdown).map(([type, count]: any) => {
                              const percentage = stats.totalCommunities ? (count / stats.totalCommunities) * 100 : 0;
                              return (
                                <div key={type} className="d-flex justify-content-between align-items-center mb-3">
                                  <div className="d-flex align-items-center">
                                    <div className={`avatar-sm bg-${type === 'residential' ? 'primary' : type === 'commercial' ? 'success' : type === 'mixed' ? 'warning' : 'info'}-subtle rounded me-3`}>
                                      <span className={`avatar-title rounded text-${type === 'residential' ? 'primary' : type === 'commercial' ? 'success' : type === 'mixed' ? 'warning' : 'info'}`}>
                                        <IconifyIcon 
                                          icon={type === 'residential' ? 'ri:home-4-line' : type === 'commercial' ? 'ri:building-line' : type === 'mixed' ? 'ri:building-2-line' : 'ri:community-line'} 
                                        />
                                      </span>
                                    </div>
                                    <div>
                                      <h6 className="mb-0">{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</h6>
                                      <small className="text-muted">{count} communities</small>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <span className="badge bg-light text-dark">{percentage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Size Distribution */}
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Size Distribution</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {stats?.sizeCategories && (
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-success-subtle rounded me-3">
                                  <span className="avatar-title rounded text-success">
                                    <IconifyIcon icon="ri:home-3-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">Small (≤50)</h6>
                                  <small className="text-muted">{stats.sizeCategories.small} communities</small>
                                </div>
                              </div>
                              <span className="badge bg-success-subtle text-success">{stats.totalCommunities ? ((stats.sizeCategories.small / stats.totalCommunities) * 100).toFixed(1) : 0}%</span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary-subtle rounded me-3">
                                  <span className="avatar-title rounded text-primary">
                                    <IconifyIcon icon="ri:building-2-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">Medium (51-200)</h6>
                                  <small className="text-muted">{stats.sizeCategories.medium} communities</small>
                                </div>
                              </div>
                              <span className="badge bg-primary-subtle text-primary">{stats.totalCommunities ? ((stats.sizeCategories.medium / stats.totalCommunities) * 100).toFixed(1) : 0}%</span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-warning-subtle rounded me-3">
                                  <span className="avatar-title rounded text-warning">
                                    <IconifyIcon icon="ri:building-3-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">Large (201-500)</h6>
                                  <small className="text-muted">{stats.sizeCategories.large} communities</small>
                                </div>
                              </div>
                              <span className="badge bg-warning-subtle text-warning">{stats.totalCommunities ? ((stats.sizeCategories.large / stats.totalCommunities) * 100).toFixed(1) : 0}%</span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-info-subtle rounded me-3">
                                  <span className="avatar-title rounded text-info">
                                    <IconifyIcon icon="ri:building-4-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">X-Large (500+)</h6>
                                  <small className="text-muted">{stats.sizeCategories.extraLarge} communities</small>
                                </div>
                              </div>
                              <span className="badge bg-info-subtle text-info">{stats.totalCommunities ? ((stats.sizeCategories.extraLarge / stats.totalCommunities) * 100).toFixed(1) : 0}%</span>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Community Age Distribution */}
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Age Distribution</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {stats?.ageDistribution && (
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-success-subtle rounded me-3">
                                  <span className="avatar-title rounded text-success">
                                    <IconifyIcon icon="ri:seedling-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">New (≤5 years)</h6>
                                  <small className="text-muted">{stats.ageDistribution.new} communities</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <span className="badge bg-success-subtle text-success">
                                  {stats.totalCommunities ? ((stats.ageDistribution.new / stats.totalCommunities) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary-subtle rounded me-3">
                                  <span className="avatar-title rounded text-primary">
                                    <IconifyIcon icon="ri:plant-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">Established (6-15)</h6>
                                  <small className="text-muted">{stats.ageDistribution.established} communities</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <span className="badge bg-primary-subtle text-primary">
                                  {stats.totalCommunities ? ((stats.ageDistribution.established / stats.totalCommunities) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-warning-subtle rounded me-3">
                                  <span className="avatar-title rounded text-warning">
                                    <IconifyIcon icon="ri:ancient-gate-line" />
                                  </span>
                                </div>
                                <div>
                                  <h6 className="mb-0">Mature (15+ years)</h6>
                                  <small className="text-muted">{stats.ageDistribution.mature} communities</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <span className="badge bg-warning-subtle text-warning">
                                  {stats.totalCommunities ? ((stats.ageDistribution.mature / stats.totalCommunities) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Third Row - Additional Analytics */}
                <Row className="mb-4">
                  {/* Status Overview */}
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Status Overview</Card.Title>
                      </Card.Header>
                      <Card.Body className="d-flex flex-column">
                        {stats?.statusBreakdown && (
                          <>
                            {/* Pie Chart */}
                            <div className="mb-3" style={{ height: '180px' }}>
                              <ReactApexChart
                                type="pie"
                                height={180}
                                options={{
                                  chart: {
                                    type: 'pie',
                                    toolbar: { show: false },
                                    sparkline: { enabled: true }
                                  },
                                  labels: Object.keys(stats.statusBreakdown).map((status: string) => 
                                    status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
                                  ),
                                  colors: Object.keys(stats.statusBreakdown).map((status: string) => {
                                    const colors = {
                                      active: '#28a745',
                                      inactive: '#dc3545', 
                                      under_construction: '#ffc107',
                                      pending: '#6c757d'
                                    };
                                    return colors[status as keyof typeof colors] || '#6c757d';
                                  }),
                                  legend: {
                                    show: false
                                  },
                                  dataLabels: {
                                    enabled: true,
                                    formatter: function(val: any) {
                                      return Math.round(val) + '%';
                                    },
                                    style: {
                                      fontSize: '11px',
                                      fontWeight: '600'
                                    }
                                  },
                                  plotOptions: {
                                    pie: {
                                      size: '85%'
                                    }
                                  },
                                  tooltip: {
                                    y: {
                                      formatter: function(val: any) {
                                        return val + ' communities';
                                      }
                                    }
                                  }
                                }}
                                series={Object.values(stats.statusBreakdown)}
                              />
                            </div>

                            {/* Legend Below Chart */}
                            <div className="flex-grow-1">
                              {Object.entries(stats.statusBreakdown).map(([status, count]: any) => {
                                const percentage = stats.totalCommunities ? (count / stats.totalCommunities) * 100 : 0;
                                const statusColor = status === 'active' ? 'success' : status === 'inactive' ? 'danger' : status === 'under_construction' ? 'warning' : 'secondary';
                                return (
                                  <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                      <div className={`rounded-circle me-2`} style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: status === 'active' ? '#28a745' : status === 'inactive' ? '#dc3545' : status === 'under_construction' ? '#ffc107' : '#6c757d'
                                      }}></div>
                                      <span className="text-capitalize small">{status.replace('_', ' ')}</span>
                                    </div>
                                    <span className="fw-medium small">{count} ({percentage.toFixed(0)}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Top Cities */}
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Top Cities</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {stats?.topCities && stats.topCities.map((city: any, index: number) => (
                          <div key={city.name} className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                              <div className={`avatar-sm bg-${index === 0 ? 'warning' : index === 1 ? 'info' : 'primary'}-subtle rounded me-3`}>
                                <span className={`avatar-title rounded text-${index === 0 ? 'warning' : index === 1 ? 'info' : 'primary'}`}>
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-0">{city.name}</h6>
                                <small className="text-muted">{city.value} communities</small>
                              </div>
                            </div>
                            <span className="badge bg-light text-dark">
                              {stats.totalCommunities ? ((city.value / stats.totalCommunities) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Key Performance Indicators */}
                  <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Key Metrics</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light-subtle rounded">
                          <div>
                            <h6 className="mb-0 text-primary">Occupancy Rate</h6>
                            <small className="text-muted">Overall utilization</small>
                          </div>
                          <div className="text-end">
                            <h4 className="mb-0 text-primary">{stats?.occupancyRate || 0}%</h4>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light-subtle rounded">
                          <div>
                            <h6 className="mb-0 text-success">Parking Ratio</h6>
                            <small className="text-muted">Spaces per unit</small>
                          </div>
                          <div className="text-end">
                            <h4 className="mb-0 text-success">{stats?.parkingRatio || 0}%</h4>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center p-3 bg-light-subtle rounded">
                          <div>
                            <h6 className="mb-0 text-info">Avg Maintenance</h6>
                            <small className="text-muted">Per unit monthly</small>
                          </div>
                          <div className="text-end">
                            <h4 className="mb-0 text-info">${stats?.avgMaintenanceCharge?.toFixed(0) || 0}</h4>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Top Amenities - Fourth Row */}
                <Row>
                  <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="border-bottom-0 pb-0">
                        <Card.Title className="mb-0">Popular Amenities</Card.Title>
                        <p className="text-muted small mb-0">Most common facilities across communities</p>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          {stats?.topAmenities && stats.topAmenities.slice(0, 8).map((amenity: any, index: number) => (
                            <Col lg={3} md={6} key={amenity.name} className="mb-3">
                              <div className="d-flex align-items-center p-3 border rounded h-100">
                                <div className={`avatar-sm bg-${index % 4 === 0 ? 'primary' : index % 4 === 1 ? 'success' : index % 4 === 2 ? 'warning' : 'info'}-subtle rounded me-3`}>
                                  <span className={`avatar-title rounded text-${index % 4 === 0 ? 'primary' : index % 4 === 1 ? 'success' : index % 4 === 2 ? 'warning' : 'info'}`}>
                                    <IconifyIcon icon="ri:check-line" />
                                  </span>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-0 text-capitalize">{amenity.name.replace('_', ' ')}</h6>
                                  <small className="text-muted">{amenity.value} communities</small>
                                </div>
                                <span className="badge bg-light text-dark">
                                  {stats.totalCommunities ? Math.round((amenity.value / stats.totalCommunities) * 100) : 0}%
                                </span>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>

      {/* Create Community Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Community</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateCommunity)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Community Name"
                      placeholder="Enter community name"
                      error={errors.name?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="registrationNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Registration Number"
                      placeholder="Enter registration number"
                      error={errors.registrationNumber?.message}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextAreaFormInput
                      {...field}
                      label="Address"
                      placeholder="Enter complete address"
                      error={errors.address?.message}
                      rows={2}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="City"
                      placeholder="Enter city"
                      error={errors.city?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="State"
                      error={errors.state?.message}
                    >
                      <option value="">Select State</option>
                      {stateOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="pincode"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Pincode"
                      placeholder="Enter pincode"
                      error={errors.pincode?.message}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Phone"
                      placeholder="Enter phone number"
                      error={errors.phone?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Email"
                      type="email"
                      placeholder="Enter email address"
                      error={errors.email?.message}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Controller
                  name="communityType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Community Type"
                      error={errors.communityType?.message}
                    >
                      {communityTypes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Category"
                      error={errors.category?.message}
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Status"
                      error={errors.status?.message}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Controller
                  name="totalUnits"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Total Units"
                      type="number"
                      placeholder="Enter total units"
                      error={errors.totalUnits?.message}
                    />
                  )}
                />
              </Col>
              <Col md={3}>
                <Controller
                  name="totalBlocks"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Total Blocks"
                      type="number"
                      placeholder="Enter total blocks"
                      error={errors.totalBlocks?.message}
                    />
                  )}
                />
              </Col>
              <Col md={3}>
                <Controller
                  name="totalFloors"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Total Floors"
                      type="number"
                      placeholder="Enter total floors"
                      error={errors.totalFloors?.message}
                    />
                  )}
                />
              </Col>
              <Col md={3}>
                <Controller
                  name="establishedYear"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Established Year"
                      type="number"
                      placeholder="Enter year"
                      error={errors.establishedYear?.message}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Controller
                  name="maintenanceCharge"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Maintenance Charge ($)"
                      type="number"
                      placeholder="Enter monthly charge"
                      error={errors.maintenanceCharge?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="parkingSlots"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Parking Slots"
                      type="number"
                      placeholder="Enter parking slots"
                      error={errors.parkingSlots?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="securityDeposit"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Security Deposit ($)"
                      type="number"
                      placeholder="Enter security deposit"
                      error={errors.securityDeposit?.message}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextAreaFormInput
                      {...field}
                      label="Description"
                      placeholder="Enter community description"
                      error={errors.description?.message}
                      rows={3}
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
            <Button variant="primary" type="submit" disabled={createCommunityMutation.isPending}>
              {createCommunityMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Community Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Community</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleEditCommunity)}>
          <Modal.Body>
            {/* Same form fields as create modal */}
            <Row>
              <Col md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Community Name"
                      placeholder="Enter community name"
                      error={errors.name?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="registrationNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Registration Number"
                      placeholder="Enter registration number"
                      error={errors.registrationNumber?.message}
                    />
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Controller
                  name="communityType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Community Type"
                      error={errors.communityType?.message}
                    >
                      {communityTypes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Category"
                      error={errors.category?.message}
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Status"
                      error={errors.status?.message}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectFormInput>
                  )}
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Controller
                  name="maintenanceCharge"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Maintenance Charge ($)"
                      type="number"
                      placeholder="Enter monthly charge"
                      error={errors.maintenanceCharge?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="parkingSlots"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Parking Slots"
                      type="number"
                      placeholder="Enter parking slots"
                      error={errors.parkingSlots?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="securityDeposit"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Security Deposit ($)"
                      type="number"
                      placeholder="Enter security deposit"
                      error={errors.securityDeposit?.message}
                    />
                  )}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateCommunityMutation.isPending}>
              {updateCommunityMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                'Update Community'
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
          <p>Are you sure you want to delete <strong>{selectedCommunity?.name}</strong>?</p>
          <p className="text-muted">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCommunity} disabled={deleteCommunityMutation.isPending}>
            {deleteCommunityMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete Community'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommunityProfilesPage;
