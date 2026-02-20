"use client";

import React from 'react';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface ServiceAdoptionChartProps {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

const ServiceAdoptionChart: React.FC<ServiceAdoptionChartProps> = ({ dateRange }) => {
  // Generate sample data based on the date range
  const getDates = () => {
    switch (dateRange) {
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'quarter':
        return ['Jan', 'Feb', 'Mar'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      default:
        return ['Q1', 'Q2', 'Q3', 'Q4'];
    }
  };

  const chartData = {
    series: [
      {
        name: "Airtime",
        data: [85, 87, 89, 91, 92, 93, 95, 94, 95, 96, 97, 98]
      },
      {
        name: "Data",
        data: [78, 80, 82, 85, 88, 90, 91, 92, 93, 94, 95, 96]
      },
      {
        name: "Money Transfer",
        data: [45, 48, 50, 53, 56, 58, 60, 62, 64, 65, 67, 68]
      },
      {
        name: "Bill Payments",
        data: [62, 65, 67, 69, 71, 72, 74, 75, 77, 78, 80, 82]
      },
      {
        name: "Insurance",
        data: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35]
      },
      {
        name: "Marketplace",
        data: [35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 64, 67]
      }
    ],
    options: {
      chart: {
        type: 'radar' as const,
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: true
      },
      plotOptions: {
        radar: {
          size: 130,
          polygons: {
            strokeColors: '#e9e9e9',
            fill: {
              colors: ['#f8f8f8', '#fff']
            }
          }
        }
      },
      colors: ['#3b82f6', '#22c55e', '#f97316', '#f59e0b', '#ef4444', '#6366f1'],
      markers: {
        size: 4,
        colors: ['#fff'],
        strokeColors: ['#3b82f6', '#22c55e', '#f97316', '#f59e0b', '#ef4444', '#6366f1'],
        strokeWidth: 2
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return val + "%";
          }
        }
      },
      xaxis: {
        categories: getDates()
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: function(val: number, i: number) {
            if(i % 2 === 0) {
              return val + "%";
            } else {
              return '';
            }
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
        type="radar"
        height={350}
      />
    </div>
  );
};

export default ServiceAdoptionChart;
