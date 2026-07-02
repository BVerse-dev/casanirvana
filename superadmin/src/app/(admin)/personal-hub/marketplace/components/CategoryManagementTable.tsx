'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Dropdown, Form, InputGroup, Spinner, Table } from 'react-bootstrap';

import type { MarketplaceCategoryView } from '@/hooks/useMarketplaceWorkspace';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface CategoryManagementTableProps {
  categories: MarketplaceCategoryView[];
  loading?: boolean;
  showFilters?: boolean;
  onEdit: (category: MarketplaceCategoryView) => void;
  onToggleActive: (category: MarketplaceCategoryView) => void;
}

const CategoryManagementTable = ({ categories, loading = false, showFilters = false, onEdit, onToggleActive }: CategoryManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCategories = useMemo(() => categories.filter((category) => {
    const matchesSearch = [category.name, category.description || '', category.category_type || '', category.icon_name || '']
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? Boolean(category.is_active)
        : !category.is_active;
    return matchesSearch && matchesStatus;
  }), [categories, searchTerm, statusFilter]);

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
              <Form.Control placeholder="Search categories..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
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
              <th>Category</th>
              <th>Type</th>
              <th>Products</th>
              <th>Display Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div>
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      {category.icon_name ? <IconifyIcon icon={category.icon_name} /> : null}
                      <span>{category.name}</span>
                    </div>
                    <div className="text-muted small">{category.description || 'No description provided.'}</div>
                  </div>
                </td>
                <td><Badge bg="light" text="dark">{category.category_type || 'local'}</Badge></td>
                <td>{category.product_count}</td>
                <td>{category.display_order || 0}</td>
                <td>
                  <Badge bg={category.is_active ? 'success' : 'secondary'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm"><IconifyIcon icon="ri:more-2-fill" /></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => onEdit(category)}>
                        <IconifyIcon icon="ri:edit-line" className="me-1" /> Edit Category
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => onToggleActive(category)}>
                        <IconifyIcon icon={category.is_active ? 'ri:pause-line' : 'ri:play-line'} className="me-1" />
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">No marketplace categories found.</td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CategoryManagementTable;
