"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
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
import { currency } from "@/context/constants";
import { useListPayments } from "@/hooks/usePayments";
import { useState, useMemo } from "react";

const ResidentRevenue = () => {
  const { data: payments, isLoading } = useListPayments();
  const [timeFilter, setTimeFilter] = useState<'today' | 'month' | 'year'>('month');

  // Calculate revenue from different sources based on time filter
  const revenueMetrics = useMemo(() => {
    if (!payments || payments.length === 0) {
      return {
        totalRevenue: 0,
        maintenanceRevenue: 0,
        rentRevenue: 0,
        utilityRevenue: 0,
        otherRevenue: 0,
        periodLabel: 'This Month',
        growth: 8.2
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let filteredPayments: any[] = [];
    let periodLabel = '';
    let growth = 8.2;

    if (timeFilter === 'today') {
      const today = now.toDateString();
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || new Date());
        return paymentDate.toDateString() === today && payment.status === 'completed';
      });
      periodLabel = 'Today';
      growth = 5.4;
    } else if (timeFilter === 'month') {
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || new Date());
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               payment.status === 'completed';
      });
      periodLabel = 'This Month';
      growth = 8.2;
    } else if (timeFilter === 'year') {
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || new Date());
        return paymentDate.getFullYear() === currentYear && payment.status === 'completed';
      });
      periodLabel = 'This Year';
      growth = 15.7;
    }

    const totalRevenue = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Categorize payments by type
    const maintenanceRevenue = filteredPayments
      .filter(p => p.payment_type?.toLowerCase().includes('maintenance'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
      
    const rentRevenue = filteredPayments
      .filter(p => p.payment_type?.toLowerCase().includes('rent'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
      
    const utilityRevenue = filteredPayments
      .filter(p => p.payment_type?.toLowerCase().includes('utility'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
      
    const otherRevenue = totalRevenue - maintenanceRevenue - rentRevenue - utilityRevenue;

    return {
      totalRevenue,
      maintenanceRevenue,
      rentRevenue,
      utilityRevenue,
      otherRevenue,
      periodLabel,
      growth
    };
  }, [payments, timeFilter]);

  const revenueData = [
    {
      title: "Maintenance",
      amount: `${currency}${(revenueMetrics.maintenanceRevenue / 1000).toFixed(1)}K`,
      progress: revenueMetrics.totalRevenue > 0 ? Math.round((revenueMetrics.maintenanceRevenue / revenueMetrics.totalRevenue) * 100) : 0,
      variant: "primary",
    },
    {
      title: "Rent",
      amount: `${currency}${(revenueMetrics.rentRevenue / 1000).toFixed(1)}K`,
      progress: revenueMetrics.totalRevenue > 0 ? Math.round((revenueMetrics.rentRevenue / revenueMetrics.totalRevenue) * 100) : 0,
      variant: "success",
    },
    {
      title: "Utilities",
      amount: `${currency}${(revenueMetrics.utilityRevenue / 1000).toFixed(1)}K`,
      progress: revenueMetrics.totalRevenue > 0 ? Math.round((revenueMetrics.utilityRevenue / revenueMetrics.totalRevenue) * 100) : 0,
      variant: "warning",
    },
    {
      title: "Other",
      amount: `${currency}${(revenueMetrics.otherRevenue / 1000).toFixed(1)}K`,
      progress: revenueMetrics.totalRevenue > 0 ? Math.round((revenueMetrics.otherRevenue / revenueMetrics.totalRevenue) * 100) : 0,
      variant: "info",
    },
  ];

  if (isLoading) {
    return (
      <Col lg={6}>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Resident Revenue</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-12" style={{ height: '150px' }}></div>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg={6}>
              <Card>
          <CardHeader className="d-flex  justify-content-between align-items-center border-0">
            <CardTitle as={"h4"}>Resident Revenue</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeFilter === 'today' ? 'Today' : timeFilter === 'year' ? 'This Year' : 'This Month'}{" "}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter('today')}>Today</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('month')}>Month</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('year')}>Year</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
                  <CardBody>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="d-flex align-items-center gap-2 text-dark fw-semibold">
                  {currency}{(revenueMetrics.totalRevenue / 1000).toFixed(1)}K{" "}
                  <span className="badge text-success bg-success-subtle px-2 py-1 fs-12 icons-center">
                    <IconifyIcon width={12} height={12} icon="ri-arrow-up-line" />
                    {revenueMetrics.growth}%
                  </span>
                </h3>
                <p className="mb-0 text-muted">
                  Collected <span className="text-success">{currency}{(revenueMetrics.totalRevenue * (revenueMetrics.growth / 100) / 1000).toFixed(1)}K</span>{" "}
                  {revenueMetrics.periodLabel} !
                </p>
              </div>
              <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
                <IconifyIcon
                  icon="solar:wallet-money-broken"
                  width={32}
                  height={32}
                  className="text-primary"
                />
              </div>
            </div>
          <div className="p-3 rounded bg-light-subtle border border-light mt-4">
            <h5>Revenue Sources</h5>
            <Row className="my-3 g-lg-0 g-2">
              {revenueData.map((item, idx) => (
                <Col lg={3} xs={4} key={idx}>
                  <p className="mb-1 text-muted">
                    <IconifyIcon
                      icon="ri:circle-fill"
                      className={`fs-6 text-${item.variant}`}
                    />{" "}
                    {item.title}
                  </p>
                  <p className="fs-16 text-dark fw-medium mb-1">
                    {item.amount}
                  </p>
                </Col>
              ))}
            </Row>
            <ProgressBar>
              {revenueData.map((item, idx) => (
                <>
                  <ProgressBar
                    style={{ height: "10px" }}
                    variant={item.variant}
                    className="rounded-pill rounded-0 gap-2 overflow-visible "
                    now={item.progress}
                    key={idx}
                  />
                  &nbsp;
                </>
              ))}
            </ProgressBar>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ResidentRevenue;
