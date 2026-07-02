"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { type AdminPaymentRecord, useListPayments } from "@/hooks/usePayments";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
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
  Form,
  Pagination,
  Row,
} from "react-bootstrap";

const PaymentData = () => {
  const { data: payments = [], isLoading } = useListPayments();

  const formatAmount = (payment: AdminPaymentRecord) =>
    payment.amount_formatted || `${payment.currency_symbol || "GH₵"} ${Number(payment.amount || 0).toFixed(2)}`;
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Calculate pagination values
  const totalItems = payments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [payments.length]);

  // Get payment category icon and details
  const getPaymentCategoryInfo = (paymentType: string, description?: string) => {
    const type = paymentType?.toLowerCase() || '';
    const desc = description?.toLowerCase() || '';
    
    if (type.includes('maintenance') || desc.includes('maintenance') || desc.includes('repair')) {
      return {
        icon: "solar:hammer-broken",
        category: "Maintenance",
        color: "warning",
        bgColor: "warning-subtle"
      };
    } else if (type.includes('service') || type.includes('charges') || desc.includes('service') || desc.includes('charges')) {
      return {
        icon: "solar:settings-broken",
        category: "Service Charges",
        color: "primary",
        bgColor: "primary-subtle"
      };
    } else if (type.includes('amenity') || type.includes('booking') || type.includes('gym') || type.includes('pool') || type.includes('clubhouse') || type.includes('tennis') || desc.includes('amenity') || desc.includes('booking') || desc.includes('facility') || desc.includes('gym') || desc.includes('pool') || desc.includes('clubhouse') || desc.includes('tennis')) {
      return {
        icon: "solar:swimming-broken",
        category: "Amenity Booking",
        color: "success",
        bgColor: "success-subtle"
      };
    } else if (type.includes('hoa') || type.includes('dues') || desc.includes('hoa') || desc.includes('dues')) {
      return {
        icon: "solar:buildings-2-broken",
        category: "HOA Dues",
        color: "primary",
        bgColor: "primary-subtle"
      };
    } else if (type.includes('fine') || type.includes('penalty') || type.includes('violation') || desc.includes('fine') || desc.includes('penalty') || desc.includes('violation')) {
      return {
        icon: "solar:danger-triangle-broken",
        category: "Fine/Penalty",
        color: "danger",
        bgColor: "danger-subtle"
      };
    } else if (type.includes('deposit') || desc.includes('deposit') || desc.includes('refund')) {
      return {
        icon: "solar:wallet-money-broken",
        category: "Deposit",
        color: "success",
        bgColor: "success-subtle"
      };
    } else if (type.includes('insurance') || desc.includes('insurance')) {
      return {
        icon: "solar:shield-minimalistic-broken",
        category: "Insurance",
        color: "info",
        bgColor: "info-subtle"
      };
    } else if (type.includes('electricity') || type.includes('electric') || desc.includes('electricity') || desc.includes('electric') || desc.includes('power')) {
      return {
        icon: "solar:bolt-broken",
        category: "Electricity",
        color: "warning",
        bgColor: "warning-subtle"
      };
    } else if (type.includes('water') || desc.includes('water') || desc.includes('plumbing')) {
      return {
        icon: "solar:water-drop-broken",
        category: "Water Bill",
        color: "info",
        bgColor: "info-subtle"
      };
    } else if (type.includes('gas') || desc.includes('gas')) {
      return {
        icon: "solar:flame-broken",
        category: "Gas Bill",
        color: "danger",
        bgColor: "danger-subtle"
      };
    } else {
      return {
        icon: "solar:bill-list-broken",
        category: "Other",
        color: "secondary",
        bgColor: "secondary-subtle"
      };
    }
  };

  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"}>All Payments List</CardTitle>
              </div>
              <Dropdown>
                <DropdownToggle
                  as={"a"}
                  className=" btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  This Month{" "}
                  <IconifyIcon
                    className="ms-1"
                    width={16}
                    height={16}
                    icon="ri:arrow-down-s-line"
                  />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem>Download</DropdownItem>
                  <DropdownItem>Export</DropdownItem>
                  <DropdownItem>Import</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="customCheck1"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customCheck1"
                          />
                        </div>
                      </th>
                      <th>Resident &amp; Unit</th>
                      <th>Payment Date</th>
                      <th>Category &amp; Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((payment: AdminPaymentRecord, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`customCheck${idx}`}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`customCheck${idx}`}
                            >
                              &nbsp;
                            </label>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div>
                              {(() => {
                                const avatarImage = mapAvatarUrl(payment.payer_profile?.avatar_url);
                                return avatarImage ? (
                                  <Image
                                    src={avatarImage}
                                    alt="avatar"
                                    width={40}
                                    height={40}
                                    className="avatar-sm rounded-circle"
                                  />
                                ) : (
                                  <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                                    <IconifyIcon icon="ri:user-line" className="fs-16 text-muted" />
                                  </div>
                                );
                              })()}
                            </div>
                            <div>
                              <Link
                                href={`/payments/details?id=${payment.id}`}
                                className="text-dark fw-medium fs-15"
                              >
                                {payment.payer_profile?.full_name || "Unknown"}
                              </Link>
                              <p className="text-muted mb-0 fs-13">
                                Unit: {payment.unit?.unit_number || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString()
                            : payment.due_date
                            ? new Date(payment.due_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {(() => {
                              const categoryInfo = getPaymentCategoryInfo(payment.payment_type || '', payment.description || undefined);
                              return (
                                <>
                                  <div className={`bg-${categoryInfo.bgColor} p-2 rounded-circle`}>
                                    <IconifyIcon
                                      icon={categoryInfo.icon}
                                      className={`fs-18 text-${categoryInfo.color}`}
                                    />
                                  </div>
                                  <div>
                                    <div className="fw-medium text-dark fs-14">
                                      {categoryInfo.category}
                                    </div>
                                    <small className="text-muted">
                                      {payment.payment_type || 'Payment'}
                                    </small>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td>{payment.description || "N/A"}</td>
                        <td>{formatAmount(payment)}</td>
                        <td>{payment.payment_method || "N/A"}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              payment.status === "initiated" || payment.status === "processing"
                                ? "warning"
                                : payment.status === "completed"
                                  ? "success"
                                  : payment.status === "failed"
                                    ? "danger"
                                    : payment.status === "cancelled" || payment.status === "expired"
                                      ? "secondary"
                                    : "info"
                            } text-white fs-11`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/payments/details?id=${payment.id}`}>
                              <Button 
                                variant="light" 
                                size="sm"
                              >
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                            </Link>
                            <Button variant="soft-primary" size="sm">
                              <IconifyIcon
                                icon="solar:pen-2-broken"
                                className="align-middle fs-18"
                              />
                            </Button>
                            <Button variant="soft-danger" size="sm">
                              <IconifyIcon
                                icon="solar:trash-bin-minimalistic-2-broken"
                                className="align-middle fs-18"
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
            <CardFooter className="border-top">
              <Row className="align-items-center">
                <Col lg={6}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted">
                      Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalItems)} of {totalItems} payments
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted">Show:</span>
                      <Form.Select 
                        size="sm" 
                        style={{ width: 'auto' }}
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </Form.Select>
                      <span className="text-muted">entries</span>
                    </div>
                  </div>
                </Col>
                <Col lg={6}>
                  <nav aria-label="Page navigation">
                    <Pagination className="justify-content-end mb-0">
                      <Pagination.Prev 
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                        if (pageNum <= totalPages) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === currentPage}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        }
                        return null;
                      })}
                      
                      <Pagination.Next 
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </Pagination>
                  </nav>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PaymentData;
