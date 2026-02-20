import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { getAgencyPropertyImage } from '@/utils/avatarMapper'

interface AgencyDetailsBannerProps {
  agency?: any;
}

const AgencyDetailsBanner = ({ agency }: AgencyDetailsBannerProps) => {
  // Get the same property image used in grid and list views
  const bannerImage = getAgencyPropertyImage(agency);

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardBody>
            <Row>
              <Col lg={12}>
                <div className="position-relative">
                  <Image 
                    src={bannerImage} 
                    alt="managed properties" 
                    className="img-fluid rounded border border-light border-4"
                    width={1200}
                    height={400}
                    style={{ 
                      width: '100%', 
                      height: '400px', 
                      objectFit: 'cover', 
                      objectPosition: 'center' 
                    }}
                  />
                  {/* Management company status badge overlay */}
                  {agency && (
                    <span className="position-absolute top-0 start-0 p-2">
                      <span className={`badge bg-${agency.is_active ? 'success' : 'danger'} text-light px-2 py-1 fs-13`}>
                        {agency.is_active ? 'Active Management Company' : 'Inactive Management Company'}
                      </span>
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default AgencyDetailsBanner
