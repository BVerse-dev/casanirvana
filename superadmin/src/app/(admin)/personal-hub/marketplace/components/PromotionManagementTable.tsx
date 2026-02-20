"use client";

import React, { useState } from 'react';
import { Table, Form, InputGroup, Button, Badge, Dropdown, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface PromotionManagementTableProps {
  showFilters?: boolean;
}

// Promotion status types and their corresponding styles
const PROMOTION_STATUS = {
  active: { variant: 'success', icon: 'ri:check-double-line' },
  scheduled: { variant: 'info', icon: 'ri:calendar-event-line' },
  expired: { variant: 'secondary', icon: 'ri:time-line' },
  draft: { variant: 'warning', icon: 'ri:draft-line' },
};

type PromotionStatusType = keyof typeof PROMOTION_STATUS;

// Promotion types and their corresponding styles
const PROMOTION_TYPES = {
  discount: { variant: 'primary', icon: 'ri:percent-line' },
  bundle: { variant: 'warning', icon: 'ri:stack-line' },
  freeShipping: { variant: 'success', icon: 'ri:truck-line' },
  bogo: { variant: 'danger', icon: 'ri:gift-2-line' },
  flash: { variant: 'info', icon: 'ri:flashlight-line' },
};

type PromotionTypeType = keyof typeof PROMOTION_TYPES;

interface Promotion {
  id: string;
  name: string;
  type: PromotionTypeType;
  target: string; // 'Category', 'Product', 'Cart', etc.
  discount: string;
  startDate: string;
  endDate: string;
  usageCount: number;
  budget: number | null; // Budget allocated for promotion (null if unlimited)
  budgetUsed: number | null; // Amount used from budget
  status: PromotionStatusType;
}

const DEMO_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    name: 'Summer Sale 2023',
    type: 'discount',
    target: 'Category: Electronics',
    discount: '20% OFF',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    usageCount: 1245,
    budget: 10000,
    budgetUsed: 8750,
    status: 'active'
  },
  {
    id: '2',
    name: 'Back to School',
    type: 'bundle',
    target: 'Category: School Supplies',
    discount: 'Buy 3, Get 1 Free',
    startDate: '2023-08-15',
    endDate: '2023-09-30',
    usageCount: 567,
    budget: 5000,
    budgetUsed: 2200,
    status: 'active'
  },
  {
    id: '3',
    name: 'Free Shipping Weekend',
    type: 'freeShipping',
    target: 'Cart: Min $50',
    discount: 'Free Shipping',
    startDate: '2023-09-29',
    endDate: '2023-10-01',
    usageCount: 0,
    budget: null,
    budgetUsed: null,
    status: 'scheduled'
  },
  {
    id: '4',
    name: 'Holiday Special',
    type: 'bogo',
    target: 'Product: Smart Home Devices',
    discount: 'Buy 1, Get 1 50% OFF',
    startDate: '2023-12-01',
    endDate: '2023-12-25',
    usageCount: 0,
    budget: 8000,
    budgetUsed: 0,
    status: 'draft'
  },
  {
    id: '5',
    name: 'Flash Sale - Smartphones',
    type: 'flash',
    target: 'Category: Smartphones',
    discount: '30% OFF',
    startDate: '2023-07-15',
    endDate: '2023-07-16',
    usageCount: 842,
    budget: 5000,
    budgetUsed: 5000,
    status: 'expired'
  }
];

const PromotionManagementTable: React.FC<PromotionManagementTableProps> = ({ 
  showFilters = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Filter promotions based on search term, status, and type
  const filteredPromotions = DEMO_PROMOTIONS.filter(promo => {
    const matchesSearch = 
      promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.target.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    const matchesType = typeFilter === 'all' || promo.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateStatus = (promoId: string, newStatus: PromotionStatusType) => {
    // This would update the promotion status
    console.log(`Update promotion ${promoId} status to: ${newStatus}`);
  };

  const calculateBudgetPercentage = (used: number | null, total: number | null) => {
    if (used === null || total === null || total === 0) return 0;
    return (used / total) * 100;
  };

  return (
    <div>
      {showFilters && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text>
                <IconifyIcon icon="ri:search-line" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <Form.Select 
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="draft">Draft</option>
          </Form.Select>
          
          <Form.Select 
            style={{ width: 'auto' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="discount">Discount</option>
            <option value="bundle">Bundle</option>
            <option value="freeShipping">Free Shipping</option>
            <option value="bogo">BOGO</option>
            <option value="flash">Flash Sale</option>
          </Form.Select>
          
          <Button variant="outline-secondary">
            <IconifyIcon icon="ri:download-2-line" className="me-1" />
            Export
          </Button>
        </div>
      )}
      
      <div className="table-responsive">
        <Table className="table-centered mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Target</th>
              <th>Discount</th>
              <th>Period</th>
              <th>Usage</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map((promo) => (
              <tr key={promo.id}>
                <td>{promo.name}</td>
                <td>
                  <Badge bg={PROMOTION_TYPES[promo.type].variant} className="px-2 py-1">
                    <IconifyIcon icon={PROMOTION_TYPES[promo.type].icon} className="me-1" />
                    {promo.type === 'freeShipping' ? 'Free Shipping' : 
                     promo.type === 'bogo' ? 'BOGO' : 
                     promo.type.charAt(0).toUpperCase() + promo.type.slice(1)}
                  </Badge>
                </td>
                <td>{promo.target}</td>
                <td><strong>{promo.discount}</strong></td>
                <td>
                  <small>
                    {promo.startDate} to <br />
                    {promo.endDate}
                  </small>
                </td>
                <td>{promo.usageCount} uses</td>
                <td>
                  {promo.budget === null ? (
                    <span>Unlimited</span>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-1">
                        <small>${promo.budgetUsed}</small>
                        <small>${promo.budget}</small>
                      </div>
                      <ProgressBar 
                        now={calculateBudgetPercentage(promo.budgetUsed, promo.budget)} 
                        variant={
                          calculateBudgetPercentage(promo.budgetUsed, promo.budget) > 90 ? 'danger' : 
                          calculateBudgetPercentage(promo.budgetUsed, promo.budget) > 70 ? 'warning' : 'success'
                        }
                        style={{ height: '6px' }}
                      />
                    </>
                  )}
                </td>
                <td>
                  <Badge bg={PROMOTION_STATUS[promo.status].variant} className="px-2 py-1">
                    <IconifyIcon icon={PROMOTION_STATUS[promo.status].icon} className="me-1" />
                    {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm" className="btn-sm">
                      <IconifyIcon icon="ri:more-2-fill" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:edit-line" className="me-1" />
                        Edit Promotion
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:file-chart-line" className="me-1" />
                        Analytics
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Update Status</Dropdown.Header>
                      {promo.status !== 'active' && (
                        <Dropdown.Item onClick={() => handleUpdateStatus(promo.id, 'active')}>
                          <IconifyIcon icon="ri:check-double-line" className="me-1 text-success" />
                          Activate
                        </Dropdown.Item>
                      )}
                      {promo.status !== 'draft' && (
                        <Dropdown.Item onClick={() => handleUpdateStatus(promo.id, 'draft')}>
                          <IconifyIcon icon="ri:draft-line" className="me-1 text-warning" />
                          Move to Draft
                        </Dropdown.Item>
                      )}
                      {promo.status === 'active' && (
                        <Dropdown.Item onClick={() => handleUpdateStatus(promo.id, 'expired')}>
                          <IconifyIcon icon="ri:time-line" className="me-1 text-secondary" />
                          Mark as Expired
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {filteredPromotions.length > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div>
            Showing 1-{filteredPromotions.length} of {DEMO_PROMOTIONS.length} promotions
          </div>
          <div>
            <Button variant="outline-primary" size="sm" className="me-1">Previous</Button>
            <Button variant="outline-primary" size="sm">Next</Button>
          </div>
        </div>
      )}
      
      {filteredPromotions.length === 0 && (
        <div className="text-center py-4">
          <IconifyIcon icon="ri:coupon-line" width={40} height={40} className="text-muted" />
          <p className="mt-2">No promotions found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default PromotionManagementTable;
