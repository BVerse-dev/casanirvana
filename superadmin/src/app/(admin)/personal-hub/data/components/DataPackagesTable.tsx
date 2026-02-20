"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import PackageDetailsModal from './PackageDetailsModal';
import BulkActionsModal from './BulkActionsModal';

interface DataPackage {
  id: string;
  name: string;
  provider: {
    name: string;
    logo: string;
  };
  dataAmount: string;
  validityDays: number;
  price: string;
  description?: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  salesCount: number;
}

const DataPackagesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<DataPackage | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<DataPackage[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Sample data - would be fetched from API in production
  const dataPackages: DataPackage[] = [
    {
      id: 'PKG-001',
      name: 'Daily 1GB',
      provider: {
        name: 'MTN',
        logo: '/assets/images/mtn-logo.png',
      },
      dataAmount: '1GB',
      validityDays: 1,
      price: '$1.99',
      description: '1GB data valid for 24 hours',
      status: 'active',
      isFeatured: true,
      salesCount: 3245,
    },
    {
      id: 'PKG-002',
      name: 'Weekly 5GB',
      provider: {
        name: 'MTN',
        logo: '/assets/images/mtn-logo.png',
      },
      dataAmount: '5GB',
      validityDays: 7,
      price: '$5.99',
      description: '5GB data valid for 7 days',
      status: 'active',
      isFeatured: true,
      salesCount: 2156,
    },
    {
      id: 'PKG-003',
      name: 'Monthly 20GB',
      provider: {
        name: 'MTN',
        logo: '/assets/images/mtn-logo.png',
      },
      dataAmount: '20GB',
      validityDays: 30,
      price: '$18.99',
      description: '20GB data valid for 30 days',
      status: 'active',
      isFeatured: false,
      salesCount: 1890,
    },
    {
      id: 'PKG-004',
      name: 'Daily 1.5GB',
      provider: {
        name: 'Telecel',
        logo: '/assets/images/telecel-logo.png',
      },
      dataAmount: '1.5GB',
      validityDays: 1,
      price: '$1.89',
      description: '1.5GB data valid for 24 hours',
      status: 'active',
      isFeatured: false,
      salesCount: 2780,
    },
    {
      id: 'PKG-005',
      name: 'Weekly 7GB',
      provider: {
        name: 'Telecel',
        logo: '/assets/images/telecel-logo.png',
      },
      dataAmount: '7GB',
      validityDays: 7,
      price: '$6.49',
      description: '7GB data valid for 7 days',
      status: 'active',
      isFeatured: true,
      salesCount: 1950,
    },
    {
      id: 'PKG-006',
      name: 'Monthly 25GB',
      provider: {
        name: 'Telecel',
        logo: '/assets/images/telecel-logo.png',
      },
      dataAmount: '25GB',
      validityDays: 30,
      price: '$19.99',
      description: '25GB data valid for 30 days',
      status: 'active',
      isFeatured: false,
      salesCount: 1560,
    },
    {
      id: 'PKG-007',
      name: 'Daily 1GB',
      provider: {
        name: 'AirtelTigo',
        logo: '/assets/images/airteltigo-logo.png',
      },
      dataAmount: '1GB',
      validityDays: 1,
      price: '$1.79',
      description: '1GB data valid for 24 hours',
      status: 'active',
      isFeatured: false,
      salesCount: 2450,
    },
    {
      id: 'PKG-008',
      name: 'Weekly 6GB',
      provider: {
        name: 'AirtelTigo',
        logo: '/assets/images/airteltigo-logo.png',
      },
      dataAmount: '6GB',
      validityDays: 7,
      price: '$5.79',
      description: '6GB data valid for 7 days',
      status: 'active',
      isFeatured: true,
      salesCount: 1870,
    },
    {
      id: 'PKG-009',
      name: 'Monthly 22GB',
      provider: {
        name: 'AirtelTigo',
        logo: '/assets/images/airteltigo-logo.png',
      },
      dataAmount: '22GB',
      validityDays: 30,
      price: '$17.99',
      description: '22GB data valid for 30 days',
      status: 'inactive',
      isFeatured: false,
      salesCount: 980,
    },
    {
      id: 'PKG-010',
      name: 'Unlimited Weekend',
      provider: {
        name: 'Orange',
        logo: '/assets/images/orange-logo.png',
      },
      dataAmount: 'Unlimited',
      validityDays: 2,
      price: '$3.99',
      description: 'Unlimited data valid for weekends only',
      status: 'active',
      isFeatured: true,
      salesCount: 3560,
    },
  ];
  
  // Filter packages based on search term, status, and provider
  const filteredPackages = dataPackages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
    const matchesProvider = filterProvider === 'all' || pkg.provider.name === filterProvider;
    return matchesSearch && matchesStatus && matchesProvider;
  });
  
  // Handle package edit
  const handleEditPackage = (pkg: DataPackage) => {
    setCurrentPackage(pkg);
    setShowEditModal(true);
  };

  // Handle view details
  const handleViewDetails = (pkg: DataPackage) => {
    setCurrentPackage(pkg);
    setShowDetailsModal(true);
  };
  
  // Handle status change
  const handleStatusChange = (pkg: DataPackage, status: DataPackage['status']) => {
    // Would update the package status in production
    console.log(`Changed status of ${pkg.name} to ${status}`);
  };
  
  // Handle featured toggle
  const handleFeaturedToggle = (pkg: DataPackage) => {
    // Would update the package featured status in production
    console.log(`Toggled featured status of ${pkg.name} to ${!pkg.isFeatured}`);
  };

  // Handle package selection
  const handlePackageSelect = (pkg: DataPackage, checked: boolean) => {
    if (checked) {
      setSelectedPackages(prev => [...prev, pkg]);
    } else {
      setSelectedPackages(prev => prev.filter(p => p.id !== pkg.id));
      setSelectAll(false);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPackages(filteredPackages);
    } else {
      setSelectedPackages([]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, packages: DataPackage[], options: any) => {
    console.log(`Performing bulk action: ${action}`, packages, options);
    // In production, this would call an API
    alert(`Successfully performed ${action} on ${packages.length} packages`);
    setSelectedPackages([]);
    setSelectAll(false);
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <div className="me-3 mb-2">
          <InputGroup>
            <Form.Control
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="secondary">
              <IconifyIcon icon="ri:search-line" />
            </Button>
          </InputGroup>
        </div>
        <div className="me-3 mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              Provider: {filterProvider === 'all' ? 'All' : filterProvider}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterProvider('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterProvider('MTN')}>MTN</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterProvider('Telecel')}>Telecel</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterProvider('AirtelTigo')}>AirtelTigo</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterProvider('Orange')}>Orange</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="me-3 mb-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterStatus('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('active')}>Active</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('inactive')}>Inactive</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="flex-grow-1"></div>
        <div className="mb-2">
          {selectedPackages.length > 0 && (
            <Button 
              variant="primary" 
              className="me-2"
              onClick={() => setShowBulkModal(true)}
            >
              <IconifyIcon icon="ri:settings-3-line" className="me-1" />
              Bulk Actions ({selectedPackages.length})
            </Button>
          )}
          <Button variant="outline-secondary" className="me-2">
            <IconifyIcon icon="ri:download-2-line" className="me-1" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Packages Table */}
      <div className="table-responsive">
        <Table className="table-centered table-hover mb-0">
          <thead>
            <tr>
              <th>
                <Form.Check
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Package</th>
              <th>Provider</th>
              <th>Data Amount</th>
              <th>Validity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Sales</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={pkg.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedPackages.some(p => p.id === pkg.id)}
                    onChange={(e) => handlePackageSelect(pkg, e.target.checked)}
                  />
                </td>
                <td>
                  <div>
                    <h5 className="font-14 mb-0">{pkg.name}</h5>
                    <span className="text-muted font-13">{pkg.id}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img 
                      src={pkg.provider.logo} 
                      alt={pkg.provider.name} 
                      height="24" 
                      className="me-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                      }}
                    />
                    {pkg.provider.name}
                  </div>
                </td>
                <td>{pkg.dataAmount}</td>
                <td>{pkg.validityDays} {pkg.validityDays === 1 ? 'day' : 'days'}</td>
                <td>{pkg.price}</td>
                <td>
                  <Badge bg={pkg.status === 'active' ? 'success' : 'secondary'}>
                    {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={pkg.isFeatured}
                      onChange={() => handleFeaturedToggle(pkg)}
                    />
                  </div>
                </td>
                <td>{pkg.salesCount.toLocaleString()}</td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(pkg)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditPackage(pkg)}>
                        <IconifyIcon icon="ri:pencil-line" className="me-1" />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
                        View Analytics
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Change Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(pkg, 'active')}
                        className={pkg.status === 'active' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Active
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(pkg, 'inactive')}
                        className={pkg.status === 'inactive' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                        Inactive
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {/* Edit Package Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPackage ? `Edit Package: ${currentPackage.name}` : 'Add Package'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Package Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={currentPackage?.name || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    value={currentPackage?.provider.name || ''}
                    onChange={() => {}}
                  >
                    <option value="MTN">MTN</option>
                    <option value="Telecel">Telecel</option>
                    <option value="AirtelTigo">AirtelTigo</option>
                    <option value="Orange">Orange</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Amount</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={currentPackage?.dataAmount || ''}
                    onChange={() => {}}
                  />
                  <Form.Text className="text-muted">
                    e.g., "1GB", "5GB", "Unlimited"
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Validity (days)</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={currentPackage?.validityDays || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control 
                    type="text"
                    value={currentPackage?.price || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={currentPackage?.status || 'active'}
                    onChange={() => {}}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={currentPackage?.description || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="featured-switch"
                label="Featured Package"
                checked={currentPackage?.isFeatured || false}
                onChange={() => {}}
              />
              <Form.Text className="text-muted">
                Featured packages are displayed prominently in the mobile app
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Package Details Modal */}
      <PackageDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        dataPackage={currentPackage}
        onEdit={handleEditPackage}
        onStatusChange={handleStatusChange}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        show={showBulkModal}
        onHide={() => setShowBulkModal(false)}
        selectedPackages={selectedPackages}
        onBulkAction={handleBulkAction}
      />
    </>
  );
};

export default DataPackagesTable;
