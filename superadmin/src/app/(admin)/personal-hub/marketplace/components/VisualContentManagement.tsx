"use client";

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Nav, 
  Tab, 
  Table, 
  Badge, 
  Image,
  Dropdown,
  Form,
  InputGroup
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import HeroSlideDetailsModal from './HeroSlideDetailsModal';
import BannerDetailsModal from './BannerDetailsModal';
import FeaturedSectionDetailsModal from './FeaturedSectionDetailsModal';
import SpecialDisplayDetailsModal from './SpecialDisplayDetailsModal';

const VisualContentManagement = () => {
  const [activeContentTab, setActiveContentTab] = useState<'hero-slider' | 'banners' | 'featured-sections' | 'category-visuals' | 'special-displays'>('hero-slider');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [showSlideDetailsModal, setShowSlideDetailsModal] = useState(false);
  const [showBannerDetailsModal, setShowBannerDetailsModal] = useState(false);
  const [showSectionDetailsModal, setShowSectionDetailsModal] = useState(false);
  const [showDisplayDetailsModal, setShowDisplayDetailsModal] = useState(false);
  
  // Current selected items
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [currentDisplay, setCurrentDisplay] = useState<any>(null);

  // Mock data for hero slides
  const heroSlides = [
    {
      id: '1',
      title: 'Up your glow game',
      subtitle: 'Explore offers on self-care essentials',
      badge: 'Ends Sunday',
      gradient_start: '#8B0000',
      gradient_end: '#DC143C',
      image_url: '/assets/images/img1.png',
      status: 'active',
      order: 1,
      created_at: '2024-01-15',
      clicks: 2450
    },
    {
      id: '2',
      title: 'Summer Collection',
      subtitle: 'Get ready for the season',
      badge: 'New Arrival',
      gradient_start: '#1B4F72',
      gradient_end: '#2E86C1',
      image_url: '/assets/images/img2.png',
      status: 'active',
      order: 2,
      created_at: '2024-01-10',
      clicks: 1890
    },
    {
      id: '3',
      title: 'Wellness Week',
      subtitle: 'Health and beauty essentials',
      badge: 'Limited Time',
      gradient_start: '#0B5345',
      gradient_end: '#239B56',
      image_url: '/assets/images/img3.png',
      status: 'inactive',
      order: 3,
      created_at: '2024-01-05',
      clicks: 1200
    }
  ];

  // Mock data for promotional banners
  const promotionalBanners = [
    {
      id: '1',
      name: 'Flash Sale Banner',
      type: 'promotional',
      position: 'top-banner',
      image_url: '/assets/banners/flash-sale.png',
      link_url: '/marketplace/flash-sale',
      status: 'active',
      start_date: '2024-01-15',
      end_date: '2024-01-20',
      impressions: 15600,
      clicks: 890
    },
    {
      id: '2',
      name: 'Category Header - Beauty',
      type: 'category',
      position: 'category-header',
      image_url: '/assets/banners/beauty-header.png',
      link_url: '/marketplace/category/beauty',
      status: 'active',
      start_date: '2024-01-01',
      end_date: null,
      impressions: 8900,
      clicks: 450
    }
  ];

  // Mock data for featured sections
  const featuredSections = [
    {
      id: '1',
      name: 'Community Picks',
      subtitle: 'Top-rated by neighbors',
      icon: 'people',
      icon_type: 'Ionicons',
      bg_color: '#FFD700',
      navigation_screen: 'communityPicksScreen',
      status: 'active',
      order: 1,
      clicks: 3200
    },
    {
      id: '2',
      name: 'Radiance Routine',
      subtitle: 'Discover skincare tips',
      icon: 'sparkles',
      icon_type: 'Ionicons',
      bg_color: '#9370DB',
      navigation_screen: 'radianceRoutineScreen',
      status: 'active',
      order: 2,
      clicks: 2800
    },
    {
      id: '3',
      name: 'Image Search',
      subtitle: 'Search and shop your pics',
      icon: 'camera',
      icon_type: 'Ionicons',
      bg_color: '#6B3AA0',
      navigation_screen: 'imageSearchScreen',
      status: 'active',
      order: 3,
      clicks: 1950
    }
  ];

  // Mock data for special displays
  const specialDisplays = [
    {
      id: '1',
      name: 'Fresh Foods Section',
      type: 'product-section',
      title: 'Fresh Foods',
      description: 'Local farm produce and organic vegetables',
      display_type: 'horizontal-scroll',
      product_count: 12,
      status: 'active',
      order: 1,
      views: 8900
    },
    {
      id: '2',
      name: 'Home & Living Section',
      type: 'product-section',
      title: 'Home & Living',
      description: 'Modern furniture and home essentials',
      display_type: 'horizontal-scroll',
      product_count: 8,
      status: 'active',
      order: 2,
      views: 6700
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Inactive</Badge>;
      case 'scheduled':
        return <Badge bg="warning">Scheduled</Badge>;
      case 'expired':
        return <Badge bg="danger">Expired</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Handler functions
  const handleSlideDetails = (slide: any) => {
    setCurrentSlide(slide);
    setShowSlideDetailsModal(true);
  };

  const handleBannerDetails = (banner: any) => {
    setCurrentBanner(banner);
    setShowBannerDetailsModal(true);
  };

  const handleSectionDetails = (section: any) => {
    setCurrentSection(section);
    setShowSectionDetailsModal(true);
  };

  const handleDisplayDetails = (display: any) => {
    setCurrentDisplay(display);
    setShowDisplayDetailsModal(true);
  };

  const handleSlideEdit = (slide: any) => {
    console.log('Edit slide:', slide);
    // Implement edit functionality
  };

  const handleSlideStatusChange = (slide: any, newStatus: string) => {
    console.log('Change slide status:', slide.id, newStatus);
    // Implement status change functionality
  };

  const handleSlideMove = (slide: any, direction: 'up' | 'down') => {
    console.log('Move slide:', slide.id, direction);
    // Implement move functionality
  };

  const handleBannerEdit = (banner: any) => {
    console.log('Edit banner:', banner);
    // Implement edit functionality
  };

  const handleBannerStatusChange = (banner: any, newStatus: string) => {
    console.log('Change banner status:', banner.id, newStatus);
    // Implement status change functionality
  };

  const handleSectionEdit = (section: any) => {
    console.log('Edit section:', section);
    // Implement edit functionality
  };

  const handleSectionStatusChange = (section: any, newStatus: string) => {
    console.log('Change section status:', section.id, newStatus);
    // Implement status change functionality
  };

  const handleSectionMove = (section: any, direction: 'up' | 'down') => {
    console.log('Move section:', section.id, direction);
    // Implement move functionality
  };

  const handleDisplayEdit = (display: any) => {
    console.log('Edit display:', display);
    // Implement edit functionality
  };

  const handleDisplayStatusChange = (display: any, newStatus: string) => {
    console.log('Change display status:', display.id, newStatus);
    // Implement status change functionality
  };

  const handleDisplayMove = (display: any, direction: 'up' | 'down') => {
    console.log('Move display:', display.id, direction);
    // Implement move functionality
  };

  const handleManageProducts = (display: any) => {
    console.log('Manage products for display:', display.id);
    // Implement product management functionality
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">Visual Content Management</Card.Title>
      </Card.Header>
      <Card.Body>
        <Tab.Container activeKey={activeContentTab} onSelect={(k) => setActiveContentTab(k as any)}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="hero-slider">
                <IconifyIcon icon="ri:slideshow-2-line" className="me-1" />
                Hero Slider
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="banners">
                <IconifyIcon icon="ri:advertisement-line" className="me-1" />
                Banners
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="featured-sections">
                <IconifyIcon icon="ri:star-line" className="me-1" />
                Featured Sections
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="category-visuals">
                <IconifyIcon icon="ri:palette-line" className="me-1" />
                Category Visuals
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="special-displays">
                <IconifyIcon icon="ri:layout-2-line" className="me-1" />
                Special Displays
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* Hero Slider Management */}
            <Tab.Pane eventKey="hero-slider">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Hero Slider Management</h5>
                <Button variant="primary" size="sm">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Hero Slide
                </Button>
              </div>
              
              <div className="alert alert-info">
                <IconifyIcon icon="ri:information-line" className="me-1" />
                Manage the main hero carousel that appears at the top of the marketplace. Slides auto-rotate every 4 seconds.
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Title & Content</th>
                      <th>Gradient Colors</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Performance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroSlides.map((slide) => (
                      <tr key={slide.id}>
                        <td>
                          <div 
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: 80,
                              height: 50,
                              borderRadius: 8,
                              background: `linear-gradient(45deg, ${slide.gradient_start}, ${slide.gradient_end})`,
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            Slide {slide.order}
                          </div>
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-1">{slide.title}</h6>
                            <p className="text-muted mb-1" style={{fontSize: '13px'}}>{slide.subtitle}</p>
                            {slide.badge && (
                              <Badge bg="dark" className="me-1" style={{fontSize: '10px'}}>
                                {slide.badge}
                              </Badge>
                            )}
                          </div>
                        </td>
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
                            <div 
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: slide.gradient_end,
                                border: '2px solid #fff',
                                boxShadow: '0 0 0 1px #ddd'
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>{getStatusBadge(slide.status)}</td>
                        <td>
                          <Badge bg="outline-primary" className="me-1">
                            #{slide.order}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatNumber(slide.clicks)} clicks<br/>
                            Created: {formatDate(slide.created_at)}
                          </small>
                        </td>
                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                              <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleSlideDetails(slide)}>
                                <IconifyIcon icon="ri:information-line" className="me-1" />
                                View Details
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleSlideEdit(slide)}>
                                <IconifyIcon icon="ri:pencil-line" className="me-1" />
                                Edit Slide
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <IconifyIcon icon="ri:eye-line" className="me-1" />
                                Preview
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleSlideMove(slide, 'up')}>
                                <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                                Move Up
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleSlideMove(slide, 'down')}>
                                <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
                                Move Down
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleSlideStatusChange(slide, slide.status === 'active' ? 'inactive' : 'active')}
                              >
                                <IconifyIcon 
                                  icon={slide.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
                                  className="me-1" 
                                />
                                {slide.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger">
                                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab.Pane>

            {/* Banners Management */}
            <Tab.Pane eventKey="banners">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Banner Management</h5>
                <Button variant="primary" size="sm">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Banner
                </Button>
              </div>

              <div className="alert alert-info">
                <IconifyIcon icon="ri:information-line" className="me-1" />
                Manage promotional banners, category headers, and advertisement displays throughout the marketplace.
              </div>

              <Row className="mb-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <IconifyIcon icon="ri:search-line" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search banners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Name & Type</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Schedule</th>
                      <th>Performance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionalBanners.map((banner) => (
                      <tr key={banner.id}>
                        <td>
                          <div 
                            className="d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: 80,
                              height: 40,
                              borderRadius: 6,
                              background: 'linear-gradient(45deg, #6B3AA0, #9B59B6)',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          >
                            Banner
                          </div>
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-1">{banner.name}</h6>
                            <Badge bg="outline-secondary" style={{fontSize: '10px'}}>
                              {banner.type}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info" style={{fontSize: '11px'}}>
                            {banner.position}
                          </Badge>
                        </td>
                        <td>{getStatusBadge(banner.status)}</td>
                        <td>
                          <small className="text-muted">
                            Start: {formatDate(banner.start_date)}<br/>
                            {banner.end_date ? `End: ${formatDate(banner.end_date)}` : 'No end date'}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatNumber(banner.impressions)} views<br/>
                            {formatNumber(banner.clicks)} clicks
                          </small>
                        </td>
                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                              <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleBannerDetails(banner)}>
                                <IconifyIcon icon="ri:information-line" className="me-1" />
                                View Details
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleBannerEdit(banner)}>
                                <IconifyIcon icon="ri:pencil-line" className="me-1" />
                                Edit Banner
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <IconifyIcon icon="ri:eye-line" className="me-1" />
                                Preview
                              </Dropdown.Item>
                              <Dropdown.Item>
                                <IconifyIcon icon="ri:bar-chart-line" className="me-1" />
                                Analytics
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleBannerStatusChange(banner, banner.status === 'active' ? 'inactive' : 'active')}
                              >
                                <IconifyIcon 
                                  icon={banner.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
                                  className="me-1" 
                                />
                                {banner.status === 'active' ? 'Pause' : 'Activate'}
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger">
                                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab.Pane>

            {/* Featured Sections Management */}
            <Tab.Pane eventKey="featured-sections">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Featured Sections Management</h5>
                <Button variant="primary" size="sm">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Featured Section
                </Button>
              </div>

              <div className="alert alert-info">
                <IconifyIcon icon="ri:information-line" className="me-1" />
                Manage the Try Something New section and other featured promotional areas.
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Name & Description</th>
                      <th>Icon & Color</th>
                      <th>Navigation</th>
                      <th>Status</th>
                      <th>Performance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredSections.map((section) => (
                      <tr key={section.id}>
                        <td>
                          <div 
                            className="d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              backgroundColor: section.bg_color
                            }}
                          >
                            <IconifyIcon icon="ri:star-line" size={20} />
                          </div>
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-1">{section.name}</h6>
                            <p className="text-muted mb-0" style={{fontSize: '13px'}}>
                              {section.subtitle}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Badge bg="dark" className="me-2" style={{fontSize: '10px'}}>
                              {section.icon}
                            </Badge>
                            <div 
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                backgroundColor: section.bg_color
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="outline-info" style={{fontSize: '10px'}}>
                            {section.navigation_screen}
                          </Badge>
                        </td>
                        <td>{getStatusBadge(section.status)}</td>
                        <td>
                          <small className="text-muted">
                            {formatNumber(section.clicks)} clicks<br/>
                            Order: #{section.order}
                          </small>
                        </td>
                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                              <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleSectionDetails(section)}>
                                <IconifyIcon icon="ri:information-line" className="me-1" />
                                View Details
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleSectionEdit(section)}>
                                <IconifyIcon icon="ri:pencil-line" className="me-1" />
                                Edit Section
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleSectionMove(section, 'up')}>
                                <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                                Move Up
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleSectionMove(section, 'down')}>
                                <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
                                Move Down
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleSectionStatusChange(section, section.status === 'active' ? 'inactive' : 'active')}
                              >
                                <IconifyIcon 
                                  icon={section.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
                                  className="me-1" 
                                />
                                {section.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger">
                                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab.Pane>

            {/* Category Visuals Management */}
            <Tab.Pane eventKey="category-visuals">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Category Visual Management</h5>
                <Button variant="primary" size="sm">
                  <IconifyIcon icon="ri:palette-line" className="me-1" />
                  Customize Visuals
                </Button>
              </div>

              <div className="alert alert-info">
                <IconifyIcon icon="ri:information-line" className="me-1" />
                Manage gradient backgrounds, images, and visual styling for marketplace categories.
              </div>

              <Row>
                {/* Category visual cards would go here */}
                <Col md={6} className="mb-3">
                  <Card className="border">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        <div 
                          className="me-3"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 12,
                            background: 'linear-gradient(45deg, #FFB3D9, #FFC4E1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          Baby
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Baby & Toddler</h6>
                          <small className="text-muted">Gradient: #FFB3D9 → #FFC4E1</small>
                        </div>
                        <Button variant="outline-primary" size="sm">
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="border">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        <div 
                          className="me-3"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 12,
                            background: 'linear-gradient(45deg, #A4C4A4, #B8D4B8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          Home
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Home</h6>
                          <small className="text-muted">Gradient: #A4C4A4 → #B8D4B8</small>
                        </div>
                        <Button variant="outline-primary" size="sm">
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Special Displays Management */}
            <Tab.Pane eventKey="special-displays">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Special Displays Management</h5>
                <Button variant="primary" size="sm">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add Display Section
                </Button>
              </div>

              <div className="alert alert-info">
                <IconifyIcon icon="ri:information-line" className="me-1" />
                Manage product sections like Fresh Foods, Home & Living, and other special display areas.
              </div>

              <div className="table-responsive">
                <Table className="table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Section Name</th>
                      <th>Type</th>
                      <th>Display Style</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Performance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialDisplays.map((display) => (
                      <tr key={display.id}>
                        <td>
                          <div>
                            <h6 className="mb-1">{display.title}</h6>
                            <p className="text-muted mb-0" style={{fontSize: '13px'}}>
                              {display.description}
                            </p>
                          </div>
                        </td>
                        <td>
                          <Badge bg="outline-secondary" style={{fontSize: '11px'}}>
                            {display.type}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="info" style={{fontSize: '11px'}}>
                            {display.display_type}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="primary">
                            {display.product_count} items
                          </Badge>
                        </td>
                        <td>{getStatusBadge(display.status)}</td>
                        <td>
                          <small className="text-muted">
                            {formatNumber(display.views)} views<br/>
                            Order: #{display.order}
                          </small>
                        </td>
                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="card-drop arrow-none cursor-pointer p-0 shadow-none">
                              <IconifyIcon icon="ri:more-2-fill" className="font-18" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleDisplayDetails(display)}>
                                <IconifyIcon icon="ri:information-line" className="me-1" />
                                View Details
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDisplayEdit(display)}>
                                <IconifyIcon icon="ri:pencil-line" className="me-1" />
                                Edit Display
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleManageProducts(display)}>
                                <IconifyIcon icon="ri:list-check" className="me-1" />
                                Manage Products
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDisplayMove(display, 'up')}>
                                <IconifyIcon icon="ri:arrow-up-line" className="me-1" />
                                Move Up
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDisplayMove(display, 'down')}>
                                <IconifyIcon icon="ri:arrow-down-line" className="me-1" />
                                Move Down
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleDisplayStatusChange(display, display.status === 'active' ? 'inactive' : 'active')}
                              >
                                <IconifyIcon 
                                  icon={display.status === 'active' ? 'ri:pause-line' : 'ri:play-line'} 
                                  className="me-1" 
                                />
                                {display.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger">
                                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
      
      {/* Detail Modals */}
      <HeroSlideDetailsModal
        show={showSlideDetailsModal}
        onHide={() => setShowSlideDetailsModal(false)}
        slide={currentSlide}
        onEdit={handleSlideEdit}
        onStatusChange={handleSlideStatusChange}
        onMoveOrder={handleSlideMove}
      />
      
      <BannerDetailsModal
        show={showBannerDetailsModal}
        onHide={() => setShowBannerDetailsModal(false)}
        banner={currentBanner}
        onEdit={handleBannerEdit}
        onStatusChange={handleBannerStatusChange}
      />
      
      <FeaturedSectionDetailsModal
        show={showSectionDetailsModal}
        onHide={() => setShowSectionDetailsModal(false)}
        section={currentSection}
        onEdit={handleSectionEdit}
        onStatusChange={handleSectionStatusChange}
        onMoveOrder={handleSectionMove}
      />
      
      <SpecialDisplayDetailsModal
        show={showDisplayDetailsModal}
        onHide={() => setShowDisplayDetailsModal(false)}
        display={currentDisplay}
        onEdit={handleDisplayEdit}
        onStatusChange={handleDisplayStatusChange}
        onMoveOrder={handleDisplayMove}
        onManageProducts={handleManageProducts}
      />
    </Card>
  );
};

export default VisualContentManagement;
