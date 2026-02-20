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
  FormControl
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TopUpBalanceModal from './TopUpBalanceModal';
import ProviderDetailsModal from './ProviderDetailsModal';
import StatusChangeModal from './StatusChangeModal';

interface Provider {
  id: string;
  name: string;
  logo: string;
  country: string;
  status: 'active' | 'inactive' | 'maintenance';
  balance: string;
  transactions: number;
  fee: string;
}

const ProviderManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');
  
  // Sample data - would be fetched from API in production
  const providers: Provider[] = [
    {
      id: 'PRV-001',
      name: 'MTN',
      logo: '/assets/images/mtn-logo.png',
      country: 'Ghana',
      status: 'active',
      balance: '$5,280',
      transactions: 1254,
      fee: '2.5%',
    },
    {
      id: 'PRV-002',
      name: 'Telecel',
      logo: '/assets/images/telecel-logo.png',
      country: 'Ghana',
      status: 'active',
      balance: '$3,450',
      transactions: 825,
      fee: '2.0%',
    },
    {
      id: 'PRV-003',
      name: 'AirtelTigo',
      logo: '/assets/images/airteltigo-logo.png',
      country: 'Ghana',
      status: 'active',
      balance: '$2,980',
      transactions: 642,
      fee: '2.3%',
    },
    {
      id: 'PRV-004',
      name: 'Safaricom',
      logo: '/assets/images/safaricom-logo.png',
      country: 'Kenya',
      status: 'inactive',
      balance: '$0',
      transactions: 0,
      fee: '2.8%',
    },
    {
      id: 'PRV-005',
      name: 'Glo',
      logo: '/assets/images/glo-logo.png',
      country: 'Nigeria',
      status: 'maintenance',
      balance: '$1,230',
      transactions: 112,
      fee: '2.1%',
    },
    {
      id: 'PRV-006',
      name: 'Orange',
      logo: '/assets/images/orange-logo.png',
      country: 'Côte d\'Ivoire',
      status: 'active',
      balance: '$4,750',
      transactions: 967,
      fee: '2.4%',
    },
  ];
  
  // Filter providers based on search term and status
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: Provider['status']) => {
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
  
  // Handle provider edit
  const handleEditProvider = (provider: Provider) => {
    setCurrentProvider(provider);
    setShowEditModal(true);
  };
  
  // Handle top-up balance
  const handleTopUpBalance = (provider: Provider) => {
    setCurrentProvider(provider);
    setShowTopUpModal(true);
  };

  // Handle view details
  const handleViewDetails = (provider: Provider) => {
    setCurrentProvider(provider);
    setShowDetailsModal(true);
  };

  // Handle status change
  const handleStatusChange = (provider: Provider, status: Provider['status']) => {
    setCurrentProvider(provider);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  // Handle top-up confirmation
  const handleTopUpConfirmation = async (providerId: string, amount: number, method: string) => {
    console.log(`Topping up ${providerId} with $${amount} via ${method}`);
    // In production, this would call an API
    alert(`Successfully topped up $${amount} for provider ${providerId}`);
  };

  // Handle status change confirmation
  const handleStatusChangeConfirmation = async (providerId: string, status: string, reason: string) => {
    console.log(`Changing status of ${providerId} to ${status}. Reason: ${reason}`);
    // In production, this would call an API
    alert(`Successfully changed provider status to ${status}`);
  };

  return (
    <>
      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center mb-3">
        <div className="me-3 mb-2">
          <InputGroup>
            <FormControl
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
        <div className="flex-grow-1"></div>
        <div className="mb-2">
          <Button variant="outline-secondary" className="me-2">
            <IconifyIcon icon="ri:download-2-line" className="me-1" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Providers Table */}
      <div className="table-responsive">
        <Table className="table-centered table-hover mb-0">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Country</th>
              <th>Status</th>
              <th>Balance</th>
              <th>Transactions</th>
              <th>Fee Structure</th>
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
                        className="img-fluid rounded-circle"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-14 mb-0">{provider.name}</h5>
                      <span className="text-muted font-13">{provider.id}</span>
                    </div>
                  </div>
                </td>
                <td>{provider.country}</td>
                <td>
                  <Badge bg={getStatusBadgeVariant(provider.status)}>
                    {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                  </Badge>
                </td>
                <td>{provider.balance}</td>
                <td>{provider.transactions.toLocaleString()}</td>
                <td>{provider.fee}</td>
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
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleTopUpBalance(provider)}>
                        <IconifyIcon icon="ri:wallet-3-line" className="me-1" />
                        Top Up Balance
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
                        onClick={() => handleStatusChange(provider, 'maintenance')}
                        className={provider.status === 'maintenance' ? 'active' : ''}
                      >
                        <IconifyIcon icon="ri:tools-line" className="me-1 text-warning" />
                        Maintenance
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(provider, 'inactive')}
                        className={provider.status === 'inactive' ? 'active' : ''}
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
      
      {/* Edit Provider Modal */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentProvider ? `Edit Provider: ${currentProvider.name}` : 'Add Provider'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Provider Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentProvider?.name || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control 
                type="text" 
                value={currentProvider?.country || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={currentProvider?.status || 'active'}
                onChange={() => {}}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Fee Structure (%)</Form.Label>
              <Form.Control 
                type="text"
                value={currentProvider?.fee || ''}
                onChange={() => {}}
              />
            </Form.Group>
            
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
            
            <Form.Group className="mb-3">
              <Form.Label>API Integration Details</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
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

      {/* Top Up Balance Modal */}
      <TopUpBalanceModal
        show={showTopUpModal}
        onHide={() => setShowTopUpModal(false)}
        provider={currentProvider}
        onTopUp={handleTopUpConfirmation}
      />

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        provider={currentProvider}
        onEdit={handleEditProvider}
        onTopUp={handleTopUpBalance}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        provider={currentProvider}
        newStatus={newStatus}
        onConfirm={handleStatusChangeConfirmation}
      />
    </>
  );
};

export default ProviderManagementTable;
