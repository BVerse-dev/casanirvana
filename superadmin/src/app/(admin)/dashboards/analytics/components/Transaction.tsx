"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
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
import { useListPayments } from "@/hooks/usePayments";
import { useListUnits } from "@/hooks/useUnits";
import { useListProfiles } from "@/hooks/useProfiles";
import avatar1 from "@/assets/images/users/avatar-1.jpg";

const Transaction = () => {
  const { data: payments = [], isLoading } = useListPayments();
  const { data: unitsResponse } = useListUnits();
  const { data: profiles = [] } = useListProfiles();
  
  const units = unitsResponse?.data || [];

  // Create lookup maps for units and residents
  const unitsMap = new Map(units.map((unit: any) => [unit.id, unit]));
  const profilesMap = new Map(profiles.map((profile: any) => [profile.id, profile]));

  // Sort payments by date (most recent first)
  const sortedPayments = [...payments].sort((a: any, b: any) => {
    const dateA = new Date(a.payment_date || a.due_date || 0);
    const dateB = new Date(b.payment_date || b.due_date || 0);
    return dateB.getTime() - dateA.getTime();
  });

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
                This Month{" "}
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
                  {sortedPayments.slice(0, 6).map((payment: any, idx) => {
                    const unit = payment.unit_id ? unitsMap.get(payment.unit_id) : null;
                    const resident = unit?.resident_id ? profilesMap.get(unit.resident_id) : null;
                    const paymentDate = payment.payment_date || payment.due_date;
                    
                    return (
                      <tr key={payment.id}>
                        <td>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`check-${payment.id}`}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`check-${payment.id}`}
                            >
                              &nbsp;
                            </label>
                          </div>
                        </td>
                        <td>
                          <Link href="" className="text-dark fw-medium">
                            #{payment.transaction_id || payment.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td>
                          <Image
                            src={avatar1}
                            className="avatar-sm rounded-circle me-2"
                            alt="..."
                          />
                          {resident?.full_name || 'Unknown Resident'}
                        </td>
                        <td>{unit?.unit_number || 'N/A'}</td>
                        <td>
                          {paymentDate ? new Date(paymentDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td>${payment.amount}</td>
                        <td>{payment.payment_method || payment.payment_type || 'N/A'}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              payment.status === 'failed' ? 'danger' : 
                              payment.status === 'pending' ? 'warning' : 
                              payment.status === 'completed' ? 'success' : 'secondary'
                            }-subtle text-${
                              payment.status === 'failed' ? 'danger' : 
                              payment.status === 'pending' ? 'warning' : 
                              payment.status === 'completed' ? 'success' : 'secondary'
                            } py-1 px-2 fs-12`}
                          >
                            {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="light" size="sm">
                              <IconifyIcon
                                icon="solar:eye-broken"
                                className="align-middle fs-18"
                              />
                            </Button>
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
                    );
                  })}
                </tbody>
              </table>
              {sortedPayments.length === 0 && (
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
