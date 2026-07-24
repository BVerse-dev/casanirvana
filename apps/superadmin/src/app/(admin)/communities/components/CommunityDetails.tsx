"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetCommunity } from "@/hooks/useCommunities";
import {
  useCommunityDirectoryMembers,
  useCommunityResidents,
} from "@/hooks/useCommunityDirectoryMembers";
import { useListUnits } from "@/hooks/useUnits";
import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import CommunityActivities from "../details/components/CommunityActivities";
import CommunityAnalytics from "../details/components/CommunityAnalytics";
import CommunityDetailsBanner from "../details/components/CommunityDetailsBanner";
import CommunityFinancials from "../details/components/CommunityFinancials";

type CommunityTab =
  | "overview"
  | "units"
  | "residents"
  | "analytics"
  | "financials"
  | "activities"
  | "management";

const text = (value?: string | null) => value?.trim() || "Not recorded";
const label = (value?: string | null) =>
  value ? value.replaceAll("_", " ").replaceAll("-", " ") : "Not recorded";
const money = (value?: number | null) =>
  value == null ? "Not recorded" : "GH₵ " + value.toLocaleString();

const CommunityDetails = ({ communityId }: { communityId: string }) => {
  const [activeTab, setActiveTab] = useState<CommunityTab>("overview");
  const communityQuery = useGetCommunity(communityId);
  const unitsQuery = useListUnits({ communityId, page: 1, pageSize: 200 });
  const residentsQuery = useCommunityResidents(communityId);
  const directoryQuery = useCommunityDirectoryMembers(communityId);

  if (communityQuery.isLoading) {
    return (
      <>
        <PageTitle title="Community Details" subName="Communities" />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading community...</p>
        </div>
      </>
    );
  }

  const community = communityQuery.data;
  if (communityQuery.isError || !community) {
    return (
      <>
        <PageTitle title="Community Details" subName="Communities" />
        <Alert variant="danger">
          The requested community could not be loaded or is outside your authorized scope.
        </Alert>
      </>
    );
  }

  const units = unitsQuery.data?.data || [];
  const residents = residentsQuery.data || [];
  const directoryMembers = directoryQuery.data || [];
  const occupiedUnits = units.filter((unit) => unit.status === "occupied");
  const vacantUnits = units.filter((unit) => unit.status === "vacant" || unit.status === "available");
  const totalUnits = community.unit_count ?? unitsQuery.data?.count ?? units.length;
  const occupiedCount = community.occupied_unit_count ?? occupiedUnits.length;
  const vacantCount = community.vacancy_count ?? Math.max(totalUnits - occupiedCount, vacantUnits.length);
  const occupancyRate =
    community.occupancy_rate ??
    (totalUnits > 0 ? Math.round((occupiedCount / totalUnits) * 100) : 0);
  const adminCount = directoryMembers.filter((entry) => entry.membership_role === "admin").length;
  const committeeCount = directoryMembers.filter((entry) => entry.membership_role === "committee").length;
  const residentsWithAssignedUnits = residents.filter((resident) => Boolean(resident.unit_id)).length;
  const knownUnitArea = units.reduce(
    (sum, unit) => sum + Number(unit.area ?? unit.floor_area ?? 0),
    0,
  );

  const analyticsSummary = {
    totalUnits,
    occupiedUnits: occupiedCount,
    vacantUnits: vacantCount,
    occupancyRate,
    totalResidents: residents.length,
    residentsWithAssignedUnits,
    adminCount,
    committeeCount,
  };

  const recentResidents = residents.map((resident) => ({
    id: resident.id,
    name:
      resident.full_name ||
      [resident.first_name, resident.last_name].filter(Boolean).join(" ") ||
      "Unnamed resident",
    email: resident.email,
    created_at: resident.created_at,
    unitLabel: resident.unit
      ? [resident.unit.block, resident.unit.number || resident.unit.unit_number]
          .filter(Boolean)
          .join("-")
      : null,
  }));
  const recentUnits = units.map((unit) => ({
    id: unit.id,
    label: "Unit " + (unit.unit_number || unit.number || "Unnumbered"),
    status: unit.status,
    created_at: unit.created_at,
  }));

  const tabs: Array<{ key: CommunityTab; label: string; icon: string }> = [
    { key: "overview", label: "Overview", icon: "solar:home-2-bold-duotone" },
    { key: "units", label: "Units", icon: "solar:buildings-2-bold-duotone" },
    { key: "residents", label: "Residents", icon: "solar:users-group-two-rounded-bold-duotone" },
    { key: "analytics", label: "Analytics", icon: "solar:chart-2-bold-duotone" },
    { key: "financials", label: "Financials", icon: "solar:wallet-money-bold-duotone" },
    { key: "activities", label: "Activities", icon: "solar:clock-circle-bold-duotone" },
    { key: "management", label: "Management", icon: "solar:settings-bold-duotone" },
  ];

  return (
    <>
      <PageTitle title="Community Overview" subName="Communities" />
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Link href="/communities" className="btn btn-light">
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Back to Communities
        </Link>
        <div className="d-flex flex-wrap gap-2">
          <Link href={"/units/add?communityId=" + community.id} className="btn btn-success">
            <IconifyIcon icon="ri:add-line" className="me-1" />
            Add Unit
          </Link>
          <Link href={"/communities/" + community.id + "/edit"} className="btn btn-primary">
            <IconifyIcon icon="ri:edit-line" className="me-1" />
            Edit Community
          </Link>
        </div>
      </div>

      <CommunityDetailsBanner
        community={community}
        summary={{ totalUnits, occupiedUnits: occupiedCount, occupancyRate }}
      />

      <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-0">
          <Nav variant="tabs" className="nav-tabs-custom border-bottom-0 flex-nowrap overflow-auto">
            {tabs.map((tab) => (
              <NavItem key={tab.key}>
                <NavLink
                  className={"px-4 py-3 text-nowrap " + (activeTab === tab.key ? "active" : "")}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ cursor: "pointer" }}
                >
                  <IconifyIcon icon={tab.icon} className="me-2" />
                  {tab.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </CardBody>
      </Card>

      {(unitsQuery.isError || residentsQuery.isError || directoryQuery.isError) && (
        <Alert variant="warning">
          Some community sections could not be loaded. Available records are shown below.
        </Alert>
      )}

      {activeTab === "overview" && (
        <>
          <CommunityAnalytics summary={analyticsSummary} />
          <Row className="g-3 mb-4">
            <Col xl={8}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent">
                  <CardTitle as="h4">Community Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row className="g-4">
                    {[
                      ["Type", label(community.society_type)],
                      ["Address", text(community.address)],
                      ["City", text(community.city)],
                      ["State/Region", text(community.state)],
                      ["Postal code", text(community.pincode)],
                      ["Established", String(community.established_year || "Not recorded")],
                      ["Blocks", String(community.total_blocks ?? "Not recorded")],
                      ["Floors", String(community.total_floors ?? "Not recorded")],
                    ].map(([title, value]) => (
                      <Col md={6} key={title}>
                        <small className="text-muted d-block">{title}</small>
                        <span className="fw-medium">{value}</span>
                      </Col>
                    ))}
                  </Row>
                  {community.description && <p className="mt-4 mb-0">{community.description}</p>}
                </CardBody>
              </Card>
            </Col>
            <Col xl={4}>
              <Card className="border-0 shadow-sm mb-3">
                <CardBody>
                  <h4 className="mb-3">Management</h4>
                  <p className="fw-medium mb-1">{community.agencies?.name || "Platform managed"}</p>
                  <p className="text-muted mb-1">{community.email || community.agencies?.email || "Email not recorded"}</p>
                  <p className="text-muted mb-0">{community.phone || community.agencies?.phone || "Phone not recorded"}</p>
                </CardBody>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardBody>
                  <h4 className="mb-3">Active Amenities</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {community.amenity_names?.length ? (
                      community.amenity_names.map((amenity) => (
                        <Badge bg="light" text="dark" key={amenity}>{amenity}</Badge>
                      ))
                    ) : (
                      <span className="text-muted small">No amenities recorded.</span>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === "units" && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
            <CardTitle as="h4" className="mb-0">Community Units</CardTitle>
            <Link href={"/units?communityId=" + community.id} className="btn btn-sm btn-primary">Open Unit Directory</Link>
          </CardHeader>
          <CardBody>
            {unitsQuery.isLoading ? <Spinner animation="border" size="sm" /> : units.length ? (
              <Table responsive hover className="mb-0 align-middle">
                <thead><tr><th>Unit</th><th>Type</th><th>Status</th><th>Floor</th><th>Rent</th><th /></tr></thead>
                <tbody>
                  {units.slice(0, 12).map((unit) => (
                    <tr key={unit.id}>
                      <td className="fw-medium">Unit {unit.unit_number || unit.number || "Unnumbered"}</td>
                      <td>{label(unit.type)}</td>
                      <td><Badge bg={unit.status === "occupied" ? "success" : "primary"}>{label(unit.status)}</Badge></td>
                      <td>{unit.floor ?? "Not recorded"}</td>
                      <td>{money(unit.rent_amount)}</td>
                      <td className="text-end"><Link href={"/units/" + unit.id}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : <div className="text-muted">No Units are recorded for this Community yet.</div>}
          </CardBody>
        </Card>
      )}

      {activeTab === "residents" && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent">
            <CardTitle as="h4">Community Residents</CardTitle>
          </CardHeader>
          <CardBody>
            {residentsQuery.isLoading ? <Spinner animation="border" size="sm" /> : residents.length ? (
              <Table responsive hover className="mb-0 align-middle">
                <thead><tr><th>Resident</th><th>Email</th><th>Unit</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {residents.slice(0, 12).map((resident) => (
                    <tr key={resident.id}>
                      <td className="fw-medium">{resident.full_name || [resident.first_name, resident.last_name].filter(Boolean).join(" ") || "Unnamed resident"}</td>
                      <td>{resident.email || "Not recorded"}</td>
                      <td>{resident.unit ? [resident.unit.block, resident.unit.number || resident.unit.unit_number].filter(Boolean).join("-") : "Not assigned"}</td>
                      <td><Badge bg={resident.is_active === false ? "secondary" : "success"}>{resident.is_active === false ? "Inactive" : "Active"}</Badge></td>
                      <td className="text-end"><Link href={"/residents/" + resident.id}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : <div className="text-muted">No Resident records are available for this Community yet.</div>}
          </CardBody>
        </Card>
      )}

      {activeTab === "analytics" && <CommunityAnalytics summary={analyticsSummary} />}
      {activeTab === "financials" && (
        <CommunityFinancials
          summary={{
            maintenanceCharge: Number(community.maintenance_charge || 0),
            occupiedUnits: occupiedCount,
            totalUnits,
            securityDeposit: Number(community.security_deposit || 0),
            parkingSlots: Number(community.parking_slots || 0),
            totalAreaSqft: knownUnitArea,
          }}
        />
      )}
      {activeTab === "activities" && (
        <CommunityActivities communityId={community.id} residents={recentResidents} units={recentUnits} />
      )}
      {activeTab === "management" && (
        <Row className="g-3 mb-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm h-100">
              <CardHeader className="bg-transparent"><CardTitle as="h4">Directory Leadership</CardTitle></CardHeader>
              <CardBody>
                {directoryQuery.isLoading ? <Spinner animation="border" size="sm" /> : directoryMembers.length ? (
                  directoryMembers.map((entry) => (
                    <div className="d-flex justify-content-between align-items-center border-bottom py-3" key={entry.id}>
                      <div>
                        <div className="fw-medium">{entry.profile.full_name || [entry.profile.first_name, entry.profile.last_name].filter(Boolean).join(" ") || "Unnamed member"}</div>
                        <small className="text-muted">{entry.profile.email || "No email recorded"}</small>
                      </div>
                      <Badge bg={entry.membership_role === "admin" ? "primary" : entry.membership_role === "committee" ? "warning" : "secondary"}>
                        {label(entry.membership_role)}
                      </Badge>
                    </div>
                  ))
                ) : <div className="text-muted">No directory leadership records are configured.</div>}
              </CardBody>
            </Card>
          </Col>
          <Col lg={5}>
            <Card className="border-0 shadow-sm h-100">
              <CardHeader className="bg-transparent"><CardTitle as="h4">Community Configuration</CardTitle></CardHeader>
              <CardBody>
                <div className="d-flex justify-content-between mb-3"><span>Status</span><Badge bg={community.status === "inactive" ? "secondary" : "success"}>{label(community.status)}</Badge></div>
                <div className="d-flex justify-content-between mb-3"><span>Maintenance charge</span><strong>{money(community.maintenance_charge)}</strong></div>
                <div className="d-flex justify-content-between mb-3"><span>Security deposit</span><strong>{money(community.security_deposit)}</strong></div>
                <div className="d-grid mt-4"><Link href={"/communities/" + community.id + "/edit"} className="btn btn-primary">Edit Community Configuration</Link></div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default CommunityDetails;
