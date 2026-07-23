'use client'

import Link from 'next/link'
import { Button, Card, CardBody } from 'react-bootstrap'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { AgencyDirectoryItem } from '@/hooks/useAgencyDirectory'

type Props = { agencies: AgencyDirectoryItem[]; isLoading: boolean; error: Error | null; onDelete: (agency: AgencyDirectoryItem) => void }

const AgencyDirectoryList = ({ agencies, isLoading, error, onDelete }: Props) => {
  if (isLoading) return <Card><CardBody className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading agencies...</span></div></CardBody></Card>
  if (error) return <Card><CardBody className="text-center py-5 text-danger"><h5>Agencies could not be loaded</h5><p>{error.message}</p></CardBody></Card>
  if (agencies.length === 0) return <Card><CardBody className="text-center py-5"><h5>No agencies found</h5><p className="text-muted mb-0">No records match the current filters.</p></CardBody></Card>

  return <Card><CardBody className="p-0"><div className="table-responsive"><table className="table align-middle table-hover mb-0"><thead className="bg-light-subtle"><tr><th>Agency</th><th>Contact</th><th>Phone</th><th>Address</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{agencies.map((agency) => <tr key={agency.id}><td><Link href={`/agencies/${agency.id}`} className="fw-medium text-dark">{agency.name}</Link><small className="d-block text-muted">{agency.email || 'Email not recorded'}</small></td><td>{agency.contact_person || 'Not assigned'}</td><td>{agency.phone || 'Not recorded'}</td><td>{agency.address || 'Not recorded'}</td><td>{agency.is_active ? 'Active' : 'Inactive'}</td><td><div className="d-flex justify-content-end gap-2"><Link href={`/agencies/${agency.id}`} className="btn btn-sm btn-light" aria-label={`View ${agency.name}`}><IconifyIcon icon="solar:eye-broken" /></Link><Link href={`/agency/manage?tab=profiles&agencyId=${agency.id}`} className="btn btn-sm btn-soft-primary" aria-label={`Manage ${agency.name}`}><IconifyIcon icon="ri:settings-3-line" /></Link><Button size="sm" variant="soft-danger" onClick={() => onDelete(agency)} aria-label={`Delete ${agency.name}`}><IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" /></Button></div></td></tr>)}</tbody></table></div></CardBody></Card>
}

export default AgencyDirectoryList
