import PageTitle from '@/components/PageTitle'
import { Alert, Col, Row } from 'react-bootstrap'
import ServiceAdd from './components/ServiceAdd'
import ServiceAddCard from './components/ServiceAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Service' }

const ServiceAddPage = () => {
  return (
    <>
      <PageTitle subName="Operations" title="Add Service" />
      <Row>
        <ServiceAddCard />
        <Col xl={9} lg={8}>
          <Alert variant="warning" className="mb-4">
            Service photo or icon upload is not wired on this route yet. Create the service record first, then attach
            media after the upload contract is enabled.
          </Alert>
          <ServiceAdd />
        </Col>
      </Row>
    </>
  )
}

export default ServiceAddPage
