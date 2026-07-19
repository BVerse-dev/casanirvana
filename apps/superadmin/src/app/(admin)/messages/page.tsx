"use client";
import { Row, Col, Card, CardBody } from "react-bootstrap";
import PageTitle from "@/components/PageTitle";
import { ChatProvider } from "@/context/useChatContext";
import ChatApp from "./components/ChatApp";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useMessageStats } from "@/hooks/useMessages";

const ChatPage = () => {
  const { data: messageStats, isLoading, error } = useMessageStats();

  if (isLoading) {
    return (
      <>
        <PageTitle title="Messages & Chats" subName="Communication" />
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <CardBody className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading message data...</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle title="Messages & Chats" subName="Communication" />
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <CardBody className="text-center text-danger">
                <IconifyIcon icon="ri:error-warning-line" className="fs-24 mb-2" />
                <p>Error loading message data: {error.message}</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  const stats = messageStats || {
    totalMessages: 0,
    activeChats: 0,
    unreadMessages: 0,
    onlineUsers: 0
  };

  return (
    <>
      <PageTitle title="Messages & Chats" subName="Communication" />
      
      {/* Beautiful Gradient Cards Row */}
      <Row className="mb-4">
        <Col xl={3} md={6}>
          <Card className="gradient-card-1 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:message-3-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{stats.totalMessages}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Total Messages</p>
              <small className="text-white">All conversations combined</small>
            </CardBody>
            <div className="gradient-overlay-1"></div>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="gradient-card-2 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:chat-3-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{stats.activeChats}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Active Chats</p>
              <small className="text-white">Ongoing conversations</small>
            </CardBody>
            <div className="gradient-overlay-2"></div>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="gradient-card-3 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:notification-2-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{stats.unreadMessages}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Unread Messages</p>
              <small className="text-white">Pending responses required</small>
            </CardBody>
            <div className="gradient-overlay-3"></div>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="gradient-card-4 border-0 overflow-hidden position-relative">
            <CardBody className="text-center position-relative z-1">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <IconifyIcon icon="ri:user-line" className="fs-28 text-white" />
              </div>
              <h2 className="text-white mb-1 fw-bold">{stats.onlineUsers}</h2>
              <p className="text-white mb-2 fs-14 fw-medium">Online Users</p>
              <small className="text-white">Currently available</small>
            </CardBody>
            <div className="gradient-overlay-4"></div>
          </Card>
        </Col>
      </Row>

      <Row className="g-1">
        <ChatProvider>
          <ChatApp />
        </ChatProvider>
      </Row>
    </>
  );
};

export default ChatPage;
