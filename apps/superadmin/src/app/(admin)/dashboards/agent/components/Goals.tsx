"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useResidentPerformanceTrends } from "@/hooks/useResidentDashboard";
import ReactApexChart from "react-apexcharts";
import { useMemo } from "react";
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";

const ResidentSatisfaction = () => {
  const { data: performanceTrends, error, isLoading } = useResidentPerformanceTrends();

  const chartData = useMemo(() => {
    if (!performanceTrends) {
      return { series: [0], avgSatisfaction: 0, engagement: 0, hasSatisfactionData: false };
    }

    const satisfactionValues = performanceTrends.satisfactionScores.filter((value) => value > 0);
    const engagementValues = performanceTrends.communityEngagement.filter((value) => value > 0);
    const avgSatisfaction =
      satisfactionValues.length > 0
        ? satisfactionValues.reduce((sum, value) => sum + value, 0) / satisfactionValues.length
        : 0;
    const currentEngagement = engagementValues[engagementValues.length - 1] || 0;

    return {
      series: [Math.round((avgSatisfaction / 5) * 100)],
      avgSatisfaction,
      engagement: currentEngagement,
      hasSatisfactionData: satisfactionValues.length > 0,
    };
  }, [performanceTrends]);

  const goalsOptions = {
    series: chartData.series,
    chart: {
      height: 300,
      type: "radialBar" as const,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "70%",
          background: "#fff",
          image: undefined,
          position: "front" as const,
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24,
          },
        },
        track: {
          background: "#fff",
          strokeWidth: "67%",
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35,
          },
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "17px",
          },
          value: {
            formatter: (value: number) => `${parseInt(value.toString(), 10)}%`,
            color: "#111",
            fontSize: "36px",
            show: true,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#ABE5A1"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round" as const,
    },
    labels: ["Satisfaction"],
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between pb-0">
          <CardTitle as={"h4"}>Resident Satisfaction</CardTitle>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="placeholder-glow">
            <div className="placeholder rounded-circle mx-auto" style={{ width: "200px", height: "200px" }}></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle as={"h4"}>Resident Satisfaction</CardTitle>
        </CardHeader>
        <CardBody className="text-center text-muted py-5">
          Satisfaction metrics are unavailable right now.
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="d-flex align-items-center justify-content-between pb-0">
        <CardTitle as={"h4"}>Resident Satisfaction</CardTitle>
        <span className="text-muted fs-13">Resident feedback</span>
      </CardHeader>
      <CardBody className="pt-0">
        <ReactApexChart
          options={goalsOptions}
          series={goalsOptions.series}
          height={300}
          type="radialBar"
          className="apex-charts mb-4"
        />
        <h5>Satisfaction Snapshot</h5>
        {!chartData.hasSatisfactionData ? (
          <p className="text-muted mb-0 mt-3">No scored resident feedback has been recorded yet.</p>
        ) : null}
        <Row className="align-items-center justify-content-center mt-3 ">
          <Col lg={6} xs={6}>
            <div className="d-flex align-items-center gap-2">
              <div className="avatar bg-light bg-opacity-50 rounded flex-centered">
                <IconifyIcon icon="solar:heart-broken" width={28} height={28} className="fs-28 text-primary" />
              </div>
              <div>
                <p className="mb-0 fs-16 text-dark fw-semibold">{chartData.avgSatisfaction.toFixed(1)} / 5.0</p>
                <small>Average score</small>
              </div>
            </div>
          </Col>
          <Col lg={6} xs={6}>
            <div className="d-flex align-items-center justify-content-end gap-2">
              <div className="avatar bg-light bg-opacity-50 rounded flex-centered">
                <IconifyIcon
                  icon="solar:users-group-rounded-broken"
                  width={28}
                  height={28}
                  className="fs-28 text-primary "
                />
              </div>
              <div>
                <p className="mb-0 fs-16 text-dark fw-semibold">{chartData.engagement.toFixed(0)}%</p>
                <small>Latest engagement</small>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ResidentSatisfaction;
