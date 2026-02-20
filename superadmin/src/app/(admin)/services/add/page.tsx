import FileUpload from '@/components/FileUpload'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import ServiceAdd from './components/ServiceAdd'
import ServiceAddCard from './components/ServiceAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Service' }

const ServiceAddPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add Service" />
      <Row>
        <ServiceAddCard />
        <Col xl={9} lg={8}>
          <FileUpload title="Add Service Photo" />
          <ServiceAdd />
        </Col>
      </Row>
    </>
  )
}

export default ServiceAddPage
