"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import { useResidentPerformanceTrends } from "@/hooks/useResidentDashboard";
import { useMemo } from "react";

const ResidentSatisfaction = () => {
  const { data: performanceTrends, isLoading } = useResidentPerformanceTrends();

  const chartData = useMemo(() => {
    if (!performanceTrends) return { series: [75], avgSatisfaction: 4.6, engagement: 95 };

    const avgSatisfaction = performanceTrends.satisfactionScores.reduce((a, b) => a + b, 0) / performanceTrends.satisfactionScores.length;
    const currentEngagement = performanceTrends.communityEngagement[performanceTrends.communityEngagement.length - 1];
    
    // Convert satisfaction to percentage for radial chart
    const satisfactionPercentage = Math.round((avgSatisfaction / 5) * 100);

    return {
      series: [satisfactionPercentage],
      avgSatisfaction: avgSatisfaction,
      engagement: currentEngagement
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
            formatter: function (val: number) {
              return parseInt(val.toString()) + "%";
            },
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
          <CardTitle as={"h4"}>Satisfaction Goals</CardTitle>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="placeholder-glow">
            <div className="placeholder rounded-circle mx-auto" style={{ width: '200px', height: '200px' }}></div>
            <div className="mt-3">
              <span className="placeholder col-6"></span>
              <span className="placeholder col-4"></span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="d-flex align-items-center justify-content-between pb-0">
        <CardTitle as={"h4"}>Satisfaction Goals</CardTitle>
        <div>
          <Link href="" className="link-dark fs-20">
            <IconifyIcon icon="ri-settings-4-line" />
          </Link>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <ReactApexChart
          options={goalsOptions}
          series={goalsOptions.series}
          height={300}
          type="radialBar"
          className="apex-charts mb-4"
        />
        <h5>Satisfaction Metrics</h5>
        <Row className="align-items-center justify-content-center mt-3 ">
          <Col lg={6} xs={6}>
            <div className="d-flex align-items-center gap-2">
              <div className="avatar bg-light bg-opacity-50 rounded flex-centered">
                <IconifyIcon
                  icon="solar:heart-broken"
                  width={28}
                  height={28}
                  className="fs-28 text-primary"
                />
              </div>
              <div>
                <p className="mb-0 fs-16 text-dark fw-semibold">
                  {chartData.avgSatisfaction.toFixed(1)} / 5.0
                </p>
                <small>This Month</small>
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
                <p className="mb-0 fs-16 text-dark fw-semibold">
                  {chartData.engagement}%
                </p>
                <small>Engagement</small>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ResidentSatisfaction;
