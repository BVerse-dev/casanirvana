"use client";

import PageTitle from '@/components/PageTitle'
import { useSearchParams } from 'next/navigation'
import { useGetAgency } from '@/hooks/useAgencies'
import AgencyDetails from './components/AgencyDetails'
import AgencyDetailsBanner from './components/AgencyDetailsBanner'
import { Row, Col, Spinner, Alert, Card, CardBody, CardHeader, Nav, NavItem, NavLink, CardTitle, Badge, Table, ProgressBar, Button, Dropdown, Form } from 'react-bootstrap'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useState } from 'react'

const AgencyDetailsPage = () => {
  // Get agencyId from URL query parameter
  const searchParams = useSearchParams();
  const agencyId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Fetch agency data if ID is provided
  const { data: agency, isLoading, error } = useGetAgency(agencyId || '');
  
  if (!agencyId) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Property Management Company Details" />
        <Row>
          <Col lg={12}>
            <Alert variant="warning">
              No agency ID provided. Please select a property management company from the list or grid view.
            </Alert>
          </Col>
        </Row>
      </>
    );
  }
  
  if (isLoading) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Property Management Company Details" />
        <Row>
          <Col lg={12} className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading property management company details...</p>
          </Col>
        </Row>
      </>
    );
  }
  
  if (error || !agency) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Property Management Company Details" />
        <Row>
          <Col lg={12}>
            <Alert variant="danger">
              <h5>Error Loading Property Management Company</h5>
              <p>{error?.message || "Property management company not found"}</p>
            </Alert>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Property Management Company Details" />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/agency/grid-view" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Management Companies
            </Link>
          </div>
        </Col>
      </Row>
      
      {/* Banner - Always visible */}
      <AgencyDetailsBanner agency={agency} />
      
      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="p-0">
              <Nav variant="tabs" className="nav-tabs-custom border-bottom-0">
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-2" />
                    Overview
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'communities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('communities')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:home-2-bold-duotone" className="me-2" />
                    Communities
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2" />
                    Analytics
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'financials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('financials')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
                    Financials
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'activities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activities')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:clock-circle-bold-duotone" className="me-2" />
                    Activities
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={`px-4 py-3 ${activeTab === 'management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('management')}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconifyIcon icon="solar:settings-bold-duotone" className="me-2" />
                    Management
                  </NavLink>
                </NavItem>
              </Nav>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* All existing agency details content goes here */}
          <AgencyDetails agency={agency} />
        </>
      )}

      {activeTab === 'communities' && (
        <>
          {/* Community Performance Summary - moved to top */}
          <Row className="mb-4">
            <Col lg={4}>
              <Card className="border-0 shadow-sm bg-gradient-success text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-white-75 mb-1">Top Performing</h6>
                      <h4 className="text-white mb-0">Oakwood Residences</h4>
                      <div className="text-white-50 small mt-1">98% Occupancy • ₹7L Revenue</div>
                    </div>
                    <div className="avatar-lg bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:crown-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="border-0 shadow-sm bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-white-75 mb-1">Newest Addition</h6>
                      <h4 className="text-white mb-0">Maple Towers</h4>
                      <div className="text-white-50 small mt-1">Added 2022 • 85 Units</div>
                    </div>
                    <div className="avatar-lg bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:add-circle-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="border-0 shadow-sm bg-gradient-warning text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="text-white-75 mb-1">Total Portfolio Value</h6>
                      <h4 className="text-white mb-0">₹2.74M</h4>
                      <div className="text-white-50 small mt-1">Monthly Revenue Stream</div>
                    </div>
                    <div className="avatar-lg bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:money-bag-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Communities managed by this agency */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <div>
                    <CardTitle className="mb-1">Managed Communities</CardTitle>
                    <div className="d-flex gap-3">
                      <span className="text-muted small">
                        <IconifyIcon icon="solar:buildings-2-bold-duotone" className="me-1 text-primary" />
                        18 Active Communities
                      </span>
                      <span className="text-muted small">
                        <IconifyIcon icon="solar:home-2-bold-duotone" className="me-1 text-success" />
                        1,847 Total Units
                      </span>
                      <span className="text-muted small">
                        <IconifyIcon icon="solar:users-group-rounded-bold-duotone" className="me-1 text-info" />
                        1,652 Occupied Units
                      </span>
                    </div>
                  </div>
                  <Link href="/communities/add">
                    <Button variant="primary" size="sm">
                      <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                      Add Community
                    </Button>
                  </Link>
                </CardHeader>
                <CardBody>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <Table className="table-centered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Community</th>
                          <th>Location</th>
                          <th>Units</th>
                          <th>Occupancy</th>
                          <th>Monthly Revenue</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            id: '1',
                            name: 'Greenfield Heights',
                            location: 'Sector 15, Gurgaon',
                            totalUnits: 120,
                            occupiedUnits: 108,
                            monthlyRevenue: 378000,
                            status: 'Active',
                            managementSince: '2020'
                          },
                          {
                            id: '2',
                            name: 'Paradise Gardens',
                            location: 'DLF Phase 2, Gurgaon',
                            totalUnits: 150,
                            occupiedUnits: 142,
                            monthlyRevenue: 497000,
                            status: 'Active',
                            managementSince: '2019'
                          },
                          {
                            id: '3',
                            name: 'Silver Oak Apartments',
                            location: 'Cyber City, Gurgaon',
                            totalUnits: 95,
                            occupiedUnits: 89,
                            monthlyRevenue: 311500,
                            status: 'Active',
                            managementSince: '2021'
                          },
                          {
                            id: '4',
                            name: 'Oakwood Residences',
                            location: 'Golf Course Extension, Gurgaon',
                            totalUnits: 200,
                            occupiedUnits: 196,
                            monthlyRevenue: 700000,
                            status: 'Active',
                            managementSince: '2018'
                          },
                          {
                            id: '5',
                            name: 'Royal Gardens',
                            location: 'Sohna Road, Gurgaon',
                            totalUnits: 180,
                            occupiedUnits: 165,
                            monthlyRevenue: 577500,
                            status: 'Active',
                            managementSince: '2020'
                          },
                          {
                            id: '6',
                            name: 'Maple Towers',
                            location: 'MG Road, Gurgaon',
                            totalUnits: 85,
                            occupiedUnits: 78,
                            monthlyRevenue: 273000,
                            status: 'Active',
                            managementSince: '2022'
                          }
                        ].map((community) => {
                          const occupancyRate = Math.round((community.occupiedUnits / community.totalUnits) * 100);
                          
                          return (
                            <tr key={community.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm bg-primary-subtle rounded me-2 d-flex align-items-center justify-content-center">
                                    <IconifyIcon 
                                      icon="solar:buildings-2-bold-duotone" 
                                      className="text-primary" 
                                    />
                                  </div>
                                  <div>
                                    <h6 className="mb-1">
                                      <Link 
                                        href={`/communities/details?id=${community.id}`} 
                                        className="text-decoration-none"
                                      >
                                        {community.name}
                                      </Link>
                                    </h6>
                                    <small className="text-muted">Since {community.managementSince}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-medium small">{community.location}</div>
                                  <div className="text-muted small">Gurgaon, Haryana</div>
                                </div>
                              </td>
                              <td>
                                <div className="small">
                                  <div className="fw-medium">{community.totalUnits} Total</div>
                                  <div className="text-muted">{community.occupiedUnits} Occupied</div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2" style={{ minWidth: '60px' }}>
                                    <div className="small fw-medium">{occupancyRate}%</div>
                                    <ProgressBar 
                                      now={occupancyRate} 
                                      variant={occupancyRate >= 90 ? "success" : occupancyRate >= 80 ? "warning" : "danger"}
                                      style={{ height: '4px' }}
                                      className="rounded-pill"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="fw-medium">₹{(community.monthlyRevenue / 100000).toFixed(1)}L</div>
                                <div className="text-muted small">per month</div>
                              </td>
                              <td>
                                <Badge 
                                  bg={community.status === 'Active' ? "success" : "secondary"} 
                                  className="small"
                                >
                                  {community.status}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Link href={`/communities/details?id=${community.id}`}>
                                    <Button 
                                      variant="light" 
                                      size="sm"
                                      title="View Details"
                                    >
                                      <IconifyIcon icon="solar:eye-bold-duotone" />
                                    </Button>
                                  </Link>
                                  <Button 
                                    variant="light" 
                                    size="sm"
                                    title="Manage Community"
                                  >
                                    <IconifyIcon icon="solar:settings-bold-duotone" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                  
                  <div className="text-center mt-3">
                    <Button variant="outline-primary">
                      <IconifyIcon icon="solar:eye-bold-duotone" className="me-1" />
                      View All Communities (18)
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Enhanced Overview Cards - copied from community and adapted for agencies */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Managed Properties</div>
                      <h3 className="mb-0 text-white">24</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:buildings-2-bold" className="me-1" />
                        18 Active Societies
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:buildings-2-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-success text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Client Satisfaction</div>
                      <h3 className="mb-0 text-white">4.8/5</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                        +0.3% this month
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:star-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-warning text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Monthly Revenue</div>
                      <h3 className="mb-0 text-white">₹2.4M</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:wallet-money-bold" className="me-1" />
                        +12.5% from last month
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:money-bag-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-info text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Active Staff</div>
                      <h3 className="mb-0 text-white">48</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:users-group-rounded-bold" className="me-1" />
                        Across all properties
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:users-group-rounded-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Agency Performance Analytics */}
          <Row className="mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Client Retention Rate</span>
                      <span className="small fw-semibold">96%</span>
                    </div>
                    <ProgressBar 
                      now={96} 
                      variant="success" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Service Quality Score</span>
                      <span className="small fw-semibold">4.8/5</span>
                    </div>
                    <ProgressBar 
                      now={96} 
                      variant="warning" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Response Time</span>
                      <span className="small fw-semibold">&lt; 2 hours</span>
                    </div>
                    <ProgressBar 
                      now={92} 
                      variant="info" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-0">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Contract Renewal Rate</span>
                      <span className="small fw-semibold">94%</span>
                    </div>
                    <ProgressBar 
                      now={94} 
                      variant="primary" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:medal-star-bold-duotone" className="me-2 text-primary" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    {[
                      { name: 'Property Maintenance', count: '24 Properties', color: 'primary' },
                      { name: 'Financial Management', count: '₹2.4M Monthly', color: 'success' },
                      { name: 'Security Services', count: '24/7 Coverage', color: 'warning' },
                      { name: 'Facility Management', count: '48 Staff Members', color: 'info' },
                      { name: 'Legal Compliance', count: '100% Compliant', color: 'danger' },
                      { name: 'Resident Services', count: '1,847 Units', color: 'secondary' }
                    ].map((service, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <div className={`d-flex align-items-center p-3 rounded-3 bg-${service.color}-subtle border border-${service.color} border-opacity-25 h-100 transition-all hover-shadow`}>
                          <div className={`avatar-sm rounded-circle bg-${service.color} bg-opacity-10 d-flex align-items-center justify-content-center me-3 flex-shrink-0`}>
                            <IconifyIcon icon="solar:check-circle-bold-duotone" className={`text-${service.color} fs-5`} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold">{service.name}</h6>
                            <span className="small text-muted">{service.count}</span>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'financials' && (
        <>
          {/* Financial Overview Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-success text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Monthly Revenue</div>
                      <h3 className="mb-0 text-white">₹2.74M</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                        +15.2% this month
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:money-bag-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-primary text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Collection Rate</div>
                      <h3 className="mb-0 text-white">94.5%</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:wallet-money-bold" className="me-1" />
                        ₹2.59M Collected
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:wallet-check-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-warning text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Pending Dues</div>
                      <h3 className="mb-0 text-white">₹0.15M</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                        5.5% Outstanding
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-3">
              <Card className="border-0 shadow-sm h-100 bg-gradient-info text-white">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-white-50 mb-1">Annual Revenue</div>
                      <h3 className="mb-0 text-white">₹28.5M</h3>
                      <div className="text-white-75 small">
                        <IconifyIcon icon="solar:chart-2-bold" className="me-1" />
                        Projected Growth
                      </div>
                    </div>
                    <div className="avatar-lg rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center">
                      <IconifyIcon icon="solar:chart-2-bold-duotone" className="fs-24 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Financial Analytics */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:chart-2-bold-duotone" className="me-2 text-primary" />
                    Revenue & Collection Analytics
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row className="g-4">
                    <Col md={6}>
                      {/* Revenue by Community Type */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-success-subtle border border-success border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-success bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:buildings-2-bold-duotone" className="text-success fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Premium Communities</label>
                          <div className="fw-bold text-dark mt-1">₹1.8M (65.7%)</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:arrow-up-bold" className="me-1 text-success" />
                            12 High-end Properties
                          </div>
                        </div>
                      </div>

                      {/* Standard Communities */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-primary-subtle border border-primary border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-primary bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:home-2-bold-duotone" className="text-primary fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Standard Communities</label>
                          <div className="fw-bold text-dark mt-1">₹0.94M (34.3%)</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:buildings-bold" className="me-1 text-primary" />
                            6 Standard Properties
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      {/* Collection Performance */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-warning-subtle border border-warning border-opacity-25 mb-3 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-warning bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:wallet-money-bold-duotone" className="text-warning fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Collection Efficiency</label>
                          <div className="fw-bold text-dark mt-1">94.5% (Excellent)</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:check-circle-bold" className="me-1 text-success" />
                            Above industry average
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="d-flex align-items-center p-3 rounded-3 bg-info-subtle border border-info border-opacity-25 hover-effect transition-all">
                        <div className="avatar-md rounded-circle bg-info bg-opacity-15 d-flex align-items-center justify-content-center me-3 flex-shrink-0">
                          <IconifyIcon icon="solar:card-bold-duotone" className="text-info fs-4" />
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-muted small mb-0 fw-medium">Digital Payments</label>
                          <div className="fw-bold text-dark mt-1">78% Digital</div>
                          <div className="small text-muted mt-1">
                            <IconifyIcon icon="solar:smartphone-bold" className="me-1 text-info" />
                            UPI, Cards, Net Banking
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2 text-primary" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">On-time Payments</span>
                      <span className="small fw-semibold">89.2%</span>
                    </div>
                    <ProgressBar 
                      now={89.2} 
                      variant="success" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Late Payments (1-30 days)</span>
                      <span className="small fw-semibold">5.3%</span>
                    </div>
                    <ProgressBar 
                      now={5.3} 
                      variant="warning" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Overdue (30+ days)</span>
                      <span className="small fw-semibold">5.5%</span>
                    </div>
                    <ProgressBar 
                      now={5.5} 
                      variant="danger" 
                      style={{ height: '8px' }} 
                      className="rounded-pill"
                    />
                  </div>
                  
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="mb-3">Top Paying Communities</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Oakwood Residences</small>
                      <Badge bg="success">100%</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Paradise Gardens</small>
                      <Badge bg="success">98%</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Royal Gardens</small>
                      <Badge bg="success">96%</Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Recent Financial Transactions */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:bill-list-bold-duotone" className="me-2 text-primary" />
                    Recent Transactions
                  </CardTitle>
                  <Button variant="outline-primary" size="sm">
                    <IconifyIcon icon="solar:download-bold-duotone" className="me-1" />
                    Export Report
                  </Button>
                </CardHeader>
                <CardBody>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table className="table-centered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Community</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            date: '15 Dec 2024',
                            community: 'Oakwood Residences',
                            description: 'Monthly Maintenance Collection',
                            amount: 700000,
                            status: 'Completed',
                            method: 'Bank Transfer'
                          },
                          {
                            date: '14 Dec 2024',
                            community: 'Paradise Gardens',
                            description: 'Monthly Maintenance Collection',
                            amount: 497000,
                            status: 'Completed',
                            method: 'UPI'
                          },
                          {
                            date: '13 Dec 2024',
                            community: 'Royal Gardens',
                            description: 'Monthly Maintenance Collection',
                            amount: 577500,
                            status: 'Completed',
                            method: 'Net Banking'
                          },
                          {
                            date: '12 Dec 2024',
                            community: 'Greenfield Heights',
                            description: 'Monthly Maintenance Collection',
                            amount: 378000,
                            status: 'Pending',
                            method: 'Bank Transfer'
                          },
                          {
                            date: '11 Dec 2024',
                            community: 'Silver Oak Apartments',
                            description: 'Special Assessment Fee',
                            amount: 95000,
                            status: 'Completed',
                            method: 'Card Payment'
                          }
                        ].map((transaction, index) => (
                          <tr key={index}>
                            <td>
                              <span className="fw-medium">{transaction.date}</span>
                            </td>
                            <td>
                              <span className="text-dark">{transaction.community}</span>
                            </td>
                            <td>
                              <span className="small">{transaction.description}</span>
                            </td>
                            <td>
                              <span className="fw-medium">₹{(transaction.amount / 100000).toFixed(1)}L</span>
                            </td>
                            <td>
                              <Badge 
                                bg={transaction.status === 'Completed' ? "success" : "warning"} 
                                className="small"
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                            <td>
                              <span className="small text-muted">{transaction.method}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'activities' && (
        <>
          {/* Recent Activity & Upcoming Events */}
          <Row className="mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <CardTitle className="mb-0 d-flex align-items-center">
                      <IconifyIcon icon="solar:clock-circle-bold-duotone" className="me-2 text-primary" />
                      Recent Management Activities
                    </CardTitle>
                    <Badge bg="light" text="dark" className="rounded-pill small">Last 24 Hours</Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="activity-timeline p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {[
                      { 
                        title: 'Maintenance Contract Renewed', 
                        description: 'Annual maintenance contract renewed for Paradise Gardens community',
                        icon: 'solar:document-text-bold-duotone', 
                        color: 'success',
                        time: '2 hours ago',
                        user: 'Property Manager',
                        userAvatar: 'PM'
                      },
                      { 
                        title: 'Staff Performance Review', 
                        description: 'Monthly performance review completed for Oakwood Residences staff',
                        icon: 'solar:users-group-rounded-bold-duotone', 
                        color: 'info',
                        time: '4 hours ago',
                        user: 'HR Department',
                        userAvatar: 'HR'
                      },
                      { 
                        title: 'Financial Report Generated', 
                        description: 'Q4 financial summary report generated for all managed properties',
                        icon: 'solar:chart-2-bold-duotone', 
                        color: 'primary',
                        time: '6 hours ago',
                        user: 'Finance Team',
                        userAvatar: 'FT'
                      },
                      { 
                        title: 'New Community Onboarding', 
                        description: 'Initiated onboarding process for Maple Towers - contract signed',
                        icon: 'solar:buildings-2-bold-duotone', 
                        color: 'warning',
                        time: '8 hours ago',
                        user: 'Business Development',
                        userAvatar: 'BD'
                      },
                      { 
                        title: 'Emergency Response', 
                        description: 'Successfully handled water supply issue at Greenfield Heights',
                        icon: 'solar:danger-triangle-bold-duotone', 
                        color: 'danger',
                        time: '12 hours ago',
                        user: 'Emergency Team',
                        userAvatar: 'ET'
                      },
                      { 
                        title: 'Client Meeting Scheduled', 
                        description: 'Quarterly review meeting scheduled with Royal Gardens committee',
                        icon: 'solar:calendar-date-bold-duotone', 
                        color: 'secondary',
                        time: '1 day ago',
                        user: 'Client Relations',
                        userAvatar: 'CR'
                      }
                    ].map((item, index) => (
                      <div key={index} className={`d-flex mb-4 ${index === 5 ? 'mb-0' : ''}`}>
                        <div className="flex-shrink-0">
                          <div className={`avatar-sm rounded-circle bg-${item.color}-subtle d-flex align-items-center justify-content-center position-relative`}>
                            <IconifyIcon icon={item.icon} className={`fs-18 text-${item.color}`} />
                            {index !== 5 && (
                              <div className="position-absolute start-50 translate-middle-x" style={{ top: '100%', height: '40px', width: '2px', backgroundColor: '#e5e7eb' }}></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0">{item.title}</h6>
                            <small className="text-muted">{item.time}</small>
                          </div>
                          <p className="text-muted mb-1 small">{item.description}</p>
                          <div className="d-flex align-items-center">
                            <div className={`avatar-xs rounded-circle bg-${item.color}-subtle d-flex align-items-center justify-content-center me-2`}>
                              <small className={`text-${item.color} fw-semibold`}>{item.userAvatar}</small>
                            </div>
                            <small className="text-muted">{item.user}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2 text-primary" />
                    Upcoming Events & Tasks
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {[
                    { 
                      date: 'Jan 5, 2025', 
                      event: 'Quarterly Business Review', 
                      time: '2:00 PM',
                      location: 'Head Office',
                      type: 'meeting'
                    },
                    { 
                      date: 'Jan 8, 2025', 
                      event: 'Staff Training Session', 
                      time: '10:00 AM',
                      location: 'Multiple Properties',
                      type: 'training'
                    },
                    { 
                      date: 'Jan 12, 2025', 
                      event: 'Property Inspection Round', 
                      time: '9:00 AM',
                      location: 'All Managed Properties',
                      type: 'inspection'
                    },
                    { 
                      date: 'Jan 15, 2025', 
                      event: 'Board Meeting - Paradise Gardens', 
                      time: '7:00 PM',
                      location: 'Paradise Gardens Club House',
                      type: 'board'
                    },
                    { 
                      date: 'Jan 20, 2025', 
                      event: 'New Client Onboarding', 
                      time: '11:00 AM',
                      location: 'Head Office',
                      type: 'client'
                    }
                  ].map((event, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-3 p-3 rounded bg-light">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <div className={`avatar-xs rounded-circle me-2 d-flex align-items-center justify-content-center ${
                            event.type === 'meeting' ? 'bg-primary-subtle' :
                            event.type === 'training' ? 'bg-success-subtle' :
                            event.type === 'inspection' ? 'bg-warning-subtle' :
                            event.type === 'board' ? 'bg-info-subtle' :
                            'bg-secondary-subtle'
                          }`}>
                            <IconifyIcon 
                              icon={
                                event.type === 'meeting' ? 'solar:users-group-rounded-bold' :
                                event.type === 'training' ? 'solar:book-bold' :
                                event.type === 'inspection' ? 'solar:eye-bold' :
                                event.type === 'board' ? 'solar:presentation-graph-bold' :
                                'solar:user-plus-bold'
                              }
                              className={`fs-12 ${
                                event.type === 'meeting' ? 'text-primary' :
                                event.type === 'training' ? 'text-success' :
                                event.type === 'inspection' ? 'text-warning' :
                                event.type === 'board' ? 'text-info' :
                                'text-secondary'
                              }`} 
                            />
                          </div>
                          <h6 className="mb-0 small">{event.event}</h6>
                        </div>
                        <div className="text-muted small mb-1">
                          <IconifyIcon icon="solar:calendar-bold" className="me-1" />
                          {event.date} at {event.time}
                        </div>
                        <div className="text-muted small">
                          <IconifyIcon icon="solar:map-point-bold" className="me-1" />
                          {event.location}
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Performance Metrics */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:chart-square-bold-duotone" className="me-2 text-primary" />
                    Monthly Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={3} md={6} className="mb-3">
                      <div className="text-center p-3 border rounded-3">
                        <IconifyIcon icon="solar:check-circle-bold-duotone" className="fs-36 text-success mb-2 d-block" />
                        <h4 className="mb-1 text-success">142</h4>
                        <p className="mb-0 text-muted small">Maintenance Requests Completed</p>
                      </div>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                      <div className="text-center p-3 border rounded-3">
                        <IconifyIcon icon="solar:users-group-rounded-bold-duotone" className="fs-36 text-primary mb-2 d-block" />
                        <h4 className="mb-1 text-primary">28</h4>
                        <p className="mb-0 text-muted small">New Client Meetings</p>
                      </div>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                      <div className="text-center p-3 border rounded-3">
                        <IconifyIcon icon="solar:presentation-graph-bold-duotone" className="fs-36 text-warning mb-2 d-block" />
                        <h4 className="mb-1 text-warning">16</h4>
                        <p className="mb-0 text-muted small">Board Meetings Conducted</p>
                      </div>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                      <div className="text-center p-3 border rounded-3">
                        <IconifyIcon icon="solar:star-bold-duotone" className="fs-36 text-info mb-2 d-block" />
                        <h4 className="mb-1 text-info">4.8</h4>
                        <p className="mb-0 text-muted small">Average Client Rating</p>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Active Projects */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:layers-bold-duotone" className="me-2 text-primary" />
                    Active Projects & Initiatives
                  </CardTitle>
                  <Button variant="primary" size="sm">
                    <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                    New Project
                  </Button>
                </CardHeader>
                <CardBody>
                  <Row>
                    {[
                      {
                        title: 'Digital Payment Integration',
                        community: 'All Properties',
                        progress: 75,
                        deadline: 'Jan 31, 2025',
                        status: 'In Progress',
                        color: 'primary'
                      },
                      {
                        title: 'Security System Upgrade',
                        community: 'Oakwood Residences',
                        progress: 45,
                        deadline: 'Feb 15, 2025',
                        status: 'Planning',
                        color: 'warning'
                      },
                      {
                        title: 'Energy Efficiency Program',
                        community: 'Paradise Gardens',
                        progress: 90,
                        deadline: 'Dec 31, 2024',
                        status: 'Near Completion',
                        color: 'success'
                      },
                      {
                        title: 'Staff Training Initiative',
                        community: 'All Properties',
                        progress: 60,
                        deadline: 'Mar 1, 2025',
                        status: 'In Progress',
                        color: 'info'
                      }
                    ].map((project, index) => (
                      <Col lg={6} key={index} className="mb-3">
                        <Card className="border mb-0">
                          <CardBody>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{project.title}</h6>
                                <div className="text-muted small mb-2">{project.community}</div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <Badge bg={project.color} className="small">
                                    {project.status}
                                  </Badge>
                                  <small className="text-muted">Due: {project.deadline}</small>
                                </div>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="text-muted">Progress</small>
                                <small className="fw-semibold">{project.progress}%</small>
                              </div>
                              <ProgressBar 
                                now={project.progress} 
                                variant={project.color}
                                style={{ height: '6px' }}
                                className="rounded-pill"
                              />
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'management' && (
        <>
          {/* Agency Management Overview */}
          <Row className="mb-4">
            <Col xl={12}>
              <Card className="bg-gradient-primary text-white border-0 shadow-lg">
                <CardBody className="p-4">
                  <Row className="align-items-center">
                    <Col lg={8}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="avatar-lg bg-white bg-opacity-20 rounded-circle flex-centered me-3">
                          <IconifyIcon
                            icon="solar:buildings-2-bold-duotone"
                            className="fs-24 text-white"
                          />
                        </div>
                        <div>
                          <CardTitle as="h3" className="text-white mb-1">
                            Prestige Property Management
                          </CardTitle>
                          <p className="text-white-75 mb-0">
                            Professional property management since 2020
                          </p>
                          <p className="text-white-50 mb-0 small">
                            Tower A, Business Plaza, Sector 15, Gurgaon, Haryana 122001
                          </p>
                        </div>
                      </div>

                      <Row className="g-4 mt-4">
                        <Col md={6}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Properties Managed</span>
                            <span className="text-white fw-semibold">24/30</span>
                          </div>
                          <ProgressBar 
                            now={80} 
                            className="progress-sm bg-white bg-opacity-20 mb-3"
                            variant=""
                            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                          >
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: '80%' }}
                            ></div>
                          </ProgressBar>
                          
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Total Units</span>
                            <span className="text-white fw-semibold">1,847</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-white-75">Client Satisfaction</span>
                            <div className="d-flex align-items-center">
                              <span className="text-white fw-semibold me-2">4.8/5</span>
                              <div className="d-flex">
                                {[1,2,3,4,5].map((star, idx) => (
                                  <IconifyIcon 
                                    key={idx}
                                    icon="solar:star-bold" 
                                    className={`small ${idx < 4 ? 'text-warning' : 'text-white-50'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Staff Members</span>
                            <span className="text-white fw-semibold">48</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Monthly Revenue</span>
                            <span className="text-white fw-semibold">₹2.4M</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="text-white-75">Active Licenses</span>
                            <span className="text-white fw-semibold">All Valid</span>
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Service Since</span>
                            <span className="text-white fw-semibold">Jan 2020 (4+ years)</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Response Time</span>
                            <span className="text-white fw-semibold">&lt; 2 hours</span>
                          </div>
                          <ProgressBar 
                            now={92} 
                            className="progress-sm bg-white bg-opacity-20 mb-2"
                            variant=""
                          >
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ width: '92%' }}
                            ></div>
                          </ProgressBar>
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-white-75 small">Performance Rating</span>
                            <span className="text-success small">
                              <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                              Excellent (92%)
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Maintenance Efficiency</span>
                            <span className="text-white fw-semibold">96%</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="text-white-75">Complaint Resolution</span>
                            <span className="text-white fw-semibold">2.1 days avg</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="text-white-75">Emergency Response</span>
                            <span className="text-white fw-semibold">24/7 Available</span>
                          </div>
                        </Col>
                      </Row>
                    </Col>

                    <Col lg={4}>
                      <div className="text-center">
                        <div className="mb-3">
                          <div className="position-relative d-inline-block">
                            <img 
                              src="/images/users/avatar-1.jpg" 
                              alt="Primary Contact"
                              className="avatar-xl rounded-circle border border-white border-3 shadow"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                            <div className="position-absolute bottom-0 end-0">
                              <div className="avatar-xs bg-success rounded-circle border border-white d-flex align-items-center justify-content-center">
                                <div className="bg-white rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                              </div>
                            </div>
                          </div>
                          <h5 className="text-white mb-1 mt-2">
                            Michael Johnson
                          </h5>
                          <p className="text-white-75 mb-0 small">Primary Contact Manager</p>
                          <div className="text-white-50 small">Available Now</div>
                        </div>
                        
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="bg-white bg-opacity-10 rounded-2 p-2 hover-effect cursor-pointer text-center transition-all d-flex align-items-center justify-content-center">
                              <IconifyIcon icon="solar:phone-bold" className="text-white me-1 fs-5" />
                              <div className="text-white fw-medium small">Call Now</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-white bg-opacity-10 rounded-2 p-2 hover-effect cursor-pointer text-center transition-all d-flex align-items-center justify-content-center">
                              <IconifyIcon icon="solar:letter-bold" className="text-white me-1 fs-5" />
                              <div className="text-white fw-medium small">Send Email</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white bg-opacity-10 rounded-3 p-3">
                          <h6 className="text-white mb-2 d-flex align-items-center">
                            <IconifyIcon icon="solar:phone-bold" className="me-2" />
                            Contact Details
                          </h6>
                          <div className="text-start">
                            <div className="d-flex align-items-center mb-1">
                              <IconifyIcon icon="solar:phone-linear" className="text-white-75 me-2 small" />
                              <span className="text-white small">+91 98765 43200</span>
                            </div>
                            <div className="d-flex align-items-center mb-1">
                              <IconifyIcon icon="solar:letter-linear" className="text-white-75 me-2 small" />
                              <span className="text-white small">contact@prestigeproperties.com</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <IconifyIcon icon="solar:clock-circle-linear" className="text-white-75 me-2 small" />
                              <span className="text-white-75 small">Mon-Sat 9AM-6PM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <CardTitle className="mb-0 d-flex align-items-center">
                      <IconifyIcon icon="solar:users-group-two-rounded-bold-duotone" className="me-2 text-primary" />
                      Management Team
                    </CardTitle>
                    <Button 
                      variant="primary" 
                      size="sm"
                    >
                      <IconifyIcon icon="solar:add-circle-bold-duotone" className="me-1" />
                      Add Staff Member
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Contact</th>
                        <th>Experience</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Rahul Sharma', position: 'General Manager', contact: '+91 98765 43210', experience: '8+ years', status: 'Active' },
                        { name: 'Priya Verma', position: 'Property Manager', contact: '+91 98765 43211', experience: '6+ years', status: 'Active' },
                        { name: 'Amit Singh', position: 'Maintenance Head', contact: '+91 98765 43212', experience: '5+ years', status: 'Active' },
                        { name: 'Sneha Patel', position: 'Accounts Manager', contact: '+91 98765 43213', experience: '7+ years', status: 'Active' },
                        { name: 'Ravi Kumar', position: 'Security Supervisor', contact: '+91 98765 43214', experience: '4+ years', status: 'Active' }
                      ].map((member, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center me-2">
                                <IconifyIcon icon="solar:user-bold-duotone" className="text-primary" />
                              </div>
                              <span className="fw-medium">{member.name}</span>
                            </div>
                          </td>
                          <td>{member.position}</td>
                          <td>{member.contact}</td>
                          <td>{member.experience}</td>
                          <td>
                            <Badge bg="success" className="rounded-pill">{member.status}</Badge>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle
                                as="button"
                                className="btn btn-ghost-primary btn-icon btn-sm"
                                aria-label="Actions"
                              >
                                <IconifyIcon icon="solar:menu-dots-bold" className="fs-16" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item>
                                  <IconifyIcon icon="solar:eye-bold" className="me-2" />
                                  View Details
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <IconifyIcon icon="solar:pen-bold" className="me-2" />
                                  Edit Profile
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <IconifyIcon icon="solar:chat-round-dots-bold" className="me-2" />
                                  Send Message
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-danger">
                                  <IconifyIcon icon="solar:trash-bin-minimalistic-bold" className="me-2" />
                                  Remove Access
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:shield-check-bold-duotone" className="me-2 text-primary" />
                    Security & Field Staff
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    {[
                      { name: 'Suresh Kumar', role: 'Head Security', shift: '6 AM - 6 PM', status: 'On Duty', properties: 'Paradise Gardens' },
                      { name: 'Ramesh Yadav', role: 'Night Security', shift: '6 PM - 6 AM', status: 'On Duty', properties: 'Oakwood Residences' },
                      { name: 'Anita Devi', role: 'Cleaning Staff', shift: '8 AM - 4 PM', status: 'On Duty', properties: 'Multiple Properties' },
                      { name: 'Vikash Singh', role: 'Maintenance Tech', shift: '9 AM - 5 PM', status: 'On Duty', properties: 'All Properties' }
                    ].map((staff, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <div className="p-3 border rounded-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="mb-0">{staff.name}</h6>
                            <Badge bg="success" className="rounded-pill small">{staff.status}</Badge>
                          </div>
                          <p className="text-muted mb-1 small">{staff.role}</p>
                          <p className="text-muted mb-1 small">
                            <IconifyIcon icon="solar:clock-circle-bold" className="me-1" />
                            {staff.shift}
                          </p>
                          <p className="text-muted mb-0 small">
                            <IconifyIcon icon="solar:buildings-2-bold" className="me-1" />
                            {staff.properties}
                          </p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:settings-bold-duotone" className="me-2 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" className="text-start">
                      <IconifyIcon icon="solar:bell-bold-duotone" className="me-2" />
                      Send Notice
                    </Button>
                    <Button variant="outline-success" className="text-start">
                      <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
                      Collect Dues
                    </Button>
                    <Button variant="outline-warning" className="text-start">
                      <IconifyIcon icon="solar:tools-bold-duotone" className="me-2" />
                      Maintenance Request
                    </Button>
                    <Button variant="outline-info" className="text-start">
                      <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2" />
                      Schedule Meeting
                    </Button>
                    <Button variant="outline-secondary" className="text-start">
                      <IconifyIcon icon="solar:document-text-bold-duotone" className="me-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-transparent border-bottom-0 pb-0">
                  <CardTitle className="mb-0 d-flex align-items-center">
                    <IconifyIcon icon="solar:file-text-bold-duotone" className="me-2 text-primary" />
                    Recent Documents
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {[
                    { name: 'Service Agreement 2024', date: '15 Dec 2024', type: 'PDF' },
                    { name: 'Performance Report Q4', date: '10 Dec 2024', type: 'PDF' },
                    { name: 'Insurance Policy', date: '5 Dec 2024', type: 'PDF' },
                    { name: 'Staff Training Records', date: '1 Dec 2024', type: 'PDF' }
                  ].map((doc, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 rounded bg-light">
                      <div className="d-flex align-items-center">
                        <IconifyIcon icon="solar:file-text-bold-duotone" className="text-danger me-2" />
                        <div>
                          <div className="small fw-medium">{doc.name}</div>
                          <div className="text-muted small">{doc.date}</div>
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        <IconifyIcon icon="solar:download-bold" />
                      </Button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default AgencyDetailsPage
