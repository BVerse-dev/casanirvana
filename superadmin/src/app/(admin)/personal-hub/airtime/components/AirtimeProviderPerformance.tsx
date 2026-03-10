"use client";

import React, { useMemo, useState } from 'react';
import { Alert, Card, CardBody, CardHeader, CardTitle, Dropdown, Spinner } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import { buildSeriesByBucket } from '@/lib/personalHubCharts';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '365', label: 'Last 12 months' },
];

const COLORS = ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00'];
const CHART_LIMIT = 1000;

const AirtimeProviderPerformance = () => {
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const { transactions, loading, error, transactionsTruncated } = usePersonalHubReports({
    period,
    serviceTypes: ['airtime'],
    limit: CHART_LIMIT,
  });

  const topProviders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const transaction of transactions) {
      const label = transaction.provider?.trim() || 'Unassigned';
      counts.set(label, (counts.get(label) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label]) => label);
  }, [transactions]);

  const chart = useMemo(() => {
    if (topProviders.length === 0) {
      return { categories: [] as string[], series: [] as Array<{ name: string; data: number[] }> };
    }

    const providerSet = new Set(topProviders);
    return buildSeriesByBucket({
      transactions,
      period,
      groups: topProviders,
      getGroupKey: (transaction) => {
        const label = transaction.provider?.trim() || 'Unassigned';
        return providerSet.has(label) ? label : null;
      },
    });
  }, [period, topProviders, transactions]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      height: 350,
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '52%',
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
    grid: { borderColor: '#f1f3fa' },
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
          <CardTitle className="mb-0">Provider Performance</CardTitle>
          <small className="text-muted">Airtime transaction count by provider</small>
        </div>
        <Dropdown align="end" className="ms-auto">
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
      </CardHeader>
      <CardBody>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading airtime provider trend...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : topProviders.length === 0 ? (
          <div className="py-5 text-center text-muted">No airtime provider activity is available for the selected period.</div>
        ) : (
          <>
            {transactionsTruncated ? (
              <div className="text-muted small mb-3">Chart is based on the newest 1,000 airtime transactions returned for this filter.</div>
            ) : null}
            <ReactApexChart
              options={options}
              series={chart.series}
              type="bar"
              height={350}
              className="apex-charts"
            />
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default AirtimeProviderPerformance;

