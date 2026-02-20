"use client";

import React from 'react';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface UserEngagementChartProps {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

const UserEngagementChart: React.FC<UserEngagementChartProps> = ({ dateRange }) => {
  // Generate sample data based on the date range
  const getDates = () => {
    switch (dateRange) {
      case 'today':
        return Array.from({ length: 24 }, (_, i) => `${i}:00`);
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      case 'quarter':
        return ['Jan', 'Feb', 'Mar'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Sep 1', 'Sep 5', 'Sep 10', 'Sep 15', 'Sep 20', 'Sep 25', 'Sep 30'];
    }
  };

  const chartData = {
    series: [
      {
        name: 'Active Users',
        data: [3200, 3400, 3800, 3600, 3900, 4200, 4500, 4300, 4600, 4800, 5000, 5200]
      },
      {
        name: 'Transactions',
        data: [4800, 5200, 5600, 5400, 5800, 6200, 6500, 6300, 6700, 7000, 7200, 7400]
      },
      {
        name: 'Session Duration (mins)',
        data: [2.1, 2.3, 2.2, 2.5, 2.4, 2.6, 2.8, 2.7, 2.9, 3.1, 3.0, 3.2].map(val => val * 10)
      }
    ],
    options: {
      chart: {
        type: 'line' as const,
        height: 350,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      colors: ['#3b82f6', '#22c55e', '#f97316'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const,
        width: [3, 3, 2],
        dashArray: [0, 0, 5]
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'right' as const
      },
      xaxis: {
        categories: dateRange === 'year' ? 
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : 
          getDates()
      },
      yaxis: [
        {
          title: {
            text: 'Users & Transactions'
          },
        },
        {
          opposite: true,
          title: {
            text: 'Session Duration (seconds)'
          }
        }
      ],
      tooltip: {
        y: [
          {
            formatter: function (val: number) {
              return val.toFixed(0);
            }
          },
          {
            formatter: function (val: number) {
              return val.toFixed(0);
            }
          },
          {
            formatter: function (val: number) {
              return (val / 10).toFixed(1) + " mins";
            }
          }
        ]
      }
    }
  };

  return (
    <div>
      <ReactApexChart 
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default UserEngagementChart;
