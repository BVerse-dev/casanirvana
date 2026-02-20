'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardHeader, Col, Row } from 'react-bootstrap'
import ServiceData from './components/ServiceData'
import ServiceGridCard from './components/ServiceGridCard'
import ServicesWithPagination from './components/ServicesWithPagination'
import { useState, useEffect } from 'react'
import { useListServices } from '@/hooks/useServices'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const ServicesPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const { data: services = [], isLoading, error } = useListServices()
  const queryClient = useQueryClient()
  
  const itemsPerPage = 6
  const totalServices = services.length
  const totalPages = Math.ceil(totalServices / itemsPerPage)

  // Real-time subscription for services updates
  useEffect(() => {
    const channel = supabase
      .channel('public:services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Calculate pagination info
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalServices)

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Services Management" />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading services...</span>
            </div>
            <p className="mt-2 text-muted">Loading services...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageTitle subName="Casa Nirvana" title="Services Management" />
        <div className="alert alert-danger text-center" role="alert">
          <IconifyIcon icon="solar:danger-triangle-bold" className="fs-48 mb-3 text-danger" />
          <h4 className="alert-heading">Error loading services</h4>
          <p>There was an error loading the services. Please try refreshing the page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle subName="Casa Nirvana" title="Services Management" />
      <ServiceGridCard />
      <Row>
        <Col lg={12}>
          <Card className="bg-body shadow-none">
            <CardHeader className="border-0">
              <Row className="justify-content-between align-items-center">
                <Col lg={6}>
                  <p className="mb-0 text-muted">
                    Total Services: <span className="text-dark fw-semibold">{totalServices}</span>
                  </p>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <button type="button" className="btn btn-outline-primary me-1">
                      <IconifyIcon icon="ri:settings-2-line" className="me-1" />
                      More Setting
                    </button>
                    <button type="button" className="btn btn-outline-primary me-1">
                      <IconifyIcon icon="ri:filter-line" className="me-1" /> Filters
                    </button>
                    <Link href="/services/add" className="btn btn-success me-1">
                      <IconifyIcon icon="ri-add-line" /> New Service
                    </Link>
                  </div>
                </Col>
              </Row>
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <ServiceData currentPage={currentPage} />
      
      {/* Pagination Section with thin line */}
      <Row className="mt-4">
        <Col lg={12}>
          <Card className="bg-body shadow-none">
            <div className="p-3 border-top">
              <Row className="justify-content-between align-items-center">
                <Col lg={6}>
                  <p className="mb-0 text-muted">
                    Showing <span className="text-dark fw-semibold">{startItem}-{endItem}</span> of <span className="text-dark fw-semibold">{totalServices}</span> Services
                  </p>
                </Col>
                <Col lg={6}>
                  <nav aria-label="Page navigation example">
                    <ul className="pagination justify-content-end mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <Link 
                          className="page-link" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePrevious()
                          }}
                        >
                          Previous
                        </Link>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <Link 
                            className="page-link" 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(page)
                            }}
                          >
                            {page}
                          </Link>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <Link 
                          className="page-link" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleNext()
                          }}
                        >
                          Next
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ServicesPage
