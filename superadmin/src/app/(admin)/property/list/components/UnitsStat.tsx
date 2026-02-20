"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListUnits } from "@/hooks/useUnits";
import { useListCommunities } from "@/hooks/useCommunities";
import Link from "next/link";
import { Card, CardBody, CardTitle, Col, Row } from "react-bootstrap";

type UnitStatType = {
  amount: string;
  change: number;
  icon: string;
  title: string;
  variant: "success" | "danger";
};

const UnitStatCard = ({
  amount,
  change,
  icon,
  title,
  variant,
}: UnitStatType) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <CardTitle as={"h4"} className="mb-2 ">
              {title}
            </CardTitle>
            <p className="text-muted fw-medium fs-22 mb-0">{amount}</p>
          </div>
          <div>
            <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered">
              <IconifyIcon
                icon={icon}
                width={32}
                height={32}
                className="fs-32 text-primary "
              />
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between mt-3">
          <p className="mb-0">
            <span className={`text-${variant} fw-medium mb-0`}>
              {variant == "success" ? (
                <IconifyIcon icon="ri:arrow-up-line" />
              ) : (
                <IconifyIcon icon="ri:arrow-down-line" />
              )}
              {change}%
            </span>{" "}
            vs last month
          </p>
          <div>
            <Link href="" className="link-primary fw-medium">
              See Details{" "}
              <IconifyIcon
                icon="ri:arrow-right-line"
                className="align-middle"
              />
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const UnitsStat = () => {
  const { data: unitsResponse, isLoading } = useListUnits();
  const units = unitsResponse?.data || [];
  const { data: communitiesData } = useListCommunities();
  const communities = communitiesData?.data || [];

  if (isLoading) {
    return (
      <Row>
        {[1, 2, 3, 4].map((i) => (
          <Col md={6} xl={3} key={i}>
            <Card>
              <CardBody>
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-8"></span>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const totalUnits = units?.length || 0;
  const occupiedUnits =
    units?.filter((unit) => unit.status === "occupied").length || 0;
  const vacantUnits =
    units?.filter((unit) => unit.status === "vacant").length || 0;
  const maintenanceUnits =
    units?.filter((unit) => unit.status === "maintenance").length || 0;
  const totalCommunities = communities?.length || 0;

  const unitsStatData: UnitStatType[] = [
    {
      amount: totalUnits.toString(),
      change: 8.72,
      icon: "solar:home-2-broken",
      title: "Total Units",
      variant: "success",
    },
    {
      amount: occupiedUnits.toString(),
      change: 4.63,
      icon: "solar:users-group-rounded-broken",
      title: "Occupied Units",
      variant: "success",
    },
    {
      amount: vacantUnits.toString(),
      change: -2.14,
      icon: "solar:home-broken",
      title: "Vacant Units",
      variant: "danger",
    },
    {
      amount: totalCommunities.toString(),
      change: 12.5,
      icon: "solar:buildings-3-broken",
      title: "Communities",
      variant: "success",
    },
  ];

  return (
    <Row>
      {unitsStatData.map((item, idx) => (
        <Col md={6} xl={3} key={idx}>
          <UnitStatCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default UnitsStat;
