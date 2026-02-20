"use client";

import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const TransferVolumeChart = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Sample data - would be fetched from API in production
  const chartData = {
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        {
          name: 'Domestic',
          data: [12456, 15789, 14325, 18921, 17502, 19845, 15670],
        },
        {
          name: 'International',
          data: [6789, 5432, 7890, 8901, 7654, 8765, 9812],
        },
      ],
    },
    month: {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      series: [
        {
          name: 'Domestic',
          data: [52456, 58932, 61245, 54892],
        },
        {
          name: 'International',
          data: [28912, 32145, 35672, 30145],
        },
      ],
    },
    quarter: {
      dates: ['Jan', 'Feb', 'Mar'],
      series: [
        {
          name: 'Domestic',
          data: [182456, 195789, 204325],
        },
        {
          name: 'International',
          data: [92145, 105672, 98945],
        },
      ],
    },
    year: {
      dates: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [
        {
          name: 'Domestic',
          data: [582456, 628932, 661245, 694892],
        },
        {
          name: 'International',
          data: [328912, 362145, 385672, 410145],
        },
      ],
    },
  };
  
  // Calculate transaction totals
  const transactionTotals = {
    domestic: chartData[timeRange].series[0].data.reduce((sum, value) => sum + value, 0),
    international: chartData[timeRange].series[1].data.reduce((sum, value) => sum + value, 0),
  };
  const totalVolume = transactionTotals.domestic + transactionTotals.international;
  
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
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#727cf5', '#fa5c7c'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [3, 3],
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
        text: 'Transfer Volume ($)',
      },
      labels: {
        formatter: function(val: number) {
          return formatCurrency(val);
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val: number) {
          return formatCurrency(val);
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#f1f3fa',
    },
  };

  const handleRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Transfer Volume</Card.Title>
          <small className="text-muted">Money transfer volume over time</small>
        </div>
        <Dropdown align="end" className="ms-auto">
          <Dropdown.Toggle variant="light" className="cursor-pointer">
            {timeRange === 'week' && 'This Week'}
            {timeRange === 'month' && 'This Month'}
            {timeRange === 'quarter' && 'This Quarter'}
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
            <Dropdown.Item onClick={() => handleRangeChange('quarter')}>
              This Quarter
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleRangeChange('year')}>
              This Year
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Card.Header>
      <Card.Body>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-primary-lighten">
                    <i className="fe-dollar-sign font-24 avatar-title text-primary"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(totalVolume)}</h3>
                    <p className="text-muted mb-1">Total Volume</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-blue-lighten">
                    <i className="fe-map-pin font-24 avatar-title text-blue"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(transactionTotals.domestic)}</h3>
                    <p className="text-muted mb-1">Domestic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-danger-lighten">
                    <i className="fe-globe font-24 avatar-title text-danger"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(transactionTotals.international)}</h3>
                    <p className="text-muted mb-1">International</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ReactApexChart
          options={options}
          series={chartData[timeRange].series}
          type="line"
          height={350}
          className="apex-charts"
        />
      </Card.Body>
    </Card>
  );
};

export default TransferVolumeChart;
