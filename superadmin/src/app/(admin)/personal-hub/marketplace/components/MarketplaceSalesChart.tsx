'use client';

import { useMemo, useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import type { ApexOptions } from 'apexcharts';

import type { MarketplaceOrderView } from '@/hooks/useMarketplaceWorkspace';
import ReactApexChart from '@/components/wrappers/ReactApexChart';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface MarketplaceSalesChartProps {
  orders: MarketplaceOrderView[];
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';
type ChartView = 'revenue' | 'orders';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', notation: value >= 1000 ? 'compact' : 'standard' }).format(value || 0);

const getWeekStart = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const MarketplaceSalesChart = ({ orders }: MarketplaceSalesChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartView, setChartView] = useState<ChartView>('revenue');

  const seriesData = useMemo(() => {
    const now = new Date();
    const buckets: Array<{ key: string; label: string; revenue: number; orders: number }> = [];

    if (timeRange === 'week') {
      for (let offset = 6; offset >= 0; offset -= 1) {
        const day = new Date(now);
        day.setDate(now.getDate() - offset);
        const label = day.toLocaleDateString('en-GH', { weekday: 'short' });
        buckets.push({ key: day.toISOString().slice(0, 10), label, revenue: 0, orders: 0 });
      }
    } else if (timeRange === 'month') {
      for (let offset = 3; offset >= 0; offset -= 1) {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setDate(1 + (7 * (3 - offset)));
        const label = `Week ${4 - offset}`;
        buckets.push({ key: String(4 - offset), label, revenue: 0, orders: 0 });
      }
    } else if (timeRange === 'quarter') {
      for (let offset = 2; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        buckets.push({ key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString('en-GH', { month: 'short' }), revenue: 0, orders: 0 });
      }
    } else {
      for (let offset = 3; offset >= 0; offset -= 1) {
        const quarter = 4 - offset;
        buckets.push({ key: `Q${quarter}`, label: `Q${quarter}`, revenue: 0, orders: 0 });
      }
    }

    orders.forEach((order) => {
      if (!order.created_at) {
        return;
      }

      const createdAt = new Date(order.created_at);
      const amount = Number(order.final_amount || order.total_amount || 0);

      if (timeRange === 'week') {
        const key = createdAt.toISOString().slice(0, 10);
        const bucket = buckets.find((candidate) => candidate.key === key);
        if (bucket) {
          bucket.revenue += amount;
          bucket.orders += 1;
        }
        return;
      }

      if (timeRange === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (createdAt.getMonth() !== monthStart.getMonth() || createdAt.getFullYear() !== monthStart.getFullYear()) {
          return;
        }
        const weekIndex = Math.min(3, Math.floor((createdAt.getDate() - 1) / 7));
        const bucket = buckets[weekIndex];
        bucket.revenue += amount;
        bucket.orders += 1;
        return;
      }

      if (timeRange === 'quarter') {
        const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
        const bucket = buckets.find((candidate) => candidate.key === key);
        if (bucket) {
          bucket.revenue += amount;
          bucket.orders += 1;
        }
        return;
      }

      const quarter = Math.floor(createdAt.getMonth() / 3) + 1;
      const bucket = buckets.find((candidate) => candidate.key === `Q${quarter}` && createdAt.getFullYear() === now.getFullYear());
      if (bucket) {
        bucket.revenue += amount;
        bucket.orders += 1;
      }
    });

    return buckets;
  }, [orders, timeRange]);

  const totals = useMemo(() => ({
    revenue: seriesData.reduce((sum, entry) => sum + entry.revenue, 0),
    orders: seriesData.reduce((sum, entry) => sum + entry.orders, 0),
  }), [seriesData]);

  const options = useMemo<ApexOptions>(() => ({
    chart: {
      height: 350,
      type: chartView === 'revenue' ? 'area' : 'bar',
      toolbar: { show: false },
    },
    colors: [chartView === 'revenue' ? '#f16e2b' : '#1abc9c'],
    dataLabels: { enabled: false },
    stroke: { width: 3, curve: 'smooth' },
    fill: chartView === 'revenue' ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    } : undefined,
    xaxis: { categories: seriesData.map((entry) => entry.label) },
    yaxis: {
      title: { text: chartView === 'revenue' ? 'GMV (GHS)' : 'Orders' },
      labels: {
        formatter: (value: number) => chartView === 'revenue' ? formatCurrency(value) : `${Math.round(value)}`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => chartView === 'revenue' ? formatCurrency(value) : `${Math.round(value)} orders`,
      },
    },
    grid: { borderColor: '#f1f3fa' },
  }), [chartView, seriesData]);

  const chartSeries = useMemo(() => ([{
    name: chartView === 'revenue' ? 'GMV' : 'Orders',
    data: seriesData.map((entry) => chartView === 'revenue' ? Number(entry.revenue.toFixed(2)) : entry.orders),
  }]), [chartView, seriesData]);

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex align-items-center">
        <div>
          <Card.Title className="mb-0">Marketplace Performance</Card.Title>
          <small className="text-muted">Live order volume and gross merchandise value</small>
        </div>
        <div className="ms-auto d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="light">
              {chartView === 'revenue' ? 'GMV' : 'Orders'} <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={chartView === 'revenue'} onClick={() => setChartView('revenue')}>GMV</Dropdown.Item>
              <Dropdown.Item active={chartView === 'orders'} onClick={() => setChartView('orders')}>Orders</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle variant="light">
              {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : timeRange === 'quarter' ? 'This Quarter' : 'This Year'}
              <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={timeRange === 'week'} onClick={() => setTimeRange('week')}>This Week</Dropdown.Item>
              <Dropdown.Item active={timeRange === 'month'} onClick={() => setTimeRange('month')}>This Month</Dropdown.Item>
              <Dropdown.Item active={timeRange === 'quarter'} onClick={() => setTimeRange('quarter')}>This Quarter</Dropdown.Item>
              <Dropdown.Item active={timeRange === 'year'} onClick={() => setTimeRange('year')}>This Year</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Gross merchandise value</div>
              <div className="fs-3 fw-semibold">{formatCurrency(totals.revenue)}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border rounded p-3 h-100">
              <div className="text-muted small">Order volume</div>
              <div className="fs-3 fw-semibold">{totals.orders.toLocaleString()}</div>
            </div>
          </div>
        </div>
        {seriesData.every((entry) => entry.orders === 0 && entry.revenue === 0) ? (
          <div className="text-center py-5 text-muted">No marketplace order activity is available for the selected period.</div>
        ) : (
          <ReactApexChart options={options} series={chartSeries} type={chartView === 'revenue' ? 'area' : 'bar'} height={350} className="apex-charts" />
        )}
      </Card.Body>
    </Card>
  );
};

export default MarketplaceSalesChart;
