"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { SocietyDummyData } from "@/assets/data/communities-dummy";

// Dynamically import ReactApexChart to prevent SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="d-flex justify-content-center p-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading chart...</span></div></div>
});

interface SocietyAnalyticsProps {
  society: SocietyDummyData;
}

const SocietyAnalytics: React.FC<SocietyAnalyticsProps> = ({ society }) => {
  const occupancyRate = Math.round((society.occupiedUnits / society.totalUnits) * 100);
  const vacantUnits = society.totalUnits - society.occupiedUnits;
  
  // Generate dummy analytics data
  const monthlyOccupancy = [92, 89, 91, 95, 88, 93, 96, 94, 92, 89, 91, occupancyRate];
  const monthlyRevenue = [2.8, 3.1, 2.9, 3.4, 2.7, 3.2, 3.6, 3.3, 3.0, 2.8, 3.1, 3.5];
  const maintenanceRequests = [12, 8, 15, 6, 9, 11, 7, 13, 10, 8, 12, 9];
  
  // Occupancy Trend Chart
  const occupancyChartOptions = {
    chart: {
      type: 'area' as const,
      height: 300,
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    colors: ['#3b82f6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    stroke: { curve: 'smooth' as const, width: 2 },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      min: 80,
      max: 100,
      labels: { formatter: (val: number) => `${val}%` }
    },
    tooltip: { 
      y: { formatter: (val: number) => `${val}%` }
    },
    grid: { borderColor: '#e5e7eb' }
  };

  // Revenue Chart
  const revenueChartOptions = {
    chart: {
      type: 'bar' as const,
      height: 300,
      toolbar: { show: false }
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: '60%' }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      labels: { formatter: (val: number) => `$${val}L` }
    },
    tooltip: { 
      y: { formatter: (val: number) => `$${val} Lakhs` }
    },
    grid: { borderColor: '#e5e7eb' }
  };

  // Maintenance Requests Donut Chart
  const maintenanceChartOptions = {
    chart: {
      type: 'donut' as const,
      height: 250
    },
    colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
    labels: ['Critical', 'High', 'Medium', 'Low'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => '47'
            }
          }
        }
      }
    },
    legend: { position: 'bottom' as const }
  };

  const maintenanceData = [8, 12, 18, 9];

  return (
    <Row className="mb-4">
      {/* Key Metrics Cards */}
      <Col lg={12} className="mb-4">
        <Row>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-gradient-primary text-white h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-white-75 mb-1">Occupancy Rate</div>
                    <h3 className="text-white mb-0">{occupancyRate}%</h3>
                    <div className="text-white-75 small">
                      <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                      +2.5% from last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:home-2-bold-duotone" className="fs-24 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-gradient-success text-white h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-white-75 mb-1">Monthly Revenue</div>
                    <h3 className="text-white mb-0">${monthlyRevenue[11]}L</h3>
                    <div className="text-white-75 small">
                      <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                      +12.8% from last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:wallet-money-bold-duotone" className="fs-24 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-gradient-warning text-white h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-white-75 mb-1">Vacant Units</div>
                    <h3 className="text-white mb-0">{vacantUnits}</h3>
                    <div className="text-white-75 small">
                      <IconifyIcon icon="solar:arrow-down-bold" className="me-1" />
                      -5 from last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:key-bold-duotone" className="fs-24 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm bg-gradient-info text-white h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-white-75 mb-1">Satisfaction Score</div>
                    <h3 className="text-white mb-0">{society.rating}/5.0</h3>
                    <div className="text-white-75 small">
                      <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                      +0.3 from last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:star-bold-duotone" className="fs-24 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>

      {/* Charts Section */}
      <Col lg={8}>
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <div className="d-flex justify-content-between align-items-center">
              <CardTitle className="mb-0">Occupancy Trend</CardTitle>
              <Badge bg="primary" className="rounded-pill">12 Months</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <ReactApexChart
              options={occupancyChartOptions}
              series={[{ name: 'Occupancy Rate', data: monthlyOccupancy }]}
              type="area"
              height={300}
            />
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <div className="d-flex justify-content-between align-items-center">
              <CardTitle className="mb-0">Revenue Analytics</CardTitle>
              <Badge bg="success" className="rounded-pill">Monthly</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <ReactApexChart
              options={revenueChartOptions}
              series={[{ name: 'Revenue', data: monthlyRevenue }]}
              type="bar"
              height={300}
            />
          </CardBody>
        </Card>
      </Col>

      <Col lg={4}>
        {/* Maintenance Requests */}
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Maintenance Requests</CardTitle>
          </CardHeader>
          <CardBody>
            <ReactApexChart
              options={maintenanceChartOptions}
              series={maintenanceData}
              type="donut"
              height={250}
            />
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Quick Statistics</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Amenity Usage</span>
                <span className="fw-semibold">85%</span>
              </div>
              <ProgressBar now={85} variant="primary" style={{ height: '6px' }} />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Parking Utilization</span>
                <span className="fw-semibold">72%</span>
              </div>
              <ProgressBar now={72} variant="success" style={{ height: '6px' }} />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Security Score</span>
                <span className="fw-semibold">96%</span>
              </div>
              <ProgressBar now={96} variant="info" style={{ height: '6px' }} />
            </div>

            <div className="mb-0">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Energy Efficiency</span>
                <span className="fw-semibold">78%</span>
              </div>
              <ProgressBar now={78} variant="warning" style={{ height: '6px' }} />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default SocietyAnalytics;
