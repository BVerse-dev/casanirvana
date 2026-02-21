"use client";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  useDeleteMaintenanceRequest,
  useListMaintenanceRequests,
  useUpdateMaintenanceRequestById,
} from "@/hooks/useMaintenanceRequests";
import { Database } from "@/lib/database.types";
import { mapAvatarUrl } from "@/utils/avatarMapper";
import Image from "next/image";
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
import MaintenanceRequestGridCard from "./components/MaintenanceRequestGridCard";

type MaintenanceWithProfiles =
  Database["public"]["Tables"]["maintenance_requests"]["Row"] & {
    requester_profile?: Database["public"]["Tables"]["profiles"]["Row"];
    unit?: Database["public"]["Tables"]["units"]["Row"];
  };

const MaintenanceRequestsPage = () => {
  const { data: maintenanceRequests = [], isLoading } =
    useListMaintenanceRequests();
  const updateMaintenanceRequestById = useUpdateMaintenanceRequestById();
  const deleteMaintenanceRequest = useDeleteMaintenanceRequest();

  const handleToggleCompletion = async (
    request: MaintenanceWithProfiles,
  ) => {
    const newStatus = request.status === "completed" ? "pending" : "completed";

    try {
      await updateMaintenanceRequestById.mutateAsync({
        id: request.id,
        updates: {
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === "completed" && {
            completed_at: new Date().toISOString(),
            resolved_at: new Date().toISOString(),
          }),
          ...(newStatus !== "completed" && {
            completed_at: null,
            resolved_at: null,
          }),
        },
      });
    } catch (error) {
      console.error("Failed to update maintenance status:", error);
    }
  };

  const handleDelete = async (request: MaintenanceWithProfiles) => {
    const shouldDelete = window.confirm(
      `Delete maintenance request #${request.id}? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    try {
      await deleteMaintenanceRequest.mutateAsync(request.id);
    } catch (error) {
      console.error("Failed to delete maintenance request:", error);
    }
  };

  if (isLoading) {
    return <div>Loading maintenance requests...</div>;
  }

  return (
    <>
      <PageTitle title="Maintenance Requests" subName="Casa Nirvana" />
      <MaintenanceRequestGridCard />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"}>All Maintenance Requests</CardTitle>
              </div>
              <Dropdown>
                <DropdownToggle
                  as={"a"}
                  className=" btn btn-sm btn-outline-light rounded content-none icons-center"
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
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="customCheck1"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="customCheck1"
                          />
                        </div>
                      </th>
                      <th>Requester &amp; Unit</th>
                      <th>Request Date</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRequests.map((request) => {
                      return (
                        <tr key={request.id}>
                          <td>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`customCheck${request.id}`}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`customCheck${request.id}`}
                              >
                                &nbsp;
                              </label>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div>
                                {(() => {
                                  const avatarImage = mapAvatarUrl(request.requester_profile?.avatar_url);
                                  return avatarImage ? (
                                    <Image
                                      src={avatarImage}
                                      alt="avatar"
                                      width={40}
                                      height={40}
                                      className="avatar-sm rounded-circle"
                                    />
                                  ) : (
                                    <div className="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center">
                                      <IconifyIcon icon="ri:user-line" className="fs-16 text-muted" />
                                    </div>
                                  );
                                })()}
                              </div>
                              <div>
                                <Link
                                  href={`/maintenance-requests/${request.id}`}
                                  className="text-dark fw-medium fs-15"
                                >
                                  {request.requester_profile?.full_name ||
                                    "Unknown"}
                                </Link>
                                <p className="text-muted mb-0 fs-13">
                                  Unit: {request.unit?.unit_number || request.unit?.number || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            {request.created_at 
                              ? new Date(request.created_at).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>{request.request_type}</td>
                          <td>
                            <span
                              className={`badge bg-${request.priority === "high" ? "danger" : request.priority === "medium" ? "warning" : "info"} text-white fs-11`}
                            >
                              {request.priority}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                request.status === "pending"
                                  ? "warning"
                                  : request.status === "in_progress"
                                    ? "info"
                                    : request.status === "completed"
                                      ? "success"
                                      : "danger"
                              } text-white fs-11`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td>{request.description?.substring(0, 50) || "No description"}...</td>
                          <td>
                            {request.estimated_cost
                              ? `$${request.estimated_cost}`
                              : "TBD"}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                as={Link}
                                href={`/maintenance-requests/${request.id}`}
                                variant="light"
                                size="sm"
                              >
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant={
                                  request.status === "completed"
                                    ? "soft-warning"
                                    : "soft-success"
                                }
                                size="sm"
                                onClick={() => handleToggleCompletion(request)}
                                disabled={updateMaintenanceRequestById.isPending}
                                title={
                                  request.status === "completed"
                                    ? "Reopen Request"
                                    : "Mark Completed"
                                }
                              >
                                <IconifyIcon
                                  icon={
                                    request.status === "completed"
                                      ? "solar:refresh-broken"
                                      : "solar:check-read-broken"
                                  }
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDelete(request)}
                                disabled={deleteMaintenanceRequest.isPending}
                                title="Delete Request"
                              >
                                <IconifyIcon
                                  icon="solar:trash-bin-minimalistic-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li key="prev" className="page-item">
                    <Link className="page-link" href="">
                      Previous
                    </Link>
                  </li>
                  <li key="page-1" className="page-item active">
                    <Link className="page-link" href="">
                      1
                    </Link>
                  </li>
                  <li key="page-2" className="page-item">
                    <Link className="page-link" href="">
                      2
                    </Link>
                  </li>
                  <li key="page-3" className="page-item">
                    <Link className="page-link" href="">
                      3
                    </Link>
                  </li>
                  <li key="next" className="page-item">
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
    </>
  );
};

export default MaintenanceRequestsPage;
