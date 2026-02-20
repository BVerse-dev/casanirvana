"use client";
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Button,
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  FormSelect,
  Alert,
  Badge,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  ProgressBar,
  ListGroup,
  Toast,
  ToastContainer,
  Spinner,
  Pagination,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Line, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  useListInAppCampaigns,
  useInAppStats,
  useInAppAnalytics,
  useCreateInAppCampaign,
  useListNotifications,
} from "@/hooks/useInAppNotifications";
import { supabase } from "@/lib/supabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InAppNotificationsView = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [showPreview, setShowPreview] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [notificationType, setNotificationType] = useState("info");
  const [actionRequired, setActionRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state for history tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // default 10 per page

  // Real Supabase hooks
  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = useListInAppCampaigns();
  const { data: stats, isLoading: statsLoading, error: statsError } = useInAppStats();
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useInAppAnalytics();
  const createCampaignMutation = useCreateInAppCampaign();

  // Real-time subscription for in-app notifications
  useEffect(() => {
    const channel = supabase
      .channel('public:in_app_notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'in_app_notifications' 
      }, () => {
        // This will trigger a refetch of all queries
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Default stats if loading
  const inAppStats = stats || {
    totalSent: 0,
    delivered: 0,
    opened: 0,
    actionTaken: 0,
  };

  // Convert campaigns data for display (fallback to empty array)
  const inAppNotifications = campaigns || [];

  // Pagination calculations
  const totalItems = inAppNotifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = inAppNotifications.slice(startIndex, endIndex);

  // Loading states
  const isLoading = campaignsLoading || statsLoading || analyticsLoading;
  
  // Error states
  const hasError = campaignsError || statsError || analyticsError;

  if (hasError) {
    return (
      <Alert variant="danger">
        <h5>Error Loading Data</h5>
        <p>There was an error loading the notifications data. Please try refreshing the page.</p>
        <small>
          {campaignsError?.message || statsError?.message || analyticsError?.message}
        </small>
      </Alert>
    );
  }

  // Chart data for in-app analytics (using real data or fallback)
  const engagementData = analytics?.engagementData || {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Notifications Sent",
        data: [850, 1200, 980, 1450, 1180, 1680],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "Opened",
        data: [680, 960, 784, 1160, 944, 1344],
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
      {
        label: "Actions Taken",
        data: [204, 288, 235, 348, 283, 403],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const typeDistributionData = analytics?.typeDistributionData || {
    labels: ["Info", "Warning", "Success", "Error"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 99, 132, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaignMutation.mutateAsync({
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        recipients_count: recipient === 'all' ? 500 : 50, // Default recipient counts
        action_required: actionRequired,
      });
      
      // Reset form
      setNotificationTitle("");
      setNotificationMessage("");
      setRecipient("all");
      setNotificationType("info");
      setActionRequired(false);
      setShowPreview(false);
      
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "danger";
      default: return "primary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return "ri:check-circle-line";
      case "warning": return "ri:error-warning-line";
      case "error": return "ri:close-circle-line";
      default: return "ri:information-line";
    }
  };

  const renderStatsCards = () => (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm">
                  <span className="avatar-title bg-primary rounded-circle">
                    <IconifyIcon icon="ri:notification-4-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Total Sent</h6>
                <h4 className="mb-0">
                  {statsLoading ? <Spinner size="sm" /> : inAppStats.totalSent.toLocaleString()}
                </h4>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm">
                  <span className="avatar-title bg-success rounded-circle">
                    <IconifyIcon icon="ri:check-double-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Delivered</h6>
                <h4 className="mb-0">
                  {statsLoading ? <Spinner size="sm" /> : inAppStats.delivered.toLocaleString()}
                </h4>
                <small className="text-success">
                  {statsLoading ? '...' : `${((inAppStats.delivered / inAppStats.totalSent) * 100).toFixed(1)}%`}
                </small>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm">
                  <span className="avatar-title bg-info rounded-circle">
                    <IconifyIcon icon="ri:eye-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Opened</h6>
                <h4 className="mb-0">
                  {statsLoading ? <Spinner size="sm" /> : inAppStats.opened.toLocaleString()}
                </h4>
                <small className="text-info">
                  {statsLoading ? '...' : `${((inAppStats.opened / inAppStats.delivered) * 100).toFixed(1)}%`}
                </small>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm">
                  <span className="avatar-title bg-warning rounded-circle">
                    <IconifyIcon icon="ri:cursor-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Actions Taken</h6>
                <h4 className="mb-0">
                  {statsLoading ? <Spinner size="sm" /> : inAppStats.actionTaken.toLocaleString()}
                </h4>
                <small className="text-warning">
                  {statsLoading ? '...' : `${((inAppStats.actionTaken / inAppStats.opened) * 100).toFixed(1)}%`}
                </small>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );

  const renderSendTab = () => (
    <Row>
      <Col lg={8}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Create In-App Notification</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Recipient Group</FormLabel>
                    <FormSelect
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    >
                      <option value="all">All Community Members</option>
                      <option value="residents">All Community Members</option>
                      <option value="building-a">Block A Members</option>
                      <option value="building-b">Block B Members</option>
                      <option value="new-residents">New Community Members</option>
                      <option value="security">Security Guards</option>
                      <option value="maintenance">Maintenance Staff</option>
                      <option value="management">Management Team</option>
                      <option value="online">Currently Online Members</option>
                      <option value="custom">Custom Group</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Notification Type</FormLabel>
                    <FormSelect
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value)}
                    >
                      <option value="info">Information</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error/Alert</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
              </Row>
              
              <FormGroup className="mb-3">
                <FormLabel>Notification Title</FormLabel>
                <FormControl
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                  maxLength={50}
                />
                <small className="text-muted">{notificationTitle.length}/50 characters</small>
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Message</FormLabel>
                <FormControl
                  as="textarea"
                  rows={4}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Type your notification message here..."
                  maxLength={200}
                />
                <small className="text-muted">{notificationMessage.length}/200 characters</small>
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Priority Level</FormLabel>
                    <FormSelect>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Auto Dismiss After</FormLabel>
                    <FormSelect>
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="0">Manual dismiss only</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="action-required"
                  label="Require user action (confirmation/acknowledgment)"
                  checked={actionRequired}
                  onChange={(e) => setActionRequired(e.target.checked)}
                />
              </div>

              {actionRequired && (
                <Row className="mb-3">
                  <Col md={6}>
                    <FormGroup>
                      <FormLabel>Primary Action Button</FormLabel>
                      <FormControl
                        type="text"
                        placeholder="e.g., Acknowledge, Pay Now, View Details"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <FormLabel>Secondary Action Button (Optional)</FormLabel>
                      <FormControl
                        type="text"
                        placeholder="e.g., Dismiss, Later, Cancel"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}

              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleSendNotification}
                  disabled={isSubmitting || !notificationTitle.trim() || !notificationMessage.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                      Send Notification
                    </>
                  )}
                </Button>
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Save as Draft
                </Button>
                <Button 
                  variant="outline-info"
                  onClick={() => setShowPreview(true)}
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
        <Card>
          <CardBody>
            <h5 className="mb-3">Live Preview</h5>
            <div className="p-3 bg-light rounded position-relative">
              <div className="d-flex align-items-start">
                <div className="flex-shrink-0 me-2">
                  <IconifyIcon 
                    icon={getTypeIcon(notificationType)} 
                    className={`font-18 text-${getTypeVariant(notificationType)}`}
                  />
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    {notificationTitle || "Notification Title"}
                  </h6>
                  <p className="mb-0 text-muted small">
                    {notificationMessage || "Your notification message will appear here..."}
                  </p>
                  {actionRequired && (
                    <div className="mt-2">
                      <Button variant="primary" size="sm" className="me-1">
                        Action
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
                <Button variant="link" size="sm" className="p-0 text-muted">
                  <IconifyIcon icon="ri:close-line" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3">
              <h6>Estimated Reach</h6>
              <p className="text-success mb-1">
                <strong>487 users</strong> will receive this notification
              </p>
              <small className="text-muted">
                Based on selected recipient group and current online status
              </small>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => {
                  setNotificationTitle("Maintenance Alert");
                  setNotificationMessage("Scheduled maintenance in your building. Check app for details.");
                  setNotificationType("warning");
                }}
              >
                Maintenance Alert Template
              </Button>
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={() => {
                  setNotificationTitle("Payment Confirmation");
                  setNotificationMessage("Your payment has been received successfully.");
                  setNotificationType("success");
                }}
              >
                Payment Success Template
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => {
                  setNotificationTitle("Security Alert");
                  setNotificationMessage("Important security update. Please review immediately.");
                  setNotificationType("error");
                  setActionRequired(true);
                }}
              >
                Security Alert Template
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );

  const renderHistoryTab = () => (
    <Row>
      <Col xs={12}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Notification History</h5>
              <div className="d-flex gap-2">
                <FormControl
                  type="search"
                  placeholder="Search notifications..."
                  style={{ width: "200px" }}
                />
                <FormSelect style={{ width: "150px" }}>
                  <option>All Types</option>
                  <option>Info</option>
                  <option>Success</option>
                  <option>Warning</option>
                  <option>Error</option>
                </FormSelect>
              </div>
            </div>

            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Recipients</th>
                    <th>Delivered</th>
                    <th>Opened</th>
                    <th>Actions</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignsLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <Spinner className="me-2" />
                        Loading notifications...
                      </td>
                    </tr>
                  ) : inAppNotifications.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">
                        No notifications found
                      </td>
                    </tr>
                  ) : (
                    paginatedNotifications.map((notification: any) => (
                      <tr key={notification.id}>
                        <td>
                          <div>
                            <strong>{notification.title}</strong>
                            <div className="text-muted small">
                              {notification.message.length > 40 
                                ? `${notification.message.substring(0, 40)}...` 
                                : notification.message}
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getTypeVariant(notification.type)}>
                            {notification.type}
                          </Badge>
                        </td>
                        <td>{notification.recipients_count}</td>
                        <td>
                          <span className="text-success">{notification.delivered_count}</span>
                          <small className="text-muted d-block">
                            {((notification.delivered_count / notification.recipients_count) * 100).toFixed(1)}%
                          </small>
                        </td>
                        <td>
                          <span className="text-info">{notification.opened_count}</span>
                          <small className="text-muted d-block">
                            {((notification.opened_count / notification.delivered_count) * 100).toFixed(1)}%
                          </small>
                        </td>
                        <td>
                          <span className="text-warning">{notification.action_taken_count}</span>
                          <small className="text-muted d-block">
                            {((notification.action_taken_count / notification.opened_count) * 100).toFixed(1)}%
                          </small>
                        </td>
                        <td>{new Date(notification.created_at).toLocaleString()}</td>
                        <td>
                          <Badge bg="success">{notification.status}</Badge>
                        </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm">
                            <IconifyIcon icon="ri:eye-line" />
                          </Button>
                          <Button variant="outline-success" size="sm">
                            <IconifyIcon icon="ri:file-copy-line" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            {totalPages > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                <div className="d-flex align-items-center gap-3 mb-2 mb-md-0">
                  <span className="text-muted">
                    Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalItems)} of {totalItems} messages
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Show:</span>
                    <Form.Select 
                      size="sm" 
                      style={{ width: 'auto' }}
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </Form.Select>
                    <span className="text-muted">entries</span>
                  </div>
                </div>
                {totalPages > 1 && (
                  <Pagination className="mb-0">
                    <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                      if (pageNum <= totalPages) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}
                    <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
                  </Pagination>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );

  const renderAnalyticsTab = () => (
    <Row>
      <Col lg={8}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Engagement Trends</h5>
            {analyticsLoading ? (
              <div className="text-center py-5">
                <Spinner className="me-2" />
                Loading chart data...
              </div>
            ) : (
              <Line data={engagementData} options={chartOptions} />
            )}
          </CardBody>
        </Card>
      </Col>
      <Col lg={4}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Notification Types</h5>
            {analyticsLoading ? (
              <div className="text-center py-5">
                <Spinner className="me-2" />
                Loading chart data...
              </div>
            ) : (
              <Pie data={typeDistributionData} />
            )}
          </CardBody>
        </Card>
        
        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3">Performance Metrics</h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Delivery Rate</span>
                <span>95.5%</span>
              </div>
              <ProgressBar now={95.5} variant="success" />
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Open Rate</span>
                <span>75.1%</span>
              </div>
              <ProgressBar now={75.1} variant="primary" />
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Action Rate</span>
                <span>31.8%</span>
              </div>
              <ProgressBar now={31.8} variant="info" />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      {renderStatsCards()}

      <Card>
        <CardBody>
          <Nav variant="tabs" className="mb-3">
            <NavItem>
              <NavLink
                active={activeTab === "send"}
                onClick={() => setActiveTab("send")}
                style={{ cursor: "pointer" }}
              >
                <IconifyIcon icon="ri:notification-4-line" className="me-1" />
                Send Notification
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                style={{ cursor: "pointer" }}
              >
                <IconifyIcon icon="ri:history-line" className="me-1" />
                History
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
                style={{ cursor: "pointer" }}
              >
                <IconifyIcon icon="ri:bar-chart-2-line" className="me-1" />
                Analytics
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent>
            <TabPane active={activeTab === "send"}>
              {renderSendTab()}
            </TabPane>
            <TabPane active={activeTab === "history"}>
              {renderHistoryTab()}
            </TabPane>
            <TabPane active={activeTab === "analytics"}>
              {renderAnalyticsTab()}
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)}>
        <ModalHeader closeButton>
          <h5>Notification Preview</h5>
        </ModalHeader>
        <ModalBody>
          <div className="p-4 bg-light rounded">
            <div className="d-flex align-items-start">
              <div className="flex-shrink-0 me-3">
                <div className={`avatar-sm bg-${getTypeVariant(notificationType)} rounded-circle d-flex align-items-center justify-content-center`}>
                  <IconifyIcon 
                    icon={getTypeIcon(notificationType)} 
                    className="text-white font-18"
                  />
                </div>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1">
                  {notificationTitle || "Notification Title"}
                </h6>
                <p className="mb-0 text-muted">
                  {notificationMessage || "Your notification message will appear here..."}
                </p>
                {actionRequired && (
                  <div className="mt-3">
                    <Button variant="primary" size="sm" className="me-2">
                      Primary Action
                    </Button>
                    <Button variant="outline-secondary" size="sm">
                      Secondary Action
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <small className="text-muted">
              This is how the notification will appear in the mobile and web apps.
            </small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSendNotification}>
            Send Notification
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default InAppNotificationsView;
