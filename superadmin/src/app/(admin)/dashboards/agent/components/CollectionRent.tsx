"use client";
import avatar3 from "@/assets/images/users/avatar-3.jpg";
import avatar4 from "@/assets/images/users/avatar-4.jpg";
import avatar5 from "@/assets/images/users/avatar-5.jpg";
import avatar6 from "@/assets/images/users/avatar-6.jpg";
import avatar7 from "@/assets/images/users/avatar-7.jpg";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import Image from "next/image";
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
import { useListPayments } from "@/hooks/usePayments";
import { useState, useMemo } from "react";

const ResidentPayments = () => {
  const { data: payments, isLoading } = useListPayments();
  const [timeFilter, setTimeFilter] = useState<'current' | 'last' | 'year'>('current');

  // Calculate payment statistics based on time filter
  const paymentMetrics = useMemo(() => {
    if (!payments || payments.length === 0) {
      return {
        totalPeriod: 0,
        totalCollected: 0,
        totalPending: 0,
        collectionRate: 0,
        periodLabel: 'This Month'
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let filteredPayments: any[] = [];
    let periodLabel = '';

    if (timeFilter === 'current') {
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || new Date());
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      periodLabel = 'This Month';
    } else if (timeFilter === 'last') {
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || new Date());
        return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear;
      });
      periodLabel = 'Last Month';
    } else if (timeFilter === 'year') {
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || new Date());
        return paymentDate.getFullYear() === currentYear;
      });
      periodLabel = 'This Year';
    }

    const totalPeriod = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const collectedPayments = filteredPayments.filter(p => p.status === 'completed');
    const pendingPayments = filteredPayments.filter(p => p.status === 'pending');
    
    const totalCollected = collectedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPending = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const collectionRate = totalPeriod > 0 ? Math.round((totalCollected / totalPeriod) * 100) : 0;

    return {
      totalPeriod,
      totalCollected,
      totalPending,
      collectionRate,
      periodLabel
    };
  }, [payments, timeFilter]);

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
              <div className="placeholder" style={{ height: '15px' }}></div>
              <div className="placeholder col-12 mt-4" style={{ height: '100px' }}></div>
            </div>
          </CardBody>
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
                <IconifyIcon
                  className="ms-1"
                  width={16}
                  height={16}
                  icon="ri:arrow-down-s-line"
                />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem onClick={() => setTimeFilter('current')}>This Month</DropdownItem>
                <DropdownItem onClick={() => setTimeFilter('last')}>Last Month</DropdownItem>
                <DropdownItem onClick={() => setTimeFilter('year')}>This Year</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted fs-14 mb-2">Total {timeFilter === 'year' ? 'Yearly' : timeFilter === 'last' ? 'Last Month' : 'Monthly'}</p>
                <h3 className="text-dark fw-bold mb-1">{currency}{(paymentMetrics.totalPeriod / 1000).toFixed(1)}K</h3>
              </div>
              <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
                <IconifyIcon
                  icon="solar:card-broken"
                  width={32}
                  height={32}
                  className="fs-32 text-primary"
                />
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
            ></ProgressBar>

            <div className="d-flex align-items-center justify-content-between mt-3">
              <div>
                <p className="mb-2 text-success fs-15 fw-medium">Collected</p>
                <h4 className="text-dark fw-bold mb-0">{currency}{(paymentMetrics.totalCollected / 1000).toFixed(1)}K</h4>
              </div>
              <div className="text-end">
                <p className="mb-2 fs-15 fw-medium">Pending</p>
                <h4 className="text-dark fw-bold mb-0">{currency}{(paymentMetrics.totalPending / 1000).toFixed(1)}K</h4>
              </div>
            </div>
            <div className="d-flex align-items-center bg-light-subtle border justify-content-between p-3 rounded mt-4">
              <div>
                <h5 className="fw-medium mb-1 text-dark fs-16">
                  Residents with pending payments
                </h5>
                <div className="avatar-group mt-3">
                  <div className="avatar d-flex align-items-center justify-content-center">
                    <Image
                      src={avatar4}
                      alt="resident1"
                      className="rounded-circle avatar border border-light border-3"
                    />
                  </div>
                  <div className="avatar d-flex align-items-center justify-content-center">
                    <Image
                      src={avatar5}
                      alt="resident2"
                      className="rounded-circle avatar border border-light border-3"
                    />
                  </div>
                  <div className="avatar d-flex align-items-center justify-content-center">
                    <Image
                      src={avatar3}
                      alt="resident3"
                      className="rounded-circle avatar border border-light border-3"
                    />
                  </div>
                  <div className="avatar d-flex align-items-center justify-content-center">
                    <Image
                      src={avatar6}
                      alt="resident4"
                      className="rounded-circle avatar border border-light border-3"
                    />
                  </div>
                  <div className="avatar d-flex align-items-center justify-content-center">
                    <Image
                      src={avatar7}
                      alt="resident5"
                      className="rounded-circle avatar border border-light border-3"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Button variant="primary">Send Reminder</Button>
              </div>
            </div>
          </CardBody>
      </Card>
    </Col>
  );
};

export default ResidentPayments;
