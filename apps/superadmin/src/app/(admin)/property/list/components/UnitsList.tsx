"use client";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListUnits, useDeleteUnit } from "@/hooks/useUnits";
import { mapUnitToPropertyImage } from "@/utils/propertyImageMapper";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "react-bootstrap";

interface UnitsListProps {
  viewMode: "grid" | "list";
  onViewModeChange: (view: "grid" | "list") => void;
}

const UnitsList = ({ viewMode, onViewModeChange }: UnitsListProps) => {
  const searchParams = useSearchParams();
  const communityId = searchParams.get('communityId');

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const pageSize = 9;

  const { data: unitsResponse, isLoading, error } = useListUnits({
    page: currentPage,
    pageSize,
    communityId: communityId || undefined,
  });
  const units = unitsResponse?.data || [];
  const totalPages = unitsResponse?.totalPages || 1;
  const totalCount = unitsResponse?.count || 0;

  const deleteUnitMutation = useDeleteUnit();

  if (isLoading) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={"h4"}>Loading Units...</CardTitle>
            </CardHeader>
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  if (error) {
    return (
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <CardTitle as={"h4"}>Error</CardTitle>
            </CardHeader>
            <div className="alert alert-danger m-3" role="alert">
              Error loading units: {error.message}
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "occupied":
        return { variant: "success", text: "Occupied" };
      case "vacant":
        return { variant: "primary", text: "Vacant" };
      case "maintenance":
        return { variant: "warning", text: "Maintenance" };
      default:
        return { variant: "secondary", text: status };
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnits(units.map(unit => unit.id));
    } else {
      setSelectedUnits([]);
    }
  };

  const handleSelectUnit = (unitId: string, checked: boolean) => {
    if (checked) {
      setSelectedUnits(prev => [...prev, unitId]);
    } else {
      setSelectedUnits(prev => prev.filter(id => id !== unitId));
    }
  };

  const handleDeleteClick = (unitId: string) => {
    setUnitToDelete(unitId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (unitToDelete) {
      try {
        await deleteUnitMutation.mutateAsync(unitToDelete);
        setShowDeleteModal(false);
        setUnitToDelete(null);
        // Remove from selected if it was selected
        setSelectedUnits(prev => prev.filter(id => id !== unitToDelete));
      } catch (error) {
        console.error("Error deleting unit:", error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ["Unit Number", "Area", "Type", "Status", "Floor", "Community", "Rent Amount"];
    const csvContent = [
      headers.join(","),
      ...units.map(unit => [
        unit.unit_number,
        unit.area,
        unit.type,
        unit.status,
        unit.floor,
        unit.communities?.name || "N/A",
        unit.rent_amount || "N/A"
      ].join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `units-page-${currentPage}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </li>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </li>
    );

    return pages;
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <div>
                <CardTitle as={"h4"} className="mb-0">
                  All Units List
                </CardTitle>
                <small className="text-muted">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} units
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="btn-group" role="group" aria-label="Directory view">
                  <Button variant={viewMode === "grid" ? "primary" : "outline-primary"} size="sm" onClick={() => onViewModeChange("grid")} aria-label="Grid view" aria-pressed={viewMode === "grid"}><IconifyIcon icon="ri:grid-line" /></Button>
                  <Button variant={viewMode === "list" ? "primary" : "outline-primary"} size="sm" onClick={() => onViewModeChange("list")} aria-label="List view" aria-pressed={viewMode === "list"}><IconifyIcon icon="ri:list-check" /></Button>
                </div>
                <Link href="/units/add" className="btn btn-sm btn-primary"><IconifyIcon icon="ri:add-line" className="me-1" />Add Unit</Link>
                <Dropdown>
                <DropdownToggle
                  as={"a"}
                  className="btn btn-sm btn-outline-light rounded content-none icons-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Actions{" "}
                  <IconifyIcon
                    className="ms-1"
                    width={16}
                    height={16}
                    icon="ri:arrow-down-s-line"
                  />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem onClick={handleExport}>
                    <IconifyIcon icon="ri:download-line" className="me-2" />
                    Export CSV
                  </DropdownItem>
                  <DropdownItem disabled>
                    <IconifyIcon icon="ri:file-excel-line" className="me-2" />
                    Export Excel
                  </DropdownItem>
                  <DropdownItem disabled>
                    <IconifyIcon icon="ri:upload-line" className="me-2" />
                    Import Data
                  </DropdownItem>
                </DropdownMenu>
                </Dropdown>
              </div>
            </CardHeader>
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
                          checked={selectedUnits.length === units.length && units.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="customCheck1"
                        />
                      </div>
                    </th>
                    <th>Unit Photo &amp; Number</th>
                    <th>Area</th>
                    <th>Unit Type</th>
                    <th>Status</th>
                    <th>Floor</th>
                    <th>Community</th>
                    <th>Rent Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {units?.map((unit) => {
                    const statusBadge = getStatusBadge(unit.status || "");
                    const isSelected = selectedUnits.includes(unit.id);
                    return (
                      <tr key={unit.id}>
                        <td>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`check-${unit.id}`}
                              checked={isSelected}
                              onChange={(e) => handleSelectUnit(unit.id, e.target.checked)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`check-${unit.id}`}
                            >
                              &nbsp;
                            </label>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div>
                              <Image
                                src={mapUnitToPropertyImage(unit)}
                                alt="unit"
                                className="avatar-md rounded border border-light border-3"
                                width={50}
                                height={50}
                              />
                            </div>
                            <div>
                              <Link
                                href={`/units/${unit.id}`}
                                className="text-dark fw-medium fs-15"
                              >
                                Unit {unit.unit_number}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td>{unit.area} sq ft</td>
                        <td>{unit.type?.toUpperCase()}</td>
                        <td>
                          <span
                            className={`badge bg-${statusBadge.variant}-subtle text-${statusBadge.variant} py-1 px-2 fs-13`}
                          >
                            {statusBadge.text}
                          </span>
                        </td>
                        <td>
                          <p className="mb-0">
                            <IconifyIcon
                              icon="solar:double-alt-arrow-up-broken"
                              className="align-middle fs-16"
                            />{" "}
                            Floor {unit.floor}
                          </p>
                        </td>
                        <td>{unit.communities?.name || "N/A"}</td>
                        <td>GH₵ {unit.rent_amount?.toLocaleString() || "N/A"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/units/${unit.id}`}>
                              <Button variant="light" size="sm" title="View Details">
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                            </Link>
                            <Link href={`/units/${unit.id}/edit`}>
                              <Button variant="soft-primary" size="sm" title="Edit Unit"><IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" /></Button>
                            </Link>
                            <Button
                              variant="soft-danger"
                              size="sm"
                              title="Delete Unit"
                              onClick={() => handleDeleteClick(unit.id)}
                              disabled={deleteUnitMutation.isPending}
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
            <CardFooter>
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  {renderPagination()}
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <ModalHeader closeButton>
          <ModalTitle>Confirm Delete</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteUnitMutation.isPending}
          >
            {deleteUnitMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UnitsList;
