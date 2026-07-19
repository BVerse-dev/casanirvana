"use client";
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useListAgencies } from '@/hooks/useAgencies'
import Image from 'next/image'
import Link from 'next/link'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap'

const AgencyList = () => {
  const { data: agencies = [], isLoading } = useListAgencies();

  if (isLoading) {
    return <div>Loading agencies...</div>;
  }

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
            <div>
              <CardTitle as={'h4'}>All Agency List</CardTitle>
            </div>
            <Dropdown>
              <DropdownToggle
                as={'a'}
                className=" btn btn-sm btn-outline-light rounded content-none icons-center"
                data-bs-toggle="dropdown"
                aria-expanded="false">
                This Month <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>Download</DropdownItem>
                <DropdownItem>Export</DropdownItem>
                <DropdownItem>Import</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Agency Name</th>
                    <th>Address</th>
                    <th>Description</th>
                    <th>Date Created</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.slice(0, 8).map((agency: any, idx: number) => (
                    <tr key={agency.id || idx}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div>
                            <Link href={`/agency/details?id=${agency.id}`} className="text-dark fw-medium fs-15">
                              {agency.name || 'Agency Name'}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>{agency.address || 'Not specified'}</td>
                      <td>{agency.description || 'No description available'}</td>
                      <td>{agency.created_at ? new Date(agency.created_at).toLocaleDateString('en-us', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not available'}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success py-1 px-2 fs-13">
                          Active
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button variant="light" size="sm">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Button>
                          <Button variant="soft-primary" size="sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Button>
                          <Button variant="soft-danger" size="sm">
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
          <CardFooter>
            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-end mb-0">
                <li className="page-item">
                  <Link className="page-link" href="">
                    Previous
                  </Link>
                </li>
                <li className="page-item active">
                  <Link className="page-link" href="">
                    1
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="">
                    2
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="">
                    3
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" href="">
                    Next
                  </Link>
                </li>
              </ul>
            </nav>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default AgencyList
