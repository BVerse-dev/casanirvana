'use client';

import React from 'react';

import ReactApexChart from '@/components/wrappers/ReactApexChart';
import { PersonalHubUserEngagementPoint } from '@/hooks/usePersonalHubReports';

interface UserEngagementChartProps {
  items: PersonalHubUserEngagementPoint[];
}

const UserEngagementChart = ({ items }: UserEngagementChartProps) => {
  if (items.length === 0) {
    return <div className="py-5 text-center text-muted">No engagement trend data is available for the selected filters.</div>;
  }

  const series = [
    {
      name: 'Transactions',
      data: items.map((item) => item.transactions),
    },
    {
      name: 'Active Users',
      data: items.map((item) => item.active_users),
    },
  ];

  const options = {
    chart: {
      type: 'line' as const,
      toolbar: { show: false },
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
    },
    dataLabels: { enabled: false },
    colors: ['#22c55e', '#3b82f6'],
    xaxis: {
      categories: items.map((item) => item.date),
    },
    yaxis: {
      labels: {
        formatter: (value: number) => value.toLocaleString('en-GH'),
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => value.toLocaleString('en-GH'),
      },
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
    },
  };

  return <ReactApexChart options={options} series={series} type="line" height={320} />;
};

export default UserEngagementChart;
