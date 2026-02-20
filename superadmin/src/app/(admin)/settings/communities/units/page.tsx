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
  useCommunityUnits, 
  useCommunityUnitStats,
  useCreateCommunityUnit, 
  useUpdateCommunityUnit, 
  useDeleteCommunityUnit,
  useCommunityUnitsRealtime,
  type CommunityUnit,
  type UnitFormData
} from '@/hooks/useCommunityUnits';
import { useCommunityProfiles } from '@/hooks/useCommunityProfiles';

// Using interfaces from hooks instead of local duplicates

// Form validation schema
const unitSchema = yup.object({
  unitNumber: yup.string().required('Unit number is required'),
  communityId: yup.string().required('Community is required'),
  blockNumber: yup.string().required('Block number is required'),
  floorNumber: yup.number().min(0, 'Floor number must be positive').required('Floor number is required'),
  unitType: yup.string().required('Unit type is required'),
  carpetArea: yup.number().min(0, 'Carpet area must be positive').required('Carpet area is required'),
  builtUpArea: yup.number().min(0, 'Built-up area must be positive').required('Built-up area is required'),
  superBuiltUpArea: yup.number().min(0, 'Super built-up area must be positive').required('Super built-up area is required'),
  balconies: yup.number().min(0, 'Balconies must be positive').required('Number of balconies is required'),
  bathrooms: yup.number().min(1, 'At least 1 bathroom required').required('Number of bathrooms is required'),
  bedrooms: yup.number().min(0, 'Bedrooms must be positive').required('Number of bedrooms is required'),
  status: yup.string().required('Status is required'),
  ownershipType: yup.string().required('Ownership type is required'),
  ownerName: yup.string().when('ownershipType', {
    is: (val: string) => val === 'owned' || val === 'rented',
    then: (schema) => schema.required('Owner name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  ownerPhone: yup.string().when('ownershipType', {
    is: (val: string) => val === 'owned' || val === 'rented',
    then: (schema) => schema.required('Owner phone is required'),
    otherwise: (schema) => schema.optional(),
  }),
  ownerEmail: yup.string().email('Invalid email').when('ownershipType', {
    is: (val: string) => val === 'owned' || val === 'rented',
    then: (schema) => schema.required('Owner email is required'),
    otherwise: (schema) => schema.optional(),
  }),
  tenantName: yup.string().when('ownershipType', {
    is: 'rented',
    then: (schema) => schema.required('Tenant name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  tenantPhone: yup.string().when('ownershipType', {
    is: 'rented',
    then: (schema) => schema.required('Tenant phone is required'),
    otherwise: (schema) => schema.optional(),
  }),
  tenantEmail: yup.string().email('Invalid email').when('ownershipType', {
    is: 'rented',
    then: (schema) => schema.required('Tenant email is required'),
    otherwise: (schema) => schema.optional(),
  }),
  monthlyRent: yup.number().when('ownershipType', {
    is: 'rented',
    then: (schema) => schema.min(0, 'Rent must be positive').required('Monthly rent is required'),
    otherwise: (schema) => schema.optional(),
  }),
  maintenanceCharges: yup.number().min(0, 'Maintenance charges must be positive').required('Maintenance charges is required'),
  securityDeposit: yup.number().min(0, 'Security deposit must be positive').optional(),
  furnishingStatus: yup.string().required('Furnishing status is required'),
  internetConnection: yup.boolean().optional(),
  cableConnection: yup.boolean().optional(),
  gasConnection: yup.boolean().optional(),
  notes: yup.string().optional(),
});

const UnitsManagementPage = () => {
  // Hook calls first
  const { data: units = [], isLoading, error } = useCommunityUnits();
  const { data: stats } = useCommunityUnitStats();
  const { data: communities = [] } = useCommunityProfiles();
  const createUnitMutation = useCreateCommunityUnit();
  const updateUnitMutation = useUpdateCommunityUnit();
  const deleteUnitMutation = useDeleteCommunityUnit();
  useCommunityUnitsRealtime();

  // State variables
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<CommunityUnit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommunity, setFilterCommunity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [overviewCurrentPage, setOverviewCurrentPage] = useState(1);
  const [overviewItemsPerPage, setOverviewItemsPerPage] = useState(5);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<UnitFormData>({
    resolver: yupResolver(unitSchema),
    defaultValues: {
      unitNumber: '',
      communityId: '',
      blockNumber: '',
      floorNumber: 0,
      unitType: '2bhk',
      carpetArea: 0,
      builtUpArea: 0,
      superBuiltUpArea: 0,
      balconies: 1,
      bathrooms: 1,
      bedrooms: 1,
      status: 'vacant',
      ownershipType: 'owned',
      maintenanceCharges: 0,
      parkingSlots: [],
      amenitiesIncluded: [],
      furnishingStatus: 'unfurnished',
      internetConnection: false,
      cableConnection: false,
      gasConnection: false,
    }
  });

  // Transform communities data for dropdown options
  const communityOptions = communities.map((community: any) => ({
    value: community.id,
    label: community.name
  }));

  // Mock data for backwards compatibility (to be removed)
  const mockUnits = [
    {
      id: '1',
      unitNumber: 'A-101',
      communityId: 'community-1',
      communityName: 'Green Valley Apartments',
      blockNumber: 'A',
      floorNumber: 1,
      unitType: '2bhk',
      carpetArea: 850,
      builtUpArea: 950,
      superBuiltUpArea: 1200,
      balconies: 2,
      bathrooms: 2,
      bedrooms: 2,
      status: 'occupied',
      ownershipType: 'owned',
      ownerName: 'John Smith',
      ownerPhone: '+91 9876543210',
      ownerEmail: 'john.smith@email.com',
      monthlyRent: 0,
      maintenanceCharges: 3500,
      securityDeposit: 50000,
      parkingSlots: ['A-101-1'],
      amenitiesIncluded: ['gym', 'pool', 'garden'],
      moveInDate: '2024-01-15',
      furnishingStatus: 'semi_furnished',
      electricityMeterNumber: 'EB12345',
      waterMeterNumber: 'WB12345',
      internetConnection: true,
      cableConnection: true,
      gasConnection: true,
      notes: 'Prime location unit with garden view',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      unitNumber: 'B-205',
      communityId: 'community-1',
      communityName: 'Green Valley Apartments',
      blockNumber: 'B',
      floorNumber: 2,
      unitType: '3bhk',
      carpetArea: 1200,
      builtUpArea: 1350,
      superBuiltUpArea: 1600,
      balconies: 3,
      bathrooms: 3,
      bedrooms: 3,
      status: 'occupied',
      ownershipType: 'rented',
      ownerName: 'Sarah Johnson',
      ownerPhone: '+91 9876543211',
      ownerEmail: 'sarah.johnson@email.com',
      tenantName: 'Mike Wilson',
      tenantPhone: '+91 9876543212',
      tenantEmail: 'mike.wilson@email.com',
      monthlyRent: 45000,
      maintenanceCharges: 4500,
      securityDeposit: 135000,
      parkingSlots: ['B-205-1', 'B-205-2'],
      amenitiesIncluded: ['gym', 'pool', 'garden', 'clubhouse'],
      moveInDate: '2024-02-01',
      leaseEndDate: '2026-01-31',
      furnishingStatus: 'furnished',
      electricityMeterNumber: 'EB12346',
      waterMeterNumber: 'WB12346',
      internetConnection: true,
      cableConnection: true,
      gasConnection: true,
      notes: 'Spacious unit with city view',
      createdAt: '2024-01-01',
      updatedAt: '2024-02-01'
    },
    {
      id: '3',
      unitNumber: 'C-302',
      communityId: 'community-2',
      communityName: 'Sunrise Heights',
      blockNumber: 'C',
      floorNumber: 3,
      unitType: '1bhk',
      carpetArea: 600,
      builtUpArea: 700,
      superBuiltUpArea: 850,
      balconies: 1,
      bathrooms: 1,
      bedrooms: 1,
      status: 'vacant',
      ownershipType: 'owned',
      ownerName: 'Robert Brown',
      ownerPhone: '+91 9876543213',
      ownerEmail: 'robert.brown@email.com',
      monthlyRent: 0,
      maintenanceCharges: 2500,
      securityDeposit: 30000,
      parkingSlots: ['C-302-1'],
      amenitiesIncluded: ['gym', 'garden'],
      furnishingStatus: 'unfurnished',
      electricityMeterNumber: 'EB12347',
      waterMeterNumber: 'WB12347',
      internetConnection: false,
      cableConnection: false,
      gasConnection: true,
      notes: 'Compact unit suitable for singles',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
  ];

  // Backup community options for form
  const backupCommunityOptions = [
    { value: 'community-1', label: 'Green Valley Apartments' },
    { value: 'community-2', label: 'Sunrise Heights' },
    { value: 'community-3', label: 'Royal Gardens' },
  ];

  const unitTypeOptions = [
    { value: 'studio', label: 'Studio' },
    { value: '1bhk', label: '1 BHK' },
    { value: '2bhk', label: '2 BHK' },
    { value: '3bhk', label: '3 BHK' },
    { value: '4bhk', label: '4 BHK' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'duplex', label: 'Duplex' },
  ];

  const statusOptions = [
    { value: 'occupied', label: 'Occupied' },
    { value: 'vacant', label: 'Vacant' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'under_renovation', label: 'Under Renovation' },
  ];

  const ownershipTypeOptions = [
    { value: 'owned', label: 'Owner Occupied' },
    { value: 'rented', label: 'Rented' },
    { value: 'company_provided', label: 'Company Provided' },
  ];

  const furnishingOptions = [
    { value: 'furnished', label: 'Fully Furnished' },
    { value: 'semi_furnished', label: 'Semi Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' },
  ];

  const availableAmenities = [
    'gym', 'pool', 'garden', 'clubhouse', 'playground', 'parking', 'security', 'power_backup', 'elevator'
  ];

  // Statistics calculations using real data
  const displayStats = stats || {
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0,
    unitTypeDistribution: {}
  };

  // Chart configurations using real data
  const occupancyChart = {
    series: [displayStats.occupiedUnits, displayStats.vacantUnits],
    options: {
      chart: {
        type: 'donut' as const,
        height: 200,
      },
      labels: ['Occupied', 'Vacant'],
      colors: ['#28a745', '#dc3545'],
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const unitTypeChart = {
    series: [{
      name: 'Units',
      data: Object.values(displayStats.unitTypeDistribution),
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 300,
      },
      xaxis: {
        categories: Object.keys(displayStats.unitTypeDistribution).map(type => type.toUpperCase()),
      },
      colors: ['#007bff'],
      dataLabels: {
        enabled: true,
      },
    },
  };

  // Filter functions using real data
  const filteredUnits = units.filter((unit: any) => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.communityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.tenantName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCommunity = filterCommunity === 'all' || unit.communityId === filterCommunity;
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    const matchesType = filterType === 'all' || unit.unitType === filterType;
    
    return matchesSearch && matchesCommunity && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalItems = filteredUnits.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

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
    { value: 10, label: '10 per page' },
    { value: 15, label: '15 per page' },
    { value: 20, label: '20 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' }
  ];

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchTerm, filterCommunity, filterStatus, filterType]);

  const onSubmit = async (data: UnitFormData) => {
    try {
      if (selectedUnit) {
        await updateUnitMutation.mutateAsync({ id: selectedUnit.id, formData: data });
        setShowEditModal(false);
      } else {
        await createUnitMutation.mutateAsync(data);
        setShowCreateModal(false);
      }
      
      setSelectedUnit(null);
      setShowSuccess(true);
      reset();
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (unit: CommunityUnit) => {
    setSelectedUnit(unit);
    reset({
      unitNumber: unit.unitNumber,
      communityId: unit.communityId,
      blockNumber: unit.blockNumber,
      floorNumber: unit.floorNumber,
      unitType: unit.unitType,
      carpetArea: unit.carpetArea,
      builtUpArea: unit.builtUpArea,
      superBuiltUpArea: unit.superBuiltUpArea,
      balconies: unit.balconies,
      bathrooms: unit.bathrooms,
      bedrooms: unit.bedrooms,
      status: unit.status,
      ownershipType: unit.ownershipType,
      ownerName: unit.ownerName,
      ownerPhone: unit.ownerPhone,
      ownerEmail: unit.ownerEmail,
      tenantName: unit.tenantName,
      tenantPhone: unit.tenantPhone,
      tenantEmail: unit.tenantEmail,
      monthlyRent: unit.monthlyRent,
      maintenanceCharges: unit.maintenanceCharges,
      securityDeposit: unit.securityDeposit,
      parkingSlots: unit.parkingSlots,
      amenitiesIncluded: unit.amenitiesIncluded,
      moveInDate: unit.moveInDate,
      leaseEndDate: unit.leaseEndDate,
      furnishingStatus: unit.furnishingStatus,
      electricityMeterNumber: unit.electricityMeterNumber,
      waterMeterNumber: unit.waterMeterNumber,
      internetConnection: unit.internetConnection,
      cableConnection: unit.cableConnection,
      gasConnection: unit.gasConnection,
      notes: unit.notes,
    });
    setShowEditModal(true);
  };

  const handleDelete = (unit: CommunityUnit) => {
    setSelectedUnit(unit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUnit) return;
    
    try {
      await deleteUnitMutation.mutateAsync(selectedUnit.id);
      setShowDeleteModal(false);
      setSelectedUnit(null);
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      occupied: { variant: 'success', text: 'Occupied' },
      vacant: { variant: 'warning', text: 'Vacant' },
      maintenance: { variant: 'info', text: 'Maintenance' },
      reserved: { variant: 'primary', text: 'Reserved' },
      under_renovation: { variant: 'secondary', text: 'Renovation' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getOwnershipBadge = (type: string) => {
    const ownershipConfig = {
      owned: { variant: 'success', text: 'Owned' },
      rented: { variant: 'info', text: 'Rented' },
      company_provided: { variant: 'warning', text: 'Company' },
    };
    
    const config = ownershipConfig[type as keyof typeof ownershipConfig] || { variant: 'secondary', text: type };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const ownershipType = watch('ownershipType');

  return (
    <>
      <PageTitle 
        title="Units Management" 
        subMenuItems={[
          { label: 'Settings', path: '/settings' },
          { label: 'Communities', path: '/settings/communities' },
          { label: 'Units Management', path: '/settings/communities/units', active: true }
        ]}
      />

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <IconifyIcon icon="ri:check-line" className="me-2" />
          Unit information has been saved successfully!
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
                        <IconifyIcon icon="ri:building-line" className="text-primary" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Total Units</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.totalUnits}</h3>
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
                        <IconifyIcon icon="ri:user-location-line" className="text-success" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Occupied Units</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.occupiedUnits}</h3>
                      <small className="text-success">
                        <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                        {displayStats.occupancyRate.toFixed(1)}% occupancy
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
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                        <IconifyIcon icon="ri:home-line" className="text-warning" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Vacant Units</h6>
                      <h3 className="mb-0 fw-bold">{displayStats.vacantUnits}</h3>
                      <small className="text-warning">
                        <IconifyIcon icon="ri:home-2-line" className="me-1" />
                        Available for rent
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-warning bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:key-line" className="text-warning" />
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
                        <IconifyIcon icon="ri:money-dollar-circle-line" className="text-info" style={{ fontSize: '28px' }} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1 text-muted fw-medium">Avg. Maintenance</h6>
                      <h3 className="mb-0 fw-bold">
                        ₹{units.length > 0 ? Math.round(units.reduce((sum: number, unit: any) => sum + unit.maintenanceCharges, 0) / units.length).toLocaleString() : 0}
                      </h3>
                      <small className="text-info">
                        <IconifyIcon icon="ri:calculator-line" className="me-1" />
                        Per unit monthly
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <div className="position-absolute top-0 end-0 p-2">
                  <div className="bg-info bg-opacity-5 rounded-circle p-2">
                    <IconifyIcon icon="ri:coins-line" className="text-info" />
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
                    <h5 className="mb-0 fw-semibold">Community-wise Unit Overview</h5>
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
                          <th className="border-0 fw-semibold text-center">Total Units</th>
                          <th className="border-0 fw-semibold text-center">Occupied</th>
                          <th className="border-0 fw-semibold text-center">Vacant</th>
                          <th className="border-0 fw-semibold text-center">Occupancy Rate</th>
                          <th className="border-0 fw-semibold text-center">Avg. Maintenance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCommunities.map(community => {
                          const communityUnits = units.filter(unit => unit.communityId === community.id);
                          const occupiedUnits = communityUnits.filter(unit => unit.status === 'occupied').length;
                          const vacantUnits = communityUnits.filter(unit => unit.status === 'vacant').length;
                          const occupancyRate = communityUnits.length > 0 ? (occupiedUnits / communityUnits.length) * 100 : 0;
                          const avgMaintenance = communityUnits.length > 0 
                            ? Math.round(communityUnits.reduce((sum, unit) => sum + unit.maintenanceCharges, 0) / communityUnits.length)
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
                                <span className="fw-medium">{communityUnits.length}</span>
                              </td>
                              <td className="border-0 text-center">
                                <Badge bg="success" className="px-2 py-1">{occupiedUnits}</Badge>
                              </td>
                              <td className="border-0 text-center">
                                <Badge bg="warning" className="px-2 py-1">{vacantUnits}</Badge>
                              </td>
                              <td className="border-0 text-center">
                                <div className="d-flex align-items-center justify-content-center">
                                  <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                                    <div 
                                      className={`progress-bar ${occupancyRate >= 80 ? 'bg-success' : occupancyRate >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                      style={{ width: `${occupancyRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="small fw-medium">{occupancyRate.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="border-0 text-center">
                                <span className="fw-medium">₹{avgMaintenance.toLocaleString()}</span>
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
                      <p className="text-muted mb-0">Manage your units efficiently</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => setActiveTab('list')}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View All Units
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="d-flex align-items-center"
                      >
                        <IconifyIcon icon="ri:add-line" className="me-1" />
                        Add New Unit
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="list" title={
          <span><IconifyIcon icon="ri:list-check" className="me-2" />Units List</span>
        }>
          <ComponentContainerCard title="Units Management">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <InputGroup style={{ width: '300px' }}>
                  <InputGroup.Text>
                    <IconifyIcon icon="ri:search-line" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search units..."
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

                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:home-4-line" className="me-1" />
                    Type: {filterType === 'all' ? 'All' : unitTypeOptions.find(t => t.value === filterType)?.label}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterType('all')}>All Types</Dropdown.Item>
                    {unitTypeOptions.map(type => (
                      <Dropdown.Item key={type.value} onClick={() => setFilterType(type.value)}>
                        {type.label}
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
                  Add Unit
                </Button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th>Community</th>
                      <th>Type</th>
                      <th>Area (sq ft)</th>
                      <th>Status</th>
                      <th>Ownership</th>
                      <th>Occupant</th>
                      <th>Maintenance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUnits.map((unit) => (
                      <tr key={unit.id}>
                        <td>
                          <div>
                            <strong>{unit.unitNumber}</strong>
                            <br />
                            <small className="text-muted">Block {unit.blockNumber}, Floor {unit.floorNumber}</small>
                          </div>
                        </td>
                        <td>{unit.communityName}</td>
                        <td>
                          <Badge bg="info">{unit.unitType.toUpperCase()}</Badge>
                        </td>
                        <td>
                          <div>
                            <small>Carpet: {unit.carpetArea}</small><br />
                            <small>Built-up: {unit.builtUpArea}</small>
                          </div>
                        </td>
                        <td>{getStatusBadge(unit.status)}</td>
                        <td>{getOwnershipBadge(unit.ownershipType)}</td>
                        <td>
                          <div>
                            {unit.status === 'occupied' && (
                              <>
                                <strong>{unit.ownershipType === 'rented' ? unit.tenantName : unit.ownerName}</strong>
                                <br />
                                <small className="text-muted">
                                  {unit.ownershipType === 'rented' ? unit.tenantPhone : unit.ownerPhone}
                                </small>
                              </>
                            )}
                            {unit.status === 'vacant' && (
                              <Badge bg="warning">Vacant</Badge>
                            )}
                          </div>
                        </td>
                        <td>${unit.maintenanceCharges.toLocaleString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(unit)}
                            >
                              <IconifyIcon icon="ri:edit-line" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(unit)}
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
                {paginatedUnits.map((unit) => (
                  <Col lg={4} md={6} key={unit.id} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="mb-1">{unit.unitNumber}</h5>
                            <p className="text-muted mb-0">Block {unit.blockNumber}, Floor {unit.floorNumber}</p>
                          </div>
                          <div className="text-end">
                            {getStatusBadge(unit.status)}
                            <br />
                            <Badge bg="info" className="mt-1">{unit.unitType.toUpperCase()}</Badge>
                          </div>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted d-block">{unit.communityName}</small>
                          <small className="text-muted">Carpet: {unit.carpetArea} sq ft | Built-up: {unit.builtUpArea} sq ft</small>
                        </div>

                        {unit.status === 'occupied' && (
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-muted">Occupant:</span>
                              {getOwnershipBadge(unit.ownershipType)}
                            </div>
                            <strong>{unit.ownershipType === 'rented' ? unit.tenantName : unit.ownerName}</strong>
                            <br />
                            <small className="text-muted">
                              {unit.ownershipType === 'rented' ? unit.tenantPhone : unit.ownerPhone}
                            </small>
                          </div>
                        )}

                        <div className="mb-3">
                          <span className="text-muted">Maintenance: </span>
                          <strong>${unit.maintenanceCharges.toLocaleString()}</strong>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(unit)}
                          >
                            <IconifyIcon icon="ri:edit-line" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(unit)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} units
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
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <IconifyIcon icon="ri:arrow-left-line" />
                    </Button>
                    
                    <div className="d-flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <IconifyIcon icon="ri:arrow-right-line" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ComponentContainerCard>
        </Tab>

        <Tab eventKey="analytics" title={
          <span><IconifyIcon icon="ri:bar-chart-line" className="me-2" />Analytics</span>
        }>
          <ComponentContainerCard title="Units Analytics">
            {/* Analytics Charts Row */}
            <Row className="mb-4">
              <Col lg={4} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Occupancy Status</h5>
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <IconifyIcon icon="ri:pie-chart-line" className="text-primary" />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="pt-2">
                    <ReactApexChart
                      options={occupancyChart.options}
                      series={occupancyChart.series}
                      type="donut"
                      height={250}
                    />
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                          <span className="text-muted small">Occupied</span>
                        </div>
                        <span className="fw-medium">{displayStats.occupiedUnits} units</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="bg-danger rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                          <span className="text-muted small">Vacant</span>
                        </div>
                        <span className="fw-medium">{displayStats.vacantUnits} units</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={8} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-transparent border-bottom-0 pb-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-semibold">Unit Types Distribution</h5>
                      <div className="bg-info bg-opacity-10 rounded-circle p-2">
                        <IconifyIcon icon="ri:bar-chart-line" className="text-info" />
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="pt-2">
                    <ReactApexChart
                      options={unitTypeChart.options}
                      series={unitTypeChart.series}
                      type="bar"
                      height={280}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

          </ComponentContainerCard>
        </Tab>
      </Tabs>

      {/* Create Unit Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:add-line" className="me-2" />
            Add New Unit
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Row>
              {/* Basic Information */}
              <Col md={12}>
                <h6 className="mb-3">Basic Information</h6>
              </Col>
              <Col md={6}>
                <Controller
                  name="unitNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Unit Number"
                      placeholder="e.g., A-101"
                      error={errors.unitNumber?.message}
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
              <Col md={4}>
                <Controller
                  name="blockNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Block Number"
                      placeholder="e.g., A"
                      error={errors.blockNumber?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="floorNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Floor Number"
                      type="number"
                      placeholder="e.g., 1"
                      error={errors.floorNumber?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="unitType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Unit Type"
                      options={[
                        { value: '', label: 'Select Type' },
                        ...unitTypeOptions
                      ]}
                      error={errors.unitType?.message}
                    />
                  )}
                />
              </Col>

              {/* Area Details */}
              <Col md={12}>
                <h6 className="mb-3 mt-4">Area Details (sq ft)</h6>
              </Col>
              <Col md={4}>
                <Controller
                  name="carpetArea"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Carpet Area"
                      type="number"
                      placeholder="e.g., 850"
                      error={errors.carpetArea?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="builtUpArea"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Built-up Area"
                      type="number"
                      placeholder="e.g., 950"
                      error={errors.builtUpArea?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="superBuiltUpArea"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Super Built-up Area"
                      type="number"
                      placeholder="e.g., 1200"
                      error={errors.superBuiltUpArea?.message}
                    />
                  )}
                />
              </Col>

              {/* Room Details */}
              <Col md={12}>
                <h6 className="mb-3 mt-4">Room Details</h6>
              </Col>
              <Col md={4}>
                <Controller
                  name="bedrooms"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Bedrooms"
                      type="number"
                      placeholder="e.g., 2"
                      error={errors.bedrooms?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="bathrooms"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Bathrooms"
                      type="number"
                      placeholder="e.g., 2"
                      error={errors.bathrooms?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="balconies"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Balconies"
                      type="number"
                      placeholder="e.g., 2"
                      error={errors.balconies?.message}
                    />
                  )}
                />
              </Col>

              {/* Status and Ownership */}
              <Col md={12}>
                <h6 className="mb-3 mt-4">Status & Ownership</h6>
              </Col>
              <Col md={4}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Status"
                      options={[
                        { value: '', label: 'Select Status' },
                        ...statusOptions
                      ]}
                      error={errors.status?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="ownershipType"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Ownership Type"
                      options={[
                        { value: '', label: 'Select Type' },
                        ...ownershipTypeOptions
                      ]}
                      error={errors.ownershipType?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Controller
                  name="furnishingStatus"
                  control={control}
                  render={({ field }) => (
                    <SelectFormInput
                      {...field}
                      label="Furnishing Status"
                      options={[
                        { value: '', label: 'Select Status' },
                        ...furnishingOptions
                      ]}
                      error={errors.furnishingStatus?.message}
                    />
                  )}
                />
              </Col>

              {/* Owner Details */}
              {(ownershipType === 'owned' || ownershipType === 'rented') && (
                <>
                  <Col md={12}>
                    <h6 className="mb-3 mt-4">Owner Details</h6>
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="ownerName"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Owner Name"
                          placeholder="Enter owner name"
                          error={errors.ownerName?.message}
                        />
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="ownerPhone"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Owner Phone"
                          placeholder="Enter phone number"
                          error={errors.ownerPhone?.message}
                        />
                      )}
                    />
                  </Col>
                  <Col md={4}>
                    <Controller
                      name="ownerEmail"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Owner Email"
                          type="email"
                          placeholder="Enter email address"
                          error={errors.ownerEmail?.message}
                        />
                      )}
                    />
                  </Col>
                </>
              )}

              {/* Tenant Details */}
              {ownershipType === 'rented' && (
                <>
                  <Col md={12}>
                    <h6 className="mb-3 mt-4">Tenant Details</h6>
                  </Col>
                  <Col md={3}>
                    <Controller
                      name="tenantName"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Tenant Name"
                          placeholder="Enter tenant name"
                          error={errors.tenantName?.message}
                        />
                      )}
                    />
                  </Col>
                  <Col md={3}>
                    <Controller
                      name="tenantPhone"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Tenant Phone"
                          placeholder="Enter phone number"
                          error={errors.tenantPhone?.message}
                        />
                      )}
                    />
                  </Col>
                  <Col md={3}>
                    <Controller
                      name="tenantEmail"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Tenant Email"
                          type="email"
                          placeholder="Enter email address"
                          error={errors.tenantEmail?.message}
                        />
                      )}
                    />
                  </Col>
                  <Col md={3}>
                    <Controller
                      name="monthlyRent"
                      control={control}
                      render={({ field }) => (
                        <TextFormInput
                          {...field}
                          label="Monthly Rent"
                          type="number"
                          placeholder="Enter rent amount"
                          error={errors.monthlyRent?.message}
                        />
                      )}
                    />
                  </Col>
                </>
              )}

              {/* Financial Details */}
              <Col md={12}>
                <h6 className="mb-3 mt-4">Financial Details</h6>
              </Col>
              <Col md={6}>
                <Controller
                  name="maintenanceCharges"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Monthly Maintenance Charges"
                      type="number"
                      placeholder="Enter maintenance amount"
                      error={errors.maintenanceCharges?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="securityDeposit"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Security Deposit"
                      type="number"
                      placeholder="Enter security deposit"
                      error={errors.securityDeposit?.message}
                    />
                  )}
                />
              </Col>

              {/* Utility Connections */}
              <Col md={12}>
                <h6 className="mb-3 mt-4">Utility Connections</h6>
              </Col>
              <Col md={6}>
                <Controller
                  name="electricityMeterNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Electricity Meter Number"
                      placeholder="Enter meter number"
                      error={errors.electricityMeterNumber?.message}
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="waterMeterNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Water Meter Number"
                      placeholder="Enter meter number"
                      error={errors.waterMeterNumber?.message}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Internet Connection</Form.Label>
                  <Controller
                    name="internetConnection"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        {...field}
                        type="switch"
                        id="internet-switch"
                        label="Available"
                        checked={field.value}
                      />
                    )}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cable Connection</Form.Label>
                  <Controller
                    name="cableConnection"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        {...field}
                        type="switch"
                        id="cable-switch"
                        label="Available"
                        checked={field.value}
                      />
                    )}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gas Connection</Form.Label>
                  <Controller
                    name="gasConnection"
                    control={control}
                    render={({ field }) => (
                      <Form.Check
                        {...field}
                        type="switch"
                        id="gas-switch"
                        label="Available"
                        checked={field.value}
                      />
                    )}
                  />
                </Form.Group>
              </Col>

              {/* Notes */}
              <Col md={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextAreaFormInput
                      {...field}
                      label="Additional Notes"
                      placeholder="Enter any additional information..."
                      rows={3}
                      error={errors.notes?.message}
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
            <Button variant="primary" type="submit" disabled={createUnitMutation.isPending}>
              {createUnitMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Create Unit
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <IconifyIcon icon="ri:edit-line" className="me-2" />
            Edit Unit: {selectedUnit?.unitNumber}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            {/* Same form fields as create modal */}
            <Row>
              {/* Basic Information */}
              <Col md={12}>
                <h6 className="mb-3">Basic Information</h6>
              </Col>
              <Col md={6}>
                <Controller
                  name="unitNumber"
                  control={control}
                  render={({ field }) => (
                    <TextFormInput
                      {...field}
                      label="Unit Number"
                      placeholder="e.g., A-101"
                      error={errors.unitNumber?.message}
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
              {/* Add remaining form fields similar to create modal */}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateUnitMutation.isPending}>
              {updateUnitMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                <>
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Update Unit
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
            Delete Unit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <IconifyIcon icon="ri:alert-line" className="me-2" />
            Are you sure you want to delete unit <strong>{selectedUnit?.unitNumber}</strong>?
            This action cannot be undone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteUnitMutation.isPending}>
            {deleteUnitMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                Delete Unit
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UnitsManagementPage;
