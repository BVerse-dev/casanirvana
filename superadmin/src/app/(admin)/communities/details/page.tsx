'use client';

import PageTitle from "@/components/PageTitle";
import CommunityDetailsBanner from "./components/CommunityDetailsBanner";
import CommunityAnalytics from "./components/CommunityAnalytics";
import CommunityActivities from "./components/CommunityActivities";
import CommunityFinancials from "./components/CommunityFinancials";
import { Col, Row, Card, CardBody, CardHeader, CardTitle, Nav, NavItem, NavLink, Button, Badge, Table, ProgressBar, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormControl, FormLabel, FormSelect } from "react-bootstrap";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import ReactSelect, { type SingleValue, type StylesConfig } from "react-select";
import { useGetCommunity } from "@/hooks/useCommunities";
import { useListUnits } from "@/hooks/useUnits";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  useCommunityDirectoryMembers,
  useCommunityProfilesForDirectory,
  useUpsertCommunityDirectoryMember,
  type CommunityDirectoryRole,
} from "@/hooks/useCommunityDirectoryMembers";

const CommunityDetailsPage = () => {
  const searchParams = useSearchParams();
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedDirectoryRole, setSelectedDirectoryRole] = useState<CommunityDirectoryRole>("member");
  const [committeePosition, setCommitteePosition] = useState("");
  const [tenureStart, setTenureStart] = useState("");
  const [tenureEnd, setTenureEnd] = useState("");
  const [directoryFormError, setDirectoryFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const id = searchParams.get('id');
    setCommunityId(id);
  }, [searchParams]);
  
  // Fetch community data from Supabase
  const { data: community, isLoading: communityLoading, error: communityError } = useGetCommunity(communityId || '');
  
  // Fetch units data for this community
  const { data: unitsResponse, isLoading: unitsLoading, error: unitsError } = useListUnits({
    communityId: communityId || undefined,
    page: 1,
    pageSize: 1000 // Get all units for this community
  });

  const {
    data: directoryMembers = [],
    isLoading: directoryMembersLoading,
    error: directoryMembersError,
  } = useCommunityDirectoryMembers(communityId);

  const {
    data: directoryProfiles = [],
    isLoading: directoryProfilesLoading,
  } = useCommunityProfilesForDirectory(communityId);

  const upsertDirectoryMember = useUpsertCommunityDirectoryMember(communityId);

  const selectedProfileDirectoryEntry = directoryMembers.find(
    (entry) => entry.profile_id === selectedProfileId
  );

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedProfileId("");
    setSelectedDirectoryRole("member");
    setCommitteePosition("");
    setTenureStart("");
    setTenureEnd("");
    setDirectoryFormError(null);
  };

  useEffect(() => {
    if (!selectedProfileId) {
      return;
    }

    if (!selectedProfileDirectoryEntry) {
      setSelectedDirectoryRole("member");
      setCommitteePosition("");
      setTenureStart("");
      setTenureEnd("");
      return;
    }

    setSelectedDirectoryRole(selectedProfileDirectoryEntry.membership_role);
    setCommitteePosition(selectedProfileDirectoryEntry.committee_position || "");
    setTenureStart(selectedProfileDirectoryEntry.tenure_start || "");
    setTenureEnd(selectedProfileDirectoryEntry.tenure_end || "");
  }, [selectedProfileDirectoryEntry, selectedProfileId]);

  const { data: communityStaff = [] } = useQuery({
    queryKey: ["community-management-staff", communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data, error } = await supabase
        .from("community_staff")
        .select("id, first_name, last_name, position, shift, status")
        .eq("community_id", communityId)
        .eq("is_active", true)
        .order("first_name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!communityId,
    staleTime: 60 * 1000,
  });

  const roleBadgeVariant = (role: CommunityDirectoryRole) => {
    if (role === "admin") return "primary";
    if (role === "committee") return "warning";
    return "secondary";
  };

  const roleLabel = (role: CommunityDirectoryRole) => {
    if (role === "admin") return "Admin";
    if (role === "committee") return "Committee";
    return "Member";
  };

  const formatTenure = (start: string | null, end: string | null) => {
    if (!start && !end) return "N/A";
    const startLabel = start ? new Date(start).toLocaleDateString() : "Open";
    const endLabel = end ? new Date(end).toLocaleDateString() : "Open";
    return `${startLabel} - ${endLabel}`;
  };

  const stickyHeaderCellStyle = {
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    backgroundColor: "var(--bs-table-bg, #f8f9fa)",
  };

  type DirectoryProfileOption = {
    value: string;
    label: string;
  };

  const directoryProfileOptions = useMemo<DirectoryProfileOption[]>(
    () =>
      directoryProfiles.map((profile) => {
        const displayName =
          profile.full_name ||
          `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
          profile.email ||
          "Unknown";
        const unitLabel =
          profile.unit?.block && profile.unit?.number
            ? ` (${profile.unit.block}-${profile.unit.number})`
            : "";

        return {
          value: profile.id,
          label: `${displayName}${unitLabel}`,
        };
      }),
    [directoryProfiles]
  );

  const selectedDirectoryProfileOption =
    directoryProfileOptions.find((option) => option.value === selectedProfileId) || null;

  const profileSelectStyles: StylesConfig<DirectoryProfileOption, false> = {
    container: (base) => ({
      ...base,
      width: "100%",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 2000 }),
    menu: (base) => ({
      ...base,
      zIndex: 2000,
      backgroundColor: "var(--bs-body-bg)",
      border: "1px solid var(--bs-border-color)",
      boxShadow: "0 .25rem .5rem rgba(0, 0, 0, .12)",
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      backgroundColor: "var(--bs-body-bg)",
      paddingTop: 0,
      paddingBottom: 0,
    }),
    control: (base, state) => ({
      ...base,
      minHeight: 38,
      backgroundColor: "var(--bs-body-bg)",
      color: "var(--bs-body-color)",
      borderColor: state.isFocused
        ? "rgba(var(--bs-primary-rgb), .6)"
        : "var(--bs-border-color)",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(var(--bs-primary-rgb), .2)"
        : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? "rgba(var(--bs-primary-rgb), .6)"
          : "var(--bs-border-color)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      paddingLeft: 12,
      paddingRight: 12,
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--bs-body-color)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--bs-secondary-color)",
    }),
    input: (base) => ({
      ...base,
      color: "var(--bs-body-color)",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: "var(--bs-border-color)",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--bs-secondary-color)",
      "&:hover": {
        color: "var(--bs-body-color)",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "var(--bs-secondary-color)",
      "&:hover": {
        color: "var(--bs-danger)",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(var(--bs-primary-rgb), .2)"
        : state.isFocused
          ? "var(--bs-tertiary-bg)"
          : "var(--bs-body-bg)",
      color: "var(--bs-body-color)",
      cursor: "pointer",
      ":active": {
        backgroundColor: "rgba(var(--bs-primary-rgb), .28)",
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "var(--bs-secondary-color)",
      backgroundColor: "var(--bs-body-bg)",
    }),
    loadingMessage: (base) => ({
      ...base,
      color: "var(--bs-secondary-color)",
      backgroundColor: "var(--bs-body-bg)",
    }),
  };

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      setDirectoryFormError(null);

      if (!selectedProfileId) {
        throw new Error("Please select a community profile.");
      }

      if (selectedDirectoryRole === "committee" && !committeePosition.trim()) {
        throw new Error("Committee position is required for committee assignments.");
      }

      await upsertDirectoryMember.mutateAsync({
        profileId: selectedProfileId,
        role: selectedDirectoryRole,
        committeePosition,
        tenureStart,
        tenureEnd,
      });
    },
    onSuccess: async () => {
      closeAddMemberModal();

      await queryClient.invalidateQueries({
        queryKey: ["communityDirectoryMembers", communityId],
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update community role.";
      setDirectoryFormError(message);
    },
  });
  
  const units = unitsResponse?.data || [];
  const occupiedUnits = units.filter(unit => unit.status === 'occupied');
  const vacantUnits = units.filter(unit => unit.status === 'available' || unit.status === 'vacant');

  // Loading state
  if (communityLoading) {
    return (
      <>
        <PageTitle title="Community Details Overview" subName="Casa Nirvana" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading community details...</span>
          </div>
        </div>
      </>
    );
  }

  // Error state or no community found
  if (communityError || !community) {
    return (
      <>
        <PageTitle title="Community Details Overview" subName="Casa Nirvana" />
        <div className="alert alert-warning">
          <IconifyIcon icon="solar:danger-bold-duotone" className="me-2" />
          Community not found. Please check the URL or try again.
          {communityError && <div className="mt-2">Error: {communityError.message}</div>}
        </div>
      </>
    );
  }
  
  // Generate dummy units data for the selected community (since this is a demo page with dummy community data)
  const generateDummyUnits = (communityData: any) => {
    const units = [];
    const totalUnits = communityData.totalUnits;
    const occupiedCount = communityData.occupiedUnits;
    
    const ownerNames = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson', 'David Brown', 'Emma Jones', 'Robert Taylor', 'Anna Miller', 'James Wilson', 'Sophie Anderson'];
    
    for (let i = 1; i <= Math.min(totalUnits, 10); i++) { // Show max 10 units
      const isOccupied = i <= occupiedCount;
      const block = String.fromCharCode(65 + Math.floor((i - 1) / 5)); // A, B, C, etc.
      const floor = Math.floor((i - 1) % 5) + 1;
      const unitNumber = `${block}-${floor}0${((i - 1) % 5) + 1}`;
      
      units.push({
        id: `${communityData.id}-UNIT-${i.toString().padStart(3, '0')}`,
        number: unitNumber,
        unit_number: unitNumber,
        block: block,
        floor: floor,
        bedrooms: Math.floor(Math.random() * 3) + 1, // 1-3 BHK
        floor_area: 800 + (Math.floor(Math.random() * 3) * 400), // 800-1600 sqft
        area_sqft: 800 + (Math.floor(Math.random() * 3) * 400),
        status: isOccupied ? 'occupied' : 'available',
        rent_amount: isOccupied ? (20000 + Math.floor(Math.random() * 20000)) : null,
        profiles: isOccupied ? {
          first_name: ownerNames[i % ownerNames.length].split(' ')[0],
          last_name: ownerNames[i % ownerNames.length].split(' ')[1],
          email: `${ownerNames[i % ownerNames.length].toLowerCase().replace(' ', '.')}@email.com`
        } : null
      });
    }
    return units;
  };
  
  // const units = generateDummyUnits(society); // This line is no longer needed as units are fetched directly
  // const occupiedUnits = units.filter(unit => unit.status === 'occupied');
  // const vacantUnits = units.filter(unit => unit.status === 'available');
  // const unitsLoading = false; // This line is no longer needed
  // const unitsError = null; // This line is no longer needed

  // Data adapter to transform real community data into dummy data format for tab components
  const adaptCommunityData = (realCommunity: typeof community) => {
    return {
      ...realCommunity,
      address: realCommunity.address || 'Address not available',
      status: 'active' as const,
      totalUnits: units.length,
      occupiedUnits: occupiedUnits.length,
      type: 'Active', // Default since realCommunity may not have status field
      amenities: [
        'Swimming Pool', 
        'Gymnasium', 
        'Club House', 
        'Children\'s Play Area', 
        'Parking', 
        'Security', 
        'Power Backup', 
        'Water Supply'
      ],
      establishedYear: realCommunity.created_at ? new Date(realCommunity.created_at).getFullYear() : 2020,
      maintenanceCharges: 3500,
      area: '50,000 sq ft',
      rating: 4.8,
      icon: 'solar:buildings-2-bold-duotone',
      variant: 'primary' as const
    };
  };

  const adaptedCommunity = adaptCommunityData(community) as any;

  return (
    <>
      <PageTitle title="Community Details Overview" subName="Casa Nirvana" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/communities/grid" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Communities
            </Link>
          </div>
        </Col>
      </Row>
      
      {/* Enhanced Banner */}
      <CommunityDetailsBanner society={community} />
      
      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-0">
              <Nav variant="tabs" className="nav-tabs-custom border-bottom-0">
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
                    Overview
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2" />
                    Analytics
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'financials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('financials')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
                    Financials
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'activities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activities')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:clock-circle-bold-duotone" className="me-2" />
                    Activities
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('management')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:settings-bold-duotone" className="me-2" />
                    Management
                  </NavLink>
                </NavItem>
              </Nav>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Overview Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Total Units</div>
                      <h3 className="mb-0 text-white">{units.length}</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:home-2-bold" className="me-1" />
                        {occupiedUnits.length} Occupied
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-success text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Occupancy Rate</div>
                      <h3 className="mb-0 text-white">{units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0}%</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                        +2.3% this month
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-warning text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Monthly Revenue</div>
                      <h3 className="mb-0 text-white">₹{(3500 * occupiedUnits.length / 100000).toFixed(1)}L</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:wallet-money-bold" className="me-1" />
                        Collection Rate: 94%
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:money-bag-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-info text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Active Amenities</div>
                      <h3 className="mb-0 text-white">8</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:star-bold" className="me-1" />
                        4.7 Average Rating
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:swimming-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Society Information */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                      <IconifyIcon icon="solar:info-circle-bold-duotone" className="text-primary fs-5" />
                    </div>
                    Community Information
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row className="g-4">
                    <Col md={6}>
                      {/* Society Type */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-primary-subtle border border-primary border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-primary bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:buildings-2-bold-duotone" className="text-primary fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <label className="text-muted small mb-0 fw-medium">Society Type</label>
                              <div className="fw-bold text-dark mt-1">Active</div>
                            </div>
                            <Badge bg="primary" className="rounded-pill px-3 py-2">Residential</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-success-subtle border border-success border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-success bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:map-point-bold-duotone" className="text-success fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Location & Area</label>
                          <div className="fw-bold text-dark mt-1">Mumbai</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:compass-bold" className="me-1" />
                            {community.address || 'Premium Residential Area'}
                          </div>
                        </div>
                      </div>

                      {/* Monthly Maintenance */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-warning-subtle border border-warning border-opacity-25 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-warning bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:wallet-money-bold-duotone" className="text-warning fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Monthly Maintenance</label>
                          <div className="fw-bold text-dark mt-1">₹3,500 per unit</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                            Due on 1st of every month
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      {/* Established */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-info-subtle border border-info border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-info bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:calendar-date-bold-duotone" className="text-info fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Established Year</label>
                          <div className="fw-bold text-dark mt-1">{community.created_at ? new Date(community.created_at).getFullYear() : '2020'}</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:history-bold" className="me-1" />
                            {community.created_at ? `${new Date().getFullYear() - new Date(community.created_at).getFullYear()}+ years of service` : '4+ years of service'}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-success-subtle border border-success border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-success bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:shield-check-bold-duotone" className="text-success fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <label className="text-muted small mb-0 fw-medium">Current Status</label>
                              <div className="fw-bold text-dark mt-1">Fully Operational</div>
                            </div>
                            <Badge bg="success" className="rounded-pill px-3 py-2 d-flex align-items-center">
                              <IconifyIcon icon="solar:check-circle-bold" className="me-1" />
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="d-flex align-items-center p-3 rounded-3 hover-effect transition-all" style={{ backgroundColor: 'rgba(139, 69, 193, 0.1)', border: '1px solid rgba(139, 69, 193, 0.25)' }}>
                        <div className="avatar-md rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ backgroundColor: 'rgba(139, 69, 193, 0.15)' }}>
                          <IconifyIcon icon="solar:document-text-bold-duotone" className="fs-4" style={{ color: '#8b45c1' }} />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Registration & Compliance</label>
                          <div className="fw-bold text-dark mt-1">All Documents Valid</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:verified-check-bold" className="me-1" />
                            RERA Approved & Licensed
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:settings-bold-duotone" className="me-2 text-primary" />
                    Management Team
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-md rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-3">
                      <IconifyIcon icon="solar:user-bold-duotone" className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-0">Mr. Rajesh Kumar</h6>
                      <small className="text-muted">Society Chairman</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-md rounded-circle bg-success-subtle d-flex align-items-center justify-content-center me-3">
                      <IconifyIcon icon="solar:user-bold-duotone" className="text-success" />
                    </div>
                    <div>
                      <h6 className="mb-0">Mrs. Priya Sharma</h6>
                      <small className="text-muted">Secretary</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="avatar-md rounded-circle bg-warning-subtle d-flex align-items-center justify-content-center me-3">
                      <IconifyIcon icon="solar:user-bold-duotone" className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-0">Mr. Amit Verma</h6>
                      <small className="text-muted">Treasurer</small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Continue with the rest of the overview content... */}
          <Row className="mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:swimming-bold-duotone" className="me-2 text-primary" />
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    {[
                      { name: 'Swimming Pool', icon: 'solar:swimming-bold-duotone', status: 'Active', color: 'info' },
                      { name: 'Gymnasium', icon: 'solar:bicycling-bold-duotone', status: 'Active', color: 'warning' },
                      { name: 'Club House', icon: 'solar:home-2-bold-duotone', status: 'Active', color: 'primary' },
                      { name: 'Children Play Area', icon: 'solar:gameboy-bold-duotone', status: 'Active', color: 'success' },
                      { name: 'Parking', icon: 'solar:car-bold-duotone', status: 'Active', color: 'secondary' },
                      { name: 'Security', icon: 'solar:shield-check-bold-duotone', status: '24/7', color: 'danger' }
                    ].map((amenity, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <div className={`d-flex align-items-center p-3 rounded-3 bg-${amenity.color}-subtle border border-${amenity.color} border-opacity-25 h-100 transition-all hover-shadow`}>
                          <div className={`avatar-sm rounded-circle bg-${amenity.color} bg-opacity-10 d-flex align-items-center justify-content-center me-3 flex-shrink-0`}>
                            <IconifyIcon icon={amenity.icon} className={`text-${amenity.color} fs-5`} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold">{amenity.name}</h6>
                            <span className="small text-muted">Available Now</span>
                          </div>
                          <Badge bg={amenity.color} className="rounded-pill fw-medium">{amenity.status}</Badge>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Occupancy Rate</span>
                      <span className="small fw-semibold">{units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0}%</span>
                    </div>
                    <ProgressBar 
                      now={units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0} 
                      variant="success" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Payment Collection</span>
                      <span className="small fw-semibold">94%</span>
                    </div>
                    <ProgressBar 
                      now={94} 
                      variant="warning" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Maintenance Requests</span>
                      <span className="small fw-semibold">8 Active</span>
                    </div>
                    <ProgressBar 
                      now={75} 
                      variant="info" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-0">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Satisfaction Rate</span>
                      <span className="small fw-semibold">4.7/5</span>
                    </div>
                    <ProgressBar 
                      now={94} 
                      variant="success" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity & Upcoming Events */}
          <Row className="mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <CardTitle className="mb-0 d-flex align-items-center">
                      <IconifyIcon icon="solar:clock-circle-bold-duotone" className="me-2 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <Badge bg="light" text="dark" className="rounded-pill small">Last 24 Hours</Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="activity-timeline p-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {[
                      { 
                        title: 'Elevator Maintenance Completed', 
                        description: 'Elevator B1 maintenance successfully completed by TechServ Solutions',
                        icon: 'solar:settings-bold-duotone', 
                        color: 'warning',
                        time: '2 hours ago',
                        user: 'Maintenance Team',
                        userAvatar: 'MT'
                      },
                      { 
                        title: 'Monthly Maintenance Payment', 
                        description: 'Mr. Rajesh Kumar (Unit 405) paid maintenance charges for December',
                        icon: 'solar:wallet-money-bold-duotone', 
                        color: 'success',
                        time: '4 hours ago',
                        user: 'Rajesh Kumar',
                        userAvatar: 'RK'
                      },
                      { 
                        title: 'Guest Registration', 
                        description: 'New visitor registered for Unit 302 - Family gathering event',
                        icon: 'solar:users-group-rounded-bold-duotone', 
                        color: 'info',
                        time: '6 hours ago',
                        user: 'Security Desk',
                        userAvatar: 'SD'
                      },
                      { 
                        title: 'Water Leakage Complaint', 
                        description: 'Unit 201 reported water leakage in bathroom - Assigned to plumber',
                        icon: 'solar:danger-triangle-bold-duotone', 
                        color: 'danger',
                        time: '8 hours ago',
                        user: 'Priya Sharma',
                        userAvatar: 'PS'
                      },
                      { 
                        title: 'Swimming Pool Booking', 
                        description: 'Pool area booked for birthday party on 15th Dec by Unit 601',
                        icon: 'solar:swimming-bold-duotone', 
                        color: 'primary',
                        time: '12 hours ago',
                        user: 'Amit Verma',
                        userAvatar: 'AV'
                      },
                      { 
                        title: 'Society Meeting Notice', 
                        description: 'Annual General Meeting scheduled for 20th December at Club House',
                        icon: 'solar:megaphone-loud-bold-duotone', 
                        color: 'secondary',
                        time: '1 day ago',
                        user: 'Society Committee',
                        userAvatar: 'SC'
                      }
                    ].map((item, index) => (
                      <div key={index} className={`d-flex mb-4 ${index === 5 ? 'mb-0' : ''}`}>
                        <div className="flex-shrink-0">
                          <div className={`avatar-sm rounded-circle bg-${item.color}-subtle d-flex align-items-center justify-content-center position-relative`}>
                            <IconifyIcon icon={item.icon} className={`fs-18 text-${item.color}`} />
                            {index !== 5 && (
                              <div className="position-absolute start-50 translate-middle-x" style={{ top: '100%', height: '40px', width: '2px', backgroundColor: '#e5e7eb' }}></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0">{item.title}</h6>
                            <small className="text-muted">{item.time}</small>
                          </div>
                          <p className="text-muted mb-1 small">{item.description}</p>
                          <div className="d-flex align-items-center">
                            <div className={`avatar-xs rounded-circle bg-${item.color}-subtle d-flex align-items-center justify-content-center me-2`}>
                              <small className={`text-${item.color} fw-semibold`}>{item.userAvatar}</small>
                            </div>
                            <small className="text-muted">{item.user}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2 text-primary" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {[
                    { date: 'Jan 5, 2025', event: 'Monthly Society Meeting', time: '7:00 PM' },
                    { date: 'Jan 8, 2025', event: 'Swimming Pool Maintenance', time: '10:00 AM' },
                    { date: 'Jan 12, 2025', event: 'Cultural Program', time: '6:00 PM' },
                    { date: 'Jan 15, 2025', event: 'Annual General Meeting', time: '7:00 PM' }
                  ].map((event, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-3 p-2 rounded bg-light">
                      <div>
                        <h6 className="mb-1 small">{event.event}</h6>
                        <div className="text-muted small">
                          <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                          {event.date} at {event.time}
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Units in Society */}
          <Row className="mb-4">
            <Col xl={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <div>
                    <CardTitle className="mb-1">Units in {community.name}</CardTitle>
                                         <div className="d-flex gap-3">
                       <span className="text-muted small">
                         <IconifyIcon icon="solar:home-2-bold-duotone" className="me-1 text-success" />
                         {occupiedUnits.length} Occupied
                       </span>
                       <span className="text-muted small">
                         <IconifyIcon icon="solar:home-broken" className="me-1 text-warning" />
                         {vacantUnits.length} Vacant
                       </span>
                       <span className="text-muted small">
                         <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-1 text-primary" />
                         {units.length} Total Units
                       </span>
                     </div>
                  </div>
                  <Link href="/property/add">
                    <Button variant="primary" size="sm">
                      <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                      Add Unit
                    </Button>
                  </Link>
                </CardHeader>
                 <CardBody>
                   <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                     <Table className="table-centered mb-0">
                       <thead className="table-light">
                         <tr>
                           <th>Unit</th>
                           <th>Block/Floor</th>
                           <th>Details</th>
                           <th>Status</th>
                           <th>Owner/Tenant</th>
                           <th>Rent</th>
                           <th>Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {unitsLoading ? (
                           <tr>
                             <td colSpan={7} className="text-center py-4">
                               <div className="spinner-border text-primary" role="status">
                                 <span className="visually-hidden">Loading units...</span>
                               </div>
                             </td>
                           </tr>
                         ) : unitsError ? (
                           <tr>
                             <td colSpan={7} className="text-center py-4">
                               <IconifyIcon icon="solar:danger-bold-duotone" className="fs-48 text-danger mb-3 d-block" />
                               <h5 className="text-danger">Error loading units</h5>
                               <p className="text-muted">Unable to fetch units for this community.</p>
                             </td>
                           </tr>
                         ) : units.length === 0 ? (
                           <tr>
                             <td colSpan={7} className="text-center py-4">
                               <IconifyIcon icon="solar:home-2-bold-duotone" className="fs-48 text-muted mb-3 d-block" />
                               <h5 className="text-muted">No units found</h5>
                               <p className="text-muted">This community does not have any units yet.</p>
                             </td>
                           </tr>
                         ) : units.slice(0, 10).map((unit) => {
                           // Handle profile data safely
                           const profile = unit.profiles && typeof unit.profiles === 'object' && 'first_name' in unit.profiles 
                             ? unit.profiles as { first_name: string; last_name: string; email: string; phone?: string }
                             : null;
                           
                           return (
                           <tr key={unit.id}>
                             <td>
                               <div className="d-flex align-items-center">
                                 <div className="avatar-sm bg-light rounded me-2 d-flex align-items-center justify-content-center">
                                   <IconifyIcon 
                                     icon={unit.status === 'occupied' ? "solar:home-bold-duotone" : "solar:home-broken"} 
                                     className={unit.status === 'occupied' ? "text-success" : "text-warning"} 
                                   />
                                 </div>
                                 <div>
                                   <h6 className="mb-1">
                                     <Link 
                                       href={`/property/details?id=${unit.id}`} 
                                       className="text-decoration-none"
                                     >
                                       {unit.number || unit.unit_number || `Unit ${unit.id.substring(0, 8)}`}
                                     </Link>
                                   </h6>
                                 </div>
                               </div>
                             </td>
                             <td>
                               <div>
                                 <div className="fw-medium">Block {unit.block || 'A'}</div>
                                 <div className="text-muted small">Floor {unit.floor || 1}</div>
                               </div>
                             </td>
                             <td>
                               <div className="small">
                                 <div>{unit.bedrooms || 2} BHK</div>
                                 <div className="text-muted">{unit.floor_area || unit.area_sqft || 800} sqft</div>
                               </div>
                             </td>
                             <td>
                               <Badge 
                                 bg={unit.status === 'occupied' ? "success" : "warning"} 
                                 className="small"
                               >
                                 {unit.status === 'occupied' ? 'Occupied' : 'Available'}
                               </Badge>
                             </td>
                             <td>
                               {profile?.first_name || profile?.last_name ? (
                                 <div>
                                   <div className="fw-medium small">
                                     {profile.first_name} {profile.last_name}
                                   </div>
                                   <div className="text-muted small">Owner</div>
                                 </div>
                               ) : (
                                 <span className="text-muted small">—</span>
                               )}
                             </td>
                             <td>
                               {('rent_amount' in unit && unit.rent_amount) ? (
                                 <span className="fw-medium">₹{unit.rent_amount.toLocaleString()}</span>
                               ) : (
                                 <span className="text-muted">—</span>
                               )}
                             </td>
                             <td>
                               <div className="d-flex gap-1">
                                 <Link href={`/property/details?id=${unit.id}`}>
                                   <Button 
                                     variant="light" 
                                     size="sm"
                                     title="View Details"
                                   >
                                     <IconifyIcon icon="solar:eye-bold-duotone" />
                                   </Button>
                                 </Link>
                                 <Button 
                                   variant="light" 
                                   size="sm"
                                   title="Edit Unit"
                                 >
                                   <IconifyIcon icon="solar:pen-bold-duotone" />
                                 </Button>
                               </div>
                             </td>
                           </tr>
                           );
                         })}
                       </tbody>
                     </Table>
                   </div>
                     
                   <div className="text-center mt-3">
                     <Link href={`/property/list${community.id && community.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) ? `?societyId=${community.id}` : ''}`}>
                       <Button variant="outline-primary">
                         <IconifyIcon icon="solar:eye-bold-duotone" className="me-1" />
                         View All Units ({units.length})
                       </Button>
                     </Link>
                   </div>
                 </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Google Maps */}
          <Row>
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:map-point-bold-duotone" className="me-2 text-primary" />
                    Location & Accessibility
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="rounded-3 overflow-hidden">
                    <iframe
                      className="w-100"
                      style={{ height: 400, border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?width=1980&height=400&hl=en&q=${encodeURIComponent(community.address || community.name)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'analytics' && (
        <CommunityAnalytics society={adaptedCommunity} />
      )}

      {activeTab === 'financials' && (
        <CommunityFinancials society={adaptedCommunity} />
      )}

      {activeTab === 'activities' && (
        <CommunityActivities society={adaptedCommunity} />
      )}

      {activeTab === 'management' && (
        <>
          {/* Agency Management Overview */}
          <Row className="mb-4">
            <Col xl={12}>
              <Card className="bg-gradient-primary text-white border-0 shadow-lg">
                <CardBody className="p-4">
                  <Row className="align-items-center">
                    <Col lg={8}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="avatar-lg bg-white bg-opacity-20 rounded-circle flex-centered me-3">
                          <IconifyIcon
                            icon="solar:buildings-2-bold-duotone"
                            className="fs-24 text-white"
                          />
                        </div>
                        <div>
                          <CardTitle as="h3" className="text-white mb-1">
                            Property Management Agency
                          </CardTitle>
                          <p className="text-white-75 mb-0">
                            Professional society management since {community.created_at ? new Date(community.created_at).getFullYear() : '2020'}
                          </p>
                          <p className="text-white-50 mb-0 small">
                            {community.address || 'Tower A, Business Plaza, Sector 15, Gurgaon, Haryana 122001'}
                          </p>
                        </div>
                      </div>

                      <Row className="g-4 mt-4">
                        <Col md={6}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Societies Managed</span>
                            <span className="text-white fw-semibold">24/30</span>
                          </div>
                          <ProgressBar 
                            now={80} 
                            className="progress-sm bg-white bg-opacity-20 mb-3"
                            variant=""
                            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                          >
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: '80%' }}
                            ></div>
                          </ProgressBar>
                          
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Total Units</span>
                            <span className="text-white fw-semibold">1,847</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-white-75">Client Satisfaction</span>
                            <div className="d-flex align-items-center">
                              <span className="text-white fw-semibold me-2">4.8/5</span>
                              <div className="d-flex">
                                {[1,2,3,4,5].map((star, idx) => (
                                  <IconifyIcon 
                                    key={idx}
                                    icon="solar:star-bold" 
                                    className={`small ${idx < 4 ? 'text-warning' : 'text-white-50'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Staff Members</span>
                            <span className="text-white fw-semibold">48</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Monthly Revenue</span>
                            <span className="text-white fw-semibold">₹2.4M</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="text-white-75">Active Licenses</span>
                            <span className="text-white fw-semibold">All Valid</span>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Service Since</span>
                            <span className="text-white fw-semibold">{community.created_at ? `${new Date(community.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} (${new Date().getFullYear() - new Date(community.created_at).getFullYear()}+ years)` : 'Jan 2020 (4+ years)'}</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Response Time</span>
                            <span className="text-white fw-semibold">&lt; 2 hours</span>
                          </div>
                          <ProgressBar 
                            now={92} 
                            className="progress-sm bg-white bg-opacity-20 mb-2"
                            variant=""
                          >
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ width: '92%' }}
                            ></div>
                          </ProgressBar>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-white-75 small">Performance Rating</span>
                            <span className="text-success small">
                              <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                              Excellent (92%)
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Maintenance Efficiency</span>
                            <span className="text-white fw-semibold">96%</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Complaint Resolution</span>
                            <span className="text-white fw-semibold">2.1 days avg</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="text-white-75">Emergency Response</span>
                            <span className="text-white fw-semibold">24/7 Available</span>
                          </div>
                        </Col>
                      </Row>
                    </Col>

                    <Col lg={4}>
                      <div className="text-center">
                        <div className="mb-3">
                          <div className="position-relative d-inline-block">
                            <img 
                              src="/images/users/avatar-1.jpg" 
                              alt="Primary Contact"
                              className="avatar-xl rounded-circle border border-white border-3 shadow"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                            <div className="position-absolute bottom-0 end-0">
                              <div className="avatar-xs bg-success rounded-circle border border-white d-flex align-items-center justify-content-center">
                                <div className="bg-white rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                              </div>
                            </div>
                          </div>
                          <h5 className="text-white mb-1 mt-2">
                            Michael Johnson
                          </h5>
                          <p className="text-white-75 mb-0 small">Primary Contact Manager</p>
                          <div className="text-white-50 small">Available Now</div>
                        </div>
                        
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="bg-white bg-opacity-10 rounded-2 p-2 hover-effect cursor-pointer text-center transition-all d-flex align-items-center justify-content-center">
                              <IconifyIcon icon="solar:phone-bold" className="text-white me-1 fs-5" />
                              <div className="text-white fw-medium small">Call Now</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-white bg-opacity-10 rounded-2 p-2 hover-effect cursor-pointer text-center transition-all d-flex align-items-center justify-content-center">
                              <IconifyIcon icon="solar:letter-bold" className="text-white me-1 fs-5" />
                              <div className="text-white fw-medium small">Send Email</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white bg-opacity-10 rounded-3 p-3">
                          <h6 className="text-white mb-2 d-flex align-items-center">
                            <IconifyIcon icon="solar:phone-bold" className="me-2" />
                            Contact Details
                          </h6>
                          <div className="text-start">
                            <div className="d-flex align-items-center mb-1">
                              <IconifyIcon icon="solar:phone-linear" className="text-white-75 me-2 small" />
                              <span className="text-white small">+91 98765 43200</span>
                            </div>
                            <div className="d-flex align-items-center mb-1">
                              <IconifyIcon icon="solar:letter-linear" className="text-white-75 me-2 small" />
                              <span className="text-white small">contact@prestigeproperties.com</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <IconifyIcon icon="solar:clock-circle-linear" className="text-white-75 me-2 small" />
                              <span className="text-white-75 small">Mon-Sat 9AM-6PM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <CardTitle className="mb-0 d-flex align-items-center">
                      <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 text-primary" />
                      Community Directory Roles
                    </CardTitle>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowAddMemberModal(true)}
                    >
                      <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                      Assign Role
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  {directoryMembersLoading ? (
                    <div className="text-muted">Loading directory roles...</div>
                  ) : directoryMembersError ? (
                    <div className="text-danger">
                      Failed to load directory roles: {(directoryMembersError as Error).message}
                    </div>
                  ) : directoryMembers.length === 0 ? (
                    <div className="text-muted">No directory roles assigned for this community yet.</div>
                  ) : (
                    <div
                      className="border rounded-3"
                      style={{
                        maxHeight: "28rem",
                        overflow: "auto",
                      }}
                    >
                    <Table hover className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={stickyHeaderCellStyle}>Name</th>
                          <th style={stickyHeaderCellStyle}>Role</th>
                          <th style={stickyHeaderCellStyle}>Unit</th>
                          <th style={stickyHeaderCellStyle}>Contact</th>
                          <th style={stickyHeaderCellStyle}>Position</th>
                          <th style={stickyHeaderCellStyle}>Tenure</th>
                          <th style={stickyHeaderCellStyle}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {directoryMembers.map((member) => (
                          <tr key={member.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                                  <IconifyIcon icon="solar:user-bold-duotone" className="text-primary" />
                                </div>
                                <span className="fw-medium">
                                  {member.profile.full_name || `${member.profile.first_name || ""} ${member.profile.last_name || ""}`.trim() || member.profile.email}
                                </span>
                              </div>
                            </td>
                            <td>
                              <Badge bg={roleBadgeVariant(member.membership_role)}>
                                {roleLabel(member.membership_role)}
                              </Badge>
                            </td>
                            <td>
                              {member.profile.unit?.block && member.profile.unit?.number
                                ? `${member.profile.unit.block}-${member.profile.unit.number}`
                                : "N/A"}
                            </td>
                            <td>{member.profile.phone || member.profile.email || "N/A"}</td>
                            <td>{member.committee_position || "N/A"}</td>
                            <td>{formatTenure(member.tenure_start, member.tenure_end)}</td>
                            <td>
                              <Badge bg={member.is_active ? "success" : "secondary"} className="rounded-pill">
                                {member.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:shield-check-bold-duotone" className="me-2 text-primary" />
                    Security & Staff
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    {communityStaff.length === 0 ? (
                      <Col xs={12}>
                        <div className="text-muted">No staff records found for this community.</div>
                      </Col>
                    ) : (
                      communityStaff.map((staff: any) => (
                      <Col md={6} key={staff.id} className="mb-3">
                        <div className="p-3 border rounded-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="mb-0">{`${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Staff Member"}</h6>
                            <Badge bg={staff.status === "active" ? "success" : "secondary"} className="rounded-pill small">
                              {staff.status || "Unknown"}
                            </Badge>
                          </div>
                          <p className="text-muted mb-1 small">{staff.position || "Unassigned Position"}</p>
                          <p className="text-muted mb-0 small">
                            <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                            {staff.shift || "Shift not set"}
                          </p>
                        </div>
                      </Col>
                    )))}
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:settings-bold-duotone" className="me-2 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" className="text-start">
                      <IconifyIcon icon="solar:bell-bold-duotone" className="me-2" />
                      Send Notice
                    </Button>
                    <Button variant="outline-success" className="text-start">
                      <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
                      Collect Dues
                    </Button>
                    <Button variant="outline-warning" className="text-start">
                      <IconifyIcon icon="solar:tools-bold-duotone" className="me-2" />
                      Maintenance Request
                    </Button>
                    <Button variant="outline-info" className="text-start">
                      <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:file-text-bold-duotone" className="me-2 text-primary" />
                    Recent Documents
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {[
                    { name: 'AGM Minutes Dec 2024', date: '15 Dec 2024', type: 'PDF' },
                    { name: 'Maintenance Contract', date: '10 Dec 2024', type: 'PDF' },
                    { name: 'Insurance Policy', date: '5 Dec 2024', type: 'PDF' },
                    { name: 'Audit Report 2024', date: '1 Dec 2024', type: 'PDF' }
                  ].map((doc, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 rounded bg-light">
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon="solar:file-text-bold-duotone" className="text-danger me-2" />
                        <div>
                          <div className="small fw-medium">{doc.name}</div>
                          <div className="text-muted small">{doc.date}</div>
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        <IconifyIcon icon="solar:download-bold" />
                      </Button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
      
      {/* Assign Community Directory Role Modal */}
      <Modal show={showAddMemberModal} onHide={closeAddMemberModal} centered>
        <ModalHeader closeButton>
          <Modal.Title>Assign Community Role</Modal.Title>
        </ModalHeader>
        <ModalBody>
          <Form>
            <Form.Group className="mb-3">
              <FormLabel>Community Profile</FormLabel>
              <ReactSelect<DirectoryProfileOption, false>
                inputId="community-directory-profile-select"
                classNamePrefix="react-select"
                options={directoryProfileOptions}
                value={selectedDirectoryProfileOption}
                onChange={(option: SingleValue<DirectoryProfileOption>) =>
                  setSelectedProfileId(option?.value || "")
                }
                isSearchable
                isClearable
                placeholder="Select profile"
                isDisabled={directoryProfilesLoading || addMemberMutation.isPending}
                menuPlacement="auto"
                menuPosition="fixed"
                maxMenuHeight={240}
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                styles={profileSelectStyles}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <FormLabel>Role</FormLabel>
              <FormSelect
                value={selectedDirectoryRole}
                onChange={(event) =>
                  setSelectedDirectoryRole(event.target.value as CommunityDirectoryRole)
                }
                disabled={addMemberMutation.isPending}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="committee">Committee</option>
              </FormSelect>
            </Form.Group>

            {selectedDirectoryRole === "committee" && (
              <>
                <Form.Group className="mb-3">
                  <FormLabel>Committee Position</FormLabel>
                  <FormControl
                    type="text"
                    value={committeePosition}
                    onChange={(event) => setCommitteePosition(event.target.value)}
                    placeholder="Chairperson, Secretary, Treasurer..."
                    disabled={addMemberMutation.isPending}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FormLabel>Tenure Start</FormLabel>
                      <FormControl
                        type="date"
                        value={tenureStart}
                        onChange={(event) => setTenureStart(event.target.value)}
                        disabled={addMemberMutation.isPending}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <FormLabel>Tenure End</FormLabel>
                      <FormControl
                        type="date"
                        value={tenureEnd}
                        onChange={(event) => setTenureEnd(event.target.value)}
                        disabled={addMemberMutation.isPending}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            {selectedProfileDirectoryEntry && (
              <div className="alert alert-info mb-0 py-2 small">
                Existing role: <strong>{roleLabel(selectedProfileDirectoryEntry.membership_role)}</strong>
              </div>
            )}

            {directoryFormError && (
              <div className="alert alert-danger mt-3 mb-0 py-2">
                {directoryFormError}
              </div>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={closeAddMemberModal} disabled={addMemberMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => addMemberMutation.mutate()}
            disabled={
              addMemberMutation.isPending ||
              !selectedProfileId ||
              (selectedDirectoryRole === "committee" && !committeePosition.trim())
            }
          >
            <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
            {addMemberMutation.isPending ? "Saving..." : "Save Role"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CommunityDetailsPage;
