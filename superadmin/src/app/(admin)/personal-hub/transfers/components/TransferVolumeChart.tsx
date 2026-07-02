"use client";

import React, { useMemo, useState } from 'react';
import { Alert, Card, Form, Spinner } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import { buildSeriesByBucket, formatCurrencyCompact } from '@/lib/personalHubCharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const STATUS_GROUPS = ['Completed', 'Failed', 'Pending'] as const;
const COLORS = ['#0acf97', '#fa5c7c', '#ffbc00'];
const CHART_LIMIT = 1000;

const TransferVolumeChart = () => {
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const [view, setView] = useState<'volume' | 'count'>('volume');
  const { transactions, loading, error, transactionsTruncated } = usePersonalHubReports({
    period,
    serviceTypes: ['money_transfer'],
    limit: CHART_LIMIT,
  });

  const chart = useMemo(
    () =>
      buildSeriesByBucket({
        transactions,
        period,
        groups: [...STATUS_GROUPS],
        getGroupKey: (transaction) => {
          if (transaction.status === 'completed') return 'Completed';
          if (transaction.status === 'failed') return 'Failed';
          return 'Pending';
        },
        getValue: (transaction) => (view === 'volume' ? transaction.amount : 1),
      }),
    [period, transactions, view]
  );

  const options: ApexOptions = useMemo(() => ({
    chart: {
      height: 350,
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: COLORS,
    dataLabels: { enabled: false },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xaxis: {
      categories: chart.categories,
    },
    yaxis: {
      title: { text: view === 'volume' ? 'Transfer Volume' : 'Transactions' },
      labels: {
        formatter: (value: number) => (view === 'volume' ? formatCurrencyCompact(value) : value.toLocaleString('en-GH')),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => (view === 'volume' ? `GH₵${value.toLocaleString('en-GH', { maximumFractionDigits: 2 })}` : `${value.toLocaleString('en-GH')} transactions`),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#f1f3fa',
    },
  }), [chart.categories, view]);

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Transfer Settlement Trend</Card.Title>
          <small className="text-muted">Completed vs non-completed transfer activity over time</small>
        </div>
        <div className="ms-auto d-flex gap-2">
          <Form.Select
            size="sm"
            value={view}
            onChange={(event) => setView(event.target.value as 'volume' | 'count')}
            style={{ maxWidth: 150 }}
          >
            <option value="volume">Volume (GH₵)</option>
            <option value="count">Count</option>
          </Form.Select>
          <Form.Select
            size="sm"
            value={period}
            onChange={(event) => setPeriod(event.target.value as PersonalHubReportsPeriod)}
            style={{ maxWidth: 180 }}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </div>
      </Card.Header>
      <Card.Body>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading transfer settlement trend...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : transactions.length === 0 ? (
          <div className="py-5 text-center text-muted">No money-transfer activity is available for the selected period.</div>
        ) : (
          <>
            {transactionsTruncated ? (
              <div className="text-muted small mb-3">Chart is based on the newest 1,000 transfer transactions returned for this filter.</div>
            ) : null}
            <ReactApexChart options={options} series={chart.series} type="line" height={350} className="apex-charts" />
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default TransferVolumeChart;
