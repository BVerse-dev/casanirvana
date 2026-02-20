"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ReactApexChart from "react-apexcharts";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from "react-bootstrap";
import SalesLocation from "./SalesLocation";
import WeeklySales from "./WeeklySales";
import { useListVisitorPasses } from "@/hooks/useVisitorPasses";
import { useListProfiles } from "@/hooks/useProfiles";
import { ApexOptions } from "apexcharts";

const SocialSourceCard = () => {
  const { data: visitorPasses = [] } = useListVisitorPasses();
  const { data: profiles = [] } = useListProfiles();

  // Filter for active residents
  const activeResidents = profiles.filter((profile: any) => profile.role === 'user');
  
  // Calculate weekly visitors
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  
  const weeklyVisitors = visitorPasses.filter((pass: any) => {
    const fromDate = new Date(pass.from_date);
    const toDate = new Date(pass.to_date);
    return pass.status === 'approved' && 
           fromDate <= now && 
           toDate >= weekStart;
  });

  // Calculate visitor source percentage (visitors vs residents)
  const visitorPercentage = activeResidents.length > 0 
    ? Math.min(Math.round((weeklyVisitors.length / activeResidents.length) * 100), 100)
    : 0;

  const socialOptions: ApexOptions = {
    chart: {
      height: 349,
      type: "radialBar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: "70%",
          background: "transparent",
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: "front",
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24,
          },
        },
        track: {
          background: "rgba(170,184,197, 0.4)",
          strokeWidth: "67%",
          margin: 0,
        },
        dataLabels: {
          name: {
            offsetY: -10,
            show: true,
            color: "#888",
            fontSize: "17px",
          },
          value: {
            color: "#111",
            fontSize: "36px",
            show: true,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#7f56da", "#4697ce"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    series: [visitorPercentage],
    stroke: {
      lineCap: "round",
    },
    labels: ["Visitor Activity"],
  };

  return (
    <Col xl={3} lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <div>
            <CardTitle as={"h4"} className="mb-1">
              Visitor Source
            </CardTitle>
            <p className="fs-13 mb-0">Total Visitors This Week</p>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              This Week{" "}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem>Week</DropdownItem>
              <DropdownItem>Months</DropdownItem>
              <DropdownItem>Years</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <ReactApexChart
            options={socialOptions}
            series={socialOptions.series}
            height={349}
            type="radialBar"
            className="apex-charts"
          />
          <p className="mb-0 fs-18 fw-medium text-dark">
            <IconifyIcon icon="ri:group-fill" /> Residents :{" "}
            <span className="text-primary fw-bold">{activeResidents.length}</span>
          </p>
        </CardBody>
        <CardFooter className="border-top d-flex align-items-center justify-content-between">
          <h5 className="mb-0">See More Statistic</h5>
          <div>
            <Button variant="primary" size="sm">
              See Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

const SocialSource = () => {
  return (
    <Row>
      <SocialSourceCard />
      <SalesLocation />
      <WeeklySales />
    </Row>
  );
};

export default SocialSource;
