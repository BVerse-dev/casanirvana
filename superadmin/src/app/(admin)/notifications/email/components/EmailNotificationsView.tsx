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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  useEmailStats,
  useEmailAnalytics,
  useListEmailCampaigns,
  useListEmailTemplates,
  useSendEmail,
  useSearchEmails,
} from "@/hooks/useEmailNotifications";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EmailNotificationsView = () => {
  const [activeTab, setActiveTab] = useState("compose");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");

  // Pagination state for campaigns tab
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // default 10 per page

  const queryClient = useQueryClient();

  // Fetch real data using hooks
  const { data: emailStats, isLoading: statsLoading, error: statsError } = useEmailStats();
  const { data: analyticsData, isLoading: analyticsLoading } = useEmailAnalytics();
  const { data: emailCampaigns = [], isLoading: campaignsLoading } = useListEmailCampaigns();
  const { data: emailTemplates = [], isLoading: templatesLoading } = useListEmailTemplates();
  const { data: searchResults = [] } = useSearchEmails(searchTerm);
  
  const sendEmailMutation = useSendEmail();

  // Filter campaigns based on search and status
  const filteredCampaigns = emailCampaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = campaignFilter === "all" || 
      campaign.status === campaignFilter;
    return matchesSearch && matchesFilter;
  });

  // Pagination logic for campaigns
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Real-time subscription for email updates
  useEffect(() => {
    const channel = supabase
      .channel('public:emails')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emails'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['email_campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['email_stats'] });
        queryClient.invalidateQueries({ queryKey: ['emails'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Chart data for email analytics
  const emailPerformanceData = analyticsData ? {
    labels: analyticsData.chartData.labels,
    datasets: [
      {
        label: "Emails Sent",
        data: analyticsData.chartData.sentData,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Emails Opened",
        data: analyticsData.chartData.openedData,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  } : {
    labels: [],
    datasets: [],
  };

  const engagementData = analyticsData ? {
    labels: ["Opened", "Clicked", "Unsubscribed", "Bounced"],
    datasets: [
      {
        data: [
          analyticsData.engagementData.opened,
          analyticsData.engagementData.clicked,
          analyticsData.engagementData.unsubscribed,
          analyticsData.engagementData.bounced
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(255, 99, 132, 0.8)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  } : {
    labels: [],
    datasets: [],
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

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) {
      alert("Please fill in both subject and content");
      return;
    }

    try {
      // Calculate recipient count based on selection
      const recipientCount = recipient === "all" ? 487 : 
                           recipient === "building-a" ? 156 :
                           recipient === "building-b" ? 142 :
                           recipient === "new-residents" ? 18 :
                           recipient === "pending-payment" ? 89 : 50;

      await sendEmailMutation.mutateAsync({
        subject: emailSubject,
        content: emailContent,
        recipient,
        recipientCount,
        templateId: selectedTemplate ? parseInt(selectedTemplate) : undefined,
      });

      // Reset form
      setEmailSubject("");
      setEmailContent("");
      setRecipient("all");
      setSelectedTemplate("");
      
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  const renderStatsCards = () => {
    if (statsLoading) {
      return (
        <Row className="mb-4">
          {[...Array(4)].map((_, index) => (
            <Col md={3} key={index}>
              <Card className="border-0 shadow-sm">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar-sm">
                        <span className="avatar-title bg-secondary rounded-circle">
                          <IconifyIcon icon="ri:loader-line" className="font-22" />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-0">Loading...</h6>
                      <h4 className="mb-0">-</h4>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    if (statsError) {
      return (
        <Row className="mb-4">
          <Col xs={12}>
            <Alert variant="danger">
              Failed to load email statistics: {statsError.message}
            </Alert>
          </Col>
        </Row>
      );
    }

    return (
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-primary rounded-circle">
                      <IconifyIcon icon="ri:mail-send-line" className="font-22" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Total Emails Sent</h6>
                  <h4 className="mb-0">{emailStats?.totalSent?.toLocaleString() || '0'}</h4>
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
                      <IconifyIcon icon="ri:mail-open-line" className="font-22" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Open Rate</h6>
                  <h4 className="mb-0">{emailStats?.openRate || '0'}%</h4>
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
                      <IconifyIcon icon="ri:cursor-line" className="font-22" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Click Rate</h6>
                  <h4 className="mb-0">{emailStats?.clickRate || '0'}%</h4>
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
                      <IconifyIcon icon="ri:error-warning-line" className="font-22" />
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-0">Bounce Rate</h6>
                  <h4 className="mb-0">{emailStats?.bounceRate || '0'}%</h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderComposeTab = () => (
    <Row>
      <Col lg={8}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Compose Email</h5>
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
                      <option value="building-a">Block A Members</option>
                      <option value="building-b">Block B Members</option>
                      <option value="new-residents">New Community Members</option>
                      <option value="pending-payment">Pending Payment Users</option>
                      <option value="security">Security Guards</option>
                      <option value="maintenance">Maintenance Staff</option>
                      <option value="management">Management Team</option>
                      <option value="custom">Custom Group</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Template</FormLabel>
                    <div className="d-flex gap-2">
                      <FormSelect
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        disabled={templatesLoading}
                      >
                        <option value="">
                          {templatesLoading ? "Loading templates..." : "Select a template (optional)"}
                        </option>
                        {emailTemplates.map((template) => (
                          <option key={template.id} value={template.id.toString()}>
                            {template.template_name}
                          </option>
                        ))}
                      </FormSelect>
                      <Button
                        variant="outline-primary"
                        onClick={() => setShowTemplateModal(true)}
                      >
                        <IconifyIcon icon="ri:eye-line" />
                      </Button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              
              <FormGroup className="mb-3">
                <FormLabel>Subject</FormLabel>
                <FormControl
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <FormLabel>Email Content</FormLabel>
                <FormControl
                  as="textarea"
                  rows={12}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Type your email content here..."
                />
                <small className="text-muted">
                  You can use variables like [RESIDENT_NAME], [UNIT_NUMBER], [BUILDING], etc.
                </small>
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Schedule Send (Optional)</FormLabel>
                    <FormControl type="datetime-local" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <FormLabel>Priority</FormLabel>
                    <FormSelect>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
              </Row>

              <div className="d-flex gap-2 mb-3">
                <Form.Check
                  type="checkbox"
                  id="track-opens"
                  label="Track email opens"
                  defaultChecked
                />
                <Form.Check
                  type="checkbox"
                  id="track-clicks"
                  label="Track link clicks"
                  defaultChecked
                />
              </div>

              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.isPending || !emailSubject || !emailContent}
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <IconifyIcon icon="ri:loader-line" className="me-1" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="ri:send-plane-line" className="me-1" />
                      Send Email
                    </>
                  )}
                </Button>
                <Button variant="outline-secondary">
                  <IconifyIcon icon="ri:save-line" className="me-1" />
                  Save as Draft
                </Button>
                <Button variant="outline-info">
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
            <h5 className="mb-3">Email Statistics</h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Estimated Recipients</span>
                <span className="fw-bold">487</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Expected Open Rate</span>
                <span className="text-success">68.4%</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Expected Clicks</span>
                <span className="text-info">62 clicks</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mt-3">
          <CardBody>
            <h5 className="mb-3">Recent Templates</h5>
            {templatesLoading ? (
              <div className="text-center p-3">
                <IconifyIcon icon="ri:loader-line" className="fs-4" />
                <p className="mb-0">Loading templates...</p>
              </div>
            ) : emailTemplates.length > 0 ? (
              emailTemplates.slice(0, 4).map((template) => (
                <div key={template.id} className="mb-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="w-100 text-start"
                    onClick={() => {
                      setSelectedTemplate(template.id.toString());
                      setEmailSubject(template.template_name);
                      setEmailContent(template.template_content);
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{template.template_name}</span>
                      <Badge bg="light" text="dark">Template</Badge>
                    </div>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center p-3">
                <IconifyIcon icon="ri:file-list-line" className="fs-4 text-muted" />
                <p className="text-muted mb-0">No templates available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  );

  const renderCampaignsTab = () => (
    <Row>
      <Col xs={12}>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Email Campaigns</h5>
              <div className="d-flex gap-2">
                <FormControl
                  type="search"
                  placeholder="Search campaigns..."
                  style={{ width: "200px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FormSelect 
                  style={{ width: "150px" }}
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                >
                  <option value="all">All Campaigns</option>
                  <option value="delivered">Delivered</option>
                  <option value="sending">Sending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                </FormSelect>
              </div>
            </div>

            <div className="table-responsive">
              {campaignsLoading ? (
                <div className="text-center p-4">
                  <IconifyIcon icon="ri:loader-line" className="fs-2" />
                  <p>Loading campaigns...</p>
                </div>
              ) : (
                <Table hover>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Sent Date</th>
                      <th>Recipients</th>
                      <th>Opens</th>
                      <th>Clicks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCampaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>
                          <div style={{ maxWidth: "250px" }}>
                            {campaign.title.length > 50 
                              ? `${campaign.title.substring(0, 50)}...` 
                              : campaign.title}
                          </div>
                        </td>
                        <td>
                          <Badge bg={
                            campaign.status === "delivered" ? "success" : 
                            campaign.status === "sending" ? "info" :
                            campaign.status === "scheduled" ? "warning" : 
                            "secondary"
                          }>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          {campaign.sent_at 
                            ? new Date(campaign.sent_at).toLocaleString()
                            : campaign.scheduled_at 
                              ? `Scheduled: ${new Date(campaign.scheduled_at).toLocaleString()}`
                              : 'Not sent'
                          }
                        </td>
                        <td>{campaign.recipients_count || 0}</td>
                        <td>
                          <span className="text-success">{campaign.opened_count || 0}</span>
                          <small className="text-muted">
                            {campaign.recipients_count > 0 
                              ? ` (${(((campaign.opened_count || 0) / campaign.recipients_count) * 100).toFixed(1)}%)`
                              : ' (0%)'
                            }
                          </small>
                        </td>
                        <td>
                          <span className="text-info">{campaign.clicked_count || 0}</span>
                          <small className="text-muted">
                            {campaign.opened_count > 0 
                              ? ` (${(((campaign.clicked_count || 0) / campaign.opened_count) * 100).toFixed(1)}%)`
                              : ' (0%)'
                            }
                          </small>
                        </td>
                        <td>
                          <Dropdown>
                            <DropdownToggle variant="outline-secondary" size="sm">
                              <IconifyIcon icon="ri:more-2-line" />
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem>
                                <IconifyIcon icon="ri:eye-line" className="me-1" />
                                View Details
                              </DropdownItem>
                              <DropdownItem>
                                <IconifyIcon icon="ri:file-copy-line" className="me-1" />
                                Duplicate
                              </DropdownItem>
                              <DropdownItem>
                                <IconifyIcon icon="ri:bar-chart-line" className="me-1" />
                                Analytics
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                    {filteredCampaigns.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-4">
                          <IconifyIcon icon="ri:inbox-line" className="fs-2 text-muted" />
                          <p className="text-muted mt-2">
                            {searchTerm || campaignFilter !== "all" 
                              ? "No campaigns match your filters" 
                              : "No email campaigns found"
                            }
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredCampaigns.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                <div className="d-flex align-items-center gap-3 mb-2 mb-md-0">
                  <span className="text-muted">
                    Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalItems)} of {totalItems} campaigns
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
        <Card className="mb-3">
          <CardBody>
            <h5 className="mb-3">Email Performance Trends</h5>
            {analyticsLoading ? (
              <div className="text-center p-4">
                <IconifyIcon icon="ri:loader-line" className="fs-2" />
                <p>Loading analytics...</p>
              </div>
            ) : analyticsData && analyticsData.chartData.labels.length > 0 ? (
              <Bar data={emailPerformanceData} options={chartOptions} />
            ) : (
              <div className="text-center p-4">
                <IconifyIcon icon="ri:bar-chart-line" className="fs-2 text-muted" />
                <p className="text-muted mt-2">No analytics data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="mb-3">
          <CardBody>
            <h5 className="mb-3">Engagement Breakdown</h5>
            {analyticsLoading ? (
              <div className="text-center p-4">
                <IconifyIcon icon="ri:loader-line" className="fs-2" />
                <p>Loading...</p>
              </div>
            ) : analyticsData && analyticsData.engagementData ? (
              <Doughnut data={engagementData} />
            ) : (
              <div className="text-center p-4">
                <IconifyIcon icon="ri:pie-chart-line" className="fs-2 text-muted" />
                <p className="text-muted mt-2">No engagement data</p>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
      
      <Col xs={12}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Performance Metrics</h5>
            <Row>
              <Col md={3}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Open Rate</span>
                    <span>{analyticsData?.engagementData.opened || emailStats?.openRate || 0}%</span>
                  </div>
                  <ProgressBar 
                    now={analyticsData?.engagementData.opened || emailStats?.openRate || 0} 
                    variant="success" 
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Click Rate</span>
                    <span>{analyticsData?.engagementData.clicked || emailStats?.clickRate || 0}%</span>
                  </div>
                  <ProgressBar 
                    now={analyticsData?.engagementData.clicked || emailStats?.clickRate || 0} 
                    variant="info" 
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Unsubscribe Rate</span>
                    <span>{analyticsData?.engagementData.unsubscribed || 1.2}%</span>
                  </div>
                  <ProgressBar 
                    now={analyticsData?.engagementData.unsubscribed || 1.2} 
                    variant="warning" 
                  />
                </div>
              </Col>
              <Col md={3}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Bounce Rate</span>
                    <span>{analyticsData?.engagementData.bounced || emailStats?.bounceRate || 0}%</span>
                  </div>
                  <ProgressBar 
                    now={analyticsData?.engagementData.bounced || emailStats?.bounceRate || 0} 
                    variant="danger" 
                  />
                </div>
              </Col>
            </Row>
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
                active={activeTab === "compose"}
                onClick={() => setActiveTab("compose")}
                style={{ cursor: "pointer" }}
              >
                <IconifyIcon icon="ri:edit-line" className="me-1" />
                Compose
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === "campaigns"}
                onClick={() => setActiveTab("campaigns")}
                style={{ cursor: "pointer" }}
              >
                <IconifyIcon icon="ri:mail-line" className="me-1" />
                Campaigns
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
            <TabPane active={activeTab === "compose"}>
              {renderComposeTab()}
            </TabPane>
            <TabPane active={activeTab === "campaigns"}>
              {renderCampaignsTab()}
            </TabPane>
            <TabPane active={activeTab === "analytics"}>
              {renderAnalyticsTab()}
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>

      {/* Template Preview Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg">
        <ModalHeader closeButton>
          <h5>Email Templates</h5>
        </ModalHeader>
        <ModalBody>
          {templatesLoading ? (
            <div className="text-center p-4">
              <IconifyIcon icon="ri:loader-line" className="fs-2" />
              <p>Loading templates...</p>
            </div>
          ) : emailTemplates.length > 0 ? (
            <Row>
              {emailTemplates.map((template) => (
                <Col md={6} key={template.id} className="mb-3">
                  <Card className="h-100">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6>{template.template_name || 'Untitled Template'}</h6>
                        <Badge bg="primary">Template</Badge>
                      </div>
                      <p className="small">
                        {template.template_content && template.template_content.length > 100 
                          ? `${template.template_content.substring(0, 100)}...` 
                          : template.template_content || 'No content available'}
                      </p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template.id.toString());
                          setEmailSubject(template.template_name || '');
                          setEmailContent(template.template_content || '');
                          setShowTemplateModal(false);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center p-4">
              <IconifyIcon icon="ri:file-list-line" className="fs-2 text-muted" />
              <p className="text-muted mt-2">No templates available</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EmailNotificationsView;
