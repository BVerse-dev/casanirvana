import { Metadata } from "next";
import { Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import NotificationsDashboardView from "./components/NotificationsDashboardView";

export const metadata: Metadata = {
  title: "Notifications Overview",
  description: "Unified operational overview of notification activity across all channels",
};

const NotificationsDashboard = () => {
  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <div className="page-title-right"></div>
            <h4 className="page-title">Notifications Overview</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="header-title">Notification Center Overview</h4>
            </CardHeader>
            <CardBody>
              <NotificationsDashboardView />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default NotificationsDashboard;
