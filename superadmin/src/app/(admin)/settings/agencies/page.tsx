'use client';

import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs, Button } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import Link from 'next/link';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Hooks
import { useAgencyStatistics, useAgencyProfiles } from '@/hooks/useAgencyProfiles';

interface AgencySummary {
  totalAgencies: number;
  activeAgencies: number;
  totalProperties: number;
  totalClients: number;
  totalCommission: number;
  totalServices: number;
  monthlyRevenue: number;
  pendingDeals: number;
}

// Enhanced Statistics Component (from Lahomes template)
interface StatisticType {
  icon: string;
  title: string;
  amount: string;
  change: number;
  variant?: string;
}

// Mock statistics data - will be replaced with dynamic data inside component
const mockAgencyStatisticsData: StatisticType[] = [
  {
    icon: 'ri:building-4-line',
    title: 'Total Agencies',
    amount: '8',
    change: 12.5,
  },
  {
    icon: 'ri:home-5-line',
    title: 'Properties Listed',
    amount: '1,234',
    change: 18.2,
  },
  {
    icon: 'ri:user-3-line',
    title: 'Active Clients',
    amount: '890',
    change: 8.7,
  },
  {
    icon: 'ri:money-dollar-circle-line',
    title: 'Monthly Commission',
    amount: '$12.4L',
    change: 15.3,
  },
];

const statCardChartOptions = {
  chart: {
    height: 95,
    parentHeightOffset: 0,
    type: 'bar' as const,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      barHeight: '100%',
      columnWidth: '40%',
      borderRadius: 4,
      distributed: true,
    },
  },
  grid: {
    show: false,
    padding: {
      top: -20,
      bottom: -10,
      left: 0,
      right: 0,
    },
  },
  colors: ['#eef2f7', '#eef2f7', '#604ae3', '#eef2f7'],
  dataLabels: {
    enabled: false,
  },
  series: [
    {
      name: 'Agency Activity',
      data: [45, 55, 72, 45, 45, 72, 45],
    },
  ],
  legend: {
    show: false,
  },
  xaxis: {
    categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  tooltip: {
    enabled: true,
  },
};

// Agency Performance Chart Options
const agencyPerformanceChart = {
  chart: {
    height: 300,
    type: 'area' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#604ae3', '#47ad94', '#ff6b6b', '#ffc107'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    curve: 'smooth' as const,
    width: 2,
  },
  series: [
    {
      name: 'Properties Listed',
      data: [45, 52, 48, 61, 58, 67, 63, 72, 68, 65, 69, 75],
    },
    {
      name: 'Deals Closed',
      data: [15, 18, 22, 19, 25, 21, 28, 24, 26, 23, 27, 30],
    },
    {
      name: 'Client Satisfaction',
      data: [82, 85, 88, 86, 90, 88, 92, 89, 87, 90, 88, 91],
    },
    {
      name: 'Revenue Growth',
      data: [85, 87, 84, 88, 86, 89, 91, 88, 90, 87, 89, 92],
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: function (value: number) {
        return value.toString();
      },
    },
  },
  legend: {
    position: 'top' as const,
  },
};

// Agency Type Distribution Donut Chart
const agencyDistributionChart = {
  chart: {
    height: 300,
    type: 'donut' as const,
  },
  colors: ['#604ae3', '#47ad94', '#ff6b6b', '#ffc107'],
  series: [3, 2, 2, 1],
  labels: ['Premium Agencies', 'Standard Agencies', 'Residential Focus', 'Commercial Focus'],
  legend: {
    position: 'bottom' as const,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return Math.round(val) + '%';
    },
  },
};

// Property Type Distribution Chart
const propertyTypeChart = {
  chart: {
    height: 300,
    type: 'bar' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#604ae3', '#47ad94', '#ff6b6b', '#ffc107'],
  series: [
    {
      name: 'Properties',
      data: [350, 480, 290, 114],
    },
  ],
  xaxis: {
    categories: ['Apartments', 'Villas', 'Plots', 'Commercial'],
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '60%',
    },
  },
  dataLabels: {
    enabled: true,
  },
  yaxis: {
    title: {
      text: 'Number of Properties',
    },
  },
};

// Monthly Commission Trend Chart
const commissionChart = {
  chart: {
    height: 250,
    type: 'line' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#604ae3'],
  series: [
    {
      name: 'Commission ($ Lakhs)',
      data: [8.2, 9.1, 10.5, 12.4, 11.8, 13.2, 12.4, 14.9, 16.1, 15.3, 17.7, 18.2],
    },
  ],
  stroke: {
    curve: 'smooth' as const,
    width: 3,
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  yaxis: {
    title: {
      text: 'Commission ($ Lakhs)',
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 6,
    colors: ['#fff'],
    strokeColors: '#604ae3',
    strokeWidth: 2,
  },
};



// Enhanced Statistics Card Component
const StatCard = ({ amount, change, icon, title, variant }: StatisticType) => {
  return (
    <Card>
      <Card.Body>
        <Row className="align-items-center justify-content-between">
          <Col xs={6}>
            <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered">
              <IconifyIcon width={32} height={32} icon={icon} className="text-primary" />
            </div>
            <p className="text-muted mb-2 mt-3">{title}</p>
            <h3 className="text-dark fw-bold d-flex align-items-center gap-2 mb-0">
              {amount}{' '}
              <span
                className={`badge text-${variant === 'danger' ? 'danger' : 'success'} bg-${
                  variant === 'danger' ? 'danger' : 'success'
                }-subtle fs-12`}
              >
                {variant === 'danger' ? (
                  <IconifyIcon icon="ri:arrow-down-line" />
                ) : (
                  <IconifyIcon icon="ri:arrow-up-line" />
                )}
                {change}%
              </span>
            </h3>
          </Col>
          <Col xs={6}>
            <ReactApexChart
              options={statCardChartOptions}
              series={statCardChartOptions.series}
              height={95}
              type="bar"
              className="apex-charts"
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const AgencyManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Real data from database
  const { data: agencyStats, isLoading: statsLoading, error: statsError } = useAgencyStatistics();
  const { data: agencies, isLoading: agenciesLoading } = useAgencyProfiles();

  // Transform real data to match UI interface
  const agencySummary: AgencySummary = {
    totalAgencies: agencyStats?.totalAgencies || 0,
    activeAgencies: agencyStats?.activeAgencies || 0,
    totalProperties: agencyStats?.totalProperties || 0,
    totalClients: agencyStats?.totalClients || 0,
    totalCommission: 1240000, // TODO: Calculate from finance data
    totalServices: 18, // TODO: Calculate from services data
    monthlyRevenue: 1240000, // TODO: Calculate from finance data
    pendingDeals: 15, // TODO: Calculate from deals data
  };

  // Dynamic statistics data using real database values
  const agencyStatisticsData: StatisticType[] = [
    {
      icon: 'ri:building-4-line',
      title: 'Total Agencies',
      amount: agencySummary.totalAgencies.toString(),
      change: 12.5, // TODO: Calculate actual change percentage
    },
    {
      icon: 'ri:home-5-line',
      title: 'Properties Listed',
      amount: agencySummary.totalProperties.toLocaleString(),
      change: 18.2, // TODO: Calculate actual change percentage
    },
    {
      icon: 'ri:user-3-line',
      title: 'Active Clients',
      amount: agencySummary.totalClients.toLocaleString(),
      change: 8.7, // TODO: Calculate actual change percentage
    },
    {
      icon: 'ri:money-dollar-circle-line',
      title: 'Monthly Commission',
      amount: `$${(agencySummary.totalCommission / 100000).toFixed(1)}L`,
      change: 15.3, // TODO: Calculate actual change percentage
    },
  ];

  const quickActions = [
    {
      title: 'Agency Profiles',
      description: 'Manage agency information, registration, and basic configuration',
      icon: 'ri:building-4-line',
      color: 'primary',
      path: '/settings/agencies/profiles',
      count: agencySummary.totalAgencies,
    },
    {
      title: 'Agency Configuration',
      description: 'Configure agency settings, commission rates, and operational parameters',
      icon: 'ri:settings-4-line',
      color: 'info',
      path: '/settings/agencies/configuration',
      count: 0,
    },
    {
      title: 'Staff Management',
      description: 'Manage agency staff, roles, performance, and assignments',
      icon: 'ri:team-line',
      color: 'success',
      path: '/settings/agencies/staff',
      count: 0,
    },
    {
      title: 'Services Management',
      description: 'Manage agency services, offerings, and service requests',
      icon: 'ri:customer-service-2-line',
      color: 'warning',
      path: '/settings/agencies/services',
      count: agencySummary.totalServices,
    },
    {
      title: 'Finance & Billing',
      description: 'Manage agency finances, commissions, payments, and accounting',
      icon: 'ri:money-dollar-circle-line',
      color: 'danger',
      path: '/settings/agencies/finance',
      count: 0,
    },
    {
      title: 'Documents & Records',
      description: 'Manage agency documents, agreements, and legal records',
      icon: 'ri:file-text-line',
      color: 'secondary',
      path: '/settings/agencies/documents',
      count: 0,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'new-agency',
      title: 'New Agency Registered',
      description: 'Elite Properties registered with premium tier access',
      time: '2 hours ago',
      icon: 'ri:building-4-line',
      color: 'success',
    },
    {
      id: 2,
      type: 'property-listing',
      title: 'New Property Listed',
      description: '3 BHK Apartment listed by Dream Homes in Whitefield',
      time: '4 hours ago',
      icon: 'ri:home-5-line',
      color: 'info',
    },
    {
      id: 3,
      type: 'deal-closed',
      title: 'Deal Closed',
      description: 'Villa sale completed by Premium Realty - $2.5Cr',
      time: '6 hours ago',
      icon: 'ri:handshake-line',
      color: 'success',
    },
    {
      id: 4,
      type: 'commission',
      title: 'Commission Payment',
      description: 'Monthly commission paid to Urban Properties',
      time: '8 hours ago',
      icon: 'ri:money-dollar-circle-line',
      color: 'warning',
    },
    {
      id: 5,
      type: 'staff-update',
      title: 'Staff Assignment',
      description: 'New sales executive assigned to Skyline Realty',
      time: '1 day ago',
      icon: 'ri:team-line',
      color: 'primary',
    },
  ];

  return (
    <>
      <PageTitle 
        title="Agency Management" 
        subName="Comprehensive agency management system"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="agency-management" title="Agency Management System">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'overview')}
              className="mb-4"
            >
              <Tab eventKey="overview" title="Overview">
                {/* Loading State */}
                {(statsLoading || agenciesLoading) && (
                  <div className="alert alert-info" role="alert">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Loading agency statistics...
                    </div>
                  </div>
                )}

                {/* Error State */}
                {statsError && (
                  <div className="alert alert-danger" role="alert">
                    <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                    Error loading agency statistics. Please try again.
                  </div>
                )}

                {/* Enhanced Statistics Cards */}
                <Row className="mb-4">
                  {agencyStatisticsData.map((item, idx) => (
                    <Col md={6} xl={3} key={idx}>
                      <StatCard {...item} />
                    </Col>
                  ))}
                </Row>

                {/* Quick Actions Grid */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h5 className="mb-3">Management Modules</h5>
                  </Col>
                  {quickActions.map((action, index) => (
                    <Col md={6} lg={4} key={index} className="mb-3">
                      <Card className="h-100 border-0 shadow-sm hover-card">
                        <Card.Body className="p-4">
                          <div className="d-flex align-items-start">
                            <div className={`avatar-md rounded-circle bg-${action.color}-subtle d-flex align-items-center justify-content-center me-3 flex-shrink-0`}>
                              <IconifyIcon icon={action.icon} className={`fs-24 text-${action.color}`} />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <h6 className="mb-0">{action.title}</h6>
                                {action.count > 0 && (
                                  <Badge bg={action.color} className="rounded-pill">
                                    {action.count}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted small mb-3">{action.description}</p>
                              <Link href={action.path} className="btn btn-outline-primary btn-sm">
                                <IconifyIcon icon="ri:arrow-right-line" className="me-1" />
                                Manage
                              </Link>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tab>

              <Tab eventKey="activity" title="Recent Activity">
                <Row>
                  <Col md={8}>
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Recent Activities</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="activity-timeline">
                          {recentActivities.map((activity) => (
                            <div key={activity.id} className="d-flex align-items-start mb-4">
                              <div className={`avatar-sm rounded-circle bg-${activity.color}-subtle d-flex align-items-center justify-content-center me-3 flex-shrink-0`}>
                                <IconifyIcon icon={activity.icon} className={`text-${activity.color}`} />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{activity.title}</h6>
                                <p className="text-muted mb-1">{activity.description}</p>
                                <small className="text-muted">{activity.time}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-center">
                          <Button variant="outline-primary" size="sm">
                            <IconifyIcon icon="ri:more-line" className="me-1" />
                            View All Activities
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-3">
                      <Card.Header>
                        <h6 className="mb-0">Quick Stats</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Active Agencies</span>
                          <Badge bg="success">{agencySummary.activeAgencies}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Total Properties</span>
                          <Badge bg="info">{agencySummary.totalProperties}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Active Clients</span>
                          <Badge bg="warning">{agencySummary.totalClients}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Pending Deals</span>
                          <Badge bg="danger">{agencySummary.pendingDeals}</Badge>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Quick Actions</h6>
                      </Card.Header>
                      <Card.Body className="d-grid gap-2">
                        <Link href="/settings/agencies/profiles" className="btn btn-primary">
                          <IconifyIcon icon="ri:building-4-line" className="me-2" />
                          Add New Agency
                        </Link>
                        <Link href="/settings/agencies/staff" className="btn btn-outline-primary">
                          <IconifyIcon icon="ri:team-line" className="me-2" />
                          Manage Staff
                        </Link>
                        <Link href="/settings/agencies/finance" className="btn btn-outline-primary">
                          <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2" />
                          Commission Reports
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="analytics" title="Analytics">
                {/* Loading State for Analytics */}
                {(statsLoading || agenciesLoading) && (
                  <div className="alert alert-info" role="alert">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Loading analytics data...
                    </div>
                  </div>
                )}

                {/* Error State for Analytics */}
                {statsError && (
                  <div className="alert alert-danger" role="alert">
                    <IconifyIcon icon="ri:error-warning-line" className="me-2" />
                    Error loading analytics data. Please try again.
                  </div>
                )}

                <Row>
                  <Col xl={12}>
                    <ComponentContainerCard id="comprehensive-analytics" title="Comprehensive Agency Analytics Dashboard">
                      {/* Statistics Overview */}
                      <Row className="mb-4 mt-4">
                        <Col md={3}>
                          <div className="text-center p-3 bg-primary-subtle rounded" style={{ minHeight: '120px' }}>
                            <IconifyIcon icon="ri:building-4-line" className="fs-2 text-primary mb-2" />
                            <h5 className="text-primary mb-1">{agencyStats?.totalAgencies || 0}</h5>
                            <p className="text-muted mb-0 small">Total Agencies</p>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center p-3 bg-info-subtle rounded" style={{ minHeight: '120px' }}>
                            <IconifyIcon icon="ri:home-5-line" className="fs-2 text-info mb-2" />
                            <h5 className="text-info mb-1">{agencyStats?.totalProperties || 0}</h5>
                            <p className="text-muted mb-0 small">Total Properties</p>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center p-3 bg-success-subtle rounded" style={{ minHeight: '120px' }}>
                            <IconifyIcon icon="ri:user-3-line" className="fs-2 text-success mb-2" />
                            <h5 className="text-success mb-1">{agencyStats?.totalAgents || 0}</h5>
                            <p className="text-muted mb-0 small">Total Agents</p>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center p-3 bg-warning-subtle rounded" style={{ minHeight: '120px' }}>
                            <IconifyIcon icon="ri:user-line" className="fs-2 text-warning mb-2" />
                            <h5 className="text-warning mb-1">{agencyStats?.totalClients || 0}</h5>
                            <p className="text-muted mb-0 small">Total Clients</p>
                          </div>
                        </Col>
                      </Row>

                      {/* Charts Row */}
                      <Row className="mb-4">
                        <Col xl={8}>
                          <ComponentContainerCard id="agency-performance" title="Agency Performance Trends">
                            <ReactApexChart
                              options={agencyPerformanceChart}
                              series={agencyPerformanceChart.series}
                              height={300}
                              type="area"
                              className="apex-charts"
                            />
                          </ComponentContainerCard>
                        </Col>
                        <Col xl={4}>
                          <ComponentContainerCard id="agency-distribution" title="Agency Distribution">
                            <ReactApexChart
                              options={agencyDistributionChart}
                              series={agencyDistributionChart.series}
                              height={300}
                              type="donut"
                              className="apex-charts"
                            />
                          </ComponentContainerCard>
                        </Col>
                      </Row>

                      {/* Property Types and Commission Chart */}
                      <Row>
                        <Col xl={6}>
                          <ComponentContainerCard id="property-types" title="Property Type Distribution">
                            <ReactApexChart
                              options={propertyTypeChart}
                              series={propertyTypeChart.series}
                              height={300}
                              type="bar"
                              className="apex-charts"
                            />
                          </ComponentContainerCard>
                        </Col>
                        <Col xl={6}>
                          <ComponentContainerCard id="commission-trend" title="Monthly Commission Trend">
                            <ReactApexChart
                              options={commissionChart}
                              series={commissionChart.series}
                              height={250}
                              type="line"
                              className="apex-charts"
                            />
                          </ComponentContainerCard>
                        </Col>
                      </Row>
                    </ComponentContainerCard>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </ComponentContainerCard>
        </Col>
      </Row>
    </>
  );
};

export default AgencyManagementPage;
