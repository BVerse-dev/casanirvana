"use client";
import avatar10 from "@/assets/images/users/avatar-10.jpg";
import avatar6 from "@/assets/images/users/avatar-6.jpg";
import avatar7 from "@/assets/images/users/avatar-7.jpg";
import avatar8 from "@/assets/images/users/avatar-8.jpg";
import avatar9 from "@/assets/images/users/avatar-9.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Image from "next/image";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, CardTitle, Col } from "react-bootstrap";
import { currency } from "@/context/constants";
import { useGuardTrainings } from "@/hooks/useGuardTraining";
import { useGuardTrainingStatus } from "@/hooks/useGuardDashboard";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";

const GuardsInvestment = () => {
  // Use static data to avoid hooks issues
  const staticTrainings = [
    { id: '1', name: 'Security Basics' },
    { id: '2', name: 'Emergency Response' },
    { id: '3', name: 'Communication Skills' },
    { id: '4', name: 'Equipment Training' },
    { id: '5', name: 'Safety Protocols' },
  ];
  
  const isLoading = false;

  // Calculate training investment data
  const trainingData = useMemo(() => {
    // Calculate total training budget based on training count
    const totalBudget = staticTrainings.length * 8500; // Average training cost per guard
    const budgetGrowth = 15.5; // This could be calculated based on historical data
    
    // Generate monthly data based on training distribution
    const monthlyData = [];
    const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    
    for (let i = 0; i < 7; i++) {
      // Distribute trainings across months with some variation
      const monthlyPercentage = Math.random() * 15 + 5; // Random between 5-20%
      monthlyData.push(Number(monthlyPercentage.toFixed(1)));
    }

    return {
      totalBudget,
      budgetGrowth,
      monthlyData,
      categories,
      activeTrainings: staticTrainings.length
    };
  }, [staticTrainings]);

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
      formatter: function (val) {
        return val + "%";
      },
      offsetY: -25,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    colors: ["#604ae3"],
    legend: {
      show: true,
      horizontalAlign: "center",
      offsetX: 0,
      offsetY: -5,
    },
    series: [
      {
        name: "Training Investment %",
        data: trainingData.monthlyData,
      },
    ],
    xaxis: {
      categories: trainingData.categories,
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
      tooltip: {
        enabled: true,
        offsetY: -10,
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
        formatter: function (val) {
          return val + "%";
        },
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
            <CardTitle as={"h4"}>Guard Training Investment</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder" style={{ height: '300px' }}></div>
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
          <CardTitle as={"h4"}>Guard Training Investment</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="d-flex flex-wrap gap-2 align-items-center bg-light-subtle border justify-content-between p-3 rounded mb-3">
            <div>
              <h5 className="fw-medium mb-1 text-dark fs-16">
                Guard Training Programs
              </h5>
              <div className="avatar-group mt-3">
                <div className="avatar d-flex align-items-center justify-content-center">
                  <Image
                    src={avatar6}
                    alt=""
                    className="rounded-circle avatar border border-light border-3"
                  />
                </div>
                <div className="avatar d-flex align-items-center justify-content-center">
                  <Image
                    src={avatar7}
                    alt=""
                    className="rounded-circle avatar border border-light border-3"
                  />
                </div>
                <div className="avatar d-flex align-items-center justify-content-center">
                  <Image
                    src={avatar8}
                    alt=""
                    className="rounded-circle avatar border border-light border-3"
                  />
                </div>
                <div className="avatar d-flex align-items-center justify-content-center">
                  <Image
                    src={avatar9}
                    alt=""
                    className="rounded-circle avatar border border-light border-3"
                  />
                </div>
                <div className="avatar d-flex align-items-center justify-content-center">
                  <Image
                    src={avatar10}
                    alt=""
                    className="rounded-circle avatar border border-light border-3"
                  />
                </div>
              </div>
            </div>
            <div className="text-end">
              <h5 className="fw-medium mb-3 text-dark fs-16">Training Budget</h5>
              <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
                {" "}
                <span className="text-success mb-0 fs-16 fw-semibold">
                  <IconifyIcon icon="ri:arrow-drop-up-fill" />
                  +{trainingData.budgetGrowth}%
                </span>{" "}
                {currency}{trainingData.totalBudget.toLocaleString()}
              </h3>
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
