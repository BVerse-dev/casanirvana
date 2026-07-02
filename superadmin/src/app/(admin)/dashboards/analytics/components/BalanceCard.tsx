"use client";

import moneyImg from "@/assets/images/money.png";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { useAdminAnalyticsDashboard } from "@/hooks/useAdminAnalyticsDashboard";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Col,
  ProgressBar,
  Row,
} from "react-bootstrap";

const BalanceCard = () => {
  const { currentMonthCollected, currentMonthDueTotal, currentMonthOutstanding, error } = usePaymentAnalyticsSummary();
  const { data: dashboard } = useAdminAnalyticsDashboard();

  const totalUnitsCount = dashboard?.summary.totalUnits || 0;
  const occupancyProgress = dashboard?.summary.occupiedRate || 0;
  const occupiedUnits = Math.round((occupancyProgress / 100) * totalUnitsCount);

  const collectionProgress = currentMonthDueTotal > 0 ? (currentMonthCollected / currentMonthDueTotal) * 100 : 0;

  const propertyData = [
    {
      title: "Units",
      icon: "solar:home-bold-duotone",
      amount: totalUnitsCount.toString(),
      progress: occupancyProgress,
      variant: "primary",
      caption: `${occupiedUnits} occupied`,
    },
    {
      title: "Collections",
      icon: "solar:money-bag-bold-duotone",
      amount: `${currency}${((currentMonthCollected || 0) / 1000).toFixed(1)}K`,
      progress: collectionProgress,
      variant: "success",
      caption:
        currentMonthDueTotal > 0
          ? `${Math.round(collectionProgress)}% of dues`
          : "No dues this month",
    },
  ];

  if (error) {
    return (
      <Col xl={4}>
        <Card>
          <CardBody className="text-center text-muted py-5">Collection balance is unavailable right now.</CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={4}>
      <Card className="bg-primary bg-gradient">
        <CardBody>
          <Row className="align-items-center justify-content-between">
            <Col xl={7} lg={6} md={6}>
              <h3 className="text-white fw-bold">{currency}{currentMonthCollected.toLocaleString()}</h3>
              <p className="text-white-50">Current Month Collections</p>
              <Row className="mt-4">
                <Col lg={12} className="mb-2" md={6} xs={6}>
                  <div className="d-flex gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-success bg-opacity-50 text-white rounded">
                        <IconifyIcon icon="ri:arrow-down-line" className=" fs-4" />
                      </span>
                    </div>
                    <div className="d-block">
                      <h5 className="text-white fw-medium mb-0">
                        {currency}{currentMonthCollected.toLocaleString()}
                      </h5>
                      <p className="mb-0 text-white-50">Collected</p>
                    </div>
                  </div>
                </Col>
                <Col lg={6} md={6} xs={6}>
                  <div className="d-flex gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-warning bg-opacity-50 text-white rounded">
                        <IconifyIcon icon="ri:time-line" className=" fs-4" />
                      </span>
                    </div>
                    <div className="d-block">
                      <h5 className="text-white fw-medium mb-0">
                        {currency}{currentMonthOutstanding.toLocaleString()}
                      </h5>
                      <p className="mb-0 text-white-50">Outstanding</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mt-3 g-2">
                <Col xl={6} lg={6} md={6}>
                  <Button variant="warning" size="sm" className="w-100" disabled>
                    Ledger Action Pending
                  </Button>
                </Col>
                <Col xl={6} lg={6} md={6}>
                  <Button
                    size="sm"
                    className="bg-light bg-opacity-25 text-white w-100"
                    disabled
                  >
                    Runtime QA Later
                  </Button>
                </Col>
              </Row>
            </Col>
            <Col xl={5} lg={4} md={4}>
              <Image src={moneyImg} alt="money" className="img-fluid" />
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="p-0">
          <Row className="g-3">
            {propertyData.map((item, idx) => (
              <Col xl={6} md={6} key={idx}>
                <div className="text-center p-3 border-end">
                  <CardTitle as={"h5"} className="mb-0 text-dark fw-medium">
                    {item.title}
                  </CardTitle>
                  <div className="avatar-md bg-light bg-opacity-50 rounded mx-auto my-3 flex-centered">
                    <IconifyIcon
                      icon={item.icon}
                      width={32}
                      height={32}
                      className={`fs-32 text-${item.variant}`}
                    />
                  </div>
                  <h4 className="text-dark fw-medium">{item.amount}</h4>
                  <p className="text-muted">{item.caption}</p>
                  <ProgressBar
                    animated
                    striped
                    variant={item.variant}
                    now={item.progress}
                    className={`mt-3`}
                    style={{ height: 10 }}
                    role="progressbar"
                  />
                </div>
              </Col>
            ))}
          </Row>
        </CardBody>
        <CardFooter className="border-top mt-1">
          <Link href="/payments" className="link-dark fw-medium">
            View Collections <IconifyIcon icon="ri-arrow-right-line" />
          </Link>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default BalanceCard;
