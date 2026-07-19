'use client'

import Link from 'next/link'
import { useState } from 'react'
import ServiceData from './ServiceData'

const ServicesWithPagination = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 2 // We have 9 services, so 2 pages with 6 per page
  
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

  return (
    <>
      <ServiceData currentPage={currentPage} />
      <div className="p-3 border-top">
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
            <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
              <Link 
                className="page-link" 
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(1)
                }}
              >
                1
              </Link>
            </li>
            <li className={`page-item ${currentPage === 2 ? 'active' : ''}`}>
              <Link 
                className="page-link" 
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(2)
                }}
              >
                2
              </Link>
            </li>
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
      </div>
    </>
  )
}

export default ServicesWithPagination
