'use client'

import { Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap'

import type { Resident } from '@/hooks/useResidents'

import ResidentDetailsCard from './ResidentDetailsCard'

type ResidentDetailsProps = {
  resident: Resident
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not available'
  return new Date(value).toLocaleString()
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="d-flex justify-content-between align-items-start gap-3 py-2 border-bottom">
    <span className="text-muted">{label}</span>
    <span className="text-end fw-medium text-dark">{value}</span>
  </div>
)

const ResidentDetails = ({ resident }: ResidentDetailsProps) => {
  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={12}>
        <ResidentDetailsCard resident={resident} />
      </Col>
      <Col xl={4} lg={12}>
        <Card className="mb-3">
          <CardBody>
            <CardTitle as={'h4'} className="mb-3">
              Residence Snapshot
            </CardTitle>
            <DetailItem label="Resident Type" value={resident.role === 'tenant' ? 'Tenant' : 'Resident'} />
            <DetailItem label="Status" value={resident.status.charAt(0).toUpperCase() + resident.status.slice(1)} />
            <DetailItem label="Community" value={resident.communities?.name || 'Not assigned'} />
            <DetailItem label="Unit" value={resident.unit_number || 'Not assigned'} />
            <DetailItem label="Address" value={resident.address || 'Not provided'} />
            <DetailItem label="Date of Birth" value={resident.date_of_birth || 'Not provided'} />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle as={'h4'} className="mb-3">
              Contact And Audit
            </CardTitle>
            <DetailItem label="Email" value={resident.email || 'Not provided'} />
            <DetailItem label="Phone" value={resident.phone || resident.mobile || 'Not provided'} />
            <DetailItem
              label="Emergency Contact"
              value={
                resident.emergency_contact_name || resident.emergency_contact_phone
                  ? [resident.emergency_contact_name, resident.emergency_contact_phone].filter(Boolean).join(' | ')
                  : 'Not provided'
              }
            />
            <DetailItem label="Created" value={formatDateTime(resident.created_at)} />
            <DetailItem label="Last Updated" value={formatDateTime(resident.updated_at)} />
            <DetailItem label="Resident ID" value={resident.id} />
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default ResidentDetails
