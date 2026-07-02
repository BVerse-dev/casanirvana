"use client";

import PageTitle from "@/components/PageTitle";
import OwnerDetails from "./components/OwnerDetails";
import PropertyDetails from "./components/PropertyDetails";
import { Col, Row, Spinner, Alert } from "react-bootstrap";
import { Metadata } from "next";
import { useSearchParams } from "next/navigation";
import { useGetUnit } from "@/hooks/useUnits";
import Link from "next/link";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

const UnitDetailsPage = () => {
  // Get unitId from URL query parameter
  const searchParams = useSearchParams();
  const unitId = searchParams.get('id');
  
  // Fetch unit data if ID is provided
  const { data: unit, isLoading, error } = useGetUnit(unitId || '');
  
  if (!unitId) {
    return (
      <>
        <PageTitle title="Unit Overview" subName="Casa Nirvana" />
        <Row>
          <Col lg={12}>
            <Alert variant="warning">
              No unit ID provided. Please select a unit from the list or grid view.
            </Alert>
          </Col>
        </Row>
      </>
    );
  }
  
  if (isLoading) {
    return (
      <>
        <PageTitle title="Unit Overview" subName="Casa Nirvana" />
        <Row>
          <Col lg={12} className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading unit details...</p>
          </Col>
        </Row>
      </>
    );
  }
  
  if (error || !unit) {
    return (
      <>
        <PageTitle title="Unit Overview" subName="Casa Nirvana" />
        <Row>
          <Col lg={12}>
            <Alert variant="danger">
              <h5>Error Loading Unit</h5>
              <p>{error?.message || "Unit not found"}</p>
            </Alert>
          </Col>
        </Row>
      </>
    );
  }

  const mapQuery = encodeURIComponent(
    unit.communities?.address ||
      [unit.communities?.name, unit.communities?.city, unit.communities?.state].filter(Boolean).join(", ") ||
      "Ghana"
  );

  return (
    <>
      <PageTitle title="Unit Overview" subName="Casa Nirvana" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/property/list" 
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
              Back to Units
            </Link>
          </div>
        </Col>
      </Row>
      
      <Row>
        <OwnerDetails />
        <PropertyDetails />
      </Row>
      <Row>
        <Col lg={12}>
          <div className="mapouter">
            <div className="gmap_canvas mb-2">
              <iframe
                className="gmap_iframe rounded"
                width="100%"
                style={{ height: 400 }}
                frameBorder={0}
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?width=1980&height=400&hl=en&q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
              />
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default UnitDetailsPage;
