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
  Table,
  ProgressBar,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

// Dynamically import ReactApexChart to prevent SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="d-flex justify-content-center p-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading chart...</span></div></div>
});
import { SocietyDummyData } from "@/assets/data/communities-dummy";

interface SocietyFinancialsProps {
  society: SocietyDummyData;
}

const SocietyFinancials: React.FC<SocietyFinancialsProps> = ({ society }) => {
  const monthlyRevenue = society.maintenanceCharges * society.occupiedUnits;
  const yearlyRevenue = monthlyRevenue * 12;
  
  // Revenue breakdown chart
  const revenueBreakdownOptions = {
    chart: {
      type: 'donut' as const,
      height: 300
    },
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
    labels: ['Maintenance', 'Parking', 'Amenities', 'Late Fees', 'Others'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Revenue',
              formatter: () => `$${(monthlyRevenue / 100000).toFixed(1)}L`
            }
          }
        }
      }
    },
    legend: { position: 'bottom' as const },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' as const }
      }
    }]
  };

  const revenueBreakdownData = [78, 12, 6, 3, 1];

  // Expense breakdown
  const expenseBreakdownOptions = {
    chart: {
      type: 'bar' as const,
      height: 300,
      toolbar: { show: false }
    },
    colors: ['#ef4444'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '60%'
      }
    },
    xaxis: {
      categories: ['Security', 'Cleaning', 'Maintenance', 'Utilities', 'Administration', 'Others'],
      labels: { formatter: (val: string) => `$${parseInt(val)}K` }
    },
    tooltip: { 
      y: { formatter: (val: number) => `$${val},000` }
    },
    grid: { borderColor: '#e5e7eb' }
  };

  const expenseData = [{ name: 'Monthly Expenses', data: [85, 65, 120, 95, 45, 25] }];

  // Payment status data
  const paymentHistory = [
    { month: 'December 2024', collected: 94, pending: 6, overdue: 0 },
    { month: 'November 2024', collected: 96, pending: 3, overdue: 1 },
    { month: 'October 2024', collected: 92, pending: 5, overdue: 3 },
    { month: 'September 2024', collected: 89, pending: 8, overdue: 3 },
    { month: 'August 2024', collected: 91, pending: 6, overdue: 3 }
  ];

  const upcomingDues = [
    { unitNo: '401', ownerName: 'Rajesh Kumar', amount: 3500, dueDate: '2024-12-31', status: 'overdue' },
    { unitNo: '205', ownerName: 'Priya Sharma', amount: 3500, dueDate: '2025-01-05', status: 'upcoming' },
    { unitNo: '308', ownerName: 'Amit Verma', amount: 3500, dueDate: '2025-01-10', status: 'upcoming' },
    { unitNo: '102', ownerName: 'Neha Singh', amount: 3500, dueDate: '2025-01-15', status: 'upcoming' }
  ];

  return (
    <Row className="mb-4">
      {/* Financial Summary Cards */}
      <Col lg={12} className="mb-4">
        <Row>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Monthly Revenue</div>
                    <h4 className="mb-0">${(monthlyRevenue / 100000).toFixed(1)}L</h4>
                    <div className="text-success small">
                      <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                      +8.2% vs last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-success-subtle d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:wallet-money-bold-duotone" className="fs-24 text-success" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Collection Rate</div>
                    <h4 className="mb-0">94%</h4>
                    <div className="text-info small">
                      <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                      +2.1% vs last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-info-subtle d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:chart-2-bold-duotone" className="fs-24 text-info" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Pending Dues</div>
                    <h4 className="mb-0">${((monthlyRevenue * 0.06) / 1000).toFixed(0)}K</h4>
                    <div className="text-warning small">
                      <IconifyIcon icon="solar:arrow-down-bold" className="me-1" />
                      -15% vs last month
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-warning-subtle d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-24 text-warning" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Annual Revenue</div>
                    <h4 className="mb-0">${(yearlyRevenue / 10000000).toFixed(1)}Cr</h4>
                    <div className="text-primary small">
                      <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                      +12% vs last year
                    </div>
                  </div>
                  <div className="avatar-lg rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center">
                    <IconifyIcon icon="solar:money-bag-bold-duotone" className="fs-24 text-primary" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>

      {/* Charts Section */}
      <Col lg={6}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <ReactApexChart
              options={revenueBreakdownOptions}
              series={revenueBreakdownData}
              type="donut"
              height={300}
            />
          </CardBody>
        </Card>
      </Col>

      <Col lg={6}>
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardBody>
            <ReactApexChart
              options={expenseBreakdownOptions}
              series={expenseData}
              type="bar"
              height={300}
            />
          </CardBody>
        </Card>
      </Col>

      {/* Payment History */}
      <Col lg={8} className="mt-4">
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Payment Collection History</CardTitle>
          </CardHeader>
          <CardBody>
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Collected</th>
                  <th>Pending</th>
                  <th>Overdue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index}>
                    <td className="fw-medium">{payment.month}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 me-2">
                          <ProgressBar 
                            now={payment.collected} 
                            variant="success" 
                            style={{ height: '6px' }} 
                          />
                        </div>
                        <span className="text-success small fw-medium">{payment.collected}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge bg="warning" className="rounded-pill">{payment.pending}%</Badge>
                    </td>
                    <td>
                      <Badge bg="danger" className="rounded-pill">{payment.overdue}%</Badge>
                    </td>
                    <td>
                      <Badge 
                        bg={payment.collected >= 95 ? 'success' : payment.collected >= 90 ? 'warning' : 'danger'} 
                        className="rounded-pill"
                      >
                        {payment.collected >= 95 ? 'Excellent' : payment.collected >= 90 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>

      {/* Upcoming Dues */}
      <Col lg={4} className="mt-4">
        <Card className="border-0 shadow-sm h-100">
          <CardHeader className="bg-transparent border-bottom-0 pb-0">
            <CardTitle className="mb-0">Upcoming Dues</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {upcomingDues.map((due, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">Unit {due.unitNo}</h6>
                    <p className="text-muted mb-1 small">{due.ownerName}</p>
                    <div className="d-flex align-items-center text-muted small">
                      <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                      Due: {due.dueDate}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold mb-1">${due.amount.toLocaleString()}</div>
                    <Badge 
                      bg={due.status === 'overdue' ? 'danger' : 'warning'} 
                      className="rounded-pill small"
                    >
                      {due.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default SocietyFinancials;
