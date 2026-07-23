'use client'

import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { AgencyDirectoryItem } from '@/hooks/useAgencyDirectory'

type Props = { agencies: AgencyDirectoryItem[]; isLoading: boolean; error: Error | null; onDelete: (agency: AgencyDirectoryItem) => void }

const AgencyDirectoryGrid = ({ agencies, isLoading, error, onDelete }: Props) => {
  if (isLoading) return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading agencies...</span></div></CardBody></Card>
  if (error) return <Card><CardBody className="text-center py-5 text-danger"><h5>Agencies could not be loaded</h5><p className="mb-0">{error.message}</p></CardBody></Card>
  if (agencies.length === 0) return <Card><CardBody className="text-center py-5"><IconifyIcon icon="ri:building-4-line" className="fs-48 text-muted mb-3" /><h5>No agencies found</h5><p className="text-muted mb-0">No records match the current filters.</p></CardBody></Card>

  return <Row>{agencies.map((agency) => <Col xl={4} lg={6} className="mb-4" key={agency.id}><Card className="h-100"><CardBody><div className="d-flex align-items-center gap-3 border-bottom pb-3"><div className="avatar-md rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"><IconifyIcon icon="ri:building-4-line" className="fs-24" /></div><div className="min-w-0"><Link href={`/agency/details?id=${agency.id}`} className="fw-medium text-dark fs-16">{agency.name}</Link><p className="text-muted mb-0 text-truncate">{agency.email || 'Email not recorded'}</p></div></div><div className="mt-3"><p className="mb-2"><span className="text-muted">Contact:</span> {agency.contact_person || 'Not assigned'}</p><p className="mb-2"><span className="text-muted">Phone:</span> {agency.phone || 'Not recorded'}</p><p className="mb-0"><span className="text-muted">Address:</span> {agency.address || 'Not recorded'}</p></div></CardBody><CardFooter className="d-flex justify-content-between align-items-center"><span className={`badge bg-${agency.is_active ? 'success' : 'secondary'}-subtle text-${agency.is_active ? 'success' : 'secondary'}`}>{agency.is_active ? 'Active' : 'Inactive'}</span><div className="d-flex gap-2"><Link href={`/agency/manage?tab=profiles&agencyId=${agency.id}`} className="btn btn-sm btn-light" aria-label={`Manage ${agency.name}`}><IconifyIcon icon="ri:settings-3-line" /></Link><Button size="sm" variant="soft-danger" onClick={() => onDelete(agency)} aria-label={`Delete ${agency.name}`}><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" /></Button></div></CardFooter></Card></Col>)}</Row>
}

export default AgencyDirectoryGrid
