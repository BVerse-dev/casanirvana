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
  useListAmenities, 
  useCreateAmenity, 
  useUpdateAmenity, 
  useDeleteAmenity,
  useAmenitiesStats,
  useAmenitiesRealtime,
  type Amenity,
  type AmenityFormData
} from '@/hooks/useAmenities';
import { useCommunityProfiles } from '@/hooks/useCommunityProfiles';

// Form validation schema
const amenitySchema = yup.object({
  name: yup.string().required('Amenity name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  communityId: yup.string().required('Community is required'),
  type: yup.string().required('Type is required'),
  location: yup.string().required('Location is required'),
  capacity: yup.number().min(1, 'Capacity must be positive').optional(),
  status: yup.string().required('Status is required'),
  bookingRequired: yup.boolean().optional(),
  advanceBookingDays: yup.number().min(0, 'Advance booking days must be positive').required('Advance booking days is required'),
  maxBookingDuration: yup.number().min(1, 'Max booking duration must be positive').required('Max booking duration is required'),
  chargesPerHour: yup.number().when('type', {
    is: 'paid',
    then: (schema) => schema.min(0, 'Charges must be positive').required('Charges per hour is required'),
    otherwise: (schema) => schema.optional(),
  }),
  monthlyCharges: yup.number().when('type', {
    is: 'subscription',
    then: (schema) => schema.min(0, 'Monthly charges must be positive').required('Monthly charges is required'),
    otherwise: (schema) => schema.optional(),
  }),
  securityDeposit: yup.number().min(0, 'Security deposit must be positive').optional(),
  contactPerson: yup.string().optional(),
  contactPhone: yup.string().optional(),
  maintenanceFrequency: yup.string().required('Maintenance frequency is required'),
  lastMaintenance: yup.string().required('Last maintenance date is required'),
});

const AmenitiesManagementPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommunity, setFilterCommunity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [overviewCurrentPage, setOverviewCurrentPage] = useState(1);
  const [overviewItemsPerPage, setOverviewItemsPerPage] = useState(5);

  // Real data hooks
  const { data: amenities = [], isLoading, error } = useListAmenities();
  const { data: communities = [] } = useCommunityProfiles();
  const { data: stats } = useAmenitiesStats();
  const createAmenityMutation = useCreateAmenity();
  const updateAmenityMutation = useUpdateAmenity();
  const deleteAmenityMutation = useDeleteAmenity();
  
  // Real-time updates
  useAmenitiesRealtime();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<AmenityFormData>({
    resolver: yupResolver(amenitySchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'recreation',
      communityId: '',
      type: 'free',
      location: '',
      status: 'active',
      bookingRequired: false,
      advanceBookingDays: 1,
      maxBookingDuration: 2,
      rules: [],
      amenityFeatures: [],
      maintenanceFrequency: 'weekly',
      lastMaintenance: '',
      operatingHours: {
        open: '06:00',
        close: '22:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
    }
  });

  // Transform communities data for dropdown options
  const communityOptions = communities.map((community: any) => ({
    value: community.id,
    label: community.name
  }));

  const categoryOptions = [
    { value: 'recreation', label: 'Recreation' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'utility', label: 'Utility' },
    { value: 'security', label: 'Security' },
    { value: 'convenience', label: 'Convenience' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'community', label: 'Community' },
  ];

  const typeOptions = [
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid (Per Hour)' },
    { value: 'subscription', label: 'Monthly Subscription' },
    { value: 'booking_required', label: 'Booking Required (Free)' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'coming_soon', label: 'Coming Soon' },
  ];

  const maintenanceFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  // Statistics calculations using real data
  const displayStats = stats || {
    totalAmenities: 0,
    activeAmenities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    categoryDistribution: {},
    typeDistribution: {}
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
      colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997'],
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const usageChart = {
    series: [{
      name: 'Total Bookings',
      data: amenities.map((amenity: any) => amenity.total_bookings || 0),
    }, {
      name: 'Monthly Revenue (GH₵K)',
      data: amenities.map((amenity: any) => (amenity.monthly_revenue || 0) / 1000), // Scale down for chart
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350,
      },
      xaxis: {
        categories: amenities.map((amenity: any) => amenity.name),
      },
      colors: ['#007bff', '#28a745'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 1,
      },
    },
  };

  // Filter functions using real data
  const filteredAmenities = amenities.filter((amenity: any) => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amenity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amenity.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCommunity = filterCommunity === 'all' || amenity.community_id === filterCommunity;
    const matchesCategory = filterCategory === 'all' || amenity.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || amenity.status === filterStatus;
    
    return matchesSearch && matchesCommunity && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredAmenities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAmenities = filteredAmenities.slice(startIndex, endIndex);

  // Overview table pagination logic
  const overviewTotalItems = communities.length;
  const overviewTotalPages = Math.ceil(overviewTotalItems / overviewItemsPerPage);
  const overviewStartIndex = (overviewCurrentPage - 1) * overviewItemsPerPage;
  const overviewEndIndex = overviewStartIndex + overviewItemsPerPage;
  const paginatedCommunities = communities.slice(overviewStartIndex, overviewEndIndex);

  // Reset page when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Page size options
  const pageSizeOptions = [
    { value: 6, label: '6 per page' },
    { value: 12, label: '12 per page' },
    { value: 18, label: '18 per page' },
    { value: 24, label: '24 per page' },
    { value: 30, label: '30 per page' }
  ];

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchTerm, filterCommunity, filterCategory, filterStatus]);

  const onSubmit = async (data: AmenityFormData) => {
    try {
      if (selectedAmenity) {
        // Update existing amenity
        await updateAmenityMutation.mutateAsync({ id: selectedAmenity.id, ...data });
        setShowEditModal(false);
      } else {
        // Create new amenity
        await createAmenityMutation.mutateAsync(data);
        setShowCreateModal(false);
      }
      
      setShowSuccess(true);
      reset();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (amenity: any) => {
    setSelectedAmenity(amenity);
    reset({
      name: amenity.name,
      description: amenity.description,
      category: amenity.category,
      communityId: amenity.community_id,
      type: amenity.type,
      location: amenity.location,
      capacity: amenity.capacity,
      status: amenity.status,
      bookingRequired: amenity.booking_required,
      advanceBookingDays: amenity.advance_booking_days,
      maxBookingDuration: amenity.max_booking_duration,
      chargesPerHour: amenity.charges_per_hour,
      monthlyCharges: amenity.monthly_charges,
      securityDeposit: amenity.security_deposit,
      rules: amenity.rules ? [amenity.rules] : [],
      amenityFeatures: amenity.amenity_features || [],
      contactPerson: amenity.contact_person,
      contactPhone: amenity.contact_phone,
      maintenanceFrequency: amenity.maintenance_frequency,
      lastMaintenance: amenity.last_maintenance,
      operatingHours: amenity.operating_hours,
    });
    setShowEditModal(true);
  };

  const handleDelete = (amenity: any) => {
    setSelectedAmenity(amenity);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAmenity) return;
    
    try {
      await deleteAmenityMutation.mutateAsync(selectedAmenity.id);
      setShowDeleteModal(false);
      setSelectedAmenity(null);
    } catch (error) {
      console.error('Error deleting amenity:', error);
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      free: { variant: 'success', text: 'Free' },
      paid: { variant: 'warning', text: 'Paid' },
      subscription: { variant: 'info', text: 'Subscription' },
      booking_required: { variant: 'primary', text: 'Booking Required' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: 'secondary', text: type };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      recreation: 'ri:gamepad-line',
      fitness: 'ri:run-line',
      utility: 'ri:tools-line',
      security: 'ri:shield-line',
      convenience: 'ri:store-line',
      outdoor: 'ri:tree-line',
      community: 'ri:community-line',
    };
    
    return iconMap[category as keyof typeof iconMap] || 'ri:building-line';
  };

  const amenityType = watch('type');

  return (
    <>
      <PageTitle 
        title="Amenities & Facilities" 
        subMenuItems={[
          { label: 'Settings', path: '/settings' },
          { label: 'Communities', path: '/settings/communities' },
          { label: 'Amenities & Facilities', path: '/settings/communities/amenities', active: true }
        ]}
      />

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          Amenity information has been saved successfully!
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-4">
        <Tab eventKey="overview" title={
          <span><IconifyIcon icon="ri:dashboard-line" className="me-2" />Overview</span>
        }>
          {/* Key Metrics Row */}
          <Row className="mb-4">
            <Col xl={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 overflow-hidden position-relative">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <IconifyIcon icon="ri:community-line" className="text-primary" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Total Amenities</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.totalAmenities}</h3>
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
                      <h6 className="mb-1 text-muted fw-medium">Active Amenities</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.activeAmenities}</h3>
                      <small className="text-success">
                        <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                        {displayStats.totalAmenities > 0 ? ((displayStats.activeAmenities / displayStats.totalAmenities) * 100).toFixed(1) : 0}% active
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-success bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:check-line" className="text-success" />
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
                        <IconifyIcon icon="ri:calendar-check-line" className="text-info" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Total Bookings</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.totalBookings}</h3>
                      <small className="text-info">
                        <IconifyIcon icon="ri:calendar-line" className="me-1" />
                        This month
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-info bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:bookmark-line" className="text-info" />
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
                        <IconifyIcon icon="ri:money-dollar-circle-line" className="text-warning" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Monthly Revenue</h6>
                      <h3 className="mb-0 fw-bold">GH₵ {displayStats.totalRevenue.toLocaleString()}</h3>
                      <small className="text-warning">
                        <IconifyIcon icon="ri:coins-line" className="me-1" />
                        From paid amenities
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
                    <h5 className="mb-0 fw-semibold">Community-wise Amenities Overview</h5>
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
                          <th className="border-0 fw-semibold text-center">Total Amenities</th>
                          <th className="border-0 fw-semibold text-center">Active</th>
                          <th className="border-0 fw-semibold text-center">Paid</th>
                          <th className="border-0 fw-semibold text-center">Total Bookings</th>
                          <th className="border-0 fw-semibold text-center">Monthly Revenue</th>
                          <th className="border-0 fw-semibold text-center">Avg. Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCommunities.map((community: any) => {
                          const communityAmenities = amenities.filter((amenity: any) => amenity.community_id === community.id);
                          const activeAmenities = communityAmenities.filter((amenity: any) => amenity.status === 'active').length;
                          const paidAmenities = communityAmenities.filter((amenity: any) => amenity.type === 'paid').length;
                          const totalBookings = communityAmenities.reduce((sum: number, amenity: any) => sum + amenity.total_bookings, 0);
                          const totalRevenue = communityAmenities.reduce((sum: number, amenity: any) => sum + amenity.monthly_revenue, 0);
                          const avgRating = communityAmenities.length > 0 
                            ? communityAmenities.reduce((sum: number, amenity: any) => sum + amenity.average_rating, 0) / communityAmenities.length
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
                                <span className="fw-medium">{communityAmenities.length}</span>
                              </td>
                              <td className="border-0 text-center">
                                <Badge bg="success" className="px-2 py-1">{activeAmenities}</Badge>
                              </td>
                              <td className="border-0 text-center">
                                <Badge bg="warning" className="px-2 py-1">{paidAmenities}</Badge>
                              </td>
                              <td className="border-0 text-center">
                                <span className="fw-medium">{totalBookings}</span>
                              </td>
                              <td className="border-0 text-center">
                                <span className="fw-medium">GH₵ {totalRevenue.toLocaleString()}</span>
                              </td>
                              <td className="border-0 text-center">
                                <div className="d-flex align-items-center justify-content-center">
                                  <span className="me-1">⭐</span>
                                  <span className="fw-medium">{avgRating.toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {overviewTotalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
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
                        
                        {/* Page numbers */}
                        {Array.from({ length: overviewTotalPages }, (_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === overviewTotalPages ||
                            (pageNum >= overviewCurrentPage - 1 && pageNum <= overviewCurrentPage + 1)
                          ) {
                            return (
                              <Pagination.Item
                                key={pageNum}
                                active={pageNum === overviewCurrentPage}
                                onClick={() => setOverviewCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Pagination.Item>
                            );
                          } else if (
                            pageNum === overviewCurrentPage - 2 ||
                            pageNum === overviewCurrentPage + 2
                          ) {
                            return <Pagination.Ellipsis key={pageNum} />;
                          }
                          return null;
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
                      <p className="text-muted mb-0">Manage your amenities efficiently</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setActiveTab('list')}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View All Amenities
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Add New Amenity
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="list" title={
          <span><IconifyIcon icon="ri:list-check" className="me-2" />Amenities List</span>
        }>
          <ComponentContainerCard title="Amenities & Facilities Management" id="amenities-management">
            {isLoading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading amenities...</p>
              </div>
            )}
            
            {error && (
              <Alert variant="danger">
                <strong>Error loading amenities:</strong> {error.message}
              </Alert>
            )}
            
            {!isLoading && !error && amenities.length === 0 && (
              <Alert variant="info">
                <strong>No amenities found.</strong> Click &quot;Add Amenity&quot; to create your first amenity.
              </Alert>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <InputGroup style={{ width: '300px' }}>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search amenities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:building-line" className="me-1" />
                    Community: {filterCommunity === 'all' ? 'All' : communityOptions.find((s: any) => s.value === filterCommunity)?.label}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterCommunity('all')}>All Communities</Dropdown.Item>
                    {communityOptions.map((community: any) => (
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
                  Add Amenity
                </Button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Amenity</th>
                      <th>Community</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Usage</th>
                      <th>Revenue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAmenities.map((amenity) => (
                      <tr key={amenity.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 me-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <IconifyIcon icon={getCategoryIcon(amenity.category)} className="text-primary" />
                              </div>
                            </div>
                            <div>
                              <strong>{amenity.name}</strong>
                              <br />
                              <small className="text-muted">{amenity.location}</small>
                            </div>
                          </div>
                        </td>
                        <td>{amenity.communityName}</td>
                        <td>
                          <Badge bg="secondary">
                            {categoryOptions.find(c => c.value === amenity.category)?.label}
                          </Badge>
                        </td>
                        <td>{getTypeBadge(amenity.type)}</td>
                        <td>{getStatusBadge(amenity.status)}</td>
                        <td>
                          <div>
                                                    <small>{amenity.total_bookings} bookings</small><br />
                        <small className="text-muted">⭐ {amenity.average_rating}/5</small>
                          </div>
                        </td>
                                                  <td>GH₵ {amenity.monthly_revenue.toLocaleString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(amenity)}
                            >
                              <IconifyIcon icon="ri:edit-line" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(amenity)}
                            >
                              <IconifyIcon icon="ri:delete-bin-line" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Row>
                {paginatedAmenities.map((amenity) => (
                  <Col lg={4} md={6} key={amenity.id} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <IconifyIcon icon={getCategoryIcon(amenity.category)} className="text-primary" />
                            </div>
                            <div>
                              <h5 className="mb-1">{amenity.name}</h5>
                              <p className="text-muted mb-0 small">{amenity.location}</p>
                            </div>
                          </div>
                          <div className="text-end">
                            {getStatusBadge(amenity.status)}
                          </div>
                        </div>

                        <p className="text-muted small mb-3">{amenity.description}</p>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Community:</span>
                            <small>{amenity.communityName}</small>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Category:</span>
                            <Badge bg="secondary" className="small">
                              {categoryOptions.find(c => c.value === amenity.category)?.label}
                            </Badge>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Type:</span>
                            {getTypeBadge(amenity.type)}
                          </div>
                          {amenity.capacity && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">Capacity:</span>
                              <small>{amenity.capacity} persons</small>
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted small">Bookings:</span>
                                                          <small>{amenity.total_bookings}</small>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted small">Revenue:</span>
                                                          <small>GH₵ {amenity.monthly_revenue.toLocaleString()}</small>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Rating:</span>
                                                          <small>⭐ {amenity.average_rating}/5</small>
                          </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(amenity)}
                          >
                            <IconifyIcon icon="ri:edit-line" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(amenity)}
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
            {totalItems > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} amenities
                  </span>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      {itemsPerPage} per page
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {pageSizeOptions.map(option => (
                        <Dropdown.Item 
                          key={option.value} 
                          onClick={() => {
                            setItemsPerPage(option.value);
                            setCurrentPage(1);
                          }}
                        >
                          {option.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {totalPages > 1 && (
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <Pagination.Ellipsis key={pageNum} />;
                      }
                      return null;
                    })}

                    <Pagination.Next
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                )}
              </div>
            )}
          </ComponentContainerCard>
        </Tab>

        <Tab eventKey="analytics" title={
          <span><IconifyIcon icon="ri:bar-chart-line" className="me-2" />Analytics</span>
        }>
          <ComponentContainerCard title="Amenities Analytics">
            {/* Top Row - Category Distribution & Revenue Trends */}
            <Row className="mb-4">
              <Col lg={4} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Category Distribution</h5>
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <IconifyIcon icon="ri:pie-chart-line" className="text-primary" />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="pt-2">
                    <ReactApexChart
                      options={categoryChart.options}
                      series={categoryChart.series}
                      type="donut"
                      height={250}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={8} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Monthly Revenue Trends</h5>
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
                          height: 280,
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
                          title: { text: 'Revenue (GH₵K)' }
                        },
                        dataLabels: { enabled: false },
                        legend: { position: 'top' },
                        grid: { borderColor: '#f1f1f1' }
                      }}
                      series={[{
                        name: 'Paid Amenities',
                        data: [45, 52, 38, 65, 72, 58, 68, 75, 82, 69, 78, 85]
                      }, {
                        name: 'Subscription',
                        data: [25, 32, 28, 35, 42, 38, 45, 52, 48, 55, 62, 68]
                      }, {
                        name: 'Booking Fees',
                        data: [15, 18, 22, 28, 32, 25, 35, 42, 38, 45, 48, 52]
                      }]}
                      type="line"
                      height={280}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>


            {/* Third Row - Community Performance */}
            <Row className="mb-4">
              <Col lg={12} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Community Amenity Performance</h5>
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
                          categories: communities.slice(0, 8).map((community: any) => community.name.length > 15 ? community.name.substring(0, 15) + '...' : community.name)
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
                        name: 'Total Amenities',
                        data: communities.slice(0, 8).map((community: any) => 
                          amenities.filter((amenity: any) => amenity.community_id === community.id).length
                        )
                      }, {
                        name: 'Active Amenities',
                        data: communities.slice(0, 8).map((community: any) => 
                          amenities.filter((amenity: any) => amenity.community_id === community.id && amenity.status === 'active').length
                        )
                      }, {
                        name: 'Paid Amenities',
                        data: communities.slice(0, 8).map((community: any) => 
                          amenities.filter((amenity: any) => amenity.community_id === community.id && amenity.type === 'paid').length
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

      {/* Create/Edit Modal would go here - Similar structure to units modal */}
      {/* For brevity, I'll add a simplified modal */}
      
      {/* Create Amenity Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:add-line" className="me-2" />
            Add New Amenity
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
                      label="Amenity Name"
                      placeholder="e.g., Swimming Pool"
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
                      placeholder="Describe the amenity..."
                      rows={3}
                      error={errors.description?.message}
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
            <Button variant="primary" type="submit" disabled={createAmenityMutation.isPending || updateAmenityMutation.isPending}>
              {(createAmenityMutation.isPending || updateAmenityMutation.isPending) ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Create Amenity
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
            Delete Amenity
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <IconifyIcon icon="ri:alert-line" className="me-2" />
            Are you sure you want to delete amenity <strong>{selectedAmenity?.name}</strong>?
            This action cannot be undone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteAmenityMutation.isPending}>
            {deleteAmenityMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Delete Amenity
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AmenitiesManagementPage;
