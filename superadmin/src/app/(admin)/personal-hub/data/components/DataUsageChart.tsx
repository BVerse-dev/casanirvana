"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Dropdown, Table, Badge } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const DataUsageChart = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Sample data - would be fetched from API in production
  const chartData = {
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        {
          name: 'Daily Bundles',
          data: [156, 145, 162, 178, 187, 215, 203],
        },
        {
          name: 'Weekly Bundles',
          data: [94, 105, 99, 114, 125, 135, 110],
        },
        {
          name: 'Monthly Bundles',
          data: [55, 61, 58, 66, 72, 79, 67],
        },
        {
          name: 'Special Offers',
          data: [25, 31, 33, 37, 42, 48, 51],
        },
      ],
    },
    month: {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      series: [
        {
          name: 'Daily Bundles',
          data: [1112, 1245, 1376, 1298],
        },
        {
          name: 'Weekly Bundles',
          data: [682, 745, 792, 681],
        },
        {
          name: 'Monthly Bundles',
          data: [412, 437, 456, 398],
        },
        {
          name: 'Special Offers',
          data: [223, 267, 294, 265],
        },
      ],
    },
    year: {
      dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        {
          name: 'Daily Bundles',
          data: [3244, 3185, 3397, 3556, 3733, 3812, 3945, 4090, 4241, 4114, 4356, 4567],
        },
        {
          name: 'Weekly Bundles',
          data: [2108, 1978, 2123, 2256, 2431, 2545, 2656, 2778, 2890, 2967, 3098, 3234],
        },
        {
          name: 'Monthly Bundles',
          data: [1520, 1487, 1556, 1589, 1656, 1723, 1798, 1823, 1889, 1945, 2001, 2098],
        },
        {
          name: 'Special Offers',
          data: [675, 703, 745, 789, 812, 856, 901, 923, 956, 978, 1023, 1078],
        },
      ],
    },
  };
  
  // Chart options
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#0acf97', '#727cf5', '#fa5c7c', '#ffbc00'],
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartData[timeRange].dates,
    },
    yaxis: {
      title: {
        text: 'Number of Transactions',
      },
    },
    fill: {
      opacity: 1,
    },
    grid: {
      borderColor: '#f1f3fa',
      padding: {
        bottom: 10,
      },
    },
    legend: {
      offsetY: 7,
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toLocaleString() + ' transactions';
        },
      },
    },
  };
  
  // Top performing packages
  const topPackages = [
    {
      name: 'Daily 1GB',
      provider: 'MTN',
      sales: '3,245',
      growth: '+12%',
    },
    {
      name: 'Unlimited Weekend',
      provider: 'Orange',
      sales: '3,560',
      growth: '+18%',
    },
    {
      name: 'Daily 1.5GB',
      provider: 'Telecel',
      sales: '2,780',
      growth: '+8%',
    },
    {
      name: 'Daily 1GB',
      provider: 'AirtelTigo',
      sales: '2,450',
      growth: '+5%',
    },
  ];

  const handleRangeChange = (range: 'week' | 'month' | 'year') => {
    setTimeRange(range);
  };

  return (
    <Card className="mb-3">
      <CardHeader className="d-flex align-items-center">
        <div>
          <CardTitle className="mb-0">Data Bundles Usage</CardTitle>
          <small className="text-muted">Transaction volume by package type</small>
        </div>
        <Dropdown align="end" className="ms-auto">
          <Dropdown.Toggle variant="light" className="cursor-pointer">
            {timeRange === 'week' && 'This Week'}
            {timeRange === 'month' && 'This Month'}
            {timeRange === 'year' && 'This Year'}
            <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleRangeChange('week')}>
              This Week
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleRangeChange('month')}>
              This Month
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleRangeChange('year')}>
              This Year
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <div className="row">
          <div className="col-lg-8">
            <ReactApexChart
              options={options}
              series={chartData[timeRange].series}
              type="bar"
              height={350}
              className="apex-charts"
            />
          </div>
          <div className="col-lg-4">
            <h5 className="mb-3">Top Performing Packages</h5>
            <Table className="table-sm table-striped mb-0">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Sales</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topPackages.map((pkg, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <h6 className="font-14 mb-0">{pkg.name}</h6>
                        <small className="text-muted">{pkg.provider}</small>
                      </div>
                    </td>
                    <td>{pkg.sales}</td>
                    <td>
                      <Badge bg="success" className="badge-soft-success">
                        {pkg.growth}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DataUsageChart;
