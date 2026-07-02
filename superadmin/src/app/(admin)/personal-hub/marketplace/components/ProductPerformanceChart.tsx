'use client';

import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import type { ApexOptions } from 'apexcharts';

import type { MarketplaceProductView } from '@/hooks/useMarketplaceWorkspace';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

interface ProductPerformanceChartProps {
  products: MarketplaceProductView[];
}

const ProductPerformanceChart = ({ products }: ProductPerformanceChartProps) => {
  const categorySeries = useMemo(() => {
    const totals = new Map<string, number>();
    const useSalesCount = products.some((product) => (product.sales_count || 0) > 0);

    products.forEach((product) => {
      const key = product.category_name || 'Unassigned';
      const value = useSalesCount ? (product.sales_count || 0) : 1;
      totals.set(key, (totals.get(key) || 0) + value);
    });

    const entries = Array.from(totals.entries()).sort((left, right) => right[1] - left[1]);
    return {
      labels: entries.map(([label]) => label),
      series: entries.map(([, value]) => value),
      usesSalesCount: useSalesCount,
    };
  }, [products]);

  const topProducts = useMemo(() => [...products]
    .sort((left, right) => {
      const salesDelta = (right.sales_count || 0) - (left.sales_count || 0);
      if (salesDelta !== 0) {
        return salesDelta;
      }
      return (right.review_count || 0) - (left.review_count || 0);
    })
    .slice(0, 5), [products]);

  const options = useMemo<ApexOptions>(() => ({
    chart: { height: 320, type: 'donut' },
    labels: categorySeries.labels,
    colors: ['#f16e2b', '#1abc9c', '#3b82f6', '#f59e0b', '#6f42c1'],
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      offsetY: 8,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: categorySeries.usesSalesCount ? 'Units' : 'Products',
              formatter: () => String(categorySeries.series.reduce((sum, value) => sum + value, 0)),
            },
          },
        },
      },
    },
    responsive: [{
      breakpoint: 600,
      options: { chart: { height: 240 }, legend: { show: false } },
    }],
  }), [categorySeries.labels, categorySeries.series, categorySeries.usesSalesCount]);

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">Category Mix</Card.Title>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-3">
          {categorySeries.usesSalesCount ? 'Distribution by recorded product sales counts.' : 'Distribution by active catalog size. Recorded sales are not populated yet.'}
        </p>
        {categorySeries.series.length === 0 ? (
          <div className="text-center py-5 text-muted">No marketplace products are available yet.</div>
        ) : (
          <ReactApexChart options={options} series={categorySeries.series} type="donut" height={320} className="apex-charts" />
        )}

        <div className="mt-3">
          <h5 className="font-14 mb-2">Top Products</h5>
          <div className="table-responsive">
            <table className="table table-sm table-centered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th>Reviews</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category_name || 'Unassigned'}</td>
                    <td>{product.sales_count || 0}</td>
                    <td>{product.review_count || 0}</td>
                  </tr>
                ))}
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-3 text-muted">No product performance data is available.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductPerformanceChart;
