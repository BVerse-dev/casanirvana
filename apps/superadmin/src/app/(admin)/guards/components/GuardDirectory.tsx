"use client";

import DirectoryToolbar from "@/components/directory/DirectoryToolbar";
import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useDirectoryView } from "@/hooks/useDirectoryView";
import { useDeleteGuardDirectory, useListGuardsDirectory, type GuardDirectoryItem } from "@/hooks/useGuardDirectory";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Form, Row } from "react-bootstrap";
import { toast } from "react-hot-toast";

import GuardDirectoryGrid from "./GuardDirectoryGrid";
import GuardDirectoryList from "./GuardDirectoryList";
import GuardGridCard from "../grid-view/Components/GuardGridCard";

const PAGE_SIZE = 12;
const validStatuses = new Set(["active", "inactive", "suspended"]);
const positivePage = (value: string | null) => { const parsed = Number(value || 1); return Number.isInteger(parsed) && parsed > 0 ? parsed : 1; };

const GuardDirectory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { view, setView } = useDirectoryView("guards");
  const page = positivePage(searchParams.get("page"));
  const search = searchParams.get("search")?.trim() || "";
  const requestedStatus = searchParams.get("status") || "";
  const status = validStatuses.has(requestedStatus) ? requestedStatus : "";
  const [searchInput, setSearchInput] = useState(search);
  const guardsQuery = useListGuardsDirectory({ page, pageSize: PAGE_SIZE, search, status });
  const deleteGuard = useDeleteGuardDirectory();
  const payload = guardsQuery.data;

  useEffect(() => setSearchInput(search), [search]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`/guards?${params.toString()}`, { scroll: false });
  };
  const submitSearch = (event: FormEvent) => { event.preventDefault(); updateQuery({ search: searchInput.trim() || null, page: null }); };
  const clearFilters = () => { setSearchInput(""); updateQuery({ search: null, status: null, page: null }); };
  const handleDelete = async (guard: GuardDirectoryItem) => {
    if (!window.confirm(`Delete ${guard.full_name}? This action cannot be undone.`)) return;
    try { await deleteGuard.mutateAsync(guard.id); toast.success("Guard deleted successfully"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Guard could not be deleted"); }
  };
  const error = guardsQuery.error instanceof Error ? guardsQuery.error : null;
  const guards = payload?.data || [];
  const totalPages = payload?.totalPages || 0;

  return (
    <>
      <PageTitle title="Guards" subName="People" />
      {view === "grid" && !guardsQuery.isLoading && !error && <GuardGridCard guards={guards} />}
      <DirectoryToolbar title="Guard directory" description="Manage guard profiles within your authorized communities." view={view} onViewChange={setView} actions={<><Link href="/guards/manage" className="btn btn-outline-primary"><IconifyIcon icon="ri:settings-3-line" className="me-1" />Guard Workspace</Link><Button variant="outline-secondary" onClick={() => guardsQuery.refetch()} disabled={guardsQuery.isFetching}><IconifyIcon icon="ri:refresh-line" className="me-1" />Refresh</Button><Link href="/guards/add" className="btn btn-success"><IconifyIcon icon="ri:add-line" className="me-1" />Add Guard</Link></>} />
      <Card className="mb-4"><CardBody><Form onSubmit={submitSearch}><Row className="g-3 align-items-end"><Col lg={7}><Form.Label htmlFor="guard-search">Search</Form.Label><Form.Control id="guard-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Name, email or phone" /></Col><Col lg={3}><Form.Label htmlFor="guard-status">Status</Form.Label><Form.Select id="guard-status" value={status} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></Form.Select></Col><Col lg={2} className="d-flex gap-2"><Button type="submit" className="flex-grow-1">Search</Button>{(search || status) && <Button type="button" variant="outline-secondary" onClick={clearFilters} aria-label="Clear filters"><IconifyIcon icon="ri:close-line" /></Button>}</Col></Row></Form></CardBody></Card>
      <div className="d-flex justify-content-between align-items-center mb-3"><p className="text-muted mb-0">{payload?.count ?? 0} {(payload?.count ?? 0) === 1 ? "guard" : "guards"}</p>{guardsQuery.isFetching && !guardsQuery.isLoading && <small className="text-muted">Updating...</small>}</div>
      {view === "grid" ? <GuardDirectoryGrid guards={guards} isLoading={guardsQuery.isLoading} error={error} onDelete={handleDelete} /> : <GuardDirectoryList guards={guards} isLoading={guardsQuery.isLoading} error={error} searchTerm={search} onDelete={handleDelete} onRefresh={() => guardsQuery.refetch()} />}
      {totalPages > 1 && <nav aria-label="Guards pagination" className="mt-3"><ul className="pagination justify-content-center mb-0"><li className={`page-item ${page <= 1 ? "disabled" : ""}`}><button className="page-link" disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</button></li><li className="page-item disabled"><span className="page-link">Page {Math.min(page, totalPages)} of {totalPages}</span></li><li className={`page-item ${page >= totalPages ? "disabled" : ""}`}><button className="page-link" disabled={page >= totalPages} onClick={() => updateQuery({ page: String(page + 1) })}>Next</button></li></ul></nav>}
    </>
  );
};

export default GuardDirectory;
