"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Button,
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
} from "react-bootstrap";

const OPEN_OBLIGATION_STATUSES = new Set(["unpaid", "partially_paid", "overdue"]);
const OPEN_PAYMENT_STATUSES = new Set(["pending", "initiated", "processing", "open"]);

const getRecordDate = (record: Record<string, any>) => {
  const raw = record.payment_date || record.paid_at || record.completed_at || record.due_date || record.created_at;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getPeriodBounds = (timeFilter: "current" | "last" | "year") => {
  const now = new Date();

  if (timeFilter === "year") {
    const currentStart = new Date(now.getFullYear(), 0, 1);
    return {
      currentStart,
      currentEnd: new Date(now.getFullYear() + 1, 0, 1),
      periodLabel: "This Year",
    };
  }

  if (timeFilter === "last") {
    const currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      currentStart,
      currentEnd: new Date(now.getFullYear(), now.getMonth(), 1),
      periodLabel: "Last Month",
    };
  }

  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    currentStart,
    currentEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    periodLabel: "This Month",
  };
};

const isInRange = (date: Date | null, start: Date, end: Date) => Boolean(date && date >= start && date < end);

const ResidentPayments = () => {
  const { error, isLoading, obligations, payments } = usePaymentAnalyticsSummary();
  const [timeFilter, setTimeFilter] = useState<"current" | "last" | "year">("current");

  const paymentMetrics = useMemo(() => {
    const { currentEnd, currentStart, periodLabel } = getPeriodBounds(timeFilter);

    const dueObligations = obligations.filter((obligation) =>
      isInRange(getRecordDate(obligation), currentStart, currentEnd)
    );
    const openObligations = dueObligations.filter((obligation) =>
      OPEN_OBLIGATION_STATUSES.has(String(obligation.status || "").toLowerCase())
    );
    const filteredPayments = payments.filter((payment) => isInRange(getRecordDate(payment), currentStart, currentEnd));
    const collectedPayments = filteredPayments.filter((payment) =>
      ["completed", "paid", "success", "successful"].includes(String(payment.status || "").toLowerCase())
    );
    const pendingPayments = filteredPayments.filter((payment) =>
      OPEN_PAYMENT_STATUSES.has(String(payment.status || "").toLowerCase())
    );

    const totalDue = dueObligations.reduce((sum, obligation) => sum + Number(obligation.amount || 0), 0);
    const totalCollected = collectedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalOutstanding = openObligations.reduce((sum, obligation) => sum + Number(obligation.amount || 0), 0);
    const collectionRate = totalDue > 0 ? Math.min(Math.round((totalCollected / totalDue) * 100), 100) : 0;

    const residentsWithPendingPayments = Array.from(
      pendingPayments.reduce<Map<string, { id: string; name: string; amount: number }>>((acc, payment) => {
        const payerId = payment.payer_profile?.id || payment.payer_id || payment.id;
        const payerName = payment.payer_profile?.full_name || payment.payer_profile?.name || "Unknown Resident";
        const current = acc.get(payerId) || { id: payerId, name: payerName, amount: 0 };
        current.amount += Number(payment.amount || 0);
        acc.set(payerId, current);
        return acc;
      }, new Map()).values()
    )
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 5);

    return {
      totalDue,
      totalCollected,
      totalOutstanding,
      collectionRate,
      periodLabel,
      residentsWithPendingPayments,
    };
  }, [obligations, payments, timeFilter]);

  if (isLoading) {
    return (
      <Col lg={5}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Payments</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder" style={{ height: "15px" }}></div>
              <div className="placeholder col-12 mt-4" style={{ height: "100px" }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col lg={5}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Payments</CardTitle>
          </CardHeader>
          <CardBody className="text-center text-muted py-5">Resident payment metrics are unavailable right now.</CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={5}>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <CardTitle as={"h4"}>Resident Payments</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {paymentMetrics.periodLabel}{" "}
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter("current")}>This Month</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("last")}>Last Month</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter("year")}>This Year</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-muted fs-14 mb-2">Total Obligations Due</p>
              <h3 className="text-dark fw-bold mb-1">
                {currency}
                {(paymentMetrics.totalDue / 1000).toFixed(1)}K
              </h3>
            </div>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon icon="solar:card-broken" width={32} height={32} className="fs-32 text-primary" />
            </div>
          </div>
          <ProgressBar
            style={{ height: 15 }}
            now={paymentMetrics.collectionRate}
            striped
            animated
            variant="success"
            className="mt-3"
            role="progressbar"
            aria-label={`${paymentMetrics.collectionRate}% of obligations collected`}
          ></ProgressBar>

          <div className="d-flex align-items-center justify-content-between mt-3">
            <div>
              <p className="mb-2 text-success fs-15 fw-medium">Collected</p>
              <h4 className="text-dark fw-bold mb-0">
                {currency}
                {(paymentMetrics.totalCollected / 1000).toFixed(1)}K
              </h4>
            </div>
            <div className="text-end">
              <p className="mb-2 fs-15 fw-medium">Outstanding</p>
              <h4 className="text-dark fw-bold mb-0">
                {currency}
                {(paymentMetrics.totalOutstanding / 1000).toFixed(1)}K
              </h4>
            </div>
          </div>
          <div className="d-flex align-items-center bg-light-subtle border justify-content-between p-3 rounded mt-4 gap-3">
            <div className="flex-grow-1">
              <h5 className="fw-medium mb-1 text-dark fs-16">Residents with pending payment attempts</h5>
              {paymentMetrics.residentsWithPendingPayments.length > 0 ? (
                <div className="mt-3">
                  {paymentMetrics.residentsWithPendingPayments.map((resident) => (
                    <div key={resident.id} className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted">{resident.name}</span>
                      <span className="fw-semibold text-dark">
                        {currency}
                        {resident.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0 mt-3">No pending payment attempts were recorded in this period.</p>
              )}
            </div>
            <div className="d-flex flex-column gap-2">
              <Link href="/payments" className="btn btn-primary">
                Open Payments
              </Link>
              <Link href="/payments/invoices" className="btn btn-light">
                View Invoices
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ResidentPayments;
