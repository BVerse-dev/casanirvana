"use client";

import DirectoryToolbar from "@/components/directory/DirectoryToolbar";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useDeleteCommunity, useListCommunities, type CommunityRecord } from "@/hooks/useCommunities";
import { useDirectoryView } from "@/hooks/useDirectoryView";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, CardBody, CardFooter, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "react-bootstrap";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 12;

const CommunityDirectory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { view, setView } = useDirectoryView("communities");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "name";
  const [searchInput, setSearchInput] = useState(search);
  const [communityToDelete, setCommunityToDelete] = useState<CommunityRecord | null>(null);
  const deleteCommunity = useDeleteCommunity();
  const query = useListCommunities({ page, pageSize: PAGE_SIZE, search, filters: status ? { status } : undefined });
  const payload = query.data;

  const communities = useMemo(() => {
    const records = [...(payload?.data || [])];
    records.sort((left, right) => {
      if (sort === "newest") return String(right.created_at || "").localeCompare(String(left.created_at || ""));
      if (sort === "units") return (right.unit_count || 0) - (left.unit_count || 0);
      return left.name.localeCompare(right.name);
    });
    return records;
  }, [payload?.data, sort]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`/communities?${params.toString()}`, { scroll: false });
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateQuery({ search: searchInput.trim() || null, page: null });
  };

  const confirmDelete = async () => {
    if (!communityToDelete) return;
    try {
      await deleteCommunity.mutateAsync(communityToDelete.id);
      toast.success("Community deleted successfully");
      setCommunityToDelete(null);
    } catch {
      toast.error("Community could not be deleted");
    }
  };

  return (
    <Card>
      <CardBody>
        <DirectoryToolbar
          title="Community Directory"
          description={`${payload?.count || 0} communities available in your authorized scope.`}
          view={view}
          onViewChange={setView}
          actions={<Link href="/communities/add" className="btn btn-primary"><IconifyIcon icon="ri:add-line" className="me-1" />Add Community</Link>}
        />

        <Form onSubmit={submitSearch} className="row g-2 mb-4" role="search">
          <Col lg={6}>
            <Form.Label visuallyHidden>Search communities</Form.Label>
            <Form.Control value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by community name or address" />
          </Col>
          <Col sm={6} lg={2}>
            <Form.Label visuallyHidden>Status</Form.Label>
            <Form.Select value={status} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Col>
          <Col sm={6} lg={2}>
            <Form.Label visuallyHidden>Sort communities</Form.Label>
            <Form.Select value={sort} onChange={(event) => updateQuery({ sort: event.target.value, page: null })} aria-label="Sort communities">
              <option value="name">Name</option>
              <option value="newest">Newest</option>
              <option value="units">Most units</option>
            </Form.Select>
          </Col>
          <Col lg={2}><Button type="submit" variant="outline-primary" className="w-100"><IconifyIcon icon="ri:search-line" className="me-1" />Search</Button></Col>
        </Form>

        {query.isLoading ? (
          <div className="text-center py-5"><span className="spinner-border text-primary" role="status" /><p className="text-muted mt-3 mb-0">Loading communities...</p></div>
        ) : query.isError ? (
          <Alert variant="danger" className="text-center">Communities could not be loaded. Refresh the page or try again.</Alert>
        ) : communities.length === 0 ? (
          <div className="text-center py-5"><IconifyIcon icon="ri:building-line" className="fs-48 text-muted mb-3" /><h5>No communities found</h5><p className="text-muted mb-0">Adjust the search or status filter.</p></div>
        ) : view === "grid" ? (
          <Row className="g-3">
            {communities.map((community) => (
              <Col xl={4} md={6} key={community.id}>
                <Card className="h-100 border">
                  <CardBody>
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <span className="avatar-md rounded bg-primary-subtle text-primary flex-centered"><IconifyIcon icon="solar:buildings-2-broken" width={28} /></span>
                      <Badge bg={community.status === "inactive" ? "secondary" : "success"}>{(community.status || "unknown").replaceAll("_", " ")}</Badge>
                    </div>
                    <h5><Link href={`/communities/${community.id}`} className="text-dark">{community.name}</Link></h5>
                    <p className="text-muted"><IconifyIcon icon="ri:map-pin-line" className="me-1" />{community.address || "Address not recorded"}</p>
                    <div className="d-flex gap-4"><span><strong>{community.unit_count || 0}</strong><small className="d-block text-muted">Units</small></span><span><strong>{community.occupancy_rate || 0}%</strong><small className="d-block text-muted">Occupancy</small></span></div>
                  </CardBody>
                  <CardFooter className="bg-transparent d-flex gap-2"><Link href={`/communities/${community.id}`} className="btn btn-light btn-sm flex-grow-1">View</Link><Link href={`/communities/${community.id}/edit`} className="btn btn-outline-primary btn-sm">Edit</Link><Button variant="outline-danger" size="sm" aria-label={`Delete ${community.name}`} onClick={() => setCommunityToDelete(community)}><IconifyIcon icon="ri:delete-bin-line" /></Button></CardFooter>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="table-responsive">
            <Table className="table-centered align-middle mb-0">
              <thead><tr><th>Community</th><th>Address</th><th>Units</th><th>Occupancy</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>{communities.map((community) => <tr key={community.id}><td><Link href={`/communities/${community.id}`} className="text-dark fw-medium">{community.name}</Link></td><td>{community.address || "Address not recorded"}</td><td>{community.unit_count || 0}</td><td>{community.occupancy_rate || 0}%</td><td><Badge bg={community.status === "inactive" ? "secondary" : "success"}>{(community.status || "unknown").replaceAll("_", " ")}</Badge></td><td><div className="d-flex justify-content-end gap-2"><Link href={`/communities/${community.id}`} className="btn btn-light btn-sm" aria-label={`View ${community.name}`}><IconifyIcon icon="ri:eye-line" /></Link><Link href={`/communities/${community.id}/edit`} className="btn btn-outline-primary btn-sm" aria-label={`Edit ${community.name}`}><IconifyIcon icon="ri:edit-line" /></Link><Button variant="outline-danger" size="sm" aria-label={`Delete ${community.name}`} onClick={() => setCommunityToDelete(community)}><IconifyIcon icon="ri:delete-bin-line" /></Button></div></td></tr>)}</tbody>
            </Table>
          </div>
        )}
      </CardBody>

      {!query.isLoading && !query.isError && (payload?.totalPages || 0) > 1 && (
        <CardFooter className="d-flex justify-content-between align-items-center">
          <span className="text-muted">Page {payload?.page} of {payload?.totalPages}</span>
          <div className="d-flex gap-2"><Button variant="light" disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</Button><Button variant="light" disabled={page >= (payload?.totalPages || 1)} onClick={() => updateQuery({ page: String(page + 1) })}>Next</Button></div>
        </CardFooter>
      )}

      <Modal show={Boolean(communityToDelete)} onHide={() => setCommunityToDelete(null)} centered>
        <ModalHeader closeButton><h5 className="mb-0">Delete community</h5></ModalHeader>
        <ModalBody>This will permanently delete <strong>{communityToDelete?.name}</strong>. Continue only if the community has no records that must be retained.</ModalBody>
        <ModalFooter><Button variant="light" onClick={() => setCommunityToDelete(null)}>Cancel</Button><Button variant="danger" disabled={deleteCommunity.isPending} onClick={confirmDelete}>{deleteCommunity.isPending ? "Deleting..." : "Delete community"}</Button></ModalFooter>
      </Modal>
    </Card>
  );
};

export default CommunityDirectory;
