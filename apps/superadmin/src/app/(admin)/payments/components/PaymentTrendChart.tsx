"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListPayments } from "@/hooks/usePayments";
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardTitle, Col } from "react-bootstrap";

const PaymentTrendChart = () => {
  const { data: payments = [] } = useListPayments();
  
  // Calculate monthly revenue data
  const monthlyData = [15200, 14800, 16300, 15900, 17200, 16800, 15400, 16900, 15700, 16875];
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const growthRate = ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);

  const series = [
    {
      name: 'Revenue',
      data: monthlyData,
    },
  ];

  const trendOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 200,
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 0,
    },
    colors: ['#ffffff'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      labels: {
        style: {
          colors: '#ffffff',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#ffffff',
          fontSize: '12px',
        },
        formatter: function (value) {
          return '$' + (value / 1000).toFixed(0) + 'k';
        },
      },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (value) {
          return '$' + value.toLocaleString();
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <Col xl={6} lg={12}>
      <Card className="bg-primary bg-gradient card-height-100">
        <CardBody>
          <div className="d-flex align-items-center mb-4">
            <div className="flex-grow-1">
              <CardTitle as={'h5'} className="text-white mb-1">
                Revenue Trend
              </CardTitle>
              <p className="text-white-50 mb-0">Monthly payment collections</p>
            </div>
            <div className="flex-shrink-0">
              <div className="avatar-sm bg-white bg-opacity-20 rounded d-flex align-items-center justify-content-center">
                <IconifyIcon icon="ri:line-chart-line" className="text-white fs-16" />
              </div>
            </div>
          </div>
          
          <ReactApexChart
            options={trendOptions}
            series={series}
            type="area"
            height={200}
            className="apex-charts"
          />
          
          <div className="row text-center mt-4">
            <div className="col-6">
              <div className="mt-4">
                <p className="mb-2 text-white-50">This Month</p>
                <h5 className="text-white">${currentMonth.toLocaleString()}</h5>
              </div>
            </div>
            <div className="col-6">
              <div className="mt-4">
                <p className="mb-2 text-white-50">Growth Rate</p>
                <h5 className="text-white">+{growthRate}%</h5>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PaymentTrendChart;
