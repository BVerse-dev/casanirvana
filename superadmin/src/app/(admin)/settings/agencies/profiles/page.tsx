'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, Pagination } from 'react-bootstrap';
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
  useAgencyProfiles, 
  useCreateAgencyProfile, 
  useUpdateAgencyProfile, 
  useDeleteAgencyProfile,
  type AgencyProfile as DatabaseAgencyProfile,
  type CreateAgencyProfileData,
  type UpdateAgencyProfileData
} from '@/hooks/useAgencyProfiles';

// Use the database AgencyProfile type from hooks
type AgencyProfile = DatabaseAgencyProfile;

interface AgencyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  agencyType: string;
  category: string;
  status: string;
  totalProperties: number;
  totalAgents: number;
  totalClients: number;
  establishedYear: number;
  licenseNumber?: string;
  ownerName?: string;
  managerName?: string;
  commissionRate: number;
  averageDealValue: number;
  description?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

// Form validation schema
const agencySchema = yup.object({
  name: yup.string().required('Agency name is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().required('Postal code is required').matches(/^[A-Za-z0-9 -]{3,10}$/, 'Invalid postal code'),
  phone: yup.string().optional(),
  email: yup.string().email('Invalid email address').optional(),
  website: yup.string().url('Invalid website URL').optional(),
  agencyType: yup.string().required('Agency type is required'),
  category: yup.string().required('Category is required'),
  status: yup.string().required('Status is required'),
  totalProperties: yup.number().min(0).required('Total properties is required'),
  totalAgents: yup.number().min(1).required('Total agents is required'),
  totalClients: yup.number().min(0).required('Total clients is required'),
  establishedYear: yup.number().min(1900).max(new Date().getFullYear()).required('Established year is required'),
  licenseNumber: yup.string().optional(),
  ownerName: yup.string().optional(),
  managerName: yup.string().optional(),
  commissionRate: yup.number().min(0).max(100).required('Commission rate is required'),
  averageDealValue: yup.number().min(0).required('Average deal value is required'),
  description: yup.string().optional(),
  bankName: yup.string().optional(),
  accountNumber: yup.string().optional(),
  ifscCode: yup.string().optional(),
  accountHolderName: yup.string().optional(),
});

const defaultAgencyValues: AgencyFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  agencyType: 'residential',
  category: 'standard',
  status: 'active',
  totalProperties: 0,
  totalAgents: 1,
  totalClients: 0,
  establishedYear: new Date().getFullYear(),
  licenseNumber: '',
  ownerName: '',
  managerName: '',
  commissionRate: 2.5,
  averageDealValue: 0,
  description: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
};

const formatCurrencyCompact = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);

const AgencyProfilesPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<AgencyProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Reduced to 5 to ensure pagination shows

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AgencyFormData>({
    resolver: yupResolver(agencySchema),
    defaultValues: defaultAgencyValues
  });

  // Real data from database hooks
  const { data: agencies = [], isLoading: agenciesLoading, error: agenciesError } = useAgencyProfiles();
  const createAgencyMutation = useCreateAgencyProfile();
  const updateAgencyMutation = useUpdateAgencyProfile();
  const deleteAgencyMutation = useDeleteAgencyProfile();

  const agencyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'mixed', label: 'Mixed Properties' },
    { value: 'luxury', label: 'Luxury Properties' },
  ];

  const categoryOptions = [
    { value: 'premium', label: 'Premium' },
    { value: 'standard', label: 'Standard' },
    { value: 'budget', label: 'Budget' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending_approval', label: 'Pending Approval' },
  ];

  const stateOptions = [
    { value: 'greater_accra', label: 'Greater Accra' },
    { value: 'ashanti', label: 'Ashanti' },
    { value: 'western', label: 'Western' },
    { value: 'eastern', label: 'Eastern' },
    { value: 'central', label: 'Central' },
    { value: 'northern', label: 'Northern' },
    { value: 'volta', label: 'Volta' },
    { value: 'western_north', label: 'Western North' },
  ];

  const handleCreateAgency = async (data: AgencyFormData) => {
    setLoading(true);
    try {
      const createData: CreateAgencyProfileData = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        agency_type: data.agencyType as any,
        category: data.category as any,
        status: data.status as any,
        total_properties: data.totalProperties,
        total_agents: data.totalAgents,
        total_clients: data.totalClients,
        established_year: data.establishedYear,
        license_number: data.licenseNumber,
        owner_name: data.ownerName,
        manager_name: data.managerName,
        commission_rate: data.commissionRate,
        average_deal_value: data.averageDealValue,
        description: data.description,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        ifsc_code: data.ifscCode,
        account_holder_name: data.accountHolderName,
        services: [],
        specializations: [],
        documents: {},
        contact_persons: [],
      };

      await createAgencyMutation.mutateAsync(createData);
      closeCreateModal();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating agency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgency = async (data: AgencyFormData) => {
    if (!selectedAgency) return;
    
    setLoading(true);
    try {
      const updateData: UpdateAgencyProfileData = {
        id: selectedAgency.id,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        agency_type: data.agencyType as any,
        category: data.category as any,
        status: data.status as any,
        total_properties: data.totalProperties,
        total_agents: data.totalAgents,
        total_clients: data.totalClients,
        established_year: data.establishedYear,
        license_number: data.licenseNumber,
        owner_name: data.ownerName,
        manager_name: data.managerName,
        commission_rate: data.commissionRate,
        average_deal_value: data.averageDealValue,
        description: data.description,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        ifsc_code: data.ifscCode,
        account_holder_name: data.accountHolderName,
      };

      await updateAgencyMutation.mutateAsync(updateData);
      closeEditModal();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating agency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!selectedAgency) return;
    
    setLoading(true);
    try {
      await deleteAgencyMutation.mutateAsync(selectedAgency.id);
      setShowDeleteModal(false);
      setSelectedAgency(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting agency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agency: AgencyProfile) => {
    setSelectedAgency(agency);
    reset({
      name: agency.name,
      address: agency.address,
      city: agency.city,
      state: agency.state,
      pincode: agency.pincode,
      phone: agency.phone || '',
      email: agency.email || '',
      website: agency.website || '',
      agencyType: agency.agency_type,
      category: agency.category,
      status: agency.status,
      totalProperties: agency.total_properties,
      totalAgents: agency.total_agents,
      totalClients: agency.total_clients,
      establishedYear: agency.established_year,
      licenseNumber: agency.license_number || '',
      ownerName: agency.owner_name || '',
      managerName: agency.manager_name || '',
      commissionRate: agency.commission_rate,
      averageDealValue: agency.average_deal_value,
      description: agency.description || '',
      bankName: agency.bank_name || '',
      accountNumber: agency.account_number || '',
      ifscCode: agency.ifsc_code || '',
      accountHolderName: agency.account_holder_name || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (agency: AgencyProfile) => {
    setSelectedAgency(agency);
    setShowDeleteModal(true);
  };

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || agency.agency_type === filterType;
    const matchesStatus = filterStatus === 'all' || agency.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredAgencies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(startIndex, endIndex);

  const totalRevenue = agencies.reduce((sum, agency) => sum + (agency.average_deal_value || 0), 0);
  const averageDealValue = agencies.length ? totalRevenue / agencies.length : 0;
  const commissionEarned = agencies.reduce(
    (sum, agency) => sum + ((agency.average_deal_value || 0) * ((agency.commission_rate || 0) / 100)),
    0
  );

  const toPercentage = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 1000) / 10 : 0;

  const totalAgenciesCount = agencies.length;
  const luxuryShare = toPercentage(
    agencies.filter((agency) => agency.agency_type === 'luxury' || agency.category === 'premium').length,
    totalAgenciesCount
  );
  const residentialShare = toPercentage(
    agencies.filter((agency) => agency.agency_type === 'residential').length,
    totalAgenciesCount
  );
  const commercialShare = toPercentage(
    agencies.filter((agency) => agency.agency_type === 'commercial').length,
    totalAgenciesCount
  );

  const topLocations = Object.values(
    agencies.reduce<Record<string, { label: string; count: number }>>((acc, agency) => {
      const label = [agency.city, agency.state].filter(Boolean).join(', ');
      if (!label) return acc;
      acc[label] = acc[label]
        ? { ...acc[label], count: acc[label].count + 1 }
        : { label, count: 1 };
      return acc;
    }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 2);

  const cityCoverage = new Set(agencies.map((agency) => agency.city).filter(Boolean)).size;
  const regionCoverage = new Set(agencies.map((agency) => agency.state).filter(Boolean)).size;

  const topAgencies = [...agencies]
    .sort((left, right) => (right.total_properties || 0) - (left.total_properties || 0))
    .slice(0, 3);

  const openCreateModal = () => {
    setSelectedAgency(null);
    reset(defaultAgencyValues);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setSelectedAgency(null);
    reset(defaultAgencyValues);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedAgency(null);
    reset(defaultAgencyValues);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'success', text: 'Active' },
      inactive: { bg: 'secondary', text: 'Inactive' },
      suspended: { bg: 'danger', text: 'Suspended' },
      pending_approval: { bg: 'warning', text: 'Pending Approval' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      premium: { bg: 'primary', text: 'Premium' },
      standard: { bg: 'info', text: 'Standard' },
      budget: { bg: 'warning', text: 'Budget' },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.standard;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <>
      <PageTitle 
        title="Agency Profiles" 
        subName="Manage agency information and configuration"
      />

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:checkbox-circle-line" className="me-2" />
          Operation completed successfully!
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="agency-profiles" title="Agency Profile Management">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'list')}
              className="mb-4"
            >
              <Tab eventKey="list" title="Agency List">
                <Row className="mb-4">
                  <Col md={8}>
                    <Row>
                      <Col md={6}>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder="Search agencies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <InputGroup.Text>
                            <IconifyIcon icon="ri:search-line" />
                          </InputGroup.Text>
                        </InputGroup>
                      </Col>
                      <Col md={3}>
                        <Form.Select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          {agencyTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3}>
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
                    </Row>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button
                      variant="primary"
                      onClick={openCreateModal}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-2" />
                      Add New Agency
                    </Button>
                  </Col>
                </Row>

                <Card>
                  <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>Agency Name</th>
                          <th>Type</th>
                          <th>Category</th>
                          <th>Location</th>
                          <th>Properties</th>
                          <th>Agents</th>
                          <th>Status</th>
                          <th>Commission Rate</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedAgencies.map((agency) => (
                          <tr key={agency.id}>
                            <td>
                              <div>
                                <h6 className="mb-1">{agency.name}</h6>
                                <small className="text-muted">{agency.owner_name}</small>
                              </div>
                            </td>
                            <td>
                              <span className="text-capitalize">{agency.agency_type}</span>
                            </td>
                            <td>{getCategoryBadge(agency.category)}</td>
                            <td>{agency.city}, {agency.state}</td>
                            <td>
                              <Badge bg="info" className="rounded-pill">
                                {agency.total_properties}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="secondary" className="rounded-pill">
                                {agency.total_agents}
                              </Badge>
                            </td>
                            <td>{getStatusBadge(agency.status)}</td>
                            <td>{agency.commission_rate}%</td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="btn-icon"
                                >
                                  <IconifyIcon icon="ri:more-2-line" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleEdit(agency)}>
                                    <IconifyIcon icon="ri:edit-line" className="me-2" />
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleDelete(agency)}>
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
                  </Card.Body>
                </Card>

                {/* Pagination Controls */}
                <Row className="mt-3">
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} agencies 
                        (Page {currentPage} of {totalPages})
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
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="grid" title="Grid View">
                <Row className="mb-4">
                  <Col md={8}>
                    <Row>
                      <Col md={6}>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder="Search agencies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <InputGroup.Text>
                            <IconifyIcon icon="ri:search-line" />
                          </InputGroup.Text>
                        </InputGroup>
                      </Col>
                      <Col md={3}>
                        <Form.Select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          {agencyTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3}>
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
                    </Row>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button
                      variant="primary"
                      onClick={openCreateModal}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-2" />
                      Add New Agency
                    </Button>
                  </Col>
                </Row>

                <Row>
                  {paginatedAgencies.map((agency) => (
                    <Col md={6} lg={4} key={agency.id} className="mb-4">
                      <Card className="h-100 border-0 shadow-sm hover-card">
                        <Card.Body>
                          <div className="d-flex align-items-start justify-content-between mb-3">
                            <div className="flex-grow-1">
                              <h5 className="mb-1">{agency.name}</h5>
                              <p className="text-muted mb-2">{agency.owner_name}</p>
                              <div className="d-flex gap-2 mb-2">
                                {getCategoryBadge(agency.category)}
                                {getStatusBadge(agency.status)}
                              </div>
                            </div>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-primary" 
                                size="sm"
                                className="btn-icon"
                              >
                                <IconifyIcon icon="ri:more-2-line" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(agency)}>
                                  <IconifyIcon icon="ri:edit-line" className="me-2" />
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleDelete(agency)}>
                                  <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Type:</small>
                              <span className="text-capitalize">{agency.agency_type}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Location:</small>
                              <span>{agency.city}, {agency.state}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Properties:</small>
                              <Badge bg="info" className="rounded-pill">
                                {agency.total_properties}
                              </Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Agents:</small>
                              <Badge bg="secondary" className="rounded-pill">
                                {agency.total_agents}
                              </Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">Commission:</small>
                              <span className="fw-bold">{agency.commission_rate}%</span>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="flex-fill"
                              onClick={() => handleEdit(agency)}
                            >
                              <IconifyIcon icon="ri:edit-line" className="me-1" />
                              Edit
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination Controls for Grid View */}
                <Row className="mt-3">
                  <Col xs={12}>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} agencies
                        (Page {currentPage} of {totalPages})
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
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="analytics" title="Analytics">
                <Row>
                  <Col md={12}>
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-primary-subtle">
                        <h6 className="mb-0 text-primary">
                          <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                          Agency Analytics Dashboard
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        {/* Main Stats Cards with Gradients */}
                        <Row>
                          <Col md={3}>
                            <div className="text-center p-3 rounded position-relative overflow-hidden" style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white'
                            }}>
                              <IconifyIcon icon="ri:building-4-line" className="fs-2 mb-2" style={{ opacity: 0.9 }} />
                              <h5 className="mb-1 fw-bold">{agencies.length}</h5>
                              <p className="mb-0 small" style={{ opacity: 0.8 }}>Total Agencies</p>
                              <div className="position-absolute top-0 end-0 p-2" style={{ opacity: 0.3 }}>
                                <IconifyIcon icon="ri:building-4-line" className="fs-1" />
                              </div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="text-center p-3 rounded position-relative overflow-hidden" style={{
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: 'white'
                            }}>
                              <IconifyIcon icon="ri:home-5-line" className="fs-2 mb-2" style={{ opacity: 0.9 }} />
                              <h5 className="mb-1 fw-bold">
                                {agencies.reduce((sum: number, agency: any) => sum + (agency.total_properties || 0), 0)}
                              </h5>
                              <p className="mb-0 small" style={{ opacity: 0.8 }}>Total Properties</p>
                              <div className="position-absolute top-0 end-0 p-2" style={{ opacity: 0.3 }}>
                                <IconifyIcon icon="ri:home-5-line" className="fs-1" />
                              </div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="text-center p-3 rounded position-relative overflow-hidden" style={{
                              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              color: 'white'
                            }}>
                              <IconifyIcon icon="ri:team-line" className="fs-2 mb-2" style={{ opacity: 0.9 }} />
                              <h5 className="mb-1 fw-bold">
                                {agencies.reduce((sum: number, agency: any) => sum + (agency.total_agents || 0), 0)}
                              </h5>
                              <p className="mb-0 small" style={{ opacity: 0.8 }}>Total Agents</p>
                              <div className="position-absolute top-0 end-0 p-2" style={{ opacity: 0.3 }}>
                                <IconifyIcon icon="ri:team-line" className="fs-1" />
                              </div>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="text-center p-3 rounded position-relative overflow-hidden" style={{
                              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                              color: 'white'
                            }}>
                              <IconifyIcon icon="ri:user-3-line" className="fs-2 mb-2" style={{ opacity: 0.9 }} />
                              <h5 className="mb-1 fw-bold">
                                {agencies.reduce((sum: number, agency: any) => sum + (agency.total_clients || 0), 0)}
                              </h5>
                              <p className="mb-0 small" style={{ opacity: 0.8 }}>Total Clients</p>
                              <div className="position-absolute top-0 end-0 p-2" style={{ opacity: 0.3 }}>
                                <IconifyIcon icon="ri:user-3-line" className="fs-1" />
                              </div>
                            </div>
                          </Col>
                        </Row>

                        {/* Performance Metrics */}
                        <Row className="mt-4">
                          <Col md={4}>
                            <Card className="border-0 shadow-sm">
                              <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                  <IconifyIcon icon="ri:funds-line" className="me-2 text-success" />
                                  Revenue Analytics
                                </h6>
                              </Card.Header>
                              <Card.Body>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Total Revenue</span>
                                    <span className="fw-bold text-success">{formatCurrencyCompact(totalRevenue)}</span>
                                  </div>
                                  <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '85%' }}></div>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Avg Deal Value</span>
                                    <span className="fw-bold text-info">{formatCurrencyCompact(averageDealValue)}</span>
                                  </div>
                                  <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-info" style={{ width: '72%' }}></div>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Commission Earned</span>
                                    <span className="fw-bold text-warning">{formatCurrencyCompact(commissionEarned)}</span>
                                  </div>
                                  <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-warning" style={{ width: '68%' }}></div>
                                  </div>
                                </div>
                                <div className="text-center pt-2">
                                  <small className="text-success">
                                    <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                                    12.5% growth vs last month
                                  </small>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card className="border-0 shadow-sm">
                              <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                  <IconifyIcon icon="ri:pie-chart-line" className="me-2 text-primary" />
                                  Agency Distribution
                                </h6>
                              </Card.Header>
                              <Card.Body>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Luxury Agencies</span>
                                    <span className="fw-bold">{luxuryShare}%</span>
                                  </div>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar" style={{ 
                                      width: `${luxuryShare}%`,
                                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                    }}></div>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Residential</span>
                                    <span className="fw-bold">{residentialShare}%</span>
                                  </div>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar" style={{ 
                                      width: `${residentialShare}%`,
                                      background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                                    }}></div>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">Commercial</span>
                                    <span className="fw-bold">{commercialShare}%</span>
                                  </div>
                                  <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar" style={{ 
                                      width: `${commercialShare}%`,
                                      background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
                                    }}></div>
                                  </div>
                                </div>
                                <div className="text-center pt-2">
                                  <small className="text-muted">
                                    Balanced portfolio distribution
                                  </small>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card className="border-0 shadow-sm">
                              <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                  <IconifyIcon icon="ri:trophy-line" className="me-2 text-warning" />
                                  Top Performers
                                </h6>
                              </Card.Header>
                              <Card.Body>
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-warning rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                      <IconifyIcon icon="ri:medal-line" className="text-white" />
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-0">{topAgencies[0]?.name || 'No agencies yet'}</h6>
                                      <small className="text-muted">{topAgencies[0]?.total_properties || 0} Properties</small>
                                    </div>
                                    <Badge bg="warning" className="rounded-pill">Top</Badge>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-secondary rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                      <IconifyIcon icon="ri:medal-line" className="text-white" />
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-0">{topAgencies[1]?.name || '—'}</h6>
                                      <small className="text-muted">{topAgencies[1]?.total_properties || 0} Properties</small>
                                    </div>
                                    <Badge bg="secondary" className="rounded-pill">2nd</Badge>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-info rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                      <IconifyIcon icon="ri:medal-line" className="text-white" />
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-0">{topAgencies[2]?.name || '—'}</h6>
                                      <small className="text-muted">{topAgencies[2]?.total_properties || 0} Properties</small>
                                    </div>
                                    <Badge bg="info" className="rounded-pill">3rd</Badge>
                                  </div>
                                </div>
                                <div className="text-center pt-2">
                                  <small className="text-muted">
                                    Based on total properties managed
                                  </small>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        {/* Geographic Distribution */}
                        <Row className="mt-4">
                          <Col md={6}>
                            <Card className="border-0 shadow-sm">
                              <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                  <IconifyIcon icon="ri:map-pin-line" className="me-2 text-danger" />
                                  Geographic Distribution
                                </h6>
                              </Card.Header>
                              <Card.Body>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                      <div className="bg-primary rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                                      <span>{topLocations[0]?.label || 'No active coverage yet'}</span>
                                    </div>
                                    <span className="fw-bold">{toPercentage(topLocations[0]?.count || 0, totalAgenciesCount)}%</span>
                                  </div>
                                  <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: `${toPercentage(topLocations[0]?.count || 0, totalAgenciesCount)}%` }}></div>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                      <div className="bg-success rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                                      <span>{topLocations[1]?.label || 'No secondary coverage yet'}</span>
                                    </div>
                                    <span className="fw-bold">{toPercentage(topLocations[1]?.count || 0, totalAgenciesCount)}%</span>
                                  </div>
                                  <div className="progress" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: `${toPercentage(topLocations[1]?.count || 0, totalAgenciesCount)}%` }}></div>
                                  </div>
                                </div>
                                <div className="row text-center mt-3">
                                  <div className="col-4">
                                    <h6 className="text-primary mb-1">{cityCoverage}</h6>
                                    <small className="text-muted">Cities</small>
                                  </div>
                                  <div className="col-4">
                                    <h6 className="text-success mb-1">{regionCoverage}</h6>
                                    <small className="text-muted">Regions</small>
                                  </div>
                                  <div className="col-4">
                                    <h6 className="text-info mb-1">{totalAgenciesCount > 0 ? 'Live' : '—'}</h6>
                                    <small className="text-muted">Status</small>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6}>
                            <Card className="border-0 shadow-sm">
                              <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                  <IconifyIcon icon="ri:calendar-line" className="me-2 text-success" />
                                  Monthly Growth Trends
                                </h6>
                              </Card.Header>
                              <Card.Body>
                                <Row className="text-center">
                                  <Col md={3}>
                                    <div className="mb-3">
                                      <div className="bg-success rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                        <IconifyIcon icon="ri:arrow-up-line" className="text-white fs-5" />
                                      </div>
                                      <h6 className="text-success mb-1">+15%</h6>
                                      <small className="text-muted">New Agencies</small>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    <div className="mb-3">
                                      <div className="bg-primary rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                        <IconifyIcon icon="ri:arrow-up-line" className="text-white fs-5" />
                                      </div>
                                      <h6 className="text-primary mb-1">+22%</h6>
                                      <small className="text-muted">Properties</small>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    <div className="mb-3">
                                      <div className="bg-info rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                        <IconifyIcon icon="ri:arrow-up-line" className="text-white fs-5" />
                                      </div>
                                      <h6 className="text-info mb-1">+18%</h6>
                                      <small className="text-muted">Agents</small>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    <div className="mb-3">
                                      <div className="bg-warning rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                        <IconifyIcon icon="ri:arrow-up-line" className="text-white fs-5" />
                                      </div>
                                      <h6 className="text-warning mb-1">+25%</h6>
                                      <small className="text-muted">Revenue</small>
                                    </div>
                                  </Col>
                                </Row>
                                <div className="text-center mt-3">
                                  <small className="text-muted">
                                    <IconifyIcon icon="ri:information-line" className="me-1" />
                                    Data compared to previous month
                                  </small>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
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

      {/* Create Agency Modal */}
      <Modal show={showCreateModal} onHide={closeCreateModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Agency</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleCreateAgency)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <TextFormInput
                  name="name"
                  label="Agency Name"
                  placeholder="Enter agency name"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  name="agencyType"
                  label="Agency Type"
                  options={agencyTypes}
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <SelectFormInput
                  name="category"
                  label="Category"
                  options={categoryOptions}
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  name="status"
                  label="Status"
                  options={statusOptions}
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <TextAreaFormInput
              name="address"
              label="Address"
              placeholder="Enter full address"
              control={control}
              rows={2}
              className="mb-3"
            />

            <Row>
              <Col md={4}>
                <TextFormInput
                  name="city"
                  label="City"
                  placeholder="Enter city"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <SelectFormInput
                  name="state"
                  label="State"
                  options={stateOptions}
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <TextFormInput
                  name="pincode"
                  label="Postal Code"
                  placeholder="Enter postal code"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <TextFormInput
                  name="phone"
                  label="Phone"
                  placeholder="Enter phone number"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="email"
                  label="Email"
                  placeholder="Enter email address"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <TextFormInput
                  name="ownerName"
                  label="Owner Name"
                  placeholder="Enter owner name"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="licenseNumber"
                  label="License Number"
                  placeholder="Enter license number"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <TextFormInput
                  name="totalAgents"
                  label="Total Agents"
                  type="number"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <TextFormInput
                  name="commissionRate"
                  label="Commission Rate (%)"
                  type="number"
                  step="0.1"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <TextFormInput
                  name="establishedYear"
                  label="Established Year"
                  type="number"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <TextAreaFormInput
              name="description"
              label="Description"
              placeholder="Enter agency description"
              control={control}
              rows={3}
              className="mb-3"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={closeCreateModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : (
                'Create Agency'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Agency Modal */}
      <Modal show={showEditModal} onHide={closeEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Agency</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleEditAgency)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <TextFormInput
                  name="name"
                  label="Agency Name"
                  placeholder="Enter agency name"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  name="agencyType"
                  label="Agency Type"
                  options={agencyTypes}
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <SelectFormInput
                  name="category"
                  label="Category"
                  options={categoryOptions}
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <SelectFormInput
                  name="status"
                  label="Status"
                  options={statusOptions}
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <TextAreaFormInput
              name="address"
              label="Address"
              placeholder="Enter full address"
              control={control}
              rows={2}
              className="mb-3"
            />

            <Row>
              <Col md={4}>
                <TextFormInput
                  name="city"
                  label="City"
                  placeholder="Enter city"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <SelectFormInput
                  name="state"
                  label="State"
                  options={stateOptions}
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <TextFormInput
                  name="pincode"
                  label="Postal Code"
                  placeholder="Enter postal code"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <TextFormInput
                  name="phone"
                  label="Phone"
                  placeholder="Enter phone number"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="email"
                  label="Email"
                  placeholder="Enter email address"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <TextFormInput
                  name="ownerName"
                  label="Owner Name"
                  placeholder="Enter owner name"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={6}>
                <TextFormInput
                  name="licenseNumber"
                  label="License Number"
                  placeholder="Enter license number"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <TextFormInput
                  name="totalAgents"
                  label="Total Agents"
                  type="number"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <TextFormInput
                  name="commissionRate"
                  label="Commission Rate (%)"
                  type="number"
                  step="0.1"
                  control={control}
                  className="mb-3"
                />
              </Col>
              <Col md={4}>
                <TextFormInput
                  name="establishedYear"
                  label="Established Year"
                  type="number"
                  control={control}
                  className="mb-3"
                />
              </Col>
            </Row>

            <TextAreaFormInput
              name="description"
              label="Description"
              placeholder="Enter agency description"
              control={control}
              rows={3}
              className="mb-3"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={closeEditModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                'Update Agency'
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
            <IconifyIcon 
              icon="ri:delete-bin-line" 
              className="fs-1 text-danger mb-3" 
            />
            <h5>Are you sure?</h5>
            <p className="text-muted">
              Do you want to delete <strong>{selectedAgency?.name}</strong>? 
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAgency}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete Agency'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AgencyProfilesPage;
