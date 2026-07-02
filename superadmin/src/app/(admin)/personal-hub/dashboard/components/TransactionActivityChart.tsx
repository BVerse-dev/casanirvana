"use client";

import React from 'react';
import { Card, CardBody, CardHeader, CardTitle, Form } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import ReactApexChart from '@/components/wrappers/ReactApexChart';
import type { PersonalHubDashboardPeriod, PersonalHubTrendPoint } from '@/hooks/usePersonalHubDashboard';

interface TransactionActivityChartProps {
  data: PersonalHubTrendPoint[];
  period: PersonalHubDashboardPeriod;
  onPeriodChange: (period: PersonalHubDashboardPeriod) => void;
  currencySymbol: string;
}

const PERIOD_LABELS: Record<PersonalHubDashboardPeriod, string> = {
  '7': 'Last 7 Days',
  '30': 'Last 30 Days',
  '90': 'Last 90 Days',
  '365': 'Last 12 Months',
};

const TransactionActivityChart: React.FC<TransactionActivityChartProps> = ({
  data,
  period,
  onPeriodChange,
  currencySymbol,
}) => {
  const hasData = data.length > 0;

  const chartData = {
    dates: data.map((entry) =>
      new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(period === '365' ? { year: '2-digit' as const } : {}),
      })
    ),
    series: [
      {
        name: 'Total Transactions',
        data: data.map((entry) => entry.transactions),
      },
      {
        name: 'Successful Transactions',
        data: data.map((entry) => entry.successful),
      },
      {
        name: `Volume (${currencySymbol} x 1k)`,
        data: data.map((entry) => Number((entry.volume / 1000).toFixed(1))),
      },
    ],
  };

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#727cf5', '#39afd1', '#43d39e'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    xaxis: {
      categories: chartData.dates,
    },
    yaxis: {
      title: {
        text: 'Transactions / Volume',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter(value) {
          return Number(value).toFixed(1);
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#f1f3fa',
    },
    noData: {
      text: 'No Personal Hub activity for the selected period.',
    },
  };

  return (
    <Card className="mb-3">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <CardTitle className="mb-0">Transaction Activity</CardTitle>
        <Form.Select
          size="sm"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value as PersonalHubDashboardPeriod)}
          style={{ maxWidth: 180 }}
        >
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Form.Select>
      </CardHeader>
      <CardBody>
        {hasData ? (
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="area"
            height={350}
            className="apex-charts"
          />
        ) : (
          <div className="py-5 text-center text-muted">
            No Personal Hub transactions were recorded for this reporting window.
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TransactionActivityChart;
