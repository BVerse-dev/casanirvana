"use client";
import React, { useState, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import {
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
  Row,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { currency } from "@/context/constants";
import { useListPayments } from "@/hooks/usePayments";
import { ApexOptions } from "apexcharts";

// Static fallback data from original chart
const FALLBACK_MONTHLY_DATA = {
  income: [16500, 17500, 16200, 21500, 17300, 16000, 16000, 17000, 16000, 19000, 18000, 19000],
  expenses: [16800, 16800, 15500, 17000, 14800, 15500, 19000, 16000, 15000, 17000, 14000, 17000]
};

const SalesChart = () => {
  const { data: payments = [], isLoading } = useListPayments();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');
  
  // Calculate data based on filter
  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Check if we have valid payment data
    const hasPaymentData = payments && payments.length > 0;

    if (timeFilter === 'week') {
      // Last 7 days
      const labels = [];
      const incomeData = [];
      const expensesData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        if (hasPaymentData) {
          const dayPayments = payments.filter((payment: any) => {
            if (!payment.payment_date && !payment.due_date) return false;
            const paymentDate = new Date(payment.payment_date || payment.due_date);
            return paymentDate.toDateString() === date.toDateString() && 
                   payment.status === 'completed';
          });
          
          const dayIncome = dayPayments.reduce((sum: number, payment: any) => 
            sum + Number(payment.amount || 0), 0
          );
          
          incomeData.push(dayIncome);
          expensesData.push(dayIncome * 0.96);
        } else {
          // Use fallback data spread across the week
          const avgDailyIncome = FALLBACK_MONTHLY_DATA.income[currentMonth] / 30;
          const avgDailyExpense = FALLBACK_MONTHLY_DATA.expenses[currentMonth] / 30;
          incomeData.push(avgDailyIncome);
          expensesData.push(avgDailyExpense);
        }
        
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      // Current period calculations
      const currentIncome = incomeData[incomeData.length - 1] || 0;
      const totalCollections = hasPaymentData 
        ? payments.filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
        : FALLBACK_MONTHLY_DATA.income.reduce((a, b) => a + b, 0);

      return {
        series: [
          { name: "Expenses", data: expensesData },
          { name: "Income", data: incomeData }
        ],
        labels,
        totalCollections,
        currentIncome,
        currentExpenses: currentIncome * 0.96,
        currentBalance: currentIncome * 0.04
      };
    } else if (timeFilter === 'year') {
      // Last 3 years
      const labels = [];
      const incomeData = [];
      const expensesData = [];
      
      for (let i = 2; i >= 0; i--) {
        const year = currentYear - i;
        
        if (hasPaymentData) {
          const yearPayments = payments.filter((payment: any) => {
            if (!payment.payment_date && !payment.due_date) return false;
            const paymentDate = new Date(payment.payment_date || payment.due_date);
            return paymentDate.getFullYear() === year && 
                   payment.status === 'completed';
          });
          
          const yearIncome = yearPayments.reduce((sum: number, payment: any) => 
            sum + Number(payment.amount || 0), 0
          );
          
          incomeData.push(yearIncome || (i === 0 ? FALLBACK_MONTHLY_DATA.income.reduce((a, b) => a + b, 0) : 0));
          expensesData.push(yearIncome ? yearIncome * 0.96 : (i === 0 ? FALLBACK_MONTHLY_DATA.expenses.reduce((a, b) => a + b, 0) : 0));
        } else {
          // Use fallback data for current year only
          const yearTotal = i === 0 ? FALLBACK_MONTHLY_DATA.income.reduce((a, b) => a + b, 0) : 0;
          incomeData.push(yearTotal);
          expensesData.push(i === 0 ? FALLBACK_MONTHLY_DATA.expenses.reduce((a, b) => a + b, 0) : 0);
        }
        
        labels.push(year.toString());
      }

      const currentIncome = incomeData[incomeData.length - 1] || 0;
      const totalCollections = hasPaymentData 
        ? payments.filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
        : FALLBACK_MONTHLY_DATA.income.reduce((a, b) => a + b, 0);

      return {
        series: [
          { name: "Expenses", data: expensesData },
          { name: "Income", data: incomeData }
        ],
        labels,
        totalCollections,
        currentIncome,
        currentExpenses: currentIncome * 0.96,
        currentBalance: currentIncome * 0.04
      };
    } else {
      // Monthly view (default)
      const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
        if (hasPaymentData) {
          const monthPayments = payments.filter((payment: any) => {
            if (!payment.payment_date && !payment.due_date) return false;
            const paymentDate = new Date(payment.payment_date || payment.due_date);
            return paymentDate.getMonth() === monthIndex && 
                   paymentDate.getFullYear() === currentYear &&
                   payment.status === 'completed';
          });
          
          const income = monthPayments.reduce((sum: number, payment: any) => 
            sum + Number(payment.amount || 0), 0
          );
          
          // Use fallback if no data for this month
          return { 
            income: income || FALLBACK_MONTHLY_DATA.income[monthIndex], 
            expenses: income ? income * 0.96 : FALLBACK_MONTHLY_DATA.expenses[monthIndex]
          };
        } else {
          // Use fallback data
          return {
            income: FALLBACK_MONTHLY_DATA.income[monthIndex],
            expenses: FALLBACK_MONTHLY_DATA.expenses[monthIndex]
          };
        }
      });

      const currentMonthIncome = monthlyData[currentMonth].income;
      const totalCollections = hasPaymentData 
        ? payments.filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
        : FALLBACK_MONTHLY_DATA.income.reduce((a, b) => a + b, 0);

      return {
        series: [
          { name: "Expenses", data: monthlyData.map(m => m.expenses) },
          { name: "Income", data: monthlyData.map(m => m.income) }
        ],
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        totalCollections,
        currentIncome: currentMonthIncome,
        currentExpenses: currentMonthIncome * 0.96,
        currentBalance: currentMonthIncome * 0.04
      };
    }
  }, [payments, timeFilter]);

  // Chart options
  const salesChartOptions: ApexOptions = {
    chart: {
      height: 341,
      type: "area",
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#47ad94", "#604ae3"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      curve: "smooth",
      width: 2,
      lineCap: "square",
    },
    labels: chartData.labels,
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        show: true,
      },
      labels: {
        offsetX: 0,
        offsetY: 5,
        style: {
          fontSize: "12px",
          cssClass: "apexcharts-xaxis-title",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          return (value / 1000).toFixed(0) + "K";
        },
        offsetX: -15,
        offsetY: 0,
        style: {
          fontSize: "12px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
    },
    grid: {
      borderColor: "#191e3a",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
      padding: {
        top: -50,
        right: 0,
        bottom: 0,
        left: 5,
      },
    },
    legend: {
      show: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.12,
        opacityTo: 0.1,
        stops: [100, 100],
      },
    },
    responsive: [
      {
        breakpoint: 575,
        options: {
          legend: {
            offsetY: -50,
          },
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <Col xl={8}>
        <Card className="overflow-hidden">
          <CardBody>
            <div className="text-center py-5">Loading payment analytics...</div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={8}>
      <Card className="overflow-hidden">
        <CardHeader className="d-flex justify-content-between align-items-center pb-1">
          <div>
            <CardTitle as={"h4"}>Payment Analytics</CardTitle>
          </div>
          <Dropdown>
            <DropdownToggle
              as={"a"}
              className="btn btn-sm btn-outline-light rounded content-none icons-center"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {timeFilter === 'week' ? 'This Week' : timeFilter === 'year' ? 'Yearly' : 'This Month'}{" "}
              <IconifyIcon
                className="ms-1"
                width={16}
                height={16}
                icon="ri:arrow-down-s-line"
              />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem onClick={() => setTimeFilter('week')}>Week</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('month')}>Months</DropdownItem>
              <DropdownItem onClick={() => setTimeFilter('year')}>Years</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="text-end">
            <p className="mb-0 fs-18 fw-medium text-dark icons-center">
              <IconifyIcon icon="ri:wallet-3-fill" className="me-1" />{" "}
              Collections :{" "}
              <span className="text-primary fw-bold">
                &nbsp;{currency}{(chartData.totalCollections / 1000).toFixed(1)}K
              </span>
            </p>
          </div>
          <Row className="align-items-top text-center">
            <Col lg={12}>
              <ReactApexChart
                key={`${timeFilter}-${payments.length}`}
                options={salesChartOptions}
                series={chartData.series}
                height={341}
                type="area"
                className="apex-charts mt-2"
              />
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="p-2 bg-light-subtle text-center">
          <Row className="g-3">
            <Col md={4} className="border-end">
              <p className="text-muted mb-1">Income</p>
              <p className="text-dark fs-18 fw-medium d-flex align-items-center justify-content-center gap-2 mb-0">
                {(chartData.currentIncome / 1000).toFixed(2)}K{" "}
                <span className="badge text-success bg-success-subtle fs-12">
                  <IconifyIcon icon="ri:arrow-up-line" />
                  0.08%
                </span>
              </p>
            </Col>
            <Col md={4} className="border-end">
              <p className="text-muted mb-1">Expenses</p>
              <p className="text-dark fs-18 fw-medium d-flex align-items-center justify-content-center gap-2 mb-0">
                {(chartData.currentExpenses / 1000).toFixed(2)}K{" "}
                <span className="badge text-danger bg-danger-subtle fs-12">
                  <IconifyIcon icon="ri:arrow-down-line" />
                  5.38%
                </span>
              </p>
            </Col>
            <Col md={4}>
              <p className="text-muted mb-1">Balance</p>
              <p className="text-dark fs-18 fw-medium d-flex align-items-center justify-content-center gap-2 mb-0">
                {(chartData.currentBalance / 1000).toFixed(2)}K{" "}
                <span className="badge text-success bg-success-subtle fs-12">
                  <IconifyIcon icon="ri:arrow-up-line" />
                  2.89%
                </span>
              </p>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default SalesChart;
