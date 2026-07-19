'use client';

import PageTitle from "@/components/PageTitle";
import CommunityDetailsBanner from "./components/CommunityDetailsBanner";
import CommunityAnalytics from "./components/CommunityAnalytics";
import CommunityActivities from "./components/CommunityActivities";
import CommunityFinancials from "./components/CommunityFinancials";
import { Alert, Col, Row, Card, CardBody, CardHeader, CardTitle, Nav, NavItem, NavLink, Button, Badge, Table, ProgressBar, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormControl, FormLabel, FormSelect } from "react-bootstrap";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import ReactSelect, { type SingleValue, type StylesConfig } from "react-select";
import { useGetCommunity } from "@/hooks/useCommunities";
import { useListUnits } from "@/hooks/useUnits";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useCommunityResidents,
  useCommunityDirectoryMembers,
  useCommunityProfilesForDirectory,
  useCommunityStaff,
  useUpsertCommunityDirectoryMember,
  type CommunityDirectoryRole,
} from "@/hooks/useCommunityDirectoryMembers";

const CommunityDetailsPage = () => {
  const searchParams = useSearchParams();
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [unitsSearchTerm, setUnitsSearchTerm] = useState("");
  const [residentsSearchTerm, setResidentsSearchTerm] = useState("");
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
    data: communityResidents = [],
    isLoading: residentsLoading,
    error: residentsError,
  } = useCommunityResidents(communityId);

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

  const { data: communityStaff = [] } = useCommunityStaff(communityId);

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
        queryKey: ["communityManagementData", communityId],
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

  const directoryRoleByProfileId = useMemo(() => {
    return new Map(directoryMembers.map((entry) => [entry.profile_id, entry.membership_role]));
  }, [directoryMembers]);

  const filteredUnits = useMemo(() => {
    const query = unitsSearchTerm.trim().toLowerCase();
    if (!query) return units;

    return units.filter((unit: any) => {
      const unitLabel = `${unit.block || ""}-${unit.number || unit.unit_number || ""}`.toLowerCase();
      const ownerName = unit.profiles
        ? `${unit.profiles.first_name || ""} ${unit.profiles.last_name || ""}`.trim().toLowerCase()
        : "";
      const status = `${unit.status || ""}`.toLowerCase();

      return (
        unitLabel.includes(query) ||
        ownerName.includes(query) ||
        status.includes(query) ||
        `${unit.number || unit.unit_number || ""}`.toLowerCase().includes(query)
      );
    });
  }, [units, unitsSearchTerm]);

  const residentsWithDirectory = useMemo(() => {
    return (communityResidents as any[]).map((resident) => {
      const displayName =
        resident.full_name ||
        `${resident.first_name || ""} ${resident.last_name || ""}`.trim() ||
        resident.email ||
        "Unknown Resident";

      const unitLabel =
        resident.unit?.block && (resident.unit?.number || resident.unit?.unit_number)
          ? `${resident.unit.block}-${resident.unit.number || resident.unit.unit_number}`
          : "Unassigned";

      const directoryRole = directoryRoleByProfileId.get(resident.id) || "member";

      return {
        ...resident,
        displayName,
        unitLabel,
        directoryRole,
      };
    });
  }, [communityResidents, directoryRoleByProfileId]);

  const filteredResidents = useMemo(() => {
    const query = residentsSearchTerm.trim().toLowerCase();
    if (!query) return residentsWithDirectory;

    return residentsWithDirectory.filter((resident) => {
      return (
        resident.displayName.toLowerCase().includes(query) ||
        `${resident.email || ""}`.toLowerCase().includes(query) ||
        `${resident.phone || ""}`.toLowerCase().includes(query) ||
        `${resident.unitLabel || ""}`.toLowerCase().includes(query)
      );
    });
  }, [residentsWithDirectory, residentsSearchTerm]);

  const residentsWithAssignedUnits = residentsWithDirectory.filter(
    (resident) => resident.unitLabel !== "Unassigned"
  ).length;
  const residentsAdminCount = residentsWithDirectory.filter(
    (resident) => resident.directoryRole === "admin"
  ).length;
  const residentsCommitteeCount = residentsWithDirectory.filter(
    (resident) => resident.directoryRole === "committee"
  ).length;

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
  const occupancyRate = units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0;
  const amenityNames = community.amenity_names || [];
  const maintenanceCharge = Number(community.maintenance_charge || 0);
  const securityDeposit = Number(community.security_deposit || 0);
  const establishedYear = community.established_year
    ? String(community.established_year)
    : community.created_at
      ? String(new Date(community.created_at).getFullYear())
      : "N/A";
  const communityTypeLabel = community.society_type
    ? String(community.society_type).replace(/_/g, " ")
    : "Community";
  const knownUnitArea = units.reduce(
    (sum, unit) => sum + (Number(unit.area || unit.area_sqft || unit.floor_area || 0) || 0),
    0
  );
  const recentResidents = residentsWithDirectory
    .slice()
    .sort(
      (left, right) =>
        new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
    )
    .map((resident) => ({
      id: resident.id,
      name: resident.displayName,
      email: resident.email || null,
      created_at: resident.created_at || null,
      unitLabel: resident.unitLabel || null,
    }));
  const recentUnits = units
    .slice()
    .sort(
      (left, right) =>
        new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
    )
    .map((unit: any) => ({
      id: unit.id,
      label: unit.number || unit.unit_number || `Unit ${unit.id.slice(0, 8)}`,
      status: unit.status || null,
      created_at: unit.created_at || null,
    }));
  const statusLabel = String(community.status || "unknown").replace(/_/g, " ");
  const agencyName = community.agencies?.name || "Not assigned";
  const agencyEmail = community.agencies?.email || null;
  const agencyPhone = community.agencies?.phone || null;
  const residentAssignmentRate =
    residentsWithDirectory.length > 0
      ? Math.round((residentsWithAssignedUnits / residentsWithDirectory.length) * 100)
      : 0;
  const formatAmount = (value: number) => (value > 0 ? value.toLocaleString() : "Not configured");

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
      <CommunityDetailsBanner
        community={community}
        summary={{
          totalUnits: units.length,
          occupiedUnits: occupiedUnits.length,
          occupancyRate,
        }}
      />
      
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
                    className={`px-4 py-3 ${activeTab === 'units' ? 'active' : ''}`}
                    onClick={() => setActiveTab('units')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-2" />
                    Units
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'residents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('residents')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2" />
                    Residents
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
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Total Units</div>
                      <h3 className="mb-0 text-white">{units.length}</h3>
                      <div className="text-white-75 small">{occupiedUnits.length} occupied</div>
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
                      <h3 className="mb-0 text-white">{occupancyRate}%</h3>
                      <div className="text-white-75 small">{vacantUnits.length} vacant units</div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:home-smile-bold-duotone" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">Residents</div>
                      <h3 className="mb-0 text-white">{residentsWithDirectory.length}</h3>
                      <div className="text-white-75 small">{residentAssignmentRate}% assigned to units</div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">Amenities Tracked</div>
                      <h3 className="mb-0 text-white">{amenityNames.length}</h3>
                      <div className="text-white-75 small">
                        {amenityNames.length > 0 ? "Live amenity records" : "No amenities recorded"}
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:stars-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:info-circle-bold-duotone" className="me-2 text-primary" />
                    Community Information
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Community Type</div>
                        <div className="fw-semibold mb-2 text-capitalize">{communityTypeLabel}</div>
                        <Badge bg={community.status === "inactive" ? "secondary" : "success"} className="rounded-pill">
                          {statusLabel}
                        </Badge>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Location</div>
                        <div className="fw-semibold">
                          {[community.address, community.city, community.state].filter(Boolean).join(", ") || "Not recorded"}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Agency</div>
                        <div className="fw-semibold">{agencyName}</div>
                        <div className="text-muted small">{agencyEmail || agencyPhone || "No agency contact recorded"}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Established</div>
                        <div className="fw-semibold">{establishedYear}</div>
                        <div className="text-muted small">Created from the live community record</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Maintenance Charge</div>
                        <div className="fw-semibold">{formatAmount(maintenanceCharge)}</div>
                        <div className="text-muted small">Configured per community record</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Security Deposit</div>
                        <div className="fw-semibold">{formatAmount(securityDeposit)}</div>
                        <div className="text-muted small">Configured per unit if present</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="text-muted small mb-1">Known Unit Area</div>
                        <div className="fw-semibold">
                          {knownUnitArea > 0 ? `${knownUnitArea.toLocaleString()} sqft` : "Not recorded"}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <Alert variant="light" className="h-100 mb-0 border">
                        Compliance documents, meeting schedules, and notice history are handled on their dedicated modules.
                        This overview only shows verified fields available on the live community record.
                      </Alert>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0">Operational Snapshot</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Occupancy</span>
                      <span className="fw-semibold">{occupiedUnits.length} / {units.length}</span>
                    </div>
                    <ProgressBar now={occupancyRate} variant="success" />
                  </div>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Resident Unit Assignment</span>
                      <span className="fw-semibold">{residentsWithAssignedUnits} / {residentsWithDirectory.length}</span>
                    </div>
                    <ProgressBar now={residentAssignmentRate} variant="primary" />
                  </div>
                  <div className="border rounded-3 p-3">
                    <div className="text-muted small mb-2">Amenity Coverage</div>
                    {amenityNames.length === 0 ? (
                      <div className="text-muted small">No active amenities are recorded for this community yet.</div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {amenityNames.slice(0, 8).map((amenity) => (
                          <Badge key={amenity} bg="light" text="dark" className="rounded-pill">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0">Verified Shortcuts</CardTitle>
                </CardHeader>
                <CardBody className="d-grid gap-2">
                  <Link href={`/communities/${community.id}/edit`} className="btn btn-outline-primary text-start">
                    <IconifyIcon icon="solar:pen-bold-duotone" className="me-2" />
                    Edit Community
                  </Link>
                  <Link href={`/property/list?communityId=${community.id}`} className="btn btn-outline-success text-start">
                    <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
                    View Units
                  </Link>
                  <Link href={`/property/add?communityId=${community.id}`} className="btn btn-outline-warning text-start">
                    <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-2" />
                    Add Unit
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:user-plus-bold-duotone" className="me-2 text-primary" />
                    Recent Residents
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {recentResidents.length === 0 ? (
                    <div className="text-muted">No resident records are available for this community yet.</div>
                  ) : (
                    recentResidents.slice(0, 5).map((resident) => (
                      <div key={resident.id} className="d-flex justify-content-between align-items-start border-bottom py-3">
                        <div>
                          <div className="fw-semibold">{resident.name}</div>
                          <div className="text-muted small">{resident.unitLabel || "Unit not assigned"}</div>
                          <div className="text-muted small">{resident.email || "No email recorded"}</div>
                        </div>
                        <div className="text-muted small">
                          {resident.created_at ? new Date(resident.created_at).toLocaleDateString() : "Unknown"}
                        </div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-2 text-primary" />
                    Recent Unit Records
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {recentUnits.length === 0 ? (
                    <div className="text-muted">No units are recorded for this community yet.</div>
                  ) : (
                    recentUnits.slice(0, 5).map((unit) => (
                      <div key={unit.id} className="d-flex justify-content-between align-items-start border-bottom py-3">
                        <div>
                          <div className="fw-semibold">{unit.label}</div>
                          <div className="text-muted small">
                            Status: {unit.status ? unit.status.replace(/_/g, " ") : "unknown"}
                          </div>
                        </div>
                        <div className="text-muted small">
                          {unit.created_at ? new Date(unit.created_at).toLocaleDateString() : "Unknown"}
                        </div>
                      </div>
                    ))
                  )}
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
                  <Link href={`/property/add?communityId=${community.id}`}>
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
                                   title="Unit edit flow is not wired yet"
                                   disabled
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
                     <Link href={`/property/list?communityId=${community.id}`}>
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

      {activeTab === 'units' && (
        <>
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Total Units</div>
                      <h3 className="mb-0 text-white">{units.length}</h3>
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
                      <div className="text-white-50 mb-1">Occupied</div>
                      <h3 className="mb-0 text-white">{occupiedUnits.length}</h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:home-bold-duotone" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">Vacant</div>
                      <h3 className="mb-0 text-white">{vacantUnits.length}</h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:home-broken" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">Occupancy Rate</div>
                      <h3 className="mb-0 text-white">
                        {units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0}%
                      </h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:chart-square-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent">
                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                    <div>
                      <CardTitle className="mb-1">Community Units</CardTitle>
                      <p className="text-muted mb-0 small">Search and review all units linked to this community.</p>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <FormControl
                        value={unitsSearchTerm}
                        onChange={(event) => setUnitsSearchTerm(event.target.value)}
                        placeholder="Search by unit, owner, or status..."
                        style={{ minWidth: 280 }}
                      />
                      <Link href={`/property/add?communityId=${community.id}`}>
                        <Button variant="primary">
                          <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                          Add Unit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive" style={{ maxHeight: "34rem", overflow: "auto" }}>
                    <Table className="table-centered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Unit</th>
                          <th>Block / Floor</th>
                          <th>Type / Area</th>
                          <th>Status</th>
                          <th>Owner / Tenant</th>
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
                            <td colSpan={7} className="text-center text-danger py-4">
                              Failed to load units for this community.
                            </td>
                          </tr>
                        ) : filteredUnits.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center text-muted py-4">
                              {units.length === 0 ? "No units found." : "No units match your search."}
                            </td>
                          </tr>
                        ) : (
                          filteredUnits.map((unit: any) => {
                            const profile =
                              unit.profiles &&
                              typeof unit.profiles === "object" &&
                              "first_name" in unit.profiles
                                ? (unit.profiles as {
                                    first_name: string;
                                    last_name: string;
                                    email: string;
                                  })
                                : null;

                            return (
                              <tr key={unit.id}>
                                <td>
                                  <div className="fw-semibold">{unit.number || unit.unit_number || "N/A"}</div>
                                </td>
                                <td>
                                  <div>Block {unit.block || "—"}</div>
                                  <div className="text-muted small">Floor {unit.floor || "—"}</div>
                                </td>
                                <td>
                                  <div>{unit.bedrooms || "—"} BHK</div>
                                  <div className="text-muted small">{unit.floor_area || unit.area_sqft || "—"} sqft</div>
                                </td>
                                <td>
                                  <Badge bg={unit.status === "occupied" ? "success" : "warning"}>
                                    {unit.status === "occupied" ? "Occupied" : "Available"}
                                  </Badge>
                                </td>
                                <td>
                                  {profile?.first_name || profile?.last_name ? (
                                    <div>
                                      <div className="fw-medium">
                                        {profile.first_name} {profile.last_name}
                                      </div>
                                      <div className="text-muted small">{profile.email || "N/A"}</div>
                                    </div>
                                  ) : (
                                    <span className="text-muted">—</span>
                                  )}
                                </td>
                                <td>{unit.rent_amount ? `₹${Number(unit.rent_amount).toLocaleString()}` : "—"}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Link href={`/property/details?id=${unit.id}`}>
                                      <Button variant="light" size="sm" title="View Unit">
                                        <IconifyIcon icon="solar:eye-bold-duotone" />
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="light"
                                      size="sm"
                                      title="Unit edit flow is not wired yet"
                                      disabled
                                    >
                                      <IconifyIcon icon="solar:pen-bold-duotone" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'residents' && (
        <>
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Total Residents</div>
                      <h3 className="mb-0 text-white">{residentsWithDirectory.length}</h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">With Unit Assigned</div>
                      <h3 className="mb-0 text-white">{residentsWithAssignedUnits}</h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:home-smile-bold-duotone" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">Directory Admins</div>
                      <h3 className="mb-0 text-white">{residentsAdminCount}</h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:shield-user-bold-duotone" className="fs-24 text-white" />
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
                      <div className="text-white-50 mb-1">Committee Members</div>
                      <h3 className="mb-0 text-white">{residentsCommitteeCount}</h3>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:user-check-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent">
                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                    <div>
                      <CardTitle className="mb-1">Community Residents</CardTitle>
                      <p className="text-muted mb-0 small">Track all residents and their assigned units and directory roles.</p>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <FormControl
                        value={residentsSearchTerm}
                        onChange={(event) => setResidentsSearchTerm(event.target.value)}
                        placeholder="Search by resident, contact, or unit..."
                        style={{ minWidth: 280 }}
                      />
                      <Link href="/residents/grid-view">
                        <Button variant="outline-primary">
                          <IconifyIcon icon="solar:eye-bold-duotone" className="me-1" />
                          Open Residents Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive" style={{ maxHeight: "34rem", overflow: "auto" }}>
                    <Table className="table-centered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Resident</th>
                          <th>Contact</th>
                          <th>Unit</th>
                          <th>Community</th>
                          <th>Directory Role</th>
                          <th>Joined</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {residentsLoading ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading residents...</span>
                              </div>
                            </td>
                          </tr>
                        ) : residentsError ? (
                          <tr>
                            <td colSpan={8} className="text-center text-danger py-4">
                              Failed to load residents for this community.
                            </td>
                          </tr>
                        ) : filteredResidents.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center text-muted py-4">
                              {residentsWithDirectory.length === 0 ? "No residents found." : "No residents match your search."}
                            </td>
                          </tr>
                        ) : (
                          filteredResidents.map((resident: any) => (
                            <tr key={resident.id}>
                              <td>
                                <div className="fw-semibold">{resident.displayName}</div>
                                <div className="text-muted small">{resident.user_id ? `Auth: ${resident.user_id.slice(0, 8)}...` : "Auth ID unavailable"}</div>
                              </td>
                              <td>
                                <div>{resident.email || "N/A"}</div>
                                <div className="text-muted small">{resident.phone || "No phone"}</div>
                              </td>
                              <td>{resident.unitLabel}</td>
                              <td>{community?.name || resident.community?.name || "N/A"}</td>
                              <td>
                                <Badge bg={roleBadgeVariant(resident.directoryRole)}>
                                  {roleLabel(resident.directoryRole)}
                                </Badge>
                              </td>
                              <td>{resident.created_at ? new Date(resident.created_at).toLocaleDateString() : "—"}</td>
                              <td>
                                <Badge bg={resident.is_active === false ? "secondary" : "success"} className="rounded-pill">
                                  {resident.is_active === false ? "Inactive" : "Active"}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Link href={`/residents/details?id=${resident.id}`}>
                                    <Button variant="light" size="sm" title="View Resident">
                                      <IconifyIcon icon="solar:eye-bold-duotone" />
                                    </Button>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'analytics' && (
        <CommunityAnalytics
          summary={{
            totalUnits: units.length,
            occupiedUnits: occupiedUnits.length,
            vacantUnits: vacantUnits.length,
            occupancyRate,
            totalResidents: residentsWithDirectory.length,
            residentsWithAssignedUnits,
            adminCount: residentsAdminCount,
            committeeCount: residentsCommitteeCount,
          }}
        />
      )}

      {activeTab === 'financials' && (
        <CommunityFinancials
          summary={{
            maintenanceCharge,
            occupiedUnits: occupiedUnits.length,
            totalUnits: units.length,
            securityDeposit,
            parkingSlots: Number(community.parking_slots || 0),
            totalAreaSqft: knownUnitArea,
          }}
        />
      )}

      {activeTab === 'activities' && (
        <CommunityActivities
          communityId={community.id}
          residents={recentResidents}
          units={recentUnits}
        />
      )}

      {activeTab === 'management' && (
        <>
          <Row className="mb-4">
            <Col xl={12}>
              <Card className="border-0 shadow-sm">
                <CardBody className="p-4">
                  <Row className="g-4 align-items-start">
                    <Col lg={8}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="avatar-lg bg-primary-subtle rounded-circle flex-centered me-3">
                          <IconifyIcon icon="solar:settings-bold-duotone" className="fs-24 text-primary" />
                        </div>
                        <div>
                          <CardTitle as="h3" className="mb-1">
                            Management Snapshot
                          </CardTitle>
                          <p className="text-muted mb-0">
                            This tab surfaces verified agency, directory, and staff records for {community.name}.
                          </p>
                        </div>
                      </div>

                      <Row className="g-3">
                        <Col md={6}>
                          <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small mb-1">Agency</div>
                            <div className="fw-semibold">{agencyName}</div>
                            <div className="text-muted small">{agencyEmail || agencyPhone || "No agency contact recorded"}</div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small mb-1">Community Status</div>
                            <div className="fw-semibold text-capitalize">{statusLabel}</div>
                            <div className="text-muted small">Established {establishedYear}</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small mb-1">Directory Roles</div>
                            <div className="fw-semibold">{directoryMembers.length}</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small mb-1">Admins</div>
                            <div className="fw-semibold">{residentsAdminCount}</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small mb-1">Committee</div>
                            <div className="fw-semibold">{residentsCommitteeCount}</div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small mb-1">Staff Records</div>
                            <div className="fw-semibold">{communityStaff.length}</div>
                          </div>
                        </Col>
                      </Row>
                    </Col>

                    <Col lg={4}>
                      <Alert variant="info" className="mb-3">
                        Launch-facing actions on this tab stay limited to verified routes. Notices, billing collection,
                        meeting scheduling, and document storage remain on their dedicated modules.
                      </Alert>
                      <div className="d-grid gap-2">
                        <Link href={`/communities/${community.id}/edit`} className="btn btn-outline-primary text-start">
                          <IconifyIcon icon="solar:pen-bold-duotone" className="me-2" />
                          Edit Community
                        </Link>
                        <Link href={`/property/list?communityId=${community.id}`} className="btn btn-outline-success text-start">
                          <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
                          View Units
                        </Link>
                        <Link href={`/property/add?communityId=${community.id}`} className="btn btn-outline-warning text-start">
                          <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-2" />
                          Add Unit
                        </Link>
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
                    <Button variant="primary" size="sm" onClick={() => setShowAddMemberModal(true)}>
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
                    <div className="border rounded-3" style={{ maxHeight: "28rem", overflow: "auto" }}>
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
                                {member.profile.unit?.block && (member.profile.unit?.number || member.profile.unit?.unit_number)
                                  ? `${member.profile.unit.block}-${member.profile.unit.number || member.profile.unit.unit_number}`
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
                        <div className="text-muted">No active staff records were found for this community.</div>
                      </Col>
                    ) : (
                      communityStaff.map((staff: any) => (
                        <Col md={6} key={staff.id} className="mb-3">
                          <div className="p-3 border rounded-3 h-100">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <h6 className="mb-0">
                                {`${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Staff Member"}
                              </h6>
                              <Badge
                                bg={staff.status === "active" ? "success" : "secondary"}
                                className="rounded-pill small"
                              >
                                {staff.status || "Unknown"}
                              </Badge>
                            </div>
                            <p className="text-muted mb-1 small">{staff.position || "Unassigned Position"}</p>
                            <p className="text-muted mb-1 small">
                              <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                              {staff.shift || "Shift not set"}
                            </p>
                            <p className="text-muted mb-0 small">
                              {staff.email || staff.phone || "No contact information recorded"}
                            </p>
                          </div>
                        </Col>
                      ))
                    )}
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:buildings-bold-duotone" className="me-2 text-primary" />
                    Agency Record
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="border rounded-3 p-3 mb-3">
                    <div className="text-muted small mb-1">Agency Name</div>
                    <div className="fw-semibold">{agencyName}</div>
                  </div>
                  <div className="border rounded-3 p-3 mb-3">
                    <div className="text-muted small mb-1">Contact</div>
                    <div className="fw-semibold">{agencyEmail || "No email recorded"}</div>
                    <div className="text-muted small">{agencyPhone || "No phone recorded"}</div>
                  </div>
                  <div className="border rounded-3 p-3">
                    <div className="text-muted small mb-1">Community Address</div>
                    <div className="fw-semibold">
                      {[community.address, community.city, community.state].filter(Boolean).join(", ") || "Not recorded"}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:chart-square-bold-duotone" className="me-2 text-primary" />
                    Coverage
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Resident Assignment</span>
                      <span className="fw-semibold">{residentAssignmentRate}%</span>
                    </div>
                    <ProgressBar now={residentAssignmentRate} variant="primary" />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Occupancy</span>
                      <span className="fw-semibold">{occupancyRate}%</span>
                    </div>
                    <ProgressBar now={occupancyRate} variant="success" />
                  </div>
                  <Alert variant="light" className="mb-0 border">
                    Directory and staff records here are live. Action-heavy operational workflows stay on the audited
                    Residents, Payments, Maintenance, and Notices modules.
                  </Alert>
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
