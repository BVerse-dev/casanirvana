"use client";

import { useMemo } from "react";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListCommunities } from "@/hooks/useCommunities";

const CommunitiesStat = () => {
  const { data: communitiesData, isLoading } = useListCommunities({ pageSize: 200 });
  const communities = communitiesData?.data || [];
  const statCards = useMemo(() => {
    const totalCommunities = communitiesData?.count || communities.length;
    const activeCommunities = communities.filter((community) => community.status !== "inactive").length;
    const totalUnits = communities.reduce((sum, community) => sum + (community.unit_count || 0), 0);
    const averageUnitsPerCommunity =
      totalCommunities > 0 ? Math.round(totalUnits / totalCommunities) : 0;

    return [
      {
        title: "Total Communities",
        value: totalCommunities,
        icon: "ri:building-3-line",
        color: "primary",
      },
      {
        title: "Active Communities",
        value: activeCommunities,
        icon: "ri:building-4-line",
        color: "success",
      },
      {
        title: "Total Units",
        value: totalUnits,
        icon: "ri:community-line",
        color: "info",
      },
      {
        title: "Avg Units/Community",
        value: averageUnitsPerCommunity,
        icon: "ri:bar-chart-line",
        color: "warning",
      },
    ];
  }, [communities, communitiesData?.count]);

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
                  <span className="text-muted small">Live summary</span>
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
