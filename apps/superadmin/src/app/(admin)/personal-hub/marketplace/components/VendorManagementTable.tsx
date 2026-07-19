'use client';

import { useMemo, useState } from 'react';
import { Badge, Dropdown, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import type { MarketplaceVendorView } from '@/hooks/useMarketplaceWorkspace';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface VendorManagementTableProps {
  vendors: MarketplaceVendorView[];
  loading?: boolean;
  showFilters?: boolean;
  onEdit: (vendor: MarketplaceVendorView) => void;
  onToggleActive: (vendor: MarketplaceVendorView) => void;
  onToggleVerified: (vendor: MarketplaceVendorView) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(value || 0);

const VendorManagementTable = ({ vendors, loading = false, showFilters = false, onEdit, onToggleActive, onToggleVerified }: VendorManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredVendors = useMemo(() => vendors.filter((vendor) => {
    const matchesSearch = [vendor.store_name, vendor.owner_name || '', vendor.email || '', vendor.phone || '']
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? Boolean(vendor.is_active)
        : !vendor.is_active;
    return matchesSearch && matchesStatus;
  }), [searchTerm, statusFilter, vendors]);

  if (loading) {
    return <div className="py-4 text-center"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      {showFilters ? (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text><IconifyIcon icon="ri:search-line" /></InputGroup.Text>
              <Form.Control placeholder="Search vendors..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </InputGroup>
          </div>
          <Form.Select style={{ width: 'auto' }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </div>
      ) : null}

      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Owner</th>
              <th>Products</th>
              <th>Rating</th>
              <th>GMV</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <div className="fw-semibold">{vendor.store_name}</div>
                  <div className="text-muted small">{vendor.email || vendor.phone || 'No contact details'}</div>
                </td>
                <td>{vendor.owner_name || 'Unassigned'}</td>
                <td>{vendor.product_count}</td>
                <td>{Number(vendor.rating || 0).toFixed(1)} <span className="text-muted">({vendor.review_count || 0})</span></td>
                <td>{formatCurrency(vendor.gross_merchandise_value)}</td>
                <td><Badge bg={vendor.is_verified ? 'info' : 'light'} text={vendor.is_verified ? undefined : 'dark'}>{vendor.is_verified ? 'Verified' : 'Unverified'}</Badge></td>
                <td><Badge bg={vendor.is_active ? 'success' : 'secondary'}>{vendor.is_active ? 'Active' : 'Inactive'}</Badge></td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm"><IconifyIcon icon="ri:more-2-fill" /></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => onEdit(vendor)}>
                        <IconifyIcon icon="ri:edit-line" className="me-1" /> Edit Vendor
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => onToggleVerified(vendor)}>
                        <IconifyIcon icon={vendor.is_verified ? 'ri:verified-badge-line' : 'ri:shield-check-line'} className="me-1" />
                        {vendor.is_verified ? 'Remove Verification' : 'Verify Vendor'}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => onToggleActive(vendor)}>
                        <IconifyIcon icon={vendor.is_active ? 'ri:pause-line' : 'ri:play-line'} className="me-1" />
                        {vendor.is_active ? 'Deactivate' : 'Activate'}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted">No marketplace vendors found.</td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VendorManagementTable;
