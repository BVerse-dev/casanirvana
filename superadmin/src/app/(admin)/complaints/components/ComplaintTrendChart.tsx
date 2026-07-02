"use client";
import React from "react";
import { Card, CardBody, CardHeader, Col } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useListComplaints } from "@/hooks/useComplaints";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ComplaintTrendChart = () => {
  // Get all complaints for chart (no pagination needed for charts)
  const { data: complaintsData = [] } = useListComplaints();
  
  // Ensure we have an array
  const complaints = Array.isArray(complaintsData) ? complaintsData : [];

  // Generate trend data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const trendData = last7Days.map(date => {
    const dayComplaints = complaints.filter(complaint => {
      if (!complaint.created_at) return false;
      const complaintDate = new Date(complaint.created_at);
      return complaintDate.toDateString() === date.toDateString();
    });
    
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: dayComplaints.length,
      resolved: dayComplaints.filter(c => c.status === "resolved").length,
      pending: dayComplaints.filter(c => c.status === "pending").length,
    };
  });

  const chartOptions = {
    chart: {
      type: "area" as const,
      height: 350,
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth" as const,
      width: [3, 3, 3],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: ["#3B82F6", "#10B981", "#EF4444"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "right" as const,
    },
    xaxis: {
      categories: trendData.map(d => d.date),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Number of Complaints",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 3,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val: number) {
          return val + " complaints";
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Total Complaints",
      data: trendData.map(d => d.total),
    },
    {
      name: "Resolved",
      data: trendData.map(d => d.resolved),
    },
    {
      name: "Pending",
      data: trendData.map(d => d.pending),
    },
  ];

  return (
    <Card className="card-height-100 h-100">
      <CardHeader className="border-bottom-dashed align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Complaint Trends (Last 7 Days)</h4>
          <div className="flex-shrink-0">
            <button
              type="button"
              className="btn btn-soft-primary btn-sm shadow-none"
            >
              View More
            </button>
          </div>
        </CardHeader>
        <CardBody className="pb-0">
          <div id="complaint-trend-chart" className="apex-charts" dir="ltr">
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="area"
              height={350}
              className="apex-charts"
            />
          </div>
        </CardBody>
      </Card>
  );
};

export default ComplaintTrendChart;
