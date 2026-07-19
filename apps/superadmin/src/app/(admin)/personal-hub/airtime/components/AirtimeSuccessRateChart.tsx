"use client";

import React, { useMemo } from 'react';
import { Alert, Card, CardBody, CardHeader, CardTitle, Spinner, Table } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const COLORS = ['#0acf97', '#fa5c7c', '#ffbc00'];
const CHART_LIMIT = 1000;

const AirtimeSuccessRateChart = () => {
  const { summary, transactions, loading, error } = usePersonalHubReports({
    period: '30',
    serviceTypes: ['airtime'],
    limit: CHART_LIMIT,
  });

  const statusCounts = useMemo(() => {
    const total = summary?.total_transactions || 0;
    const completed = summary?.successful_transactions || 0;
    const failed = summary?.failed_transactions || 0;
    const pending = Math.max(total - completed - failed, 0);
    return [completed, failed, pending];
  }, [summary]);

  const providerStats = useMemo(() => {
    const providerMap = new Map<string, { total: number; completed: number; failed: number; pending: number }>();

    for (const transaction of transactions) {
      const provider = transaction.provider?.trim() || 'Unassigned';
      const current = providerMap.get(provider) || { total: 0, completed: 0, failed: 0, pending: 0 };
      current.total += 1;
      if (transaction.status === 'completed') {
        current.completed += 1;
      } else if (transaction.status === 'failed') {
        current.failed += 1;
      } else {
        current.pending += 1;
      }
      providerMap.set(provider, current);
    }

    return Array.from(providerMap.entries())
      .sort((left, right) => right[1].total - left[1].total)
      .slice(0, 5)
      .map(([provider, stats]) => ({
        provider,
        successRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        failedRate: stats.total > 0 ? (stats.failed / stats.total) * 100 : 0,
        pendingRate: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0,
      }));
  }, [transactions]);

  const options: ApexOptions = {
    chart: { height: 320, type: 'donut' },
    colors: COLORS,
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: ['Success', 'Failed', 'Pending'],
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: true },
            value: {
              show: true,
              formatter: (value) => Number(value).toLocaleString('en-GH'),
            },
            total: {
              show: true,
              label: 'Success Rate',
              formatter: () => `${(summary?.average_success_rate || 0).toFixed(1)}%`,
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toLocaleString('en-GH')} transactions`,
      },
    },
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle className="mb-0">Transaction Success Rate</CardTitle>
      </CardHeader>
      <CardBody>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading airtime outcomes...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : (summary?.total_transactions || 0) === 0 ? (
          <div className="py-5 text-center text-muted">No airtime payment outcomes are available yet.</div>
        ) : (
          <>
            <div className="chart-container mb-4">
              <ReactApexChart options={options} series={statusCounts} type="donut" height={240} className="apex-charts" />
            </div>
            <div className="text-muted small mb-3">
              Based on the latest {(summary?.total_transactions || 0).toLocaleString('en-GH')} airtime transactions in the current reporting window.
            </div>
            <Table className="mb-0">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {providerStats.map((provider) => (
                  <tr key={provider.provider}>
                    <td>{provider.provider}</td>
                    <td className="text-success">{provider.successRate.toFixed(1)}%</td>
                    <td className="text-danger">{provider.failedRate.toFixed(1)}%</td>
                    <td className="text-warning">{provider.pendingRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default AirtimeSuccessRateChart;

