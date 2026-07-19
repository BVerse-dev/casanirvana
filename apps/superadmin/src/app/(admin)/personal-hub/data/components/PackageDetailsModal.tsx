"use client";

import React from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

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

interface PackageDetailsModalProps {
  show: boolean;
  onHide: () => void;
  dataPackage: DataPackage | null;
  onEdit?: (dataPackage: DataPackage) => void;
  onStatusChange?: (dataPackage: DataPackage, newStatus: 'active' | 'inactive') => void;
}

const PackageDetailsModal: React.FC<PackageDetailsModalProps> = ({ 
  show, 
  onHide, 
  dataPackage,
  onEdit,
  onStatusChange
}) => {
  if (!dataPackage) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: DataPackage['status']) => {
    return status === 'active' ? 'success' : 'secondary';
  };

  // Mock extended data for the package
  const extendedPackage = {
    ...dataPackage,
    addedDate: '10 Feb 2023',
    lastModified: '5 hours ago',
    totalRevenue: dataPackage.salesCount * parseFloat(dataPackage.price.replace('$', '')),
    conversionRate: 12.5, // percentage
    averageRating: 4.3,
    totalReviews: 156,
    popularityRank: dataPackage.isFeatured ? 'Top 5' : 'Top 20',
    competitorPrices: [
      { provider: 'MTN', price: '$1.99' },
      { provider: 'Telecel', price: '$1.89' },
      { provider: 'AirtelTigo', price: '$1.79' }
    ],
    salesTrend: [
      { period: 'This Month', sales: Math.floor(dataPackage.salesCount * 0.3), change: '+15%' },
      { period: 'Last Month', sales: Math.floor(dataPackage.salesCount * 0.25), change: '+8%' },
      { period: '3 Months Ago', sales: Math.floor(dataPackage.salesCount * 0.2), change: '-2%' }
    ],
    userFeedback: [
      { comment: 'Great value for money!', rating: 5, user: 'John D.' },
      { comment: 'Fast activation and reliable', rating: 4, user: 'Sarah M.' },
      { comment: 'Could be cheaper', rating: 3, user: 'Mike R.' }
    ],
    technicalSpecs: {
      networkType: '4G/5G',
      speedLimit: 'Unlimited',
      rolloverEnabled: false,
      shareableData: true,
      autoRenewal: false
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <img 
            src={dataPackage.provider.logo} 
            alt={dataPackage.provider.name} 
            height="32" 
            className="me-2 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
            }}
          />
          {dataPackage.name} - Package Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Package Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(dataPackage.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={dataPackage.status === 'active' ? 'ri:check-line' : 'ri:close-line'} 
                className="me-1" 
              />
              {dataPackage.status.charAt(0).toUpperCase() + dataPackage.status.slice(1)}
            </Badge>
            {dataPackage.isFeatured && (
              <Badge bg="warning" className="px-3 py-2">
                <IconifyIcon icon="ri:star-line" className="me-1" />
                Featured
              </Badge>
            )}
          </div>
          <h4 className="mb-1">{dataPackage.dataAmount} for {dataPackage.validityDays} {dataPackage.validityDays === 1 ? 'day' : 'days'}</h4>
          <p className="text-muted mb-0">{dataPackage.price} • {dataPackage.salesCount.toLocaleString()} total sales</p>
        </div>

        <Row>
          {/* Basic Information */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Package Information</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Package ID:</td>
                      <td>{dataPackage.id}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Name:</td>
                      <td>{dataPackage.name}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Provider:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={dataPackage.provider.logo} 
                            alt={dataPackage.provider.name} 
                            height="20" 
                            className="me-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
                            }}
                          />
                          {dataPackage.provider.name}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Data Amount:</td>
                      <td>{dataPackage.dataAmount}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Validity:</td>
                      <td>{dataPackage.validityDays} {dataPackage.validityDays === 1 ? 'day' : 'days'}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Price:</td>
                      <td>{dataPackage.price}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Added Date:</td>
                      <td>{extendedPackage.addedDate}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Last Modified:</td>
                      <td>{extendedPackage.lastModified}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Technical Specifications */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Technical Specifications</h6>
              </Card.Header>
              <Card.Body>
                <Table className="table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Network Type:</td>
                      <td>
                        <Badge bg="info">{extendedPackage.technicalSpecs.networkType}</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Speed Limit:</td>
                      <td>{extendedPackage.technicalSpecs.speedLimit}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Rollover:</td>
                      <td>
                        <Badge bg={extendedPackage.technicalSpecs.rolloverEnabled ? 'success' : 'secondary'}>
                          {extendedPackage.technicalSpecs.rolloverEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Data Sharing:</td>
                      <td>
                        <Badge bg={extendedPackage.technicalSpecs.shareableData ? 'success' : 'secondary'}>
                          {extendedPackage.technicalSpecs.shareableData ? 'Allowed' : 'Not Allowed'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Auto Renewal:</td>
                      <td>
                        <Badge bg={extendedPackage.technicalSpecs.autoRenewal ? 'success' : 'secondary'}>
                          {extendedPackage.technicalSpecs.autoRenewal ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance & Analytics */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Performance Metrics</h6>
              </Card.Header>
              <Card.Body>
                <Row className="text-center mb-3">
                  <Col xs={4} className="border-end">
                    <h5 className="text-primary mb-1">${extendedPackage.totalRevenue.toLocaleString()}</h5>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </Col>
                  <Col xs={4} className="border-end">
                    <h5 className="text-success mb-1">{extendedPackage.conversionRate}%</h5>
                    <p className="text-muted mb-0">Conversion Rate</p>
                  </Col>
                  <Col xs={4}>
                    <h5 className="text-warning mb-1">{extendedPackage.popularityRank}</h5>
                    <p className="text-muted mb-0">Popularity</p>
                  </Col>
                </Row>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">Customer Rating:</span>
                    <span>{extendedPackage.averageRating}/5.0</span>
                  </div>
                  <ProgressBar 
                    now={(extendedPackage.averageRating / 5) * 100} 
                    variant="warning"
                    className="mb-1"
                  />
                  <small className="text-muted">Based on {extendedPackage.totalReviews} reviews</small>
                </div>
              </Card.Body>
            </Card>

            {/* Competitor Analysis */}
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Competitor Pricing</h6>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table className="table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Provider</th>
                        <th>Price</th>
                        <th>Comparison</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extendedPackage.competitorPrices.map((competitor, index) => {
                        const currentPrice = parseFloat(dataPackage.price.replace('$', ''));
                        const competitorPrice = parseFloat(competitor.price.replace('$', ''));
                        const difference = currentPrice - competitorPrice;
                        
                        return (
                          <tr key={index}>
                            <td>{competitor.provider}</td>
                            <td>{competitor.price}</td>
                            <td>
                              {difference === 0 ? (
                                <Badge bg="secondary">Same</Badge>
                              ) : difference > 0 ? (
                                <Badge bg="danger">+${Math.abs(difference).toFixed(2)}</Badge>
                              ) : (
                                <Badge bg="success">-${Math.abs(difference).toFixed(2)}</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sales Trend */}
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Sales Trend</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table className="table-sm mb-0">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Sales</th>
                    <th>Change</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {extendedPackage.salesTrend.map((trend, index) => (
                    <tr key={index}>
                      <td>{trend.period}</td>
                      <td>{trend.sales.toLocaleString()}</td>
                      <td>
                        <span className={trend.change.startsWith('+') ? 'text-success' : 'text-danger'}>
                          <IconifyIcon 
                            icon={trend.change.startsWith('+') ? 'ri:arrow-up-line' : 'ri:arrow-down-line'} 
                            className="me-1" 
                          />
                          {trend.change}
                        </span>
                      </td>
                      <td>
                        <ProgressBar 
                          now={Math.abs(parseFloat(trend.change.replace('%', '').replace('+', '').replace('-', '')))} 
                          variant={trend.change.startsWith('+') ? 'success' : 'danger'}
                          style={{ height: '8px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* User Feedback */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Recent User Feedback</h6>
            <Button variant="outline-primary" size="sm">
              View All Reviews
            </Button>
          </Card.Header>
          <Card.Body>
            {extendedPackage.userFeedback.map((feedback, index) => (
              <div key={index} className="d-flex mb-3">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                    {feedback.user.charAt(0)}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <h6 className="mb-0 me-2">{feedback.user}</h6>
                    <div className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <IconifyIcon 
                          key={i}
                          icon={i < feedback.rating ? 'ri:star-fill' : 'ri:star-line'} 
                          className="font-12"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted mb-0">{feedback.comment}</p>
                </div>
              </div>
            ))}
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
        <Button 
          variant={dataPackage.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(dataPackage, dataPackage.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={dataPackage.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {dataPackage.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(dataPackage)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Package
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PackageDetailsModal;
