'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, CardBody, Col, Form, Row } from 'react-bootstrap'

import DirectoryToolbar from '@/components/directory/DirectoryToolbar'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDirectoryView } from '@/hooks/useDirectoryView'
import { useDeleteAgencyDirectory, usePaginatedAgenciesDirectory, type AgencyDirectoryItem } from '@/hooks/useAgencyDirectory'
import AgencyDirectoryGrid from './AgencyDirectoryGrid'
import AgencyDirectoryList from './AgencyDirectoryList'

const PAGE_SIZE = 12
const validStatuses = new Set(['active', 'inactive'])
const positivePage = (value: string | null) => { const parsed = Number(value || 1); return Number.isInteger(parsed) && parsed > 0 ? parsed : 1 }

const AgencyDirectory = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { view, setView } = useDirectoryView('agencies')
  const page = positivePage(searchParams.get('page'))
  const search = searchParams.get('search')?.trim() || ''
  const requestedStatus = searchParams.get('status') || ''
  const status = validStatuses.has(requestedStatus) ? requestedStatus : ''
  const [searchInput, setSearchInput] = useState(search)
  const agenciesQuery = usePaginatedAgenciesDirectory({ page, pageSize: PAGE_SIZE, search, status })
  const deleteAgency = useDeleteAgencyDirectory()
  const payload = agenciesQuery.data

  useEffect(() => setSearchInput(search), [search])

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key))
    router.replace(`/agencies?${params.toString()}`, { scroll: false })
  }
  const submitSearch = (event: FormEvent) => { event.preventDefault(); updateQuery({ search: searchInput.trim() || null, page: null }) }
  const clearFilters = () => { setSearchInput(''); updateQuery({ search: null, status: null, page: null }) }
  const handleDelete = async (agency: AgencyDirectoryItem) => {
    if (!window.confirm(`Delete ${agency.name}? This action cannot be undone.`)) return
    await deleteAgency.mutateAsync(agency.id)
  }
  const error = agenciesQuery.error instanceof Error ? agenciesQuery.error : null
  const agencies = payload?.data || []
  const totalPages = payload?.totalPages || 0

  return <>
    <PageTitle title="Agencies" subName="People" />
    <DirectoryToolbar title="Agency directory" description="Manage service agencies within your authorized platform scope." view={view} onViewChange={setView} actions={<><Link href="/agency/manage" className="btn btn-outline-primary"><IconifyIcon icon="ri:settings-3-line" className="me-1" />Agency Workspace</Link><Button variant="outline-secondary" onClick={() => agenciesQuery.refetch()} disabled={agenciesQuery.isFetching}><IconifyIcon icon="ri:refresh-line" className="me-1" />Refresh</Button><Link href="/agencies/add" className="btn btn-success"><IconifyIcon icon="ri:add-line" className="me-1" />Add Agency</Link></>} />
    <Card className="mb-4"><CardBody><Form onSubmit={submitSearch}><Row className="g-3 align-items-end"><Col lg={7}><Form.Label htmlFor="agency-search">Search</Form.Label><Form.Control id="agency-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Name, email or address" /></Col><Col lg={3}><Form.Label htmlFor="agency-status">Status</Form.Label><Form.Select id="agency-status" value={status} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Form.Select></Col><Col lg={2} className="d-flex gap-2"><Button type="submit" className="flex-grow-1">Search</Button>{(search || status) && <Button type="button" variant="outline-secondary" onClick={clearFilters} aria-label="Clear filters"><IconifyIcon icon="ri:close-line" /></Button>}</Col></Row></Form></CardBody></Card>
    <div className="d-flex justify-content-between align-items-center mb-3"><p className="text-muted mb-0">{payload?.count ?? 0} {(payload?.count ?? 0) === 1 ? 'agency' : 'agencies'}</p>{agenciesQuery.isFetching && !agenciesQuery.isLoading && <small className="text-muted">Updating...</small>}</div>
    {view === 'grid' ? <AgencyDirectoryGrid agencies={agencies} isLoading={agenciesQuery.isLoading} error={error} onDelete={handleDelete} /> : <AgencyDirectoryList agencies={agencies} isLoading={agenciesQuery.isLoading} error={error} onDelete={handleDelete} />}
    {totalPages > 1 && <nav aria-label="Agencies pagination" className="mt-3"><ul className="pagination justify-content-center mb-0"><li className={`page-item ${page <= 1 ? 'disabled' : ''}`}><button className="page-link" disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</button></li><li className="page-item disabled"><span className="page-link">Page {Math.min(page, totalPages)} of {totalPages}</span></li><li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}><button className="page-link" disabled={page >= totalPages} onClick={() => updateQuery({ page: String(page + 1) })}>Next</button></li></ul></nav>}
  </>
}

export default AgencyDirectory
