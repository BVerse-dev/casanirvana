import PageTitle from '@/components/PageTitle'
import ServiceDetailsHeader from './components/ServiceDetailsHeader'
import ServiceStatsCards from './components/ServiceStatsCards'

import ServiceOverview from './components/ServiceOverview'
import ServiceRequestsTable from './components/ServiceRequestsTable'
import { Col, Row } from 'react-bootstrap'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Service Details' }

const ServiceDetailsPage = () => {
  return (
    <>
      <PageTitle title="Service Details" subName="Services" />
      
      {/* Service Header */}
      <ServiceDetailsHeader />
      
      {/* Status Cards */}
      <ServiceStatsCards />
      
      {/* Service Overview Gradient Card with Brief Details */}
      <ServiceOverview />
      
      {/* Service Requests Table */}
      <Row>
        <Col xl={12}>
          <ServiceRequestsTable />
        </Col>
      </Row>
    </>
  )
}

export default ServiceDetailsPage
