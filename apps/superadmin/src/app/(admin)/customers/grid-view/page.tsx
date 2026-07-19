import type { Metadata } from 'next';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

export const metadata: Metadata = { title: 'Customers Grid' };

const CustomersGridPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Customers Grid" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <p className="mb-0 text-muted">Customer grid view is being prepared for production use.</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomersGridPage;
