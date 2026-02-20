import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { Database } from "@/lib/database.types";
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Badge } from 'react-bootstrap'

type Society = Database["public"]["Tables"]["societies"]["Row"];

interface SocietyAmenitiesProps {
  society: Society;
}

const SocietyAmenities = ({ society }: SocietyAmenitiesProps) => {
  // Mock amenities for now - TODO: Get from amenities relation table
  const amenities = ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Garden', 'Clubhouse'];
  
  // Map amenities to appropriate icons
  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: string } = {
      'Swimming Pool': 'solar:swimming-bold-duotone',
      'Gym': 'solar:dumbbell-bold-duotone',
      'Playground': 'solar:playground-bold-duotone',
      'Garden': 'solar:leaf-bold-duotone',
      'Parking': 'solar:car-bold-duotone',
      'Security': 'solar:shield-check-bold-duotone',
      'Power Backup': 'solar:electric-refueling-bold-duotone',
      'Water Supply': 'solar:water-sun-bold-duotone',
      'Club House': 'solar:home-bold-duotone',
      'Clubhouse': 'solar:home-bold-duotone',
      'Community Hall': 'solar:buildings-bold-duotone',
      'CCTV': 'solar:video-camera-bold-duotone',
      'Lift': 'solar:lift-bold-duotone',
      'Intercom': 'solar:phone-bold-duotone',
      'Fire Safety': 'solar:fire-bold-duotone',
      'Waste Management': 'solar:recycle-bin-bold-duotone',
      'Maintenance': 'solar:tools-bold-duotone',
      'Kids Play Area': 'solar:baby-bold-duotone',
      'Senior Citizen Area': 'solar:user-heart-bold-duotone',
      'Jogging Track': 'solar:running-bold-duotone',
      'Tennis Court': 'solar:tennis-bold-duotone',
    };
    
    return iconMap[amenity] || 'solar:star-bold-duotone';
  };

  const getAmenityColor = (index: number) => {
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
    return colors[index % colors.length];
  };

  return (
    <Col xl={12}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Society Amenities</CardTitle>
        </CardHeader>
        <CardBody>
          {amenities.length === 0 ? (
            <div className="text-center py-4">
              <IconifyIcon 
                icon="solar:star-bold-duotone" 
                className="fs-48 text-muted mb-3 d-block" 
              />
              <h5 className="text-muted">No amenities listed</h5>
              <p className="text-muted">Amenity information will be displayed here when available.</p>
            </div>
          ) : (
            <Row>
              {amenities.map((amenity, index) => (
                <Col lg={3} md={4} sm={6} key={index} className="mb-3">
                  <div className="d-flex align-items-center gap-3 p-3 bg-light-subtle rounded">
                    <div className={`avatar-sm bg-${getAmenityColor(index)}-subtle rounded-circle d-flex align-items-center justify-content-center`}>
                      <IconifyIcon 
                        icon={getAmenityIcon(amenity)} 
                        className={`fs-20 text-${getAmenityColor(index)}`} 
                      />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-medium">{amenity}</h6>
                      <small className="text-muted">Available</small>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
          
          <div className="mt-4 pt-4 border-top">
            <Row>
              <Col lg={3} md={6}>
                <div className="text-center">
                  <IconifyIcon 
                    icon="solar:home-2-bold-duotone" 
                    className="fs-32 text-primary mb-2 d-block" 
                  />
                  <h5 className="fw-semibold">{society.totalUnits}</h5>
                  <p className="text-muted mb-0">Total Units</p>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="text-center">
                  <IconifyIcon 
                    icon="solar:users-group-rounded-bold-duotone" 
                    className="fs-32 text-success mb-2 d-block" 
                  />
                  <h5 className="fw-semibold">{society.occupiedUnits}</h5>
                  <p className="text-muted mb-0">Occupied Units</p>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="text-center">
                  <IconifyIcon 
                    icon="solar:star-bold-duotone" 
                    className="fs-32 text-warning mb-2 d-block" 
                  />
                  <h5 className="fw-semibold">{society.rating}/5</h5>
                  <p className="text-muted mb-0">Rating</p>
                </div>
              </Col>
              <Col lg={3} md={6}>
                <div className="text-center">
                  <IconifyIcon 
                    icon="solar:calendar-bold-duotone" 
                    className="fs-32 text-info mb-2 d-block" 
                  />
                  <h5 className="fw-semibold">{society.establishedYear}</h5>
                  <p className="text-muted mb-0">Established</p>
                </div>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

export default SocietyAmenities
