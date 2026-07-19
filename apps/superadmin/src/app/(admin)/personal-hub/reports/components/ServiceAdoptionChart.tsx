'use client';

import React from 'react';

import ReactApexChart from '@/components/wrappers/ReactApexChart';
import { PersonalHubServiceAdoptionPoint } from '@/hooks/usePersonalHubReports';

interface ServiceAdoptionChartProps {
  items: PersonalHubServiceAdoptionPoint[];
}

const ServiceAdoptionChart = ({ items }: ServiceAdoptionChartProps) => {
  if (items.length === 0) {
    return <div className="py-5 text-center text-muted">No service adoption data is available for the selected filters.</div>;
  }

  const series = [{
    name: 'Active Users',
    data: items.map((item) => item.active_users),
  }];

  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '45%',
      },
    },
    dataLabels: { enabled: false },
    colors: ['#6366f1'],
    xaxis: {
      categories: items.map((item) => item.label),
    },
    tooltip: {
      y: {
        formatter: (value: number, context: { dataPointIndex: number }) => {
          const point = items[context.dataPointIndex];
          return `${value.toLocaleString('en-GH')} active users · ${point.adoption_rate.toFixed(1)}% adoption`;
        },
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={320} />;
};

export default ServiceAdoptionChart;
