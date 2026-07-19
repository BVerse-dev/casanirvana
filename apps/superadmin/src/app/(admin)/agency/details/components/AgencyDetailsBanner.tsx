import Image from 'next/image'
import { Badge, Card, CardBody, Col, Row } from 'react-bootstrap'

import type { AgencyDirectoryItem, AgencyDirectorySummary } from '@/hooks/useAgencyDirectory'
import { getAgencyPropertyImage } from '@/utils/avatarMapper'

interface AgencyDetailsBannerProps {
  agency: AgencyDirectoryItem;
  stats: AgencyDirectorySummary['stats'];
}

const AgencyDetailsBanner = ({ agency, stats }: AgencyDetailsBannerProps) => {
  const bannerImage = getAgencyPropertyImage(agency)

  return (
    <Row className="mb-4">
      <Col lg={12}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardBody className="p-0 position-relative">
            <Image
              src={bannerImage}
              alt={`${agency.name} banner`}
              className="img-fluid"
              width={1200}
              height={400}
              style={{ width: '100%', height: '360px', objectFit: 'cover', objectPosition: 'center' }}
            />

            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.75) 100%)' }} />

            <div className="position-absolute bottom-0 start-0 w-100 p-4 text-white">
              <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge bg={agency.is_active ? 'success' : 'secondary'}>
                      {agency.is_active ? 'Active agency' : 'Inactive agency'}
                    </Badge>
                    <Badge bg="dark" text="light">
                      {agency.agency_type || 'Agency'}
                    </Badge>
                  </div>
                  <h2 className="mb-2 text-white">{agency.name || 'Agency details'}</h2>
                  <p className="mb-0 text-white-50">
                    {agency.city || agency.state || agency.country
                      ? [agency.city, agency.state, agency.country].filter(Boolean).join(', ')
                      : 'Location not configured'}
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <div className="bg-white bg-opacity-10 rounded-3 px-3 py-2 min-w-120">
                    <div className="small text-white-50">Communities</div>
                    <div className="h4 mb-0 text-white">{stats.communities_count}</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-3 px-3 py-2 min-w-120">
                    <div className="small text-white-50">Staff</div>
                    <div className="h4 mb-0 text-white">{stats.staff_count}</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-3 px-3 py-2 min-w-120">
                    <div className="small text-white-50">Services</div>
                    <div className="h4 mb-0 text-white">{stats.services_count}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default AgencyDetailsBanner
