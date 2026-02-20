"use client";

import React from 'react';
import { Card, CardBody, CardHeader, CardTitle, Dropdown } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface TransactionActivityChartProps {
  data: Array<{
    date: string;
    transactions: number;
    volume: number;
    successful: number;
  }>;
}

const TransactionActivityChart: React.FC<TransactionActivityChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = React.useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // Process real data for chart
  const processDataForChart = () => {
    if (!data || data.length === 0) {
      return {
        dates: [],
        series: [
          { name: 'Total Transactions', data: [] },
          { name: 'Successful Transactions', data: [] },
          { name: 'Transaction Volume (₦)', data: [] }
        ]
      };
    }

    const dates = data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    return {
      dates,
      series: [
        {
          name: 'Total Transactions',
          data: data.map(d => d.transactions)
        },
        {
          name: 'Successful Transactions', 
          data: data.map(d => d.successful)
        },
        {
          name: 'Volume (₦1000s)',
          data: data.map(d => Math.round(d.volume / 1000))
        }
      ]
    };
  };

  const chartData = processDataForChart();
  
  // Fallback sample data for demo purposes
  const sampleChartData = {
    day: {
      dates: ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
      series: [
        {
          name: 'Airtime',
          data: [31, 40, 28, 51, 42, 82, 56],
        },
        {
          name: 'Data',
          data: [11, 32, 45, 32, 34, 52, 41],
        },
        {
          name: 'Money Transfer',
          data: [15, 11, 32, 18, 9, 24, 11],
        },
        {
          name: 'Bills',
          data: [9, 24, 16, 20, 15, 18, 22],
        },
        {
          name: 'Marketplace',
          data: [5, 9, 16, 22, 17, 21, 14],
        },
      ],
    },
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        {
          name: 'Airtime',
          data: [76, 85, 101, 98, 87, 105, 91],
        },
        {
          name: 'Data',
          data: [54, 65, 60, 74, 85, 90, 70],
        },
        {
          name: 'Money Transfer',
          data: [35, 41, 36, 26, 45, 48, 52],
        },
        {
          name: 'Bills',
          data: [25, 31, 32, 33, 41, 44, 29],
        },
        {
          name: 'Marketplace',
          data: [19, 22, 25, 32, 36, 42, 45],
        },
      ],
    },
    month: {
      dates: ['Jan 01', 'Jan 05', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 31'],
      series: [
        {
          name: 'Airtime',
          data: [125, 146, 156, 191, 179, 202, 198],
        },
        {
          name: 'Data',
          data: [110, 122, 131, 146, 158, 179, 173],
        },
        {
          name: 'Money Transfer',
          data: [62, 70, 82, 95, 103, 111, 98],
        },
        {
          name: 'Bills',
          data: [45, 52, 64, 77, 85, 92, 81],
        },
        {
          name: 'Marketplace',
          data: [35, 41, 54, 65, 75, 84, 91],
        },
      ],
    },
    year: {
      dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        {
          name: 'Airtime',
          data: [740, 680, 750, 830, 790, 810, 865, 890, 820, 860, 880, 910],
        },
        {
          name: 'Data',
          data: [650, 590, 620, 700, 750, 785, 795, 810, 780, 800, 830, 850],
        },
        {
          name: 'Money Transfer',
          data: [320, 350, 380, 420, 430, 450, 460, 480, 520, 550, 580, 620],
        },
        {
          name: 'Bills',
          data: [250, 270, 290, 310, 330, 350, 380, 400, 430, 450, 480, 510],
        },
        {
          name: 'Marketplace',
          data: [180, 210, 250, 290, 320, 340, 370, 390, 420, 450, 470, 490],
        },
      ],
    },
  };
  
  // Chart options
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#727cf5', '#39afd1', '#fa5c7c', '#ffbc00', '#43d39e'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    xaxis: {
      categories: chartData.dates.length > 0 ? chartData.dates : sampleChartData[timeRange].dates,
    },
    yaxis: {
      title: {
        text: 'Number of Transactions',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val: number) {
          return val.toFixed(0);
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#f1f3fa',
    },
  };

  const handleRangeChange = (range: 'day' | 'week' | 'month' | 'year') => {
    setTimeRange(range);
  };

  return (
    <Card className="mb-3">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <CardTitle className="mb-0">Transaction Activity</CardTitle>
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" className="cursor-pointer">
            {timeRange === 'day' && 'Today'}
            {timeRange === 'week' && 'This Week'}
            {timeRange === 'month' && 'This Month'}
            {timeRange === 'year' && 'This Year'}
            <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleRangeChange('day')}>
              Today
            </Dropdown.Item>
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
      <CardBody className="pt-0">
        <div className="mb-3">
          <p className="text-muted mb-1">Total Transactions</p>
          <h3>8,942</h3>
        </div>
        
        <ReactApexChart
          options={options}
          series={chartData.series.length > 0 ? chartData.series : sampleChartData[timeRange].series}
          type="area"
          height={350}
          className="apex-charts"
        />
      </CardBody>
    </Card>
  );
};

export default TransactionActivityChart;
