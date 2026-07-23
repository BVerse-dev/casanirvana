"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGetUnit } from "@/hooks/useUnits";
import Link from "next/link";
import { Alert, Badge, Card, CardBody, Col, Row, Spinner } from "react-bootstrap";

const label = (value?: string | null) => value ? value.replaceAll("_", " ").replaceAll("-", " ") : "Not recorded";

const UnitDetails = ({ unitId }: { unitId: string }) => {
  const { data: unit, isLoading, isError } = useGetUnit(unitId);

  if (isLoading) return <><PageTitle title="Unit Details" subName="Units" /><div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-3">Loading unit details...</p></div></>;
  if (isError || !unit) return <><PageTitle title="Unit Details" subName="Units" /><Alert variant="danger">The requested unit could not be loaded or is outside your authorized scope.</Alert></>;

  const ownerName = unit.profiles?.full_name || [unit.profiles?.first_name, unit.profiles?.last_name].filter(Boolean).join(" ") || "No owner assigned";
  const unitName = `Unit ${unit.unit_number || unit.number || "Unnumbered"}`;

  return (
    <>
      <PageTitle title={unitName} subName="Units" />
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <Link href="/units" className="btn btn-light"><IconifyIcon icon="ri:arrow-left-line" className="me-1" />Back to Units</Link>
        <div className="d-flex align-items-center gap-2">
          <Badge bg={unit.status === "occupied" ? "success" : unit.status === "vacant" ? "primary" : "secondary"}>{label(unit.status)}</Badge>
          <Link href={`/units/${unit.id}/edit`} className="btn btn-primary"><IconifyIcon icon="ri:edit-line" className="me-1" />Edit Unit</Link>
        </div>
      </div>
      <Row className="g-3">
        <Col xl={8}><Card className="h-100"><CardBody><h4 className="mb-4">Unit information</h4><Row className="g-4">{[["Community", unit.communities?.name], ["Unit type", label(unit.type)], ["Floor", unit.floor], ["Area", unit.area == null ? null : `${unit.area} sq ft`], ["Rent", unit.rent_amount == null ? null : `GH₵ ${unit.rent_amount.toLocaleString()}`], ["Address", unit.communities?.address]].map(([title, value]) => <Col md={6} key={String(title)}><small className="text-muted d-block">{title}</small><span className="fw-medium">{value ?? "Not recorded"}</span></Col>)}</Row></CardBody></Card></Col>
        <Col xl={4}><Card className="h-100"><CardBody><h4 className="mb-4">Owner record</h4><p className="fw-medium mb-1">{ownerName}</p><p className="text-muted mb-1">{unit.profiles?.email || "Email not recorded"}</p><p className="text-muted mb-0">{unit.profiles?.phone || "Phone not recorded"}</p></CardBody></Card></Col>
      </Row>
    </>
  );
};

export default UnitDetails;
