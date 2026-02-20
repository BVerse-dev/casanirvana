"use client";

import React, { useState } from 'react';
import { Table, Form, InputGroup, Button, Badge, Dropdown, Image } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import VendorDetailsModal from './VendorDetailsModal';

interface VendorManagementTableProps {
  showFilters?: boolean;
}

// Vendor status types and their corresponding styles
const VENDOR_STATUS = {
  active: { variant: 'success', icon: 'ri:check-double-line' },
  pending: { variant: 'warning', icon: 'ri:time-line' },
  suspended: { variant: 'danger', icon: 'ri:close-circle-line' },
  inactive: { variant: 'secondary', icon: 'ri:pause-mini-line' },
};

type VendorStatusType = keyof typeof VENDOR_STATUS;

interface Vendor {
  id: string;
  name: string;
  logo: string;
  category: string;
  products: number;
  joinDate: string;
  commission: string;
  status: VendorStatusType;
  contact: string;
}

const DEMO_VENDORS: Vendor[] = [
  {
    id: '1',
    name: 'TechGadgets Inc.',
    logo: '/assets/images/users/avatar-1.jpg', // Using placeholder
    category: 'Electronics',
    products: 42,
    joinDate: '2023-05-12',
    commission: '15%',
    status: 'active',
    contact: 'contact@techgadgets.com'
  },
  {
    id: '2',
    name: 'Fashion Forward',
    logo: '/assets/images/users/avatar-2.jpg', // Using placeholder
    category: 'Clothing',
    products: 78,
    joinDate: '2023-06-18',
    commission: '12%',
    status: 'active',
    contact: 'sales@fashionforward.com'
  },
  {
    id: '3',
    name: 'Home Essentials',
    logo: '/assets/images/users/avatar-3.jpg', // Using placeholder
    category: 'Home & Kitchen',
    products: 35,
    joinDate: '2023-07-02',
    commission: '10%',
    status: 'pending',
    contact: 'info@homeessentials.com'
  },
  {
    id: '4',
    name: 'Organic Foods Co.',
    logo: '/assets/images/users/avatar-4.jpg', // Using placeholder
    category: 'Grocery',
    products: 24,
    joinDate: '2023-04-15',
    commission: '8%',
    status: 'suspended',
    contact: 'orders@organicfoods.com'
  },
  {
    id: '5',
    name: 'Sports Unlimited',
    logo: '/assets/images/users/avatar-5.jpg', // Using placeholder
    category: 'Sports & Outdoors',
    products: 52,
    joinDate: '2023-08-01',
    commission: '15%',
    status: 'active',
    contact: 'help@sportsunlimited.com'
  },
  {
    id: '6',
    name: 'Beauty Vault',
    logo: '/assets/images/users/avatar-6.jpg', // Using placeholder
    category: 'Beauty & Personal Care',
    products: 63,
    joinDate: '2023-05-30',
    commission: '18%',
    status: 'inactive',
    contact: 'support@beautyvault.com'
  }
];

const VendorManagementTable: React.FC<VendorManagementTableProps> = ({ 
  showFilters = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  
  // Get unique categories for the filter
  const categories = [...new Set(DEMO_VENDORS.map(vendor => vendor.category))];
  
  // Filter vendors based on search term, status, and category
  const filteredVendors = DEMO_VENDORS.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewVendor = (vendorId: string) => {
    const vendor = DEMO_VENDORS.find(v => v.id === vendorId);
    if (vendor) {
      setCurrentVendor(vendor);
      setShowDetailsModal(true);
    }
  };

  const handleUpdateStatus = (vendorId: string, newStatus: VendorStatusType) => {
    console.log(`Update vendor ${vendorId} status to: ${newStatus}`);
    alert(`Successfully updated vendor status to ${newStatus}`);
  };

  const handleEditVendor = (vendor: Vendor) => {
    console.log(`Edit vendor ${vendor.id}`);
    alert(`Edit vendor functionality for ${vendor.name}`);
  };

  const handleStatusChange = (vendor: Vendor, newStatus: string) => {
    console.log(`Changing vendor ${vendor.id} status to ${newStatus}`);
    alert(`Successfully changed ${vendor.name} status to ${newStatus}`);
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
                placeholder="Search vendors..."
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
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
          
          <Form.Select 
            style={{ width: 'auto' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
              <th>Vendor</th>
              <th>Category</th>
              <th>Products</th>
              <th>Join Date</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <Image 
                        src={vendor.logo} 
                        alt={vendor.name} 
                        width={32} 
                        height={32} 
                        roundedCircle 
                      />
                    </div>
                    <div>
                      <h5 className="m-0 fs-14">{vendor.name}</h5>
                      <small className="text-muted">{vendor.contact}</small>
                    </div>
                  </div>
                </td>
                <td>{vendor.category}</td>
                <td>{vendor.products}</td>
                <td>{vendor.joinDate}</td>
                <td>{vendor.commission}</td>
                <td>
                  <Badge bg={VENDOR_STATUS[vendor.status].variant} className="px-2 py-1">
                    <IconifyIcon icon={VENDOR_STATUS[vendor.status].icon} className="me-1" />
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm" className="btn-sm">
                      <IconifyIcon icon="ri:more-2-fill" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewVendor(vendor.id)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditVendor(vendor)}>
                        <IconifyIcon icon="ri:edit-line" className="me-1" />
                        Edit Vendor
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:list-check" className="me-1" />
                        View Products
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Update Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleUpdateStatus(vendor.id, 'active')}
                        className={vendor.status === 'active' ? 'disabled' : ''}
                      >
                        <IconifyIcon icon="ri:check-double-line" className="me-1 text-success" />
                        Activate
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleUpdateStatus(vendor.id, 'suspended')}
                        className={vendor.status === 'suspended' ? 'disabled' : ''}
                      >
                        <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                        Suspend
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {filteredVendors.length > 0 && (
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div>
            Showing 1-{filteredVendors.length} of {DEMO_VENDORS.length} vendors
          </div>
          <div>
            <Button variant="outline-primary" size="sm" className="me-1">Previous</Button>
            <Button variant="outline-primary" size="sm">Next</Button>
          </div>
        </div>
      )}
      
      {filteredVendors.length === 0 && (
        <div className="text-center py-4">
          <IconifyIcon icon="ri:store-2-line" width={40} height={40} className="text-muted" />
          <p className="mt-2">No vendors found matching your criteria</p>
        </div>
      )}

      {/* Vendor Details Modal */}
      <VendorDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        vendor={currentVendor}
        onEdit={handleEditVendor}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default VendorManagementTable;
