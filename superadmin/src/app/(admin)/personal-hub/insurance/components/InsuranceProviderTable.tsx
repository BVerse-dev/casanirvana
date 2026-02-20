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
import ProviderDetailsModal from './ProviderDetailsModal';

interface InsuranceProvider {
  id: string;
  name: string;
  logo: string;
  category: 'health' | 'auto' | 'life' | 'property' | 'travel' | 'business' | 'other';
  status: 'active' | 'inactive' | 'pending';
  policy_count: number;
  premium_volume: string;
  commission_rate: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  documents: {
    license: boolean;
    agreement: boolean;
    kyc: boolean;
  };
  integration_type: 'api' | 'manual' | 'hybrid';
}

const InsuranceProviderTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<InsuranceProvider | null>(null);
  
  // Sample data - would be fetched from API in production
  const insuranceProviders: InsuranceProvider[] = [
    {
      id: 'INS-001',
      name: 'Ghana Life Insurance',
      logo: '/assets/images/insurance/ghana-life.png',
      category: 'life',
      status: 'active',
      policy_count: 458,
      premium_volume: '$125,450',
      commission_rate: '12%',
      contact: {
        name: 'Michael Addo',
        email: 'michael.addo@ghanalife.com',
        phone: '+233 55 123 4567',
      },
      documents: {
        license: true,
        agreement: true,
        kyc: true,
      },
      integration_type: 'api',
    },
    {
      id: 'INS-002',
      name: 'Star Health Insurance',
      logo: '/assets/images/insurance/star-health.png',
      category: 'health',
      status: 'active',
      policy_count: 623,
      premium_volume: '$215,780',
      commission_rate: '10%',
      contact: {
        name: 'Sarah Mensah',
        email: 'sarah.m@starhealth.com',
        phone: '+233 50 987 6543',
      },
      documents: {
        license: true,
        agreement: true,
        kyc: true,
      },
      integration_type: 'api',
    },
    {
      id: 'INS-003',
      name: 'Auto Shield Ghana',
      logo: '/assets/images/insurance/auto-shield.png',
      category: 'auto',
      status: 'active',
      policy_count: 345,
      premium_volume: '$98,450',
      commission_rate: '15%',
      contact: {
        name: 'David Owusu',
        email: 'd.owusu@autoshield.com',
        phone: '+233 54 246 8135',
      },
      documents: {
        license: true,
        agreement: true,
        kyc: true,
      },
      integration_type: 'hybrid',
    },
    {
      id: 'INS-004',
      name: 'Secure Property Insurance',
      logo: '/assets/images/insurance/secure-property.png',
      category: 'property',
      status: 'active',
      policy_count: 287,
      premium_volume: '$178,920',
      commission_rate: '8%',
      contact: {
        name: 'Grace Agyei',
        email: 'grace@secureproperty.com',
        phone: '+233 55 678 1234',
      },
      documents: {
        license: true,
        agreement: true,
        kyc: true,
      },
      integration_type: 'manual',
    },
    {
      id: 'INS-005',
      name: 'Global Travel Protect',
      logo: '/assets/images/insurance/global-travel.png',
      category: 'travel',
      status: 'inactive',
      policy_count: 0,
      premium_volume: '$0',
      commission_rate: '18%',
      contact: {
        name: 'John Kufuor',
        email: 'john@globaltravel.com',
        phone: '+233 50 345 6789',
      },
      documents: {
        license: true,
        agreement: false,
        kyc: true,
      },
      integration_type: 'manual',
    },
    {
      id: 'INS-006',
      name: 'Business Guard Insurance',
      logo: '/assets/images/insurance/business-guard.png',
      category: 'business',
      status: 'pending',
      policy_count: 0,
      premium_volume: '$0',
      commission_rate: '14%',
      contact: {
        name: 'Elizabeth Darko',
        email: 'elizabeth@businessguard.com',
        phone: '+233 24 789 0123',
      },
      documents: {
        license: true,
        agreement: false,
        kyc: false,
      },
      integration_type: 'hybrid',
    },
  ];
  
  // Filter providers based on search term, category, and status
  const filteredProviders = insuranceProviders.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || provider.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: InsuranceProvider['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Get category badge variant
  const getCategoryBadgeVariant = (category: InsuranceProvider['category']) => {
    switch (category) {
      case 'health':
        return 'info';
      case 'auto':
        return 'primary';
      case 'life':
        return 'success';
      case 'property':
        return 'warning';
      case 'travel':
        return 'purple';
      case 'business':
        return 'danger';
      case 'other':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  // Handle provider edit
  const handleEditProvider = (provider: InsuranceProvider) => {
    setCurrentProvider(provider);
    setShowEditModal(true);
  };

  // Handle view details
  const handleViewDetails = (provider: InsuranceProvider) => {
    setCurrentProvider(provider);
    setShowDetailsModal(true);
  };

  // Handle status change
  const handleStatusChange = (provider: InsuranceProvider, newStatus: string) => {
    console.log(`Changing status of ${provider.name} to ${newStatus}`);
    alert(`Successfully changed ${provider.name} status to ${newStatus}`);
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <div className="me-3 mb-2">
          <InputGroup>
            <Form.Control
              placeholder="Search providers..."
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
              Category: {filterCategory === 'all' ? 'All' : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterCategory('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('health')}>Health</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('auto')}>Auto</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('life')}>Life</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('property')}>Property</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('travel')}>Travel</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('business')}>Business</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory('other')}>Other</Dropdown.Item>
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
              <Dropdown.Item onClick={() => setFilterStatus('pending')}>Pending</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      
      {/* Providers Table */}
      <div className="table-responsive">
        <Table className="table-centered table-hover mb-0">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Category</th>
              <th>Policies</th>
              <th>Premium Volume</th>
              <th>Commission</th>
              <th>Documents</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.map((provider) => (
              <tr key={provider.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-2">
                      <img 
                        src={provider.logo} 
                        alt={provider.name} 
                        className="img-fluid"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{provider.name}</h5>
                      <div className="text-muted font-13">
                        <span>{provider.contact.name}</span>
                        <div>{provider.contact.email}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge bg={getCategoryBadgeVariant(provider.category)}>
                    {provider.category.charAt(0).toUpperCase() + provider.category.slice(1)}
                  </Badge>
                  <div className="small text-muted mt-1">
                    {provider.integration_type.charAt(0).toUpperCase() + provider.integration_type.slice(1)} Integration
                  </div>
                </td>
                <td>{provider.policy_count}</td>
                <td>{provider.premium_volume}</td>
                <td>{provider.commission_rate}</td>
                <td>
                  <div className="d-flex gap-1">
                    <Badge bg={provider.documents.license ? 'success' : 'danger'} className="badge-outline-success">
                      <IconifyIcon icon={provider.documents.license ? 'ri:check-line' : 'ri:close-line'} /> License
                    </Badge>
                    <Badge bg={provider.documents.agreement ? 'success' : 'danger'} className="badge-outline-success">
                      <IconifyIcon icon={provider.documents.agreement ? 'ri:check-line' : 'ri:close-line'} /> Agreement
                    </Badge>
                    <Badge bg={provider.documents.kyc ? 'success' : 'danger'} className="badge-outline-success">
                      <IconifyIcon icon={provider.documents.kyc ? 'ri:check-line' : 'ri:close-line'} /> KYC
                    </Badge>
                  </div>
                </td>
                <td>
                  <Badge bg={getStatusBadgeVariant(provider.status)}>
                    {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(provider)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditProvider(provider)}>
                        <IconifyIcon icon="ri:pencil-line" className="me-1" />
                        Edit Provider
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                        View Policies
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:file-upload-line" className="me-1" />
                        Manage Documents
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Header>Change Status</Dropdown.Header>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(provider, 'active')}
                        className={provider.status === 'active' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:check-line" className="me-1 text-success" />
                        Active
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(provider, 'inactive')}
                        className={provider.status === 'inactive' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:close-circle-line" className="me-1 text-danger" />
                        Inactive
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(provider, 'pending')}
                        className={provider.status === 'pending' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:time-line" className="me-1 text-warning" />
                        Pending
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {/* Edit Provider Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentProvider ? `Edit Provider: ${currentProvider.name}` : 'Add Insurance Provider'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Basic Information */}
            <h5 className="mb-3">Basic Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Provider Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentProvider?.name || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={currentProvider?.category || 'health'}
                    onChange={() => {}}
                  >
                    <option value="health">Health Insurance</option>
                    <option value="auto">Auto Insurance</option>
                    <option value="life">Life Insurance</option>
                    <option value="property">Property Insurance</option>
                    <option value="travel">Travel Insurance</option>
                    <option value="business">Business Insurance</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={currentProvider?.status || 'active'}
                    onChange={() => {}}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Logo</Form.Label>
              <Form.Control type="file" />
              {currentProvider?.logo && (
                <div className="mt-2">
                  <img 
                    src={currentProvider.logo} 
                    alt={currentProvider.name} 
                    height="40" 
                    className="img-thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            
            {/* Contact Information */}
            <h5 className="mb-3 mt-4">Contact Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control 
                type="text" 
                value={currentProvider?.contact.name || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={currentProvider?.contact.email || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={currentProvider?.contact.phone || ''}
                    onChange={() => {}}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Commission Structure */}
            <h5 className="mb-3 mt-4">Commission Structure</h5>
            <Form.Group className="mb-3">
              <Form.Label>Commission Rate (%)</Form.Label>
              <Form.Control 
                type="text" 
                value={currentProvider?.commission_rate.replace('%', '') || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            {/* Integration Details */}
            <h5 className="mb-3 mt-4">Integration Details</h5>
            <Form.Group className="mb-3">
              <Form.Label>Integration Type</Form.Label>
              <Form.Select
                value={currentProvider?.integration_type || 'manual'}
                onChange={() => {}}
              >
                <option value="api">API Integration</option>
                <option value="manual">Manual Processing</option>
                <option value="hybrid">Hybrid</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>API Endpoint (if applicable)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="https://api.example.com/insurance"
              />
            </Form.Group>
            
            {/* Document Verification */}
            <h5 className="mb-3 mt-4">Document Verification</h5>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Insurance License"
                checked={currentProvider?.documents.license || false}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Partnership Agreement"
                checked={currentProvider?.documents.agreement || false}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="KYC Documents"
                checked={currentProvider?.documents.kyc || false}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Upload Documents</Form.Label>
              <Form.Control type="file" multiple />
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

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        provider={currentProvider}
        onEdit={handleEditProvider}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};

export default InsuranceProviderTable;
