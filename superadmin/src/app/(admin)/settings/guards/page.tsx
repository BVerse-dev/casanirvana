'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Tab, Tabs } from 'react-bootstrap';
import Link from 'next/link';
import ReactApexChart from 'react-apexcharts';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Components
import PageTitle from '@/components/PageTitle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

// Supabase integration hooks
import { 
  useGuardSummary, 
  useGuardPerformanceTrends, 
  useGuardDutyDistribution,
  useGuardShiftTrends,
  useRecentGuardActivities
} from '@/hooks/useGuardDashboard';

interface GuardSummary {
  totalGuards: number;
  activeGuards: number;
  onDutyGuards: number;
  offDutyGuards: number;
  availableGuards: number;
  pendingAssignments: number;
  trainingRequired: number;
  expiredCertifications: number;
}

// Enhanced Statistics Component (from Lahomes template)
interface StatisticType {
  icon: string;
  title: string;
  amount: string;
  change: number;
  variant?: string;
}

// We'll build statistics from the fetched data
const getGuardStatisticsData = (summaryData?: {
  totalGuards: number;
  activeGuards: number;
  onDutyGuards: number;
  availableGuards: number;
  trainingRequired: number;
}): StatisticType[] => {
  return [
    {
      icon: 'ri:team-line',
      title: 'Total Guards',
      amount: summaryData ? String(summaryData.totalGuards) : '0',
      change: 0,
    },
    {
      icon: 'ri:shield-check-line',
      title: 'On Duty',
      amount: summaryData ? String(summaryData.onDutyGuards) : '0',
      change: 0,
    },
    {
      icon: 'ri:user-unfollow-line',
      title: 'Available',
      amount: summaryData ? String(summaryData.availableGuards) : '0',
      change: 0,
    },
    {
      icon: 'ri:alarm-warning-line',
      title: 'Need Training',
      amount: summaryData ? String(summaryData.trainingRequired) : '0',
      change: 0,
      variant: 'danger',
    },
  ];
};

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
  colors: ['#eef2f7', '#eef2f7', '#604ae3', '#eef2f7'],
  dataLabels: {
    enabled: false,
  },
  series: [
    {
      name: 'Guard Activity',
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

// Guard Performance Chart Options
const guardPerformanceChart = {
  chart: {
    height: 300,
    type: 'area' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#47ad94', '#604ae3', '#ff6b6b'],
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
      name: 'Performance Score',
      data: [85, 87, 90, 88, 92, 89, 91, 93, 87, 90, 88, 92],
    },
    {
      name: 'Attendance Rate',
      data: [92, 94, 89, 95, 91, 96, 93, 90, 94, 92, 95, 93],
    },
    {
      name: 'Training Completion',
      data: [78, 82, 85, 83, 87, 90, 88, 91, 89, 92, 94, 90],
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

// Duty Distribution Donut Chart
const dutyDistributionChart = {
  chart: {
    height: 300,
    type: 'donut' as const,
  },
  colors: ['#28a745', '#ffc107', '#6c757d', '#dc3545'],
  series: [16, 8, 0, 0],
  labels: ['On Duty', 'Available', 'Off Duty', 'Training'],
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

// Training Status Bar Chart
const trainingStatusChart = {
  chart: {
    height: 300,
    type: 'bar' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#28a745', '#ffc107', '#dc3545'],
  series: [
    {
      name: 'Guards',
      data: [19, 3, 2],
    },
  ],
  xaxis: {
    categories: ['Certified', 'Training Required', 'Expired Certifications'],
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
      text: 'Number of Guards',
    },
  },
};

// Weekly Schedule Heatmap
const weeklyScheduleChart = {
  chart: {
    height: 250,
    type: 'heatmap' as const,
    toolbar: {
      show: false,
    },
  },
  colors: ['#604ae3'],
  series: [
    {
      name: 'Monday',
      data: [
        { x: '6AM', y: 8 },
        { x: '12PM', y: 12 },
        { x: '6PM', y: 16 },
        { x: '12AM', y: 8 },
      ],
    },
    {
      name: 'Tuesday',
      data: [
        { x: '6AM', y: 7 },
        { x: '12PM', y: 11 },
        { x: '6PM', y: 15 },
        { x: '12AM', y: 9 },
      ],
    },
    {
      name: 'Wednesday',
      data: [
        { x: '6AM', y: 9 },
        { x: '12PM', y: 13 },
        { x: '6PM', y: 14 },
        { x: '12AM', y: 7 },
      ],
    },
    {
      name: 'Thursday',
      data: [
        { x: '6AM', y: 8 },
        { x: '12PM', y: 12 },
        { x: '6PM', y: 16 },
        { x: '12AM', y: 8 },
      ],
    },
    {
      name: 'Friday',
      data: [
        { x: '6AM', y: 10 },
        { x: '12PM', y: 14 },
        { x: '6PM', y: 18 },
        { x: '12AM', y: 6 },
      ],
    },
    {
      name: 'Saturday',
      data: [
        { x: '6AM', y: 6 },
        { x: '12PM', y: 10 },
        { x: '6PM', y: 14 },
        { x: '12AM', y: 10 },
      ],
    },
    {
      name: 'Sunday',
      data: [
        { x: '6AM', y: 5 },
        { x: '12PM', y: 8 },
        { x: '6PM', y: 12 },
        { x: '12AM', y: 11 },
      ],
    },
  ],
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          {
            from: 0,
            to: 5,
            name: 'Low',
            color: '#00A100',
          },
          {
            from: 6,
            to: 10,
            name: 'Medium',
            color: '#128FD9',
          },
          {
            from: 11,
            to: 20,
            name: 'High',
            color: '#FFB200',
          },
        ],
      },
    },
  },
  title: {
    text: 'Guards on Duty (Weekly Schedule)',
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

const GuardManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  
  // Fetch real data from Supabase
  const { data: guardSummary, isLoading: isSummaryLoading } = useGuardSummary();
  const { data: performanceTrends, isLoading: isPerformanceLoading } = useGuardPerformanceTrends();
  const { data: dutyDistribution, isLoading: isDutyLoading } = useGuardDutyDistribution();
  const { data: shiftTrends, isLoading: isShiftLoading } = useGuardShiftTrends();
  const { data: guardActivities, isLoading: isActivitiesLoading } = useRecentGuardActivities();
  
  // Setup real-time subscription
  useEffect(() => {
    // Subscribe to guard changes
    const guardSubscription = supabase
      .channel('guard-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guards' 
      }, () => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['guard-summary'] });
      })
      .subscribe();
      
    // Subscribe to shift changes  
    const shiftSubscription = supabase
      .channel('shift-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guard_shifts' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['guard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['guard-duty-distribution'] });
      })
      .subscribe();
      
    // Subscribe to performance changes
    const performanceSubscription = supabase
      .channel('performance-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guard_performance' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['guard-performance-trends'] });
      })
      .subscribe();
      
    // Subscribe to training changes  
    const trainingSubscription = supabase
      .channel('training-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guard_training' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['guard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['guard-training-status'] });
      })
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      supabase.channel('guard-changes').unsubscribe();
      supabase.channel('shift-changes').unsubscribe();
      supabase.channel('performance-changes').unsubscribe();
      supabase.channel('training-changes').unsubscribe();
    };
  }, [queryClient]);

  const emptyGuardSummary: GuardSummary = {
    totalGuards: 0,
    activeGuards: 0,
    onDutyGuards: 0,
    offDutyGuards: 0,
    availableGuards: 0,
    pendingAssignments: 0,
    trainingRequired: 0,
    expiredCertifications: 0,
  };

  const summaryData = guardSummary || emptyGuardSummary;
  const recentActivityItems = guardActivities || [];
  const performanceLabels = performanceTrends?.labels || [];
  const performanceSeries = [
    {
      name: 'Performance',
      data: performanceTrends?.performanceScores || [],
    },
    {
      name: 'Attendance',
      data: performanceTrends?.attendanceRates || [],
    },
    {
      name: 'Training',
      data: performanceTrends?.trainingCompletionRates || [],
    },
  ];
  const dutySeries = dutyDistribution?.series || [
    summaryData.onDutyGuards,
    summaryData.availableGuards,
    summaryData.offDutyGuards,
    summaryData.trainingRequired,
  ];
  const dutyLabels = dutyDistribution?.labels || ['On Duty', 'Available', 'Off Duty', 'Training'];
  const shiftTrendData = shiftTrends || {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    totalDutyHours: [0, 0, 0, 0],
    overtimeHours: [0, 0, 0, 0],
  };
  const criticalAlerts = [
    summaryData.expiredCertifications > 0
      ? {
          key: 'expiring-certifications',
          variant: 'danger',
          icon: 'ri:alarm-warning-line',
          title: 'Certification Expiring',
          detail: `${summaryData.expiredCertifications} guard${summaryData.expiredCertifications === 1 ? '' : 's'} need renewal`,
        }
      : null,
    summaryData.pendingAssignments > 0
      ? {
          key: 'pending-assignments',
          variant: 'warning',
          icon: 'ri:time-line',
          title: 'Assignment Gap',
          detail: `${summaryData.pendingAssignments} active guard${summaryData.pendingAssignments === 1 ? '' : 's'} awaiting assignment`,
        }
      : null,
    summaryData.trainingRequired > 0
      ? {
          key: 'training-required',
          variant: 'info',
          icon: 'ri:graduation-cap-line',
          title: 'Training Pending',
          detail: `${summaryData.trainingRequired} guard${summaryData.trainingRequired === 1 ? '' : 's'} need training`,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    variant: 'danger' | 'warning' | 'info';
    icon: string;
    title: string;
    detail: string;
  }>;

  const quickActions = [
    {
      title: 'Guard Profiles',
      description: 'Manage guard personal information, documents, and employment details',
      icon: 'ri:user-shield-line',
      color: 'primary',
      path: '/settings/guards/profiles',
      count: summaryData.totalGuards,
    },
    {
      title: 'Schedules & Shifts',
      description: 'Manage work schedules, shift patterns, and duty assignments',
      icon: 'ri:calendar-schedule-line',
      color: 'success',
      path: '/settings/guards/schedules',
      count: summaryData.onDutyGuards,
    },
    {
      title: 'Performance Reviews',
      description: 'Track performance metrics, ratings, and feedback',
      icon: 'ri:bar-chart-box-line',
      color: 'info',
      path: '/settings/guards/performance',
      count: 0,
    },
    {
      title: 'Community Assignments',
      description: 'Assign guards to communities, buildings, and specific posts',
      icon: 'ri:building-line',
      color: 'warning',
      path: '/settings/guards/assignments',
      count: summaryData.pendingAssignments,
    },
    {
      title: 'Training & Certification',
      description: 'Manage training programs, certifications, and skill development',
      icon: 'ri:graduation-cap-line',
      color: 'danger',
      path: '/settings/guards/training',
      count: summaryData.trainingRequired,
    },
    {
      title: 'Equipment Management',
      description: 'Track equipment assignment, maintenance, and inventory',
      icon: 'ri:tools-line',
      color: 'dark',
      path: '/settings/guards/equipment',
      count: 0,
    },
  ];

  return (
    <>
      <PageTitle 
        title="Guard Management" 
        subName="Comprehensive guard management system"
      />

      <Row>
        <Col xs={12}>
          <ComponentContainerCard id="guard-management" title="Guard Management System">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'overview')}
              className="mb-4"
            >
              <Tab eventKey="overview" title="Overview">
                {/* Enhanced Statistics Cards */}
                <Row className="mb-4">
                  {getGuardStatisticsData(summaryData).map((item: StatisticType, idx: number) => (
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
                          {isActivitiesLoading ? (
                            <div className="text-muted text-center py-4">Loading recent guard activity...</div>
                          ) : recentActivityItems.length > 0 ? (
                            recentActivityItems.map((activity) => (
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
                            ))
                          ) : (
                            <div className="text-muted text-center py-4">No recent guard activity is available yet.</div>
                          )}
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
                          <span>Active Guards</span>
                          <Badge bg="success">{summaryData.activeGuards}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Pending Assignments</span>
                          <Badge bg="warning">{summaryData.pendingAssignments}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span>Training Required</span>
                          <Badge bg="danger">{summaryData.trainingRequired}</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Expired Certifications</span>
                          <Badge bg="secondary">{summaryData.expiredCertifications}</Badge>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Quick Actions</h6>
                      </Card.Header>
                      <Card.Body className="d-grid gap-2">
                        <Link href="/settings/guards/profiles" className="btn btn-primary">
                          <IconifyIcon icon="ri:user-add-line" className="me-2" />
                          Add New Guard
                        </Link>
                        <Link href="/settings/guards/schedules" className="btn btn-outline-primary">
                          <IconifyIcon icon="ri:calendar-line" className="me-2" />
                          Manage Schedules
                        </Link>
                        <Link href="/settings/guards/assignments" className="btn btn-outline-primary">
                          <IconifyIcon icon="ri:building-line" className="me-2" />
                          Assign to Community
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="analytics" title="Analytics">
                <Row>
                  <Col xl={12}>
                    <ComponentContainerCard id="comprehensive-analytics" title="Comprehensive Guard Analytics Dashboard">
                      <Row className="mb-4">
                        <Col md={6}>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-primary-subtle">
                              <h6 className="mb-0 text-primary">
                                <IconifyIcon icon="ri:pie-chart-line" className="me-2" />
                                Guard Distribution by Status
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
                                  series: dutySeries,
                                  labels: dutyLabels,
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
                                series={dutySeries}
                                type="pie"
                                height={280}
                              />
                              {isDutyLoading && (
                                <div className="text-muted text-center mt-3">Refreshing distribution data...</div>
                              )}
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
                                    categories: performanceLabels,
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
                                series={performanceSeries}
                                type="bar"
                                height={280}
                              />
                              {!isPerformanceLoading && performanceLabels.length === 0 && (
                                <div className="text-muted text-center mt-3">No performance trend data is available yet.</div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      <Row className="mb-4">
                        <Col md={8}>
                          <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-info-subtle">
                              <h6 className="mb-0 text-info">
                                <IconifyIcon icon="ri:line-chart-line" className="me-2" />
                                Guard Activity Trends (Last 30 Days)
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <ReactApexChart
                                options={{
                                  chart: {
                                    type: 'area' as const,
                                    height: 250,
                                    toolbar: { show: false },
                                  },
                                  colors: ['#604ae3', '#47ad94'],
                                  stroke: {
                                    curve: 'smooth' as const,
                                    width: 2,
                                  },
                                  fill: {
                                    type: 'gradient',
                                    gradient: {
                                      shadeIntensity: 1,
                                      opacityFrom: 0.3,
                                      opacityTo: 0.1,
                                    },
                                  },
                                  xaxis: {
                                    categories: shiftTrendData.labels,
                                  },
                                  yaxis: {
                                    title: {
                                      text: 'Hours',
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
                                    name: 'Total Duty Hours',
                                    data: shiftTrendData.totalDutyHours,
                                  },
                                  {
                                    name: 'Overtime Hours',
                                    data: shiftTrendData.overtimeHours,
                                  },
                                ]}
                                type="area"
                                height={250}
                              />
                              {isShiftLoading && (
                                <div className="text-muted text-center mt-3">Refreshing shift trends...</div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-warning-subtle">
                              <h6 className="mb-0 text-warning">
                                <IconifyIcon icon="ri:alert-line" className="me-2" />
                                Critical Alerts
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              {criticalAlerts.length > 0 ? (
                                criticalAlerts.map((alert) => (
                                  <div key={alert.key} className={`d-flex align-items-center mb-3 p-2 rounded bg-${alert.variant}-subtle`}>
                                    <IconifyIcon
                                      icon={alert.icon}
                                      className={`text-${alert.variant} me-2 fs-18`}
                                    />
                                    <div className="flex-grow-1">
                                      <small className={`fw-bold text-${alert.variant}`}>{alert.title}</small>
                                      <div className="small text-muted">{alert.detail}</div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-muted text-center py-4">
                                  {isSummaryLoading ? 'Loading alert status...' : 'No critical guard alerts at the moment.'}
                                </div>
                              )}
                              <div className="text-center mt-3">
                                <Button variant="outline-warning" size="sm">
                                  <IconifyIcon icon="ri:settings-line" className="me-1" />
                                  Manage Alerts
                                </Button>
                              </div>
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

export default GuardManagementPage;
