"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradient_start: string;
  gradient_end: string;
  image_url: string;
  status: 'active' | 'inactive' | 'scheduled';
  order: number;
  created_at: string;
  clicks: number;
}

interface HeroSlideDetailsModalProps {
  show: boolean;
  onHide: () => void;
  slide: HeroSlide | null;
  onEdit?: (slide: HeroSlide) => void;
  onStatusChange?: (slide: HeroSlide, newStatus: string) => void;
  onDelete?: (slide: HeroSlide) => void;
  onMoveOrder?: (slide: HeroSlide, direction: 'up' | 'down') => void;
}

const HeroSlideDetailsModal: React.FC<HeroSlideDetailsModalProps> = ({ 
  show, 
  onHide, 
  slide,
  onEdit,
  onStatusChange,
  onDelete,
  onMoveOrder
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!slide) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: HeroSlide['status']) => {
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

  // Mock extended data for the slide
  const extendedSlide = {
    ...slide,
    link_url: '/marketplace/category/beauty',
    target_screen: 'categoryListingScreen',
    display_duration: 4000, // 4 seconds
    auto_advance: true,
    cta_button: {
      text: 'Shop Now',
      color: '#FFFFFF',
      bg_color: '#000000'
    },
    performance: {
      impressions: 15600,
      click_rate: 5.7,
      conversion_rate: 2.3,
      revenue_generated: 8450.75
    },
    schedule: {
      start_date: '2024-01-15',
      end_date: '2024-02-15',
      timezone: 'GMT',
      active_hours: '00:00-23:59'
    },
    targeting: {
      countries: ['Ghana', 'Nigeria', 'Kenya'],
      user_segments: ['new_users', 'returning_customers'],
      device_types: ['mobile', 'tablet', 'desktop']
    },
    analytics: [
      { date: '2024-01-20', impressions: 1250, clicks: 71, conversions: 12 },
      { date: '2024-01-21', impressions: 1380, clicks: 79, conversions: 15 },
      { date: '2024-01-22', impressions: 1420, clicks: 81, conversions: 18 },
      { date: '2024-01-23', impressions: 1190, clicks: 68, conversions: 14 },
      { date: '2024-01-24', impressions: 1350, clicks: 77, conversions: 16 }
    ],
    a_b_tests: [
      {
        id: 'test-001',
        name: 'CTA Button Color Test',
        variant_a: 'Black Button',
        variant_b: 'Blue Button',
        winner: 'variant_b',
        improvement: '+12.5%',
        status: 'completed'
      },
      {
        id: 'test-002',
        name: 'Title Copy Test',
        variant_a: 'Up your glow game',
        variant_b: 'Transform your beauty routine',
        winner: 'variant_a',
        improvement: '+8.3%',
        status: 'completed'
      }
    ],
    versions: [
      { version: 'v1.2', date: '2024-01-20', changes: 'Updated CTA button color', author: 'Marketing Team' },
      { version: 'v1.1', date: '2024-01-15', changes: 'Adjusted gradient colors', author: 'Design Team' },
      { version: 'v1.0', date: '2024-01-10', changes: 'Initial creation', author: 'Marketing Team' }
    ]
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <div 
            className="me-2 d-flex align-items-center justify-content-center text-white fw-bold"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(45deg, ${slide.gradient_start}, ${slide.gradient_end})`,
              fontSize: '12px'
            }}
          >
            #{slide.order}
          </div>
          Hero Slide Details - {slide.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Slide Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(slide.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={slide.status === 'active' ? 'ri:check-line' : 
                      slide.status === 'scheduled' ? 'ri:time-line' : 
                      'ri:pause-line'} 
                className="me-1" 
              />
              {slide.status.charAt(0).toUpperCase() + slide.status.slice(1)}
            </Badge>
            <Badge bg="info" className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:sort-asc" className="me-1" />
              Position #{slide.order}
            </Badge>
            <Badge bg="primary" className="px-3 py-2">
              <IconifyIcon icon="ri:slideshow-line" className="me-1" />
              Hero Slider
            </Badge>
          </div>
          <h4 className="mb-1">{extendedSlide.performance.impressions.toLocaleString()} Impressions</h4>
          <p className="text-muted mb-0">{slide.clicks} clicks • {extendedSlide.performance.click_rate}% CTR • ${extendedSlide.performance.revenue_generated.toLocaleString()} revenue</p>
        </div>

        {/* Slide Preview */}
        <div className="mb-4">
          <Card>
            <Card.Body className="p-0">
              <div 
                className="d-flex align-items-center justify-content-between p-4 text-white position-relative"
                style={{
                  background: `linear-gradient(135deg, ${slide.gradient_start}, ${slide.gradient_end})`,
                  minHeight: 200,
                  borderRadius: 8
                }}
              >
                <div className="flex-grow-1">
                  <h2 className="mb-2">{slide.title}</h2>
                  <p className="mb-3 opacity-90">{slide.subtitle}</p>
                  {slide.badge && (
                    <Badge bg="dark" className="mb-3 px-3 py-2">
                      {slide.badge}
                    </Badge>
                  )}
                  <div>
                    <Button 
                      style={{
                        backgroundColor: extendedSlide.cta_button.bg_color,
                        color: extendedSlide.cta_button.color,
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 8,
                        fontWeight: 'bold'
                      }}
                    >
                      {extendedSlide.cta_button.text}
                    </Button>
                  </div>
                </div>
                <div className="ms-4">
                  <div 
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <IconifyIcon icon="ri:image-line" size={40} />
                  </div>
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
                    <h6 className="mb-0">Slide Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Slide ID:</td>
                          <td>{slide.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Title:</td>
                          <td>{slide.title}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Subtitle:</td>
                          <td>{slide.subtitle}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Badge:</td>
                          <td>
                            {slide.badge ? (
                              <Badge bg="dark">{slide.badge}</Badge>
                            ) : (
                              <span className="text-muted">No badge</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Display Order:</td>
                          <td>
                            <Badge bg="outline-primary">#{slide.order}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Display Duration:</td>
                          <td>{extendedSlide.display_duration / 1000} seconds</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Auto Advance:</td>
                          <td>
                            <Badge bg={extendedSlide.auto_advance ? 'success' : 'secondary'}>
                              {extendedSlide.auto_advance ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Visual Design</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Gradient Start:</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="me-2"
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  backgroundColor: slide.gradient_start,
                                  border: '2px solid #fff',
                                  boxShadow: '0 0 0 1px #ddd'
                                }}
                              ></div>
                              <code>{slide.gradient_start}</code>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Gradient End:</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="me-2"
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  backgroundColor: slide.gradient_end,
                                  border: '2px solid #fff',
                                  boxShadow: '0 0 0 1px #ddd'
                                }}
                              ></div>
                              <code>{slide.gradient_end}</code>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Image URL:</td>
                          <td><code>{slide.image_url}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">CTA Button:</td>
                          <td>
                            <Button 
                              size="sm"
                              style={{
                                backgroundColor: extendedSlide.cta_button.bg_color,
                                color: extendedSlide.cta_button.color,
                                border: 'none'
                              }}
                            >
                              {extendedSlide.cta_button.text}
                            </Button>
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
                      <Col xs={6} className="border-end">
                        <h5 className="text-primary mb-1">{extendedSlide.performance.click_rate}%</h5>
                        <p className="text-muted mb-0">Click Rate</p>
                      </Col>
                      <Col xs={6}>
                        <h5 className="text-success mb-1">{extendedSlide.performance.conversion_rate}%</h5>
                        <p className="text-muted mb-0">Conversion</p>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Click Through Rate:</span>
                        <span>{extendedSlide.performance.click_rate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedSlide.performance.click_rate} 
                        variant={extendedSlide.performance.click_rate > 5 ? 'success' : 'warning'}
                        className="mb-2"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Conversion Rate:</span>
                        <span>{extendedSlide.performance.conversion_rate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedSlide.performance.conversion_rate} 
                        variant={extendedSlide.performance.conversion_rate > 2 ? 'success' : 'warning'}
                        className="mb-2"
                      />
                    </div>

                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Total Clicks:</td>
                          <td>{slide.clicks.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Revenue Generated:</td>
                          <td className="text-success fw-bold">${extendedSlide.performance.revenue_generated.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Created:</td>
                          <td>{new Date(slide.created_at).toLocaleDateString()}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Navigation & Targeting</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Link URL:</td>
                          <td><code>{extendedSlide.link_url}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Target Screen:</td>
                          <td><code>{extendedSlide.target_screen}</code></td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Countries:</td>
                          <td>
                            {extendedSlide.targeting.countries.map((country, index) => (
                              <Badge key={index} bg="outline-secondary" className="me-1">
                                {country}
                              </Badge>
                            ))}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Device Types:</td>
                          <td>
                            {extendedSlide.targeting.device_types.map((device, index) => (
                              <Badge key={index} bg="outline-info" className="me-1">
                                {device}
                              </Badge>
                            ))}
                          </td>
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
                            <th>Conversions</th>
                            <th>CVR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedSlide.analytics.map((day, index) => (
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
              </Col>
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">A/B Test Results</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedSlide.a_b_tests.map((test, index) => (
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
              </Col>
            </Row>
          </Tab>

          {/* Schedule & Targeting Tab */}
          <Tab eventKey="schedule" title="Schedule & Targeting">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Schedule Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Start Date:</td>
                          <td>{new Date(extendedSlide.schedule.start_date).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">End Date:</td>
                          <td>{new Date(extendedSlide.schedule.end_date).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Timezone:</td>
                          <td>{extendedSlide.schedule.timezone}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Active Hours:</td>
                          <td>{extendedSlide.schedule.active_hours}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Targeting Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Target Countries:</strong>
                      <div className="mt-2">
                        {extendedSlide.targeting.countries.map((country, index) => (
                          <Badge key={index} bg="outline-primary" className="me-1 mb-1">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>User Segments:</strong>
                      <div className="mt-2">
                        {extendedSlide.targeting.user_segments.map((segment, index) => (
                          <Badge key={index} bg="outline-secondary" className="me-1 mb-1">
                            {segment.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Device Types:</strong>
                      <div className="mt-2">
                        {extendedSlide.targeting.device_types.map((device, index) => (
                          <Badge key={index} bg="outline-info" className="me-1 mb-1">
                            {device}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Version History Tab */}
          <Tab eventKey="versions" title="Version History">
            <Card>
              <Card.Header>
                <h6 className="mb-0">Slide Version History</h6>
              </Card.Header>
              <Card.Body>
                <div className="timeline">
                  {extendedSlide.versions.map((version, index) => (
                    <div key={index} className="d-flex mb-3">
                      <div className="flex-shrink-0">
                        <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                          <IconifyIcon icon="ri:git-commit-line" className="text-primary" />
                        </div>
                      </div>
                      <div className="ms-3 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{version.version}</h6>
                            <p className="mb-1">{version.changes}</p>
                            <small className="text-muted">by {version.author}</small>
                          </div>
                          <small className="text-muted">{new Date(version.date).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
          Preview Live
        </Button>
        <Button variant="outline-warning" onClick={() => onMoveOrder && onMoveOrder(slide, 'up')}>
          <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
          Move Up
        </Button>
        <Button variant="outline-warning" onClick={() => onMoveOrder && onMoveOrder(slide, 'down')}>
          <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
          Move Down
        </Button>
        <Button 
          variant={slide.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(slide, slide.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={slide.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {slide.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(slide)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Slide
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HeroSlideDetailsModal;
