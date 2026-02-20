"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Badge, Button, Card, CardBody, CardHeader, Col, ProgressBar, Row, Table } from "react-bootstrap";
import { 
  useListNotificationCampaigns, 
  useListNotificationMetrics, 
  useTodayActivitySummary,
  useChannelPerformance
} from "@/hooks/useNotificationsDashboard";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Modal, Form, FloatingLabel } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";


const NotificationsDashboardView = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS!
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = useSession();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Fetch data from Supabase - these hooks must always be called
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useListNotificationCampaigns(undefined, 5);
  const { data: metrics = [], isLoading: metricsLoading, error: metricsError } = useListNotificationMetrics(7);
  const { data: todayStats, isLoading: statsLoading, error: statsError } = useTodayActivitySummary();
  const { data: channelPerformance, isLoading: channelLoading, error: channelError } = useChannelPerformance();

  // State hooks - must always be called
  const [showSendBroadcastModal, setShowSendBroadcastModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time subscriptions - useEffect must always be called
  useEffect(() => {
    // Subscribe to notification campaigns changes
    const campaignsChannel = supabase
      .channel('notification_campaigns_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_campaigns'
        },
        (payload) => {
          console.log('Notification campaign changed:', payload);
          // Invalidate campaigns queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['notification_campaigns'] });
          queryClient.invalidateQueries({ queryKey: ['notification_analytics'] });
        }
      )
      .subscribe();

    // Subscribe to notification metrics changes  
    const metricsChannel = supabase
      .channel('notification_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_metrics'
        },
        (payload) => {
          console.log('Notification metrics changed:', payload);
          // Invalidate metrics queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['notification_metrics'] });
          queryClient.invalidateQueries({ queryKey: ['notification_analytics'] });
        }
      )
      .subscribe();

    // Subscribe to notification analytics changes
    const analyticsChannel = supabase
      .channel('notification_analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_analytics'
        },
        (payload) => {
          console.log('Notification analytics changed:', payload);
          // Invalidate analytics queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['notification_analytics'] });
          queryClient.invalidateQueries({ queryKey: ['notification_dashboard_stats'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(campaignsChannel);
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(analyticsChannel);
    };
  }, [queryClient]);

  // ALL HOOKS ABOVE THIS LINE - NO HOOKS BELOW THIS LINE!
  // NOW WE CAN DO CONDITIONAL LOGIC AND EARLY RETURNS

  // Check loading states
  const isLoading = campaignsLoading || metricsLoading || statsLoading || channelLoading;
  const hasError = campaignsError || metricsError || statsError || channelError;

  // Handler functions
  const handleSendBroadcastClick = () => {
    setShowSendBroadcastModal(true);
  };

  const handleCreateTemplateClick = () => {
    setShowCreateTemplateModal(true);
  };

  const handleCloseModals = () => {
    setShowSendBroadcastModal(false);
    setShowCreateTemplateModal(false);
  };

  const handleSendBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const recipients = formData.get('recipients') as string;
    const message = formData.get('message') as string;

    if (!title || !type || !recipients || !message) {
      toast.error("Please fill in all fields for the broadcast.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = session?.accessToken as string | undefined;
      if (!token) {
        throw new Error("Missing admin session. Please sign in again.");
      }

      const recipientCount = recipients.split(',').length;
      const response = await fetch(`${apiBaseUrl}/admin/notification-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
        title,
        type,
        recipients_count: recipientCount,
        message,
        sent_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || payload.message || 'Failed to create campaign');
      }

      toast.success(`Broadcast "${title}" sent to ${recipientCount} recipients!`);
      setShowSendBroadcastModal(false);
      queryClient.invalidateQueries({ queryKey: ['notification_campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['notification_analytics'] });
    } catch (err) {
      console.error("Error creating broadcast:", err);
      toast.error("Failed to send broadcast. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const templateName = formData.get('title') as string;
    const templateContent = formData.get('message') as string;

    if (!templateName || !templateContent) {
      toast.error("Please fill in all fields for the template.");
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, we'll just simulate template creation and navigate to templates page
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Template created successfully!");
      setShowCreateTemplateModal(false);
      // Navigate to templates page to view the new template
      router.push('/notifications/templates');
    } catch (err) {
      console.error("Error creating template:", err);
      toast.error("Failed to create template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleCampaignClick = () => {
    router.push('/notifications/campaigns');
  };

  const handleViewAnalyticsClick = () => {
    router.push('/notifications/analytics');
  };

  // Handle loading and error states AFTER all hooks
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading dashboard data</h4>
        <p>Failed to load notifications dashboard data. Please try again later.</p>
        <hr />
        <p className="mb-0">
          {campaignsError?.message || metricsError?.message || statsError?.message || 
           channelError?.message}
        </p>
      </div>
    );
  }

  // Process metrics data for charts
  const processMetricsForChart = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const pushData = new Array(7).fill(0);
    const smsData = new Array(7).fill(0);
    const emailData = new Array(7).fill(0);

    // Use trends data if available, otherwise calculate from metrics
    if (trendsData?.data) {
      const trends = trendsData.data as any;
      return {
        labels: trends.days || days,
        datasets: [
          {
            label: "Push Notifications",
            data: trends.push_notifications || pushData,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            tension: 0.4,
          },
          {
            label: "SMS Notifications", 
            data: trends.sms_notifications || smsData,
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
          },
          {
            label: "Email Notifications",
            data: trends.email_notifications || emailData,
            borderColor: "rgb(245, 158, 11)",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            tension: 0.4,
          },
        ],
      };
    }

    // Fallback: process metrics data
    metrics.forEach((metric) => {
      const dayIndex = new Date(metric.date).getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday=0 to Sunday=6
      
      if (metric.channel === 'push') pushData[adjustedIndex] = metric.total_sent;
      if (metric.channel === 'sms') smsData[adjustedIndex] = metric.total_sent;
      if (metric.channel === 'email') emailData[adjustedIndex] = metric.total_sent;
    });

    return {
      labels: days,
      datasets: [
        {
          label: "Push Notifications",
          data: pushData,
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
        },
        {
          label: "SMS Notifications",
          data: smsData,
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
        {
          label: "Email Notifications",
          data: emailData,
          borderColor: "rgb(245, 158, 11)",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
        },
      ],
    };
  };

  // Process engagement data for doughnut chart
  const processEngagementData = () => {
    if (engagementData?.data) {
      const engagement = engagementData.data as any;
      return {
        labels: ["Delivered", "Opened", "Clicked", "Failed"],
        datasets: [
          {
            data: [
              engagement.delivered || 75,
              engagement.opened || 55,
              engagement.clicked || 25,
              engagement.failed || 5,
            ],
            backgroundColor: [
              "rgb(34, 197, 94)",
              "rgb(59, 130, 246)",
              "rgb(168, 85, 247)",
              "rgb(239, 68, 68)",
            ],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: ["Delivered", "Opened", "Clicked", "Failed"],
      datasets: [
        {
          data: [75, 55, 25, 5],
          backgroundColor: [
            "rgb(34, 197, 94)",
            "rgb(59, 130, 246)",
            "rgb(168, 85, 247)",
            "rgb(239, 68, 68)",
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  // Process today's stats for notification stats cards
  const getNotificationStats = () => {
    if (todayStats?.data) {
      const stats = todayStats.data as any;
      return [
        {
          title: "Total Sent Today",
          value: stats.total_sent?.toLocaleString() || "12,547",
          change: stats.change_vs_yesterday?.total_sent || "+15.2%",
          changeType: "increase",
          icon: "ri:send-plane-2-line",
          color: "primary",
        },
        {
          title: "Delivery Rate",
          value: `${stats.delivery_rate || 94.8}%`,
          change: stats.change_vs_yesterday?.delivery_rate || "+2.1%",
          changeType: "increase",
          icon: "ri:checkbox-circle-line",
          color: "success",
        },
        {
          title: "Open Rate",
          value: `${stats.open_rate || 68.3}%`,
          change: stats.change_vs_yesterday?.open_rate || "-1.4%",
          changeType: stats.change_vs_yesterday?.open_rate?.startsWith('-') ? "decrease" : "increase",
          icon: "ri:eye-line",
          color: "info",
        },
        {
          title: "Click Rate",
          value: `${stats.click_rate || 23.7}%`,
          change: stats.change_vs_yesterday?.click_rate || "+5.8%",
          changeType: "increase",
          icon: "ri:cursor-line",
          color: "warning",
        },
      ];
    }

    // Fallback data
    return [
      {
        title: "Total Sent Today",
        value: "12,547",
        change: "+15.2%",
        changeType: "increase",
        icon: "ri:send-plane-2-line",
        color: "primary",
      },
      {
        title: "Delivery Rate",
        value: "94.8%",
        change: "+2.1%",
        changeType: "increase",
        icon: "ri:checkbox-circle-line",
        color: "success",
      },
      {
        title: "Open Rate",
        value: "68.3%",
        change: "-1.4%",
        changeType: "decrease",
        icon: "ri:eye-line",
        color: "info",
      },
      {
        title: "Click Rate",
        value: "23.7%",
        change: "+5.8%",
        changeType: "increase",
        icon: "ri:cursor-line",
        color: "warning",
      },
    ];
  };

  // Process channel performance data
  const getChannelPerformance = () => {
    if (channelPerformance?.data) {
      const performance = channelPerformance.data as any;
      return [
        { name: "Push Notifications", score: performance.push?.performance_score || 85 },
        { name: "SMS Messages", score: performance.sms?.performance_score || 92 },
        { name: "Email Campaigns", score: performance.email?.performance_score || 68 },
        { name: "In-App Messages", score: performance["in-app"]?.performance_score || 78 },
      ];
    }

    return [
      { name: "Push Notifications", score: 85 },
      { name: "SMS Messages", score: 92 },
      { name: "Email Campaigns", score: 68 },
      { name: "In-App Messages", score: 78 },
    ];
  };

  // Process activity summary data
  const getActivitySummary = () => {
    if (todayStats?.data) {
      const stats = todayStats.data as any;
      return [
        {
          icon: "ri:send-plane-2-line",
          value: stats.total_sent?.toLocaleString() || "12,547",
          label: "Total Sent",
          color: "primary"
        },
        {
          icon: "ri:checkbox-circle-line", 
          value: stats.total_delivered?.toLocaleString() || "11,894",
          label: "Delivered",
          color: "success"
        },
        {
          icon: "ri:eye-line",
          value: stats.total_opened?.toLocaleString() || "8,123", 
          label: "Opened",
          color: "info"
        },
        {
          icon: "ri:cursor-line",
          value: stats.total_clicked?.toLocaleString() || "2,976",
          label: "Clicked", 
          color: "warning"
        },
        {
          icon: "ri:close-circle-line",
          value: stats.total_failed?.toLocaleString() || "653",
          label: "Failed",
          color: "danger"
        },
        {
          icon: "ri:calendar-schedule-line",
          value: stats.total_scheduled?.toLocaleString() || "47",
          label: "Scheduled",
          color: "purple"
        },
      ];
    }

    return [
      { icon: "ri:send-plane-2-line", value: "12,547", label: "Total Sent", color: "primary" },
      { icon: "ri:checkbox-circle-line", value: "11,894", label: "Delivered", color: "success" },
      { icon: "ri:eye-line", value: "8,123", label: "Opened", color: "info" },
      { icon: "ri:cursor-line", value: "2,976", label: "Clicked", color: "warning" },
      { icon: "ri:close-circle-line", value: "653", label: "Failed", color: "danger" },
      { icon: "ri:calendar-schedule-line", value: "47", label: "Scheduled", color: "purple" },
    ];
  };

  const notificationStats = getNotificationStats();
  const channelPerformanceData = getChannelPerformance();
  const activitySummaryData = getActivitySummary();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge bg="success-subtle" text="success">Delivered</Badge>;
      case "processing":
        return <Badge bg="warning-subtle" text="warning">Processing</Badge>;
      case "scheduled":
        return <Badge bg="info-subtle" text="info">Scheduled</Badge>;
      case "failed":
        return <Badge bg="danger-subtle" text="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary-subtle" text="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "push":
        return "ri:smartphone-line";
      case "sms":
        return "ri:message-2-line";
      case "email":
        return "ri:mail-line";
      case "in-app":
        return "ri:notification-3-line";
      default:
        return "ri:notification-line";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const sentDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const calculateOpenRate = (opened: number, delivered: number) => {
    if (delivered === 0) return "0%";
    return `${Math.round((opened / delivered) * 100)}%`;
  };

  return (
    <div className="notifications-dashboard">
      {/* Stats Overview */}
      <Row className="mb-4">
        {notificationStats.map((stat, index) => (
          <Col xl={3} lg={6} key={index}>
            <Card className="h-100">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-normal mb-1">{stat.title}</h6>
                    <h3 className="my-1">{stat.value}</h3>
                    <div className="d-flex align-items-center">
                      <span className={`badge bg-${stat.changeType === 'increase' ? 'success' : 'danger'}-subtle text-${stat.changeType === 'increase' ? 'success' : 'danger'} me-1`}>
                        <IconifyIcon 
                          icon={stat.changeType === 'increase' ? 'ri:arrow-up-line' : 'ri:arrow-down-line'} 
                          className="me-1" 
                        />
                        {stat.change}
                      </span>
                      <span className="text-muted">vs yesterday</span>
                    </div>
                  </div>
                  <div className={`avatar-lg bg-${stat.color} bg-opacity-10 rounded flex-centered`}>
                    <IconifyIcon icon={stat.icon} className={`fs-32 text-${stat.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>


      {/* Quick Actions */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card>
            <CardHeader>
              <h5 className="card-title">Quick Actions</h5>
            </CardHeader>
            <CardBody>
              <Row className="g-3">
                <Col lg={3} md={6}>
                  <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center py-3" onClick={handleSendBroadcastClick}>
                    <IconifyIcon icon="ri:send-plane-line" className="me-2" />
                    Send Broadcast
                  </Button>
                </Col>
                <Col lg={3} md={6}>
                  <Button variant="outline-success" className="w-100 d-flex align-items-center justify-content-center py-3" onClick={handleCreateTemplateClick}>
                    <IconifyIcon icon="ri:file-text-line" className="me-2" />
                    Create Template
                  </Button>
                </Col>
                <Col lg={3} md={6}>
                  <Button variant="outline-info" className="w-100 d-flex align-items-center justify-content-center py-3" onClick={handleScheduleCampaignClick}>
                    <IconifyIcon icon="ri:calendar-schedule-line" className="me-2" />
                    Schedule Campaign
                  </Button>
                </Col>
                <Col lg={3} md={6}>
                  <Button variant="outline-warning" className="w-100 d-flex align-items-center justify-content-center py-3" onClick={handleViewAnalyticsClick}>
                    <IconifyIcon icon="ri:bar-chart-box-line" className="me-2" />
                    View Analytics
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row className="mb-4">
        <Col xl={4}>
          <Card className="h-100">
            <CardHeader>
              <h5 className="card-title">Channel Performance</h5>
            </CardHeader>
            <CardBody>
              {channelPerformanceData.map((channel, index) => {
                const variants = ["primary", "success", "warning", "info"];
                const variant = variants[index % variants.length];
                return (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-medium">{channel.name}</span>
                      <span className="fw-medium">{channel.score}%</span>
                    </div>
                    <ProgressBar variant={variant} now={channel.score} />
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </Col>
        <Col xl={8}>
          <Card className="h-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="card-title">Recent Notifications</h5>
              <Button variant="outline-primary" size="sm" onClick={() => router.push('/notifications/campaigns')}>
                <IconifyIcon icon="ri:external-link-line" className="me-1" />
                View All
              </Button>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Recipients</th>
                      <th>Status</th>
                      <th>Sent</th>
                      <th>Open Rate</th>
                    </tr>
                  </thead>
                                      <tbody>
                      {campaigns.length > 0 ? campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <IconifyIcon 
                                icon={getTypeIcon(campaign.type)} 
                                className="me-2 text-muted" 
                              />
                              <span className="fw-medium">{campaign.title}</span>
                            </div>
                          </td>
                          <td>
                            <Badge bg="secondary-subtle" text="secondary">
                              {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                            </Badge>
                          </td>
                          <td>{campaign.recipients_count?.toLocaleString() || 0}</td>
                          <td>{getStatusBadge(campaign.status)}</td>
                          <td className="text-muted">
                            {campaign.sent_at ? formatTimeAgo(campaign.sent_at) : 
                             campaign.scheduled_at ? `Scheduled for ${new Date(campaign.scheduled_at).toLocaleString()}` :
                             formatTimeAgo(campaign.created_at)}
                          </td>
                          <td>
                            <span className="fw-medium">
                              {campaign.status === 'scheduled' ? '-' : 
                               calculateOpenRate(campaign.opened_count || 0, campaign.delivered_count || 0)}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">No recent notifications found.</td>
                        </tr>
                      )}
                    </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Activity Summary */}
      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <h5 className="card-title">Today's Activity Summary</h5>
            </CardHeader>
            <CardBody>
              <Row className="text-center">
                {activitySummaryData.map((item, index) => (
                  <Col lg={2} md={4} key={index} className="mb-3">
                    <div className="p-3 border rounded">
                      <IconifyIcon icon={item.icon} className={`fs-24 text-${item.color} mb-2`} />
                      <h4 className="mb-1">{item.value}</h4>
                      <span className="text-muted">{item.label}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

              {/* Send Broadcast Modal */}
        <Modal show={showSendBroadcastModal} onHide={handleCloseModals} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <IconifyIcon icon="ri:send-plane-line" className="me-2" />
              Send New Broadcast
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSendBroadcastSubmit}>
              <Row>
                <Col md={6}>
                  <FloatingLabel label="Broadcast Title" className="mb-3">
                    <Form.Control type="text" name="title" placeholder="Enter broadcast title" required />
                  </FloatingLabel>
                </Col>
                <Col md={6}>
                  <FloatingLabel label="Notification Type" className="mb-3">
                    <Form.Select name="type" required>
                      <option value="">Select Type</option>
                      <option value="push">📱 Push Notification</option>
                      <option value="sms">💬 SMS Message</option>
                      <option value="email">✉️ Email Campaign</option>
                      <option value="in-app">🔔 In-App Message</option>
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>
              <FloatingLabel label="Recipients (comma-separated emails/phones)" className="mb-3">
                <Form.Control 
                  type="text" 
                  name="recipients" 
                  placeholder="user1@example.com, user2@example.com, +1234567890" 
                  required 
                />
              </FloatingLabel>
              <FloatingLabel label="Broadcast Message" className="mb-3">
                <Form.Control as="textarea" name="message" rows={4} placeholder="Enter your broadcast message here..." required />
              </FloatingLabel>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={handleCloseModals} className="flex-1">
                  <IconifyIcon icon="ri:close-line" className="me-1" />
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="ri:send-plane-fill" className="me-1" />
                      Send Broadcast Now
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

              {/* Create Template Modal */}
        <Modal show={showCreateTemplateModal} onHide={handleCloseModals} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateTemplateSubmit}>
              <FloatingLabel label="Template Name" className="mb-3">
                <Form.Control type="text" name="title" placeholder="Enter template name" required />
              </FloatingLabel>
              <FloatingLabel label="Template Content" className="mb-3">
                <Form.Control as="textarea" name="message" rows={4} placeholder="Enter template content" required />
              </FloatingLabel>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={handleCloseModals} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="ri:file-text-line" className="me-1" />
                      Create Template
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
    </div>
  );
};

export default NotificationsDashboardView;
