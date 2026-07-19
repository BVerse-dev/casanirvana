import PageTitle from '@/components/PageTitle'
import { Alert, Col, Row } from 'react-bootstrap'
import AmenityAdd from './components/AmenityAdd'
import AmenityAddCard from './components/AmenityAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Amenity - Casa Nirvana' }

const AmenityAddPage = () => {
  return (
    <>
      <PageTitle subName="Operations" title="Add Amenity" />
      <Row>
        <AmenityAddCard />
        <Col xl={9} lg={8}>
          <Alert variant="warning" className="mb-4">
            Photo upload is not wired on this route yet. Create the amenity record first, then attach media after
            the upload contract is enabled.
          </Alert>
          <AmenityAdd />
        </Col>
      </Row>
    </>
  )
}

export default AmenityAddPage
