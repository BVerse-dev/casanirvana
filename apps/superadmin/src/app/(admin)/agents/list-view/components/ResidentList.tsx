import { Card, CardBody, Col, Row } from 'react-bootstrap';

const ResidentList = () => {
  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardBody>
            <p className="mb-0 text-muted">No records to display yet.</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ResidentList;
