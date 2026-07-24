"use client";

import Link from "next/link";
import { Alert, Nav, Spinner } from "react-bootstrap";
import { useMemo } from "react";

import PageTitle from "@/components/PageTitle";
import AdminCrudSection, {
  type CrudColumn,
  type CrudField,
} from "@/components/operations/AdminCrudSection";
import { useAdminCapabilities } from "@/hooks/useAdminCapabilities";
import {
  useAgencyDocumentsOperations,
  useAgencyFinanceOperations,
  useAgencyProfilesOperations,
  useAgencyServicesOperations,
  useAgencyStaffOperations,
  useCreateAgencyProfileOperation,
  useCreateAgencyDocumentOperation,
  useCreateAgencyFinanceOperation,
  useCreateAgencyServiceOperation,
  useCreateAgencyStaffOperation,
  useUpdateAgencyProfileOperation,
  useDeleteAgencyDocumentOperation,
  useDeleteAgencyServiceOperation,
  useDeleteAgencyStaffOperation,
  useUpdateAgencyDocumentOperation,
  useUpdateAgencyFinanceOperation,
  useUpdateAgencyServiceOperation,
  useUpdateAgencyStaffOperation,
} from "@/hooks/useAgencyOperations";
import { useGetAgencyDirectory, useListAgenciesDirectory } from "@/hooks/useAgencyDirectory";

const AGENCY_TABS = [
  { key: "profiles", label: "Agency Profile", href: "/agency/manage?tab=profiles", capability: "agency:profiles:view" },
  { key: "staff", label: "Staff Management", href: "/agency/manage?tab=staff", capability: "agency:staff:view" },
  { key: "services", label: "Services Management", href: "/agency/manage?tab=services", capability: "agency:services:view" },
  { key: "finance", label: "Finance & Billing", href: "/agency/manage?tab=finance", capability: "agency:finance:view" },
  { key: "documents", label: "Documents & Records", href: "/agency/manage?tab=documents", capability: "agency:documents:view" },
] as const;

const toErrorText = (error: unknown) => (error instanceof Error ? error.message : null);

const buildAgencyOptions = (
  agencies: Array<{
    id: string;
    name?: string | null;
    city?: string | null;
    state?: string | null;
  }>
) =>
  agencies.map((agency) => ({
    value: agency.id,
    label:
      [agency.name, [agency.city, agency.state].filter(Boolean).join(", ")].filter(Boolean).join(" — ") ||
      agency.id,
  }));

export type AgencySectionKey = (typeof AGENCY_TABS)[number]["key"];

type AgencyOperationsWorkspaceProps = {
  section: AgencySectionKey;
  agencyId?: string;
};

const AgencyProfilesSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const profilesQuery = useAgencyProfilesOperations(filters);
  const agencyDirectoryQuery = useGetAgencyDirectory(agencyId || "");
  const agenciesDirectoryQuery = useListAgenciesDirectory();
  const createMutation = useCreateAgencyProfileOperation();
  const updateMutation = useUpdateAgencyProfileOperation();
  const selectedAgency = agencyDirectoryQuery.data;
  const profileAgencyIds = new Set((profilesQuery.data || []).map((profile) => profile.id));
  const availableAgencyOptions = buildAgencyOptions(
    (agenciesDirectoryQuery.data || []).filter((agency) => agency.id === agencyId || !profileAgencyIds.has(agency.id))
  );

  const columns: CrudColumn[] = [
    { key: "name", label: "Agency" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    {
      key: "agency_type",
      label: "Type",
      render: (row) =>
        row.agency_type
          ? String(row.agency_type).replace(/\b\w/g, (character) => character.toUpperCase())
          : "Not recorded",
    },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.status
          ? String(row.status)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (character) => character.toUpperCase())
          : "Not recorded",
    },
    { key: "total_agents", label: "Agents" },
  ];

  const fields: CrudField[] = [
    {
      key: "id",
      label: "Agency",
      type: "select",
      required: true,
      initialValue: agencyId || "",
      options: availableAgencyOptions,
    },
    { key: "name", label: "Agency Name", type: "text", required: true, initialValue: selectedAgency?.name || "" },
    { key: "email", label: "Email", type: "text", initialValue: selectedAgency?.email || "" },
    { key: "phone", label: "Phone", type: "text", initialValue: selectedAgency?.phone || "" },
    { key: "address", label: "Address", type: "textarea", required: true, initialValue: selectedAgency?.address || "" },
    { key: "city", label: "City", type: "text", required: true, initialValue: selectedAgency?.city || "" },
    { key: "state", label: "State", type: "text", required: true, initialValue: selectedAgency?.state || "" },
    { key: "pincode", label: "Postal Code", type: "text", required: true, initialValue: selectedAgency?.postal_code || "" },
    {
      key: "agency_type",
      label: "Agency Type",
      type: "select",
      initialValue: "residential",
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
        { label: "Mixed", value: "mixed" },
      ],
    },
    { key: "category", label: "Category", type: "text" },
    { key: "owner_name", label: "Owner Name", type: "text" },
    { key: "manager_name", label: "Manager Name", type: "text", initialValue: selectedAgency?.contact_person_name || "" },
    { key: "license_number", label: "License Number", type: "text" },
    { key: "website", label: "Website", type: "text", initialValue: selectedAgency?.website || "" },
    { key: "description", label: "Description", type: "textarea", initialValue: selectedAgency?.description || "" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: selectedAgency?.is_active ? "active" : "inactive",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
    },
    { key: "established_year", label: "Established Year", type: "text" },
    { key: "commission_rate", label: "Commission Rate", type: "number", min: 0, max: 100, step: 0.01 },
    { key: "total_agents", label: "Total Agents", type: "number", min: 0, step: 1 },
    { key: "total_clients", label: "Total Clients", type: "number", min: 0, step: 1 },
    { key: "total_properties", label: "Total Properties", type: "number", min: 0, step: 1 },
    { key: "average_deal_value", label: "Average Deal Value", type: "number", min: 0, step: 0.01 },
  ];

  return (
    <AdminCrudSection
      id="agency-profiles-workspace"
      title="Agency Profile"
      subTitle={
        agencyId
          ? "Agency profile directory filtered to the selected agency."
          : "Agency profile directory scoped to your assigned agencies."
      }
      rows={profilesQuery.data || []}
      isLoading={profilesQuery.isLoading || agencyDirectoryQuery.isLoading || agenciesDirectoryQuery.isLoading}
      error={
        toErrorText(profilesQuery.error) ||
        toErrorText(agencyDirectoryQuery.error) ||
        toErrorText(agenciesDirectoryQuery.error)
      }
      columns={columns}
      fields={fields}
      canCreate={availableAgencyOptions.length > 0 && (!agencyId || (profilesQuery.data || []).length === 0)}
      canUpdate={true}
      canDelete={false}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onRefresh={() => {
        profilesQuery.refetch();
        agencyDirectoryQuery.refetch();
        agenciesDirectoryQuery.refetch();
      }}
      emptyText={
        agencyId
          ? "No agency profile exists for this agency yet. Use Add Agency Profile to create the operational profile."
          : "No agency profiles available."
      }
      itemLabel="Agency Profile"
      createLabel="Add Agency Profile"
      editLabel="Edit Agency Profile"
    />
  );
};

const AgencyStaffSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const staffQuery = useAgencyStaffOperations(filters);
  const agenciesQuery = useListAgenciesDirectory();
  const createMutation = useCreateAgencyStaffOperation();
  const updateMutation = useUpdateAgencyStaffOperation();
  const deleteMutation = useDeleteAgencyStaffOperation();
  const agencyMap = new Map((agenciesQuery.data || []).map((agency) => [agency.id, agency.name]));
  const agencyOptions = buildAgencyOptions(agenciesQuery.data || []);
  const reportingManagerOptions = (staffQuery.data || []).map((staff) => ({
    value: String(staff.id),
    label: [staff.first_name, staff.last_name].filter(Boolean).join(" ") || String(staff.email || staff.id),
  }));

  const columns: CrudColumn[] = [
    {
      key: "agency_id",
      label: "Agency",
      render: (row) => agencyMap.get(String(row.agency_id || "")) || "—",
    },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.status
          ? String(row.status)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (character) => character.toUpperCase())
          : row.is_active === false
            ? "Inactive"
            : "Active",
    },
  ];

  const fields: CrudField[] = [
    {
      key: "agency_id",
      label: "Agency",
      type: "select",
      required: !agencyId,
      initialValue: agencyId || "",
      options: agencyOptions,
    },
    { key: "first_name", label: "First Name", type: "text", required: true },
    { key: "last_name", label: "Last Name", type: "text", required: true },
    { key: "email", label: "Email", type: "text", required: true },
    { key: "phone", label: "Phone", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "position", label: "Position", type: "text" },
    { key: "employee_id", label: "Employee ID", type: "text" },
    { key: "date_of_joining", label: "Joining Date", type: "date" },
    {
      key: "reporting_manager_id",
      label: "Reporting Manager",
      type: "select",
      options: reportingManagerOptions,
    },
    { key: "salary", label: "Salary", type: "number", min: 0, step: 0.01 },
    { key: "commission_percentage", label: "Commission %", type: "number", min: 0, max: 100, step: 0.01 },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "On Leave", value: "on_leave" },
      ],
    },
    { key: "is_active", label: "Is Active", type: "checkbox", initialValue: true },
  ];

  return (
    <AdminCrudSection
      id="agency-staff-workspace"
      title="Staff Management"
      subTitle="Manage agency team records with scoped write controls."
      rows={staffQuery.data || []}
      isLoading={staffQuery.isLoading || agenciesQuery.isLoading}
      error={toErrorText(staffQuery.error) || toErrorText(agenciesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => {
        staffQuery.refetch();
        agenciesQuery.refetch();
      }}
      emptyText="No agency staff records found."
      itemLabel="Staff Member"
      createLabel="Add Staff Member"
      editLabel="Edit Staff Member"
    />
  );
};

const AgencyServicesSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const servicesQuery = useAgencyServicesOperations(filters);
  const agenciesQuery = useListAgenciesDirectory();
  const createMutation = useCreateAgencyServiceOperation();
  const updateMutation = useUpdateAgencyServiceOperation();
  const deleteMutation = useDeleteAgencyServiceOperation();
  const agencyMap = new Map((agenciesQuery.data || []).map((agency) => [agency.id, agency.name]));
  const agencyOptions = buildAgencyOptions(agenciesQuery.data || []);

  const columns: CrudColumn[] = [
    {
      key: "agency_id",
      label: "Agency",
      render: (row) => agencyMap.get(String(row.agency_id || "")) || "—",
    },
    { key: "service_name", label: "Service" },
    { key: "category", label: "Category" },
    {
      key: "rate_type",
      label: "Rate Type",
      render: (row) =>
        row.rate_type
          ? String(row.rate_type)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (character) => character.toUpperCase())
          : "Not recorded",
    },
    {
      key: "base_price",
      label: "Base Price",
      render: (row) =>
        typeof row.base_price === "number"
          ? new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(row.base_price)
          : "Not recorded",
    },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.status
          ? String(row.status)
              .replace(/_/g, " ")
              .replace(/\b\w/g, (character) => character.toUpperCase())
          : "Not recorded",
    },
  ];

  const fields: CrudField[] = [
    {
      key: "agency_id",
      label: "Agency",
      type: "select",
      required: !agencyId,
      initialValue: agencyId || "",
      options: agencyOptions,
    },
    { key: "service_name", label: "Service Name", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "rate", label: "Rate", type: "number", min: 0, step: 0.01 },
    {
      key: "rate_type",
      label: "Rate Type",
      type: "select",
      initialValue: "hourly",
      options: [
        { label: "Hourly", value: "hourly" },
        { label: "Fixed", value: "fixed" },
        { label: "Monthly", value: "monthly" },
        { label: "Per Unit", value: "per_unit" },
      ],
    },
    { key: "base_price", label: "Base Price", type: "number", min: 0, step: 0.01 },
    { key: "commission_rate", label: "Commission Rate", type: "number", min: 0, max: 100, step: 0.01 },
    { key: "duration", label: "Duration", type: "text" },
    { key: "availability", label: "Availability", type: "text" },
    { key: "requirements", label: "Requirements", type: "textarea" },
    { key: "target_market", label: "Target Market", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Draft", value: "draft" },
      ],
    },
  ];

  return (
    <AdminCrudSection
      id="agency-services-workspace"
      title="Services Management"
      subTitle="Agency service catalog and pricing operations."
      rows={servicesQuery.data || []}
      isLoading={servicesQuery.isLoading || agenciesQuery.isLoading}
      error={toErrorText(servicesQuery.error) || toErrorText(agenciesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => {
        servicesQuery.refetch();
        agenciesQuery.refetch();
      }}
      emptyText="No agency services found."
      itemLabel="Agency Service"
      createLabel="Add Agency Service"
      editLabel="Edit Agency Service"
    />
  );
};

const AgencyFinanceSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const financeQuery = useAgencyFinanceOperations(filters);
  const agenciesQuery = useListAgenciesDirectory();
  const createMutation = useCreateAgencyFinanceOperation();
  const updateMutation = useUpdateAgencyFinanceOperation();
  const agencyMap = new Map((agenciesQuery.data || []).map((agency) => [agency.id, agency.name]));
  const agencyOptions = buildAgencyOptions(agenciesQuery.data || []);

  const columns: CrudColumn[] = [
    {
      key: "agency_id",
      label: "Agency",
      render: (row) => agencyMap.get(String(row.agency_id || "")) || "—",
    },
    {
      key: "date",
      label: "Date",
      render: (row) => {
        if (!row.date) return "Not recorded";
        const date = new Date(String(row.date));
        return Number.isNaN(date.getTime()) ? String(row.date) : date.toLocaleDateString();
      },
    },
    {
      key: "type",
      label: "Type",
      render: (row) =>
        row.type
          ? String(row.type).replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
          : "Not recorded",
    },
    { key: "category", label: "Category" },
    {
      key: "amount",
      label: "Amount",
      render: (row) =>
        typeof row.amount === "number"
          ? new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(row.amount)
          : "Not recorded",
    },
    {
      key: "status",
      label: "Status",
      render: (row) =>
        row.status
          ? String(row.status).replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
          : "Not recorded",
    },
  ];

  const fields: CrudField[] = [
    {
      key: "agency_id",
      label: "Agency",
      type: "select",
      required: !agencyId,
      initialValue: agencyId || "",
      options: agencyOptions,
    },
    { key: "date", label: "Date", type: "date", required: true },
    {
      key: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { label: "Income", value: "income" },
        { label: "Expense", value: "expense" },
        { label: "Credit", value: "credit" },
        { label: "Debit", value: "debit" },
      ],
    },
    { key: "category", label: "Category", type: "text", required: true },
    { key: "amount", label: "Amount", type: "number", required: true, min: 0.01, step: 0.01 },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      initialValue: "completed",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { key: "payment_method", label: "Payment Method", type: "text" },
    { key: "reference", label: "Reference", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="agency-finance-workspace"
      title="Finance & Billing"
      subTitle="Agency-scoped financial ledger entries for operational reporting."
      rows={financeQuery.data || []}
      isLoading={financeQuery.isLoading || agenciesQuery.isLoading}
      error={toErrorText(financeQuery.error) || toErrorText(agenciesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      canDelete={false}
      onRefresh={() => {
        financeQuery.refetch();
        agenciesQuery.refetch();
      }}
      emptyText="No agency finance transactions found."
      itemLabel="Finance Transaction"
      createLabel="Add Finance Transaction"
      editLabel="Edit Finance Transaction"
    />
  );
};

const AgencyDocumentsSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const documentsQuery = useAgencyDocumentsOperations(filters);
  const agenciesQuery = useListAgenciesDirectory();
  const createMutation = useCreateAgencyDocumentOperation();
  const updateMutation = useUpdateAgencyDocumentOperation();
  const deleteMutation = useDeleteAgencyDocumentOperation();
  const agencyMap = new Map((agenciesQuery.data || []).map((agency) => [agency.id, agency.name]));
  const agencyOptions = buildAgencyOptions(agenciesQuery.data || []);

  const columns: CrudColumn[] = [
    {
      key: "agency_id",
      label: "Agency",
      render: (row) => agencyMap.get(String(row.agency_id || "")) || "—",
    },
    { key: "name", label: "Document Name" },
    { key: "category", label: "Category" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "uploaded_by_name", label: "Uploaded By" },
  ];

  const fields: CrudField[] = [
    {
      key: "agency_id",
      label: "Agency",
      type: "select",
      required: !agencyId,
      initialValue: agencyId || "",
      options: agencyOptions,
    },
    { key: "name", label: "Document Name", type: "text", required: true },
    { key: "category", label: "Category", type: "text", required: true },
    { key: "type", label: "Type", type: "text", required: true },
    { key: "status", label: "Status", type: "text", initialValue: "active" },
    { key: "file_url", label: "File URL", type: "text" },
    { key: "access", label: "Access", type: "text", initialValue: "Internal" },
    { key: "retention", label: "Retention", type: "text", initialValue: "5 Years" },
    { key: "uploaded_by_name", label: "Uploaded By", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "is_confidential", label: "Confidential", type: "checkbox" },
    { key: "requires_approval", label: "Requires Approval", type: "checkbox" },
  ];

  return (
    <AdminCrudSection
      id="agency-documents-workspace"
      title="Documents & Records"
      subTitle="Agency document management with scoped access enforcement."
      itemLabel="Agency Document"
      createLabel="Add Agency Document"
      editLabel="Edit Agency Document"
      rows={documentsQuery.data || []}
      isLoading={documentsQuery.isLoading || agenciesQuery.isLoading}
      error={toErrorText(documentsQuery.error) || toErrorText(agenciesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => {
        documentsQuery.refetch();
        agenciesQuery.refetch();
      }}
      emptyText="No agency documents found."
    />
  );
};

const AgencyOperationsWorkspace = ({ section, agencyId }: AgencyOperationsWorkspaceProps) => {
  const { data: capabilities, isLoading: isCapabilitiesLoading } = useAdminCapabilities();
  const capabilitySet = new Set(capabilities?.menu_capabilities || []);
  const visibleTabs = AGENCY_TABS.filter((tab) => capabilitySet.has(tab.capability));
  const resolvedSection = visibleTabs.some((tab) => tab.key === section)
    ? section
    : visibleTabs[0]?.key;
  const activeTab = AGENCY_TABS.find((tab) => tab.key === resolvedSection);
  const hasAccess = Boolean(activeTab);

  return (
    <>
      <PageTitle
        title="Manage Agencies"
        subName="Operational workspace under People → Agency"
      />

      {visibleTabs.length > 0 ? (
        <Nav variant="tabs" className="mb-4">
          {visibleTabs.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link
                as={Link}
                href={agencyId ? `${tab.href}&agencyId=${agencyId}` : tab.href}
                active={tab.key === resolvedSection}
              >
                {tab.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      ) : null}

      {isCapabilitiesLoading ? (
        <Alert variant="light" className="mb-4 d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading agency permissions…</span>
        </Alert>
      ) : null}

      {!isCapabilitiesLoading && !hasAccess ? (
        <Alert variant="warning" className="mb-0">
          You do not have permission to access this agency operations page.
        </Alert>
      ) : null}

      {hasAccess && resolvedSection === "profiles" ? <AgencyProfilesSection agencyId={agencyId} /> : null}
      {hasAccess && resolvedSection === "staff" ? <AgencyStaffSection agencyId={agencyId} /> : null}
      {hasAccess && resolvedSection === "services" ? <AgencyServicesSection agencyId={agencyId} /> : null}
      {hasAccess && resolvedSection === "finance" ? <AgencyFinanceSection agencyId={agencyId} /> : null}
      {hasAccess && resolvedSection === "documents" ? <AgencyDocumentsSection agencyId={agencyId} /> : null}
      {hasAccess && !activeTab ? <Alert variant="danger">Unsupported agency operations section.</Alert> : null}
    </>
  );
};

export default AgencyOperationsWorkspace;
