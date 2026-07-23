"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Link from "next/link";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import SalesLocation from "./SalesLocation";
import WeeklySales from "./WeeklySales";
import { useAdminAnalyticsDashboard } from "@/hooks/useAdminAnalyticsDashboard";
import { ApexOptions } from "apexcharts";

const SocialSourceCard = () => {
  const { data: dashboard, isLoading, isError } = useAdminAnalyticsDashboard();

  if (isLoading) {
    return (
      <Col xl={3} lg={6}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"} className="mb-1">
              Visitor Activity
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder rounded-circle mx-auto" style={{ width: "220px", height: "220px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (isError) {
    return (
      <Col xl={3} lg={6}>
        <Card className="h-100"><CardBody className="text-center text-muted py-5">Visitor activity is unavailable right now.</CardBody></Card>
      </Col>
    );
  }

  const activeResidentsCount = dashboard?.summary.activeResidents || 0;
  const visitorPercentage = dashboard?.visitorActivity.weeklyApprovedPercentage || 0;

  const socialOptions: ApexOptions = {
    chart: {
      height: 349,
      type: "radialBar",
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
          background: "transparent",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24,
          },
        },
        track: {
          background: "rgba(170,184,197, 0.4)",
          strokeWidth: "67%",
          margin: 0,
        },
        dataLabels: {
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "17px",
          },
          value: {
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
        gradientToColors: ["#7f56da", "#4697ce"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    series: [visitorPercentage],
    stroke: {
      lineCap: "round",
    },
    labels: ["Pass ratio"],
  };

  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <div>
            <CardTitle as={"h4"} className="mb-1">
              Visitor Activity
            </CardTitle>
            <p className="fs-13 mb-0">Approved passes per 100 active residents</p>
          </div>
          <span className="badge bg-light text-dark">This Week</span>
        </CardHeader>
        <CardBody>
          <ReactApexChart
            options={socialOptions}
            series={socialOptions.series}
            height={349}
            type="radialBar"
            className="apex-charts"
          />
          <p className="mb-0 fs-18 fw-medium text-dark">
            <IconifyIcon icon="ri:group-fill" /> Residents :{" "}
            <span className="text-primary fw-bold">{activeResidentsCount}</span>
          </p>
        </CardBody>
        <CardFooter className="border-top d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Open visitor workspace</h5>
          <div>
            <Link href="/visitors/grid-view" className="btn btn-primary btn-sm">
              View Visitors
            </Link>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

const SocialSource = () => {
  return (
    <Row>
      <SocialSourceCard />
      <SalesLocation />
      <WeeklySales />
    </Row>
  );
};

export default SocialSource;
