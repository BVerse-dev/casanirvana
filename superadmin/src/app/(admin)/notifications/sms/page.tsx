import { Metadata } from "next";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import SmsNotificationsView from "./components/SmsNotificationsView";

export const metadata: Metadata = {
  title: "SMS Notifications",
  description: "Manage and send SMS notifications to residents and staff members",
};

const SmsNotifications = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right"></div>
            <h4 className="page-title">SMS Notifications</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <h4 className="header-title">SMS Management</h4>
              <p className="text-muted mb-0">
                Send and manage SMS notifications to residents, staff, and other stakeholders
              </p>
            </CardHeader>
            <CardBody>
              <SmsNotificationsView />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SmsNotifications;
