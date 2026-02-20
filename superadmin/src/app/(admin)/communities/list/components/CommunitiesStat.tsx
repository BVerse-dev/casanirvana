"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListCommunities } from "@/hooks/useCommunities";
import { useListUnits } from "@/hooks/useUnits";

const CommunitiesStat = () => {
  const { data: communitiesData, isLoading: communitiesLoading } = useListCommunities();
  const communities = communitiesData?.data || [];
  const { data: unitsResponse, isLoading: unitsLoading } = useListUnits();
  const units = unitsResponse?.data || [];

  const [stats, setStats] = useState({
    totalCommunities: 0,
    activeCommunities: 0,
    totalUnits: 0,
    averageUnitsPerCommunity: 0,
  });

  useEffect(() => {
    if (communities && units) {
      const totalCommunities = communities.length;
      const activeCommunities = communities.length; // All communities are considered active for now
      const totalUnits = units.length;
      const averageUnitsPerCommunity = totalCommunities > 0 ? Math.round(totalUnits / totalCommunities) : 0;

      setStats({
        totalCommunities,
        activeCommunities,
        totalUnits,
        averageUnitsPerCommunity,
      });
    }
  }, [communities, units]);

  const isLoading = communitiesLoading || unitsLoading;

  const statCards = [
    {
      title: "Total Communities",
      value: stats.totalCommunities,
      icon: "ri:building-3-line",
      color: "primary",
      trend: "+12%",
      trendColor: "success",
    },
    {
      title: "Active Communities",
      value: stats.activeCommunities,
      icon: "ri:building-4-line",
      color: "success",
      trend: "+8%",
      trendColor: "success",
    },
    {
      title: "Total Units",
      value: stats.totalUnits,
      icon: "ri:community-line",
      color: "info",
      trend: "+15%",
      trendColor: "success",
    },
    {
      title: "Avg Units/Community",
      value: stats.averageUnitsPerCommunity,
      icon: "ri:bar-chart-line",
      color: "warning",
      trend: "+3%",
      trendColor: "success",
    },
  ];

  return (
    <Row className="mb-4">
      {statCards.map((stat, index) => (
        <Col xl={3} md={6} key={index}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className={`avatar-sm rounded-circle bg-${stat.color}-subtle`}>
                    <span className={`avatar-title rounded-circle text-${stat.color}`}>
                      <IconifyIcon icon={stat.icon} className="fs-18" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">{stat.title}</p>
                  <h5 className="mb-0">
                    {isLoading ? (
                      <div className="placeholder-glow">
                        <span className="placeholder col-4"></span>
                      </div>
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </h5>
                  <span className={`text-${stat.trendColor} small`}>
                    <IconifyIcon icon="ri:arrow-up-line" /> {stat.trend}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CommunitiesStat;
