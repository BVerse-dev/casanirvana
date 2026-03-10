"use client";

import React, { useMemo, useState } from 'react';
import { Alert, Card, Dropdown, Spinner } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import { buildPeriodBuckets, getBucketKey } from '@/lib/personalHubCharts';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const CHART_LIMIT = 1000;
const STATUS_COLORS = ['#0acf97', '#fa5c7c', '#ffbc00'];

const ClaimsAnalyticsChart = () => {
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const [view, setView] = useState<'status' | 'successRate'>('status');
  const { transactions, loading, error, transactionsTruncated } = usePersonalHubReports({
    period,
    serviceTypes: ['insurance'],
    limit: CHART_LIMIT,
  });

  const buckets = useMemo(() => buildPeriodBuckets(period), [period]);

  const statusSeries = useMemo(() => {
    const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
    const completed = Array(buckets.length).fill(0);
    const failed = Array(buckets.length).fill(0);
    const pending = Array(buckets.length).fill(0);

    for (const transaction of transactions) {
      const bucketKey = getBucketKey(transaction.created_at, period);
      const index = bucketKey ? bucketIndex.get(bucketKey) : undefined;
      if (typeof index !== 'number') {
        continue;
      }

      if (transaction.status === 'completed') {
        completed[index] += 1;
      } else if (transaction.status === 'failed') {
        failed[index] += 1;
      } else {
        pending[index] += 1;
      }
    }

    return [
      { name: 'Completed', data: completed },
      { name: 'Failed', data: failed },
      { name: 'Pending', data: pending },
    ];
  }, [buckets, period, transactions]);

  const successRateSeries = useMemo(() => {
    const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
    const totals = Array(buckets.length).fill(0);
    const completed = Array(buckets.length).fill(0);

    for (const transaction of transactions) {
      const bucketKey = getBucketKey(transaction.created_at, period);
      const index = bucketKey ? bucketIndex.get(bucketKey) : undefined;
      if (typeof index !== 'number') {
        continue;
      }

      totals[index] += 1;
      if (transaction.status === 'completed') {
        completed[index] += 1;
      }
    }

    return [{
      name: 'Success Rate',
      data: totals.map((total, index) => (total > 0 ? Number(((completed[index] / total) * 100).toFixed(2)) : 0)),
    }];
  }, [buckets, period, transactions]);

  const options: ApexOptions = useMemo(() => {
    if (view === 'status') {
      return {
        chart: { height: 350, type: 'bar', stacked: true, toolbar: { show: false } },
        colors: STATUS_COLORS,
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '52%',
            borderRadius: 4,
          },
        },
        dataLabels: { enabled: false },
        stroke: { width: 1, colors: ['#fff'] },
        xaxis: { categories: buckets.map((bucket) => bucket.label) },
        yaxis: {
          title: { text: 'Transactions' },
          labels: { formatter: (value: number) => value.toLocaleString('en-GH') },
        },
        tooltip: {
          y: { formatter: (value: number) => `${value.toLocaleString('en-GH')} transactions` },
        },
        legend: { position: 'top', horizontalAlign: 'right' },
        grid: { borderColor: '#f1f3fa' },
      };
    }

    return {
      chart: { height: 350, type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
      colors: ['#727cf5'],
      dataLabels: { enabled: false },
      stroke: { width: 3, curve: 'smooth' },
      xaxis: { categories: buckets.map((bucket) => bucket.label) },
      yaxis: {
        max: 100,
        title: { text: 'Success Rate' },
        labels: { formatter: (value: number) => `${value.toFixed(0)}%` },
      },
      tooltip: {
        y: { formatter: (value: number) => `${value.toFixed(1)}%` },
      },
      grid: { borderColor: '#f1f3fa' },
    };
  }, [buckets, view]);

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Payment Settlement Trend</Card.Title>
          <small className="text-muted">Insurance payment outcomes over time</small>
        </div>
        <div className="ms-auto d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {view === 'status' ? 'Status Mix' : 'Success Rate'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={view === 'status'} onClick={() => setView('status')}>Status Mix</Dropdown.Item>
              <Dropdown.Item active={view === 'successRate'} onClick={() => setView('successRate')}>Success Rate</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {PERIOD_OPTIONS.find((option) => option.value === period)?.label}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {PERIOD_OPTIONS.map((option) => (
                <Dropdown.Item key={option.value} active={period === option.value} onClick={() => setPeriod(option.value)}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>
      <Card.Body>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading insurance settlement trend...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : transactions.length === 0 ? (
          <div className="py-5 text-center text-muted">No insurance payment activity is available for the selected period.</div>
        ) : (
          <>
            {transactionsTruncated ? (
              <div className="text-muted small mb-3">Chart is based on the newest 1,000 insurance-payment transactions returned for this filter.</div>
            ) : null}
            <ReactApexChart
              options={options}
              series={view === 'status' ? statusSeries : successRateSeries}
              type={view === 'status' ? 'bar' : 'line'}
              height={350}
              className="apex-charts"
            />
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ClaimsAnalyticsChart;

