"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const ProductPerformanceChart = () => {
  // Sample data for top-selling products
  const series = [42, 26, 15, 10, 7];
  const labels = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Others'];
  const colors = ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00', '#39afd1'];
  
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

  // Top products by sales
  const topProducts = [
    { name: 'iPhone 13 Pro Max', category: 'Electronics', sales: '$12,450', percentage: '+15%' },
    { name: 'Samsung Galaxy S22', category: 'Electronics', sales: '$8,750', percentage: '+8%' },
    { name: 'Nike Air Max', category: 'Fashion', sales: '$6,320', percentage: '+12%' },
    { name: 'Instant Pot Duo', category: 'Home & Kitchen', sales: '$4,580', percentage: '+5%' },
    { name: 'Neutrogena Face Wash', category: 'Beauty', sales: '$3,250', percentage: '+10%' },
  ];

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">Category Performance</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-3">
          <p className="text-muted mb-1">Sales distribution by category</p>
        </div>
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
          className="apex-charts"
        />
        
        <div className="mt-3">
          <h5 className="font-14 mb-2">Top Selling Products</h5>
          <div className="table-responsive">
            <table className="table table-sm table-centered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Sales</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
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
                    <td>{item.sales}</td>
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

export default ProductPerformanceChart;

