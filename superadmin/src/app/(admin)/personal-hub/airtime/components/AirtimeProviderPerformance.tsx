"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Dropdown } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const AirtimeProviderPerformance = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Sample data - would be fetched from API in production
  const chartData = {
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        {
          name: 'MTN',
          data: [76, 85, 101, 98, 87, 105, 91],
        },
        {
          name: 'Telecel',
          data: [54, 65, 60, 74, 85, 90, 70],
        },
        {
          name: 'AirtelTigo',
          data: [35, 41, 36, 26, 45, 48, 52],
        },
        {
          name: 'Orange',
          data: [25, 31, 32, 33, 41, 44, 29],
        },
      ],
    },
    month: {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      series: [
        {
          name: 'MTN',
          data: [644, 675, 735, 703],
        },
        {
          name: 'Telecel',
          data: [508, 478, 523, 482],
        },
        {
          name: 'AirtelTigo',
          data: [320, 337, 286, 294],
        },
        {
          name: 'Orange',
          data: [175, 203, 222, 192],
        },
      ],
    },
    year: {
      dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        {
          name: 'MTN',
          data: [2844, 2685, 2897, 2756, 2933, 3012, 3245, 3190, 3041, 3214, 3356, 3567],
        },
        {
          name: 'Telecel',
          data: [2108, 1978, 2123, 2056, 2231, 2345, 2456, 2378, 2290, 2367, 2498, 2534],
        },
        {
          name: 'AirtelTigo',
          data: [1320, 1287, 1356, 1389, 1456, 1523, 1598, 1623, 1589, 1645, 1701, 1798],
        },
        {
          name: 'Orange',
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
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#727cf5', '#fa5c7c', '#0acf97', '#ffbc00'],
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
        text: 'Transactions',
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

  const handleRangeChange = (range: 'week' | 'month' | 'year') => {
    setTimeRange(range);
  };

  return (
    <Card className="mb-3">
      <CardHeader className="d-flex align-items-center">
        <div>
          <CardTitle className="mb-0">Provider Performance</CardTitle>
          <small className="text-muted">Transaction volume by provider</small>
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
        <ReactApexChart
          options={options}
          series={chartData[timeRange].series}
          type="bar"
          height={350}
          className="apex-charts"
        />
      </CardBody>
    </Card>
  );
};

export default AirtimeProviderPerformance;
