"use client";

import React, { useMemo, useState } from 'react';
import { Badge, Button, Dropdown, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { AdminPersonalHubCatalogProvider, useAdminPersonalHubCatalog } from '@/hooks/useAdminPersonalHubCatalog';

type PersonalHubCatalogProvidersTableProps = {
  serviceType: string;
  billCategory?: string;
  entityLabel: string;
  includeCategoryColumn?: boolean;
  emptyMessage: string;
};

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

const PersonalHubCatalogProvidersTable = ({
  serviceType,
  billCategory,
  entityLabel,
  includeCategoryColumn = false,
  emptyMessage,
}: PersonalHubCatalogProvidersTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'danger'; message: string } | null>(null);
  const { providers, loading, error, updateProvider, isUpdatingProvider } = useAdminPersonalHubCatalog({
    serviceType,
    billCategory,
  });

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        provider.provider_name.toLowerCase().includes(normalizedSearch) ||
        (provider.external_service_code || '').toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'enabled' ? provider.is_enabled_for_app : !provider.is_enabled_for_app);

      return matchesSearch && matchesStatus;
    });
  }, [providers, searchTerm, statusFilter]);

  const toggleProvider = async (provider: AdminPersonalHubCatalogProvider) => {
    try {
      const enabled = !provider.is_enabled_for_app;
      await updateProvider({
        providerId: provider.id,
        updates: {
          is_enabled_for_app: enabled,
        },
      });
      setFeedback({
        variant: 'success',
        message: `${provider.provider_name} ${enabled ? 'enabled' : 'disabled'} for app use.`,
      });
    } catch (updateError) {
      setFeedback({
        variant: 'danger',
        message: updateError instanceof Error ? updateError.message : `Failed to update ${provider.provider_name}.`,
      });
    }
  };

  return (
    <>
      {feedback ? <div className={`alert alert-${feedback.variant}`}>{feedback.message}</div> : null}

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <InputGroup style={{ maxWidth: 320 }}>
          <Form.Control
            placeholder={`Search ${entityLabel.toLowerCase()}s...`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button variant="outline-secondary">
            <IconifyIcon icon="ri:search-line" />
          </Button>
        </InputGroup>

        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary">
            {statusFilter === 'all' ? 'All app statuses' : statusFilter === 'enabled' ? 'Enabled in app' : 'Disabled in app'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setStatusFilter('all')}>All app statuses</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter('enabled')}>Enabled in app</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter('disabled')}>Disabled in app</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredProviders.length === 0 ? (
        <div className="alert alert-light border">{emptyMessage}</div>
      ) : (
        <div className="table-responsive">
          <Table className="table-centered table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>{entityLabel}</th>
                <th>Service Code</th>
                {includeCategoryColumn ? <th>Category</th> : null}
                <th>Capabilities</th>
                <th>Catalog Status</th>
                <th>App Status</th>
                <th>Last Sync</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => (
                <tr key={provider.id}>
                  <td>
                    <div className="fw-semibold">{provider.provider_name}</div>
                    <div className="text-muted small">{provider.service_type.replaceAll('_', ' ')}</div>
                  </td>
                  <td>
                    <code>{provider.external_service_code || 'n/a'}</code>
                  </td>
                  {includeCategoryColumn ? (
                    <td>
                      <Badge bg="light" text="dark">
                        {(provider.bill_category || 'general').replaceAll('_', ' ')}
                      </Badge>
                    </td>
                  ) : null}
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      <Badge bg={provider.supports_query ? 'info' : 'secondary'}>Query</Badge>
                      <Badge bg={provider.supports_pay ? 'success' : 'secondary'}>Pay</Badge>
                      <Badge bg={provider.supports_status ? 'primary' : 'secondary'}>Status</Badge>
                    </div>
                  </td>
                  <td>
                    <Badge bg={provider.is_active ? 'success' : 'secondary'}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={provider.is_enabled_for_app ? 'success' : 'warning'}>
                      {provider.is_enabled_for_app ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="text-muted small">{formatSyncTime(provider.last_synced_at)}</td>
                  <td className="text-end">
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                        <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => void toggleProvider(provider)} disabled={isUpdatingProvider}>
                          <IconifyIcon
                            icon={provider.is_enabled_for_app ? 'ri:close-circle-line' : 'ri:check-line'}
                            className="me-2"
                          />
                          {provider.is_enabled_for_app ? 'Disable in App' : 'Enable in App'}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default PersonalHubCatalogProvidersTable;
