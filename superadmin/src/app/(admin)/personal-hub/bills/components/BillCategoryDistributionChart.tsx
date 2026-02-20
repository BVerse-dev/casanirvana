"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const BillCategoryDistributionChart = () => {
  // Sample data for bill payment categories
  const series = [42, 26, 15, 8, 5, 4];
  const labels = ['Utilities', 'Telecom', 'TV & Internet', 'Education', 'Government', 'Others'];
  const colors = ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00', '#39afd1', '#6c757d'];
  
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

  // Top billers by volume
  const topBillersByVolume = [
    { name: 'Electricity Company of Ghana', volume: '$42,350', percentage: '+12%' },
    { name: 'Ghana Water Company', volume: '$18,750', percentage: '+5%' },
    { name: 'MTN Ghana', volume: '$15,680', percentage: '+8%' },
    { name: 'DSTV', volume: '$12,750', percentage: '+3%' },
    { name: 'University of Ghana', volume: '$8,540', percentage: '+15%' },
  ];

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">Payment Distribution</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Distribution of bill payments by category</p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
          className="apex-charts"
        />
        
        <div className="mt-3">
          <h5 className="font-14 mb-2">Top Billers by Volume</h5>
          <div className="table-responsive">
            <table className="table table-sm table-centered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Biller</th>
                  <th>Volume</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topBillersByVolume.map((item, idx) => (
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
                        {item.name}
                      </div>
                    </td>
                    <td>{item.volume}</td>
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

export default BillCategoryDistributionChart;
