"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface FeaturedSection {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  icon_type: string;
  bg_color: string;
  navigation_screen: string;
  status: 'active' | 'inactive' | 'scheduled';
  order: number;
  clicks: number;
}

interface FeaturedSectionDetailsModalProps {
  show: boolean;
  onHide: () => void;
  section: FeaturedSection | null;
  onEdit?: (section: FeaturedSection) => void;
  onStatusChange?: (section: FeaturedSection, newStatus: string) => void;
  onDelete?: (section: FeaturedSection) => void;
  onMoveOrder?: (section: FeaturedSection, direction: 'up' | 'down') => void;
}

const FeaturedSectionDetailsModal: React.FC<FeaturedSectionDetailsModalProps> = ({ 
  show, 
  onHide, 
  section,
  onEdit,
  onStatusChange,
  onDelete,
  onMoveOrder
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!section) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: FeaturedSection['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'scheduled':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the section
  const extendedSection = {
    ...section,
    impressions: 12450,
    click_rate: ((section.clicks / 12450) * 100),
    conversion_rate: 4.8,
    conversions: Math.round(section.clicks * 0.048),
    average_session_duration: 185, // seconds
    bounce_rate: 23.5,
    user_engagement: {
      likes: 245,
      shares: 67,
      bookmarks: 189,
      comments: 34
    },
    target_demographics: {
      primary_age: '25-34',
      gender_split: { female: 68, male: 32 },
      top_locations: ['Accra', 'Lagos', 'Nairobi', 'Cape Town']
    },
    content_performance: {
      view_duration: 4.2, // seconds
      interaction_rate: 12.8,
      scroll_depth: 78.5,
      exit_rate: 15.2
    },
    related_products: [
      { id: 'prod-001', name: 'Glow Serum', category: 'Beauty', sales_from_section: 89 },
      { id: 'prod-002', name: 'Vitamin C Cream', category: 'Beauty', sales_from_section: 67 },
      { id: 'prod-003', name: 'Face Mask Set', category: 'Beauty', sales_from_section: 45 }
    ],
    performance_by_day: [
      { date: '2024-01-20', impressions: 2450, clicks: 156, conversions: 7 },
      { date: '2024-01-21', impressions: 2680, clicks: 171, conversions: 8 },
      { date: '2024-01-22', impressions: 2520, clicks: 161, conversions: 9 },
      { date: '2024-01-23', impressions: 2290, clicks: 146, conversions: 6 },
      { date: '2024-01-24', impressions: 2510, clicks: 160, conversions: 8 }
    ],
    user_feedback: [
      { 
        id: 'fb-001', 
        user: 'Sarah K.', 
        rating: 5, 
        comment: 'Love the Community Picks! Always find great products here.',
        date: '2024-01-22'
      },
      { 
        id: 'fb-002', 
        user: 'Michael A.', 
        rating: 4, 
        comment: 'Good recommendations, would like to see more variety.',
        date: '2024-01-21'
      },
      { 
        id: 'fb-003', 
        user: 'Emma L.', 
        rating: 5, 
        comment: 'Perfect for discovering new products I never knew I needed!',
        date: '2024-01-20'
      }
    ],
    a_b_tests: [
      {
        id: 'test-001',
        name: 'Icon Style Test',
        variant_a: 'Filled Icons',
        variant_b: 'Outline Icons',
        winner: 'variant_a',
        improvement: '+15.3%',
        status: 'completed'
      },
      {
        id: 'test-002',
        name: 'Background Color Test',
        variant_a: section.bg_color,
        variant_b: '#FF6B6B',
        winner: 'variant_a',
        improvement: '+8.7%',
        status: 'completed'
      }
    ],
    seasonal_performance: [
      { period: 'Holiday Season', performance_change: '+45%', best_performing_day: 'Dec 24' },
      { period: 'Summer', performance_change: '+12%', best_performing_day: 'Jun 15' },
      { period: 'Back to School', performance_change: '-5%', best_performing_day: 'Aug 20' }
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div 
            className="me-2 d-flex align-items-center justify-content-center text-white"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: section.bg_color
            }}
          >
            <IconifyIcon icon="ri:star-line" size={16} />
          </div>
          Featured Section Details - {section.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Section Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(section.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={section.status === 'active' ? 'ri:check-line' : 
                      section.status === 'scheduled' ? 'ri:time-line' : 
                      'ri:pause-line'} 
                className="me-1" 
              />
              {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
            </Badge>
            <Badge bg="info" className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:sort-asc" className="me-1" />
              Position #{section.order}
            </Badge>
            <Badge bg="primary" className="px-3 py-2">
              <IconifyIcon icon="ri:star-line" className="me-1" />
              Featured Section
            </Badge>
          </div>
          <h4 className="mb-1">{extendedSection.impressions.toLocaleString()} Impressions</h4>
          <p className="text-muted mb-0">{section.clicks} clicks • {extendedSection.click_rate.toFixed(2)}% CTR • {extendedSection.conversions} conversions</p>
        </div>

        {/* Section Preview */}
        <div className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Section Preview</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center p-4">
                <div 
                  className="d-flex align-items-center justify-content-center text-white me-4"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: section.bg_color,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <IconifyIcon icon={`ri:${section.icon}-line`} size={32} />
                </div>
                <div className="flex-grow-1">
                  <h4 className="mb-2">{section.name}</h4>
                  <p className="text-muted mb-3">{section.subtitle}</p>
                  <Badge bg="outline-secondary">
                    <IconifyIcon icon="ri:smartphone-line" className="me-1" />
                    {section.navigation_screen}
                  </Badge>
                </div>
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
                    <h6 className="mb-0">Section Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Section ID:</td>
                          <td>{section.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Name:</td>
                          <td>{section.name}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Subtitle:</td>
                          <td>{section.subtitle}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Display Order:</td>
                          <td>
                            <Badge bg="outline-primary">#{section.order}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Navigation Screen:</td>
                          <td>
                            <code>{section.navigation_screen}</code>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Icon:</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="me-2 d-flex align-items-center justify-content-center text-white"
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: section.bg_color
                                }}
                              >
                                <IconifyIcon icon={`ri:${section.icon}-line`} size={12} />
                              </div>
                              <code>{section.icon}</code>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Background Color:</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="me-2"
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 4,
                                  backgroundColor: section.bg_color,
                                  border: '2px solid #fff',
                                  boxShadow: '0 0 0 1px #ddd'
                                }}
                              ></div>
                              <code>{section.bg_color}</code>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">User Engagement</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="text-center">
                      <Col xs={6} className="mb-3">
                        <h5 className="text-danger mb-1">{extendedSection.user_engagement.likes}</h5>
                        <p className="text-muted mb-0">
                          <IconifyIcon icon="ri:heart-line" className="me-1" />
                          Likes
                        </p>
                      </Col>
                      <Col xs={6} className="mb-3">
                        <h5 className="text-success mb-1">{extendedSection.user_engagement.shares}</h5>
                        <p className="text-muted mb-0">
                          <IconifyIcon icon="ri:share-line" className="me-1" />
                          Shares
                        </p>
                      </Col>
                      <Col xs={6}>
                        <h5 className="text-warning mb-1">{extendedSection.user_engagement.bookmarks}</h5>
                        <p className="text-muted mb-0">
                          <IconifyIcon icon="ri:bookmark-line" className="me-1" />
                          Bookmarks
                        </p>
                      </Col>
                      <Col xs={6}>
                        <h5 className="text-info mb-1">{extendedSection.user_engagement.comments}</h5>
                        <p className="text-muted mb-0">
                          <IconifyIcon icon="ri:chat-line" className="me-1" />
                          Comments
                        </p>
                      </Col>
                    </Row>
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
                        <h5 className="text-primary mb-1">{extendedSection.click_rate.toFixed(2)}%</h5>
                        <p className="text-muted mb-0">CTR</p>
                      </Col>
                      <Col xs={4} className="border-end">
                        <h5 className="text-success mb-1">{extendedSection.conversion_rate}%</h5>
                        <p className="text-muted mb-0">CVR</p>
                      </Col>
                      <Col xs={4}>
                        <h5 className="text-warning mb-1">{extendedSection.bounce_rate}%</h5>
                        <p className="text-muted mb-0">Bounce</p>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Interaction Rate:</span>
                        <span>{extendedSection.content_performance.interaction_rate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedSection.content_performance.interaction_rate} 
                        max={20}
                        variant="success"
                        className="mb-2"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Scroll Depth:</span>
                        <span>{extendedSection.content_performance.scroll_depth}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedSection.content_performance.scroll_depth} 
                        variant="info"
                        className="mb-2"
                      />
                    </div>

                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Avg. Session Duration:</td>
                          <td>{Math.floor(extendedSection.average_session_duration / 60)}m {extendedSection.average_session_duration % 60}s</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">View Duration:</td>
                          <td>{extendedSection.content_performance.view_duration}s</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Exit Rate:</td>
                          <td>{extendedSection.content_performance.exit_rate}%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Demographics</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">Primary Age Group:</span>
                        <Badge bg="primary">{extendedSection.target_demographics.primary_age}</Badge>
                      </div>
                      <div className="mb-3">
                        <span className="fw-semibold">Gender Distribution:</span>
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span>Female</span>
                            <span>{extendedSection.target_demographics.gender_split.female}%</span>
                          </div>
                          <ProgressBar 
                            now={extendedSection.target_demographics.gender_split.female} 
                            variant="danger"
                            className="mb-2"
                            style={{height: '6px'}}
                          />
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span>Male</span>
                            <span>{extendedSection.target_demographics.gender_split.male}%</span>
                          </div>
                          <ProgressBar 
                            now={extendedSection.target_demographics.gender_split.male} 
                            variant="primary"
                            style={{height: '6px'}}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="fw-semibold">Top Locations:</span>
                        <div className="mt-2">
                          {extendedSection.target_demographics.top_locations.map((location, index) => (
                            <Badge key={index} bg="outline-info" className="me-1 mb-1">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
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
                            <th>Conversions</th>
                            <th>CVR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedSection.performance_by_day.map((day, index) => (
                            <tr key={index}>
                              <td>{new Date(day.date).toLocaleDateString()}</td>
                              <td>{day.impressions.toLocaleString()}</td>
                              <td>{day.clicks}</td>
                              <td>{((day.clicks / day.impressions) * 100).toFixed(2)}%</td>
                              <td>{day.conversions}</td>
                              <td>{((day.conversions / day.clicks) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Related Products Performance</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Sales from Section</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedSection.related_products.map((product, index) => (
                            <tr key={index}>
                              <td>
                                <h6 className="mb-0">{product.name}</h6>
                              </td>
                              <td>
                                <Badge bg="outline-secondary">{product.category}</Badge>
                              </td>
                              <td>{product.sales_from_section}</td>
                              <td>
                                <ProgressBar 
                                  now={(product.sales_from_section / 100) * 100} 
                                  max={100}
                                  variant={product.sales_from_section > 70 ? 'success' : product.sales_from_section > 40 ? 'warning' : 'danger'}
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
                    <h6 className="mb-0">A/B Test Results</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedSection.a_b_tests.map((test, index) => (
                      <div key={index} className={`p-3 border rounded ${index > 0 ? 'mt-3' : ''}`}>
                        <h6 className="mb-2">{test.name}</h6>
                        <div className="mb-2">
                          <small className="text-muted">Winner: {test.variant_a === test.winner.replace('variant_', '') ? test.variant_a : test.variant_b}</small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg={test.status === 'completed' ? 'success' : 'warning'}>
                            {test.status}
                          </Badge>
                          <span className="text-success fw-bold">{test.improvement}</span>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Seasonal Performance</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedSection.seasonal_performance.map((season, index) => (
                      <div key={index} className={`d-flex justify-content-between align-items-center ${index > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                        <div>
                          <h6 className="mb-1">{season.period}</h6>
                          <small className="text-muted">Best: {season.best_performing_day}</small>
                        </div>
                        <div className="text-end">
                          <div className={`fw-bold ${season.performance_change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                            {season.performance_change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* User Feedback Tab */}
          <Tab eventKey="feedback" title="User Feedback">
            <Card>
              <Card.Header>
                <h6 className="mb-0">Recent User Feedback</h6>
              </Card.Header>
              <Card.Body>
                {extendedSection.user_feedback.map((feedback, index) => (
                  <div key={index} className={`d-flex ${index > 0 ? 'mt-4 pt-4 border-top' : ''}`}>
                    <div className="flex-shrink-0">
                      <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                        <IconifyIcon icon="ri:user-line" className="text-primary" />
                      </div>
                    </div>
                    <div className="ms-3 flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{feedback.user}</h6>
                          <div>
                            {[...Array(5)].map((_, i) => (
                              <IconifyIcon 
                                key={i}
                                icon={i < feedback.rating ? 'ri:star-fill' : 'ri:star-line'}
                                className={`${i < feedback.rating ? 'text-warning' : 'text-muted'} me-1`}
                                size={14}
                              />
                            ))}
                          </div>
                        </div>
                        <small className="text-muted">{new Date(feedback.date).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-0">{feedback.comment}</p>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
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
          Preview Section
        </Button>
        <Button variant="outline-warning" onClick={() => onMoveOrder && onMoveOrder(section, 'up')}>
          <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
          Move Up
        </Button>
        <Button variant="outline-warning" onClick={() => onMoveOrder && onMoveOrder(section, 'down')}>
          <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
          Move Down
        </Button>
        <Button 
          variant={section.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(section, section.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={section.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {section.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(section)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Section
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FeaturedSectionDetailsModal;
