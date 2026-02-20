"use client";

import React from 'react';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface RevenueByServiceChartProps {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

const RevenueByServiceChart: React.FC<RevenueByServiceChartProps> = ({ dateRange }) => {
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
        data: [4200, 4500, 3800, 4100, 4800, 5200, 4900, 6100, 5800, 5100, 5700, 6200]
      },
      {
        name: 'Data',
        data: [3100, 3400, 2800, 3200, 3900, 4300, 4100, 4800, 4600, 4200, 4500, 5000]
      },
      {
        name: 'Money Transfer',
        data: [1800, 2200, 1900, 2500, 3100, 2800, 3300, 3700, 3200, 2900, 3500, 3800]
      },
      {
        name: 'Bill Payments',
        data: [2500, 2700, 2300, 2600, 3000, 3400, 3200, 3600, 3400, 3100, 3300, 3500]
      },
      {
        name: 'Marketplace',
        data: [1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3000, 2700, 3200, 3500]
      },
      {
        name: 'Insurance',
        data: [600, 800, 700, 900, 1100, 1000, 1200, 1300, 1100, 1000, 1400, 1500]
      }
    ],
    options: {
      chart: {
        type: 'area' as const,
        height: 350,
        stacked: true,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      colors: ['#3b82f6', '#22c55e', '#f97316', '#f59e0b', '#6366f1', '#ef4444'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const,
        width: 1
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.6,
          opacityTo: 0.1
        }
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
      tooltip: {
        y: {
          formatter: function (val: number) {
            return "$" + val.toFixed(0);
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
        type="area"
        height={350}
      />
    </div>
  );
};

export default RevenueByServiceChart;
