"use client";

import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const ClaimsAnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'claims' | 'ratio'>('claims');
  
  // Sample data - would be fetched from API in production
  const chartData = {
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      claims: {
        health: [3, 2, 4, 1, 2, 1, 0],
        auto: [1, 2, 0, 1, 1, 0, 1],
        property: [0, 1, 0, 2, 0, 0, 0],
        others: [1, 0, 1, 0, 0, 1, 0],
      },
      ratio: [12, 15, 18, 14, 10, 8, 5],
    },
    month: {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      claims: {
        health: [10, 12, 8, 14],
        auto: [5, 7, 4, 6],
        property: [3, 2, 4, 3],
        others: [2, 3, 1, 2],
      },
      ratio: [15, 12, 14, 18],
    },
    quarter: {
      dates: ['Jan', 'Feb', 'Mar'],
      claims: {
        health: [35, 42, 38],
        auto: [18, 22, 20],
        property: [12, 10, 15],
        others: [8, 7, 10],
      },
      ratio: [14, 15, 13],
    },
    year: {
      dates: ['Q1', 'Q2', 'Q3', 'Q4'],
      claims: {
        health: [115, 125, 130, 142],
        auto: [60, 68, 72, 75],
        property: [37, 42, 45, 48],
        others: [25, 28, 30, 32],
      },
      ratio: [14, 16, 15, 13],
    },
  };
  
  // Prepare series data based on selected view and time range
  const getSeriesData = () => {
    if (chartView === 'claims') {
      const data = chartData[timeRange];
      return [
        {
          name: 'Health',
          data: data.claims.health,
        },
        {
          name: 'Auto',
          data: data.claims.auto,
        },
        {
          name: 'Property',
          data: data.claims.property,
        },
        {
          name: 'Others',
          data: data.claims.others,
        },
      ];
    } else {
      return [
        {
          name: 'Claims Ratio (%)',
          data: chartData[timeRange].ratio,
        },
      ];
    }
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const data = chartData[timeRange].claims;
    return {
      health: data.health.reduce((sum, value) => sum + value, 0),
      auto: data.auto.reduce((sum, value) => sum + value, 0),
      property: data.property.reduce((sum, value) => sum + value, 0),
      others: data.others.reduce((sum, value) => sum + value, 0),
    };
  };
  
  const totals = calculateTotals();
  const totalClaims = totals.health + totals.auto + totals.property + totals.others;
  const averageRatio = chartData[timeRange].ratio.reduce((sum, value) => sum + value, 0) / chartData[timeRange].ratio.length;
  
  // Chart options
  const getChartOptions = (): ApexOptions => {
    if (chartView === 'claims') {
      return {
        chart: {
          height: 350,
          type: 'bar',
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        colors: ['#39afd1', '#727cf5', '#ffbc00', '#6c757d'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 1,
          colors: ['#fff'],
        },
        xaxis: {
          categories: chartData[timeRange].dates,
        },
        yaxis: {
          title: {
            text: 'Number of Claims',
          },
        },
        tooltip: {
          y: {
            formatter: function(val: number) {
              return val.toString();
            }
          }
        },
        fill: {
          opacity: 1,
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
        },
        grid: {
          borderColor: '#f1f3fa',
        },
      };
    } else {
      return {
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
        colors: ['#fa5c7c'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 3,
          curve: 'smooth',
        },
        xaxis: {
          categories: chartData[timeRange].dates,
        },
        yaxis: {
          title: {
            text: 'Claims Ratio (%)',
          },
        },
        markers: {
          size: 4,
        },
        grid: {
          borderColor: '#f1f3fa',
        },
      };
    }
  };

  const handleRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  const handleViewChange = (view: 'claims' | 'ratio') => {
    setChartView(view);
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Claims Analytics</Card.Title>
          <small className="text-muted">Claims activity and ratio over time</small>
        </div>
        <div className="ms-auto d-flex">
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {chartView === 'claims' ? 'Claims Count' : 'Claims Ratio'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                active={chartView === 'claims'} 
                onClick={() => handleViewChange('claims')}
              >
                Claims Count
              </Dropdown.Item>
              <Dropdown.Item 
                active={chartView === 'ratio'} 
                onClick={() => handleViewChange('ratio')}
              >
                Claims Ratio
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
        {chartView === 'claims' && (
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="widget-rounded-circle card-box">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-lg rounded-circle bg-blue-lighten">
                      <i className="fe-file-text font-24 avatar-title text-blue"></i>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-end">
                      <h3 className="text-dark mt-1">{totalClaims}</h3>
                      <p className="text-muted mb-1">Total Claims</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="widget-rounded-circle card-box">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-lg rounded-circle bg-info-lighten">
                      <i className="fe-heart font-24 avatar-title text-info"></i>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-end">
                      <h3 className="text-dark mt-1">{totals.health}</h3>
                      <p className="text-muted mb-1">Health</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="widget-rounded-circle card-box">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-lg rounded-circle bg-primary-lighten">
                      <i className="fe-truck font-24 avatar-title text-primary"></i>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-end">
                      <h3 className="text-dark mt-1">{totals.auto}</h3>
                      <p className="text-muted mb-1">Auto</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="widget-rounded-circle card-box">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-lg rounded-circle bg-warning-lighten">
                      <i className="fe-home font-24 avatar-title text-warning"></i>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-end">
                      <h3 className="text-dark mt-1">{totals.property}</h3>
                      <p className="text-muted mb-1">Property</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {chartView === 'ratio' && (
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="widget-rounded-circle card-box">
                <div className="row">
                  <div className="col-4">
                    <div className="avatar-lg rounded-circle bg-danger-lighten">
                      <i className="fe-percent font-24 avatar-title text-danger"></i>
                    </div>
                  </div>
                  <div className="col-8">
                    <div className="text-end">
                      <h3 className="text-dark mt-1">{averageRatio.toFixed(1)}%</h3>
                      <p className="text-muted mb-1">Average Claims Ratio</p>
                      <p className="text-muted mb-1">
                        <span className={averageRatio < 15 ? 'text-success' : 'text-danger'}>
                          <IconifyIcon icon={averageRatio < 15 ? 'ri:arrow-down-line' : 'ri:arrow-up-line'} className="me-1" />
                          {Math.abs(15 - averageRatio).toFixed(1)}% {averageRatio < 15 ? 'below' : 'above'} industry average
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ReactApexChart
          options={getChartOptions()}
          series={getSeriesData()}
          type={chartView === 'claims' ? 'bar' : 'line'}
          height={350}
          className="apex-charts"
        />
      </Card.Body>
    </Card>
  );
};

export default ClaimsAnalyticsChart;
