"use client";
import React from "react";
import { Card, CardBody, CardHeader, Col } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useListComplaints } from "@/hooks/useComplaints";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ComplaintStatusChart = () => {
  // Get all complaints for chart (no pagination needed for charts)
  const { data: complaintsData = [] } = useListComplaints();
  
  // Ensure we have an array
  const complaints = Array.isArray(complaintsData) ? complaintsData : [];

  // Calculate status distribution
  const statusStats = {
    resolved: complaints.filter(c => c.status === "resolved").length,
    in_progress: complaints.filter(c => c.status === "in_progress").length,
    pending: complaints.filter(c => c.status === "pending").length,
  };

  const chartOptions = {
    chart: {
      type: "donut" as const,
      height: 300,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom" as const,
      horizontalAlign: "center" as const,
      fontSize: "14px",
      markers: {
        size: 10,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    stroke: {
      show: true,
      curve: "smooth" as const,
      lineCap: "round" as const,
      colors: ["#fff"],
      width: 2,
    },
    colors: ["#10B981", "#F59E0B", "#EF4444"],
    labels: ["Resolved", "In Progress", "Pending"],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + " complaints";
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
            height: 280,
          },
          legend: {
            position: "bottom" as const,
          },
        },
      },
    ],
  };

  const series = [statusStats.resolved, statusStats.in_progress, statusStats.pending];

  return (
    <Card className="card-height-100 h-100">
      <CardHeader className="border-bottom-dashed align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Status Distribution</h4>
          <div className="flex-shrink-0">
            <button
              type="button"
              className="btn btn-soft-primary btn-sm shadow-none"
            >
              View Details
            </button>
          </div>
        </CardHeader>
        <CardBody className="pb-2">
          <div id="complaint-status-chart" className="apex-charts" dir="ltr">
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="donut"
              height={310}
              className="apex-charts"
            />
          </div>
          <div className="mt-3">
            <div className="d-flex justify-content-center gap-4 text-center">
              <div>
                <p className="mb-1 text-muted">Resolution Rate</p>
                <h5 className="mb-0 text-success">
                  {complaints.length > 0 ? ((statusStats.resolved / complaints.length) * 100).toFixed(1) : 0}%
                </h5>
              </div>
              <div>
                <p className="mb-1 text-muted">Active Cases</p>
                <h5 className="mb-0 text-warning">
                  {statusStats.in_progress + statusStats.pending}
                </h5>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
  );
};

export default ComplaintStatusChart;
