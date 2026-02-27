import type { Metadata } from 'next';
import PageTitle from '@/components/PageTitle';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

export const metadata: Metadata = { title: 'Transactions' };

const TransactionsPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Transactions" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <p className="mb-0 text-muted">Transactions module is being prepared for production use.</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TransactionsPage;
