import amenityImg from '@/assets/images/properties/p-12.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useGetAmenity } from '@/hooks/useAmenities'

type AmenityDetailsBannerProps = {
  amenityId: string
}

const AmenityDetailsBanner = ({ amenityId }: AmenityDetailsBannerProps) => {
  const { data: amenity, isLoading } = useGetAmenity(amenityId)

  // Function to get the appropriate icon for each amenity type
  const getAmenityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "recreation":
        return "ri:game-line";
      case "fitness":
        return "ri:run-line";
      case "sports":
        return "ri:football-line";
      case "event space":
        return "ri:calendar-event-line";
      case "educational":
        return "ri:book-open-line";
      case "utility":
        return "ri:tools-line";
      default:
        return "ri:building-line";
    }
  };

  if (isLoading) {
    return (
      <Row>
        <Col lg={12}>
          <Card>
            <div className="text-center p-4">Loading amenity details...</div>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between bg-light-subtle flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar-lg bg-primary bg-opacity-10 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                <IconifyIcon
                  icon={getAmenityIcon(amenity?.amenity_type || "")}
                  className="fs-24 text-primary"
                />
              </div>
              <div>
                <CardTitle as={'h4'} className="mb-1">
                  {amenity?.name || 'Amenity Overview'}
                </CardTitle>
                <p className="text-muted mb-0 fs-13">
                  {amenity?.amenity_type} • {amenity?.is_paid ? `$${amenity.price_per_hour}/hr` : 'Free'}
                </p>
              </div>
            </div>
            <div className="w-25">
              <form className="app-search d-none d-md-block">
                <div className="position-relative">
                  <input type="search" className="form-control" placeholder="Search amenities..." autoComplete="off" />
                  <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
                </div>
              </form>
            </div>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={12}>
                <div className="position-relative">
                  <Image 
                    src={amenityImg} 
                    alt="amenity facility" 
                    className="img-fluid rounded border border-light border-4" 
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default AmenityDetailsBanner
