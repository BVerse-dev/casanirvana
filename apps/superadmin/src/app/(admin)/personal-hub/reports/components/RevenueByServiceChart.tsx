'use client';

import React from 'react';

import ReactApexChart from '@/components/wrappers/ReactApexChart';
import { PersonalHubRevenueByServicePoint } from '@/hooks/usePersonalHubReports';

interface RevenueByServiceChartProps {
  items: PersonalHubRevenueByServicePoint[];
  currencySymbol: string;
}

const RevenueByServiceChart = ({ items, currencySymbol }: RevenueByServiceChartProps) => {
  if (items.length === 0) {
    return <div className="py-5 text-center text-muted">No service revenue data is available for the selected filters.</div>;
  }

  const series = [{
    name: 'Volume',
    data: items.map((item) => Number(item.total_volume.toFixed(2))),
  }];

  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    colors: ['#3b82f6'],
    xaxis: {
      categories: items.map((item) => item.label),
      labels: {
        formatter: (value: string) => `${currencySymbol}${Number(value).toLocaleString('en-GH')}`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${currencySymbol}${value.toLocaleString('en-GH', { maximumFractionDigits: 2 })}`,
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={320} />;
};

export default RevenueByServiceChart;
