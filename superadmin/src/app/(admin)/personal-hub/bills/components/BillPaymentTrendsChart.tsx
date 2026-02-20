"use client";

import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

const BillPaymentTrendsChart = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'volume' | 'count'>('volume');
  
  // Sample data - would be fetched from API in production
  const chartData = {
    week: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      volume: {
        utilities: [5280, 4890, 5340, 6102, 5850, 4380, 3920],
        telecom: [3450, 3280, 3560, 3720, 3640, 3290, 3120],
        tv: [1240, 980, 1150, 1320, 1280, 1050, 890],
        others: [2130, 1950, 2240, 2580, 2430, 1870, 1650],
      },
      count: {
        utilities: [105, 98, 112, 124, 118, 92, 84],
        telecom: [215, 205, 228, 236, 225, 210, 198],
        tv: [42, 35, 40, 46, 44, 38, 32],
        others: [68, 62, 75, 82, 76, 65, 58],
      },
    },
    month: {
      dates: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      volume: {
        utilities: [22450, 24680, 26120, 23780],
        telecom: [14250, 15380, 16240, 14890],
        tv: [5480, 6120, 6580, 5920],
        others: [8750, 9680, 10240, 9350],
      },
      count: {
        utilities: [450, 495, 520, 475],
        telecom: [890, 925, 960, 905],
        tv: [185, 205, 225, 195],
        others: [280, 310, 335, 295],
      },
    },
    quarter: {
      dates: ['Jan', 'Feb', 'Mar'],
      volume: {
        utilities: [68450, 72680, 76120],
        telecom: [42250, 45380, 48240],
        tv: [16480, 18120, 19580],
        others: [25750, 28680, 31240],
      },
      count: {
        utilities: [1350, 1495, 1620],
        telecom: [2650, 2825, 2960],
        tv: [550, 605, 675],
        others: [840, 930, 1005],
      },
    },
    year: {
      dates: ['Q1', 'Q2', 'Q3', 'Q4'],
      volume: {
        utilities: [210450, 225680, 236120, 248780],
        telecom: [125250, 135380, 142240, 148890],
        tv: [52480, 58120, 62580, 65920],
        others: [78750, 86680, 92240, 97350],
      },
      count: {
        utilities: [4250, 4595, 4820, 5075],
        telecom: [7890, 8525, 8960, 9405],
        tv: [1785, 1955, 2125, 2295],
        others: [2580, 2810, 3035, 3295],
      },
    },
  };
  
  // Prepare series data based on selected view and time range
  const getSeriesData = () => {
    const data = chartData[timeRange];
    const viewData = chartView === 'volume' ? data.volume : data.count;
    
    return [
      {
        name: 'Utilities',
        data: viewData.utilities,
      },
      {
        name: 'Telecom',
        data: viewData.telecom,
      },
      {
        name: 'TV',
        data: viewData.tv,
      },
      {
        name: 'Others',
        data: viewData.others,
      },
    ];
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const data = chartData[timeRange];
    const viewData = chartView === 'volume' ? data.volume : data.count;
    
    return {
      utilities: viewData.utilities.reduce((sum, value) => sum + value, 0),
      telecom: viewData.telecom.reduce((sum, value) => sum + value, 0),
      tv: viewData.tv.reduce((sum, value) => sum + value, 0),
      others: viewData.others.reduce((sum, value) => sum + value, 0),
    };
  };
  
  const totals = calculateTotals();
  const totalSum = totals.utilities + totals.telecom + totals.tv + totals.others;
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (chartView === 'count') {
      return value.toLocaleString();
    }
    
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
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: ['#727cf5', '#0acf97', '#fa5c7c', '#6c757d'],
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
        text: chartView === 'volume' ? 'Payment Volume ($)' : 'Number of Transactions',
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

  const handleRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  const handleViewChange = (view: 'volume' | 'count') => {
    setChartView(view);
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Bill Payment Trends</Card.Title>
          <small className="text-muted">Payment activity over time by category</small>
        </div>
        <div className="ms-auto d-flex">
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {chartView === 'volume' ? 'Volume ($)' : 'Count'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item 
                active={chartView === 'volume'} 
                onClick={() => handleViewChange('volume')}
              >
                Volume ($)
              </Dropdown.Item>
              <Dropdown.Item 
                active={chartView === 'count'} 
                onClick={() => handleViewChange('count')}
              >
                Count
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
          <div className="col-md-3">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-primary-lighten">
                    <i className="fe-dollar-sign font-24 avatar-title text-primary"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(totalSum)}</h3>
                    <p className="text-muted mb-1">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-blue-lighten">
                    <i className="fe-zap font-24 avatar-title text-blue"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(totals.utilities)}</h3>
                    <p className="text-muted mb-1">Utilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-success-lighten">
                    <i className="fe-phone font-24 avatar-title text-success"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(totals.telecom)}</h3>
                    <p className="text-muted mb-1">Telecom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="widget-rounded-circle card-box">
              <div className="row">
                <div className="col-6">
                  <div className="avatar-lg rounded-circle bg-danger-lighten">
                    <i className="fe-tv font-24 avatar-title text-danger"></i>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-end">
                    <h3 className="text-dark mt-1">{formatCurrency(totals.tv)}</h3>
                    <p className="text-muted mb-1">TV</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ReactApexChart
          options={options}
          series={getSeriesData()}
          type="bar"
          height={350}
          className="apex-charts"
        />
      </Card.Body>
    </Card>
  );
};

export default BillPaymentTrendsChart;
