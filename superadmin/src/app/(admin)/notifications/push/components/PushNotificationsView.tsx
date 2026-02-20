"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { 
  Badge, 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Col, 
  Form, 
  Modal, 
  Row, 
  Table, 
  Tabs, 
  Tab,
  ProgressBar,
  InputGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Alert
} from "react-bootstrap";
import { useState, useEffect } from "react";
import {
  useListPushNotifications,
  useListPushNotificationAudiences,
  useListPushNotificationTemplates,
  useGetPushNotificationTemplate,
  useCreatePushNotification,
  useUpdatePushNotification,
  useDeletePushNotification,
  usePushNotificationStats,
  usePushNotificationAnalytics,
  useSearchPushNotifications,
  useUpdateTemplateUsage
} from "@/hooks/usePushNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

const PushNotificationsView = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const queryClient = useQueryClient();
  
  // State hooks - always called
  const [showSendModal, setShowSendModal] = useState(false);
  const [activeTab, setActiveTab] = useState("send");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for send notification
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "medium",
    platform: "both",
    actionUrl: "",
    audience: "all",
    scheduleType: "now",
    deliveryTime: "",
  });

  // Data hooks - always called
  const { data: notifications = [], isLoading: notificationsLoading, error: notificationsError } = useListPushNotifications(
    statusFilter || undefined,
    priorityFilter || undefined,
    undefined,
    50
  );
  const { data: audiences = [], isLoading: audiencesLoading, error: audiencesError } = useListPushNotificationAudiences();
  const { data: templates = [], isLoading: templatesLoading, error: templatesError } = useListPushNotificationTemplates();
  const { data: stats, isLoading: statsLoading, error: statsError } = usePushNotificationStats();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = usePushNotificationAnalytics(30);
  const { data: searchResults = [] } = useSearchPushNotifications(searchTerm);

  // Mutation hooks - always called
  const createNotificationMutation = useCreatePushNotification();
  const updateNotificationMutation = useUpdatePushNotification();
  const deleteNotificationMutation = useDeletePushNotification();
  const updateTemplateUsageMutation = useUpdateTemplateUsage();

  // Real-time subscriptions - useEffect always called
  useEffect(() => {
    const channel = supabase
      .channel('push_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'push_notifications'
        },
        (payload) => {
          console.log('Push notification changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['push_notifications'] });
          queryClient.invalidateQueries({ queryKey: ['push_notification_stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ALL HOOKS ABOVE THIS LINE - CONDITIONAL LOGIC BELOW

  // Check loading and error states
  const isLoading = notificationsLoading || audiencesLoading || templatesLoading || statsLoading || analyticsLoading;
  const hasError = notificationsError || audiencesError || templatesError || statsError || analyticsError;

  // Handler functions
  const handleTemplateSelect = async (templateName: string) => {
    if (!templateName || templateName === "") {
      setFormData({
        title: "",
        message: "",
        priority: "medium",
        platform: "both",
        actionUrl: "",
        audience: "all",
        scheduleType: "now",
        deliveryTime: "",
      });
      return;
    }

    const template = templates.find(t => t.name === templateName);
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        message: template.message,
        priority: template.priority,
        platform: template.platform,
        actionUrl: template.action_url || "",
      }));
      
      // Update template usage count
      updateTemplateUsageMutation.mutate(templateName);
    }
  };

  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title || !formData.message || !formData.audience) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAudience = audiences.find(a => a.value === formData.audience);
      const audienceCount = selectedAudience?.recipient_count || 0;

      const notificationData = {
        title: formData.title,
        message: formData.message,
        audience: formData.audience,
        audience_count: audienceCount,
        status: formData.scheduleType === "now" ? "processing" : "scheduled",
        priority: formData.priority,
        platform: formData.platform,
        action_url: formData.actionUrl || null,
        scheduled_at: formData.scheduleType === "schedule" ? formData.deliveryTime : null,
        sent_at: formData.scheduleType === "now" ? new Date().toISOString() : null,
        template_used: selectedTemplate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await createNotificationMutation.mutateAsync(notificationData);
      
      toast.success(`Push notification ${formData.scheduleType === "now" ? "sent" : "scheduled"} successfully!`);
      
      // Reset form
      setFormData({
        title: "",
        message: "",
        priority: "medium",
        platform: "both",
        actionUrl: "",
        audience: "all",
        scheduleType: "now",
        deliveryTime: "",
      });
      setSelectedTemplate("");
      
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    // Similar logic to handleSubmitNotification but for quick send modal
    setShowSendModal(false);
    toast.success("Quick notification sent!");
  };

  const handleDeleteNotification = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotificationMutation.mutateAsync(id);
        toast.success("Notification deleted successfully!");
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Failed to delete notification.");
      }
    }
  };

  const handleDuplicateNotification = async (notification: any) => {
    try {
      const duplicateData = {
        title: `Copy of ${notification.title}`,
        message: notification.message,
        audience: notification.audience,
        audience_count: notification.audience_count,
        status: "draft",
        priority: notification.priority,
        platform: notification.platform,
        action_url: notification.action_url,
        template_used: notification.template_used,
      };

      await createNotificationMutation.mutateAsync(duplicateData);
      toast.success("Notification duplicated successfully!");
    } catch (error) {
      console.error("Error duplicating notification:", error);
      toast.error("Failed to duplicate notification.");
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge bg="success-subtle" text="success">Delivered</Badge>;
      case "scheduled":
        return <Badge bg="info-subtle" text="info">Scheduled</Badge>;
      case "draft":
        return <Badge bg="secondary-subtle" text="secondary">Draft</Badge>;
      case "failed":
        return <Badge bg="danger-subtle" text="danger">Failed</Badge>;
      case "processing":
        return <Badge bg="warning-subtle" text="warning">Processing</Badge>;
      default:
        return <Badge bg="primary-subtle" text="primary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge bg="danger-subtle" text="danger">High</Badge>;
      case "medium":
        return <Badge bg="warning-subtle" text="warning">Medium</Badge>;
      case "low":
        return <Badge bg="success-subtle" text="success">Low</Badge>;
      case "urgent":
        return <Badge bg="danger" text="white">Urgent</Badge>;
      default:
        return <Badge bg="secondary-subtle" text="secondary">{priority}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "mobile":
        return "ri:smartphone-line";
      case "web":
        return "ri:computer-line";
      case "both":
        return "ri:devices-line";
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

  // Calculate estimated reach based on selected audience
  const getEstimatedReach = () => {
    const selectedAudience = audiences.find(a => a.value === formData.audience);
    return selectedAudience?.recipient_count || 0;
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
        <h4 className="alert-heading">Error loading push notifications</h4>
        <p>Failed to load push notifications data. Please try again later.</p>
        <hr />
        <p className="mb-0">
          {notificationsError?.message || audiencesError?.message || templatesError?.message || 
           statsError?.message || analyticsError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="push-notifications">
      {/* Header Stats */}
      <Row className="mb-4">
        <Col xl={3} lg={6}>
          <Card className="bg-primary bg-opacity-10 border-primary border-opacity-25">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="fw-medium text-primary">Today's Sent</h5>
                  <h3 className="mb-0 text-primary">{stats?.todaySent?.toLocaleString() || 0}</h3>
                </div>
                <div className="avatar-sm bg-primary rounded flex-centered">
                  <IconifyIcon icon="ri:send-plane-2-line" className="text-white fs-18" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="bg-success bg-opacity-10 border-success border-opacity-25">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="fw-medium text-success">Delivery Rate</h5>
                  <h3 className="mb-0 text-success">{stats?.deliveryRate || 0}%</h3>
                </div>
                <div className="avatar-sm bg-success rounded flex-centered">
                  <IconifyIcon icon="ri:checkbox-circle-line" className="text-white fs-18" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="bg-info bg-opacity-10 border-info border-opacity-25">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="fw-medium text-info">Open Rate</h5>
                  <h3 className="mb-0 text-info">{stats?.openRate || 0}%</h3>
                </div>
                <div className="avatar-sm bg-info rounded flex-centered">
                  <IconifyIcon icon="ri:eye-line" className="text-white fs-18" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="bg-warning bg-opacity-10 border-warning border-opacity-25">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h5 className="fw-medium text-warning">Click Rate</h5>
                  <h3 className="mb-0 text-warning">{stats?.clickRate || 0}%</h3>
                </div>
                <div className="avatar-sm bg-warning rounded flex-centered">
                  <IconifyIcon icon="ri:cursor-line" className="text-white fs-18" />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => setActiveTab(key || "send")}
              className="nav-tabs-custom"
            >
              <Tab eventKey="send" title={
                <span>
                  <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                  Send Notification
                </span>
              } />
              <Tab eventKey="history" title={
                <span>
                  <IconifyIcon icon="ri:history-line" className="me-1" />
                  Notification History
                </span>
              } />
              <Tab eventKey="analytics" title={
                <span>
                  <IconifyIcon icon="ri:bar-chart-line" className="me-1" />
                  Analytics
                </span>
              } />
            </Tabs>
            <Button 
              variant="primary" 
              onClick={() => setShowSendModal(true)}
              className="d-flex align-items-center"
            >
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Quick Send
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Send Notification Tab */}
          {activeTab === "send" && (
            <div className="send-notification">
              <Row>
                <Col lg={8}>
                  <Card className="border">
                    <CardHeader>
                      <h5 className="card-title">Compose Push Notification</h5>
                    </CardHeader>
                    <CardBody>
                      <Form onSubmit={handleSubmitNotification}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Notification Title *</Form.Label>
                              <Form.Control 
                                type="text" 
                                placeholder="Enter notification title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                maxLength={50}
                                required
                              />
                              <Form.Text className="text-muted">{formData.title.length}/50 characters</Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Priority Level</Form.Label>
                              <Form.Select 
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                              >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">Urgent</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Message Content *</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={4}
                            placeholder="Enter your notification message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            maxLength={250}
                            required
                          />
                          <Form.Text className="text-muted">{formData.message.length}/250 characters</Form.Text>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Target Platform</Form.Label>
                              <Form.Select 
                                value={formData.platform}
                                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                              >
                                <option value="both">Mobile & Web</option>
                                <option value="mobile">Mobile Only</option>
                                <option value="web">Web Only</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Action URL (Optional)</Form.Label>
                              <Form.Control 
                                type="url" 
                                placeholder="https://example.com/action"
                                value={formData.actionUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Target Audience</Form.Label>
                          <Form.Select 
                            value={formData.audience}
                            onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                          >
                            {audiences.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} ({option.recipient_count.toLocaleString()} recipients)
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Schedule Delivery</Form.Label>
                              <Form.Select 
                                value={formData.scheduleType}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, scheduleType: e.target.value }));
                                }}
                              >
                                <option value="now">Send Immediately</option>
                                <option value="schedule">Schedule for Later</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Delivery Time</Form.Label>
                              <Form.Control 
                                type="datetime-local"
                                value={formData.deliveryTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                                disabled={formData.scheduleType === "now"}
                                min={new Date().toISOString().slice(0, 16)}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex gap-2">
                          <Button 
                            variant="primary" 
                            className="px-4" 
                            type="submit"
                            disabled={isSubmitting || !formData.title || !formData.message}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                {formData.scheduleType === "now" ? "Sending..." : "Scheduling..."}
                              </>
                            ) : (
                              <>
                                <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                                {formData.scheduleType === "now" ? "Send Notification" : "Schedule Notification"}
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            className="px-4"
                            type="button"
                            onClick={() => {
                              const draftData = {
                                ...formData,
                                status: "draft"
                              };
                              // Save as draft logic here
                              toast.success("Notification saved as draft!");
                            }}
                          >
                            <IconifyIcon icon="ri:save-line" className="me-1" />
                            Save as Draft
                          </Button>
                          <Button 
                            variant="outline-info" 
                            className="px-4"
                            type="button"
                            onClick={() => {
                              // Preview logic - could open a modal
                              toast("Preview functionality coming soon!");
                            }}
                          >
                            <IconifyIcon icon="ri:eye-line" className="me-1" />
                            Preview
                          </Button>
                        </div>
                      </Form>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card className="border">
                    <CardHeader>
                      <h5 className="card-title">Preview</h5>
                    </CardHeader>
                    <CardBody>
                      <div className="notification-preview border rounded p-3 mb-3">
                        <div className="d-flex align-items-start">
                          <div className="avatar-sm bg-primary rounded flex-centered me-2">
                            <IconifyIcon icon="ri:home-line" className="text-white fs-16" />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">Casa Nirvana</h6>
                            <p className="mb-1 fw-medium">
                              {formData.title || "Sample Notification Title"}
                            </p>
                            <p className="text-muted mb-0 small">
                              {formData.message || "Your notification message will appear here..."}
                            </p>
                            <small className="text-muted">
                              {formData.scheduleType === "now" ? "Now" : 
                               formData.deliveryTime ? new Date(formData.deliveryTime).toLocaleString() : "2 min ago"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <Alert variant="info" className="mb-3">
                        <IconifyIcon icon="ri:information-line" className="me-1" />
                        <strong>Estimated Reach:</strong> {getEstimatedReach().toLocaleString()} devices
                      </Alert>

                      <div className="notification-tips">
                        <h6 className="fw-medium mb-2">💡 Best Practices</h6>
                        <ul className="small text-muted mb-0">
                          <li>Keep titles under 50 characters</li>
                          <li>Messages should be clear and actionable</li>
                          <li>Test with different devices</li>
                          <li>Avoid sending during night hours</li>
                          <li>Use urgent priority sparingly</li>
                        </ul>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="notification-history">
              <Row className="mb-3">
                <Col lg={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <IconifyIcon icon="ri:search-line" />
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col lg={3}>
                  <Form.Select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="delivered">Delivered</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                    <option value="failed">Failed</option>
                    <option value="processing">Processing</option>
                  </Form.Select>
                </Col>
                <Col lg={3}>
                  <Form.Select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="">All Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Notification Details</th>
                      <th>Audience</th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Performance</th>
                      <th>Sent Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchTerm ? searchResults : notifications).map((notification) => (
                      <tr key={notification.id}>
                        <td>
                          <div>
                            <h6 className="mb-1">{notification.title}</h6>
                            <p className="text-muted mb-0 small">
                              {notification.message.length > 60 
                                ? `${notification.message.substring(0, 60)}...` 
                                : notification.message
                              }
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">{notification.audience}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <IconifyIcon 
                              icon={getPlatformIcon(notification.platform)} 
                              className="me-1" 
                            />
                            {notification.platform}
                          </div>
                        </td>
                        <td>{getStatusBadge(notification.status)}</td>
                        <td>{getPriorityBadge(notification.priority)}</td>
                                                 <td>
                           {notification.status === "delivered" ? (
                             <div>
                               <small className="text-muted d-block">
                                 Delivered: {notification.delivered_count}
                               </small>
                               <small className="text-muted d-block">
                                 Opened: {notification.opened_count} ({notification.delivered_count > 0 ? Math.round((notification.opened_count / notification.delivered_count) * 100) : 0}%)
                               </small>
                               <small className="text-muted d-block">
                                 Clicked: {notification.clicked_count} ({notification.delivered_count > 0 ? Math.round((notification.clicked_count / notification.delivered_count) * 100) : 0}%)
                               </small>
                             </div>
                           ) : (
                             <span className="text-muted">-</span>
                           )}
                         </td>
                        <td>
                          <span className="text-muted">{notification.sent_at ? formatTimeAgo(notification.sent_at) : "-"}</span>
                        </td>
                        <td>
                          <Dropdown>
                            <DropdownToggle variant="light" size="sm" className="no-arrow">
                              <IconifyIcon icon="ri:more-2-line" />
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem 
                                onClick={() => {
                                  // View details logic - could open a modal with full notification details
                                  toast("View details functionality coming soon!");
                                }}
                              >
                                <IconifyIcon icon="ri:eye-line" className="me-1" />
                                View Details
                              </DropdownItem>
                              <DropdownItem 
                                onClick={() => handleDuplicateNotification(notification)}
                              >
                                <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                                Duplicate
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => {
                                  // Analytics logic - could navigate to analytics page
                                  toast("Analytics view coming soon!");
                                }}
                              >
                                <IconifyIcon icon="ri:bar-chart-line" className="me-1" />
                                Analytics
                              </DropdownItem>
                              <DropdownItem 
                                className="text-danger"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <IconifyIcon icon="ri:delete-bin-line" className="me-1" />
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                
                {/* Show message when no results found */}
                {(searchTerm ? searchResults : notifications).length === 0 && (
                  <div className="text-center py-5">
                    <IconifyIcon icon="ri:search-line" className="fs-48 text-muted mb-3" />
                    <h5 className="text-muted">
                      {searchTerm ? "No notifications found" : "No notifications yet"}
                    </h5>
                    <p className="text-muted">
                      {searchTerm 
                        ? "Try adjusting your search criteria" 
                        : "Create your first push notification to get started"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="notification-analytics">
              <Row className="mb-4">
                <Col lg={3} md={6}>
                  <Card className="text-center">
                    <CardBody>
                      <IconifyIcon icon="ri:send-plane-2-line" className="fs-32 text-primary mb-2" />
                      <h4 className="mb-1">45,678</h4>
                      <span className="text-muted">Total Sent (30 days)</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={3} md={6}>
                  <Card className="text-center">
                    <CardBody>
                      <IconifyIcon icon="ri:checkbox-circle-line" className="fs-32 text-success mb-2" />
                      <h4 className="mb-1">43,256</h4>
                      <span className="text-muted">Successfully Delivered</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={3} md={6}>
                  <Card className="text-center">
                    <CardBody>
                      <IconifyIcon icon="ri:eye-line" className="fs-32 text-info mb-2" />
                      <h4 className="mb-1">31,892</h4>
                      <span className="text-muted">Opened</span>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={3} md={6}>
                  <Card className="text-center">
                    <CardBody>
                      <IconifyIcon icon="ri:cursor-line" className="fs-32 text-warning mb-2" />
                      <h4 className="mb-1">9,567</h4>
                      <span className="text-muted">Clicked</span>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col lg={6}>
                  <Card>
                    <CardHeader>
                      <h5 className="card-title">Performance by Platform</h5>
                    </CardHeader>
                    <CardBody>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">
                            <IconifyIcon icon="ri:smartphone-line" className="me-1" />
                            Mobile Apps
                          </span>
                          <span className="fw-medium">89.2%</span>
                        </div>
                        <ProgressBar variant="primary" now={89.2} />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">
                            <IconifyIcon icon="ri:computer-line" className="me-1" />
                            Web Browsers
                          </span>
                          <span className="fw-medium">76.8%</span>
                        </div>
                        <ProgressBar variant="success" now={76.8} />
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={6}>
                  <Card>
                    <CardHeader>
                      <h5 className="card-title">Best Performing Hours</h5>
                    </CardHeader>
                    <CardBody>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">9:00 AM - 11:00 AM</span>
                          <span className="fw-medium">92.4%</span>
                        </div>
                        <ProgressBar variant="success" now={92.4} />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">6:00 PM - 8:00 PM</span>
                          <span className="fw-medium">87.6%</span>
                        </div>
                        <ProgressBar variant="info" now={87.6} />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">2:00 PM - 4:00 PM</span>
                          <span className="fw-medium">78.3%</span>
                        </div>
                        <ProgressBar variant="warning" now={78.3} />
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Send Modal */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Quick Send Push Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Quick Template</Form.Label>
              <Form.Select>
                <option value="">Select a template...</option>
                <option value="maintenance">Maintenance Alert</option>
                <option value="payment">Payment Reminder</option>
                <option value="event">Event Announcement</option>
                <option value="security">Security Alert</option>
                <option value="custom">Custom Message</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control type="text" placeholder="Enter notification title" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter your message" />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Audience</Form.Label>
                  <Form.Select>
                    <option value="all">All Community Members (2,847)</option>
                    <option value="building-a">Block A (345)</option>
                    <option value="building-b">Block B (423)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="low">Low Priority</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSendModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            <IconifyIcon icon="ri:send-plane-line" className="me-1" />
            Send Now
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PushNotificationsView;
