'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge, Modal, Table, Tab, Tabs, Alert, InputGroup, Dropdown, Pagination } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactApexChart from 'react-apexcharts';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import SelectFormInput from '@/components/from/SelectFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { 
  useCommunityServices, 
  useCommunityServicesStats, 
  useCreateCommunityService, 
  useUpdateCommunityService, 
  useDeleteCommunityService,
  useCommunityServicesRealtime,
  type CommunityService,
  type CommunityServiceFormData 
} from '@/hooks/useCommunityServices';
import { useListCommunities } from '@/hooks/useCommunities';

// Using CommunityService and CommunityServiceFormData from hooks

// Form validation schema
const serviceSchema = yup.object({
  name: yup.string().required('Service name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  communityId: yup.string().required('Community is required'),
  serviceType: yup.string().required('Service type is required'),
  availability: yup.string().required('Availability is required'),
  status: yup.string().required('Status is required'),
  pricingType: yup.string().required('Pricing type is required'),
  pricingAmount: yup.number().when('pricingType', {
    is: (val: string) => val !== 'free',
    then: (schema) => schema.min(0, 'Amount must be positive').required('Amount is required'),
    otherwise: (schema) => schema.optional(),
  }),
  primaryContact: yup.string().required('Primary contact is required'),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').optional(),
  responseTime: yup.number().min(1, 'Response time must be positive').required('Response time is required'),
  maxRequests: yup.number().min(1, 'Max requests must be positive').required('Max requests is required'),
  isBookingRequired: yup.boolean().optional(),
  advanceBookingHours: yup.number().min(0, 'Advance booking hours must be positive').optional(),
  cancelationPolicy: yup.string().optional(),
});

const ServicesManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<CommunityService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommunity, setFilterCommunity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [overviewCurrentPage, setOverviewCurrentPage] = useState(1);
  const [overviewItemsPerPage, setOverviewItemsPerPage] = useState(5);

  // Real-time subscription
  useCommunityServicesRealtime();

  // Data hooks - temporarily remove filters to test
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useCommunityServices();
  const { data: communitiesData, isLoading: communitiesLoading } = useListCommunities();
  const communities = communitiesData?.data || [];
  const { data: stats } = useCommunityServicesStats();

  // Data loaded successfully
  const createServiceMutation = useCreateCommunityService();
  const updateServiceMutation = useUpdateCommunityService();
  const deleteServiceMutation = useDeleteCommunityService();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CommunityServiceFormData>({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'maintenance',
      communityId: '',
      serviceType: 'internal',
      availability: 'scheduled',
      status: 'active',
      pricingType: 'free',
      primaryContact: '',
      phone: '',
      responseTime: 30,
      maxRequests: 10,
      isBookingRequired: false,
      advanceBookingHours: 2,
      requirements: [],
      terms: [],
      features: [],
      operatingHours: {
        open: '09:00',
        close: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        isAlwaysOpen: false
      }
    }
  });

  // Transform communities data for form options
  const communityOptions = communities?.map(community => ({
    value: community.id,
    label: community.name
  })) || [];

  const categoryOptions = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'security', label: 'Security' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'healthcare', label: 'Healthcare' },
  ];

  const serviceTypeOptions = [
    { value: 'internal', label: 'Internal Team' },
    { value: 'external', label: 'External Service' },
    { value: 'vendor_managed', label: 'Vendor Managed' },
    { value: 'self_service', label: 'Self Service' },
  ];

  const availabilityOptions = [
    { value: 'always', label: 'Always Available' },
    { value: 'scheduled', label: 'Scheduled Hours' },
    { value: 'on_demand', label: 'On Demand' },
    { value: 'emergency_only', label: 'Emergency Only' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'coming_soon', label: 'Coming Soon' },
  ];

  const pricingTypeOptions = [
    { value: 'free', label: 'Free' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Per Hour' },
    { value: 'per_request', label: 'Per Request' },
    { value: 'subscription', label: 'Monthly Subscription' },
  ];

  // Filter and search logic
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCommunity = filterCommunity === 'all' || service.community_id === filterCommunity;
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    
    return matchesSearch && matchesCommunity && matchesCategory && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Overview table pagination logic
  const overviewTotalItems = communities?.length || 0;
  const overviewTotalPages = Math.ceil(overviewTotalItems / overviewItemsPerPage);
  const overviewStartIndex = (overviewCurrentPage - 1) * overviewItemsPerPage;
  const overviewEndIndex = overviewStartIndex + overviewItemsPerPage;
  const paginatedCommunities = communities?.slice(overviewStartIndex, overviewEndIndex) || [];

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCommunity, filterCategory, filterStatus]);

  // Use stats from hook or calculate from filtered services for display
  const displayStats = stats || {
    totalServices: filteredServices.length,
    activeServices: filteredServices.filter(service => service.status === 'active').length,
    totalRequests: filteredServices.reduce((sum, service) => sum + service.total_requests, 0),
    totalRevenue: filteredServices.reduce((sum, service) => sum + service.monthly_revenue, 0),
    averageRating: filteredServices.length > 0 
      ? filteredServices.reduce((sum, service) => sum + service.avg_rating, 0) / filteredServices.length 
      : 0,
    categoryDistribution: filteredServices.reduce((acc: any, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {}),
  };

  // Chart configurations using real data
  const categoryChart = {
    series: Object.values(displayStats.categoryDistribution),
    options: {
      chart: {
        type: 'donut' as const,
        height: 300,
      },
      labels: Object.keys(displayStats.categoryDistribution).map(cat => 
        categoryOptions.find(opt => opt.value === cat)?.label || cat
      ),
      colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#6c757d'],
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const performanceChart = {
    series: [{
      name: 'Total Requests',
      data: filteredServices.map(service => service.total_requests),
    }, {
      name: 'Completed',
      data: filteredServices.map(service => service.completed_requests),
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 320,
        toolbar: {
          show: false,
        },
        parentHeightOffset: 0,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: filteredServices.map(service => service.name.length > 15 ? service.name.substring(0, 15) + '...' : service.name),
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        min: 0,
        max: 2000,
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      colors: ['#007bff', '#28a745'],
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'left' as const,
        fontSize: '13px',
        markers: {
          size: 6,
          strokeWidth: 0,
        },
      },
      grid: {
        borderColor: '#f1f3f4',
        strokeDashArray: 3,
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + ' requests';
          },
        },
      },
    },
  };

    // Form submission handlers
  const onSubmit = async (data: CommunityServiceFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Service data submitted:', data);
      setShowSuccess(true);
      setShowCreateModal(false);
      setShowEditModal(false);
      reset();
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: CommunityService) => {
    setSelectedService(service);
    reset({
      name: service.name,
      description: service.description,
      category: service.category,
      communityId: service.communityId,
      serviceType: service.serviceType,
      availability: service.availability,
      status: service.status,
      pricingType: service.pricing.type,
      pricingAmount: service.pricing.amount,
      primaryContact: service.contactInfo.primaryContact,
      phone: service.contactInfo.phone,
      email: service.contactInfo.email,
      emergencyPhone: service.contactInfo.emergencyPhone,
      vendorName: service.vendor?.name,
      vendorPhone: service.vendor?.phone,
      vendorEmail: service.vendor?.email,
      vendorAddress: service.vendor?.address,
      requirements: service.requirements,
      terms: service.terms,
      features: service.features,
      responseTime: service.responseTime,
      maxRequests: service.capacity.maxRequests,
      isBookingRequired: service.isBookingRequired,
      advanceBookingHours: service.advanceBookingHours,
      cancelationPolicy: service.cancelationPolicy,
      operatingHours: service.operatingHours,
    });
    setShowEditModal(true);
  };

  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Service deleted:', selectedService.id);
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
      maintenance: { variant: 'warning', text: 'Maintenance' },
      coming_soon: { variant: 'info', text: 'Coming Soon' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getServiceTypeBadge = (type: string) => {
    const typeConfig = {
      internal: { variant: 'primary', text: 'Internal' },
      external: { variant: 'info', text: 'External' },
      vendor_managed: { variant: 'warning', text: 'Vendor' },
      self_service: { variant: 'secondary', text: 'Self Service' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: 'secondary', text: type };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getPricingBadge = (pricing: { type: string; amount?: number; currency: string }) => {
    if (pricing.type === 'free') {
      return <Badge bg="success">Free</Badge>;
    }
    return <Badge bg="warning">${pricing.amount}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      maintenance: 'ri:tools-line',
      housekeeping: 'ri:broom-line',
      security: 'ri:shield-line',
      delivery: 'ri:truck-line',
      utilities: 'ri:water-flash-line',
      emergency: 'ri:alarm-warning-line',
      lifestyle: 'ri:user-smile-line',
      healthcare: 'ri:heart-pulse-line',
    };
    
    return iconMap[category as keyof typeof iconMap] || 'ri:service-line';
  };

  const serviceType = watch('serviceType');
  const pricingType = watch('pricingType');

  return (
    <>
      <PageTitle 
        title="Services Management" 
        subMenuItems={[
          { label: 'Settings', path: '/settings' },
          { label: 'Communities', path: '/settings/communities' },
          { label: 'Services Management', path: '/settings/communities/services', active: true }
        ]}
      />

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          Service information has been saved successfully!
        </Alert>
      )}

      {servicesError && (
        <Alert variant="danger" className="mb-4">
          <IconifyIcon icon="ri:error-warning-line" className="me-2" />
          Error loading services: {servicesError.message}
        </Alert>
      )}

      {servicesLoading && (
        <Alert variant="info" className="mb-4">
          <IconifyIcon icon="ri:loader-4-line" className="me-2" />
          Loading services data...
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-4">
        <Tab eventKey="overview" title={
          <span><IconifyIcon icon="ri:dashboard-line" className="me-2" />Overview</span>
        }>
          {/* Enhanced Key Metrics Row */}
          <Row className="mb-4">
            <Col xl={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <IconifyIcon icon="ri:service-line" className="text-primary" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Total Services</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.totalServices}</h3>
                      <small className="text-muted">Across all communities</small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-primary bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:arrow-up-line" className="text-primary" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xl={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-success bg-opacity-10 rounded-circle p-3">
                        <IconifyIcon icon="ri:check-line" className="text-success" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Active Services</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.activeServices}</h3>
                      <small className="text-success">
                        <IconifyIcon icon="ri:check-line" className="me-1" />
                        {displayStats.totalServices > 0 ? ((displayStats.activeServices / displayStats.totalServices) * 100).toFixed(1) : 0}% active
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-success bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:checkbox-circle-line" className="text-success" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xl={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3">
                        <IconifyIcon icon="ri:file-list-line" className="text-info" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Total Requests</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.totalRequests}</h3>
                      <small className="text-info">
                        <IconifyIcon icon="ri:file-text-line" className="me-1" />
                        Service bookings
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-info bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:task-line" className="text-info" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xl={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                        <IconifyIcon icon="ri:money-rupee-circle-line" className="text-warning" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Monthly Revenue</h6>
                      <h3 className="mb-0 fw-bold">₹{displayStats.totalRevenue.toLocaleString()}</h3>
                      <small className="text-warning">
                        <IconifyIcon icon="ri:coins-line" className="me-1" />
                        From paid services
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-warning bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:money-dollar-circle-line" className="text-warning" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>


          {/* Community-wise Overview */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-bottom-0 pb-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0 fw-semibold">Community-wise Services Overview</h5>
                    <div className="bg-success bg-opacity-10 rounded-circle p-2">
                      <IconifyIcon icon="ri:community-line" className="text-success" />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="pt-2">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 fw-semibold">Community</th>
                          <th className="border-0 fw-semibold text-center">Total Services</th>
                          <th className="border-0 fw-semibold text-center">Active</th>
                          <th className="border-0 fw-semibold text-center">Total Requests</th>
                          <th className="border-0 fw-semibold text-center">Monthly Revenue</th>
                          <th className="border-0 fw-semibold text-center">Avg. Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCommunities.map(community => {
                          const communityServices = services.filter(service => service.community_id === community.id);
                          const activeServices = communityServices.filter(service => service.status === 'active').length;
                          const totalRequests = communityServices.reduce((sum, service) => sum + service.total_requests, 0);
                          const totalRevenue = communityServices.reduce((sum, service) => sum + service.monthly_revenue, 0);
                          const avgRating = communityServices.length > 0 
                            ? communityServices.reduce((sum, service) => sum + service.avg_rating, 0) / communityServices.length 
                            : 0;

                          return (
                            <tr key={community.id}>
                              <td className="border-0">
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                    <IconifyIcon icon="ri:building-line" className="text-primary" />
                                  </div>
                                  <div>
                                    <h6 className="mb-0 fw-medium">{community.name}</h6>
                                    <small className="text-muted">{community.address}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="border-0 text-center">
                                <span className="fw-medium">{communityServices.length}</span>
                              </td>
                              <td className="border-0 text-center">
                                <Badge bg="success" className="px-2 py-1">{activeServices}</Badge>
                              </td>
                              <td className="border-0 text-center">
                                <span className="fw-medium">{totalRequests.toLocaleString()}</span>
                              </td>
                              <td className="border-0 text-center">
                                <span className="fw-medium">₹{totalRevenue.toLocaleString()}</span>
                              </td>
                              <td className="border-0 text-center">
                                <div className="d-flex align-items-center justify-content-center">
                                  <IconifyIcon icon="ri:star-fill" className="text-warning me-1" />
                                  <span className="fw-medium">{avgRating.toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                  
                  {/* Overview Table Pagination */}
                  {overviewTotalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <span className="text-muted small">
                        Showing {overviewStartIndex + 1}-{Math.min(overviewEndIndex, overviewTotalItems)} of {overviewTotalItems} communities
                      </span>
                      <Pagination className="mb-0">
                        <Pagination.First
                          onClick={() => setOverviewCurrentPage(1)}
                          disabled={overviewCurrentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => setOverviewCurrentPage(overviewCurrentPage - 1)}
                          disabled={overviewCurrentPage === 1}
                        />
                        {[...Array(overviewTotalPages)].map((_, index) => {
                          const page = index + 1;
                          const showPage = page === 1 || 
                                         page === overviewTotalPages || 
                                         Math.abs(page - overviewCurrentPage) <= 1;
                          
                          if (!showPage) {
                            if (page === 2 && overviewCurrentPage > 4) {
                              return <Pagination.Ellipsis key={page} />;
                            }
                            if (page === overviewTotalPages - 1 && overviewCurrentPage < overviewTotalPages - 3) {
                              return <Pagination.Ellipsis key={page} />;
                            }
                            return null;
                          }
                          
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === overviewCurrentPage}
                              onClick={() => setOverviewCurrentPage(page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                        <Pagination.Next
                          onClick={() => setOverviewCurrentPage(overviewCurrentPage + 1)}
                          disabled={overviewCurrentPage === overviewTotalPages}
                        />
                        <Pagination.Last
                          onClick={() => setOverviewCurrentPage(overviewTotalPages)}
                          disabled={overviewCurrentPage === overviewTotalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row>
            <Col lg={12}>
              <Card className="border-0 shadow-sm bg-gradient-primary-subtle">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="mb-1 fw-semibold">Quick Actions</h5>
                      <p className="text-muted mb-0">Manage your services efficiently</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setActiveTab('list')}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View All Services
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Add New Service
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="list" title={
          <span><IconifyIcon icon="ri:list-check" className="me-2" />Services List</span>
        }>
          <ComponentContainerCard title="Services Management">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <InputGroup style={{ width: '300px' }}>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:building-line" className="me-1" />
                    Community: {filterCommunity === 'all' ? 'All' : communityOptions.find(c => c.value === filterCommunity)?.label}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterCommunity('all')}>All Communities</Dropdown.Item>
                    {communityOptions.map(community => (
                      <Dropdown.Item key={community.value} onClick={() => setFilterCommunity(community.value)}>
                        {community.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:filter-line" className="me-1" />
                    Category: {filterCategory === 'all' ? 'All' : categoryOptions.find(c => c.value === filterCategory)?.label}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterCategory('all')}>All Categories</Dropdown.Item>
                    {categoryOptions.map(category => (
                      <Dropdown.Item key={category.value} onClick={() => setFilterCategory(category.value)}>
                        {category.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:toggle-line" className="me-1" />
                    Status: {filterStatus === 'all' ? 'All' : statusOptions.find(s => s.value === filterStatus)?.label}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterStatus('all')}>All Status</Dropdown.Item>
                    {statusOptions.map(status => (
                      <Dropdown.Item key={status.value} onClick={() => setFilterStatus(status.value)}>
                        {status.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <IconifyIcon icon="ri:list-unordered" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <IconifyIcon icon="ri:grid-fill" />
                </Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Service
                </Button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Community</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Pricing</th>
                      <th>Status</th>
                      <th>Performance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServices.length === 0 && !servicesLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="text-muted">
                            <IconifyIcon icon="ri:service-line" size="48" className="mb-3" />
                            <p>No services found</p>
                            <small>Services count: {services.length}</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedServices.map((service) => (
                      <tr key={service.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 me-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <IconifyIcon icon={getCategoryIcon(service.category)} className="text-primary" />
                              </div>
                            </div>
                            <div>
                              <strong>{service.name}</strong>
                              <br />
                              <small className="text-muted">{service.contact_info?.primaryContact || service.contact_person}</small>
                            </div>
                          </div>
                        </td>
                        <td>{service.community_name}</td>
                        <td>
                          <Badge bg="secondary">
                            {categoryOptions.find(c => c.value === service.category)?.label}
                          </Badge>
                        </td>
                        <td>{getServiceTypeBadge(service.service_type)}</td>
                        <td>{getPricingBadge({type: service.pricing?.type || 'free', amount: service.pricing?.amount, currency: 'INR'})}</td>
                        <td>{getStatusBadge(service.status)}</td>
                        <td>
                          <div>
                            <small>{service.completed_requests}/{service.total_requests} requests</small><br />
                            <small className="text-muted">⭐ {service.avg_rating}/5</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <IconifyIcon icon="ri:edit-line" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(service)}
                            >
                              <IconifyIcon icon="ri:delete-bin-line" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Row>
                {paginatedServices.map((service) => (
                  <Col lg={4} md={6} key={service.id} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <IconifyIcon icon={getCategoryIcon(service.category)} className="text-primary" />
                            </div>
                            <div>
                              <h5 className="mb-1">{service.name}</h5>
                              <p className="text-muted mb-0 small">{service.contact_info?.primaryContact || service.contact_person}</p>
                            </div>
                          </div>
                          <div className="text-end">
                            {getStatusBadge(service.status)}
                          </div>
                        </div>

                        <p className="text-muted small mb-3">{service.description}</p>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Community:</span>
                            <small>{service.community_name}</small>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Category:</span>
                            <Badge bg="secondary" className="small">
                              {categoryOptions.find(c => c.value === service.category)?.label}
                            </Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Type:</span>
                            {getServiceTypeBadge(service.service_type)}
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Pricing:</span>
                            {getPricingBadge({type: service.pricing?.type || 'free', amount: service.pricing?.amount, currency: 'INR'})}
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Response Time:</span>
                            <small>{service.response_time} min</small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted small">Requests:</span>
                            <small>{service.completed_requests}/{service.total_requests}</small>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted small">Rating:</span>
                            <small>⭐ {service.avg_rating}/5</small>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Revenue:</span>
                            <small>₹{service.monthly_revenue.toLocaleString()}</small>
                          </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <IconifyIcon icon="ri:edit-line" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(service)}
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
            
            {/* Pagination Controls */}
            {services.length > 0 && (
              <Row className="mt-4">
                <Col lg={6}>
                  <div className="d-flex align-items-center">
                    <span className="text-muted me-3">
                      Showing {startIndex + 1} to {Math.min(endIndex, services.length)} of {services.length} services
                    </span>
                    <Form.Select 
                      size="sm" 
                      style={{ width: 'auto' }}
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={3}>3 per page</option>
                      <option value={6}>6 per page</option>
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                    </Form.Select>
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="d-flex justify-content-end">
                    <Pagination size="sm">
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      />
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = page === 1 || 
                                       page === totalPages || 
                                       Math.abs(page - currentPage) <= 1;
                        
                        if (!showPage) {
                          // Show ellipsis for gaps
                          if (page === 2 && currentPage > 4) {
                            return <Pagination.Ellipsis key={page} />;
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 3) {
                            return <Pagination.Ellipsis key={page} />;
                          }
                          return null;
                        }
                        
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                </Col>
              </Row>
            )}
          </ComponentContainerCard>
        </Tab>

        <Tab eventKey="analytics" title={
          <span><IconifyIcon icon="ri:bar-chart-line" className="me-2" />Analytics</span>
        }>
          <ComponentContainerCard title="Services Analytics">
            {/* Top Row - Service Categories & Performance Trends */}
            <Row className="mb-4">
              <Col lg={4} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Service Categories</h5>
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <IconifyIcon icon="ri:pie-chart-line" className="text-primary" />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="pt-2">
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'donut',
                          height: 280,
                          toolbar: { show: false }
                        },
                        colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
                        labels: ['Maintenance', 'Cleaning', 'Security', 'Utilities', 'Other'],
                        dataLabels: {
                          enabled: true,
                          formatter: function (val: string) {
                            return val + "%"
                          }
                        },
                        legend: {
                          position: 'bottom',
                          fontSize: '14px'
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '70%'
                            }
                          }
                        }
                      }}
                      series={[35, 25, 20, 15, 5]}
                      type="donut"
                      height={280}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={8} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Monthly Service Requests</h5>
                      <div className="bg-success bg-opacity-10 rounded-circle p-2">
                        <IconifyIcon icon="ri:line-chart-line" className="text-success" />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="pt-2">
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'line',
                          height: 320,
                          toolbar: { show: false }
                        },
                        stroke: {
                          curve: 'smooth',
                          width: 3
                        },
                        colors: ['#28a745', '#007bff', '#ffc107'],
                        xaxis: {
                          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        },
                        yaxis: {
                          title: { text: 'Requests' }
                        },
                        dataLabels: { enabled: false },
                        legend: { position: 'top' },
                        grid: { borderColor: '#f1f1f1' }
                      }}
                      series={[{
                        name: 'Maintenance',
                        data: [45, 52, 38, 65, 72, 58, 68, 75, 82, 69, 78, 85]
                      }, {
                        name: 'Cleaning',
                        data: [25, 32, 28, 35, 42, 38, 45, 52, 48, 55, 62, 68]
                      }, {
                        name: 'Security',
                        data: [15, 18, 22, 28, 32, 25, 35, 42, 38, 45, 48, 52]
                      }]}
                      type="line"
                      height={320}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Second Row - Community Service Performance */}
            <Row className="mb-4">
              <Col lg={12} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Community Service Performance</h5>
                      <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                        <IconifyIcon icon="ri:community-line" className="text-danger" />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="pt-2">
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'bar',
                          height: 350,
                          toolbar: { show: false }
                        },
                        colors: ['#007bff', '#28a745', '#ffc107'],
                        xaxis: {
                          categories: (communities || []).slice(0, 8).map((community: any) => community.name.length > 15 ? community.name.substring(0, 15) + '...' : community.name)
                        },
                        yaxis: {
                          title: { text: 'Count' }
                        },
                        dataLabels: { enabled: false },
                        plotOptions: {
                          bar: {
                            borderRadius: 4
                          }
                        },
                        legend: { position: 'top' },
                        grid: { borderColor: '#f1f1f1' }
                      }}
                      series={[{
                        name: 'Total Services',
                        data: (communities || []).slice(0, 8).map((community: any) =>
                          (services || []).filter((service: any) => service.community_id === community.id).length
                        )
                      }, {
                        name: 'Active Services',
                        data: (communities || []).slice(0, 8).map((community: any) =>
                          (services || []).filter((service: any) => service.community_id === community.id && service.status === 'active').length
                        )
                      }, {
                        name: 'Paid Services',
                        data: (communities || []).slice(0, 8).map((community: any) =>
                          (services || []).filter((service: any) => service.community_id === community.id && service.pricing_type === 'paid').length
                        )
                      }]}
                      type="bar"
                      height={350}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </ComponentContainerCard>
        </Tab>
      </Tabs>

      {/* Create Service Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:add-line" className="me-2" />
            Add New Service
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Service Name"
                      placeholder="e.g., Plumbing Services"
                      error={errors.name?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="communityId"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Community"
                      options={[
                        { value: '', label: 'Select Community' },
                        ...communityOptions
                      ]}
                      error={errors.communityId?.message}
                    />
                  )}
                />
              </Col>
              <Col md={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextAreaFormInput
                      {...field}
                      label="Description"
                      placeholder="Describe the service..."
                      rows={3}
                      error={errors.description?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Category"
                      options={[
                        { value: '', label: 'Select Category' },
                        ...categoryOptions
                      ]}
                      error={errors.category?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="serviceType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Service Type"
                      options={[
                        { value: '', label: 'Select Type' },
                        ...serviceTypeOptions
                      ]}
                      error={errors.serviceType?.message}
                    />
                  )}
                />
              </Col>
              {/* Add more form fields as needed */}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Create Service
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <IconifyIcon icon="ri:delete-bin-line" className="me-2" />
            Delete Service
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <IconifyIcon icon="ri:alert-line" className="me-2" />
            Are you sure you want to delete service <strong>{selectedService?.name}</strong>?
            This action cannot be undone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Delete Service
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ServicesManagementPage;
