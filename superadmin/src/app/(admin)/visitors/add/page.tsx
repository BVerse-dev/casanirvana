import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import VisitorAddEnhanced from './components/VisitorAdd_Enhanced'
import VisitorAddCard from './components/VisitorAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Visitor Pass - Casa Nirvana' }

const VisitorAddPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add Visitor Pass" />
      <Row>
        <VisitorAddCard />
        <Col xl={9} lg={8}>
          <VisitorAddEnhanced />
        </Col>
      </Row>
    </>
  )
}

export default VisitorAddPage
