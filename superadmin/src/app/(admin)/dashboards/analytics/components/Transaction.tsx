"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { usePaymentAnalyticsSummary } from "@/hooks/usePaymentAnalyticsSummary";
import Image from "next/image";
import Link from "next/link";
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
  Row,
} from "react-bootstrap";

const Transaction = () => {
  const { error, isLoading, recentTransactions } = usePaymentAnalyticsSummary();

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="text-center py-5">Loading payments...</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody className="text-center py-5 text-muted">Latest payments are unavailable right now.</CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <CardTitle as={"h4"}>Latest Payments</CardTitle>
            </div>
            <Dropdown>
              <DropdownToggle
                as={"a"}
                className="btn btn-sm btn-outline-light rounded content-none icons-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Latest Activity
                <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem as={Link} href="/payments">Open payments workspace</DropdownItem>
                <DropdownItem as={Link} href="/payments/invoices">Open invoices</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Payment ID</th>
                    <th>Resident Name</th>
                    <th>Unit</th>
                    <th>Payment Date</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 6).map((payment: Record<string, any>) => {
                    const paymentDate =
                      payment.payment_date ||
                      payment.paid_at ||
                      payment.completed_at ||
                      payment.due_date ||
                      payment.created_at;

                    return (
                      <tr key={payment.id}>
                        <td>
                          <Link href={`/payments/details?id=${payment.id}`} className="text-dark fw-medium">
                            #{payment.transaction_id || payment.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {payment.payer_profile?.avatar_url ? (
                              <Image
                                src={payment.payer_profile.avatar_url}
                                className="avatar-sm rounded-circle"
                                alt={payment.payer_profile.full_name || "Resident"}
                                width={32}
                                height={32}
                              />
                            ) : (
                              <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                                <IconifyIcon icon="ri:user-line" className="text-muted" />
                              </div>
                            )}
                            <span>{payment.payer_profile?.full_name || "Unknown Resident"}</span>
                          </div>
                        </td>
                        <td>{payment.unit?.unit_number || "N/A"}</td>
                        <td>
                          {paymentDate
                            ? new Date(paymentDate).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td>GH₵ {Number(payment.amount || 0).toFixed(2)}</td>
                        <td>{payment.payment_method || payment.payment_type || "N/A"}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              payment.status === "failed"
                                ? "danger"
                                : payment.status === "pending" || payment.status === "initiated" || payment.status === "processing"
                                  ? "warning"
                                  : payment.status === "completed"
                                    ? "success"
                                    : "secondary"
                            }-subtle text-${
                              payment.status === "failed"
                                ? "danger"
                                : payment.status === "pending" || payment.status === "initiated" || payment.status === "processing"
                                  ? "warning"
                                  : payment.status === "completed"
                                    ? "success"
                                    : "secondary"
                            } py-1 px-2 fs-12`}
                          >
                            {payment.status ? payment.status.replace(/_/g, " ") : "Unknown"}
                          </span>
                        </td>
                        <td>
                          <Link href={`/payments/details?id=${payment.id}`} className="btn btn-light btn-sm">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {recentTransactions.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No payments found</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Transaction;
