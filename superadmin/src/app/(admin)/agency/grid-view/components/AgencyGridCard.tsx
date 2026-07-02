'use client'

import homeImg from '@/assets/images/home-2.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from '@/components/ReactBootstrap'
import type { AgencyDirectoryItem } from '@/hooks/useAgencyDirectory'

const formatDate = (value?: string | null) => {
  if (!value) return 'No recent updates'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No recent updates'
  return date.toLocaleDateString()
}

const AgencyGridCard = ({ agencies }: { agencies: AgencyDirectoryItem[] }) => {
  const totalAgencies = agencies.length
  const activeAgencies = agencies.filter((agency) => agency.is_active).length
  const inactiveAgencies = totalAgencies - activeAgencies
  const totalCommunities = agencies.reduce((total, agency) => total + (agency.managed_societies || 0), 0)
  const agenciesWithWebsite = agencies.filter((agency) => agency.website).length
  const agenciesWithEmail = agencies.filter((agency) => agency.email).length
  const averageCommunitiesPerAgency = totalAgencies > 0 ? (totalCommunities / totalAgencies).toFixed(1) : '0.0'
  const lastUpdated = agencies
    .map((agency) => agency.updated_at || agency.created_at)
    .filter(Boolean)
    .sort()
    .reverse()[0]

  return (
    <Row>
      <Col xl={6} lg={12}>
        <Card>
          <CardBody>
            <Row className="align-items-center g-4">
              <Col lg={7}>
                <h4 className="text-dark mb-1">Agency portfolio snapshot</h4>
                <p className="fs-14 text-muted mb-4">Live overview of the agencies currently available in the directory.</p>
                <Row className="g-3">
                  <Col sm={4}>
                    <div className="border rounded-3 p-3 h-100">
                      <p className="text-muted mb-1">Total agencies</p>
                      <h3 className="mb-0">{totalAgencies}</h3>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="border rounded-3 p-3 h-100">
                      <p className="text-muted mb-1">Active agencies</p>
                      <h3 className="mb-0 text-success">{activeAgencies}</h3>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="border rounded-3 p-3 h-100">
                      <p className="text-muted mb-1">Communities managed</p>
                      <h3 className="mb-0 text-primary">{totalCommunities}</h3>
                    </div>
                  </Col>
                </Row>
                <p className="text-muted mb-0 mt-3 d-flex align-items-center gap-1">
                  Last updated <span>:</span> <span className="text-dark">{formatDate(lastUpdated)}</span>
                </p>
              </Col>
              <Col lg={5} className="text-end">
                <Image src={homeImg} alt="home" className="img-fluid" />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>

      <Col xl={3} lg={6}>
        <Card>
          <CardHeader className="border-bottom border-dashed">
            <CardTitle as={'h4'} className="mb-0">
              Coverage Snapshot
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              <Col xs={6}>
                <div className="border rounded-3 p-3 text-center h-100">
                  <h4 className="mb-1">{averageCommunitiesPerAgency}</h4>
                  <p className="text-muted mb-0 small">Avg communities / agency</p>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 text-center h-100">
                  <h4 className="mb-1">{inactiveAgencies}</h4>
                  <p className="text-muted mb-0 small">Inactive agencies</p>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 text-center h-100">
                  <h4 className="mb-1">{agenciesWithWebsite}</h4>
                  <p className="text-muted mb-0 small">Websites configured</p>
                </div>
              </Col>
              <Col xs={6}>
                <div className="border rounded-3 p-3 text-center h-100">
                  <h4 className="mb-1">{agenciesWithEmail}</h4>
                  <p className="text-muted mb-0 small">Email contacts set</p>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="py-2">
            <p className="text-muted mb-0 d-flex align-items-center gap-1">
              Review incomplete records before production onboarding.
            </p>
          </CardFooter>
        </Card>
      </Col>

      <Col xl={3} lg={6}>
        <Card className="bg-primary bg-gradient">
          <CardBody>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <CardTitle as={'h4'} className="mb-2 text-white">
                  Directory Health
                </CardTitle>
                <p className="text-white fw-medium fs-24 mb-0">{Math.round(totalAgencies > 0 ? (activeAgencies / totalAgencies) * 100 : 0)}%</p>
              </div>
              <div className="avatar-md bg-light rounded flex-centered">
                <IconifyIcon icon="ri:building-4-line" width={32} height={32} className="fs-32 text-primary" />
              </div>
            </div>
            <div className="d-flex flex-column gap-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <span>Active agencies</span>
                <strong>{activeAgencies}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Inactive agencies</span>
                <strong>{inactiveAgencies}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Communities covered</span>
                <strong>{totalCommunities}</strong>
              </div>
            </div>
          </CardBody>
          <CardFooter className="border-0 pt-0 bg-transparent">
            <Link href="/agency/list-view" className="btn btn-light w-100">
              View directory
            </Link>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default AgencyGridCard
