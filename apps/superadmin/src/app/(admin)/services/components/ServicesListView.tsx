"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListServices } from "@/hooks/useServices";
import Link from "next/link";
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
} from "react-bootstrap";
import ServicesStats from "./ServicesStats";
import ServicesTable from "./ServicesTable";

const ServicesListView = () => {
  const { data: services = [], isLoading, isError } = useListServices();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading services...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error loading services</h4>
        <p>There was an error loading the services. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <ServicesStats services={services} serviceRequests={[]} />
      
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"}>All Services</CardTitle>
              </div>
              <div className="d-flex gap-2">
                <Link href="/services/add" className="btn btn-primary btn-sm">
                  <IconifyIcon icon="solar:add-circle-broken" className="me-1" />
                  Add Service
                </Link>
                <Dropdown>
                  <DropdownToggle
                    as={"a"}
                    className="btn btn-sm btn-outline-light rounded content-none icons-center"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    This Month{" "}
                    <IconifyIcon
                      className="ms-1"
                      width={16}
                      height={16}
                      icon="ri:arrow-down-s-line"
                    />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    <DropdownItem>Download</DropdownItem>
                    <DropdownItem>Export</DropdownItem>
                    <DropdownItem>Import</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <ServicesTable services={services} requestCounts={{}} />
            </CardBody>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li key="prev" className="page-item">
                    <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
                      Previous
                    </a>
                  </li>
                  <li key="page-1" className="page-item active">
                    <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
                      1
                    </a>
                  </li>
                  <li key="page-2" className="page-item">
                    <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
                      2
                    </a>
                  </li>
                  <li key="page-3" className="page-item">
                    <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
                      3
                    </a>
                  </li>
                  <li key="next" className="page-item">
                    <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ServicesListView;
