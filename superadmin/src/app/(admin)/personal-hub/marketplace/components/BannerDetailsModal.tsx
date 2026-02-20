"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar, Tabs, Tab, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface PromotionalBanner {
  id: string;
  name: string;
  type: 'promotional' | 'category' | 'advertisement' | 'seasonal';
  position: string;
  image_url: string;
  link_url: string;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  start_date: string;
  end_date: string | null;
  impressions: number;
  clicks: number;
}

interface BannerDetailsModalProps {
  show: boolean;
  onHide: () => void;
  banner: PromotionalBanner | null;
  onEdit?: (banner: PromotionalBanner) => void;
  onStatusChange?: (banner: PromotionalBanner, newStatus: string) => void;
  onDelete?: (banner: PromotionalBanner) => void;
}

const BannerDetailsModal: React.FC<BannerDetailsModalProps> = ({ 
  show, 
  onHide, 
  banner,
  onEdit,
  onStatusChange,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!banner) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: PromotionalBanner['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'scheduled':
        return 'warning';
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: PromotionalBanner['type']) => {
    switch (type) {
      case 'promotional':
        return 'primary';
      case 'category':
        return 'info';
      case 'advertisement':
        return 'warning';
      case 'seasonal':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the banner
  const extendedBanner = {
    ...banner,
    click_rate: ((banner.clicks / banner.impressions) * 100),
    cost_per_click: 0.45,
    total_spend: banner.clicks * 0.45,
    conversion_rate: 3.2,
    conversions: Math.round(banner.clicks * 0.032),
    revenue_generated: Math.round(banner.clicks * 0.032 * 85.50),
    target_audience: {
      age_groups: ['18-24', '25-34', '35-44'],
      interests: ['Beauty', 'Fashion', 'Health'],
      locations: ['Accra', 'Lagos', 'Nairobi']
    },
    display_settings: {
      width: 728,
      height: 90,
      format: 'PNG',
      file_size: '245 KB',
      responsive: true,
      lazy_loading: true
    },
    schedule_details: {
      timezone: 'GMT',
      active_hours: '06:00-22:00',
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      frequency_cap: 3, // max 3 times per user per day
      budget_daily: 150.00,
      budget_total: banner.end_date ? 3000.00 : null
    },
    performance_by_day: [
      { date: '2024-01-20', impressions: 1250, clicks: 71, spend: 31.95 },
      { date: '2024-01-21', impressions: 1380, clicks: 79, spend: 35.55 },
      { date: '2024-01-22', impressions: 1420, clicks: 81, spend: 36.45 },
      { date: '2024-01-23', impressions: 1190, clicks: 68, spend: 30.60 },
      { date: '2024-01-24', impressions: 1350, clicks: 77, spend: 34.65 }
    ],
    creative_variations: [
      {
        id: 'var-001',
        name: 'Original Design',
        impressions: 8500,
        clicks: 485,
        ctr: 5.7,
        status: 'active'
      },
      {
        id: 'var-002',
        name: 'Holiday Theme',
        impressions: 7100,
        clicks: 398,
        ctr: 5.6,
        status: 'paused'
      }
    ],
    placement_performance: [
      { position: 'top-banner', impressions: 9200, clicks: 521, ctr: 5.7 },
      { position: 'sidebar', impressions: 4100, clicks: 205, ctr: 5.0 },
      { position: 'footer', impressions: 2300, clicks: 98, ctr: 4.3 }
    ],
    competitor_analysis: [
      { competitor: 'Brand A', avg_ctr: 4.2, position_overlap: 68 },
      { competitor: 'Brand B', avg_ctr: 3.8, position_overlap: 45 },
      { competitor: 'Brand C', avg_ctr: 5.1, position_overlap: 32 }
    ]
  };

  const isExpired = banner.end_date && new Date(banner.end_date) < new Date();
  const daysRemaining = banner.end_date ? Math.ceil((new Date(banner.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div 
            className="me-2 d-flex align-items-center justify-content-center text-white fw-bold"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(45deg, #6B3AA0, #9B59B6)',
              fontSize: '10px'
            }}
          >
            AD
          </div>
          Banner Details - {banner.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Banner Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(banner.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={banner.status === 'active' ? 'ri:check-line' : 
                      banner.status === 'scheduled' ? 'ri:time-line' : 
                      banner.status === 'expired' ? 'ri:close-line' :
                      'ri:pause-line'} 
                className="me-1" 
              />
              {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
            </Badge>
            <Badge bg={getTypeBadgeVariant(banner.type)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:advertisement-line" className="me-1" />
              {banner.type.charAt(0).toUpperCase() + banner.type.slice(1)}
            </Badge>
            <Badge bg="info" className="px-3 py-2">
              <IconifyIcon icon="ri:map-pin-line" className="me-1" />
              {banner.position}
            </Badge>
          </div>
          <h4 className="mb-1">{banner.impressions.toLocaleString()} Impressions</h4>
          <p className="text-muted mb-0">{banner.clicks} clicks • {extendedBanner.click_rate.toFixed(2)}% CTR • ${extendedBanner.total_spend.toFixed(2)} spent</p>
          
          {/* Schedule Alert */}
          {isExpired && (
            <Alert variant="danger" className="mt-3 mb-0">
              <IconifyIcon icon="ri:error-warning-line" className="me-1" />
              This banner has expired on {new Date(banner.end_date!).toLocaleDateString()}
            </Alert>
          )}
          {daysRemaining && daysRemaining <= 7 && daysRemaining > 0 && (
            <Alert variant="warning" className="mt-3 mb-0">
              <IconifyIcon icon="ri:time-line" className="me-1" />
              This banner will expire in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}
            </Alert>
          )}
        </div>

        {/* Banner Preview */}
        <div className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Banner Preview</h6>
            </Card.Header>
            <Card.Body className="text-center">
              <div 
                className="d-inline-flex align-items-center justify-content-center text-white fw-bold mb-3"
                style={{
                  width: Math.min(extendedBanner.display_settings.width, 400),
                  height: Math.min(extendedBanner.display_settings.height, 80),
                  background: 'linear-gradient(45deg, #6B3AA0, #9B59B6)',
                  borderRadius: 8,
                  fontSize: '14px'
                }}
              >
                {banner.name}
                <IconifyIcon icon="ri:external-link-line" className="ms-2" />
              </div>
              <div>
                <small className="text-muted">
                  {extendedBanner.display_settings.width}x{extendedBanner.display_settings.height} • 
                  {extendedBanner.display_settings.format} • 
                  {extendedBanner.display_settings.file_size}
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-3">
          {/* Overview Tab */}
          <Tab eventKey="overview" title="Overview">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Banner Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Banner ID:</td>
                          <td>{banner.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Name:</td>
                          <td>{banner.name}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Type:</td>
                          <td>
                            <Badge bg={getTypeBadgeVariant(banner.type)}>
                              {banner.type}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Position:</td>
                          <td>
                            <Badge bg="info">{banner.position}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Link URL:</td>
                          <td>
                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              <code>{banner.link_url}</code>
                              <IconifyIcon icon="ri:external-link-line" className="ms-1" />
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Image URL:</td>
                          <td><code>{banner.image_url}</code></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Display Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Dimensions:</td>
                          <td>{extendedBanner.display_settings.width}x{extendedBanner.display_settings.height}px</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Format:</td>
                          <td>{extendedBanner.display_settings.format}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">File Size:</td>
                          <td>{extendedBanner.display_settings.file_size}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Responsive:</td>
                          <td>
                            <Badge bg={extendedBanner.display_settings.responsive ? 'success' : 'secondary'}>
                              {extendedBanner.display_settings.responsive ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Lazy Loading:</td>
                          <td>
                            <Badge bg={extendedBanner.display_settings.lazy_loading ? 'success' : 'secondary'}>
                              {extendedBanner.display_settings.lazy_loading ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Performance Metrics</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="text-center mb-3">
                      <Col xs={4} className="border-end">
                        <h5 className="text-primary mb-1">{extendedBanner.click_rate.toFixed(2)}%</h5>
                        <p className="text-muted mb-0">CTR</p>
                      </Col>
                      <Col xs={4} className="border-end">
                        <h5 className="text-success mb-1">{extendedBanner.conversion_rate}%</h5>
                        <p className="text-muted mb-0">CVR</p>
                      </Col>
                      <Col xs={4}>
                        <h5 className="text-warning mb-1">${extendedBanner.cost_per_click}</h5>
                        <p className="text-muted mb-0">CPC</p>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Click Through Rate:</span>
                        <span>{extendedBanner.click_rate.toFixed(2)}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedBanner.click_rate} 
                        variant={extendedBanner.click_rate > 5 ? 'success' : extendedBanner.click_rate > 2 ? 'warning' : 'danger'}
                        className="mb-2"
                      />
                    </div>

                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Total Clicks:</td>
                          <td>{banner.clicks.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Conversions:</td>
                          <td>{extendedBanner.conversions}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Revenue Generated:</td>
                          <td className="text-success fw-bold">${extendedBanner.revenue_generated.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Total Spend:</td>
                          <td className="text-danger">${extendedBanner.total_spend.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Schedule & Budget</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Start Date:</td>
                          <td>{new Date(banner.start_date).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">End Date:</td>
                          <td>
                            {banner.end_date ? (
                              <span className={isExpired ? 'text-danger' : ''}>
                                {new Date(banner.end_date).toLocaleDateString()}
                                {isExpired && <IconifyIcon icon="ri:error-warning-line" className="ms-1" />}
                              </span>
                            ) : (
                              <span className="text-muted">No end date</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Active Hours:</td>
                          <td>{extendedBanner.schedule_details.active_hours}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Daily Budget:</td>
                          <td>${extendedBanner.schedule_details.budget_daily.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Total Budget:</td>
                          <td>
                            {extendedBanner.schedule_details.budget_total ? 
                              `$${extendedBanner.schedule_details.budget_total.toFixed(2)}` : 
                              'Unlimited'
                            }
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Frequency Cap:</td>
                          <td>{extendedBanner.schedule_details.frequency_cap} per day</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Analytics Tab */}
          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={8}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Performance Over Time (Last 5 Days)</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>CTR</th>
                            <th>Spend</th>
                            <th>CPC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedBanner.performance_by_day.map((day, index) => (
                            <tr key={index}>
                              <td>{new Date(day.date).toLocaleDateString()}</td>
                              <td>{day.impressions.toLocaleString()}</td>
                              <td>{day.clicks}</td>
                              <td>{((day.clicks / day.impressions) * 100).toFixed(2)}%</td>
                              <td>${day.spend.toFixed(2)}</td>
                              <td>${(day.spend / day.clicks).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Placement Performance</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Position</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>CTR</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedBanner.placement_performance.map((placement, index) => (
                            <tr key={index}>
                              <td>
                                <Badge bg="info" className="me-1">
                                  {placement.position}
                                </Badge>
                              </td>
                              <td>{placement.impressions.toLocaleString()}</td>
                              <td>{placement.clicks}</td>
                              <td>{placement.ctr.toFixed(2)}%</td>
                              <td>
                                <ProgressBar 
                                  now={placement.ctr} 
                                  max={6}
                                  variant={placement.ctr > 5 ? 'success' : placement.ctr > 3 ? 'warning' : 'danger'}
                                  style={{height: '8px'}}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Creative Variations</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedBanner.creative_variations.map((variation, index) => (
                      <div key={index} className={`p-3 border rounded ${index > 0 ? 'mt-3' : ''}`}>
                        <h6 className="mb-2">{variation.name}</h6>
                        <div className="mb-2">
                          <small className="text-muted">
                            {variation.impressions.toLocaleString()} impressions • {variation.clicks} clicks
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg={variation.status === 'active' ? 'success' : 'secondary'}>
                            {variation.status}
                          </Badge>
                          <span className="fw-bold">{variation.ctr}% CTR</span>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Competitor Analysis</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedBanner.competitor_analysis.map((competitor, index) => (
                      <div key={index} className={`d-flex justify-content-between align-items-center ${index > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                        <div>
                          <h6 className="mb-1">{competitor.competitor}</h6>
                          <small className="text-muted">{competitor.position_overlap}% overlap</small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">{competitor.avg_ctr}% CTR</div>
                          <small className={`${competitor.avg_ctr < extendedBanner.click_rate ? 'text-success' : 'text-danger'}`}>
                            {competitor.avg_ctr < extendedBanner.click_rate ? '+' : ''}{(extendedBanner.click_rate - competitor.avg_ctr).toFixed(1)}%
                          </small>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Targeting Tab */}
          <Tab eventKey="targeting" title="Targeting & Audience">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Target Audience</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Age Groups:</strong>
                      <div className="mt-2">
                        {extendedBanner.target_audience.age_groups.map((age, index) => (
                          <Badge key={index} bg="outline-primary" className="me-1 mb-1">
                            {age}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Interests:</strong>
                      <div className="mt-2">
                        {extendedBanner.target_audience.interests.map((interest, index) => (
                          <Badge key={index} bg="outline-secondary" className="me-1 mb-1">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Locations:</strong>
                      <div className="mt-2">
                        {extendedBanner.target_audience.locations.map((location, index) => (
                          <Badge key={index} bg="outline-info" className="me-1 mb-1">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Schedule Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Timezone:</td>
                          <td>{extendedBanner.schedule_details.timezone}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Active Hours:</td>
                          <td>{extendedBanner.schedule_details.active_hours}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Days of Week:</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {extendedBanner.schedule_details.days_of_week.map((day, index) => (
                                <Badge key={index} bg="outline-success" style={{fontSize: '10px'}}>
                                  {day.substring(0, 3)}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Frequency Cap:</td>
                          <td>{extendedBanner.schedule_details.frequency_cap} per user/day</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-primary">
          <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
          Full Analytics
        </Button>
        <Button variant="outline-info">
          <IconifyIcon icon="ri:eye-line" className="me-1" />
          Preview Banner
        </Button>
        <Button variant="outline-warning">
          <IconifyIcon icon="ri:palette-line" className="me-1" />
          Creative Variations
        </Button>
        <Button 
          variant={banner.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(banner, banner.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={banner.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {banner.status === 'active' ? 'Pause' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(banner)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Banner
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BannerDetailsModal;
