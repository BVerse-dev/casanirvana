"use client";

import React from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

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

interface ProviderDetailsModalProps {
  show: boolean;
  onHide: () => void;
  provider: InsuranceProvider | null;
  onEdit?: (provider: InsuranceProvider) => void;
  onStatusChange?: (provider: InsuranceProvider, newStatus: string) => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ 
  show, 
  onHide, 
  provider,
  onEdit,
  onStatusChange
}) => {
  if (!provider) return null;

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

  // Get integration badge variant
  const getIntegrationBadgeVariant = (type: InsuranceProvider['integration_type']) => {
    switch (type) {
      case 'api':
        return 'success';
      case 'manual':
        return 'warning';
      case 'hybrid':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the provider
  const extendedProvider = {
    ...provider,
    addedDate: '20 Jan 2023',
    lastActivity: '4 hours ago',
    apiEndpoint: provider.integration_type === 'api' || provider.integration_type === 'hybrid' 
      ? `https://api.${provider.name.toLowerCase().replace(/\s+/g, '')}.com/v1/insurance`
      : 'Manual Processing',
    apiStatus: provider.status === 'active' && (provider.integration_type === 'api' || provider.integration_type === 'hybrid') ? 'Connected' : 'Disconnected',
    totalRevenue: parseFloat(provider.premium_volume.replace('$', '').replace(',', '')) * (parseFloat(provider.commission_rate.replace('%', '')) / 100),
    monthlyGrowth: '+22.8%',
    claimsProcessed: 47,
    claimsApprovalRate: 89.4,
    avgClaimProcessingTime: '3.2 days',
    customerSatisfaction: 4.6,
    complianceScore: 96,
    licenseExpiryDate: '15 Dec 2024',
    agreementRenewalDate: '30 Jun 2024',
    supportResponse: '< 2 hours',
    website: `https://www.${provider.name.toLowerCase().replace(/\s+/g, '')}.com`,
    recentPolicies: [
      { id: 'POL-001', type: 'Health', premium: '$1,200', status: 'active', date: '2 days ago' },
      { id: 'POL-002', type: 'Auto', premium: '$750', status: 'active', date: '5 days ago' },
      { id: 'POL-003', type: 'Life', premium: '$1,800', status: 'pending', date: '1 week ago' },
    ],
    performanceMetrics: [
      { metric: 'Monthly Premium', value: `$${(parseFloat(provider.premium_volume.replace('$', '').replace(',', '')) / 12).toFixed(0)}`, change: '+15.2%' },
      { metric: 'Active Policies', value: provider.policy_count.toString(), change: '+8.7%' },
      { metric: 'Claims Ratio', value: '12.3%', change: '-2.1%' },
      { metric: 'Customer Rating', value: '4.6/5', change: '+0.2' }
    ],
    riskAssessment: {
      financial_stability: 'A+',
      market_reputation: 'Excellent',
      regulatory_compliance: 'Fully Compliant',
      claim_settlement_ratio: '94.2%'
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={provider.logo} 
            alt={provider.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {provider.name} - Provider Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Provider Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(provider.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={provider.status === 'active' ? 'ri:check-line' : 
                      provider.status === 'pending' ? 'ri:time-line' : 
                      'ri:pause-line'} 
                className="me-1" 
              />
              {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
            </Badge>
            <Badge bg={getCategoryBadgeVariant(provider.category)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:shield-check-line" className="me-1" />
              {provider.category.charAt(0).toUpperCase() + provider.category.slice(1)} Insurance
            </Badge>
            <Badge bg={getIntegrationBadgeVariant(provider.integration_type)} className="px-3 py-2">
              <IconifyIcon icon="ri:links-line" className="me-1" />
              {provider.integration_type.charAt(0).toUpperCase() + provider.integration_type.slice(1)}
            </Badge>
          </div>
          <h4 className="mb-1">{provider.premium_volume} Premium Volume</h4>
          <p className="text-muted mb-0">{provider.policy_count} active policies • {provider.commission_rate} commission rate</p>
        </div>

        <Row>
          {/* Basic Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Provider Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Provider ID:</td>
                      <td>{provider.id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{provider.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Category:</td>
                      <td>
                        <Badge bg={getCategoryBadgeVariant(provider.category)}>
                          {provider.category}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Integration:</td>
                      <td>
                        <Badge bg={getIntegrationBadgeVariant(provider.integration_type)}>
                          {provider.integration_type}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Added Date:</td>
                      <td>{extendedProvider.addedDate}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Activity:</td>
                      <td>{extendedProvider.lastActivity}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Website:</td>
                      <td>
                        <a href={extendedProvider.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          {extendedProvider.website}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Contact Information */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Contact Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Contact Person:</td>
                      <td>{provider.contact.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Email:</td>
                      <td>
                        <a href={`mailto:${provider.contact.email}`} className="text-decoration-none">
                          {provider.contact.email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Phone:</td>
                      <td>
                        <a href={`tel:${provider.contact.phone}`} className="text-decoration-none">
                          {provider.contact.phone}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Support Response:</td>
                      <td>{extendedProvider.supportResponse}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">API Endpoint:</td>
                      <td>
                        <code className="text-muted">{extendedProvider.apiEndpoint}</code>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance & Metrics */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Performance Metrics</h6>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col xs={6} className="border-end">
                    <h5 className="text-primary mb-1">${extendedProvider.totalRevenue.toLocaleString()}</h5>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </Col>
                  <Col xs={6}>
                    <h5 className="text-success mb-1">{extendedProvider.monthlyGrowth}</h5>
                    <p className="text-muted mb-0">Monthly Growth</p>
                  </Col>
                </Row>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Claims Approval Rate:</span>
                    <span>{extendedProvider.claimsApprovalRate}%</span>
                  </div>
                  <ProgressBar 
                    now={extendedProvider.claimsApprovalRate} 
                    variant={extendedProvider.claimsApprovalRate > 85 ? 'success' : 'warning'}
                    className="mb-2"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Compliance Score:</span>
                    <span>{extendedProvider.complianceScore}/100</span>
                  </div>
                  <ProgressBar 
                    now={extendedProvider.complianceScore} 
                    variant={extendedProvider.complianceScore > 90 ? 'success' : 'warning'}
                    className="mb-2"
                  />
                </div>

                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">API Status:</td>
                      <td>
                        <Badge bg={provider.status === 'active' && (provider.integration_type === 'api' || provider.integration_type === 'hybrid') ? 'success' : 'danger'}>
                          <IconifyIcon 
                            icon={provider.status === 'active' && (provider.integration_type === 'api' || provider.integration_type === 'hybrid') ? 'ri:check-line' : 'ri:close-line'} 
                            className="me-1" 
                          />
                          {extendedProvider.apiStatus}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Claims Processed:</td>
                      <td>{extendedProvider.claimsProcessed}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Avg Processing Time:</td>
                      <td>{extendedProvider.avgClaimProcessingTime}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Customer Rating:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-1">{extendedProvider.customerSatisfaction}/5</span>
                          <div className="text-warning">
                            {[...Array(5)].map((_, i) => (
                              <IconifyIcon 
                                key={i} 
                                icon={i < Math.floor(extendedProvider.customerSatisfaction) ? 'ri:star-fill' : 'ri:star-line'} 
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Risk Assessment */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Risk Assessment</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Financial Stability:</td>
                      <td>
                        <Badge bg="success">{extendedProvider.riskAssessment.financial_stability}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Market Reputation:</td>
                      <td>{extendedProvider.riskAssessment.market_reputation}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Regulatory Compliance:</td>
                      <td>
                        <Badge bg="success">
                          <IconifyIcon icon="ri:check-line" className="me-1" />
                          {extendedProvider.riskAssessment.regulatory_compliance}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Claim Settlement Ratio:</td>
                      <td>{extendedProvider.riskAssessment.claim_settlement_ratio}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Document Status */}
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Document Verification Status</h6>
          </Card.Header>
          <Card.Body>
            <Row className="text-center">
              <Col md={4}>
                <div className="p-3 border rounded">
                  <IconifyIcon 
                    icon={provider.documents.license ? 'ri:shield-check-line' : 'ri:shield-cross-line'} 
                    className={`font-24 mb-2 ${provider.documents.license ? 'text-success' : 'text-danger'}`} 
                  />
                  <h6>Insurance License</h6>
                  <Badge bg={provider.documents.license ? 'success' : 'danger'}>
                    {provider.documents.license ? 'Verified' : 'Missing'}
                  </Badge>
                  {provider.documents.license && (
                    <div className="mt-2">
                      <small className="text-muted">Expires: {extendedProvider.licenseExpiryDate}</small>
                    </div>
                  )}
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 border rounded">
                  <IconifyIcon 
                    icon={provider.documents.agreement ? 'ri:file-check-line' : 'ri:file-cross-line'} 
                    className={`font-24 mb-2 ${provider.documents.agreement ? 'text-success' : 'text-danger'}`} 
                  />
                  <h6>Partnership Agreement</h6>
                  <Badge bg={provider.documents.agreement ? 'success' : 'danger'}>
                    {provider.documents.agreement ? 'Signed' : 'Pending'}
                  </Badge>
                  {provider.documents.agreement && (
                    <div className="mt-2">
                      <small className="text-muted">Renewal: {extendedProvider.agreementRenewalDate}</small>
                    </div>
                  )}
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 border rounded">
                  <IconifyIcon 
                    icon={provider.documents.kyc ? 'ri:user-check-line' : 'ri:user-cross-line'} 
                    className={`font-24 mb-2 ${provider.documents.kyc ? 'text-success' : 'text-danger'}`} 
                  />
                  <h6>KYC Documents</h6>
                  <Badge bg={provider.documents.kyc ? 'success' : 'danger'}>
                    {provider.documents.kyc ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Recent Policies */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Recent Policies</h6>
            <Button variant="outline-primary" size="sm">
              View All Policies
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Policy ID</th>
                    <th>Type</th>
                    <th>Premium</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedProvider.recentPolicies.map((policy, index) => (
                    <tr key={index}>
                      <td>{policy.id}</td>
                      <td>{policy.type}</td>
                      <td>{policy.premium}</td>
                      <td>
                        <Badge bg={policy.status === 'active' ? 'success' : policy.status === 'pending' ? 'warning' : 'danger'}>
                          {policy.status}
                        </Badge>
                      </td>
                      <td>{policy.date}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary">
          <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
          View Analytics
        </Button>
        <Button variant="outline-info">
          <IconifyIcon icon="ri:file-list-3-line" className="me-1" />
          View Policies
        </Button>
        <Button variant="outline-warning">
          <IconifyIcon icon="ri:file-upload-line" className="me-1" />
          Manage Documents
        </Button>
        <Button 
          variant={provider.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(provider, provider.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={provider.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {provider.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(provider)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Provider
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProviderDetailsModal;
