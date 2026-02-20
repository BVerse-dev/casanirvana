import { Metadata } from "next";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import InAppNotificationsView from "./components/InAppNotificationsView";

export const metadata: Metadata = {
  title: "In-App Notifications",
  description: "Manage and send in-app notifications within the Casa Nirvana mobile and web applications",
};

const InAppNotifications = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right"></div>
            <h4 className="page-title">In-App Notifications</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <h4 className="header-title">In-App Messaging System</h4>
              <p className="text-muted mb-0">
                Send real-time notifications within the mobile and web applications
              </p>
            </CardHeader>
            <CardBody>
              <InAppNotificationsView />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default InAppNotifications;
