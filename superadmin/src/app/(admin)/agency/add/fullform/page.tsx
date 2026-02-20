import FileUpload from '@/components/FileUpload'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import AgencyAdd from '../components/AgencyAdd'
import AgencyAddCard from '../components/AgencyAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Agency' }

const AgencyAddFullFormPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add Agency" />
      <Row>
        <AgencyAddCard />
        <Col xl={9} lg={8}>
          <FileUpload title="Add Agency Logo" />
          <AgencyAdd />
        </Col>
      </Row>
    </>
  )
}

export default AgencyAddFullFormPage
