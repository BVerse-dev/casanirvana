"use client";

import React from 'react';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface ServiceUptimeChartProps {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

const ServiceUptimeChart: React.FC<ServiceUptimeChartProps> = ({ dateRange }) => {
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
        name: 'Airtime',
        data: [99.97, 99.98, 99.99, 100, 99.99, 99.98, 99.99, 100, 99.99, 99.98, 99.97, 99.99]
      },
      {
        name: 'Data',
        data: [99.95, 99.97, 99.98, 99.99, 99.96, 99.97, 99.98, 99.99, 99.97, 99.96, 99.95, 99.97]
      },
      {
        name: 'Money Transfer',
        data: [99.90, 99.92, 99.93, 99.91, 99.89, 99.87, 99.85, 99.86, 99.88, 99.90, 99.91, 99.92]
      },
      {
        name: 'Bill Payments',
        data: [99.92, 99.94, 99.95, 99.93, 99.94, 99.96, 99.95, 99.93, 99.91, 99.92, 99.93, 99.94]
      },
      {
        name: 'Insurance',
        data: [99.97, 99.98, 99.99, 99.98, 99.97, 99.99, 99.98, 99.97, 99.98, 99.99, 99.98, 99.97]
      },
      {
        name: 'Marketplace',
        data: [99.98, 99.99, 100, 99.99, 99.98, 99.97, 99.98, 99.99, 100, 99.99, 99.98, 99.99]
      }
    ],
    options: {
      chart: {
        type: 'line' as const,
        height: 350,
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#3b82f6', '#22c55e', '#f97316', '#f59e0b', '#6366f1', '#ef4444'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'straight' as const
      },
      title: {
        text: 'Service Uptime Percentage',
        align: 'left' as const
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
      },
      xaxis: {
        categories: dateRange === 'year' ? 
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : 
          getDates()
      },
      yaxis: {
        min: 99.8,
        max: 100,
        tickAmount: 4,
        labels: {
          formatter: function (val: number) {
            return val.toFixed(2) + '%';
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val.toFixed(3) + '%';
          }
        }
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'right' as const,
        floating: true,
        offsetY: -25,
        offsetX: -5
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

export default ServiceUptimeChart;
