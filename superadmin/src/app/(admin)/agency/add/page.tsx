import PageTitle from '@/components/PageTitle'
import { Alert, Col, Row } from 'react-bootstrap'
import AgencyAdd from './components/AgencyAdd'
import AgencyAddCard from './components/AgencyAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Agency - Casa Nirvana' }

const FORM_ID = 'agency-directory-form'

const AddAgencyPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add New Agency" />
      <Row>
        <AgencyAddCard formId={FORM_ID} />
        <Col xl={9} lg={8}>
          <Alert variant="info">
            Agency logo upload is intentionally disabled on this launch path until storage and logo
            persistence are wired into agency creation. New agencies will use the current decorative
            directory visuals for now.
          </Alert>
          <AgencyAdd formId={FORM_ID} />
        </Col>
      </Row>
    </>
  )
}

export default AddAgencyPage
