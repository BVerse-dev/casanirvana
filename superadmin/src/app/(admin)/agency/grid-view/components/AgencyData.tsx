'use client'
import { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useListAgenciesDirectory, useDeleteAgencyDirectory } from '@/hooks/useAgencyDirectory'
import { getAgencyAvatar, getAgencyPropertyImage } from '@/utils/avatarMapper'

// Import individual components directly
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'

const AgencyCard = ({ agency, onDelete }: { agency: any; onDelete: (id: string) => void }) => {
  // Get the correct avatar image from the centralized mapping
  const avatarImage = getAgencyAvatar(agency.logo_url)
  // Get property image for banner using static import (same as details page)
  const bannerImage = getAgencyPropertyImage(agency)

  return (
    <Card className="h-100">
      {/* Banner Image */}
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <Image
          src={bannerImage}
          alt={`${agency.name} banner`}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-top"
        />
      </div>

      <Card.Body>
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
          {avatarImage ? (
            <Image
              src={avatarImage}
              alt={`${agency.name} logo`}
              width={48}
              height={48}
              className="avatar-md rounded-3 border border-light border-2"
            />
          ) : (
            <div className="avatar-md rounded-3 border border-light border-2 bg-primary d-flex align-items-center justify-content-center">
              <IconifyIcon icon="ri:building-4-line" className="fs-18 text-white" />
            </div>
          )}
          <div className="d-block flex-grow-1">
            <Link href={`/agency/details?id=${agency.id}`} className="text-dark fw-medium fs-15">
              {agency.name || 'Agency Name'}
            </Link>
            <p className="mb-0 small text-muted">{agency.description ? (agency.description.length > 50 ? agency.description.substring(0, 50) + '...' : agency.description) : 'No description'}</p>
            <p className="mb-0 text-primary small"># {String(agency.id).slice(0, 8)}</p>
          </div>
          <div className="ms-auto">
            <Dropdown>
              <Dropdown.Toggle
                as={'a'}
                className="btn btn-sm btn-outline-light rounded arrow-none fs-16"
                data-bs-toggle="dropdown"
                aria-expanded="false">
                <IconifyIcon icon="ri:more-2-fill" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                <Dropdown.Item as={Link} href={`/agency/details?id=${agency.id}`}>View Details</Dropdown.Item>
                <Dropdown.Item as={Link} href={`/agency/edit?id=${agency.id}`}>Edit</Dropdown.Item>
                <Dropdown.Item onClick={() => onDelete(agency.id)}>Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <p className="mt-3 d-flex align-items-center gap-2 mb-2 small">
          <IconifyIcon icon="solar:calendar-bold-duotone" className="fs-16 text-primary" />
          Created: {agency.created_at ? new Date(agency.created_at).toLocaleDateString() : 'Unknown'}
        </p>
        <p className="d-flex align-items-center gap-2 mt-2 small">
          <IconifyIcon icon="solar:buildings-bold-duotone" className="fs-16 text-primary" />
          Communities: {agency.managed_societies || 0}
        </p>
        <div className="d-flex justify-content-between align-items-center my-3">
          <h6 className="mb-0 small">Social Media</h6>
          <span className={`badge bg-${agency.is_active ? 'success' : 'danger'}-subtle text-${agency.is_active ? 'success' : 'danger'} py-1 px-2 fs-12`}>
            {agency.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <ul className="list-inline d-flex gap-1 mb-0 align-items-center">
          <li className="list-inline-item">
            <Button variant="soft-primary" className="d-flex avatar-xs align-items-center justify-content-center fs-16">
              <span>
                <IconifyIcon icon="ri:facebook-fill" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-danger" className="d-flex avatar-xs align-items-center justify-content-center fs-16">
              <span>
                <IconifyIcon icon="ri:instagram-line" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-info" className="d-flex avatar-xs align-items-center justify-content-center fs-16">
              <span>
                <IconifyIcon icon="ri:twitter-line" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-success" className="d-flex avatar-xs align-items-center justify-content-center fs-16">
              <span>
                <IconifyIcon icon="ri:whatsapp-line" />
              </span>
            </Button>
          </li>
          <li className="list-inline-item">
            <Button variant="soft-warning" className="d-flex avatar-xs align-items-center justify-content-center fs-16">
              <span>
                <IconifyIcon icon="ri:mail-line" />
              </span>
            </Button>
          </li>
        </ul>
      </Card.Body>
      <Card.Footer className="border-top">
        <Row className="g-2">
          <Col lg={6}>
            <Button variant="primary" className="w-100 btn-sm">
              <IconifyIcon icon="solar:outgoing-call-rounded-broken" className="align-middle fs-16" /> Call Us
            </Button>
          </Col>
          <Col lg={6}>
            <Button variant="light" className="w-100 btn-sm">
              <IconifyIcon icon="solar:chat-round-dots-broken" className="align-middle fs-14" /> Message
            </Button>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  )
}

const AgencyData = () => {
  const { data: agencies = [], isLoading, error } = useListAgenciesDirectory()
  const deleteAgency = useDeleteAgencyDirectory()
  const [currentPage, setCurrentPage] = useState(1)
  const agenciesPerPage = 6 // 3 columns x 2 rows per page

  // Calculate pagination
  const totalPages = Math.ceil(agencies.length / agenciesPerPage)
  const startIndex = (currentPage - 1) * agenciesPerPage
  const endIndex = startIndex + agenciesPerPage
  const currentAgencies = agencies.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDeleteAgency = async (agencyId: string) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      try {
        await deleteAgency.mutateAsync(agencyId)
        // The list will automatically refresh due to React Query cache invalidation
      } catch (error) {
        console.error('Failed to delete agency:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div>Loading agencies...</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="text-danger">Error loading agencies</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  }

  return (
    <>
      <Row className="g-4">
        {agencies.length === 0 ? (
          <Col xl={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <IconifyIcon icon="ri:building-4-line" className="fs-48 text-muted mb-3" />
                <h5 className="text-muted">No agencies found</h5>
                <p className="text-muted">Start by adding agencies to your system.</p>
                <Link href="/agency/add" className="btn btn-primary">
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  Add First Agency
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          currentAgencies.map((agency: any, idx: number) => (
            <Col xl={4} lg={6} key={agency.id || idx} className="mb-4">
              <AgencyCard agency={agency} onDelete={handleDeleteAgency} />
            </Col>
          ))
        )}
      </Row>
      
      {/* Pagination */}
      {agencies.length > agenciesPerPage && (
        <div className="p-3 border-top">
          <nav aria-label="Agency pagination">
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                return (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}

export default AgencyData
