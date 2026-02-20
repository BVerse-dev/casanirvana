"use client";

import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Card, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface SpecialDisplay {
  id: string;
  name: string;
  type: 'product-section' | 'category-showcase' | 'promotional-grid' | 'featured-collection';
  title: string;
  description: string;
  display_type: 'horizontal-scroll' | 'grid-layout' | 'carousel' | 'masonry';
  product_count: number;
  status: 'active' | 'inactive' | 'scheduled';
  order: number;
  views: number;
}

interface SpecialDisplayDetailsModalProps {
  show: boolean;
  onHide: () => void;
  display: SpecialDisplay | null;
  onEdit?: (display: SpecialDisplay) => void;
  onStatusChange?: (display: SpecialDisplay, newStatus: string) => void;
  onDelete?: (display: SpecialDisplay) => void;
  onMoveOrder?: (display: SpecialDisplay, direction: 'up' | 'down') => void;
  onManageProducts?: (display: SpecialDisplay) => void;
}

const SpecialDisplayDetailsModal: React.FC<SpecialDisplayDetailsModalProps> = ({ 
  show, 
  onHide, 
  display,
  onEdit,
  onStatusChange,
  onDelete,
  onMoveOrder,
  onManageProducts
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!display) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: SpecialDisplay['status']) => {
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

  // Get type badge variant
  const getTypeBadgeVariant = (type: SpecialDisplay['type']) => {
    switch (type) {
      case 'product-section':
        return 'primary';
      case 'category-showcase':
        return 'info';
      case 'promotional-grid':
        return 'warning';
      case 'featured-collection':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Get display type badge variant
  const getDisplayTypeBadgeVariant = (displayType: SpecialDisplay['display_type']) => {
    switch (displayType) {
      case 'horizontal-scroll':
        return 'primary';
      case 'grid-layout':
        return 'success';
      case 'carousel':
        return 'info';
      case 'masonry':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Mock extended data for the display
  const extendedDisplay = {
    ...display,
    impressions: 18750,
    click_rate: ((display.views * 0.15) / 18750 * 100), // Estimated CTR
    interactions: Math.round(display.views * 0.15),
    conversion_rate: 6.8,
    conversions: Math.round(display.views * 0.15 * 0.068),
    revenue_generated: Math.round(display.views * 0.15 * 0.068 * 125.75),
    average_time_spent: 42.5, // seconds
    scroll_completion_rate: 67.3,
    layout_settings: {
      items_per_row: display.display_type === 'grid-layout' ? 3 : 1,
      spacing: '16px',
      responsive_breakpoints: {
        mobile: 1,
        tablet: 2,
        desktop: display.display_type === 'horizontal-scroll' ? 4 : 3
      },
      animation: display.display_type === 'carousel' ? 'slide' : 'fade',
      auto_play: display.display_type === 'carousel',
      infinite_scroll: display.display_type === 'horizontal-scroll'
    },
    featured_products: [
      { 
        id: 'prod-001', 
        name: 'Organic Tomatoes', 
        price: 45.99, 
        image: '/products/tomatoes.jpg',
        sales_from_display: 127,
        revenue_from_display: 5841.73,
        position: 1,
        status: 'active'
      },
      { 
        id: 'prod-002', 
        name: 'Fresh Lettuce', 
        price: 28.50, 
        image: '/products/lettuce.jpg',
        sales_from_display: 89,
        revenue_from_display: 2536.50,
        position: 2,
        status: 'active'
      },
      { 
        id: 'prod-003', 
        name: 'Cucumber Pack', 
        price: 35.75, 
        image: '/products/cucumber.jpg',
        sales_from_display: 156,
        revenue_from_display: 5577.00,
        position: 3,
        status: 'active'
      },
      { 
        id: 'prod-004', 
        name: 'Bell Peppers', 
        price: 52.25, 
        image: '/products/peppers.jpg',
        sales_from_display: 98,
        revenue_from_display: 5120.50,
        position: 4,
        status: 'inactive'
      }
    ],
    performance_by_day: [
      { date: '2024-01-20', views: 1890, interactions: 284, conversions: 19 },
      { date: '2024-01-21', views: 2150, interactions: 323, conversions: 22 },
      { date: '2024-01-22', views: 1980, interactions: 297, conversions: 20 },
      { date: '2024-01-23', views: 1750, interactions: 263, conversions: 18 },
      { date: '2024-01-24', views: 2130, interactions: 320, conversions: 24 }
    ],
    user_behavior: {
      most_viewed_position: 1,
      most_clicked_position: 2,
      average_products_viewed: 3.2,
      bounce_rate: 24.8,
      return_visitors: 34.2
    },
    seasonal_trends: [
      { period: 'Morning (6-12)', views_percentage: 35.2, conversion_rate: 7.1 },
      { period: 'Afternoon (12-18)', views_percentage: 42.8, conversion_rate: 6.9 },
      { period: 'Evening (18-24)', views_percentage: 22.0, conversion_rate: 5.8 }
    ],
    competitor_comparison: [
      { competitor: 'FreshMart', similar_section: 'Organic Produce', performance_vs_us: '-12%' },
      { competitor: 'GreenGrocer', similar_section: 'Farm Fresh', performance_vs_us: '+8%' },
      { competitor: 'LocalFresh', similar_section: 'Daily Harvest', performance_vs_us: '+15%' }
    ],
    optimization_suggestions: [
      {
        type: 'layout',
        suggestion: 'Consider switching to grid layout for better mobile experience',
        impact: 'Medium',
        effort: 'Low'
      },
      {
        type: 'product-mix',
        suggestion: 'Add more seasonal products to increase relevance',
        impact: 'High',
        effort: 'Medium'
      },
      {
        type: 'positioning',
        suggestion: 'Move Bell Peppers to position 2 based on click data',
        impact: 'Low',
        effort: 'Low'
      }
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
              borderRadius: 6,
              background: 'linear-gradient(45deg, #28a745, #20c997)',
              fontSize: '10px'
            }}
          >
            {display.product_count}
          </div>
          Special Display Details - {display.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Display Status Header */}
        <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-2">
            <Badge bg={getStatusBadgeVariant(display.status)} className="px-3 py-2 me-2">
              <IconifyIcon 
                icon={display.status === 'active' ? 'ri:check-line' : 
                      display.status === 'scheduled' ? 'ri:time-line' : 
                      'ri:pause-line'} 
                className="me-1" 
              />
              {display.status.charAt(0).toUpperCase() + display.status.slice(1)}
            </Badge>
            <Badge bg={getTypeBadgeVariant(display.type)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:layout-2-line" className="me-1" />
              {display.type.replace('-', ' ')}
            </Badge>
            <Badge bg={getDisplayTypeBadgeVariant(display.display_type)} className="px-3 py-2 me-2">
              <IconifyIcon icon="ri:layout-grid-line" className="me-1" />
              {display.display_type.replace('-', ' ')}
            </Badge>
            <Badge bg="info" className="px-3 py-2">
              <IconifyIcon icon="ri:sort-asc" className="me-1" />
              Position #{display.order}
            </Badge>
          </div>
          <h4 className="mb-1">{extendedDisplay.impressions.toLocaleString()} Impressions</h4>
          <p className="text-muted mb-0">
            {display.views.toLocaleString()} views • {extendedDisplay.interactions} interactions • 
            ${extendedDisplay.revenue_generated.toLocaleString()} revenue
          </p>
        </div>

        {/* Display Preview */}
        <div className="mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Display Preview</h6>
                <Badge bg="outline-secondary">{display.product_count} products</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h5>{display.title}</h5>
                <p className="text-muted">{display.description}</p>
              </div>
              
              {/* Mock product grid */}
              <div className="d-flex gap-3 overflow-auto pb-2">
                {extendedDisplay.featured_products.slice(0, 4).map((product, index) => (
                  <div key={index} className="flex-shrink-0">
                    <div 
                      className="d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        background: `linear-gradient(45deg, ${index % 2 === 0 ? '#28a745' : '#20c997'}, ${index % 2 === 0 ? '#20c997' : '#17a2b8'})`,
                        fontSize: '12px'
                      }}
                    >
                      {product.name.split(' ')[0]}
                    </div>
                    <div className="text-center mt-2">
                      <small className="fw-bold">₵{product.price}</small>
                    </div>
                  </div>
                ))}
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
                    <h6 className="mb-0">Display Information</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Display ID:</td>
                          <td>{display.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Name:</td>
                          <td>{display.name}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Title:</td>
                          <td>{display.title}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Description:</td>
                          <td>{display.description}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Type:</td>
                          <td>
                            <Badge bg={getTypeBadgeVariant(display.type)}>
                              {display.type.replace('-', ' ')}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Display Style:</td>
                          <td>
                            <Badge bg={getDisplayTypeBadgeVariant(display.display_type)}>
                              {display.display_type.replace('-', ' ')}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Product Count:</td>
                          <td>
                            <Badge bg="primary">{display.product_count} items</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Display Order:</td>
                          <td>
                            <Badge bg="outline-primary">#{display.order}</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Layout Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Items per Row:</td>
                          <td>{extendedDisplay.layout_settings.items_per_row}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Spacing:</td>
                          <td>{extendedDisplay.layout_settings.spacing}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Animation:</td>
                          <td>
                            <Badge bg="info">{extendedDisplay.layout_settings.animation}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Auto Play:</td>
                          <td>
                            <Badge bg={extendedDisplay.layout_settings.auto_play ? 'success' : 'secondary'}>
                              {extendedDisplay.layout_settings.auto_play ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Infinite Scroll:</td>
                          <td>
                            <Badge bg={extendedDisplay.layout_settings.infinite_scroll ? 'success' : 'secondary'}>
                              {extendedDisplay.layout_settings.infinite_scroll ? 'Enabled' : 'Disabled'}
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
                        <h5 className="text-primary mb-1">{extendedDisplay.click_rate.toFixed(2)}%</h5>
                        <p className="text-muted mb-0">CTR</p>
                      </Col>
                      <Col xs={4} className="border-end">
                        <h5 className="text-success mb-1">{extendedDisplay.conversion_rate}%</h5>
                        <p className="text-muted mb-0">CVR</p>
                      </Col>
                      <Col xs={4}>
                        <h5 className="text-warning mb-1">{extendedDisplay.scroll_completion_rate}%</h5>
                        <p className="text-muted mb-0">Scroll</p>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold">Scroll Completion:</span>
                        <span>{extendedDisplay.scroll_completion_rate}%</span>
                      </div>
                      <ProgressBar 
                        now={extendedDisplay.scroll_completion_rate} 
                        variant="info"
                        className="mb-2"
                      />
                    </div>

                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Total Views:</td>
                          <td>{display.views.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Interactions:</td>
                          <td>{extendedDisplay.interactions}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Conversions:</td>
                          <td>{extendedDisplay.conversions}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Revenue Generated:</td>
                          <td className="text-success fw-bold">₵{extendedDisplay.revenue_generated.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Avg. Time Spent:</td>
                          <td>{extendedDisplay.average_time_spent}s</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">User Behavior</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table className="table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-semibold">Most Viewed Position:</td>
                          <td>
                            <Badge bg="primary">#{extendedDisplay.user_behavior.most_viewed_position}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Most Clicked Position:</td>
                          <td>
                            <Badge bg="success">#{extendedDisplay.user_behavior.most_clicked_position}</Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Avg. Products Viewed:</td>
                          <td>{extendedDisplay.user_behavior.average_products_viewed}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Bounce Rate:</td>
                          <td>{extendedDisplay.user_behavior.bounce_rate}%</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Return Visitors:</td>
                          <td>{extendedDisplay.user_behavior.return_visitors}%</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Products Tab */}
          <Tab eventKey="products" title="Products">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Featured Products Performance</h6>
                  <Button variant="outline-primary" size="sm" onClick={() => onManageProducts && onManageProducts(display)}>
                    <IconifyIcon icon="ri:list-check" className="me-1" />
                    Manage Products
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table className="table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Sales from Display</th>
                        <th>Revenue</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extendedDisplay.featured_products.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <Badge bg="outline-primary">#{product.position}</Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="me-2 d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                  background: `linear-gradient(45deg, ${index % 2 === 0 ? '#28a745' : '#20c997'}, ${index % 2 === 0 ? '#20c997' : '#17a2b8'})`,
                                  fontSize: '10px'
                                }}
                              >
                                {product.name.charAt(0)}
                              </div>
                              <div>
                                <h6 className="mb-0">{product.name}</h6>
                              </div>
                            </div>
                          </td>
                          <td>₵{product.price}</td>
                          <td>{product.sales_from_display}</td>
                          <td className="text-success fw-bold">₵{product.revenue_from_display.toFixed(2)}</td>
                          <td>
                            <Badge bg={product.status === 'active' ? 'success' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-1">
                              <IconifyIcon icon="ri:eye-line" />
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              <IconifyIcon icon="ri:pencil-line" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
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
                            <th>Views</th>
                            <th>Interactions</th>
                            <th>Interaction Rate</th>
                            <th>Conversions</th>
                            <th>CVR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedDisplay.performance_by_day.map((day, index) => (
                            <tr key={index}>
                              <td>{new Date(day.date).toLocaleDateString()}</td>
                              <td>{day.views.toLocaleString()}</td>
                              <td>{day.interactions}</td>
                              <td>{((day.interactions / day.views) * 100).toFixed(2)}%</td>
                              <td>{day.conversions}</td>
                              <td>{((day.conversions / day.interactions) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Time-based Performance</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Time Period</th>
                            <th>Views Share</th>
                            <th>Conversion Rate</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedDisplay.seasonal_trends.map((trend, index) => (
                            <tr key={index}>
                              <td>{trend.period}</td>
                              <td>{trend.views_percentage}%</td>
                              <td>{trend.conversion_rate}%</td>
                              <td>
                                <ProgressBar 
                                  now={trend.views_percentage} 
                                  max={50}
                                  variant={trend.conversion_rate > 6.5 ? 'success' : trend.conversion_rate > 6 ? 'warning' : 'danger'}
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
                    <h6 className="mb-0">Competitor Comparison</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedDisplay.competitor_comparison.map((competitor, index) => (
                      <div key={index} className={`d-flex justify-content-between align-items-center ${index > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                        <div>
                          <h6 className="mb-1">{competitor.competitor}</h6>
                          <small className="text-muted">{competitor.similar_section}</small>
                        </div>
                        <div className="text-end">
                          <div className={`fw-bold ${competitor.performance_vs_us.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                            {competitor.performance_vs_us}
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>

                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Optimization Suggestions</h6>
                  </Card.Header>
                  <Card.Body>
                    {extendedDisplay.optimization_suggestions.map((suggestion, index) => (
                      <div key={index} className={`p-3 border rounded ${index > 0 ? 'mt-3' : ''}`}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg="outline-secondary" style={{fontSize: '10px'}}>
                            {suggestion.type}
                          </Badge>
                          <div className="d-flex gap-1">
                            <Badge bg={suggestion.impact === 'High' ? 'danger' : suggestion.impact === 'Medium' ? 'warning' : 'info'} style={{fontSize: '9px'}}>
                              {suggestion.impact}
                            </Badge>
                            <Badge bg={suggestion.effort === 'Low' ? 'success' : suggestion.effort === 'Medium' ? 'warning' : 'danger'} style={{fontSize: '9px'}}>
                              {suggestion.effort}
                            </Badge>
                          </div>
                        </div>
                        <p className="mb-0" style={{fontSize: '13px'}}>{suggestion.suggestion}</p>
                      </div>
                    ))}
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
        <Button variant="outline-info" onClick={() => onManageProducts && onManageProducts(display)}>
          <IconifyIcon icon="ri:list-check" className="me-1" />
          Manage Products
        </Button>
        <Button variant="outline-warning" onClick={() => onMoveOrder && onMoveOrder(display, 'up')}>
          <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
          Move Up
        </Button>
        <Button variant="outline-warning" onClick={() => onMoveOrder && onMoveOrder(display, 'down')}>
          <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
          Move Down
        </Button>
        <Button 
          variant={display.status === 'active' ? 'warning' : 'success'}
          onClick={() => onStatusChange && onStatusChange(display, display.status === 'active' ? 'inactive' : 'active')}
        >
          <IconifyIcon 
            icon={display.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
            className="me-1" 
          />
          {display.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="primary" onClick={() => onEdit && onEdit(display)}>
          <IconifyIcon icon="ri:pencil-line" className="me-1" />
          Edit Display
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SpecialDisplayDetailsModal;
