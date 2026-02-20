import FileUpload from '@/components/FileUpload'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import AmenityAdd from './components/AmenityAdd'
import AmenityAddCard from './components/AmenityAddCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Amenity - Casa Nirvana' }

const AmenityAddPage = () => {
  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Add Amenity" />
      <Row>
        <AmenityAddCard />
        <Col xl={9} lg={8}>
          <FileUpload title="Add Amenity Photos" />
          <AmenityAdd />
        </Col>
      </Row>
    </>
  )
}

export default AmenityAddPage
