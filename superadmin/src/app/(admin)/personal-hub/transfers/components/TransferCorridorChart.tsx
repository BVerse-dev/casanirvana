"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const TransferCorridorChart = () => {
  // Sample data for transfer corridors (countries/regions with highest transfer volume)
  const series = [32, 25, 18, 12, 8, 5];
  const labels = ['Ghana Local', 'Ghana-Nigeria', 'Ghana-USA', 'Ghana-UK', 'Ghana-South Africa', 'Others'];
  const colors = ['#727cf5', '#fa5c7c', '#0acf97', '#ffbc00', '#39afd1', '#6c757d'];
  
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

  // Top corridors by growth
  const topCorridorsByGrowth = [
    { corridor: 'Ghana-USA', growth: '+28%' },
    { corridor: 'Ghana-UK', growth: '+15%' },
    { corridor: 'Ghana-Nigeria', growth: '+12%' },
    { corridor: 'Ghana Local', growth: '+9%' },
    { corridor: 'Ghana-South Africa', growth: '+6%' },
  ];

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">Transfer Corridors</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Distribution of money transfer routes</p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
          className="apex-charts"
        />
        
        <div className="mt-3">
          <h5 className="font-14 mb-2">Top Corridors by Growth</h5>
          <div className="table-responsive">
            <table className="table table-sm table-centered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Corridor</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topCorridorsByGrowth.map((item, idx) => (
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
                        {item.corridor}
                      </div>
                    </td>
                    <td className="text-success font-weight-semibold">{item.growth}</td>
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

export default TransferCorridorChart;
