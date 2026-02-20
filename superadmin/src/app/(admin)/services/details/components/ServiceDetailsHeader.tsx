'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetService } from '@/hooks/useServices'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap'

const ServiceDetailsHeader = () => {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('id')
  
  const { data: service, isLoading } = useGetService(serviceId || '')

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      maintenance: 'solar:settings-bold-duotone',
      cleaning: 'solar:broom-bold-duotone',
      security: 'solar:shield-check-bold-duotone',
      utilities: 'solar:bolt-bold-duotone',
      landscaping: 'solar:leaf-bold-duotone',
      repair: 'solar:hammer-bold-duotone',
      plumbing: 'solar:water-drop-bold-duotone',
      electrical: 'solar:flash-bold-duotone',
      pest_control: 'solar:bug-bold-duotone',
      housekeeping: 'solar:home-2-bold-duotone',
      carpentry: 'solar:hammer-bold-duotone',
      appliance_repair: 'solar:widget-2-bold-duotone',
      painting: 'solar:palette-bold-duotone',
      packers_movers: 'solar:box-bold-duotone',
      home_sanitization: 'solar:shield-virus-bold-duotone',
      hair_beauty: 'solar:scissors-bold-duotone',
      laundry: 'solar:t-shirt-bold-duotone',
      gardening: 'solar:flower-bold-duotone',
      cooking: 'solar:chef-hat-bold-duotone',
      other: 'solar:menu-dots-bold-duotone'
    }
    return categoryIcons[category] || 'solar:service-bold-duotone'
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (isLoading) {
    return (
      <Row className="mb-3">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="text-center p-4">Loading service details...</div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  if (!service) {
    return (
      <Row className="mb-3">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="text-center p-4 text-danger">
                Service not found
                <div className="mt-3">
                  <Link href="/services" className="btn btn-primary">
                    Back to Services
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <>
      {/* Header Actions */}
      <Row className="mb-3">
        <Col xl={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              href="/services" 
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
              Back to Services
            </Link>
          </div>
        </Col>
      </Row>
      
      {/* Header Section */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-lg bg-primary bg-opacity-10 rounded flex-centered">
                    <IconifyIcon
                      icon={getCategoryIcon(service.category)}
                      className="fs-24 text-primary"
                    />
                  </div>
                  <div>
                    <h4 className="mb-1">{service.name}</h4>
                    <p className="text-muted mb-0">
                      Service ID: #{service.id.toString().slice(0, 8)} | {formatCategory(service.category)}
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="success" size="sm">
                    <IconifyIcon icon="solar:check-circle-bold-duotone" className="me-1" />
                    {service.is_active ? 'Active' : 'Activate'}
                  </Button>
                  <Button variant="primary" size="sm">
                    <IconifyIcon icon="solar:pen-bold-duotone" className="me-1" />
                    Edit Service
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ServiceDetailsHeader 