import type { Metadata } from 'next';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

export const metadata: Metadata = { title: 'User Details' };

const AgentDetailsPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="User Details" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <p className="mb-0 text-muted">User detail view is being prepared for production use.</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AgentDetailsPage;
