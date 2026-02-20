"use client";

import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const MarketplaceSalesChart = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'revenue' | 'orders'>('revenue');
  
  // Sample data - would be fetched from API in production
  const chartData = {
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      revenue: [1250, 1420, 1680, 1490, 1850, 2100, 1950],
      orders: [32, 38, 42, 35, 47, 55, 50],
    },
    month: {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      revenue: [6890, 8450, 9230, 7980],
      orders: [175, 210, 245, 198],
    },
    quarter: {
      dates: ['Jan', 'Feb', 'Mar'],
      revenue: [24500, 28700, 32400],
      orders: [620, 745, 830],
    },
    year: {
      dates: ['Q1', 'Q2', 'Q3', 'Q4'],
      revenue: [85600, 102400, 115800, 128500],
      orders: [2195, 2680, 3050, 3420],
    },
  };
  
  // Calculate totals
  const calculateTotals = () => {
    return {
      revenue: chartData[timeRange].revenue.reduce((sum, value) => sum + value, 0),
      orders: chartData[timeRange].orders.reduce((sum, value) => sum + value, 0),
    };
  };
  
  const totals = calculateTotals();
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  // Chart options
  const getChartOptions = (): ApexOptions => {
    if (chartView === 'revenue') {
      return {
        chart: {
          height: 350,
          type: 'area',
          toolbar: {
            show: false,
          },
        },
        colors: ['#727cf5'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 3,
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
          categories: chartData[timeRange].dates,
        },
        yaxis: {
          title: {
            text: 'Revenue ($)',
          },
          labels: {
            formatter: function(val: number) {
              return formatCurrency(val);
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(val: number) {
              return formatCurrency(val);
            }
          }
        },
        grid: {
          borderColor: '#f1f3fa',
        },
      };
    } else {
      return {
        chart: {
          height: 350,
          type: 'bar',
          toolbar: {
            show: false,
          },
        },
        colors: ['#0acf97'],
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: '50%',
          }
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: chartData[timeRange].dates,
        },
        yaxis: {
          title: {
            text: 'Number of Orders',
          },
        },
        grid: {
          borderColor: '#f1f3fa',
        },
      };
    }
  };

  // Prepare series data based on selected view
  const getSeriesData = () => {
    if (chartView === 'revenue') {
      return [
        {
          name: 'Revenue',
          data: chartData[timeRange].revenue,
        },
      ];
    } else {
      return [
        {
          name: 'Orders',
          data: chartData[timeRange].orders,
        },
      ];
    }
  };

  const handleRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  const handleViewChange = (view: 'revenue' | 'orders') => {
    setChartView(view);
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Marketplace Performance</Card.Title>
          <small className="text-muted">Sales and order analytics</small>
        </div>
        <div className="ms-auto d-flex">
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {chartView === 'revenue' ? 'Revenue' : 'Orders'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                active={chartView === 'revenue'} 
                onClick={() => handleViewChange('revenue')}
              >
                Revenue
              </Dropdown.Item>
              <Dropdown.Item 
                active={chartView === 'orders'} 
                onClick={() => handleViewChange('orders')}
              >
                Orders
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown>
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {timeRange === 'week' && 'This Week'}
              {timeRange === 'month' && 'This Month'}
              {timeRange === 'quarter' && 'This Quarter'}
              {timeRange === 'year' && 'This Year'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                active={timeRange === 'week'} 
                onClick={() => handleRangeChange('week')}
              >
                This Week
              </Dropdown.Item>
              <Dropdown.Item 
                active={timeRange === 'month'} 
                onClick={() => handleRangeChange('month')}
              >
                This Month
              </Dropdown.Item>
              <Dropdown.Item 
                active={timeRange === 'quarter'} 
                onClick={() => handleRangeChange('quarter')}
              >
                This Quarter
              </Dropdown.Item>
              <Dropdown.Item 
                active={timeRange === 'year'} 
                onClick={() => handleRangeChange('year')}
              >
                This Year
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-primary-lighten">
                    <i className="fe-dollar-sign font-24 avatar-title text-primary"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(totals.revenue)}</h3>
                    <p className="text-muted mb-1">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-success-lighten">
                    <i className="fe-shopping-cart font-24 avatar-title text-success"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{totals.orders}</h3>
                    <p className="text-muted mb-1">Total Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ReactApexChart
          options={getChartOptions()}
          series={getSeriesData()}
          type={chartView === 'revenue' ? 'area' : 'bar'}
          height={350}
          className="apex-charts"
        />
      </Card.Body>
    </Card>
  );
};

export default MarketplaceSalesChart;

