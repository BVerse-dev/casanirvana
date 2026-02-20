"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const InsuranceDistributionChart = () => {
  // Sample data for insurance policy distribution
  const series = [38, 25, 15, 12, 7, 3];
  const labels = ['Health', 'Auto', 'Life', 'Property', 'Travel', 'Business'];
  const colors = ['#39afd1', '#727cf5', '#0acf97', '#ffbc00', '#fa5c7c', '#6c757d'];
  
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
              label: 'Total',
              formatter: function () {
                return '100%';
              },
            },
          },
        },
      },
    },
  };

  // Top insurance types by premium value
  const topPremiumCategories = [
    { category: 'Health Insurance', premium: '$125,450', percentage: '+12%' },
    { category: 'Auto Insurance', premium: '$98,450', percentage: '+8%' },
    { category: 'Life Insurance', premium: '$78,320', percentage: '+5%' },
    { category: 'Property Insurance', premium: '$65,780', percentage: '+10%' },
    { category: 'Travel Insurance', premium: '$35,650', percentage: '+15%' },
  ];

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">Policy Distribution</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Distribution of insurance policies by type</p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
          className="apex-charts"
        />
        
        <div className="mt-3">
          <h5 className="font-14 mb-2">Premium Value by Category</h5>
          <div className="table-responsive">
            <table className="table table-sm table-centered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Premium</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topPremiumCategories.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="me-2" 
                          style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            backgroundColor: colors[idx % colors.length] 
                          }}
                        ></div>
                        {item.category}
                      </div>
                    </td>
                    <td>{item.premium}</td>
                    <td className="text-success font-weight-semibold">{item.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InsuranceDistributionChart;
