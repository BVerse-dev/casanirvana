"use client";

import React from 'react';
import { Card, CardBody, CardHeader, CardTitle, Table } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const AirtimeSuccessRateChart = () => {
  // Sample data - would be fetched from API in production
  const series = [98.5, 1.2, 0.3]; // Success, Failed, Pending
  const labels = ['Success', 'Failed', 'Pending'];
  const colors = ['#0acf97', '#fa5c7c', '#ffbc00'];
  
  // Chart options
  const options: ApexOptions = {
    chart: {
      height: 320,
      type: 'donut',
    },
    colors: colors,
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    labels: labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 240,
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
              label: 'Success Rate',
              formatter: function (w) {
                return w.globals.seriesTotals[0] + '%';
              },
            },
          },
        },
      },
    },
  };

  // Provider-specific success rates
  const providerStats = [
    {
      name: 'MTN',
      success: '99.2%',
      failed: '0.6%',
      pending: '0.2%',
      color: '#727cf5',
    },
    {
      name: 'Telecel',
      success: '98.1%',
      failed: '1.5%',
      pending: '0.4%',
      color: '#fa5c7c',
    },
    {
      name: 'AirtelTigo',
      success: '97.5%',
      failed: '1.9%',
      pending: '0.6%',
      color: '#0acf97',
    },
    {
      name: 'Orange',
      success: '98.7%',
      failed: '0.8%',
      pending: '0.5%',
      color: '#ffbc00',
    },
  ];

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle className="mb-0">Transaction Success Rate</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="chart-container mb-4">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={240}
            className="apex-charts"
          />
        </div>
        
        <Table className="mb-0">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Success</th>
              <th>Failed</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {providerStats.map((provider) => (
              <tr key={provider.name}>
                <td>
                  <div className="d-flex align-items-center">
                    <div 
                      className="me-2" 
                      style={{
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: provider.color,
                      }}
                    ></div>
                    {provider.name}
                  </div>
                </td>
                <td className="text-success">{provider.success}</td>
                <td className="text-danger">{provider.failed}</td>
                <td className="text-warning">{provider.pending}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default AirtimeSuccessRateChart;
