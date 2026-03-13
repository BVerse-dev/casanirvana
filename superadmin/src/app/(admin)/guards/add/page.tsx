import PageTitle from '@/components/PageTitle'
import { Alert, Col, Row } from 'react-bootstrap'
import GuardAdd from './components/GuardAdd_Enhanced'
import GuardAddCard from './components/GuardAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Guard - Casa Nirvana' }

const FORM_ID = 'guard-provisioning-form'

const GuardAddPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add Guard" />
      <Row>
        <GuardAddCard formId={FORM_ID} />
        <Col xl={9} lg={8}>
          <Alert variant="info">
            Guard photo upload is intentionally disabled on this launch path until storage and avatar
            persistence are wired into guard provisioning. New guards will use the default avatar for now.
          </Alert>
          <GuardAdd formId={FORM_ID} />
        </Col>
      </Row>
    </>
  )
}

export default GuardAddPage
