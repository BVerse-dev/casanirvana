'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetService } from '@/hooks/useServices'
import { useListServiceRequests } from '@/hooks/useServiceRequests'
import { useSearchParams } from 'next/navigation'
import { Card, CardBody, Col, Row } from 'react-bootstrap'

const ServiceStatsCards = () => {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('id')
  
  const { data: service } = useGetService(serviceId || '')
  const { data: serviceRequests = [] } = useListServiceRequests(serviceId || '')

  // Calculate statistics
  const totalRequests = serviceRequests.length
  const activeRequests = serviceRequests.filter(req => ['pending', 'approved'].includes(req.status)).length
  const completedRequests = serviceRequests.filter(req => req.status === 'completed').length
  const totalRevenue = serviceRequests
    .filter(req => req.status === 'completed' && req.quoted_price)
    .reduce((sum, req) => sum + (req.quoted_price || 0), 0)

  const statsData = [
    {
      title: 'Service Status',
      value: service?.is_active ? 'ACTIVE' : 'INACTIVE',
      icon: 'solar:shield-check-bold-duotone',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Requests',
      value: totalRequests.toString(),
      icon: 'solar:clipboard-list-bold-duotone',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Completed',
      value: completedRequests.toString(),
      icon: 'solar:check-circle-bold-duotone',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      title: 'Base Price',
      value: service?.base_price ? `$${service.base_price}` : 'Custom',
      icon: 'solar:dollar-bold-duotone',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ]

  return (
    <Row className="mb-4">
      {statsData.map((stat, index) => (
        <Col xl={3} lg={6} key={index}>
          <Card 
            className="border-0 h-100"
            style={{
              background: stat.gradient,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-uppercase fw-medium text-white-50 mb-2 fs-12">
                    {stat.title}
                  </h6>
                  <h6 className="mb-0 text-white fw-semibold fs-16">
                    {stat.value}
                  </h6>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2">
                    <IconifyIcon icon={stat.icon} className="fs-20 text-white" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default ServiceStatsCards 