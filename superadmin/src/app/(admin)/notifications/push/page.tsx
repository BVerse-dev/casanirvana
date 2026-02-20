import { Metadata } from "next";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import PushNotificationsView from "./components/PushNotificationsView";

export const metadata: Metadata = {
  title: "Push Notifications",
  description: "Manage and send push notifications to mobile devices and web browsers",
};

const PushNotifications = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right"></div>
            <h4 className="page-title">Push Notifications</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="header-title">Push Notification Management</h4>
            </CardHeader>
            <CardBody>
              <PushNotificationsView />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PushNotifications;
