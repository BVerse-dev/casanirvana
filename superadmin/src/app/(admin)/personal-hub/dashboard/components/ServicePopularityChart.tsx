"use client";

import React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface ServiceMetric {
  service: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  totalCommission: number;
  averageResponseTime: number;
  successRate: number;
  growthRate: number;
}

interface ServicePopularityChartProps {
  serviceMetrics: ServiceMetric[];
}

const ServicePopularityChart: React.FC<ServicePopularityChartProps> = ({ serviceMetrics }) => {
  // Process real data or use fallback
  const processServiceData = () => {
    if (!serviceMetrics || serviceMetrics.length === 0) {
      return {
        series: [44, 25, 15, 10, 6],
        labels: ['Airtime', 'Data', 'Money Transfer', 'Bill Payments', 'Marketplace']
      };
    }

    const serviceLabels = serviceMetrics.map(service => {
      switch(service.service) {
        case 'airtime': return 'Airtime';
        case 'data': return 'Data';
        case 'money_transfer': return 'Money Transfer';
        case 'bill_payment': return 'Bill Payments';
        case 'insurance': return 'Insurance';
        case 'marketplace': return 'Marketplace';
        default: return service.service;
      }
    });
    
    const serviceSeries = serviceMetrics.map(service => service.totalTransactions);
    
    return {
      series: serviceSeries,
      labels: serviceLabels
    };
  };

  const { series, labels } = processServiceData();
  
  // Chart options
  const options: ApexOptions = {
    chart: {
      height: 320,
      type: 'donut',
    },
    colors: ['#727cf5', '#39afd1', '#fa5c7c', '#ffbc00', '#43d39e'],
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '13px',
      offsetX: 0,
      offsetY: 7,
    },
    labels: labels,
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
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toString();
              },
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 600,
              formatter: function (val) {
                return val.toFixed(0);
              },
            },
          },
        },
      },
    },
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle className="mb-0">Service Popularity</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Distribution of services used</p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
          className="apex-charts"
        />
        <div className="text-center mt-2">
          <p className="text-muted mb-0 font-13">
            <span className="fw-semibold">Note:</span> Based on total transaction count
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default ServicePopularityChart;
