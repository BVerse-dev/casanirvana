"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
  Col,
  Row,
  Alert,
  Badge,
  ListGroup,
  ListGroupItem,
  ProgressBar,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-hot-toast";
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { 
  useSystemMetrics, 
  useSystemActivities, 
  useSystemAlerts, 
  useSystemPerformance, 
  useSystemComponents,
  mapSystemMetricsToUI,
  mapResourceUsageToUI,
  mapSystemStatusToUI,
  mapPerformanceDataToUI,
  useDismissSystemAlert
} from '@/hooks/useSystemOverview';
import { supabase } from '@/lib/supabase';

const SystemOverview = () => {
  const router = useRouter();
  // Use Supabase hooks
  const { data: systemMetricsData, isLoading: metricsLoading, error: metricsError } = useSystemMetrics();
  const { data: activitiesData = [], isLoading: activitiesLoading } = useSystemActivities();
  const { data: alertsData = [], isLoading: alertsLoading } = useSystemAlerts();
  const { data: performanceData = [], isLoading: performanceLoading } = useSystemPerformance();
  const { data: componentsData = [], isLoading: componentsLoading } = useSystemComponents();
  const dismissAlertMutation = useDismissSystemAlert();
  const queryClient = useQueryClient();

  // Transform data for UI
  const systemMetrics = systemMetricsData ? mapSystemMetricsToUI(systemMetricsData) : {
    cpu: 0, memory: 0, disk: 0, network: 0, uptime: '0d 0h 0m',
    connections: 0, activeUsers: 0, totalUsers: 0, totalUnits: 0,
    activeComplaints: 0, maintenanceRequests: 0, revenue: 0, payments: 0, visitors: 0
  };

  const resourceUsage = systemMetricsData ? mapResourceUsageToUI(systemMetricsData) : {
    storage: { used: 0, total: 0, unit: 'GB' },
    bandwidth: { used: 0, total: 0, unit: 'TB' },
    apiCalls: { used: 0, total: 0, unit: 'calls' },
    emailQuota: { used: 0, total: 0, unit: 'emails' }
  };

  const systemStatus = mapSystemStatusToUI(componentsData);
  const performanceDataUI = mapPerformanceDataToUI(performanceData);

  const recentActivities = activitiesData.map(activity => ({
    time: activity.time_ago,
    action: activity.action,
    user: activity.user_info,
    type: activity.activity_type,
    icon: activity.icon
  }));

  const systemAlerts = alertsData.map(alert => ({
    type: alert.alert_type,
    message: alert.message,
    time: alert.time_ago,
    id: alert.id
  }));
  const chartCategories = performanceDataUI.length > 0 ? performanceDataUI.map((item) => item.month) : ['No Data'];
  const chartSeries = performanceDataUI.length > 0
    ? [
        { name: 'Users', data: performanceDataUI.map((item) => item.users) },
        { name: 'Complaints', data: performanceDataUI.map((item) => item.complaints) },
        { name: 'Satisfaction', data: performanceDataUI.map((item) => item.satisfaction) },
      ]
    : [
        { name: 'Users', data: [0] },
        { name: 'Complaints', data: [0] },
        { name: 'Satisfaction', data: [0] },
      ];
  const resourceProgress = {
    storage: resourceUsage.storage.total > 0 ? (resourceUsage.storage.used / resourceUsage.storage.total) * 100 : 0,
    bandwidth: resourceUsage.bandwidth.total > 0 ? (resourceUsage.bandwidth.used / resourceUsage.bandwidth.total) * 100 : 0,
    apiCalls: resourceUsage.apiCalls.total > 0 ? (resourceUsage.apiCalls.used / resourceUsage.apiCalls.total) * 100 : 0,
    emailQuota: resourceUsage.emailQuota.total > 0 ? (resourceUsage.emailQuota.used / resourceUsage.emailQuota.total) * 100 : 0,
  };

  // Real-time subscription for system metrics
  useEffect(() => {
    const channel = supabase
      .channel('system-overview-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_overview' }, () => {
        queryClient.invalidateQueries({ queryKey: ['system-metrics'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_activities' }, () => {
        queryClient.invalidateQueries({ queryKey: ['system-activities'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_components' }, () => {
        queryClient.invalidateQueries({ queryKey: ['system-components'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Loading state
  if (metricsLoading || activitiesLoading || alertsLoading || performanceLoading || componentsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-3">Loading system overview...</div>
      </div>
    );
  }

  // Error state
  if (metricsError) {
    return (
      <Alert variant="danger">
        <IconifyIcon icon="ri:error-warning-line" className="me-2" />
        Error loading system overview: {metricsError.message}
      </Alert>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge bg="success" className="small">Operational</Badge>;
      case "degraded":
        return <Badge bg="warning" className="small">Degraded</Badge>;
      case "down":
        return <Badge bg="danger" className="small">Down</Badge>;
      default:
        return <Badge bg="secondary" className="small">Unknown</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    const colors = {
      complaint: "text-warning",
      payment: "text-success",
      maintenance: "text-info",
      visitor: "text-primary",
      system: "text-secondary"
    };
    return colors[type as keyof typeof colors] || "text-muted";
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="page-title">System Overview</h4>
          <p className="text-muted mb-0">Comprehensive dashboard showing real-time system health and performance</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['system-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['system-activities'] });
            queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['system-components'] });
            toast.success('System data refreshed');
          }}>
            <IconifyIcon icon="ri:refresh-line" className="me-1" />
            Refresh
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={() => router.push('/dashboards/analytics')}>
            <IconifyIcon icon="ri:download-line" className="me-1" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Row className="mb-4">
          <Col>
            {systemAlerts.map((alert, index) => (
              <Alert key={index} variant={alert.type} className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center">
                  <IconifyIcon 
                    icon={alert.type === 'warning' ? 'ri:warning-line' : alert.type === 'success' ? 'ri:check-line' : 'ri:information-line'} 
                    className="me-2" 
                  />
                  <span>{alert.message}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">{alert.time}</small>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => dismissAlertMutation.mutate(alert.id)}
                    disabled={dismissAlertMutation.isPending}
                  >
                    <IconifyIcon icon="ri:close-line" />
                  </Button>
                </div>
              </Alert>
            ))}
          </Col>
        </Row>
      )}

      {/* Key Metrics Cards */}
      <Row className="mb-4">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-primary-subtle">
                    <span className="avatar-title rounded-circle text-primary">
                      <IconifyIcon icon="ri:user-line" className="fs-18" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Active Users</p>
                  <h5 className="mb-0">{systemMetrics.activeUsers.toLocaleString()}</h5>
                  <span className="text-muted small">
                    <IconifyIcon icon="ri:pulse-line" /> Live count
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-success-subtle">
                    <span className="avatar-title rounded-circle text-success">
                      <IconifyIcon icon="ri:building-line" className="fs-18" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Total Units</p>
                  <h5 className="mb-0">{systemMetrics.totalUnits.toLocaleString()}</h5>
                  <span className="text-muted small">
                    <IconifyIcon icon="ri:pulse-line" /> Live count
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-warning-subtle">
                    <span className="avatar-title rounded-circle text-warning">
                      <IconifyIcon icon="ri:error-warning-line" className="fs-18" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Active Complaints</p>
                  <h5 className="mb-0">{systemMetrics.activeComplaints}</h5>
                  <span className="text-muted small">
                    <IconifyIcon icon="ri:pulse-line" /> Open workload
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm rounded-circle bg-info-subtle">
                    <span className="avatar-title rounded-circle text-info">
                      <IconifyIcon icon="ri:money-dollar-circle-line" className="fs-18" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <p className="text-muted mb-1">Monthly Revenue</p>
                  <h5 className="mb-0">GH₵ {systemMetrics.revenue.toLocaleString()}</h5>
                  <span className="text-muted small">
                    <IconifyIcon icon="ri:pulse-line" /> Live total
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={8}>
          {/* System Performance */}
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h6">System Performance</CardTitle>
              <Dropdown>
                <DropdownToggle variant="outline-secondary" size="sm">
                  <IconifyIcon icon="ri:more-line" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem>Last 24 Hours</DropdownItem>
                  <DropdownItem>Last 7 Days</DropdownItem>
                  <DropdownItem>Last 30 Days</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">CPU Usage</span>
                      <span className="fw-medium">{systemMetrics.cpu.toFixed(1)}%</span>
                    </div>
                    <ProgressBar 
                      now={systemMetrics.cpu} 
                      variant={systemMetrics.cpu > 80 ? "danger" : systemMetrics.cpu > 60 ? "warning" : "success"} 
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Memory Usage</span>
                      <span className="fw-medium">{systemMetrics.memory.toFixed(1)}%</span>
                    </div>
                    <ProgressBar 
                      now={systemMetrics.memory} 
                      variant={systemMetrics.memory > 85 ? "danger" : systemMetrics.memory > 70 ? "warning" : "info"} 
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Disk Usage</span>
                      <span className="fw-medium">{systemMetrics.disk}%</span>
                    </div>
                    <ProgressBar now={systemMetrics.disk} variant="primary" />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Network I/O</span>
                      <span className="fw-medium">{systemMetrics.network.toFixed(1)}%</span>
                    </div>
                    <ProgressBar now={systemMetrics.network} variant="secondary" />
                  </div>
                </Col>
              </Row>
              <hr />
              <Row className="text-center">
                <Col md={3}>
                  <div className="text-muted small">System Uptime</div>
                  <div className="fw-medium">{systemMetrics.uptime}</div>
                </Col>
                <Col md={3}>
                  <div className="text-muted small">Active Connections</div>
                  <div className="fw-medium">{systemMetrics.connections}</div>
                </Col>
                <Col md={3}>
                  <div className="text-muted small">Database Size</div>
                  <div className="fw-medium">{systemMetricsData?.database_size || 'N/A'}</div>
                </Col>
                <Col md={3}>
                  <div className="text-muted small">Backup Size</div>
                  <div className="fw-medium">{systemMetricsData?.backup_size || 'N/A'}</div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle as="h6">Recent System Activities</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="activity-feed">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="d-flex align-items-start mb-3">
                    <div className="flex-shrink-0 me-3">
                      <div className={`avatar-xs rounded-circle ${getActivityIcon(activity.type)}`}>
                        <IconifyIcon icon={activity.icon} className="fs-16" />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">{activity.action}</div>
                      <div className="text-muted small">{activity.user}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* System Analytics Chart */}
          <Card className="mt-4 overflow-hidden">
            <CardHeader className="d-flex justify-content-between align-items-center pb-1">
              <div>
                <CardTitle as={"h6"}>System Performance Analytics</CardTitle>
                <p className="text-muted mb-0 small">Comprehensive system metrics and trends over time</p>
              </div>
              <Dropdown>
                <DropdownToggle
                  as={"a"}
                  className="btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Last 30 Days{" "}
                  <IconifyIcon
                    className="ms-1"
                    width={16}
                    height={16}
                    icon="ri:arrow-down-s-line"
                  />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem>Last 7 Days</DropdownItem>
                  <DropdownItem>Last 30 Days</DropdownItem>
                  <DropdownItem>Last 90 Days</DropdownItem>
                  <DropdownItem>Last Year</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </CardHeader>
            <CardBody>
              <div className="text-end mb-3">
                <p className="mb-0 fs-18 fw-medium text-dark icons-center">
                  <IconifyIcon icon="ri:dashboard-line" className="me-1" />
                  System Health Score:{" "}
                  <span className="text-success fw-bold">
                    &nbsp;{(systemMetricsData?.system_health_score ?? 0).toFixed(1)}%
                  </span>
                </p>
              </div>
              <Row className="align-items-top text-center">
                <Col lg={12}>
                  <ReactApexChart
                    options={{
                      chart: {
                        height: 350,
                        type: "area",
                        toolbar: {
                          show: true,
                          tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: true,
                            reset: true
                          }
                        },
                      },
                      colors: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"],
                      dataLabels: {
                        enabled: false,
                      },
                      stroke: {
                        curve: "smooth",
                        width: 2,
                      },
                      fill: {
                        type: "gradient",
                        gradient: {
                          shadeIntensity: 1,
                          inverseColors: false,
                          opacityFrom: 0.45,
                          opacityTo: 0.05,
                          stops: [20, 100, 100, 100]
                        }
                      },
                      xaxis: {
                        categories: chartCategories,
                      },
                      yaxis: {
                        title: {
                          text: "Performance Metrics"
                        }
                      },
                      tooltip: {
                        x: {
                          format: "MMM"
                        }
                      },
                      legend: {
                        position: "top",
                        horizontalAlign: "center"
                      },
                      grid: {
                        borderColor: "#e0e6ed",
                        strokeDashArray: 5,
                        xaxis: {
                          lines: {
                            show: true
                          }
                        },
                        yaxis: {
                          lines: {
                            show: true
                          }
                        }
                      }
                    }}
                    series={chartSeries}
                    height={350}
                    type="area"
                    className="apex-charts mt-2"
                  />
                </Col>
              </Row>
            </CardBody>
            <CardFooter className="p-3 bg-light-subtle">
              <Row className="g-3 text-center">
                <Col md={3} className="border-end">
                  <p className="text-muted mb-1 small">Avg CPU Usage</p>
                  <p className="text-dark fs-16 fw-medium d-flex align-items-center justify-content-center gap-1 mb-0">
                    {systemMetrics.cpu.toFixed(1)}%
                  </p>
                </Col>
                <Col md={3} className="border-end">
                  <p className="text-muted mb-1 small">Memory Usage</p>
                  <p className="text-dark fs-16 fw-medium d-flex align-items-center justify-content-center gap-1 mb-0">
                    {systemMetrics.memory.toFixed(1)}%
                  </p>
                </Col>
                <Col md={3} className="border-end">
                  <p className="text-muted mb-1 small">Uptime</p>
                  <p className="text-dark fs-16 fw-medium d-flex align-items-center justify-content-center gap-1 mb-0">
                    {(systemMetricsData?.uptime_percentage ?? 0).toFixed(1)}%
                  </p>
                </Col>
                <Col md={3}>
                  <p className="text-muted mb-1 small">Response Time</p>
                  <p className="text-dark fs-16 fw-medium d-flex align-items-center justify-content-center gap-1 mb-0">
                    {(systemMetricsData?.avg_response_time ?? 0).toFixed(0)}ms
                  </p>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>

        <Col xl={4}>
          {/* System Status */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h6">System Components Status</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <ListGroup variant="flush">
                {systemStatus.map((item, index) => (
                  <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <IconifyIcon icon={item.icon} className="me-2 text-muted" />
                      <div>
                        <div className="fw-medium">{item.label}</div>
                        <small className="text-muted">Uptime: {item.uptime}</small>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle as="h6">6-Month Performance Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <Table size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Users</th>
                    <th>Issues</th>
                    <th>Revenue</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceDataUI.map((data, index) => (
                    <tr key={index}>
                      <td>{data.month}</td>
                      <td>{data.users}</td>
                      <td>
                        <span className={`small ${data.complaints <= 25 ? 'text-success' : data.complaints <= 35 ? 'text-warning' : 'text-danger'}`}>
                          {data.complaints}
                        </span>
                      </td>
                      <td className="small">GH₵ {(data.revenue / 1000).toFixed(0)}k</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <IconifyIcon icon="ri:star-fill" className="text-warning me-1" />
                          <span className="small">{data.satisfaction}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mt-3 text-center">
                <Button variant="outline-primary" size="sm" onClick={() => router.push('/dashboards/analytics')}>
                  <IconifyIcon icon="ri:bar-chart-line" className="me-1" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Resource Usage */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle as="h6">Resource Usage</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Storage Usage</span>
                  <span className="fw-medium">{resourceUsage.storage.used} / {resourceUsage.storage.total} {resourceUsage.storage.unit}</span>
                </div>
                <ProgressBar 
                  now={resourceProgress.storage}
                  variant="primary" 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Bandwidth Usage</span>
                  <span className="fw-medium">{resourceUsage.bandwidth.used} / {resourceUsage.bandwidth.total} {resourceUsage.bandwidth.unit}</span>
                </div>
                <ProgressBar 
                  now={resourceProgress.bandwidth}
                  variant="info" 
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">API Calls</span>
                  <span className="fw-medium">{resourceUsage.apiCalls.used.toLocaleString()} / {resourceUsage.apiCalls.total.toLocaleString()} {resourceUsage.apiCalls.unit}</span>
                </div>
                <ProgressBar 
                  now={resourceProgress.apiCalls}
                  variant="warning" 
                />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Email Quota</span>
                  <span className="fw-medium">{resourceUsage.emailQuota.used} / {resourceUsage.emailQuota.total} {resourceUsage.emailQuota.unit}</span>
                </div>
                <ProgressBar 
                  now={resourceProgress.emailQuota}
                  variant="success" 
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SystemOverview;
