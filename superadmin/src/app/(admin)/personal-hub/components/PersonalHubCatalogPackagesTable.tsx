"use client";

import React, { useMemo, useState } from 'react';
import { Badge, Button, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useAdminPersonalHubCatalogPackages } from '@/hooks/useAdminPersonalHubCatalog';

const formatSyncTime = (value: string | null) => {
  if (!value) {
    return 'Not synced';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const formatAmount = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return 'Variable';
  }

  return `GH₵${value.toLocaleString()}`;
};

const PersonalHubCatalogPackagesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { packages, loading, error } = useAdminPersonalHubCatalogPackages({
    serviceType: 'data',
  });

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        pkg.package_name.toLowerCase().includes(normalizedSearch) ||
        (pkg.provider_name || '').toLowerCase().includes(normalizedSearch) ||
        (pkg.package_code || '').toLowerCase().includes(normalizedSearch);

      const isLive = pkg.is_active && pkg.is_enabled_for_app && pkg.provider_enabled_for_app;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? isLive : !isLive);

      return matchesSearch && matchesStatus;
    });
  }, [packages, searchTerm, statusFilter]);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <InputGroup style={{ maxWidth: 320 }}>
          <Form.Control
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button variant="outline-secondary">
            <IconifyIcon icon="ri:search-line" />
          </Button>
        </InputGroup>

        <Form.Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
          style={{ maxWidth: 190 }}
        >
          <option value="all">All package states</option>
          <option value="active">Live in app</option>
          <option value="inactive">Inactive or disabled</option>
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredPackages.length === 0 ? (
        <div className="alert alert-light border">
          No cached data packages are available yet. Data package rows appear after ExpressPay query responses are cached for the enabled providers.
        </div>
      ) : (
        <div className="table-responsive">
          <Table className="table-centered table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Package</th>
                <th>Provider</th>
                <th>Package Code</th>
                <th>Data Amount</th>
                <th>Price</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((pkg) => {
                const isLive = pkg.is_active && pkg.is_enabled_for_app && pkg.provider_enabled_for_app;

                return (
                  <tr key={pkg.id}>
                    <td>
                      <div className="fw-semibold">{pkg.package_name}</div>
                      {pkg.description ? <div className="text-muted small">{pkg.description}</div> : null}
                    </td>
                    <td>
                      <div className="fw-semibold">{pkg.provider_name || 'Unknown provider'}</div>
                      <div className="text-muted small">
                        <code>{pkg.provider_external_service_code || 'n/a'}</code>
                      </div>
                    </td>
                    <td>
                      <code>{pkg.package_code || 'n/a'}</code>
                    </td>
                    <td>{pkg.data_amount || 'n/a'}</td>
                    <td>{formatAmount(pkg.denomination)}</td>
                    <td>{pkg.validity_days ? `${pkg.validity_days} days` : 'n/a'}</td>
                    <td>
                      <Badge bg={isLive ? 'success' : 'secondary'}>
                        {isLive ? 'Live in app' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="text-muted small">{formatSyncTime(pkg.last_synced_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default PersonalHubCatalogPackagesTable;
