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
  Pagination,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Line, Doughnut } from "react-chartjs-2";
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
  useListSmsNotifications,
  useListSmsRecipientGroups,
  useListSmsTemplates,
  useGetSmsTemplate,
  useCreateSmsNotification,
  useUpdateSmsNotification,
  useDeleteSmsNotification,
  useSmsStats,
  useSmsAnalytics,
  useSmsCredits,
  useSearchSmsNotifications,
  useResendSmsNotification,
  useUpdateSmsTemplateUsage
} from "@/hooks/useSmsNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

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

const SmsNotificationsView = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const queryClient = useQueryClient();

  // State hooks - always called
  const [activeTab, setActiveTab] = useState("send");
  const [showQuickSendModal, setShowQuickSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for scheduling
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Data hooks - always called
  const { data: smsNotifications = [], isLoading: notificationsLoading, error: notificationsError } = useListSmsNotifications(undefined, undefined, 10000);
  const { data: recipientGroups = [], isLoading: groupsLoading, error: groupsError } = useListSmsRecipientGroups();
  const { data: smsTemplates = [], isLoading: templatesLoading, error: templatesError } = useListSmsTemplates();
  const { data: stats, isLoading: statsLoading, error: statsError } = useSmsStats();
  const { data: credits, isLoading: creditsLoading, error: creditsError } = useSmsCredits();
  const { data: searchResults = [] } = useSearchSmsNotifications(searchTerm);
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useSmsAnalytics(smsNotifications);

  // Mutation hooks - always called
  const createSmsMutation = useCreateSmsNotification();
  const updateSmsMutation = useUpdateSmsNotification();
  const deleteSmsMutation = useDeleteSmsNotification();
  const resendSmsMutation = useResendSmsNotification();
  const updateTemplateUsageMutation = useUpdateSmsTemplateUsage();

  // Pagination state for history tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // default 10 per page
  const totalItems = smsNotifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = smsNotifications.slice(startIndex, endIndex);

  // Real-time subscriptions - useEffect always called
  useEffect(() => {
    const channel = supabase
      .channel('sms_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sms_notifications'
        },
        (payload) => {
          console.log('SMS notification changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['sms_notifications'] });
          queryClient.invalidateQueries({ queryKey: ['sms_stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ALL HOOKS ABOVE THIS LINE - CONDITIONAL LOGIC BELOW

  // Check loading and error states
  const isLoading = notificationsLoading || groupsLoading || templatesLoading || statsLoading || creditsLoading;
  const hasError = notificationsError || groupsError || templatesError || statsError || creditsError;

  // Handler functions
  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setMessage("");
      setSelectedTemplate("");
      return;
    }

    const template = smsTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.message);
      setSelectedTemplate(templateId);
      
      // Update template usage count
      updateTemplateUsageMutation.mutate(templateId);
    }
  };

  const handleSendSms = async () => {
    if (isSubmitting) return;

    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    if (!recipient) {
      toast.error("Please select a recipient group.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedGroup = recipientGroups.find(g => g.group_key === recipient);
      const recipientCount = selectedGroup?.phone_count || 0;
      const costPerSms = 0.05;
      const totalCost = recipientCount * costPerSms;

      const scheduledAt = scheduleDate && scheduleTime 
        ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        : null;

      const smsData = {
        message: message.trim(),
        recipient_group: recipient,
        recipient_count: recipientCount,
        status: scheduledAt ? "scheduled" : "sending",
        cost_per_sms: costPerSms,
        total_cost: totalCost,
        credits_used: recipientCount,
        scheduled_at: scheduledAt,
        sent_at: scheduledAt ? null : new Date().toISOString(),
        template_used: selectedTemplate ? smsTemplates.find(t => t.id === selectedTemplate)?.name : null,
        template_id: selectedTemplate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await createSmsMutation.mutateAsync(smsData);
      
      toast.success(`SMS ${scheduledAt ? "scheduled" : "sent"} successfully!`);
      
      // Reset form
      setMessage("");
      setRecipient("all");
      setSelectedTemplate("");
      setScheduleDate("");
      setScheduleTime("");
      setShowQuickSendModal(false);
      
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendSms = async (sms: any) => {
    try {
      await resendSmsMutation.mutateAsync(sms);
      toast.success("SMS resent successfully!");
    } catch (error) {
      console.error("Error resending SMS:", error);
      toast.error("Failed to resend SMS.");
    }
  };

  const handleDeleteSms = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this SMS notification?")) {
      try {
        await deleteSmsMutation.mutateAsync(id);
        toast.success("SMS notification deleted successfully!");
      } catch (error) {
        console.error("Error deleting SMS:", error);
        toast.error("Failed to delete SMS notification.");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedCost = () => {
    const selectedGroup = recipientGroups.find(g => g.group_key === recipient);
    const recipientCount = selectedGroup?.phone_count || 0;
    return recipientCount * 0.05; // $0.05 per SMS
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
        <h4 className="alert-heading">Error loading SMS notifications</h4>
        <p>Failed to load SMS notifications data. Please try again later.</p>
        <hr />
        <p className="mb-0">
          {notificationsError?.message || groupsError?.message || templatesError?.message || 
           statsError?.message || creditsError?.message}
        </p>
      </div>
    );
  }

  const renderStatsCards = () => (
    <Row className="mb-4">
      <Col md={3}>
        <Card className="border-0 shadow-sm">
          <CardBody>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm">
                  <span className="avatar-title bg-primary rounded-circle">
                    <IconifyIcon icon="ri:message-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Total SMS Sent</h6>
                <h4 className="mb-0">{stats?.totalSent.toLocaleString() || "N/A"}</h4>
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
                <h6 className="mb-0">Delivery Rate</h6>
                <h4 className="mb-0">{stats?.deliveryRate?.toFixed(1) || "N/A"}%</h4>
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
                    <IconifyIcon icon="ri:reply-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Response Rate</h6>
                <h4 className="mb-0">{stats?.responseRate?.toFixed(1) || "N/A"}%</h4>
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
                    <IconifyIcon icon="ri:coins-line" className="font-22" />
                  </span>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Credits Remaining</h6>
                                  <h4 className="mb-0">{credits?.totalCreditsRemaining.toLocaleString() || "N/A"}</h4>
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
            <h5 className="mb-3">Compose SMS</h5>
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
                                             {recipientGroups.map((group) => (
                         <option key={group.id} value={group.group_key}>
                           {group.group_name} ({group.phone_count} phones)
                         </option>
                       ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Template</FormLabel>
                    <FormSelect
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">Select a template (optional)</option>
                      {smsTemplates.map((template) => (
                        <option key={template.id} value={template.id.toString()}>
                          {template.name}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
              </Row>
              
              <FormGroup className="mb-3">
                <FormLabel>Message</FormLabel>
                <FormControl
                  as="textarea"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your SMS message here..."
                  maxLength={160}
                />
                <div className="text-end mt-1">
                  <small className="text-muted">{message.length}/160 characters</small>
                </div>
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Schedule (Optional)</FormLabel>
                <Row>
                  <Col md={6}>
                    <FormControl type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                  </Col>
                  <Col md={6}>
                    <FormControl type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                  </Col>
                </Row>
              </FormGroup>

              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleSendSms} disabled={isSubmitting}>
                  <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                  {isSubmitting ? "Sending..." : "Send SMS"}
                </Button>
                <Button variant="outline-secondary" disabled={isSubmitting}>
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Save as Draft
                </Button>
                <Button 
                  variant="outline-info"
                  onClick={() => setShowQuickSendModal(true)}
                  disabled={isSubmitting}
                >
                  <IconifyIcon icon="ri:flashlight-line" className="me-1" />
                  Quick Send
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
      
      <Col lg={4}>
        <Card>
          <CardBody>
            <h5 className="mb-3">SMS Preview</h5>
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-start mb-2">
                <IconifyIcon icon="ri:smartphone-line" className="text-primary me-2 mt-1" />
                <div>
                  <strong>Casa Nirvana</strong>
                  <p className="mb-0 text-muted small">SMS Message</p>
                </div>
              </div>
              <div className="message-preview p-2 bg-white rounded">
                {message || "Your SMS message will appear here..."}
              </div>
            </div>
            
            <div className="mt-3">
              <h6>Estimated Cost</h6>
              <p className="text-success mb-1">
                <strong>${getEstimatedCost().toFixed(2)}</strong> per recipient
              </p>
              <small className="text-muted">Based on current SMS rates</small>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3">Quick Templates</h5>
            {smsTemplates.slice(0, 3).map((template) => (
              <div key={template.id} className="mb-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="w-100 text-start"
                  onClick={() => handleTemplateSelect(template.id.toString())}
                >
                  {template.name}
                </Button>
              </div>
            ))}
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
              <h5 className="mb-0">SMS History</h5>
              <div className="d-flex gap-2">
                <FormControl
                  type="search"
                  placeholder="Search messages..."
                  style={{ width: "200px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FormSelect style={{ width: "150px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="sending">Sending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </FormSelect>
              </div>
            </div>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Recipient</th>
                    <th>Sent Date</th>
                    <th>Status</th>
                    <th>Delivery Count</th>
                    <th>Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerm ? searchResults : paginatedNotifications).map((sms) => (
                    <tr key={sms.id}>
                      <td>
                        <div style={{ maxWidth: "250px" }}>
                          {sms.message.length > 50 
                            ? `${sms.message.substring(0, 50)}...` 
                            : sms.message}
                        </div>
                      </td>
                      <td>{recipientGroups.find(g => g.group_key === sms.recipient_group)?.group_name || sms.recipient_group}</td>
                      <td>{formatDate(sms.sent_at || sms.created_at)}</td>
                      <td>
                        <Badge bg={sms.status === "delivered" ? "success" : sms.status === "failed" ? "danger" : sms.status === "scheduled" ? "warning" : "secondary"}>
                          {sms.status}
                        </Badge>
                      </td>
                      <td>{sms.delivery_count}</td>
                      <td>{formatCurrency(sms.total_cost)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" onClick={() => handleResendSms(sms)}>
                            <IconifyIcon icon="ri:repeat-line" />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSms(sms.id)}>
                            <IconifyIcon icon="ri:delete-bin-line" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {!searchTerm && totalPages > 0 && (
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

  const renderAnalyticsTab = () => {
    // Debug: log delivery status data before rendering chart
    console.log('Analytics tab render - data:', { 
      analytics, 
      analyticsLoading, 
      analyticsError,
      notificationsCount: smsNotifications?.length || 0 
    });
    
    if (analyticsLoading) {
      return (
        <Row>
          <Col xs={12}>
            <Card>
              <CardBody className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading analytics...</span>
                </div>
                <p className="mt-3 text-muted">Loading analytics data...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      );
    }
    
    if (analyticsError) {
      return (
        <Row>
          <Col xs={12}>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Analytics</Alert.Heading>
              <p>{analyticsError.message || 'Failed to load analytics data'}</p>
            </Alert>
          </Col>
        </Row>
      );
    }
    
    if (!analytics || !smsNotifications || smsNotifications.length === 0) {
      return (
        <Row>
          <Col xs={12}>
            <Alert variant="info">
              <Alert.Heading>No Data Available</Alert.Heading>
              <p>No SMS notifications found to generate analytics. Send some SMS notifications first to see analytics data.</p>
            </Alert>
          </Col>
        </Row>
      );
    }
    
    return (
      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <h5 className="mb-3">SMS Performance Trends</h5>
              <Line 
                data={{
                  labels: analytics?.chartData?.labels || [],
                  datasets: [
                    {
                      label: "SMS Sent",
                      data: analytics?.chartData?.sentData || [],
                      borderColor: "rgb(75, 192, 192)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      tension: 0.1,
                    },
                    {
                      label: "Delivered",
                      data: analytics?.chartData?.deliveredData || [],
                      borderColor: "rgb(54, 162, 235)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      tension: 0.1,
                    },
                  ],
                }} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }} 
              />
            </CardBody>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Delivery Status</h5>
              <Doughnut data={{
                labels: ["Delivered", "Failed", "Scheduled"],
                datasets: [
                  {
                    data: [
                      analytics?.deliveryStatusData?.delivered || 0,
                      analytics?.deliveryStatusData?.failed || 0,
                      analytics?.deliveryStatusData?.pending || 0,
                    ],
                    backgroundColor: [
                      "rgba(75, 192, 192, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                      "rgba(255, 205, 86, 0.8)",
                    ],
                    borderColor: [
                      "rgba(75, 192, 192, 1)",
                      "rgba(255, 99, 132, 1)",
                      "rgba(255, 205, 86, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }} />
            </CardBody>
          </Card>
          <Card className="mt-3">
            <CardBody>
              <h5 className="mb-3">Performance Metrics</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Delivery Rate</span>
                  <span>{stats?.deliveryRate?.toFixed(1) || "N/A"}%</span>
                </div>
                <ProgressBar now={stats?.deliveryRate || 0} variant="success" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Response Rate</span>
                  <span>{stats?.responseRate?.toFixed(1) || "N/A"}%</span>
                </div>
                <ProgressBar now={stats?.responseRate || 0} variant="info" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Open Rate</span>
                  <span>{stats?.openRate?.toFixed(1) || "N/A"}%</span>
                </div>
                <ProgressBar now={stats?.openRate || 0} variant="primary" />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  };

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
                <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                Send SMS
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

      {/* Quick Send Modal */}
      <Modal show={showQuickSendModal} onHide={() => setShowQuickSendModal(false)}>
        <ModalHeader closeButton>
          <h5>Quick Send SMS</h5>
        </ModalHeader>
        <ModalBody>
          <FormGroup className="mb-3">
            <FormLabel>Select Template</FormLabel>
            <FormSelect
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">Choose a template</option>
              {smsTemplates.map((template) => (
                <option key={template.id} value={template.id.toString()}>
                  {template.name}
                </option>
              ))}
            </FormSelect>
          </FormGroup>
          
          <FormGroup className="mb-3">
            <FormLabel>Recipient</FormLabel>
            <FormSelect value={recipient} onChange={(e) => setRecipient(e.target.value)}>
              <option value="all">All Community Members</option>
              {recipientGroups.map((group) => (
                <option key={group.id} value={group.group_key}>
                  {group.group_name} ({group.phone_count} phones)
                </option>
              ))}
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Message</FormLabel>
            <FormControl
              as="textarea"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={160}
            />
            <small className="text-muted">{message.length}/160 characters</small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowQuickSendModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendSms} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send SMS"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SmsNotificationsView;
