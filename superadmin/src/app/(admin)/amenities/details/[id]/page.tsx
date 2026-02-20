'use client'
import PageTitle from '@/components/PageTitle'
import AmenityDetails from '../components/AmenityDetails'
import AmenityDetailsBanner from '../components/AmenityDetailsBanner'
import Link from 'next/link'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Row, Col } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import { useGetAmenity } from '@/hooks/useAmenities'

const AmenityDetailsPage = () => {
  const params = useParams()
  const amenityId = params?.id as string
  const { data: amenity } = useGetAmenity(amenityId)

  return (
    <>
      <PageTitle subName="Casa Nirvana" title={amenity?.name || "Amenity Overview"} />
      
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/amenities/list" 
              className="btn text-white fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
              Back to Amenities
            </Link>
          </div>
        </Col>
      </Row>
      
      <AmenityDetailsBanner amenityId={amenityId} />
      <AmenityDetails amenityId={amenityId} />
    </>
  )
}

export default AmenityDetailsPage
