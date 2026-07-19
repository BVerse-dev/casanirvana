'use client';

import React from 'react';

import ReactApexChart from '@/components/wrappers/ReactApexChart';
import { PersonalHubServicePerformancePoint } from '@/hooks/usePersonalHubReports';

interface ErrorRateChartProps {
  items: PersonalHubServicePerformancePoint[];
}

const ErrorRateChart = ({ items }: ErrorRateChartProps) => {
  if (items.length === 0) {
    return <div className="py-5 text-center text-muted">No service failure data is available for the selected filters.</div>;
  }

  const series = [{
    name: 'Failure Rate',
    data: items.map((item) => Number(item.error_rate.toFixed(2))),
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
    colors: ['#ef4444'],
    xaxis: {
      categories: items.map((item) => item.label),
      max: 100,
      labels: {
        formatter: (value: string) => `${Number(value).toFixed(0)}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toFixed(2)}%`,
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={320} />;
};

export default ErrorRateChart;
