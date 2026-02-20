"use client";
import moneyImg from "@/assets/images/money.png";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
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
import { useListPayments } from "@/hooks/usePayments";
import { useListUnits } from "@/hooks/useUnits";

const BalanceCard = () => {
  const { data: payments = [] } = useListPayments();
  const { data: unitsResponse } = useListUnits();
  const units = unitsResponse?.data || [];
  const totalUnitsCount = unitsResponse?.count || units.length; // Use the total count from pagination

  // Calculate financial metrics from payments
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthPayments = payments.filter((payment: any) => {
    if (!payment.payment_date && !payment.due_date) return false;
    const paymentDate = new Date(payment.payment_date || payment.due_date);
    return paymentDate.getMonth() === currentMonth && 
           paymentDate.getFullYear() === currentYear &&
           payment.status === 'completed';
  });

  const totalCollections = currentMonthPayments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);
  
  const pendingPayments = payments
    .filter((payment: any) => payment.status === 'pending')
    .reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0);

  // Mock expenses for now (can be enhanced with real financial records)
  const totalExpenses = totalCollections * 0.6; // Assume 60% of collections are expenses
  const totalBalance = totalCollections - totalExpenses;

  // Calculate dynamic target based on real data (use a reasonable target like 20% above current count)
  const unitsTarget = Math.max(totalUnitsCount * 1.2, 100); // At least 100 units target
  const collectionsTarget = Math.max(totalCollections * 1.5, 50000); // At least 50K target

  // Calculate property data from real data
  const propertyData = [
    {
      title: "Units",
      icon: "solar:home-bold-duotone",
      amount: totalUnitsCount.toString(),
      progress: Math.min((totalUnitsCount / unitsTarget) * 100, 100),
      variant: "primary",
    },
    {
      title: "Collections",
      icon: "solar:money-bag-bold-duotone",
      amount: `${currency}${((totalCollections || 0) / 1000).toFixed(1)}K`,
      progress: Math.min(((totalCollections || 0) / collectionsTarget) * 100, 100),
      variant: "success",
    },
  ];

  return (
    <Col xl={4}>
      <Card className="bg-primary bg-gradient">
        <CardBody>
          <Row className="align-items-center justify-content-between">
            <Col xl={7} lg={6} md={6}>
              <h3 className="text-white fw-bold">{currency}{totalBalance?.toLocaleString() || '0'}</h3>
              <p className="text-white-50">Society Balance</p>
              <Row className="mt-4">
                <Col lg={12} className="mb-2" md={6} xs={6}>
                  <div className="d-flex gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-success bg-opacity-50 text-white rounded">
                        <IconifyIcon
                          icon="ri:arrow-down-line"
                          className=" fs-4"
                        />
                      </span>
                    </div>
                    <div className="d-block">
                      <h5 className="text-white fw-medium mb-0">
                        {currency}{totalCollections?.toLocaleString() || '0'}
                      </h5>
                      <p className="mb-0 text-white-50">Collections</p>
                    </div>
                  </div>
                </Col>
                <Col lg={6} md={6} xs={6}>
                  <div className="d-flex gap-2">
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-danger bg-opacity-50 text-white rounded">
                        <IconifyIcon
                          icon="ri:arrow-up-line"
                          className=" fs-4"
                        />
                      </span>
                    </div>
                    <div className="d-block">
                      <h5 className="text-white fw-medium mb-0">
                        {currency}{totalExpenses?.toLocaleString() || '0'}
                      </h5>
                      <p className="mb-0 text-white-50">Expenses</p>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mt-3 g-2">
                <Col xl={6} lg={6} md={6}>
                  <Button variant="warning" size="sm" className="w-100">
                    Send
                  </Button>
                </Col>
                <Col xl={6} lg={6} md={6}>
                  <Button
                    size="sm"
                    className="bg-light bg-opacity-25 text-white w-100"
                  >
                    Receive
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
                  <p className="text-muted">{item.progress.toFixed(0)}% Target</p>
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
          <Link href="" className="link-dark fw-medium">
            View More <IconifyIcon icon="ri-arrow-right-line" />
          </Link>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default BalanceCard;
