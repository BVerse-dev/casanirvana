"use client";

import React, { useMemo } from 'react';
import { Alert, Card, Spinner } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { usePersonalHubReports } from '@/hooks/usePersonalHubReports';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const COLORS = ['#727cf5', '#fa5c7c', '#0acf97', '#ffbc00', '#39afd1', '#6c757d'];
const CHART_LIMIT = 1000;

const TransferCorridorChart = () => {
  const { transactions, loading, error } = usePersonalHubReports({
    period: '30',
    serviceTypes: ['money_transfer'],
    limit: CHART_LIMIT,
  });

  const providerRows = useMemo(() => {
    const map = new Map<string, { count: number; amount: number; completed: number }>();

    for (const transaction of transactions) {
      const provider = transaction.provider?.trim() || 'Unassigned';
      const current = map.get(provider) || { count: 0, amount: 0, completed: 0 };
      current.count += 1;
      current.amount += transaction.amount;
      if (transaction.status === 'completed') {
        current.completed += 1;
      }
      map.set(provider, current);
    }

    return Array.from(map.entries())
      .sort((left, right) => right[1].amount - left[1].amount)
      .slice(0, 6)
      .map(([provider, stats]) => ({
        provider,
        count: stats.count,
        amount: stats.amount,
        successRate: stats.count > 0 ? (stats.completed / stats.count) * 100 : 0,
      }));
  }, [transactions]);

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
    labels: providerRows.map((row) => row.provider),
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
              label: 'Transfers',
              formatter: () => transactions.length.toLocaleString('en-GH'),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toLocaleString('en-GH')} transfers`,
      },
    },
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">Transfer Rail Mix</Card.Title>
      </Card.Header>
      <Card.Body>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading transfer rail mix...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : providerRows.length === 0 ? (
          <div className="py-5 text-center text-muted">No transfer-rail activity is available yet.</div>
        ) : (
          <>
            <div className="text-center mb-3">
              <p className="text-muted mb-1">Distribution of transfer volume by synced provider rail</p>
            </div>
            <ReactApexChart options={options} series={providerRows.map((row) => row.count)} type="donut" height={320} className="apex-charts" />
            <div className="mt-3">
              <h5 className="font-14 mb-2">Top Rails by Volume</h5>
              <div className="table-responsive">
                <table className="table table-sm table-centered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Provider</th>
                      <th>Volume</th>
                      <th>Success</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerRows.slice(0, 5).map((item, idx) => (
                      <tr key={item.provider}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="me-2"
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: COLORS[idx % COLORS.length],
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

export default TransferCorridorChart;

