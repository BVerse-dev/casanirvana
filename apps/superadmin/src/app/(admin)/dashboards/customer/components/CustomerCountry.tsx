"use client";

import Image from "next/image";
import { Card, CardBody, Col, ProgressBar, Row } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import { mapSocietyToPropertyImage } from "@/utils/propertyImageMapper";

interface GuardLocationData {
  location: string;
  totalGuards: number;
  activeGuards: number;
  detail: string;
  progress: number;
  image: any;
  avgSalary: number;
}

const GuardLocationCard = ({ activeGuards, avgSalary, detail, image, location, progress, totalGuards }: GuardLocationData) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-light avatar d-flex align-items-center justify-content-center">
            <Image src={image} alt="location" className="avatar-sm rounded" width={40} height={40} />
          </div>
          <div>
            <h4 className="text-dark fw-semibold mb-1">{location}</h4>
            <p className="mb-0 fw-medium">
              <span className="text-dark fw-semibold">GH₵ {avgSalary.toLocaleString()} </span> Average Salary
            </p>
          </div>
        </div>
        <div className="d-flex align-items-end justify-content-between mt-3">
          <p className="mb-0 fw-medium fs-15">Active Guards</p>
          <div className="text-end">
            <p className="mb-1 fw-semibold text-dark">Coverage</p>
            <h4 className="text-primary mb-0 fw-semibold">{detail}</h4>
          </div>
        </div>
        <ProgressBar
          style={{ height: 10 }}
          now={progress}
          animated
          striped
          variant="bg-primary"
          className="mt-3 my-2 bg-opacity-75"
          role="progressbar"
        />
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="text-dark fw-bold mb-0">{activeGuards}</h4>
          <div>
            <p className="mb-0">Required : {totalGuards}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const GuardCountry = () => {
  const { data: dashboard, isLoading } = useGuardDashboardSnapshot();
  const guardSummary = dashboard?.summary;
  const locationData: GuardLocationData[] = (dashboard?.locationCards || []).map((item) => ({
    ...item,
    image: mapSocietyToPropertyImage(item.location),
  }));

  if (isLoading) {
    return (
      <Row>
        {[1, 2, 3, 4].map((i) => (
          <Col md={6} xl={6} key={i}>
            <Card>
              <CardBody>
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-8"></span>
                  <span className="placeholder col-12" style={{ height: "10px" }}></span>
                  <span className="placeholder col-4"></span>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (locationData.length === 0) {
    const summaryCards: GuardLocationData[] = [
      {
        location: "Active Guards",
        totalGuards: guardSummary?.totalGuards || 0,
        activeGuards: guardSummary?.activeGuards || 0,
        detail:
          (guardSummary?.totalGuards || 0) > 0
            ? `${Math.round(((guardSummary?.activeGuards || 0) / (guardSummary?.totalGuards || 1)) * 100)}% active`
            : "No guard roster",
        progress:
          (guardSummary?.totalGuards || 0) > 0
            ? Math.round(((guardSummary?.activeGuards || 0) / (guardSummary?.totalGuards || 1)) * 100)
            : 0,
        image: mapSocietyToPropertyImage("Active Guards"),
        avgSalary: 0,
      },
      {
        location: "On Duty",
        totalGuards: guardSummary?.activeGuards || 0,
        activeGuards: guardSummary?.onDutyGuards || 0,
        detail: `${guardSummary?.availableGuards || 0} available`,
        progress:
          (guardSummary?.activeGuards || 0) > 0
            ? Math.round(((guardSummary?.onDutyGuards || 0) / (guardSummary?.activeGuards || 1)) * 100)
            : 0,
        image: mapSocietyToPropertyImage("On Duty"),
        avgSalary: 0,
      },
      {
        location: "Training",
        totalGuards: guardSummary?.activeGuards || 0,
        activeGuards: guardSummary?.trainingRequired || 0,
        detail: `${guardSummary?.expiredCertifications || 0} expired certs`,
        progress:
          (guardSummary?.activeGuards || 0) > 0
            ? Math.round(((guardSummary?.trainingRequired || 0) / (guardSummary?.activeGuards || 1)) * 100)
            : 0,
        image: mapSocietyToPropertyImage("Training"),
        avgSalary: 0,
      },
    ];

    return (
      <Row>
        {summaryCards.map((item, idx) => (
          <Col md={6} xl={6} key={idx}>
            <GuardLocationCard {...item} />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row>
      {locationData.map((item, idx) => (
        <Col md={6} xl={6} key={idx}>
          <GuardLocationCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default GuardCountry;
