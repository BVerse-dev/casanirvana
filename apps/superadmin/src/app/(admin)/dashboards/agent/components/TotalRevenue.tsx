"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";
import { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ProgressBar,
  Row,
} from "react-bootstrap";

const COMPLETED_PAYMENT_STATUSES = new Set(["completed", "paid", "success", "successful"]);

const getRecordDate = (payment: Record<string, any>) => {
  const raw = payment.payment_date || payment.paid_at || payment.completed_at || payment.due_date || payment.created_at;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getPeriodBounds = (timeFilter: "today" | "month" | "year") => {
  const now = new Date();

  if (timeFilter === "today") {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 1);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 1);
    return { currentStart, currentEnd, previousStart, previousEnd: currentStart, periodLabel: "Today" };
  }

  if (timeFilter === "year") {
    const currentStart = new Date(now.getFullYear(), 0, 1);
    const currentEnd = new Date(now.getFullYear() + 1, 0, 1);
    const previousStart = new Date(now.getFullYear() - 1, 0, 1);
    return { currentStart, currentEnd, previousStart, previousEnd: currentStart, periodLabel: "This Year" };
  }

  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { currentStart, currentEnd, previousStart, previousEnd: currentStart, periodLabel: "This Month" };
};

const isInRange = (date: Date | null, start: Date, end: Date) => Boolean(date && date >= start && date < end);

const getCategoryKey = (payment: Record<string, any>) => {
  const haystack = [payment.payment_type, payment.title, payment.description, payment.notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("maintenance") || haystack.includes("repair")) return "maintenance";
  if (haystack.includes("rent") || haystack.includes("lease")) return "rent";
  if (
    haystack.includes("utility") ||
    haystack.includes("electric") ||
    haystack.includes("water") ||
    haystack.includes("gas") ||
    haystack.includes("internet")
  ) {
    return "utilities";
  }

  return "other";
};

const ResidentRevenue = () => {
  const { error, isLoading, payments } = usePaymentAnalyticsSummary();
  const [timeFilter, setTimeFilter] = useState<"today" | "month" | "year">("month");

  const revenueMetrics = useMemo(() => {
    const { currentEnd, currentStart, periodLabel, previousEnd, previousStart } = getPeriodBounds(timeFilter);
    const completedPayments = payments.filter((payment) =>
      COMPLETED_PAYMENT_STATUSES.has(String(payment.status || "").toLowerCase())
    );

    const currentPeriodPayments = completedPayments.filter((payment) =>
      isInRange(getRecordDate(payment), currentStart, currentEnd)
    );
    const previousPeriodPayments = completedPayments.filter((payment) =>
      isInRange(getRecordDate(payment), previousStart, previousEnd)
    );

    const totalRevenue = currentPeriodPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const previousRevenue = previousPeriodPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const categorySums = currentPeriodPayments.reduce(
      (acc, payment) => {
        const key = getCategoryKey(payment);
        acc[key] += Number(payment.amount || 0);
        return acc;
      },
      { maintenance: 0, rent: 0, utilities: 0, other: 0 }
    );

    return {
      totalRevenue,
      maintenanceRevenue: categorySums.maintenance,
      rentRevenue: categorySums.rent,
      utilityRevenue: categorySums.utilities,
      otherRevenue: categorySums.other,
      periodLabel,
      growthRate: previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : null,
      transactionCount: currentPeriodPayments.length,
    };
  }, [payments, timeFilter]);

  const revenueData = [
    {
      title: "Maintenance",
      amount: `${currency}${(revenueMetrics.maintenanceRevenue / 1000).toFixed(1)}K`,
      progress:
        revenueMetrics.totalRevenue > 0
          ? Math.round((revenueMetrics.maintenanceRevenue / revenueMetrics.totalRevenue) * 100)
          : 0,
      variant: "primary",
    },
    {
      title: "Rent",
      amount: `${currency}${(revenueMetrics.rentRevenue / 1000).toFixed(1)}K`,
      progress:
        revenueMetrics.totalRevenue > 0 ? Math.round((revenueMetrics.rentRevenue / revenueMetrics.totalRevenue) * 100) : 0,
      variant: "success",
    },
    {
      title: "Utilities",
      amount: `${currency}${(revenueMetrics.utilityRevenue / 1000).toFixed(1)}K`,
      progress:
        revenueMetrics.totalRevenue > 0
          ? Math.round((revenueMetrics.utilityRevenue / revenueMetrics.totalRevenue) * 100)
          : 0,
      variant: "warning",
    },
    {
      title: "Other",
      amount: `${currency}${(revenueMetrics.otherRevenue / 1000).toFixed(1)}K`,
      progress:
        revenueMetrics.totalRevenue > 0 ? Math.round((revenueMetrics.otherRevenue / revenueMetrics.totalRevenue) * 100) : 0,
      variant: "info",
    },
  ];

  if (isLoading) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Collections</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-12" style={{ height: "150px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Collections</CardTitle>
          </CardHeader>
          <CardBody className="text-center text-muted py-5">Revenue data is unavailable right now.</CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={6}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <CardTitle as={"h4"}>Resident Collections</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {revenueMetrics.periodLabel}{" "}
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter("today")}>Today</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("month")}>This Month</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("year")}>This Year</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="d-flex align-items-center gap-2 text-dark fw-semibold">
                {currency}
                {(revenueMetrics.totalRevenue / 1000).toFixed(1)}K{" "}
                {revenueMetrics.growthRate !== null ? (
                  <span
                    className={`badge px-2 py-1 fs-12 icons-center ${
                      revenueMetrics.growthRate >= 0
                        ? "text-success bg-success-subtle"
                        : "text-danger bg-danger-subtle"
                    }`}
                  >
                    <IconifyIcon
                      width={12}
                      height={12}
                      icon={revenueMetrics.growthRate >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"}
                    />
                    {revenueMetrics.growthRate >= 0 ? "+" : ""}
                    {revenueMetrics.growthRate.toFixed(1)}%
                  </span>
                ) : null}
              </h3>
              <p className="mb-0 text-muted">
                {revenueMetrics.transactionCount} completed payment
                {revenueMetrics.transactionCount === 1 ? "" : "s"} in {revenueMetrics.periodLabel.toLowerCase()}
              </p>
            </div>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon icon="solar:wallet-money-broken" width={32} height={32} className="text-primary" />
            </div>
          </div>
          <div className="p-3 rounded bg-light-subtle border border-light mt-4">
            <h5>Collection Sources</h5>
            <Row className="my-3 g-lg-0 g-2">
              {revenueData.map((item, idx) => (
                <Col lg={3} xs={4} key={idx}>
                  <p className="mb-1 text-muted">
                    <IconifyIcon icon="ri:circle-fill" className={`fs-6 text-${item.variant}`} /> {item.title}
                  </p>
                  <p className="fs-16 text-dark fw-medium mb-1">{item.amount}</p>
                </Col>
              ))}
            </Row>
            <ProgressBar>
              {revenueData.map((item, idx) => (
                <ProgressBar
                  style={{ height: "10px" }}
                  variant={item.variant}
                  className="rounded-pill rounded-0 gap-2 overflow-visible"
                  now={item.progress}
                  key={idx}
                />
              ))}
            </ProgressBar>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ResidentRevenue;
