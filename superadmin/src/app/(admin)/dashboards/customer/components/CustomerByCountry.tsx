"use client";

import WorldVectorMap from "@/components/VectorMap/WorldMap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "react-bootstrap";
import { useGuardDashboardSnapshot } from "@/hooks/useGuardDashboard";
import { useState } from "react";

const GuardsByLocation = () => {
  const { data: dashboard, isLoading } = useGuardDashboardSnapshot();
  const communityOverview = dashboard?.communityOverview || [];
  const [selectedSociety, setSelectedSociety] = useState<string>("All Communities");

  const filteredCommunities =
    selectedSociety === "All Communities"
      ? communityOverview
      : communityOverview.filter((community) => community.name === selectedSociety);

  const distributionData = filteredCommunities
    .filter((community) => community.currentGuards > 0 || community.requiredGuards > 0)
    .sort((left, right) => right.currentGuards - left.currentGuards || right.requiredGuards - left.requiredGuards)
    .slice(0, 5)
    .map((community) => ({
      name: community.name,
      count: community.currentGuards,
      required: community.requiredGuards,
      coverage: community.requiredGuards > 0 ? (community.currentGuards / community.requiredGuards) * 100 : 0,
    }));

  const worldMapOptions = {
    map: "world",
    zoomOnScroll: false,
    zoomButtons: false,
    markersSelectable: false,
    markers: [],
    markerStyle: {
      initial: { fill: "#5B8DEC" },
      selected: { fill: "#ed5565" },
    },
    regionStyle: {
      initial: {
        fill: "rgba(169,183,197, 0.3)",
        fillOpacity: 1,
      },
    },
  };

  if (isLoading) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Guard Coverage by Community</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder" style={{ height: "448px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <div>
            <CardTitle as={"h4"}>Guard Coverage by Community</CardTitle>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {selectedSociety}{" "}
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setSelectedSociety("All Communities")}>All Communities</DropdownItem>
              {communityOverview.slice(0, 10).map((community) => (
                <DropdownItem key={community.id} onClick={() => setSelectedSociety(community.name)}>
                  {community.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <Row>
            <Col xl={12}>
              <div id="guards-by-location-map" className="mt-3" style={{ height: 322 }}>
                <WorldVectorMap height="322" width="100%" options={worldMapOptions} />
              </div>
              <p className="text-muted small mt-3 mb-0">
                Community latitude and longitude are not stored in the current schema, so coverage is listed below instead of plotted with live pins.
              </p>
            </Col>
          </Row>
          <div className="progress mt-5 overflow-visible" style={{ height: 25 }}>
            {distributionData.map((community, index) => {
              const colors = [
                "bg-success",
                "bg-success bg-opacity-75",
                "bg-success bg-opacity-50",
                "bg-success bg-opacity-25",
                "bg-success bg-opacity-10",
              ];
              const widthPercentage = Math.max(distributionData.length > 0 ? 100 / distributionData.length : 20, 15);

              return (
                <div
                  key={community.name}
                  className={`progress-bar ${colors[index]} position-relative overflow-visible ${
                    index === 0 ? "rounded-start" : index === distributionData.length - 1 ? "rounded-end" : ""
                  }`}
                  role="progressbar"
                  style={{ width: `${widthPercentage}%` }}
                  aria-valuenow={community.coverage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <p className="progress-value text-start text-dark mb-0 mt-1 fs-14 fw-medium" style={{ left: "0%", top: "-50px" }}>
                    {community.name.substring(0, 15)}
                    {community.name.length > 15 ? "..." : ""}
                  </p>
                  <p className="progress-value text-start text-light mb-0 mt-1 fs-14 fw-medium" style={{ left: "0%", top: "-30px" }}>
                    |
                  </p>
                  <p className="mb-0 text-start ps-1 ps-lg-2 text-white fs-14">{community.coverage.toFixed(0)}%</p>
                </div>
              );
            })}
            {distributionData.length === 0 && <div className="text-center text-muted py-2">No guard coverage data available</div>}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default GuardsByLocation;
