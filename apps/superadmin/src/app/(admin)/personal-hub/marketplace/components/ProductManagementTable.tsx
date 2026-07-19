'use client';

import { useMemo, useState } from 'react';
import { Badge, Dropdown, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import type { MarketplaceProductView } from '@/hooks/useMarketplaceWorkspace';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface ProductManagementTableProps {
  products: MarketplaceProductView[];
  loading?: boolean;
  showFilters?: boolean;
  limit?: number;
  sortBy?: 'sales' | 'recent';
  onEdit: (product: MarketplaceProductView) => void;
  onToggleActive: (product: MarketplaceProductView) => void;
  onToggleFeatured: (product: MarketplaceProductView) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);

const ProductManagementTable = ({
  products,
  loading = false,
  showFilters = false,
  limit,
  sortBy = 'recent',
  onEdit,
  onToggleActive,
  onToggleFeatured,
}: ProductManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category_name).filter(Boolean))) as string[], [products]);

  const displayProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = [product.name, product.vendor_name || '', product.category_name || '', product.sku || '']
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? Boolean(product.is_active)
          : !product.is_active;
      const matchesCategory = categoryFilter === 'all' || product.category_name === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    const sorted = [...filtered].sort((left, right) => {
      if (sortBy === 'sales') {
        const salesDelta = (right.sales_count || 0) - (left.sales_count || 0);
        if (salesDelta !== 0) {
          return salesDelta;
        }
      }
      return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
    });

    return limit ? sorted.slice(0, limit) : sorted;
  }, [categoryFilter, limit, products, searchTerm, sortBy, statusFilter]);

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
              <Form.Control placeholder="Search products..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </InputGroup>
          </div>
          <Form.Select style={{ width: 'auto' }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
          <Form.Select style={{ width: 'auto' }} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </Form.Select>
        </div>
      ) : null}

      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="fw-semibold">{product.name}</div>
                  <div className="text-muted small">{product.sku || 'No SKU'}{product.country_of_origin ? ` • ${product.country_of_origin}` : ''}</div>
                </td>
                <td>{product.vendor_name || 'Unassigned'}</td>
                <td>{product.category_name || 'Unassigned'}</td>
                <td>
                  <div>{formatCurrency(product.price || 0)}</div>
                  {product.original_price ? <div className="text-muted small">Base {formatCurrency(product.original_price)}</div> : null}
                </td>
                <td>{product.stock_quantity ?? 0}</td>
                <td>{product.sales_count ?? 0}</td>
                <td><Badge bg={product.is_active ? 'success' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge></td>
                <td><Badge bg={product.is_featured ? 'warning' : 'light'} text={product.is_featured ? undefined : 'dark'}>{product.is_featured ? 'Featured' : 'Standard'}</Badge></td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm"><IconifyIcon icon="ri:more-2-fill" /></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => onEdit(product)}>
                        <IconifyIcon icon="ri:edit-line" className="me-1" /> Edit Product
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => onToggleFeatured(product)}>
                        <IconifyIcon icon={product.is_featured ? 'ri:star-off-line' : 'ri:star-line'} className="me-1" />
                        {product.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => onToggleActive(product)}>
                        <IconifyIcon icon={product.is_active ? 'ri:pause-line' : 'ri:play-line'} className="me-1" />
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
            {displayProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-muted">No marketplace products found.</td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ProductManagementTable;
