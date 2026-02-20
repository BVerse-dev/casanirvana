"use client";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Database } from "@/lib/database.types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Badge, Row, Col, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, ProgressBar } from "react-bootstrap";

type Payment = Database["public"]["Tables"]["payments"]["Row"] & {
  user_profile?: {
    id: string;
    full_name: string;
    avatar_url: string;
    email: string;
    phone: string;
  };
  society?: {
    id: string;
    name: string;
    address: string;
  };
};

interface PaymentDetailsProps {
  payment: Payment;
}

const PaymentDetails = ({ payment }: PaymentDetailsProps) => {
  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      case "overdue":
        return "danger";
      default:
        return "info";
    }
  };

  // Calculate remaining payment percentage for the progress bar
  const getRemainingPayment = (status: string | null) => {
    if (!status) return 0;
    switch (status) {
      case "completed":
        return 100;
      case "pending":
        return 50;
      case "failed":
        return 25;
      case "overdue":
        return 15;
      default:
        return 0;
    }
  };

  // Format date nicely
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate invoice number from payment ID
  const invoiceNumber = payment.id ? `INV-${payment.id.substring(0, 6).toUpperCase()}` : "Unknown";

  // Define payment receipt URL (mock)
  const receiptUrl = `/api/payments/${payment.id}/receipt`;

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
                      icon={
                        payment.status === 'completed' ? 'solar:check-circle-bold-duotone' : 
                        payment.status === 'pending' ? 'solar:hourglass-bold-duotone' : 
                        payment.status === 'failed' ? 'solar:close-circle-bold-duotone' :
                        'solar:alarm-bold-duotone'
                      } 
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
                  <h3 className="text-white mb-1">${Number(payment.amount).toFixed(2)}</h3>
                  <p className="mb-0 text-white opacity-90">Total Amount</p>
                </div>
              </Col>
            </Row>
          </CardBody>
        </div>
      </Card>
      
      <Row className="mb-4">
        <Col lg={4}>
          {/* User Profile Card */}
          <Card className="shadow-sm mb-4">
            <CardHeader className="border-bottom bg-transparent py-3">
              <h5 className="mb-0">Payer Information</h5>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {payment.user_profile?.avatar_url ? (
                    <Image
                      src={payment.user_profile.avatar_url}
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
                  <h5 className="mb-1">{payment.user_profile?.full_name || "Unknown User"}</h5>
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
                    <p className="mb-0">{payment.user_profile?.phone || "No phone available"}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-1 me-2">
                      <IconifyIcon icon="solar:letter-broken" className="fs-18 text-primary" />
                    </div>
                    <p className="mb-0 text-break">{payment.user_profile?.email || "No email available"}</p>
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
                          Unit {payment.unit_id}
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
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
              <Row>
                <Col md={6}>
                  <div className="mb-4">
                    <h6 className="text-muted mb-1">Transaction ID</h6>
                    <p className="mb-0 fw-medium">
                      {payment.transaction_id || `TXN-${payment.id?.substring(0, 8).toUpperCase()}` || "N/A"}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-4">
                    <h6 className="text-muted mb-1">Payment Method</h6>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <IconifyIcon 
                          icon={
                            payment.payment_method?.toLowerCase().includes('credit') ? 'solar:card-broken' : 
                            payment.payment_method?.toLowerCase().includes('bank') ? 'solar:bank-broken' :
                            payment.payment_method?.toLowerCase().includes('wallet') ? 'solar:wallet-money-broken' :
                            'solar:dollar-minimalistic-broken'
                          } 
                          className="text-primary fs-18" 
                        />
                      </div>
                      <p className="mb-0 fw-medium">{payment.payment_method || "Not specified"}</p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-4">
                    <h6 className="text-muted mb-1">Payment Date</h6>
                    <p className="mb-0 fw-medium">
                      {formatDate(payment.payment_date)}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-4">
                    <h6 className="text-muted mb-1">Due Date</h6>
                    <p className="mb-0 fw-medium">
                      {formatDate(payment.due_date)}
                    </p>
                  </div>
                </Col>
              </Row>
              
              <hr className="my-3" />
              
              <div className="mb-4">
                <h6 className="text-muted mb-1">Description</h6>
                <p className="mb-3">{payment.description || "No description provided"}</p>
                
                {payment.notes && (
                  <div className="bg-light p-3 rounded">
                    <h6 className="mb-2">Notes</h6>
                    <p className="mb-0 text-muted">{payment.notes}</p>
                  </div>
                )}
              </div>
              
              <hr className="my-3" />
              
              <div className="mb-4">
                <h6 className="mb-3">Payment Progress</h6>
                <ProgressBar 
                  variant={getStatusVariant(payment.status || "")} 
                  now={getRemainingPayment(payment.status)}
                  className="mb-2"
                />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Payment Status</small>
                  <small className="fw-medium">{getRemainingPayment(payment.status)}% Complete</small>
                </div>
              </div>
              
              <div className="bg-light-subtle p-4 rounded mb-3">
                <Row className="align-items-center">
                  <Col xs={6}>
                    <h5 className="mb-1">Total Amount</h5>
                    <p className="text-muted mb-0">Payment Total</p>
                  </Col>
                  <Col xs={6} className="text-end">
                    <h2 className="text-primary mb-0">${Number(payment.amount).toFixed(2)}</h2>
                  </Col>
                </Row>
              </div>
              
              <div className="d-flex justify-content-end mt-4">
                <Button variant="soft-primary" className="me-2">
                  <IconifyIcon icon="solar:file-bold" className="me-1" />
                  View Statement
                </Button>
                <Button variant="primary">
                  <IconifyIcon icon="solar:document-text-broken" className="me-1" />
                  Generate Receipt
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PaymentDetails;
