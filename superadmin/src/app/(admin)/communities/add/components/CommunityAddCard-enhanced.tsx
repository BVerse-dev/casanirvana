"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Button, Card, CardBody, CardFooter, Col, Row } from "react-bootstrap";
import { useState, useEffect } from "react";

interface CommunityAddCardProps {
  formData?: {
    name?: string;
    address?: string;
    description?: string;
  };
}

const CommunityAddCard = ({ formData }: CommunityAddCardProps) => {
  const [previewData, setPreviewData] = useState({
    name: "New Community",
    address: "Address will appear here",
    totalUnits: 0,
    occupiedUnits: 0,
    amenitiesCount: 0
  });

  useEffect(() => {
    if (formData) {
      setPreviewData(prev => ({
        ...prev,
        name: formData.name || "New Community",
        address: formData.address || "Address will appear here"
      }));
    }
  }, [formData]);

  const occupancyRate = previewData.totalUnits > 0 
    ? Math.round((previewData.occupiedUnits / previewData.totalUnits) * 100) 
    : 0;

  return (
    <Col xl={3} lg={4}>
      <Card>
        <CardBody>
          <div className="position-relative">
            <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '200px' }}>
              <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-48 text-muted" />
            </div>
            <span className="position-absolute top-0 end-0 p-1">
              <span className="badge bg-primary text-light fs-13">
                New Community
              </span>
            </span>
          </div>
          <div className="mt-3">
            <h4 className="mb-1">
              {previewData.name}
              <span className="fs-14 text-muted ms-1">(Residential)</span>
            </h4>
            <p className="mb-1 text-muted">{previewData.address}</p>
            <h5 className="text-dark fw-medium mt-3">Total Units:</h5>
            <h4 className="fw-semibold mt-2 text-primary">{previewData.totalUnits}</h4>
          </div>
          <Row className="mt-2 g-2">
            <Col lg={12} xs={12}>
              <span className="badge bg-light-subtle text-muted border fs-12 w-100 text-start">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:home-2-bold-duotone"
                    className="align-middle"
                  />
                </span>
                &nbsp;{previewData.totalUnits} Total Units
              </span>
            </Col>
            <Col lg={12} xs={12}>
              <span className="badge bg-light-subtle text-muted border fs-12 w-100 text-start">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:users-group-rounded-bold-duotone"
                    className="align-middle"
                  />
                </span>
                &nbsp;{previewData.occupiedUnits} Occupied
              </span>
            </Col>
            <Col lg={12} xs={12}>
              <span className="badge bg-light-subtle text-muted border fs-12 w-100 text-start">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:swimming-bold-duotone"
                    className="align-middle"
                  />
                </span>
                &nbsp;{previewData.amenitiesCount} Amenities
              </span>
            </Col>
            <Col lg={12} xs={12}>
              <span className="badge bg-light-subtle text-muted border fs-12 w-100 text-start">
                <span className="fs-16">
                  <IconifyIcon
                    icon="solar:chart-2-bold-duotone"
                    className="align-middle"
                  />
                </span>
                &nbsp;{occupancyRate}% Occupancy
              </span>
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="text-center">
          <small className="text-muted">Preview will update as you fill the form</small>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default CommunityAddCard;
