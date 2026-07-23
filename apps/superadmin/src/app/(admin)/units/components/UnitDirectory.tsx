"use client";

import DirectoryToolbar from "@/components/directory/DirectoryToolbar";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useListCommunities } from "@/hooks/useCommunities";
import { useDirectoryView } from "@/hooks/useDirectoryView";
import { useDeleteUnit, useListUnits, type UnitRecord } from "@/hooks/useUnits";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardFooter, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "react-bootstrap";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 12;

const formatLabel = (value?: string | null) => value ? value.replaceAll("_", " ").replaceAll("-", " ") : "Not recorded";
const formatMoney = (value?: number | null) => value == null ? "Not recorded" : `GH₵ ${value.toLocaleString()}`;
const statusVariant = (status?: string | null) => status === "occupied" ? "success" : status === "vacant" ? "primary" : status === "maintenance" ? "warning" : "secondary";

const UnitDirectory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { view, setView } = useDirectoryView("units");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const communityId = searchParams.get("communityId") || "";
  const sort = searchParams.get("sort") || "newest";
  const [searchInput, setSearchInput] = useState(search);
  const [unitToDelete, setUnitToDelete] = useState<UnitRecord | null>(null);
  const deleteUnit = useDeleteUnit();
  const communitiesQuery = useListCommunities({ pageSize: 250 });
  const unitsQuery = useListUnits({ page, pageSize: PAGE_SIZE, communityId, search, status, type });
  const payload = unitsQuery.data;

  const units = useMemo(() => {
    const records = [...(payload?.data || [])];
    records.sort((left, right) => {
      if (sort === "number") return String(left.unit_number || left.number || "").localeCompare(String(right.unit_number || right.number || ""), undefined, { numeric: true });
      if (sort === "rent") return (right.rent_amount || 0) - (left.rent_amount || 0);
      return String(right.created_at || "").localeCompare(String(left.created_at || ""));
    });
    return records;
  }, [payload?.data, sort]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`/units?${params.toString()}`, { scroll: false });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateQuery({ search: searchInput.trim() || null, page: null });
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    try {
      await deleteUnit.mutateAsync(unitToDelete.id);
      toast.success("Unit deleted successfully");
      setUnitToDelete(null);
    } catch {
      toast.error("Unit could not be deleted");
    }
  };

  const unitName = (unit: UnitRecord) => `Unit ${unit.unit_number || unit.number || "Unnumbered"}`;

  return (
    <Card>
      <CardBody>
        <DirectoryToolbar
          title="Unit Directory"
          description={`${payload?.count || 0} units available in your authorized scope.`}
          view={view}
          onViewChange={setView}
          actions={<Link href="/units/add" className="btn btn-primary"><IconifyIcon icon="ri:add-line" className="me-1" />Add Unit</Link>}
        />

        <Form onSubmit={submitSearch} className="row g-2 mb-4" role="search">
          <Col xl={4} lg={6}><Form.Label visuallyHidden>Search units</Form.Label><Form.Control value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search unit number or community" /></Col>
          <Col sm={6} lg={3} xl={2}><Form.Label visuallyHidden>Community</Form.Label><Form.Select value={communityId} onChange={(event) => updateQuery({ communityId: event.target.value || null, page: null })} aria-label="Filter by community"><option value="">All communities</option>{(communitiesQuery.data?.data || []).map((community) => <option key={community.id} value={community.id}>{community.name}</option>)}</Form.Select></Col>
          <Col sm={6} lg={3} xl={2}><Form.Label visuallyHidden>Status</Form.Label><Form.Select value={status} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })} aria-label="Filter by status"><option value="">All statuses</option><option value="vacant">Vacant</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option></Form.Select></Col>
          <Col sm={6} lg={3} xl={2}><Form.Label visuallyHidden>Sort units</Form.Label><Form.Select value={sort} onChange={(event) => updateQuery({ sort: event.target.value, page: null })} aria-label="Sort units"><option value="newest">Newest</option><option value="number">Unit number</option><option value="rent">Highest rent</option></Form.Select></Col>
          <Col sm={6} lg={3} xl={2}><Button type="submit" variant="outline-primary" className="w-100"><IconifyIcon icon="ri:search-line" className="me-1" />Search</Button></Col>
        </Form>

        {unitsQuery.isLoading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" role="status" /><p className="text-muted mt-3 mb-0">Loading units...</p></div>
        ) : unitsQuery.isError ? (
          <Alert variant="danger" className="text-center">Units could not be loaded. Refresh the page or try again.</Alert>
        ) : units.length === 0 ? (
          <div className="text-center py-5"><IconifyIcon icon="solar:home-broken" className="fs-48 text-muted mb-3" /><h5>No units found</h5><p className="text-muted mb-0">Adjust the search or directory filters.</p></div>
        ) : view === "grid" ? (
          <Row className="g-3">
            {units.map((unit) => <Col xl={4} md={6} key={unit.id}><Card className="h-100 border"><CardBody><div className="d-flex align-items-start justify-content-between gap-3 mb-3"><span className="avatar-md rounded bg-primary-subtle text-primary flex-centered"><IconifyIcon icon="solar:home-2-broken" width={28} /></span><Badge bg={statusVariant(unit.status)}>{formatLabel(unit.status)}</Badge></div><h5><Link href={`/units/${unit.id}`} className="text-dark">{unitName(unit)}</Link></h5><p className="text-muted mb-3">{unit.communities?.name || "Community not recorded"}</p><Row className="g-2"><Col xs={6}><div className="border rounded p-2"><small className="text-muted d-block">Type</small>{formatLabel(unit.type)}</div></Col><Col xs={6}><div className="border rounded p-2"><small className="text-muted d-block">Floor</small>{unit.floor ?? "Not recorded"}</div></Col><Col xs={6}><div className="border rounded p-2"><small className="text-muted d-block">Area</small>{unit.area == null ? "Not recorded" : `${unit.area} sq ft`}</div></Col><Col xs={6}><div className="border rounded p-2"><small className="text-muted d-block">Rent</small>{formatMoney(unit.rent_amount)}</div></Col></Row></CardBody><CardFooter className="bg-transparent d-flex gap-2"><Link href={`/units/${unit.id}`} className="btn btn-light btn-sm flex-grow-1">View</Link><Button variant="outline-danger" size="sm" aria-label={`Delete ${unitName(unit)}`} onClick={() => setUnitToDelete(unit)}><IconifyIcon icon="ri:delete-bin-line" /></Button></CardFooter></Card></Col>)}
          </Row>
        ) : (
          <div className="table-responsive"><Table className="table-centered align-middle mb-0"><thead><tr><th>Unit</th><th>Community</th><th>Type</th><th>Floor</th><th>Area</th><th>Rent</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>{units.map((unit) => <tr key={unit.id}><td><Link href={`/units/${unit.id}`} className="text-dark fw-medium">{unitName(unit)}</Link></td><td>{unit.communities?.name || "Not recorded"}</td><td>{formatLabel(unit.type)}</td><td>{unit.floor ?? "Not recorded"}</td><td>{unit.area == null ? "Not recorded" : `${unit.area} sq ft`}</td><td>{formatMoney(unit.rent_amount)}</td><td><Badge bg={statusVariant(unit.status)}>{formatLabel(unit.status)}</Badge></td><td><div className="d-flex justify-content-end gap-2"><Link href={`/units/${unit.id}`} className="btn btn-light btn-sm" aria-label={`View ${unitName(unit)}`}><IconifyIcon icon="ri:eye-line" /></Link><Button variant="outline-danger" size="sm" aria-label={`Delete ${unitName(unit)}`} onClick={() => setUnitToDelete(unit)}><IconifyIcon icon="ri:delete-bin-line" /></Button></div></td></tr>)}</tbody></Table></div>
        )}
      </CardBody>

      {!unitsQuery.isLoading && !unitsQuery.isError && (payload?.totalPages || 0) > 1 && <CardFooter className="d-flex justify-content-between align-items-center"><span className="text-muted">Page {payload?.page} of {payload?.totalPages}</span><div className="d-flex gap-2"><Button variant="light" disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</Button><Button variant="light" disabled={page >= (payload?.totalPages || 1)} onClick={() => updateQuery({ page: String(page + 1) })}>Next</Button></div></CardFooter>}

      <Modal show={Boolean(unitToDelete)} onHide={() => setUnitToDelete(null)} centered><ModalHeader closeButton><h5 className="mb-0">Delete unit</h5></ModalHeader><ModalBody>This will permanently delete <strong>{unitToDelete ? unitName(unitToDelete) : "this unit"}</strong>. Continue only if its resident, billing, visitor, and maintenance records have been handled.</ModalBody><ModalFooter><Button variant="light" onClick={() => setUnitToDelete(null)}>Cancel</Button><Button variant="danger" disabled={deleteUnit.isPending} onClick={confirmDelete}>{deleteUnit.isPending ? "Deleting..." : "Delete unit"}</Button></ModalFooter></Modal>
    </Card>
  );
};

export default UnitDirectory;
