"use client";

import React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import ReactApexChart from '@/components/wrappers/ReactApexChart';
import type { PersonalHubServiceMetric } from '@/hooks/usePersonalHubDashboard';

interface ServicePopularityChartProps {
  serviceMetrics: PersonalHubServiceMetric[];
}

const ServicePopularityChart: React.FC<ServicePopularityChartProps> = ({ serviceMetrics }) => {
  const activeServices = serviceMetrics.filter((service) => service.totalTransactions > 0);

  if (activeServices.length === 0) {
    return (
      <Card className="mb-3">
        <CardHeader>
          <CardTitle className="mb-0">Service Popularity</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="py-5 text-center text-muted">
            No Personal Hub transactions are available for the selected period.
          </div>
        </CardBody>
      </Card>
    );
  }

  const options: ApexOptions = {
    chart: {
      height: 320,
      type: 'donut',
    },
    colors: ['#727cf5', '#39afd1', '#fa5c7c', '#ffbc00', '#43d39e', '#6c757d'],
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '13px',
      offsetX: 0,
      offsetY: 7,
    },
    labels: activeServices.map((service) => service.label),
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              fontSize: '16px',
              color: '#333',
              label: 'Total',
              formatter(w) {
                return w.globals.seriesTotals.reduce((left, right) => left + right, 0).toString();
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 240,
          },
          legend: {
            show: false,
          },
        },
      },
    ],
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle className="mb-0">Service Popularity</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Distribution of Personal Hub transactions by service</p>
        </div>
        <ReactApexChart
          options={options}
          series={activeServices.map((service) => service.totalTransactions)}
          type="donut"
          height={320}
          className="apex-charts"
        />
      </CardBody>
    </Card>
  );
};

export default ServicePopularityChart;
