"use client";

import React, { useState } from 'react';
import { 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup, 
  Dropdown, 
  Row,
  Col,
  Card,
  Modal
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import PolicyActionModal from './PolicyActionModal';

interface InsurancePolicy {
  id: string;
  policy_number: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  provider: {
    id: string;
    name: string;
    logo: string;
  };
  type: 'health' | 'auto' | 'life' | 'property' | 'travel' | 'business' | 'other';
  coverage_details: {
    start_date: string;
    end_date: string;
    coverage_amount: string;
    premium_amount: string;
    payment_frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
    beneficiaries?: string[];
  };
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  documents: string[];
  claims_count: number;
  created_at: string;
}

interface PolicyManagementTableProps {
  showFilters?: boolean;
  limit?: number;
}

const PolicyManagementTable = ({ showFilters = false, limit }: PolicyManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<InsurancePolicy | null>(null);
  const [policyAction, setPolicyAction] = useState<'approve' | 'reject' | 'cancel' | 'renew' | 'suspend'>('approve');
  
  // Sample data - would be fetched from API in production
  const policies: InsurancePolicy[] = [
    {
      id: 'POL-10001',
      policy_number: 'HLTH-2023-001',
      user: {
        id: 'USR-001',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+233 55 123 4567',
      },
      provider: {
        id: 'INS-002',
        name: 'Star Health Insurance',
        logo: '/assets/images/insurance/star-health.png',
      },
      type: 'health',
      coverage_details: {
        start_date: '01 Jan 2023',
        end_date: '31 Dec 2023',
        coverage_amount: '$50,000',
        premium_amount: '$1,200',
        payment_frequency: 'annually',
      },
      status: 'active',
      documents: ['policy_document.pdf', 'terms.pdf'],
      claims_count: 1,
      created_at: '15 Dec 2022',
    },
    {
      id: 'POL-10002',
      policy_number: 'AUTO-2023-045',
      user: {
        id: 'USR-002',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+233 50 987 6543',
      },
      provider: {
        id: 'INS-003',
        name: 'Auto Shield Ghana',
        logo: '/assets/images/insurance/auto-shield.png',
      },
      type: 'auto',
      coverage_details: {
        start_date: '15 Feb 2023',
        end_date: '14 Feb 2024',
        coverage_amount: '$15,000',
        premium_amount: '$750',
        payment_frequency: 'annually',
      },
      status: 'active',
      documents: ['auto_policy.pdf', 'vehicle_details.pdf'],
      claims_count: 0,
      created_at: '10 Feb 2023',
    },
    {
      id: 'POL-10003',
      policy_number: 'LIFE-2023-078',
      user: {
        id: 'USR-003',
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '+233 54 246 8135',
      },
      provider: {
        id: 'INS-001',
        name: 'Ghana Life Insurance',
        logo: '/assets/images/insurance/ghana-life.png',
      },
      type: 'life',
      coverage_details: {
        start_date: '01 Mar 2023',
        end_date: '28 Feb 2033',
        coverage_amount: '$100,000',
        premium_amount: '$1,800',
        payment_frequency: 'annually',
        beneficiaries: ['Jane Brown (Spouse)', 'Thomas Brown (Child)'],
      },
      status: 'active',
      documents: ['life_policy.pdf', 'health_declaration.pdf', 'beneficiary_form.pdf'],
      claims_count: 0,
      created_at: '25 Feb 2023',
    },
    {
      id: 'POL-10004',
      policy_number: 'PROP-2023-112',
      user: {
        id: 'USR-004',
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '+233 55 678 1234',
      },
      provider: {
        id: 'INS-004',
        name: 'Secure Property Insurance',
        logo: '/assets/images/insurance/secure-property.png',
      },
      type: 'property',
      coverage_details: {
        start_date: '15 Apr 2023',
        end_date: '14 Apr 2024',
        coverage_amount: '$250,000',
        premium_amount: '$1,500',
        payment_frequency: 'annually',
      },
      status: 'active',
      documents: ['property_policy.pdf', 'property_valuation.pdf'],
      claims_count: 1,
      created_at: '10 Apr 2023',
    },
    {
      id: 'POL-10005',
      policy_number: 'TRVL-2023-067',
      user: {
        id: 'USR-005',
        name: 'David Wilson',
        email: 'david@example.com',
        phone: '+233 50 345 6789',
      },
      provider: {
        id: 'INS-005',
        name: 'Global Travel Protect',
        logo: '/assets/images/insurance/global-travel.png',
      },
      type: 'travel',
      coverage_details: {
        start_date: '10 May 2023',
        end_date: '24 May 2023',
        coverage_amount: '$25,000',
        premium_amount: '$120',
        payment_frequency: 'one-time',
      },
      status: 'expired',
      documents: ['travel_policy.pdf', 'itinerary.pdf'],
      claims_count: 0,
      created_at: '01 May 2023',
    },
    {
      id: 'POL-10006',
      policy_number: 'BUSI-2023-023',
      user: {
        id: 'USR-006',
        name: 'Jennifer Adams',
        email: 'jennifer@example.com',
        phone: '+233 24 789 0123',
      },
      provider: {
        id: 'INS-006',
        name: 'Business Guard Insurance',
        logo: '/assets/images/insurance/business-guard.png',
      },
      type: 'business',
      coverage_details: {
        start_date: '01 Jun 2023',
        end_date: '31 May 2024',
        coverage_amount: '$500,000',
        premium_amount: '$4,800',
        payment_frequency: 'quarterly',
      },
      status: 'pending',
      documents: ['business_policy.pdf', 'business_registration.pdf', 'risk_assessment.pdf'],
      claims_count: 0,
      created_at: '25 May 2023',
    },
  ];
  
  // Apply filters
  let filteredPolicies = policies.filter((policy) => {
    const matchesSearch = 
      policy.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === 'all' || policy.type === filterType;
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    
    // Date filters
    let matchesDateFrom = true;
    let matchesDateTo = true;
    
    if (filterDateFrom) {
      // This is a simplified check - in production, we would convert dates properly
      matchesDateFrom = policy.coverage_details.start_date >= filterDateFrom;
    }
    
    if (filterDateTo) {
      // This is a simplified check - in production, we would convert dates properly
      matchesDateTo = policy.coverage_details.end_date <= filterDateTo;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
  });
  
  // Apply limit if provided
  if (limit && filteredPolicies.length > limit) {
    filteredPolicies = filteredPolicies.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: InsurancePolicy['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'pending':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: InsurancePolicy['type']) => {
    switch (type) {
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
  
  // Handle policy details view
  const handleViewDetails = (policy: InsurancePolicy) => {
    setCurrentPolicy(policy);
    setShowDetailsModal(true);
  };

  // Handle policy actions
  const handlePolicyAction = (policy: InsurancePolicy, action: 'approve' | 'reject' | 'cancel' | 'renew' | 'suspend') => {
    setCurrentPolicy(policy);
    setPolicyAction(action);
    setShowActionModal(true);
  };

  // Handle policy action confirmation
  const handlePolicyActionConfirmation = async (policyId: string, action: string, reason: string, additionalData?: any) => {
    console.log(`${action} policy ${policyId}:`, reason, additionalData);
    alert(`Successfully ${action}d policy ${policyId}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return dateString;
  };

  return (
    <>
      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3} className="mb-2">
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="Policy number, name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="secondary">
                      <IconifyIcon icon="ri:search-line" />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="health">Health</option>
                    <option value="auto">Auto</option>
                    <option value="life">Life</option>
                    <option value="property">Property</option>
                    <option value="travel">Travel</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={1} className="mb-2 d-flex align-items-end">
                <Button variant="light" className="w-100" onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}>
                  Reset
                </Button>
              </Col>
            </Row>
            
            <Row className="mt-2">
              <Col xs={12} className="d-flex justify-content-between">
                <div>
                  <span className="text-muted me-2">Total: {filteredPolicies.length} policies</span>
                </div>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <IconifyIcon icon="ri:download-2-line" className="me-1" />
                    Export CSV
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <IconifyIcon icon="ri:printer-line" className="me-1" />
                    Print
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Policies Table */}
      <div className="table-responsive">
        <Table className="table-centered table-nowrap mb-0">
          <thead>
            <tr>
              <th>Policy Number</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Type</th>
              <th>Coverage</th>
              <th>Premium</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.map((policy) => (
              <tr key={policy.id}>
                <td>
                  <div className="d-flex flex-column">
                    <h5 className="font-14 mb-0">{policy.policy_number}</h5>
                    <span className="text-muted font-13">{policy.id}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <h5 className="font-14 mb-0">{policy.user.name}</h5>
                    <span className="text-muted font-13">{policy.user.email}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <img 
                      src={policy.provider.logo} 
                      alt={policy.provider.name} 
                      height="24" 
                      className="me-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                      }}
                    />
                    <span>{policy.provider.name}</span>
                  </div>
                </td>
                <td>
                  <Badge bg={getTypeBadgeVariant(policy.type)}>
                    {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}
                  </Badge>
                </td>
                <td>
                  <div>
                    <div>{policy.coverage_details.coverage_amount}</div>
                    <small className="text-muted">
                      {formatDate(policy.coverage_details.start_date)} - {formatDate(policy.coverage_details.end_date)}
                    </small>
                  </div>
                </td>
                <td>
                  <div>{policy.coverage_details.premium_amount}</div>
                  <small className="text-muted">
                    {policy.coverage_details.payment_frequency.charAt(0).toUpperCase() + policy.coverage_details.payment_frequency.slice(1)}
                  </small>
                </td>
                <td>
                  <Badge bg={getStatusBadgeVariant(policy.status)}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(policy)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                        View Documents
                      </Dropdown.Item>
                      {policy.status === 'active' && (
                        <Dropdown.Item>
                          <IconifyIcon icon="ri:hand-coin-line" className="me-1" />
                          File Claim
                        </Dropdown.Item>
                      )}
                      {policy.status === 'pending' && (
                        <>
                          <Dropdown.Item onClick={() => handlePolicyAction(policy, 'approve')}>
                            <IconifyIcon icon="ri:check-double-line" className="me-1" />
                            Approve
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handlePolicyAction(policy, 'reject')}>
                            <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                            Reject
                          </Dropdown.Item>
                        </>
                      )}
                      {policy.status === 'active' && (
                        <>
                          <Dropdown.Item onClick={() => handlePolicyAction(policy, 'suspend')}>
                            <IconifyIcon icon="ri:pause-line" className="me-1" />
                            Suspend Policy
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handlePolicyAction(policy, 'cancel')}>
                            <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                            Cancel Policy
                          </Dropdown.Item>
                        </>
                      )}
                      {policy.status === 'expired' && (
                        <Dropdown.Item onClick={() => handlePolicyAction(policy, 'renew')}>
                          <IconifyIcon icon="ri:refresh-line" className="me-1" />
                          Renew Policy
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {filteredPolicies.length === 0 && (
          <div className="text-center py-4">
            <IconifyIcon icon="ri:search-line" className="font-36 text-muted" />
            <h5 className="mt-2">No policies found</h5>
            <p className="text-muted">Try adjusting your search or filter parameters</p>
          </div>
        )}
      </div>
      
      {/* Policy Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Policy Details: {currentPolicy?.policy_number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPolicy && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Policy Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Policy Number:</td>
                        <td>{currentPolicy.policy_number}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">ID:</td>
                        <td>{currentPolicy.id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Type:</td>
                        <td>
                          <Badge bg={getTypeBadgeVariant(currentPolicy.type)}>
                            {currentPolicy.type.charAt(0).toUpperCase() + currentPolicy.type.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Status:</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(currentPolicy.status)}>
                            {currentPolicy.status.charAt(0).toUpperCase() + currentPolicy.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Created On:</td>
                        <td>{currentPolicy.created_at}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Claims Filed:</td>
                        <td>{currentPolicy.claims_count}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Coverage Details</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Coverage Amount:</td>
                        <td>{currentPolicy.coverage_details.coverage_amount}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Premium:</td>
                        <td>{currentPolicy.coverage_details.premium_amount}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Payment Frequency:</td>
                        <td>{currentPolicy.coverage_details.payment_frequency.charAt(0).toUpperCase() + currentPolicy.coverage_details.payment_frequency.slice(1)}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Start Date:</td>
                        <td>{currentPolicy.coverage_details.start_date}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">End Date:</td>
                        <td>{currentPolicy.coverage_details.end_date}</td>
                      </tr>
                      {currentPolicy.coverage_details.beneficiaries && (
                        <tr>
                          <td className="text-muted">Beneficiaries:</td>
                          <td>
                            <ul className="mb-0 ps-3">
                              {currentPolicy.coverage_details.beneficiaries.map((beneficiary, index) => (
                                <li key={index}>{beneficiary}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>{currentPolicy.user.name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Email:</td>
                        <td>{currentPolicy.user.email}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Phone:</td>
                        <td>{currentPolicy.user.phone}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Customer ID:</td>
                        <td>{currentPolicy.user.id}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Provider Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={currentPolicy.provider.logo} 
                              alt={currentPolicy.provider.name} 
                              height="24" 
                              className="me-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                              }}
                            />
                            <span>{currentPolicy.provider.name}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Provider ID:</td>
                        <td>{currentPolicy.provider.id}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <Row>
                <Col xs={12}>
                  <h5>Documents</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {currentPolicy.documents.map((doc, index) => (
                      <Button key={index} variant="outline-secondary" size="sm">
                        <IconifyIcon icon="ri:file-pdf-line" className="me-1" />
                        {doc}
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {currentPolicy && currentPolicy.status === 'active' && (
            <Button variant="primary">
              <IconifyIcon icon="ri:hand-coin-line" className="me-1" />
              File Claim
            </Button>
          )}
          {currentPolicy && currentPolicy.status === 'pending' && (
            <>
              <Button variant="success" onClick={() => handlePolicyAction(currentPolicy, 'approve')}>
                <IconifyIcon icon="ri:check-double-line" className="me-1" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => handlePolicyAction(currentPolicy, 'reject')}>
                <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                Reject
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Policy Action Modal */}
      <PolicyActionModal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        policy={currentPolicy}
        action={policyAction}
        onConfirm={handlePolicyActionConfirmation}
      />
    </>
  );
};

export default PolicyManagementTable;
