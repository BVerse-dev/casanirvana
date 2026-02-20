import guardSecurityImg from '@/assets/images/properties/p-12.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { useState } from 'react'
import type { Guard } from '@/hooks/useGuards'

interface GuardDetailsBannerProps {
  guard: Guard
}

const GuardDetailsBanner = ({ guard }: GuardDetailsBannerProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Redirect to guards list with search term
      window.location.href = `/guards/list-view?search=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardHeader className="d-flex align-items-center justify-content-between bg-light-subtle flex-wrap">
            <CardTitle as={'h4'}>
              {guard.full_name || 'Guard'} - Overview
            </CardTitle>
            <div className="w-25">
              <form className="app-search d-none d-md-block" onSubmit={handleSearch}>
                <div className="position-relative">
                  <input 
                    type="search" 
                    className="form-control" 
                    placeholder="Search guards..." 
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                    src={guardSecurityImg} 
                    alt="guard security area" 
                    className="img-fluid rounded border border-light border-4" 
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    <div className="badge bg-primary fs-6 px-3 py-2">
                      {guard.societies?.name || 'Society Not Assigned'}
                    </div>
                  </div>
                  <div className="position-absolute top-0 end-0 m-3">
                    <div className={`badge bg-${guard.is_active ? 'success' : 'danger'} fs-6 px-3 py-2`}>
                      {guard.is_active ? 'Active Guard' : 'Inactive Guard'}
                    </div>
                  </div>
                  <div className="position-absolute bottom-0 start-0 m-3">
                    <div className="badge bg-warning fs-6 px-3 py-2">
                      {guard.shift_type || 'Shift Not Set'}
                    </div>
                  </div>
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <div className="badge bg-info fs-6 px-3 py-2">
                      ID: {guard.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default GuardDetailsBanner
