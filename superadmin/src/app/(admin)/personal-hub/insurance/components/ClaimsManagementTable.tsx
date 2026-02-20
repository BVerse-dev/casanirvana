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
import AddClaimNoteModal from './AddClaimNoteModal';
import ClaimActionModal from './ClaimActionModal';

interface InsuranceClaim {
  id: string;
  claim_number: string;
  policy: {
    id: string;
    policy_number: string;
    type: 'health' | 'auto' | 'life' | 'property' | 'travel' | 'business' | 'other';
  };
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
  claim_details: {
    date_filed: string;
    incident_date: string;
    description: string;
    amount_requested: string;
    amount_approved?: string;
    documents: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';
  notes: string[];
  last_updated: string;
}

interface ClaimsManagementTableProps {
  showFilters?: boolean;
  limit?: number;
}

const ClaimsManagementTable = ({ showFilters = false, limit }: ClaimsManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentClaim, setCurrentClaim] = useState<InsuranceClaim | null>(null);
  const [claimAction, setClaimAction] = useState<'start_review' | 'approve' | 'reject' | 'request_info' | 'process_payment'>('start_review');
  
  // Sample data - would be fetched from API in production
  const claims: InsuranceClaim[] = [
    {
      id: 'CLM-10001',
      claim_number: 'HLTH-CLM-001',
      policy: {
        id: 'POL-10001',
        policy_number: 'HLTH-2023-001',
        type: 'health',
      },
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
      claim_details: {
        date_filed: '15 Jun 2023',
        incident_date: '10 Jun 2023',
        description: 'Hospital admission for malaria treatment',
        amount_requested: '$1,200',
        amount_approved: '$1,000',
        documents: ['medical_report.pdf', 'hospital_bill.pdf', 'prescription.pdf'],
      },
      status: 'approved',
      notes: [
        'Claim submitted with all required documents',
        'Medical report verified with hospital',
        'Approved with partial payment due to policy limits',
      ],
      last_updated: '20 Jun 2023',
    },
    {
      id: 'CLM-10002',
      claim_number: 'AUTO-CLM-045',
      policy: {
        id: 'POL-10002',
        policy_number: 'AUTO-2023-045',
        type: 'auto',
      },
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
      claim_details: {
        date_filed: '05 Jul 2023',
        incident_date: '01 Jul 2023',
        description: 'Minor collision damage to front bumper',
        amount_requested: '$800',
        documents: ['accident_report.pdf', 'police_report.pdf', 'repair_estimate.pdf', 'photos.zip'],
      },
      status: 'under_review',
      notes: [
        'Claim submitted with all required documents',
        'Awaiting assessment from approved garage',
      ],
      last_updated: '10 Jul 2023',
    },
    {
      id: 'CLM-10003',
      claim_number: 'PROP-CLM-112',
      policy: {
        id: 'POL-10004',
        policy_number: 'PROP-2023-112',
        type: 'property',
      },
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
      claim_details: {
        date_filed: '20 Jul 2023',
        incident_date: '15 Jul 2023',
        description: 'Water damage from burst pipe affecting kitchen and living room',
        amount_requested: '$3,500',
        documents: ['damage_report.pdf', 'plumber_invoice.pdf', 'photos.zip'],
      },
      status: 'pending',
      notes: [
        'Claim submitted with initial documentation',
        'Awaiting property inspection report',
      ],
      last_updated: '22 Jul 2023',
    },
    {
      id: 'CLM-10004',
      claim_number: 'HLTH-CLM-078',
      policy: {
        id: 'POL-10001',
        policy_number: 'HLTH-2023-001',
        type: 'health',
      },
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
      claim_details: {
        date_filed: '10 Aug 2023',
        incident_date: '05 Aug 2023',
        description: 'Outpatient consultation and medication for typhoid',
        amount_requested: '$350',
        amount_approved: '$350',
        documents: ['medical_report.pdf', 'pharmacy_receipt.pdf', 'doctor_note.pdf'],
      },
      status: 'paid',
      notes: [
        'Claim submitted with all required documents',
        'Verified with healthcare provider',
        'Payment processed on August 15th',
      ],
      last_updated: '15 Aug 2023',
    },
    {
      id: 'CLM-10005',
      claim_number: 'AUTO-CLM-067',
      policy: {
        id: 'POL-10002',
        policy_number: 'AUTO-2023-045',
        type: 'auto',
      },
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
      claim_details: {
        date_filed: '25 Aug 2023',
        incident_date: '22 Aug 2023',
        description: 'Windshield cracked by stone impact',
        amount_requested: '$450',
        documents: ['damage_report.pdf', 'repair_quote.pdf', 'photos.zip'],
      },
      status: 'rejected',
      notes: [
        'Claim submitted with required documents',
        'Policy does not cover windshield damage in the selected plan',
        'Customer notified of rejection reason',
      ],
      last_updated: '30 Aug 2023',
    },
  ];
  
  // Apply filters
  let filteredClaims = claims.filter((claim) => {
    const matchesSearch = 
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === 'all' || claim.policy.type === filterType;
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    
    // Date filters
    let matchesDateFrom = true;
    let matchesDateTo = true;
    
    if (filterDateFrom) {
      // This is a simplified check - in production, we would convert dates properly
      matchesDateFrom = claim.claim_details.date_filed >= filterDateFrom;
    }
    
    if (filterDateTo) {
      // This is a simplified check - in production, we would convert dates properly
      matchesDateTo = claim.claim_details.date_filed <= filterDateTo;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
  });
  
  // Apply limit if provided
  if (limit && filteredClaims.length > limit) {
    filteredClaims = filteredClaims.slice(0, limit);
  }
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'paid':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: InsuranceClaim['policy']['type']) => {
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
  
  // Format status for display
  const formatStatus = (status: InsuranceClaim['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Handle claim details view
  const handleViewDetails = (claim: InsuranceClaim) => {
    setCurrentClaim(claim);
    setShowDetailsModal(true);
  };

  // Handle claim actions
  const handleClaimAction = (claim: InsuranceClaim, action: 'start_review' | 'approve' | 'reject' | 'request_info' | 'process_payment') => {
    setCurrentClaim(claim);
    setClaimAction(action);
    setShowActionModal(true);
  };

  // Handle claim action confirmation
  const handleClaimActionConfirmation = async (claimId: string, action: string, reason: string, additionalData?: any) => {
    console.log(`${action} claim ${claimId}:`, reason, additionalData);
    alert(`Successfully processed ${action} for claim ${claimId}`);
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
                      placeholder="Claim number, name..."
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
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={2} className="mb-2">
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
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
                  <span className="text-muted me-2">Total: {filteredClaims.length} claims</span>
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
      
      {/* Claims Table */}
      <div className="table-responsive">
        <Table className="table-centered table-nowrap mb-0">
          <thead>
            <tr>
              <th>Claim Number</th>
              <th>Customer</th>
              <th>Policy</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Filed Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <div className="d-flex flex-column">
                    <h5 className="font-14 mb-0">{claim.claim_number}</h5>
                    <span className="text-muted font-13">{claim.id}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <h5 className="font-14 mb-0">{claim.user.name}</h5>
                    <span className="text-muted font-13">{claim.user.email}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <Badge bg={getTypeBadgeVariant(claim.policy.type)} className="me-1">
                      {claim.policy.type.charAt(0).toUpperCase() + claim.policy.type.slice(1)}
                    </Badge>
                    <span>{claim.policy.policy_number}</span>
                  </div>
                </td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '200px' }}>
                    {claim.claim_details.description}
                  </div>
                </td>
                <td>
                  <div>{claim.claim_details.amount_requested}</div>
                  {claim.claim_details.amount_approved && (
                    <small className="text-success">
                      Approved: {claim.claim_details.amount_approved}
                    </small>
                  )}
                </td>
                <td>
                  <div>{claim.claim_details.date_filed}</div>
                  <small className="text-muted">
                    Updated: {claim.last_updated}
                  </small>
                </td>
                <td>
                  <Badge bg={getStatusBadgeVariant(claim.status)}>
                    {formatStatus(claim.status)}
                  </Badge>
                </td>
                <td>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                      <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleViewDetails(claim)}>
                        <IconifyIcon icon="ri:eye-line" className="me-1" />
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
                        View Documents
                      </Dropdown.Item>
                      {claim.status === 'pending' && (
                        <>
                          <Dropdown.Item onClick={() => handleClaimAction(claim, 'start_review')}>
                            <IconifyIcon icon="ri:check-line" className="me-1" />
                            Start Review
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleClaimAction(claim, 'request_info')}>
                            <IconifyIcon icon="ri:question-line" className="me-1" />
                            Request Info
                          </Dropdown.Item>
                        </>
                      )}
                      {claim.status === 'under_review' && (
                        <>
                          <Dropdown.Item onClick={() => handleClaimAction(claim, 'approve')}>
                            <IconifyIcon icon="ri:check-double-line" className="me-1" />
                            Approve
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleClaimAction(claim, 'reject')}>
                            <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                            Reject
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleClaimAction(claim, 'request_info')}>
                            <IconifyIcon icon="ri:question-line" className="me-1" />
                            Request Info
                          </Dropdown.Item>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <Dropdown.Item onClick={() => handleClaimAction(claim, 'process_payment')}>
                          <IconifyIcon icon="ri:bank-card-line" className="me-1" />
                          Process Payment
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item onClick={() => {
                        setCurrentClaim(claim);
                        setShowAddNoteModal(true);
                      }}>
                        <IconifyIcon icon="ri:message-3-line" className="me-1" />
                        Add Note
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {filteredClaims.length === 0 && (
          <div className="text-center py-4">
            <IconifyIcon icon="ri:search-line" className="font-36 text-muted" />
            <h5 className="mt-2">No claims found</h5>
            <p className="text-muted">Try adjusting your search or filter parameters</p>
          </div>
        )}
      </div>
      
      {/* Claim Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Claim Details: {currentClaim?.claim_number}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentClaim && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Claim Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Claim Number:</td>
                        <td>{currentClaim.claim_number}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">ID:</td>
                        <td>{currentClaim.id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Status:</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(currentClaim.status)}>
                            {formatStatus(currentClaim.status)}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Date Filed:</td>
                        <td>{currentClaim.claim_details.date_filed}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Incident Date:</td>
                        <td>{currentClaim.claim_details.incident_date}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Last Updated:</td>
                        <td>{currentClaim.last_updated}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Policy Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Policy Number:</td>
                        <td>{currentClaim.policy.policy_number}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Policy ID:</td>
                        <td>{currentClaim.policy.id}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Type:</td>
                        <td>
                          <Badge bg={getTypeBadgeVariant(currentClaim.policy.type)}>
                            {currentClaim.policy.type.charAt(0).toUpperCase() + currentClaim.policy.type.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Provider:</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={currentClaim.provider.logo} 
                              alt={currentClaim.provider.name} 
                              height="24" 
                              className="me-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                              }}
                            />
                            <span>{currentClaim.provider.name}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col xs={12}>
                  <h5>Claim Details</h5>
                  <Card>
                    <Card.Body>
                      <h6>Description</h6>
                      <p>{currentClaim.claim_details.description}</p>
                      
                      <Row>
                        <Col md={6}>
                          <h6>Amount Requested</h6>
                          <p className="font-16 fw-bold">{currentClaim.claim_details.amount_requested}</p>
                        </Col>
                        <Col md={6}>
                          <h6>Amount Approved</h6>
                          <p className="font-16 fw-bold">
                            {currentClaim.claim_details.amount_approved || 'Pending'}
                          </p>
                        </Col>
                      </Row>
                      
                      <h6>Documents</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {currentClaim.claim_details.documents.map((doc, index) => (
                          <Button key={index} variant="outline-secondary" size="sm">
                            <IconifyIcon 
                              icon={doc.endsWith('.pdf') ? 'ri:file-pdf-line' : 
                                    doc.endsWith('.zip') ? 'ri:file-zip-line' : 'ri:file-line'} 
                              className="me-1" 
                            />
                            {doc}
                          </Button>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <Table size="sm" className="table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>{currentClaim.user.name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Email:</td>
                        <td>{currentClaim.user.email}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Phone:</td>
                        <td>{currentClaim.user.phone}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Customer ID:</td>
                        <td>{currentClaim.user.id}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Notes & History</h5>
                  <div className="border-start border-2 ps-3 ms-3">
                    {currentClaim.notes.map((note, index) => (
                      <div key={index} className="mb-2">
                        <small className="text-muted">
                          {index === 0 ? currentClaim.claim_details.date_filed : 
                           index === currentClaim.notes.length - 1 ? currentClaim.last_updated : ''}
                        </small>
                        <p className="mb-0">{note}</p>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
              
              {/* Add Note Section */}
              <Row>
                <Col xs={12}>
                  <h5>Add Note</h5>
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => setShowAddNoteModal(true)}
                    >
                      <IconifyIcon icon="ri:add-line" className="me-1" />
                      Add Note
                    </Button>
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
          {currentClaim && currentClaim.status === 'pending' && (
            <Button variant="primary" onClick={() => handleClaimAction(currentClaim, 'start_review')}>
              <IconifyIcon icon="ri:check-line" className="me-1" />
              Start Review
            </Button>
          )}
          {currentClaim && currentClaim.status === 'under_review' && (
            <>
              <Button variant="success" onClick={() => handleClaimAction(currentClaim, 'approve')}>
                <IconifyIcon icon="ri:check-double-line" className="me-1" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => handleClaimAction(currentClaim, 'reject')}>
                <IconifyIcon icon="ri:close-circle-line" className="me-1" />
                Reject
              </Button>
            </>
          )}
          {currentClaim && currentClaim.status === 'approved' && (
            <Button variant="primary" onClick={() => handleClaimAction(currentClaim, 'process_payment')}>
              <IconifyIcon icon="ri:bank-card-line" className="me-1" />
              Process Payment
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Add Claim Note Modal */}
      {currentClaim && (
        <AddClaimNoteModal
          show={showAddNoteModal}
          onHide={() => setShowAddNoteModal(false)}
          onSave={handleSaveNote}
          claimId={currentClaim.id}
          claimNumber={currentClaim.claim_number}
        />
      )}

      {/* Claim Action Modal */}
      <ClaimActionModal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        claim={currentClaim}
        action={claimAction}
        onConfirm={handleClaimActionConfirmation}
      />
    </>
  );

  // Handler for saving note data
  function handleSaveNote(noteData: any) {
    // In a real application, this would call an API to save the note
    console.log('Saving claim note:', noteData);
    
    // For now, just show a success message
    alert(`Note added to claim ${noteData.claim_id} successfully!`);
  }
};

export default ClaimsManagementTable;
