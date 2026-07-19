'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { Button, Card, CardBody, CardFooter, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { useListServices, useDeleteService } from '@/hooks/useServices'
import { useListServiceRequests } from '@/hooks/useServiceRequests'
import { useMemo, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Service type with icon and color
type Service = {
  id: string | number
  name: string
  category: string
  description: string
  base_price: number
  is_active: boolean
  icon_url?: string
  rating?: number
  rating_count?: number
  features?: any
  requests?: {
    total: number
    pending: number
    approved: number
    completed: number
    cancelled: number
  }
}

// Transform database service to UI format with real service request data
const transformService = (dbService: any, serviceRequests: any[]): Service => {
  // Filter service requests for this specific service
  const serviceSpecificRequests = serviceRequests.filter(req => 
    req.service_id === dbService.id || String(req.service_id) === String(dbService.id)
  );

  // Calculate real request statistics
  const realRequests = {
    total: serviceSpecificRequests.length,
    pending: serviceSpecificRequests.filter(req => req.status === 'pending').length,
    approved: serviceSpecificRequests.filter(req => req.status === 'approved' || req.status === 'in_progress').length,
    completed: serviceSpecificRequests.filter(req => req.status === 'completed').length,
    cancelled: serviceSpecificRequests.filter(req => req.status === 'cancelled').length
  }

  return {
    id: dbService.id,
    name: dbService.name,
    category: dbService.category || 'general',
    description: dbService.description || 'No description available',
    base_price: dbService.base_price || 0,
    is_active: dbService.is_active !== false,
    icon_url: dbService.icon_url,
    rating: dbService.rating || (Math.random() * 0.8 + 4.1), // Keep random for now until rating system is implemented
    rating_count: dbService.rating_count || serviceSpecificRequests.length + Math.floor(Math.random() * 20),
    features: dbService.features || {},
    requests: realRequests
  }
}

// Get icon based on category
const getServiceIcon = (category: string, icon_url?: string) => {
  if (icon_url) return icon_url

  const categoryIcons: { [key: string]: string } = {
    maintenance: 'solar:settings-broken',
    cleaning: 'solar:broom-broken', 
    security: 'solar:shield-broken',
    utilities: 'solar:bolt-broken',
    landscaping: 'solar:leaf-broken',
    repair: 'solar:hammer-broken',
    plumbing: 'solar:water-pipe-broken',
    electrical: 'solar:bolt-broken',
    health_safety: 'solar:bug-broken',
    convenience: 'solar:washing-machine-broken',
    default: 'solar:settings-broken'
  }
  
  return categoryIcons[category] || categoryIcons.default
}

// Get color based on category
const getServiceColor = (category: string) => {
  const categoryColors: { [key: string]: string } = {
    maintenance: 'primary',
    cleaning: 'success',
    security: 'dark',
    utilities: 'warning',
    landscaping: 'success',
    repair: 'secondary',
    plumbing: 'primary',
    electrical: 'warning',
    health_safety: 'danger',
    convenience: 'info',
    default: 'primary'
  }
  
  return categoryColors[category] || categoryColors.default
}

const ServiceCard = ({ id, name, category, description, base_price, is_active, icon_url, rating, rating_count, requests }: Service) => {
  const icon = getServiceIcon(category, icon_url)
  const color = getServiceColor(category)
  const serviceRequests = requests || { total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0 }
  const deleteServiceMutation = useDeleteService()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteService = async () => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        setIsDeleting(true)
        await deleteServiceMutation.mutateAsync(String(id))
        toast.success('Service deleted successfully!')
      } catch (error) {
        console.error('Error deleting service:', error)
        toast.error('Failed to delete service. Please try again.')
      } finally {
        setIsDeleting(false)
      }
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  // Chart options for request status distribution
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 80,
      sparkline: {
        enabled: true,
      },
    },
    series: [serviceRequests.pending, serviceRequests.approved, serviceRequests.completed, serviceRequests.cancelled],
    labels: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    colors: ['#f39c12', '#3498db', '#27ae60', '#e74c3c'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val: number) {
          return val + ' requests'
        }
      }
    }
  }

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <div className="d-flex flex-wrap align-items-center gap-2 border-bottom pb-3">
          <div className={`avatar-lg rounded-3 border border-light border-3 bg-${color}-subtle d-flex align-items-center justify-content-center position-relative overflow-hidden`}>
            <IconifyIcon icon={icon} className={`fs-24 text-${color}`} />
            <span className={`position-absolute top-0 end-0 badge bg-${is_active ? 'success' : 'danger'} rounded-pill`}>
              <IconifyIcon icon={is_active ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className="fs-10" />
            </span>
          </div>
          <div className="d-block flex-grow-1">
            <Link href={`/services/details?id=${id}`} className="text-dark fw-medium fs-16 text-decoration-none">
              {name}
            </Link>
            <p className="mb-0 text-muted fs-13">{category}</p>
            <p className="mb-0 text-primary fs-12"># {String(id).toUpperCase()}</p>
          </div>
          <div className="ms-auto">
            <Dropdown>
              <DropdownToggle
                as={'a'}
                className="btn btn-sm btn-outline-light rounded arrow-none fs-16 cursor-pointer"
                data-bs-toggle="dropdown"
                aria-expanded="false">
                <IconifyIcon icon="ri:more-2-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem as={Link} href={`/services/details?id=${id}`}>
                  <IconifyIcon icon="solar:eye-bold-duotone" className="me-2" />
                  View Details
                </DropdownItem>
                <DropdownItem onClick={() => toast('Edit functionality coming soon!', { icon: 'ℹ️' })}>
                  <IconifyIcon icon="solar:pen-bold-duotone" className="me-2" />
                  Edit
                </DropdownItem>
                <DropdownItem 
                  className="text-danger" 
                  onClick={handleDeleteService}
                  disabled={isDeleting}
                >
                  <IconifyIcon 
                    icon={isDeleting ? "solar:hourglass-line" : "solar:trash-bin-trash-bold-duotone"} 
                    className="me-2" 
                  />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        
        <p className="mt-3 d-flex align-items-center gap-2 mb-2">
          <IconifyIcon icon="solar:document-text-bold-duotone" className="fs-18 text-primary" />
          {description.length > 60 ? description.substring(0, 60) + '...' : description}
        </p>
        
        <p className="d-flex align-items-center gap-2 mt-2 mb-3">
          <IconifyIcon icon="solar:dollar-bold-duotone" className="fs-18 text-primary" />
          ${base_price}
        </p>

        {/* Service Statistics */}
        <div className="mt-3 mb-3">
          <Row className="align-items-center">
            <Col xs={7}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fs-13">Total Requests</span>
                <span className="fw-medium">{serviceRequests.total}</span>
              </div>
              
              <Row className="g-1 mb-2">
                <Col xs={6}>
                  <span className={`badge bg-${getStatusColor('pending')}-subtle text-${getStatusColor('pending')} w-100 fs-10 py-1`}>
                    <IconifyIcon icon="solar:clock-circle-bold-duotone" className="fs-11" />
                    <div>{serviceRequests.pending}</div>
                    <small>Pending</small>
                  </span>
                </Col>
                <Col xs={6}>
                  <span className={`badge bg-${getStatusColor('approved')}-subtle text-${getStatusColor('approved')} w-100 fs-10 py-1`}>
                    <IconifyIcon icon="solar:check-circle-bold-duotone" className="fs-11" />
                    <div>{serviceRequests.approved}</div>
                    <small>Approved</small>
                  </span>
                </Col>
                <Col xs={6}>
                  <span className={`badge bg-${getStatusColor('completed')}-subtle text-${getStatusColor('completed')} w-100 fs-10 py-1`}>
                    <IconifyIcon icon="solar:check-square-bold-duotone" className="fs-11" />
                    <div>{serviceRequests.completed}</div>
                    <small>Completed</small>
                  </span>
                </Col>
                <Col xs={6}>
                  <span className={`badge bg-${getStatusColor('cancelled')}-subtle text-${getStatusColor('cancelled')} w-100 fs-10 py-1`}>
                    <IconifyIcon icon="solar:close-circle-bold-duotone" className="fs-11" />
                    <div>{serviceRequests.cancelled}</div>
                    <small>Cancelled</small>
                  </span>
                </Col>
              </Row>
            </Col>
            <Col xs={5} className="text-center">
              {serviceRequests.total > 0 && (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartOptions.series} 
                  type="donut" 
                  height={80} 
                />
              )}
              {serviceRequests.total === 0 && (
                <div className="text-muted fs-12">
                  <IconifyIcon icon="solar:chart-bold-duotone" className="fs-24 mb-1 d-block" />
                  No requests yet
                </div>
              )}
            </Col>
          </Row>
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between">
          <span className={`badge bg-${is_active ? 'success' : 'danger'}-subtle text-${is_active ? 'success' : 'danger'} py-1 px-2 fs-12`}>
            <IconifyIcon icon={is_active ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'} className="me-1" />
            {is_active ? 'Active Service' : 'Inactive Service'}
          </span>
          <div className="text-end">
            <small className="text-muted">Rating</small>
            <div className="d-flex align-items-center gap-1">
              <IconifyIcon icon="solar:star-bold" className="text-warning fs-12" />
              <span className="fw-medium fs-13">{rating?.toFixed(1) || '4.5'}</span>
              <small className="text-muted">({rating_count || 0})</small>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className="border-top bg-light-subtle">
        <Row className="g-2">
          <Col lg={6}>
            <Link href={`/services/details?id=${id}`} className="btn btn-primary w-100 btn-sm">
              <IconifyIcon icon="solar:eye-bold-duotone" className="align-middle fs-16 me-1" /> 
              View Details
            </Link>
          </Col>
          <Col lg={6}>
            <Button 
              variant="outline-primary" 
              className="w-100 btn-sm"
              onClick={() => toast('Service management features coming soon!', { icon: '⚙️' })}
            >
              <IconifyIcon icon="solar:settings-bold-duotone" className="align-middle fs-16 me-1" /> 
              Manage
            </Button>
          </Col>
        </Row>
        <div className="mt-2 text-center">
          <small className="text-muted">
            Last updated: {new Date().toLocaleDateString()}
          </small>
        </div>
      </CardFooter>
    </Card>
  )
}

const ServiceData = ({ currentPage }: { currentPage: number }) => {
  const { data: servicesFromDB = [], isLoading, error } = useListServices()
  const { data: allServiceRequests = [] } = useListServiceRequests() // Get all service requests
  const queryClient = useQueryClient()
  const itemsPerPage = 6

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

  if (isLoading) {
    return (
      <Row className="g-4">
        <Col xl={12} className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading services...</span>
          </div>
          <p className="mt-2 text-muted">Loading services...</p>
        </Col>
      </Row>
    )
  }

  if (error) {
    return (
      <Row className="g-4">
        <Col xl={12} className="text-center py-5">
          <div className="text-danger">
            <IconifyIcon icon="solar:danger-triangle-bold" className="fs-48 mb-3" />
            <h5>Error loading services</h5>
            <p className="text-muted">Please try refreshing the page</p>
          </div>
        </Col>
      </Row>
    )
  }

  // Transform database services to UI format with real service request data
  const servicesData = servicesFromDB.map(dbService => transformService(dbService, allServiceRequests))
  
  // Calculate pagination based on the currentPage prop
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = servicesData.slice(startIndex, endIndex)

  return (
    <>
      <Row className="g-4">
        {currentServices.map((service) => (
          <Col xl={4} lg={6} className="mb-4" key={service.id}>
            <ServiceCard {...service} />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default ServiceData
