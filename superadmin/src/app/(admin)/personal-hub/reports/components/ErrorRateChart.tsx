"use client";

import React from 'react';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface ErrorRateChartProps {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

const ErrorRateChart: React.FC<ErrorRateChartProps> = ({ dateRange }) => {
  // Generate sample data based on the date range
  const getDates = () => {
    switch (dateRange) {
      case 'today':
        return Array.from({ length: 24 }, (_, i) => `${i}:00`);
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`).slice(0, 10);
      case 'quarter':
        return ['Jan', 'Feb', 'Mar'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Sep 1', 'Sep 5', 'Sep 10', 'Sep 15', 'Sep 20', 'Sep 25', 'Sep 30'].slice(0, 10);
    }
  };

  const chartData = {
    series: [
      {
        name: 'Airtime',
        data: [0.05, 0.03, 0.02, 0.01, 0.02, 0.04, 0.03, 0.02, 0.01, 0.02, 0.03, 0.02]
      },
      {
        name: 'Data',
        data: [0.06, 0.04, 0.03, 0.02, 0.04, 0.05, 0.04, 0.03, 0.02, 0.03, 0.04, 0.03]
      },
      {
        name: 'Money Transfer',
        data: [0.15, 0.12, 0.10, 0.08, 0.11, 0.13, 0.15, 0.14, 0.12, 0.10, 0.09, 0.08]
      },
      {
        name: 'Bill Payments',
        data: [0.08, 0.07, 0.05, 0.06, 0.08, 0.04, 0.05, 0.07, 0.09, 0.08, 0.07, 0.06]
      },
      {
        name: 'Insurance',
        data: [0.03, 0.02, 0.01, 0.02, 0.03, 0.01, 0.02, 0.03, 0.02, 0.01, 0.02, 0.03]
      },
      {
        name: 'Marketplace',
        data: [0.04, 0.03, 0.02, 0.01, 0.02, 0.03, 0.04, 0.03, 0.02, 0.01, 0.02, 0.03]
      }
    ],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350,
        stacked: true,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom' as const,
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: '13px',
                fontWeight: 900
              }
            }
          }
        },
      },
      colors: ['#3b82f6', '#22c55e', '#f97316', '#f59e0b', '#6366f1', '#ef4444'],
      xaxis: {
        categories: dateRange === 'year' ? 
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : 
          getDates(),
      },
      yaxis: {
        labels: {
          formatter: function (val: number) {
            return (val * 100).toFixed(2) + "%";
          }
        },
      },
      legend: {
        position: 'top' as const,
        offsetY: 0
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return (val * 100).toFixed(2) + "%";
          }
        }
      }
    }
  };

  return (
    <div>
      <ReactApexChart 
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default ErrorRateChart;
