"use client";
import properties10 from "@/assets/images/properties/p-10.jpg";
import properties6 from "@/assets/images/properties/p-6.jpg";
import properties7 from "@/assets/images/properties/p-7.jpg";
import properties8 from "@/assets/images/properties/p-8.jpg";
import properties9 from "@/assets/images/properties/p-9.jpg";
import Image from "next/image";
import ReactApexChart from "react-apexcharts";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselItem,
  Col,
} from "react-bootstrap";
import { useListPayments } from "@/hooks/usePayments";
import { currency } from "@/context/constants";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";

const WeeklySales = () => {
  const { data: payments = [] } = useListPayments();

  // Calculate weekly collections data
  const weeklyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get current month payments
    const currentMonthPayments = payments.filter((payment: any) => {
      if (!payment.payment_date && !payment.due_date) return false;
      const paymentDate = new Date(payment.payment_date || payment.due_date);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             payment.status === 'completed';
    });

    // Calculate total monthly collections
    const totalMonthlyCollections = currentMonthPayments.reduce(
      (sum: number, payment: any) => sum + Number(payment.amount || 0), 
      0
    );

    // Generate weekly data for chart (last 7 days)
    const weeklyChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayPayments = payments.filter((payment: any) => {
        if (!payment.payment_date && !payment.due_date) return false;
        const paymentDate = new Date(payment.payment_date || payment.due_date);
        return paymentDate.toDateString() === date.toDateString() && 
               payment.status === 'completed';
      });
      
      const dayTotal = dayPayments.reduce((sum: number, payment: any) => 
        sum + Number(payment.amount || 0), 0
      );
      
      weeklyChartData.push(dayTotal / 1000); // Convert to thousands for chart
    }

    return {
      totalMonthlyCollections,
      weeklyChartData
    };
  }, [payments]);

  // Chart options
  const salesOptions: ApexOptions = {
    chart: {
      height: 120,
      parentHeightOffset: 0,
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        barHeight: "100%",
        columnWidth: "40%",
        borderRadius: 4,
        distributed: true,
      },
    },
    grid: {
      show: true,
      padding: {
        top: -20,
        bottom: -10,
        left: 0,
        right: 0,
      },
    },
    colors: ["#604ae3", "#604ae3", "#604ae3", "#604ae3", "#604ae3", "#604ae3", "#604ae3"],
    dataLabels: {
      enabled: false,
    },
    series: [
      {
        name: "Collections",
        data: weeklyData.weeklyChartData,
      },
    ],
    legend: {
      show: false,
    },
    xaxis: {
      categories: ["S", "M", "T", "W", "T", "F", "S"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value: number) {
          return `${currency}${value.toFixed(1)}K`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 1025,
        options: {
          chart: {
            height: 199,
          },
        },
      },
    ],
  };

  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader>
          <CardTitle as={"h4"}>Weekly Collections</CardTitle>
        </CardHeader>
        <CardBody>
          <Carousel
            indicators={false}
            id="carouselExampleCaptions"
            className=" slide"
            data-bs-ride="carousel"
          >
            <CarouselItem className=" active">
              <Image
                src={properties9}
                width={327}
                height={200}
                className="d-block w-100 h-100 rounded"
                alt="img-6"
              />
            </CarouselItem>
            <CarouselItem className="">
              <Image
                src={properties7}
                width={327}
                height={200}
                className="d-block w-100 h-100 rounded"
                alt="img-7"
              />
            </CarouselItem>
            <CarouselItem className="">
              <Image
                src={properties8}
                width={327}
                height={200}
                className="d-block w-100 h-100 rounded"
                alt="img-5"
              />
            </CarouselItem>
            <CarouselItem className="">
              <Image
                src={properties6}
                width={327}
                height={200}
                className="d-block w-100 h-100 rounded"
                alt="img-"
              />
            </CarouselItem>
            <CarouselItem className="">
              <Image
                src={properties10}
                width={327}
                height={200}
                className="d-block w-100 h-100 rounded"
                alt="img-5"
              />
            </CarouselItem>
          </Carousel>
          <ReactApexChart
            options={salesOptions}
            series={salesOptions.series}
            height={120}
            type="bar"
            className="apex-charts mt-4"
          />
        </CardBody>
        <CardFooter className="border-top d-flex align-items-center justify-content-between">
          <p className="text-muted fw-medium fs-15 mb-0">
            <span className="text-dark me-1">Total Monthly Collections : </span>
            {currency}{(weeklyData.totalMonthlyCollections / 1000).toFixed(1)}K
          </p>
          <div>
            <Button variant="primary" size="sm">
              View More
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default WeeklySales;
