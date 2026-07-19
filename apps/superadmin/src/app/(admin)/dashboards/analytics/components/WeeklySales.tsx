"use client";
import properties10 from "@/assets/images/properties/p-10.jpg";
import properties6 from "@/assets/images/properties/p-6.jpg";
import properties7 from "@/assets/images/properties/p-7.jpg";
import properties8 from "@/assets/images/properties/p-8.jpg";
import properties9 from "@/assets/images/properties/p-9.jpg";
import Image from "next/image";
import Link from "next/link";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselItem,
  Col,
} from "react-bootstrap";
import { currency } from "@/context/constants";
import { usePaymentTrend } from "@/hooks/usePaymentAnalyticsSummary";
import { ApexOptions } from "apexcharts";

const WeeklySales = () => {
  const { currentMonthCollected, isLoading, trend } = usePaymentTrend("week");

  const weeklyChartData = trend.map((point) => point.collected / 1000);

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
        data: weeklyChartData,
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
          {isLoading ? (
            <div className="placeholder-glow">
              <div className="placeholder rounded" style={{ height: "200px" }}></div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardBody>
        <CardFooter className="border-top d-flex align-items-center justify-content-between">
          <p className="text-muted fw-medium fs-15 mb-0">
            <span className="text-dark me-1">Total Monthly Collections : </span>
            {currency}{(currentMonthCollected / 1000).toFixed(1)}K
          </p>
          <div>
            <Link href="/payments" className="btn btn-primary btn-sm">
              View Payments
            </Link>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default WeeklySales;
