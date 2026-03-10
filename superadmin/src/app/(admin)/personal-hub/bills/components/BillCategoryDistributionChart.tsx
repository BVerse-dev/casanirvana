"use client";

import React, { useMemo } from 'react';
import { Alert, Card, Spinner } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { AdminPersonalHubCatalogProvider, useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';
import { usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

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

const BillCategoryDistributionChart = () => {
  const reports = usePersonalHubReports({ period: '30', serviceTypes: ['bill_payment'], limit: CHART_LIMIT });
  const catalog = useAdminPersonalHubCatalog({ serviceType: 'bill_payment' });

  const categoryRows = useMemo(() => {
    const totals = new Map<string, number>();
    for (const transaction of reports.transactions) {
      const category = resolveCategoryLabel(transaction.provider, catalog.providers);
      totals.set(category, (totals.get(category) || 0) + 1);
    }

    return Array.from(totals.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([category, count]) => ({ category, count }));
  }, [catalog.providers, reports.transactions]);

  const topBillers = useMemo(() => {
    const billers = new Map<string, { amount: number; total: number; completed: number }>();

    for (const transaction of reports.transactions) {
      const provider = transaction.provider?.trim() || 'Unassigned';
      const current = billers.get(provider) || { amount: 0, total: 0, completed: 0 };
      current.amount += transaction.amount;
      current.total += 1;
      if (transaction.status === 'completed') {
        current.completed += 1;
      }
      billers.set(provider, current);
    }

    return Array.from(billers.entries())
      .sort((left, right) => right[1].amount - left[1].amount)
      .slice(0, 5)
      .map(([provider, stats]) => ({
        provider,
        amount: stats.amount,
        successRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      }));
  }, [reports.transactions]);

  const options: ApexOptions = {
    chart: { height: 320, type: 'donut' },
    colors: COLORS,
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      offsetY: 7,
    },
    dataLabels: { enabled: false },
    labels: categoryRows.map((row) => row.category),
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true },
            value: {
              show: true,
              formatter: (value) => Number(value).toLocaleString('en-GH'),
            },
            total: {
              show: true,
              label: 'Transactions',
              formatter: () => reports.transactions.length.toLocaleString('en-GH'),
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
      <Card.Header>
        <Card.Title className="mb-0">Bill Category Mix</Card.Title>
      </Card.Header>
      <Card.Body>
        {reports.loading && reports.transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading bill category mix...
          </div>
        ) : reports.error || catalog.error ? (
          <Alert variant="danger" className="mb-0">{reports.error || catalog.error}</Alert>
        ) : categoryRows.length === 0 ? (
          <div className="py-5 text-center text-muted">No bill-payment category mix is available yet.</div>
        ) : (
          <>
            <div className="text-center mb-3">
              <p className="text-muted mb-1">Distribution of bill-payment transactions by synced ExpressPay category</p>
            </div>
            <ReactApexChart options={options} series={categoryRows.map((row) => row.count)} type="donut" height={320} className="apex-charts" />
            <div className="mt-3">
              <h5 className="font-14 mb-2">Top Billers by Volume</h5>
              <div className="table-responsive">
                <table className="table table-sm table-centered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Biller</th>
                      <th>Volume</th>
                      <th>Success</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBillers.map((item, index) => (
                      <tr key={item.provider}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="me-2"
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></div>
                            {item.provider}
                          </div>
                        </td>
                        <td>{`GH₵${item.amount.toLocaleString('en-GH', { maximumFractionDigits: 2 })}`}</td>
                        <td className={item.successRate >= 90 ? 'text-success' : item.successRate >= 75 ? 'text-warning' : 'text-danger'}>
                          {item.successRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default BillCategoryDistributionChart;

