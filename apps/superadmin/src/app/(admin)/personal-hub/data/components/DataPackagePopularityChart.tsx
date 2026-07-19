"use client";

import React, { useMemo } from 'react';
import { Alert, Card, CardBody, CardHeader, CardTitle, Spinner, Table } from 'react-bootstrap';
import { ApexOptions } from 'apexcharts';

import { useAdminPersonalHubCatalogPackages } from '@/hooks/useAdminPersonalHubCatalog';
import ReactApexChart from '@/components/wrappers/ReactApexChart';

const COLORS = ['#0acf97', '#727cf5', '#fa5c7c', '#ffbc00', '#39afd1', '#6c757d'];

const DataPackagePopularityChart = () => {
  const { packages, loading, error } = useAdminPersonalHubCatalogPackages({ serviceType: 'data' });

  const livePackages = useMemo(
    () => packages.filter((pkg) => pkg.is_active && pkg.is_enabled_for_app && pkg.provider_enabled_for_app),
    [packages]
  );

  const catalogScope = livePackages.length > 0 ? livePackages : packages;

  const providerRows = useMemo(() => {
    const map = new Map<string, { count: number; minimumPrice: number | null }>();

    for (const item of catalogScope) {
      const provider = item.provider_name || 'Unknown provider';
      const current = map.get(provider) || { count: 0, minimumPrice: null };
      current.count += 1;
      if (typeof item.denomination === 'number') {
        current.minimumPrice = current.minimumPrice === null ? item.denomination : Math.min(current.minimumPrice, item.denomination);
      }
      map.set(provider, current);
    }

    return Array.from(map.entries())
      .sort((left, right) => right[1].count - left[1].count)
      .slice(0, 6)
      .map(([provider, stats]) => ({
        provider,
        packageCount: stats.count,
        minimumPrice: stats.minimumPrice,
      }));
  }, [catalogScope]);

  const series = providerRows.map((row) => row.packageCount);
  const labels = providerRows.map((row) => row.provider);

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
    labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 240 },
          legend: { show: false },
        },
      },
    ],
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
              label: 'Packages',
              formatter: () => catalogScope.length.toLocaleString('en-GH'),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toLocaleString('en-GH')} packages`,
      },
    },
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle className="mb-0">Package Availability</CardTitle>
      </CardHeader>
      <CardBody>
        {loading && packages.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading cached data packages...
          </div>
        ) : error ? (
          <Alert variant="danger" className="mb-0">{error}</Alert>
        ) : providerRows.length === 0 ? (
          <div className="py-5 text-center text-muted">No cached data package catalog is available yet.</div>
        ) : (
          <>
            <div className="text-center mb-3">
              <p className="text-muted mb-1">
                Distribution of {livePackages.length > 0 ? 'live in-app' : 'cached'} ExpressPay data packages by provider
              </p>
            </div>
            <ReactApexChart options={options} series={series} type="donut" height={320} className="apex-charts" />
            <div className="table-responsive mt-3">
              <Table className="table-sm table-centered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Provider</th>
                    <th>Packages</th>
                    <th>Lowest Price</th>
                  </tr>
                </thead>
                <tbody>
                  {providerRows.map((row) => (
                    <tr key={row.provider}>
                      <td>{row.provider}</td>
                      <td>{row.packageCount.toLocaleString('en-GH')}</td>
                      <td>{row.minimumPrice === null ? 'Variable' : `GH₵${row.minimumPrice.toLocaleString('en-GH')}`}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="text-center mt-3">
              <div className="row">
                <div className="col-6">
                  <h4 className="fw-semibold mb-0">{packages.length.toLocaleString('en-GH')}</h4>
                  <p className="text-muted mb-0">Cached Packages</p>
                </div>
                <div className="col-6">
                  <h4 className="fw-semibold mb-0">{livePackages.length.toLocaleString('en-GH')}</h4>
                  <p className="text-muted mb-0">Live in App</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default DataPackagePopularityChart;

