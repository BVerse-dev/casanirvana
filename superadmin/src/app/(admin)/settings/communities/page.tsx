'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Row, Tab, Tabs } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import Link from 'next/link';

import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { useCommunityProfiles, useCommunityStats } from '@/hooks/useCommunityProfiles';
import { useCommunityUnits } from '@/hooks/useCommunityUnits';
import { useListAmenities } from '@/hooks/useAmenities';
import { useCommunityServices } from '@/hooks/useCommunityServices';
import { useCommunityDocuments } from '@/hooks/useCommunityDocuments';
import { useListStaff } from '@/hooks/useListStaff';

interface StatisticType {
  icon: string;
  title: string;
  amount: string;
  detail: string;
}

const currencyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat('en-GH', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const StatCard = ({ amount, detail, icon, title }: StatisticType) => (
  <Card>
    <Card.Body>
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <div className="avatar-md bg-light bg-opacity-50 rounded flex-centered mb-3">
            <IconifyIcon width={28} height={28} icon={icon} className="text-primary" />
          </div>
          <p className="text-muted mb-2">{title}</p>
          <h3 className="text-dark fw-bold mb-1">{amount}</h3>
          <small className="text-muted">{detail}</small>
        </div>
      </div>
    </Card.Body>
  </Card>
);

const CommunityManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: communities = [] } = useCommunityProfiles();
  const { data: communityStats } = useCommunityStats();
  const { data: units = [] } = useCommunityUnits();
  const { data: amenities = [] } = useListAmenities();
  const { data: services = [] } = useCommunityServices();
  const { data: documents = [] } = useCommunityDocuments();
  const { data: staff = [] } = useListStaff();

  const summary = useMemo(() => {
    const activeCommunities = communities.filter((community) => community.status === 'active').length;
    const occupiedUnits = units.filter((unit) => unit.status === 'occupied').length;
    const inactiveAmenities = amenities.filter((amenity: any) => amenity.status !== 'active').length;
    const maintenanceIssues = services.filter((service) => ['maintenance', 'inactive'].includes(service.status)).length;
    const expiringDocuments = documents.filter((document) => {
      if (!document.expiry_date) return false;
      const expiry = new Date(document.expiry_date);
      const inThirtyDays = new Date();
      inThirtyDays.setDate(inThirtyDays.getDate() + 30);
      return expiry <= inThirtyDays;
    }).length;
    const totalRevenue = communities.reduce((total, community) => total + community.maintenanceCharge, 0);

    return {
      totalCommunities: communities.length,
      activeCommunities,
      totalUnits: units.length || communityStats?.totalUnits || 0,
      occupiedUnits,
      totalAmenities: amenities.length,
      totalServices: services.length,
      totalStaff: staff.length,
      totalDocuments: documents.length,
      totalRevenue,
      pendingMaintenance: maintenanceIssues,
      alerts: activeCommunities < communities.length ? communities.length - activeCommunities : 0,
      expiringDocuments,
      inactiveAmenities,
    };
  }, [amenities, communities, communityStats?.totalUnits, documents, services, staff.length, units]);

  const occupancyRate = summary.totalUnits > 0 ? Math.round((summary.occupiedUnits / summary.totalUnits) * 100) : 0;

  const communityStatisticsData = useMemo<StatisticType[]>(() => [
    {
      icon: 'ri:building-3-line',
      title: 'Total Communities',
      amount: compactNumber.format(summary.totalCommunities),
      detail: `${summary.activeCommunities} active communities`,
    },
    {
      icon: 'ri:home-4-line',
      title: 'Total Units',
      amount: compactNumber.format(summary.totalUnits),
      detail: `${summary.occupiedUnits} occupied units`,
    },
    {
      icon: 'ri:user-location-line',
      title: 'Occupancy Rate',
      amount: `${occupancyRate}%`,
      detail: `${summary.totalAmenities} amenities online`,
    },
    {
      icon: 'ri:money-dollar-circle-line',
      title: 'Monthly Revenue',
      amount: currencyFormatter.format(summary.totalRevenue),
      detail: `${summary.totalServices} service modules active`,
    },
  ], [occupancyRate, summary]);

  const quickActions = useMemo(() => [
    {
      title: 'Community Profiles',
      description: 'Manage community information, documentation, and basic configuration',
      icon: 'ri:building-3-line',
      color: 'primary',
      path: '/settings/communities/profiles',
      count: summary.totalCommunities,
    },
    {
      title: 'Units Management',
      description: 'Manage individual units, layouts, pricing, and allocation',
      icon: 'ri:home-4-line',
      color: 'success',
      path: '/settings/communities/units',
      count: summary.totalUnits,
    },
    {
      title: 'Amenities & Facilities',
      description: 'Manage community amenities, booking systems, and maintenance',
      icon: 'ri:service-line',
      color: 'info',
      path: '/settings/communities/amenities',
      count: summary.totalAmenities,
    },
    {
      title: 'Services Management',
      description: 'Manage community services, vendors, and service requests',
      icon: 'ri:customer-service-2-line',
      color: 'warning',
      path: '/settings/communities/services',
      count: summary.totalServices,
    },
    {
      title: 'Staff Management',
      description: 'Manage community staff, roles, schedules, and performance',
      icon: 'ri:team-line',
      color: 'danger',
      path: '/settings/communities/staff',
      count: summary.totalStaff,
    },
    {
      title: 'Finance & Billing',
      description: 'Manage community finances, billing, payments, and accounting',
      icon: 'ri:money-dollar-circle-line',
      color: 'dark',
      path: '/settings/communities/finance',
      count: summary.totalCommunities,
    },
    {
      title: 'Documents & Records',
      description: 'Manage community documents, agreements, and legal records',
      icon: 'ri:file-text-line',
      color: 'secondary',
      path: '/settings/communities/documents',
      count: summary.totalDocuments,
    },
    {
      title: 'Community Configuration',
      description: 'Configure community settings, rules, and operational parameters',
      icon: 'ri:settings-4-line',
      color: 'info',
      path: '/settings/communities/configuration',
      count: summary.totalCommunities,
    },
  ], [summary]);

  const formatActivityDate = (value?: string | number | Date | null) => new Date(value ?? Date.now()).toLocaleDateString();
  const toDisplayLabel = (value?: string | null) =>
    (value || 'Not set').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const recentActivities = useMemo(() => {
    const communityActivities = communities.slice(0, 2).map((community) => ({
      id: `community-${community.id}`,
      title: 'Community Profile Updated',
      description: `${community.name} is configured as ${toDisplayLabel(community.communityType).toLowerCase()}.`,
      time: formatActivityDate(),
      icon: 'ri:building-3-line',
      color: 'primary',
    }));

    const unitActivities = units.slice(0, 1).map((unit) => ({
      id: `unit-${unit.id}`,
      title: 'Unit Portfolio Updated',
      description: `${unit.communityName || 'Community'} unit ${unit.unitNumber} is currently ${toDisplayLabel(unit.status).toLowerCase()}.`,
      time: formatActivityDate(unit.updatedAt),
      icon: 'ri:home-4-line',
      color: 'info',
    }));

    const amenityActivities = amenities.slice(0, 1).map((amenity: any) => ({
      id: `amenity-${amenity.id}`,
      title: 'Amenity Availability Updated',
      description: `${amenity.name} is now ${toDisplayLabel(amenity.status).toLowerCase()} in ${amenity.community_name || 'its community'}.`,
      time: formatActivityDate(amenity.updated_at || amenity.created_at),
      icon: 'ri:service-line',
      color: 'success',
    }));

    const serviceActivities = services.slice(0, 1).map((service) => ({
      id: `service-${service.id}`,
      title: 'Service Capacity Updated',
      description: `${service.name} is handling ${service.current_load || 0}/${service.max_requests || 0} active requests.`,
      time: formatActivityDate(service.updated_at || service.created_at),
      icon: 'ri:customer-service-2-line',
      color: 'warning',
    }));

    return [...communityActivities, ...unitActivities, ...amenityActivities, ...serviceActivities].slice(0, 5);
  }, [amenities, communities, services, units]);

  const communityTypeLabels = useMemo(() => {
    const breakdown = communityStats?.communityTypeBreakdown || {};
    const labels = Object.keys(breakdown).map((type) => type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()));
    return labels.length ? labels : ['Communities'];
  }, [communityStats?.communityTypeBreakdown]);

  const communityTypeSeries = useMemo(() => {
    const breakdown = communityStats?.communityTypeBreakdown || {};
    const values = Object.values(breakdown) as number[];
    return values.length ? values : [summary.totalCommunities || 1];
  }, [communityStats?.communityTypeBreakdown, summary.totalCommunities]);

  const revenueChartCategories = useMemo(() => communities.slice(0, 6).map((community) => community.name), [communities]);
  const revenueChartSeries = useMemo(
    () => [
      {
        name: 'Maintenance Charge (GH₵)',
        data: communities.slice(0, 6).map((community) => community.maintenanceCharge),
      },
      {
        name: 'Units',
        data: communities.slice(0, 6).map((community) => community.totalUnits),
      },
    ],
    [communities],
  );

  const performanceSeries = useMemo(
    () => [
      {
        name: 'Occupancy',
        data: [occupancyRate, Math.max(0, occupancyRate - 5), Math.min(100, occupancyRate + 3)],
      },
      {
        name: 'Service Availability',
        data: [
          summary.totalServices > 0 ? Math.round(((summary.totalServices - summary.pendingMaintenance) / summary.totalServices) * 100) : 0,
          summary.totalAmenities > 0 ? Math.round(((summary.totalAmenities - summary.inactiveAmenities) / summary.totalAmenities) * 100) : 0,
          summary.totalDocuments > 0 ? Math.round(((summary.totalDocuments - summary.expiringDocuments) / summary.totalDocuments) * 100) : 0,
        ],
      },
    ],
    [occupancyRate, summary],
  );

  const criticalAlerts = useMemo(
    () => [
      {
        icon: 'ri:alarm-warning-line',
        color: 'danger',
        label: 'Inactive Communities',
        value: summary.alerts,
      },
      {
        icon: 'ri:tools-line',
        color: 'warning',
        label: 'Service Issues',
        value: summary.pendingMaintenance,
      },
      {
        icon: 'ri:file-text-line',
        color: 'secondary',
        label: 'Expiring Documents',
        value: summary.expiringDocuments,
      },
      {
        icon: 'ri:service-line',
        color: 'info',
        label: 'Inactive Amenities',
        value: summary.inactiveAmenities,
      },
    ],
    [summary],
  );

  return (
    <>
      <PageTitle title="Community Management" subName="Comprehensive community management system" />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="community-management" title="Community Management System">
            <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'overview')} className="mb-4">
              <Tab eventKey="overview" title="Overview">
                <Row className="mb-4">
                  {communityStatisticsData.map((item, idx) => (
                    <Col md={6} xl={3} key={idx}>
                      <StatCard {...item} />
                    </Col>
                  ))}
                </Row>

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
                        {recentActivities.length === 0 ? (
                          <div className="text-center py-4 text-muted">No recent community activity yet.</div>
                        ) : (
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
                        )}
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
                          <Badge bg="success">{summary.activeCommunities}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Occupied Units</span>
                          <Badge bg="info">{summary.occupiedUnits}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Total Amenities</span>
                          <Badge bg="warning">{summary.totalAmenities}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Pending Maintenance</span>
                          <Badge bg="danger">{summary.pendingMaintenance}</Badge>
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
                                Community Type Distribution
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: { type: 'pie', height: 280 },
                                  colors: ['#28a745', '#17a2b8', '#ffc107', '#dc3545'],
                                  labels: communityTypeLabels,
                                  legend: { position: 'bottom' },
                                  dataLabels: {
                                    enabled: true,
                                    formatter: (val: number) => `${Math.round(val)}%`,
                                  },
                                }}
                                series={communityTypeSeries}
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
                                Operational Performance Snapshot
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: { type: 'bar', height: 280, toolbar: { show: false } },
                                  colors: ['#28a745', '#17a2b8'],
                                  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
                                  xaxis: { categories: ['Occupancy', 'Service Health', 'Document Health'] },
                                  yaxis: { title: { text: 'Score (%)' }, max: 100 },
                                  dataLabels: { enabled: false },
                                  legend: { position: 'top' },
                                }}
                                series={performanceSeries}
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
                                Community Revenue & Capacity Snapshot
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: { type: 'bar', height: 350, toolbar: { show: false } },
                                  colors: ['#28a745', '#604ae3'],
                                  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
                                  dataLabels: { enabled: false },
                                  xaxis: { categories: revenueChartCategories },
                                  yaxis: [
                                    { title: { text: 'Maintenance Charge (GH₵)' } },
                                    { opposite: true, title: { text: 'Units' } },
                                  ],
                                  legend: { position: 'top' },
                                }}
                                series={revenueChartSeries}
                                type="bar"
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
                                {criticalAlerts.map((alert) => (
                                  <Col md={3} key={alert.label}>
                                    <div className={`text-center p-3 bg-${alert.color}-subtle rounded`}>
                                      <IconifyIcon icon={alert.icon} className={`fs-2 text-${alert.color} mb-2`} />
                                      <h5 className={`text-${alert.color} mb-1`}>{alert.value}</h5>
                                      <p className="text-muted mb-0 small">{alert.label}</p>
                                    </div>
                                  </Col>
                                ))}
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
