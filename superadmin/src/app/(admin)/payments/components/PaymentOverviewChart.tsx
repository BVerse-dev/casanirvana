"use client";
import homeImg from "@/assets/images/home-2.png";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListPayments } from "@/hooks/usePayments";
import { ApexOptions } from "apexcharts";
import Image from "next/image";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, Col, Row } from "react-bootstrap";

const PaymentOverviewChart = () => {
  const { data: payments = [] } = useListPayments();
  
  // Calculate payment statistics
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  const totalPayments = payments.length;

  const series = [completedPayments, pendingPayments, failedPayments, overduePayments];

  const donutOptions: ApexOptions = {
    chart: {
      height: 123,
      type: 'donut',
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: false,
            total: {
              showAlways: true,
              show: true,
            },
          },
        },
      },
    },
    labels: ['Completed', 'Pending', 'Failed', 'Overdue'],
    colors: ['#22c55e', '#fbbf24', '#ef4444', '#a855f7'],
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Col xl={12} lg={12}>
      <Card>
        <CardBody>
          <Row className="align-items-center">
            <Col lg={7}>
              <h4 className="text-dark mb-1">Welcome Back, Admin</h4>
              <p className="fs-14">This is your payments dashboard</p>
              <Row className="align-items-center text-center mb-2">
                <Col lg={7} className="border-end border-light">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <ReactApexChart
                        options={donutOptions}
                        series={series}
                        height={123}
                        type="donut"
                        className="apex-charts mb-4"
                      />
                    </Col>
                    <Col lg={6}>
                      <h5>Payments</h5>
                      <h2 className="fw-semibold text-dark">{totalPayments}</h2>
                      <p className="text-muted mb-0">${totalAmount.toLocaleString()}</p>
                    </Col>
                  </Row>
                </Col>
                <Col lg={5}>
                  <div className="ps-2">
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-success" />
                      {completedPayments} Completed
                    </p>
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-warning" />
                      {pendingPayments} Pending
                    </p>
                    <p className="d-flex align-items-center mb-2 gap-2">
                      <IconifyIcon icon="ri:circle-fill" className="text-danger" />
                      {failedPayments} Failed
                    </p>
                    <p className="d-flex align-items-center gap-2 mb-0">
                      <IconifyIcon icon="ri:circle-fill" className="text-info" />
                      {overduePayments} Overdue
                    </p>
                  </div>
                </Col>
              </Row>
              <p className="text-muted mb-0 d-flex align-items-center gap-1">
                Last Updated <span>:</span> <span className="text-dark">2 hours ago</span>
              </p>
            </Col>
            <Col lg={5} className="text-end">
              <Image src={homeImg} alt="home" className="img-fluid" />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PaymentOverviewChart;
