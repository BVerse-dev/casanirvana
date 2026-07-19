"use client";

import React, { useMemo, useState } from 'react';
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, Form, Spinner, Table } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import { buildSeriesByBucket } from '@/lib/personalHubCharts';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '365', label: 'Last 12 months' },
];

const COLORS = ['#0acf97', '#727cf5', '#fa5c7c', '#ffbc00'];
const CHART_LIMIT = 1000;

const DataUsageChart = () => {
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const { transactions, loading, error, transactionsTruncated } = usePersonalHubReports({
    period,
    serviceTypes: ['data'],
    limit: CHART_LIMIT,
  });

  const providerStats = useMemo(() => {
    const stats = new Map<string, { total: number; completed: number }>();

    for (const transaction of transactions) {
      const provider = transaction.provider?.trim() || 'Unassigned';
      const current = stats.get(provider) || { total: 0, completed: 0 };
      current.total += 1;
      if (transaction.status === 'completed') {
        current.completed += 1;
      }
      stats.set(provider, current);
    }

    return Array.from(stats.entries())
      .sort((left, right) => right[1].total - left[1].total)
      .slice(0, 4)
      .map(([provider, stats]) => ({
        provider,
        transactions: stats.total,
        successRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }));
  }, [transactions]);

  const chart = useMemo(() => {
    if (providerStats.length === 0) {
      return { categories: [] as string[], series: [] as Array<{ name: string; data: number[] }> };
    }

    const providerSet = new Set(providerStats.map((item) => item.provider));
    return buildSeriesByBucket({
      transactions,
      period,
      groups: providerStats.map((item) => item.provider),
      getGroupKey: (transaction) => {
        const provider = transaction.provider?.trim() || 'Unassigned';
        return providerSet.has(provider) ? provider : null;
      },
    });
  }, [period, providerStats, transactions]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      height: 350,
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '58%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    colors: COLORS,
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chart.categories,
    },
    yaxis: {
      title: { text: 'Transactions' },
      labels: {
        formatter: (value: number) => value.toLocaleString('en-GH'),
      },
    },
    fill: { opacity: 1 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: 6,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toLocaleString('en-GH')} transactions`,
      },
    },
  }), [chart.categories]);

  return (
    <Card className="mb-3">
      <CardHeader className="d-flex align-items-center">
        <div>
          <CardTitle className="mb-0">Provider Usage Trend</CardTitle>
          <small className="text-muted">Data transactions by provider</small>
        </div>
        <Form.Select
          size="sm"
          value={period}
          onChange={(event) => setPeriod(event.target.value as PersonalHubReportsPeriod)}
          className="ms-auto"
          style={{ maxWidth: 180 }}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </CardHeader>
      <CardBody>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading data provider activity...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : providerStats.length === 0 ? (
          <div className="py-5 text-center text-muted">No data transactions are available for the selected period.</div>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              {transactionsTruncated ? (
                <div className="text-muted small mb-3">Chart is based on the newest 1,000 data transactions returned for this filter.</div>
              ) : null}
              <ReactApexChart options={options} series={chart.series} type="bar" height={350} className="apex-charts" />
            </div>
            <div className="col-lg-4">
              <h5 className="mb-3">Top Providers</h5>
              <Table className="table-sm table-striped mb-0">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Transactions</th>
                    <th>Success</th>
                  </tr>
                </thead>
                <tbody>
                  {providerStats.map((provider) => (
                    <tr key={provider.provider}>
                      <td>
                        <div className="fw-semibold">{provider.provider}</div>
                      </td>
                      <td>{provider.transactions.toLocaleString('en-GH')}</td>
                      <td>
                        <Badge bg={provider.successRate >= 90 ? 'success' : provider.successRate >= 75 ? 'warning' : 'danger'}>
                          {provider.successRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DataUsageChart;
