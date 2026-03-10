"use client";

import React, { useMemo, useState } from 'react';
import { Alert, Card, Dropdown, Spinner } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { AdminPersonalHubCatalogProvider, useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { PersonalHubReportsPeriod, usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import { buildSeriesByBucket, formatCurrencyCompact } from '@/lib/personalHubCharts';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const PERIOD_OPTIONS: Array<{ value: PersonalHubReportsPeriod; label: string }> = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
];

const CATEGORY_LABELS: Record<string, string> = {
  utilities: 'Utilities',
  tv: 'TV / Subscription',
  general: 'General',
};

const COLORS = ['#727cf5', '#0acf97', '#fa5c7c'];
const CHART_LIMIT = 1000;

const resolveCategoryLabel = (provider: string | null, catalogProviders: AdminPersonalHubCatalogProvider[]) => {
  const normalizedProvider = provider?.trim().toLowerCase();
  if (!normalizedProvider) {
    return 'General';
  }

  const match = catalogProviders.find((item) => item.provider_name.trim().toLowerCase() === normalizedProvider);
  const categoryKey = match?.bill_category || 'general';
  return CATEGORY_LABELS[categoryKey] || 'General';
};

const BillPaymentTrendsChart = () => {
  const [period, setPeriod] = useState<PersonalHubReportsPeriod>('30');
  const [view, setView] = useState<'volume' | 'count'>('volume');
  const reports = usePersonalHubReports({ period, serviceTypes: ['bill_payment'], limit: CHART_LIMIT });
  const catalog = useAdminPersonalHubCatalog({ serviceType: 'bill_payment' });

  const categories = useMemo(() => {
    const totals = new Map<string, number>();

    for (const transaction of reports.transactions) {
      const category = resolveCategoryLabel(transaction.provider, catalog.providers);
      const increment = view === 'volume' ? transaction.amount : 1;
      totals.set(category, (totals.get(category) || 0) + increment);
    }

    return Array.from(totals.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([category]) => category);
  }, [catalog.providers, reports.transactions, view]);

  const chart = useMemo(() => {
    if (categories.length === 0) {
      return { categories: [] as string[], series: [] as Array<{ name: string; data: number[] }> };
    }

    const categorySet = new Set(categories);
    return buildSeriesByBucket({
      transactions: reports.transactions,
      period,
      groups: categories,
      getGroupKey: (transaction) => {
        const category = resolveCategoryLabel(transaction.provider, catalog.providers);
        return categorySet.has(category) ? category : null;
      },
      getValue: (transaction) => (view === 'volume' ? transaction.amount : 1),
    });
  }, [catalog.providers, categories, period, reports.transactions, view]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      height: 350,
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
    },
    colors: COLORS,
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '56%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },
    xaxis: {
      categories: chart.categories,
    },
    yaxis: {
      title: { text: view === 'volume' ? 'Transaction Volume' : 'Transactions' },
      labels: {
        formatter: (value: number) => (view === 'volume' ? formatCurrencyCompact(value) : value.toLocaleString('en-GH')),
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => (view === 'volume' ? `GH₵${value.toLocaleString('en-GH', { maximumFractionDigits: 2 })}` : `${value.toLocaleString('en-GH')} transactions`),
      },
    },
    fill: { opacity: 1 },
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
          <Card.Title className="mb-0">Bill Payment Trends</Card.Title>
          <small className="text-muted">Volume by ExpressPay bill category</small>
        </div>
        <div className="ms-auto d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="light" className="cursor-pointer">
              {view === 'volume' ? 'Volume (GH₵)' : 'Count'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={view === 'volume'} onClick={() => setView('volume')}>Volume (GH₵)</Dropdown.Item>
              <Dropdown.Item active={view === 'count'} onClick={() => setView('count')}>Count</Dropdown.Item>
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
        {reports.loading && reports.transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading bill payment trends...
          </div>
        ) : reports.error || catalog.error ? (
          <Alert variant="danger" className="mb-0">{reports.error || catalog.error}</Alert>
        ) : categories.length === 0 ? (
          <div className="py-5 text-center text-muted">No bill payment activity is available for the selected filters.</div>
        ) : (
          <>
            {reports.transactionsTruncated ? (
              <div className="text-muted small mb-3">Chart is based on the newest 1,000 bill payment transactions returned for this filter.</div>
            ) : null}
            <ReactApexChart options={options} series={chart.series} type="bar" height={350} className="apex-charts" />
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default BillPaymentTrendsChart;

