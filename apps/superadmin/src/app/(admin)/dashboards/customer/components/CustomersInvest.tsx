"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, CardTitle, Col } from "react-bootstrap";
import { useGuardDashboardSnapshot, useGuardTrainingStatus } from "@/hooks/useGuardDashboard";
import { ApexOptions } from "apexcharts";

const GuardsInvestment = () => {
  const { data: dashboard, isLoading: statsLoading } = useGuardDashboardSnapshot();
  const { data: trainingStatus, isLoading: statusLoading } = useGuardTrainingStatus();
  const trainingStats = dashboard?.trainingOverview;

  const isLoading = statsLoading || statusLoading;

  const chartOptions: ApexOptions = {
    chart: {
      height: 300,
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "30%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${value}`,
      offsetY: -25,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    colors: ["#604ae3"],
    legend: {
      show: false,
    },
    series: trainingStatus?.series || [{ name: "Guards", data: [0, 0, 0] }],
    xaxis: {
      categories: trainingStatus?.categories || ["Certified", "Training Required", "Expired Certifications"],
      position: "bottom",
      labels: {
        offsetY: 0,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      labels: {
        show: true,
      },
    },
    grid: {
      row: {
        colors: ["transparent", "transparent"],
        opacity: 0.2,
      },
      borderColor: "#f1f3fa",
    },
  };

  if (isLoading) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Guard Training Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder" style={{ height: "300px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={6}>
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Guard Training Status</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="d-flex flex-wrap gap-2 align-items-center bg-light-subtle border justify-content-between p-3 rounded mb-3">
            <div>
              <h5 className="fw-medium mb-1 text-dark fs-16">Active Training Programs</h5>
              <p className="mb-0 text-muted">
                {trainingStats?.activePrograms || 0} active of {trainingStats?.totalPrograms || 0} configured programs
              </p>
            </div>
            <div className="text-end">
              <h5 className="fw-medium mb-3 text-dark fs-16">Completion Rate</h5>
              <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
                <span className="text-success mb-0 fs-16 fw-semibold">
                  <IconifyIcon icon="ri:shield-check-line" />
                </span>
                {(trainingStats?.completionRate || 0).toFixed(1)}%
              </h3>
              <small className="text-muted">Avg score: {(trainingStats?.averageScore || 0).toFixed(1)}</small>
            </div>
          </div>
          <ReactApexChart
            options={chartOptions}
            series={chartOptions.series}
            height={300}
            type="bar"
            className="apex-charts"
          />
        </CardBody>
      </Card>
    </Col>
  );
};

export default GuardsInvestment;
