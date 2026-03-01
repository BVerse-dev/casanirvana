"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Database } from "@/lib/database.types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Badge, Row, Col, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, ProgressBar } from "react-bootstrap";
import PaymentAnalytics from "./PaymentAnalytics";

type Payment = Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
  id: string;
  amount: number;
  amount_formatted?: string | null;
  currency_symbol?: string | null;
  unit?: {
    id: string;
    unit_number: string | null;
    block: string | null;
    floor_area: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    society_id: string | null;
    owner_id: string | null;
    tenant_id: string | null;
  } | null;
  payer_profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: string | null;
  } | null;
  society?: {
    id: string;
    name: string;
    address: string | null;
  } | null;
  created_at?: string;
};

interface PaymentDetailsProps {
  payment: Payment;
}

const PaymentDetails = ({ payment }: PaymentDetailsProps) => {
  const formatAmount = () =>
    payment.amount_formatted || `${payment.currency_symbol || "GH₵"} ${Number(payment.amount || 0).toFixed(2)}`;

  // Get status badge variant
  const getStatusVariant = (status: string | null | undefined) => {
    if (!status) return "info";
    switch (status) {
      case "initiated":
      case "processing":
        return "warning";
      case "completed":
        return "success";
      case "failed":
      case "overdue":
        return "danger";
      case "cancelled":
      case "expired":
        return "secondary";
      case "unpaid":
        return "danger";
      default:
        return "info";
    }
  };

  // Calculate remaining payment percentage for the progress bar
  const getRemainingPayment = (status: string | null | undefined) => {
    if (!status) return 0;
    switch (status) {
      case "completed":
        return 100;
      case "processing":
        return 75;
      case "initiated":
        return 50;
      case "failed":
        return 25;
      case "cancelled":
      case "expired":
        return 15;
      default:
        return 0;
    }
  };

  // Format date nicely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate invoice number from payment ID
  const invoiceNumber = payment.id ? `INV-${payment.id.substring(0, 6).toUpperCase()}` : "Unknown";

  // Define payment receipt URL
  const receiptUrl = `/api/payments/${payment.id}/receipt`;
  
  // Get status icon
  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return "solar:question-circle-bold-duotone";
    switch (status) {
      case "completed":
        return "solar:check-circle-bold-duotone";
      case "pending":
        return "solar:hourglass-bold-duotone";
      case "failed":
        return "solar:close-circle-bold-duotone";
      case "overdue":
        return "solar:alarm-bold-duotone";
      default:
        return "solar:question-circle-bold-duotone";
    }
  };

  // Payment process timeline milestones
  const paymentMilestones = [
    {
      date: payment.due_date ? new Date(payment.due_date) : new Date(), 
      status: "Invoice Generated",
      icon: "solar:file-invoice-bold-duotone",
      completed: true
    },
    {
      date: payment.due_date ? new Date(payment.due_date) : null,
      status: "Payment Due",
      icon: "solar:calendar-mark-bold-duotone",
      completed: payment.status === "completed" || payment.status === "failed"
    },
    {
      date: payment.payment_date ? new Date(payment.payment_date) : null,
      status: "Payment Attempted",
      icon: "solar:card-send-bold-duotone",
      completed: payment.status === "completed" || payment.status === "failed"
    },
    {
      date: payment.paid_at || payment.completed_at ? new Date(payment.paid_at || payment.completed_at || "") : null,
      status: "Payment Completed",
      icon: "solar:check-square-bold-duotone",
      completed: payment.status === "completed"
    }
  ];

  return (
    <>
      {/* Payment Status Hero Banner */}
      <Card className="border-0 shadow-lg overflow-hidden mb-4">
        <div 
          className="position-relative"
          style={{ 
            background: `linear-gradient(135deg, rgba(${
              payment.status === 'completed' ? '21, 128, 61' :
              payment.status === 'pending' ? '202, 138, 4' :
              payment.status === 'failed' ? '185, 28, 28' : 
              payment.status === 'overdue' ? '194, 65, 12' : '59, 130, 246'
            }, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%)`
          }}
        >
          <CardBody className="py-4 text-white">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    <IconifyIcon 
                      icon={getStatusIcon(payment.status)} 
                      className="fs-24 text-white"
                    />
                  </div>
                  <div>
                    <Badge 
                      bg="white" 
                      text={getStatusVariant(payment.status || "")}
                      className="fs-14 px-3 py-2 fw-medium"
                    >
                      {payment.status ? payment.status.toUpperCase() : "UNKNOWN"}
                    </Badge>
                    <h3 className="text-white mb-0 mt-2">
                      Invoice #{invoiceNumber}
                    </h3>
                  </div>
                </div>
                <p className="mb-0 fs-16 text-white opacity-90">
                  {payment.payment_type || "Payment"} for {payment.society?.name || "Casa Nirvana"}
                </p>
              </Col>
              
              <Col lg={4} className="text-lg-end">
                <div className="bg-white bg-opacity-15 rounded p-3 d-inline-block text-center">
                    <h3 className="text-white mb-1">{formatAmount()}</h3>
                  <p className="mb-0 text-white opacity-90">Total Amount</p>
                </div>
              </Col>
            </Row>
          </CardBody>
        </div>
      </Card>
      
      <Row className="mb-2">
        <Col lg={4}>
          {/* User Profile Card */}
          <Card className="shadow-sm mb-4">
            <CardHeader className="border-bottom bg-transparent py-3">
              <h5 className="mb-0">Payer Information</h5>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {payment.payer_profile?.avatar_url ? (
                    <Image
                      src={payment.payer_profile.avatar_url}
                      alt="User Avatar"
                      width={64}
                      height={64}
                      className="rounded-circle"
                    />
                  ) : (
                    <div className="avatar bg-light-subtle text-primary rounded-circle flex-centered" style={{width: '64px', height: '64px'}}>
                      <IconifyIcon icon="solar:user-broken" className="fs-24" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="mb-1">{payment.payer_profile?.full_name || "Unknown User"}</h5>
                  <div className="text-muted fs-14">
                    <span className="badge bg-light-subtle text-muted rounded-pill">Resident</span>
                  </div>
                </div>
              </div>

              <hr className="my-3" />
              
              <div>
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-1 me-2">
                      <IconifyIcon icon="solar:phone-calling-broken" className="fs-18 text-primary" />
                    </div>
                    <p className="mb-0">{payment.payer_profile?.phone || "No phone available"}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-1 me-2">
                      <IconifyIcon icon="solar:letter-broken" className="fs-18 text-primary" />
                    </div>
                    <p className="mb-0 text-break">{payment.payer_profile?.email || "No email available"}</p>
                  </div>
                </div>
                {payment.unit_id && (
                  <div className="mb-0">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle p-1 me-2">
                        <IconifyIcon icon="solar:home-angle-broken" className="fs-18 text-primary" />
                      </div>
                      <p className="mb-0">
                        <Link href={`/property/details?id=${payment.unit_id}`} className="text-primary">
                          View Unit Details
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
          
          {/* Payment Analytics Card */}
          <PaymentAnalytics payment={payment} />
        </Col>
        
        <Col lg={8}>
          {/* Payment Details Card */}
          <Card className="shadow-sm mb-4">
            <CardHeader className="border-bottom bg-transparent py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Payment Details</h5>
              <Dropdown>
                <DropdownToggle variant="light" size="sm" className="border">
                  <IconifyIcon icon="solar:menu-dots-bold" className="fs-16" />
                </DropdownToggle>
                <DropdownMenu align="end" className="border shadow-sm">
                  <DropdownItem href={receiptUrl} target="_blank">
                    <IconifyIcon icon="solar:printer-minimalistic-broken" className="me-2" />
                    Download Receipt
                  </DropdownItem>
                  <DropdownItem>
                    <IconifyIcon icon="solar:letter-broken" className="me-2" />
                    Email Invoice
                  </DropdownItem>
                  <DropdownItem>
                    <IconifyIcon icon="solar:refresh-broken" className="me-2" />
                    Request Payment
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody>
              {/* Transaction Information Section */}
              <div className="mb-4">
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center p-2 bg-light bg-opacity-50 rounded mb-2">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                        <IconifyIcon icon="solar:document-text-bold-duotone" className="text-primary fs-18" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1 fs-12">Transaction ID</h6>
                        <p className="mb-0 fw-semibold fs-14">
                          {payment.transaction_id || `TXN-${payment.id?.substring(0, 8).toUpperCase()}` || "N/A"}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center p-2 bg-light bg-opacity-50 rounded mb-2">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                        <IconifyIcon 
                          icon={
                            payment.payment_method?.toLowerCase().includes('credit') ? 'solar:card-bold-duotone' : 
                            payment.payment_method?.toLowerCase().includes('bank') ? 'solar:bank-bold-duotone' :
                            payment.payment_method?.toLowerCase().includes('wallet') ? 'solar:wallet-money-bold-duotone' :
                            'solar:dollar-minimalistic-bold-duotone'
                          } 
                          className="text-success fs-18" 
                        />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1 fs-12">Payment Method</h6>
                        <p className="mb-0 fw-semibold fs-14">{payment.payment_method || "Not specified"}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Date Information Section */}
              <div className="mb-4">
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center p-2 bg-light bg-opacity-50 rounded mb-2">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2">
                        <IconifyIcon icon="solar:calendar-date-bold-duotone" className="text-info fs-18" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1 fs-12">Payment Date</h6>
                        <p className="mb-0 fw-semibold fs-14">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center p-2 bg-light bg-opacity-50 rounded mb-2">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                        <IconifyIcon icon="solar:alarm-bold-duotone" className="text-warning fs-18" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1 fs-12">Due Date</h6>
                        <p className="mb-0 fw-semibold fs-14">
                          {formatDate(payment.due_date)}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Additional Information Section */}
              <div className="mb-4">
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center p-2 bg-light bg-opacity-50 rounded mb-2">
                      <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-2">
                        <IconifyIcon icon="solar:tag-bold-duotone" className="text-secondary fs-18" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1 fs-12">Payment Type</h6>
                        <p className="mb-0 fw-semibold fs-14">{payment.payment_type || "N/A"}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center p-2 bg-light bg-opacity-50 rounded mb-2">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                        <IconifyIcon icon="solar:buildings-3-bold-duotone" className="text-primary fs-18" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1 fs-12">Community</h6>
                        <p className="mb-0 fw-semibold fs-14">
                          {payment.society?.name ? (
                            <Link 
                              href={`/societies/${payment.society.id}`} 
                              className="text-primary text-decoration-none"
                            >
                              {payment.society.name}
                            </Link>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Status and Timestamp Section */}
              {(payment.completed_at || payment.failed_at) && (
                <div className="mb-3">
                  <Row>
                    {payment.completed_at && (
                      <Col md={6}>
                        <div className="d-flex align-items-center p-2 bg-success bg-opacity-10 rounded mb-2">
                          <div className="bg-success bg-opacity-20 rounded-circle p-2 me-2">
                            <IconifyIcon icon="solar:check-circle-bold-duotone" className="text-success fs-18" />
                          </div>
                          <div>
                            <h6 className="text-muted mb-1 fs-12">Completed At</h6>
                            <p className="mb-0 fw-semibold fs-14">
                              {formatDate(payment.completed_at)}
                            </p>
                          </div>
                        </div>
                      </Col>
                    )}
                    {payment.failed_at && (
                      <Col md={6}>
                        <div className="d-flex align-items-center p-2 bg-danger bg-opacity-10 rounded mb-2">
                          <div className="bg-danger bg-opacity-20 rounded-circle p-2 me-2">
                            <IconifyIcon icon="solar:close-circle-bold-duotone" className="text-danger fs-18" />
                          </div>
                          <div>
                            <h6 className="text-muted mb-1 fs-12">Failed At</h6>
                            <p className="mb-0 fw-semibold fs-14">
                              {formatDate(payment.failed_at)}
                            </p>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Description Section */}
              <div className="mb-3">
                <div className="d-flex align-items-start p-2 bg-light bg-opacity-50 rounded">
                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-2 flex-shrink-0">
                    <IconifyIcon icon="solar:text-bold-duotone" className="text-info fs-18" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1 fs-12">Description</h6>
                    <p className="mb-0 fw-medium fs-14">{payment.description || "No description available"}</p>
                  </div>
                </div>
              </div>


              
              {/* Progress Indicator */}
              <div className="my-4">
                <ProgressBar 
                  variant={getStatusVariant(payment.status || "")}
                  now={getRemainingPayment(payment.status)} 
                  className="mb-3"
                />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Payment Status</small>
                  <small className="fw-medium">{getRemainingPayment(payment.status)}% Complete</small>
                </div>
              </div>
              
              {/* Payment Amount Summary Box */}
              <div className="bg-primary bg-opacity-10 p-3 rounded mb-3 border border-primary border-opacity-20">
                <Row className="align-items-center">
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-20 rounded-circle p-2 me-2">
                        <IconifyIcon icon="solar:dollar-bold-duotone" className="text-primary fs-18" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-semibold">Total Amount</h6>
                        <p className="text-muted mb-0 fs-14">{payment.payment_type || "Payment"} Total</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} className="text-end">
                    <h2 className="text-primary mb-0 fw-bold">{formatAmount()}</h2>
                  </Col>
                </Row>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PaymentDetails;
