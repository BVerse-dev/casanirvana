"use client";

import React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const DataPackagePopularityChart = () => {
  // Sample data - would be fetched from API in production
  const series = [45, 28, 20, 7]; // Daily, Weekly, Monthly, Special Offers
  const labels = ['Daily Bundles', 'Weekly Bundles', 'Monthly Bundles', 'Special Offers'];
  const colors = ['#0acf97', '#727cf5', '#fa5c7c', '#ffbc00'];
  
  // Chart options
  const options: ApexOptions = {
    chart: {
      height: 320,
      type: 'donut',
    },
    colors: colors,
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
        breakpoint: 480,
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
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: function (val) {
                return val + '%';
              },
            },
            total: {
              show: true,
              label: 'Total Sales',
              formatter: function (w) {
                return '100%';
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
        <CardTitle className="mb-0">Package Popularity</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Distribution by package type</p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
          className="apex-charts"
        />
        <div className="text-center mt-2">
          <div className="row">
            <div className="col-6">
              <h4 className="fw-semibold mb-0">1,847</h4>
              <p className="text-muted mb-0">Total Transactions</p>
            </div>
            <div className="col-6">
              <h4 className="fw-semibold mb-0">$12,590</h4>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DataPackagePopularityChart;
