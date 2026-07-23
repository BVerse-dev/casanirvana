"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetCommunity } from "@/hooks/useCommunities";
import Link from "next/link";
import { Alert, Badge, Card, CardBody, Col, Row, Spinner } from "react-bootstrap";

const text = (value?: string | null) => value?.trim() || "Not recorded";
const label = (value?: string | null) => value ? value.replaceAll("_", " ").replaceAll("-", " ") : "Not recorded";
const money = (value?: number | null) => value == null ? "Not recorded" : `GH₵ ${value.toLocaleString()}`;

const CommunityDetails = ({ communityId }: { communityId: string }) => {
  const { data: community, isLoading, isError } = useGetCommunity(communityId);

  if (isLoading) return <><PageTitle title="Community Details" subName="Communities" /><div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-3">Loading community...</p></div></>;
  if (isError || !community) return <><PageTitle title="Community Details" subName="Communities" /><Alert variant="danger">The requested community could not be loaded or is outside your authorized scope.</Alert></>;

  return (
    <>
      <PageTitle title={community.name} subName="Communities" />
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <Link href="/communities" className="btn btn-light"><IconifyIcon icon="ri:arrow-left-line" className="me-1" />Back to Communities</Link>
        <div className="d-flex gap-2"><Link href={`/units?communityId=${community.id}`} className="btn btn-light">View Units</Link><Link href={`/communities/${community.id}/edit`} className="btn btn-primary"><IconifyIcon icon="ri:edit-line" className="me-1" />Edit Community</Link></div>
      </div>
      <Row className="g-3 mb-3">
        {[["Units", community.unit_count || 0, "solar:home-2-broken"], ["Occupied", community.occupied_unit_count || 0, "solar:users-group-rounded-broken"], ["Vacant", community.vacancy_count || 0, "solar:key-minimalistic-broken"], ["Occupancy", `${community.occupancy_rate || 0}%`, "solar:chart-2-broken"]].map(([title, value, icon]) => <Col xl={3} md={6} key={String(title)}><Card className="h-100"><CardBody className="d-flex align-items-center gap-3"><span className="avatar-md rounded bg-primary-subtle text-primary flex-centered"><IconifyIcon icon={String(icon)} width={26} /></span><div><small className="text-muted d-block">{title}</small><h4 className="mb-0">{value}</h4></div></CardBody></Card></Col>)}
      </Row>
      <Row className="g-3">
        <Col xl={8}><Card className="h-100"><CardBody><div className="d-flex justify-content-between align-items-center mb-4"><h4 className="mb-0">Community information</h4><Badge bg={community.status === "inactive" ? "secondary" : "success"}>{label(community.status)}</Badge></div><Row className="g-4">{[["Type", label(community.society_type)], ["Address", text(community.address)], ["City", text(community.city)], ["State/Region", text(community.state)], ["Postal code", text(community.pincode)], ["Established", community.established_year || "Not recorded"], ["Floors", community.total_floors ?? "Not recorded"], ["Blocks", community.total_blocks ?? "Not recorded"], ["Parking spaces", community.parking_slots ?? "Not recorded"], ["Total recorded area", community.total_area_sqft ? `${community.total_area_sqft.toLocaleString()} sq ft` : "Not recorded"]].map(([title, value]) => <Col md={6} key={String(title)}><small className="text-muted d-block">{title}</small><span className="fw-medium">{value}</span></Col>)}</Row>{community.description && <div className="mt-4"><small className="text-muted d-block">Description</small><p className="mb-0">{community.description}</p></div>}</CardBody></Card></Col>
        <Col xl={4}><div className="d-flex flex-column gap-3"><Card><CardBody><h4 className="mb-3">Management</h4><p className="fw-medium mb-1">{community.agencies?.name || "Platform managed"}</p><p className="text-muted mb-1">{community.email || community.agencies?.email || "Email not recorded"}</p><p className="text-muted mb-0">{community.phone || community.agencies?.phone || "Phone not recorded"}</p></CardBody></Card><Card><CardBody><h4 className="mb-3">Financial configuration</h4><div className="d-flex justify-content-between mb-2"><span>Maintenance charge</span><strong>{money(community.maintenance_charge)}</strong></div><div className="d-flex justify-content-between"><span>Security deposit</span><strong>{money(community.security_deposit)}</strong></div></CardBody></Card>{Boolean(community.amenity_names?.length) && <Card><CardBody><h4 className="mb-3">Active amenities</h4><div className="d-flex flex-wrap gap-2">{community.amenity_names?.map((amenity) => <Badge bg="light" text="dark" key={amenity}>{amenity}</Badge>)}</div></CardBody></Card>}</div></Col>
      </Row>
    </>
  );
};

export default CommunityDetails;
