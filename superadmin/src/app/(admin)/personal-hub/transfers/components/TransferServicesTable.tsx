"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Modal
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ServiceDetailsModal from './ServiceDetailsModal';

interface TransferService {
  id: string;
  name: string;
  logo: string;
  type: 'domestic' | 'international';
  countries: string[];
  status: 'active' | 'inactive' | 'maintenance';
  fee_structure: {
    percentage?: number;
    flat_fee?: number;
    min_amount: number;
    max_amount: number;
    tier_based?: boolean;
  };
  transaction_count: number;
  volume: string;
  avg_amount: string;
  limits: {
    daily: string;
    monthly: string;
    per_transaction: string;
  };
}

const TransferServicesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentService, setCurrentService] = useState<TransferService | null>(null);
  
  // Sample data - would be fetched from API in production
  const transferServices: TransferService[] = [
    {
      id: 'SRV-001',
      name: 'Mobile Money Transfer',
      logo: '/assets/images/mobile-money-logo.png',
      type: 'domestic',
      countries: ['Ghana'],
      status: 'active',
      fee_structure: {
        percentage: 1.5,
        min_amount: 5,
        max_amount: 2000,
      },
      transaction_count: 542,
      volume: '$24,680',
      avg_amount: '$45.50',
      limits: {
        daily: '$500',
        monthly: '$3,000',
        per_transaction: '$300',
      }
    },
    {
      id: 'SRV-002',
      name: 'Bank Transfer',
      logo: '/assets/images/bank-transfer-logo.png',
      type: 'domestic',
      countries: ['Ghana'],
      status: 'active',
      fee_structure: {
        flat_fee: 1.00,
        min_amount: 10,
        max_amount: 10000,
      },
      transaction_count: 387,
      volume: '$72,450',
      avg_amount: '$187.21',
      limits: {
        daily: '$2,000',
        monthly: '$10,000',
        per_transaction: '$2,000',
      }
    },
    {
      id: 'SRV-003',
      name: 'International Wire',
      logo: '/assets/images/international-wire-logo.png',
      type: 'international',
      countries: ['Global'],
      status: 'active',
      fee_structure: {
        percentage: 2.5,
        flat_fee: 5.00,
        tier_based: true,
        min_amount: 100,
        max_amount: 50000,
      },
      transaction_count: 214,
      volume: '$38,750',
      avg_amount: '$181.07',
      limits: {
        daily: '$5,000',
        monthly: '$20,000',
        per_transaction: '$5,000',
      }
    },
    {
      id: 'SRV-004',
      name: 'Western Union',
      logo: '/assets/images/western-union-logo.png',
      type: 'international',
      countries: ['USA', 'UK', 'EU', 'Nigeria', 'Kenya'],
      status: 'active',
      fee_structure: {
        percentage: 3.0,
        flat_fee: 3.50,
        min_amount: 50,
        max_amount: 5000,
      },
      transaction_count: 106,
      volume: '$14,950',
      avg_amount: '$141.04',
      limits: {
        daily: '$3,000',
        monthly: '$10,000',
        per_transaction: '$3,000',
      }
    },
    {
      id: 'SRV-005',
      name: 'MoneyGram',
      logo: '/assets/images/moneygram-logo.png',
      type: 'international',
      countries: ['USA', 'UK', 'EU', 'South Africa', 'Tanzania'],
      status: 'maintenance',
      fee_structure: {
        percentage: 2.8,
        flat_fee: 2.50,
        min_amount: 50,
        max_amount: 5000,
      },
      transaction_count: 98,
      volume: '$7,230',
      avg_amount: '$73.78',
      limits: {
        daily: '$2,000',
        monthly: '$8,000',
        per_transaction: '$2,000',
      }
    },
    {
      id: 'SRV-006',
      name: 'Crypto Transfer',
      logo: '/assets/images/crypto-logo.png',
      type: 'international',
      countries: ['Global'],
      status: 'inactive',
      fee_structure: {
        percentage: 1.0,
        min_amount: 20,
        max_amount: 10000,
      },
      transaction_count: 0,
      volume: '$0',
      avg_amount: '$0',
      limits: {
        daily: '$5,000',
        monthly: '$20,000',
        per_transaction: '$5,000',
      }
    },
  ];
  
  // Filter services based on search term, status, and type
  const filteredServices = transferServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    const matchesType = filterType === 'all' || service.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: TransferService['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'maintenance':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Handle service edit
  const handleEditService = (service: TransferService) => {
    setCurrentService(service);
    setShowEditModal(true);
  };

  // Handle view details
  const handleViewDetails = (service: TransferService) => {
    setCurrentService(service);
    setShowDetailsModal(true);
  };

  // Handle status change
  const handleStatusChange = (service: TransferService, newStatus: string) => {
    console.log(`Changing status of ${service.name} to ${newStatus}`);
    alert(`Successfully changed ${service.name} status to ${newStatus}`);
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <div className="me-3 mb-2">
          <InputGroup>
            <Form.Control
              placeholder="Search services..."
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
              Type: {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterType('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterType('domestic')}>Domestic</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterType('international')}>International</Dropdown.Item>
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
              <Dropdown.Item onClick={() => setFilterStatus('maintenance')}>Maintenance</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      
      {/* Services Table */}
      <div className="table-responsive">
        <Table className="table-centered table-hover mb-0">
          <thead>
            <tr>
              <th>Service</th>
              <th>Type</th>
              <th>Fee Structure</th>
              <th>Limits</th>
              <th>Transactions</th>
              <th>Volume</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-2">
                      <img 
                        src={service.logo} 
                        alt={service.name} 
                        className="img-fluid"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{service.name}</h5>
                      <span className="text-muted font-13">{service.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge bg={service.type === 'domestic' ? 'info' : 'primary'}>
                    {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                  </Badge>
                  <div className="small text-muted mt-1">
                    {service.countries.length > 1 
                      ? `${service.countries[0]} + ${service.countries.length - 1} more` 
                      : service.countries[0]}
                  </div>
                </td>
                <td>
                  <div>
                    {service.fee_structure.percentage && (
                      <div>{service.fee_structure.percentage}%</div>
                    )}
                    {service.fee_structure.flat_fee && (
                      <div>${service.fee_structure.flat_fee.toFixed(2)} flat</div>
                    )}
                    {service.fee_structure.tier_based && (
                      <Badge bg="light" text="dark" className="me-1">Tiered</Badge>
                    )}
                  </div>
                </td>
                <td>
                  <div className="small">
                    <div>Per Tx: {service.limits.per_transaction}</div>
                    <div>Daily: {service.limits.daily}</div>
                    <div>Monthly: {service.limits.monthly}</div>
                  </div>
                </td>
                <td>{service.transaction_count.toLocaleString()}</td>
                <td>{service.volume}</td>
                <td>
                  <Badge bg={getStatusBadgeVariant(service.status)}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(service)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditService(service)}>
                        <IconifyIcon icon="ri:pencil-line" className="me-1" />
                        Edit Service
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:settings-4-line" className="me-1" />
                        Service Settings
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
                        View Analytics
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Change Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(service, 'active')}
                        className={service.status === 'active' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Active
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(service, 'maintenance')}
                        className={service.status === 'maintenance' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:tools-line" className="me-1 text-warning" />
                        Maintenance
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(service, 'inactive')}
                        className={service.status === 'inactive' ? 'active' : ''}
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
      
      {/* Edit Service Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentService ? `Edit Service: ${currentService.name}` : 'Add Service'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Basic Information */}
            <h5 className="mb-3">Basic Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentService?.name || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Service Type</Form.Label>
              <Form.Select
                value={currentService?.type || 'domestic'}
                onChange={() => {}}
              >
                <option value="domestic">Domestic</option>
                <option value="international">International</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={currentService?.status || 'active'}
                onChange={() => {}}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Logo</Form.Label>
              <Form.Control type="file" />
              {currentService?.logo && (
                <div className="mt-2">
                  <img 
                    src={currentService.logo} 
                    alt={currentService.name} 
                    height="40" 
                    className="img-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            
            {/* Fee Structure */}
            <h5 className="mb-3 mt-4">Fee Structure</h5>
            <Form.Group className="mb-3">
              <Form.Label>Percentage Fee (%)</Form.Label>
              <Form.Control 
                type="number" 
                value={currentService?.fee_structure?.percentage || ''}
                onChange={() => {}}
                placeholder="e.g. 2.5"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Flat Fee ($)</Form.Label>
              <Form.Control 
                type="number" 
                value={currentService?.fee_structure?.flat_fee || ''}
                onChange={() => {}}
                placeholder="e.g. 1.00"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Use tiered fee structure"
                checked={currentService?.fee_structure?.tier_based || false}
                onChange={() => {}}
              />
              <Form.Text className="text-muted">
                Tiered fee structures apply different rates based on transaction amount ranges
              </Form.Text>
            </Form.Group>
            
            {/* Transaction Limits */}
            <h5 className="mb-3 mt-4">Transaction Limits</h5>
            <Form.Group className="mb-3">
              <Form.Label>Per Transaction Limit ($)</Form.Label>
              <Form.Control 
                type="text" 
                value={currentService?.limits?.per_transaction?.replace('$', '') || ''}
                onChange={() => {}}
                placeholder="e.g. 3000"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Daily Limit ($)</Form.Label>
              <Form.Control 
                type="text" 
                value={currentService?.limits?.daily?.replace('$', '') || ''}
                onChange={() => {}}
                placeholder="e.g. 5000"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Monthly Limit ($)</Form.Label>
              <Form.Control 
                type="text" 
                value={currentService?.limits?.monthly?.replace('$', '') || ''}
                onChange={() => {}}
                placeholder="e.g. 20000"
              />
            </Form.Group>
            
            {/* Countries */}
            <h5 className="mb-3 mt-4">Supported Countries</h5>
            <Form.Group className="mb-3">
              <Form.Label>Countries</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={currentService?.countries.join(', ') || ''}
                onChange={() => {}}
                placeholder="Enter comma-separated country names"
              />
              <Form.Text className="text-muted">
                Enter countries separated by commas, or use "Global" for worldwide service
              </Form.Text>
            </Form.Group>
            
            {/* Integration Details */}
            <h5 className="mb-3 mt-4">Integration Details</h5>
            <Form.Group className="mb-3">
              <Form.Label>API Credentials</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5}
                placeholder="Enter API integration details in JSON format"
              />
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

      {/* Service Details Modal */}
      <ServiceDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        service={currentService}
        onEdit={handleEditService}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};

export default TransferServicesTable;
