"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { Card, CardBody, CardTitle, Col, Row, ProgressBar } from "react-bootstrap";

const EmailOverview = () => {
  // Sample email data - following the pattern from BookingsOverview
  const emails = [
    { id: 1, status: "read", folder: "inbox", priority: "high", hasAttachment: true },
    { id: 2, status: "unread", folder: "inbox", priority: "normal", hasAttachment: false },
    { id: 3, status: "sent", folder: "sent", priority: "low", hasAttachment: true },
    { id: 4, status: "draft", folder: "drafts", priority: "normal", hasAttachment: false },
    { id: 5, status: "read", folder: "inbox", priority: "high", hasAttachment: false },
    { id: 6, status: "unread", folder: "inbox", priority: "urgent", hasAttachment: true },
    { id: 7, status: "sent", folder: "sent", priority: "normal", hasAttachment: false },
    { id: 8, status: "archived", folder: "archive", priority: "low", hasAttachment: false },
    { id: 9, status: "unread", folder: "inbox", priority: "high", hasAttachment: true },
    { id: 10, status: "sent", folder: "sent", priority: "normal", hasAttachment: false },
  ];

  // Calculate email statistics
  const totalEmails = emails.length;
  const inboxEmails = emails.filter((e) => e.folder === "inbox").length;
  const unreadEmails = emails.filter((e) => e.status === "unread").length;
  const sentEmails = emails.filter((e) => e.folder === "sent").length;
  const draftEmails = emails.filter((e) => e.folder === "drafts").length;
  const highPriorityEmails = emails.filter((e) => e.priority === "high" || e.priority === "urgent").length;
  const emailsWithAttachments = emails.filter((e) => e.hasAttachment).length;

  // Calculate percentages for progress bars
  const unreadPercentage = inboxEmails > 0 ? (unreadEmails / inboxEmails) * 100 : 0;
  const highPriorityPercentage = totalEmails > 0 ? (highPriorityEmails / totalEmails) * 100 : 0;
  const attachmentPercentage = totalEmails > 0 ? (emailsWithAttachments / totalEmails) * 100 : 0;

  // Priority breakdown
  const priorityCounts = emails.reduce((acc, email) => {
    acc[email.priority] = (acc[email.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPriorities = Object.entries(priorityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Row className="mb-4">
      <Col xl={12}>
        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardBody className="p-4">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-center mb-3">
                  <div className="avatar-lg bg-white bg-opacity-20 rounded-circle flex-centered me-3">
                    <IconifyIcon
                      icon="solar:letter-bold-duotone"
                      className="fs-24 text-white"
                    />
                  </div>
                  <div>
                    <CardTitle as="h3" className="text-white mb-1">
                      Email Management Overview
                    </CardTitle>
                    <p className="text-white-75 mb-0">
                      Real-time email insights and communication metrics
                    </p>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Unread Messages</span>
                      <span className="text-white fw-semibold">{unreadEmails}/{inboxEmails}</span>
                    </div>
                    <ProgressBar 
                      now={unreadPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    >
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${unreadPercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">High Priority</span>
                      <span className="text-white fw-semibold">{highPriorityEmails}/{totalEmails}</span>
                    </div>
                    <ProgressBar 
                      now={highPriorityPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${highPriorityPercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">With Attachments</span>
                      <span className="text-white fw-semibold">{emailsWithAttachments}/{totalEmails}</span>
                    </div>
                    <ProgressBar 
                      now={attachmentPercentage} 
                      className="progress-sm bg-white bg-opacity-20"
                      variant=""
                    >
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${attachmentPercentage}%` }}
                      ></div>
                    </ProgressBar>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-75">Response Rate</span>
                      <span className="text-white fw-semibold">87%</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-white-75 small">Avg Response Time: 2.4h</span>
                      <span className="text-success small">
                        <IconifyIcon icon="solar:arrow-up-bold" className="me-1" />
                        +8.2% vs last week
                      </span>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col lg={4}>
                <div className="text-center">
                  <div className="mb-3">
                    <h2 className="text-white display-6 fw-bold mb-1">{inboxEmails}</h2>
                    <p className="text-white-75 mb-0">Inbox Messages</p>
                  </div>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="bg-white bg-opacity-10 rounded-2 p-2">
                        <div className="text-white fw-semibold">{sentEmails}</div>
                        <div className="text-white-75 small">Sent</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-white bg-opacity-10 rounded-2 p-2">
                        <div className="text-white fw-semibold">{draftEmails}</div>
                        <div className="text-white-75 small">Drafts</div>
                      </div>
                    </div>
                  </div>
                  
                  {topPriorities.length > 0 && (
                    <div className="bg-white bg-opacity-10 rounded-3 p-3">
                      <h6 className="text-white mb-2">
                        <IconifyIcon icon="solar:flag-bold" className="me-1" />
                        Priority Breakdown
                      </h6>
                      {topPriorities.map(([priority, count], index) => (
                        <div key={priority} className="d-flex align-items-center justify-content-between mb-1">
                          <span className="text-white-75 small text-capitalize">{priority}</span>
                          <span className="text-white fw-semibold small">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EmailOverview;
