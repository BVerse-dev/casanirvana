import { Metadata } from "next";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import EmailNotificationsView from "./components/EmailNotificationsView";

export const metadata: Metadata = {
  title: "Email Notifications",
  description: "Manage and send email notifications to residents and staff members",
};

const EmailNotifications = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right"></div>
            <h4 className="page-title">Email Notifications</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <h4 className="header-title">Email Campaign Management</h4>
              <p className="text-muted mb-0">
                Create and send professional email notifications with rich content and templates
              </p>
            </CardHeader>
            <CardBody>
              <EmailNotificationsView />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EmailNotifications;
