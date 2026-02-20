'use client';

import { useState } from 'react';
import { Card, Row, Col, Badge, Tab, Tabs, Button } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import Link from 'next/link';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface CommunitySummary {
  totalCommunities: number;
  activeCommunities: number;
  totalUnits: number;
  occupiedUnits: number;
  totalAmenities: number;
  totalServices: number;
  totalRevenue: number;
  pendingMaintenance: number;
}

// Enhanced Statistics Component (from Lahomes template)
interface StatisticType {
  icon: string;
  title: string;
  amount: string;
  change: number;
  variant?: string;
}

const communityStatisticsData: StatisticType[] = [
  {
    icon: 'ri:building-3-line',
    title: 'Total Communities',
    amount: '12',
    change: 8.5,
  },
  {
    icon: 'ri:home-4-line',
    title: 'Total Units',
    amount: '2,456',
    change: 15.2,
  },
  {
    icon: 'ri:user-location-line',
    title: 'Occupied Units',
    amount: '2,178',
    change: 5.8,
  },
  {
    icon: 'ri:money-dollar-circle-line',
    title: 'Monthly Revenue',
    amount: '$45.6L',
    change: 12.3,
  },
];

const chartOptions = {
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
  colors: ['#eef2f7', '#eef2f7', '#47ad94', '#eef2f7'],
  dataLabels: {
    enabled: false,
  },
  series: [
    {
      name: 'Community Activity',
      data: [40, 50, 65, 40, 40, 65, 40],
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

// Community Performance Chart Options
const communityPerformanceChart = {
  chart: {
    height: 300,
    type: 'area' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#47ad94', '#604ae3', '#ff6b6b', '#ffc107'],
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
      name: 'Occupancy Rate',
      data: [88, 92, 89, 94, 91, 95, 93, 96, 92, 89, 91, 94],
    },
    {
      name: 'Revenue Collection',
      data: [82, 85, 88, 86, 90, 88, 92, 89, 87, 90, 88, 91],
    },
    {
      name: 'Satisfaction Score',
      data: [78, 82, 85, 83, 87, 90, 88, 91, 89, 92, 94, 90],
    },
    {
      name: 'Maintenance Score',
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
        return value + '%';
      },
    },
  },
  legend: {
    position: 'top' as const,
  },
};

// Community Distribution Donut Chart
const communityDistributionChart = {
  chart: {
    height: 300,
    type: 'donut' as const,
  },
  colors: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
  series: [5, 4, 2, 1],
  labels: ['Premium Communities', 'Standard Communities', 'Budget Communities', 'Under Construction'],
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

// Unit Type Distribution Chart
const unitTypeChart = {
  chart: {
    height: 300,
    type: 'bar' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
  series: [
    {
      name: 'Units',
      data: [450, 680, 890, 436],
    },
  ],
  xaxis: {
    categories: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'],
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
      text: 'Number of Units',
    },
  },
};

// Monthly Revenue Trend Chart
const revenueChart = {
  chart: {
    height: 250,
    type: 'line' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#28a745'],
  series: [
    {
      name: 'Revenue ($ Lakhs)',
      data: [35.2, 38.1, 42.5, 45.6, 43.8, 47.2, 45.6, 48.9, 52.1, 49.3, 51.7, 54.2],
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
      text: 'Revenue ($ Lakhs)',
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 6,
    colors: ['#fff'],
    strokeColors: '#28a745',
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
              options={chartOptions}
              series={chartOptions.series}
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

const CommunityManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const communitySummary: CommunitySummary = {
    totalCommunities: 12,
    activeCommunities: 11,
    totalUnits: 2456,
    occupiedUnits: 2178,
    totalAmenities: 45,
    totalServices: 28,
    totalRevenue: 4560000,
    pendingMaintenance: 23,
  };

  const quickActions = [
    {
      title: 'Community Profiles',
      description: 'Manage community information, documentation, and basic configuration',
      icon: 'ri:building-3-line',
      color: 'primary',
      path: '/settings/communities/profiles',
      count: communitySummary.totalCommunities,
    },
    {
      title: 'Units Management',
      description: 'Manage individual units, layouts, pricing, and allocation',
      icon: 'ri:home-4-line',
      color: 'success',
      path: '/settings/communities/units',
      count: communitySummary.totalUnits,
    },
    {
      title: 'Amenities & Facilities',
      description: 'Manage community amenities, booking systems, and maintenance',
      icon: 'ri:service-line',
      color: 'info',
      path: '/settings/communities/amenities',
      count: communitySummary.totalAmenities,
    },
    {
      title: 'Services Management',
      description: 'Manage community services, vendors, and service requests',
      icon: 'ri:customer-service-2-line',
      color: 'warning',
      path: '/settings/communities/services',
      count: communitySummary.totalServices,
    },
    {
      title: 'Staff Management',
      description: 'Manage community staff, roles, schedules, and performance',
      icon: 'ri:team-line',
      color: 'danger',
      path: '/settings/communities/staff',
      count: 0,
    },
    {
      title: 'Finance & Billing',
      description: 'Manage community finances, billing, payments, and accounting',
      icon: 'ri:money-dollar-circle-line',
      color: 'dark',
      path: '/settings/communities/finance',
      count: 0,
    },
    {
      title: 'Documents & Records',
      description: 'Manage community documents, agreements, and legal records',
      icon: 'ri:file-text-line',
      color: 'secondary',
      path: '/settings/communities/documents',
      count: 0,
    },
    {
      title: 'Community Configuration',
      description: 'Configure community settings, rules, and operational parameters',
      icon: 'ri:settings-4-line',
      color: 'info',
      path: '/settings/communities/configuration',
      count: 0,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'new-community',
      title: 'New Community Added',
      description: 'Green Valley Apartments registered with 120 units',
      time: '2 hours ago',
      icon: 'ri:building-3-line',
      color: 'success',
    },
    {
      id: 2,
      type: 'unit-allocation',
      title: 'Unit Allocation',
      description: '15 units allocated in Sunrise Heights - Tower B',
      time: '4 hours ago',
      icon: 'ri:home-4-line',
      color: 'info',
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Maintenance Request',
      description: 'Pool cleaning scheduled for Ocean View Community',
      time: '6 hours ago',
      icon: 'ri:tools-line',
      color: 'warning',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Received',
      description: 'Monthly maintenance collected from Royal Gardens',
      time: '8 hours ago',
      icon: 'ri:money-dollar-circle-line',
      color: 'success',
    },
    {
      id: 5,
      type: 'amenity',
      title: 'New Amenity Added',
      description: 'Yoga studio added to Paradise Towers amenities',
      time: '1 day ago',
      icon: 'ri:service-line',
      color: 'primary',
    },
  ];

  return (
    <>
      <PageTitle 
        title="Community Management" 
        subName="Comprehensive community management system"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="community-management" title="Community Management System">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'overview')}
              className="mb-4"
            >
              <Tab eventKey="overview" title="Overview">
                {/* Enhanced Statistics Cards */}
                <Row className="mb-4">
                  {communityStatisticsData.map((item, idx) => (
                    <Col md={6} xl={3} key={idx}>
                      <StatCard {...item} />
                    </Col>
                  ))}
                </Row>

                {/* Charts removed as requested */}

                {/* Quick Actions Grid */}
                <Row className="mb-4">
                  <Col xs={12}>
                    <h5 className="mb-3">Management Modules</h5>
                  </Col>
                  {quickActions.map((action, index) => (
                    <Col md={6} lg={3} key={index} className="mb-3">
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
                          <span>Active Communities</span>
                          <Badge bg="success">{communitySummary.activeCommunities}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Occupied Units</span>
                          <Badge bg="info">{communitySummary.occupiedUnits}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Total Amenities</span>
                          <Badge bg="warning">{communitySummary.totalAmenities}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Pending Maintenance</span>
                          <Badge bg="danger">{communitySummary.pendingMaintenance}</Badge>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Quick Actions</h6>
                      </Card.Header>
                      <Card.Body className="d-grid gap-2">
                        <Link href="/settings/communities/profiles" className="btn btn-primary">
                          <IconifyIcon icon="ri:building-3-line" className="me-2" />
                          Add New Community
                        </Link>
                        <Link href="/settings/communities/units" className="btn btn-outline-primary">
                          <IconifyIcon icon="ri:home-4-line" className="me-2" />
                          Manage Units
                        </Link>
                        <Link href="/settings/communities/finance" className="btn btn-outline-primary">
                          <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2" />
                          Financial Reports
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="analytics" title="Analytics">
                <Row>
                  <Col xl={12}>
                    <ComponentContainerCard id="comprehensive-analytics" title="Comprehensive Community Analytics Dashboard">
                      <Row className="mb-4">
                        <Col md={6}>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-primary-subtle">
                              <h6 className="mb-0 text-primary">
                                <IconifyIcon icon="ri:pie-chart-line" className="me-2" />
                                Occupancy Rate by Community Type
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: {
                                    type: 'pie' as const,
                                    height: 280,
                                  },
                                  colors: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
                                  series: [95, 88, 82, 75],
                                  labels: ['Premium Communities', 'Standard Communities', 'Budget Communities', 'Under Construction'],
                                  legend: {
                                    position: 'bottom' as const,
                                  },
                                  dataLabels: {
                                    enabled: true,
                                    formatter: function (val: number) {
                                      return Math.round(val) + '%';
                                    },
                                  },
                                }}
                                series={[95, 88, 82, 75]}
                                type="pie"
                                height={280}
                              />
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-success-subtle">
                              <h6 className="mb-0 text-success">
                                <IconifyIcon icon="ri:bar-chart-line" className="me-2" />
                                Monthly Performance Metrics
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: {
                                    type: 'bar' as const,
                                    height: 280,
                                    toolbar: { show: false },
                                  },
                                  colors: ['#28a745', '#17a2b8', '#ffc107'],
                                  plotOptions: {
                                    bar: {
                                      borderRadius: 4,
                                      columnWidth: '60%',
                                    },
                                  },
                                  xaxis: {
                                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                  },
                                  yaxis: {
                                    title: {
                                      text: 'Score (%)',
                                    },
                                  },
                                  dataLabels: {
                                    enabled: false,
                                  },
                                  legend: {
                                    position: 'top' as const,
                                  },
                                }}
                                series={[
                                  {
                                    name: 'Occupancy',
                                    data: [88, 92, 87, 90, 94, 89],
                                  },
                                  {
                                    name: 'Collection',
                                    data: [95, 93, 96, 94, 92, 95],
                                  },
                                  {
                                    name: 'Satisfaction',
                                    data: [82, 85, 80, 87, 90, 86],
                                  },
                                ]}
                                type="bar"
                                height={280}
                              />
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      <Row className="mb-4">
                        <Col md={12}>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-info-subtle">
                              <h6 className="mb-0 text-info">
                                <IconifyIcon icon="ri:line-chart-line" className="me-2" />
                                Community Growth & Revenue Analysis
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: {
                                    type: 'area' as const,
                                    height: 350,
                                    toolbar: { show: false },
                                  },
                                  colors: ['#28a745', '#604ae3'],
                                  fill: {
                                    type: 'gradient',
                                    gradient: {
                                      shadeIntensity: 1,
                                      opacityFrom: 0.7,
                                      opacityTo: 0.3,
                                    },
                                  },
                                  dataLabels: {
                                    enabled: false,
                                  },
                                  stroke: {
                                    curve: 'smooth' as const,
                                    width: 2,
                                  },
                                  xaxis: {
                                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                  },
                                  yaxis: [
                                    {
                                      title: {
                                        text: 'Revenue ($ Lakhs)',
                                      },
                                    },
                                    {
                                      opposite: true,
                                      title: {
                                        text: 'New Communities',
                                      },
                                    },
                                  ],
                                  legend: {
                                    position: 'top' as const,
                                  },
                                }}
                                series={[
                                  {
                                    name: 'Revenue ($ Lakhs)',
                                    data: [35.2, 38.1, 42.5, 45.6, 43.8, 47.2, 45.6, 48.9, 52.1, 49.3, 51.7, 54.2],
                                  },
                                  {
                                    name: 'New Communities',
                                    data: [1, 0, 2, 1, 0, 1, 2, 1, 0, 1, 1, 2],
                                  },
                                ]}
                                type="area"
                                height={350}
                              />
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={12}>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-warning-subtle">
                              <h6 className="mb-0 text-warning">
                                <IconifyIcon icon="ri:alert-line" className="me-2" />
                                Critical Alerts & Notifications
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={3}>
                                  <div className="text-center p-3 bg-danger-subtle rounded">
                                    <IconifyIcon icon="ri:alarm-warning-line" className="fs-2 text-danger mb-2" />
                                    <h5 className="text-danger mb-1">3</h5>
                                    <p className="text-muted mb-0 small">Critical Issues</p>
                                  </div>
                                </Col>
                                <Col md={3}>
                                  <div className="text-center p-3 bg-warning-subtle rounded">
                                    <IconifyIcon icon="ri:tools-line" className="fs-2 text-warning mb-2" />
                                    <h5 className="text-warning mb-1">23</h5>
                                    <p className="text-muted mb-0 small">Pending Maintenance</p>
                                  </div>
                                </Col>
                                <Col md={3}>
                                  <div className="text-center p-3 bg-info-subtle rounded">
                                    <IconifyIcon icon="ri:money-dollar-circle-line" className="fs-2 text-info mb-2" />
                                    <h5 className="text-info mb-1">12</h5>
                                    <p className="text-muted mb-0 small">Payment Delays</p>
                                  </div>
                                </Col>
                                <Col md={3}>
                                  <div className="text-center p-3 bg-secondary-subtle rounded">
                                    <IconifyIcon icon="ri:file-text-line" className="fs-2 text-secondary mb-2" />
                                    <h5 className="text-secondary mb-1">8</h5>
                                    <p className="text-muted mb-0 small">Document Renewals</p>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
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

export default CommunityManagementPage;
