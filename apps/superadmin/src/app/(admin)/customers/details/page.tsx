import type { Metadata } from 'next';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

export const metadata: Metadata = { title: 'Customer Details' };

const CustomerDetailsPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Customer Details" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <p className="mb-0 text-muted">Customer detail view is being prepared for production use.</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomerDetailsPage;
