"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Badge, Button, Card, CardBody, CardHeader, Col, ProgressBar, Row, Table } from "react-bootstrap";
import { 
  useListNotificationCampaigns, 
  useTodayActivitySummary,
  useChannelPerformance,
  useCreateNotificationCampaign,
} from "@/hooks/useNotificationsDashboard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Form, FloatingLabel, Alert } from "react-bootstrap";
import { toast } from "react-hot-toast";
import {
  useCreateNotificationTemplate,
} from "@/hooks/useNotificationTemplates";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";

const formatSignedPercent = (value: unknown) => {
  const numericValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? "0").replace("%", ""));

  if (!Number.isFinite(numericValue)) {
    return "0%";
  }

  const prefix = numericValue > 0 ? "+" : numericValue < 0 ? "-" : "";
  return `${prefix}${Math.abs(numericValue).toFixed(1).replace(/\.0$/, "")}%`;
};

const formatPercent = (value: unknown) => {
  const numericValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? "0").replace("%", ""));

  if (!Number.isFinite(numericValue)) {
    return "0%";
  }

  return `${numericValue.toFixed(1).replace(/\.0$/, "")}%`;
};

const NotificationsDashboardView = () => {
  const router = useRouter();

  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useListNotificationCampaigns(undefined, 5);
  const { data: todayStats, isLoading: statsLoading, error: statsError } = useTodayActivitySummary();
  const { data: channelPerformance, isLoading: channelLoading, error: channelError } = useChannelPerformance();
  const createCampaignMutation = useCreateNotificationCampaign();
  const createTemplateMutation = useCreateNotificationTemplate();

  const [showSendBroadcastModal, setShowSendBroadcastModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useNotificationRealtime({
    channelName: "superadmin-notifications-dashboard",
    tables: ["notification_campaigns", "notification_analytics", "notification_templates"],
    queryKeys: [
      ["notification_campaigns"],
      ["notification_analytics"],
      ["notification_dashboard_stats"],
      ["notification-templates"],
    ],
  });

  const isLoading = campaignsLoading || statsLoading || channelLoading;
  const hasError = campaignsError || statsError || channelError;

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

    try {
      setIsSubmitting(true);
      const recipientCount = recipients
        .split(",")
        .map((recipientValue) => recipientValue.trim())
        .filter(Boolean).length;

      await createCampaignMutation.mutateAsync({
        title,
        type,
        recipients_count: recipientCount,
        audience: recipients,
        message,
        sent_at: new Date().toISOString(),
      });

      toast.success(`Broadcast "${title}" sent to ${recipientCount} recipients!`);
      setShowSendBroadcastModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send broadcast. Please try again.");
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

    try {
      setIsSubmitting(true);
      await createTemplateMutation.mutateAsync({
        name: templateName,
        template_name: templateName,
        content: templateContent,
        template_content: templateContent,
        type: "in-app",
        category: "general",
        status: "draft",
        usage_count: 0,
        variables: [],
      });
      
      toast.success("Template created successfully!");
      setShowCreateTemplateModal(false);
      router.push('/notifications/templates');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create template. Please try again.");
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
          {campaignsError?.message || statsError?.message || channelError?.message}
        </p>
      </div>
    );
  }

  const todaySummary = (todayStats?.data ?? {}) as Record<string, any>;
  const todayChanges = (todaySummary.change_vs_yesterday ?? {}) as Record<string, unknown>;

  const getNotificationStats = () => {
    return [
      {
        title: "Total Sent Today",
        value: Number(todaySummary.total_sent ?? 0).toLocaleString(),
        change: formatSignedPercent(todayChanges.total_sent),
        changeType: Number.parseFloat(String(todayChanges.total_sent ?? 0)) < 0 ? "decrease" : "increase",
        icon: "ri:send-plane-2-line",
        color: "primary",
      },
      {
        title: "Delivery Rate",
        value: formatPercent(todaySummary.delivery_rate),
        change: formatSignedPercent(todayChanges.delivery_rate),
        changeType: Number.parseFloat(String(todayChanges.delivery_rate ?? 0)) < 0 ? "decrease" : "increase",
        icon: "ri:checkbox-circle-line",
        color: "success",
      },
      {
        title: "Open Rate",
        value: formatPercent(todaySummary.open_rate),
        change: formatSignedPercent(todayChanges.open_rate),
        changeType: Number.parseFloat(String(todayChanges.open_rate ?? 0)) < 0 ? "decrease" : "increase",
        icon: "ri:eye-line",
        color: "info",
      },
      {
        title: "Click Rate",
        value: formatPercent(todaySummary.click_rate),
        change: formatSignedPercent(todayChanges.click_rate),
        changeType: Number.parseFloat(String(todayChanges.click_rate ?? 0)) < 0 ? "decrease" : "increase",
        icon: "ri:cursor-line",
        color: "warning",
      },
    ];
  };

  const getChannelPerformance = () => {
    const performance = (channelPerformance?.data ?? {}) as Record<string, { performance_score?: number } | undefined>;
    return [
      { name: "Push Notifications", score: Number(performance.push?.performance_score ?? 0) },
      { name: "SMS Messages", score: Number(performance.sms?.performance_score ?? 0) },
      { name: "Email Campaigns", score: Number(performance.email?.performance_score ?? 0) },
      { name: "In-App Messages", score: Number(performance["in-app"]?.performance_score ?? 0) },
    ];
  };

  const getActivitySummary = () => {
    return [
      { icon: "ri:send-plane-2-line", value: Number(todaySummary.total_sent ?? 0).toLocaleString(), label: "Total Sent", color: "primary" },
      { icon: "ri:checkbox-circle-line", value: Number(todaySummary.total_delivered ?? 0).toLocaleString(), label: "Delivered", color: "success" },
      { icon: "ri:eye-line", value: Number(todaySummary.total_opened ?? 0).toLocaleString(), label: "Opened", color: "info" },
      { icon: "ri:cursor-line", value: Number(todaySummary.total_clicked ?? 0).toLocaleString(), label: "Clicked", color: "warning" },
      { icon: "ri:close-circle-line", value: Number(todaySummary.total_failed ?? 0).toLocaleString(), label: "Failed", color: "danger" },
      { icon: "ri:calendar-schedule-line", value: Number(todaySummary.total_scheduled ?? 0).toLocaleString(), label: "Scheduled", color: "purple" },
    ];
  };

  const notificationStats = getNotificationStats();
  const channelPerformanceData = getChannelPerformance();
  const activitySummaryData = getActivitySummary();

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
              {channelPerformanceData.every((channel) => channel.score === 0) && (
                <Alert variant="light" className="border mb-3">
                  No channel performance data has been recorded yet.
                </Alert>
              )}
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
                              <span className="fw-medium">{campaign.title || campaign.name}</span>
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
