"use client";

import WorldVectorMap from "@/components/VectorMap/WorldMap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";
import { useAdminAnalyticsDashboard } from "@/hooks/useAdminAnalyticsDashboard";

const SalesLocation = () => {
  const { data: dashboard } = useAdminAnalyticsDashboard();
  const distributionData = dashboard?.communityDistribution || [];

  const salesLocationOptions = {
    map: "world",
    zoomOnScroll: true,
    zoomButtons: false,
    markersSelectable: false,
    markers: [],
    markerStyle: {
      initial: {
        fill: "#7f56da",
      },
      selected: {
        fill: "#1bb394",
      },
    },
    regionStyle: {
      initial: {
        fill: "rgba(169,183,197, 0.3)",
        fillOpacity: 1,
      },
    },
  };

  return (
    <Col xl={6} lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <div>
            <CardTitle as={"h4"}>Resident Distribution</CardTitle>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Active Communities
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem>Community coordinates unavailable in the current schema</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <Row>
            <Col xl={12}>
              <div id="most-sales-location" className="mt-3" style={{ height: 322 }}>
                <WorldVectorMap height="322" width="100%" options={salesLocationOptions} />
              </div>
              <p className="text-muted small mt-3 mb-0">
                Distribution is shown by community below. The checked-in schema does not currently store latitude/longitude for mapped community pins.
              </p>
            </Col>
          </Row>
          <div className="progress mt-5 overflow-visible" style={{ height: 25 }}>
            {distributionData.map((community, index) => {
              const colors = [
                "bg-primary",
                "bg-primary bg-opacity-75",
                "bg-primary bg-opacity-50",
                "bg-primary bg-opacity-25",
                "bg-primary bg-opacity-10",
              ];

              const widthPercentage = Math.max(
                distributionData.length > 0 ? 100 / distributionData.length : 20,
                15
              );

              return (
                <div
                  key={community.id}
                  className={`progress-bar ${colors[index]} position-relative overflow-visible ${
                    index === 0
                      ? "rounded-start"
                      : index === distributionData.length - 1
                        ? "rounded-end"
                        : ""
                  }`}
                  role="progressbar"
                  style={{ width: `${widthPercentage}%` }}
                  aria-valuenow={community.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <p
                    className="progress-value text-start text-dark mb-0 mt-1 fs-14 fw-medium"
                    style={{ left: "0%", top: "-50px" }}
                  >
                    {community.name.substring(0, 15)}
                    {community.name.length > 15 ? "..." : ""}
                  </p>
                  <p
                    className="progress-value text-start text-light mb-0 mt-1 fs-14 fw-medium"
                    style={{ left: "0%", top: "-30px" }}
                  >
                    |
                  </p>
                  <p className="mb-0 text-start ps-1 ps-lg-2 text-white fs-14">
                    {community.count} residents
                  </p>
                </div>
              );
            })}
            {distributionData.length === 0 && (
              <div className="text-center text-muted py-2">No community resident data available</div>
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default SalesLocation;
