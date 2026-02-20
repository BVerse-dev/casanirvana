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
import { useListProfiles } from "@/hooks/useProfiles";
import { useListUnits } from "@/hooks/useUnits";
import { useListCommunities } from "@/hooks/useCommunities";
import { useMemo } from "react";

const SalesLocation = () => {
  const { data: profiles = [] } = useListProfiles();
  const { data: unitsResponse } = useListUnits();
  const { data: communitiesResponse } = useListCommunities();
  const units = unitsResponse?.data || [];
  const communities = communitiesResponse?.data || [];

  // Calculate resident distribution data
  const distributionData = useMemo(() => {
    // Filter for active residents (try both 'user' and 'resident' roles)
    const activeResidents = profiles.filter((profile: any) => 
      profile.role === 'user' || profile.role === 'resident'
    );
    
    // Get communities with resident counts
    const communityStats = communities.map((community: any) => {
      // Get units for this community
      const communityUnits = units.filter((unit: any) => unit.society_id === community.id);
      
      // Count residents in those units - multiple approaches
      let residentCount = 0;
      
      // Method 1: Count by resident_id in units
      residentCount = communityUnits.reduce((count: number, unit: any) => {
        if (unit.resident_id) {
          const resident = profiles.find((p: any) => p.id === unit.resident_id);
          return resident && (resident.role === 'user' || resident.role === 'resident') ? count + 1 : count;
        }
        return count;
      }, 0);
      
      // Method 2: If no residents found via resident_id, try counting by society_id in profiles  
      if (residentCount === 0) {
        residentCount = activeResidents.filter((resident: any) => 
          resident.society_id === community.id
        ).length;
      }
      
      // Method 3: If still no residents, use a fallback estimation based on unit status
      if (residentCount === 0) {
        const occupiedUnits = communityUnits.filter((unit: any) => 
          unit.status === 'occupied' || unit.status === 'active'
        );
        residentCount = occupiedUnits.length;
      }
      
      return {
        name: community.name,
        count: residentCount,
        totalUnits: communityUnits.length,
        occupancyRate: communityUnits.length > 0 ? (residentCount / communityUnits.length) * 100 : 0
      };
    });

    // Sort by occupancy rate (highest first) but include all communities
    const sortedCommunities = communityStats
      .sort((a: any, b: any) => b.occupancyRate - a.occupancyRate);

    // Get top 5 communities (or all if less than 5 exist)
    const topCommunities = sortedCommunities.slice(0, 5);

    // Calculate total residents for percentage calculation
    const totalResidents = activeResidents.length;

    return topCommunities.map((community: any) => ({
      ...community,
      percentage: totalResidents > 0 ? (community.count / totalResidents) * 100 : 0
    }));
  }, [profiles, units, communities]);

  const salesLocationOptions = {
    map: "world",
    zoomOnScroll: true,
    zoomButtons: false,
    markersSelectable: true,
    markers: [
      {
        name: "India - Primary Location",
        coords: [20.5937, 78.9629],
      },
      {
        name: "Mumbai - Main Office",
        coords: [19.0760, 72.8777],
      },
      {
        name: "Delhi - Branch Office",
        coords: [28.7041, 77.1025],
      },
      {
        name: "Bangalore - Operations",
        coords: [12.9716, 77.5946],
      },
      {
        name: "Chennai - Regional Office",
        coords: [13.0827, 80.2707],
      },
    ],
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
              All Communities{" "}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem>All Communities</DropdownItem>
              {communities.slice(0, 5).map((community: any) => (
                <DropdownItem key={community.id}>{community.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <Row>
            <Col xl={12}>
              <div
                id="most-sales-location"
                className="mt-3"
                style={{ height: 322 }}
              >
                <WorldVectorMap
                  height="322"
                  width="100%"
                  options={salesLocationOptions}
                />
              </div>
            </Col>
          </Row>
          <div
            className="progress mt-5 overflow-visible"
            style={{ height: 25 }}
          >
            {distributionData.map((society: any, index: number) => {
              const colors = [
                "bg-primary",
                "bg-primary bg-opacity-75",
                "bg-primary bg-opacity-50",
                "bg-primary bg-opacity-25",
                "bg-primary bg-opacity-10"
              ];
              
              const widthPercentage = Math.max(distributionData.length > 0 ? 100 / distributionData.length : 20, 15);
              
              return (
                <div
                  key={society.name}
                  className={`progress-bar ${colors[index]} position-relative overflow-visible ${
                    index === 0 ? 'rounded-start' : index === distributionData.length - 1 ? 'rounded-end' : ''
                  }`}
                  role="progressbar"
                  style={{ width: `${widthPercentage}%` }}
                  aria-valuenow={society.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <p
                    className="progress-value text-start text-dark mb-0 mt-1 fs-14 fw-medium"
                    style={{ left: "0%", top: "-50px" }}
                  >
                    {society.name.substring(0, 15)}{society.name.length > 15 ? '...' : ''}
                  </p>
                  <p
                    className="progress-value text-start text-light mb-0 mt-1 fs-14 fw-medium"
                    style={{ left: "0%", top: "-30px" }}
                  >
                    |
                  </p>
                  <p className="mb-0 text-start ps-1 ps-lg-2 text-white fs-14">
                    {society.occupancyRate.toFixed(1)}%
                  </p>
                </div>
              );
            })}
            {distributionData.length === 0 && (
              <div className="text-center text-muted py-2">
                No society data available
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default SalesLocation;
