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
import { useGetAgencyDirectory } from "@/hooks/useAgencyDirectory";

const AGENCY_TABS = [
  { key: "profiles", label: "Agency Profile", href: "/agency/manage?tab=profiles", capability: "agency:profiles:view" },
  { key: "staff", label: "Staff Management", href: "/agency/manage?tab=staff", capability: "agency:staff:view" },
  { key: "services", label: "Services Management", href: "/agency/manage?tab=services", capability: "agency:services:view" },
  { key: "finance", label: "Finance & Billing", href: "/agency/manage?tab=finance", capability: "agency:finance:view" },
  { key: "documents", label: "Documents & Records", href: "/agency/manage?tab=documents", capability: "agency:documents:view" },
] as const;

const toErrorText = (error: unknown) => (error instanceof Error ? error.message : null);

export type AgencySectionKey = (typeof AGENCY_TABS)[number]["key"];

type AgencyOperationsWorkspaceProps = {
  section: AgencySectionKey;
  agencyId?: string;
};

const AgencyProfilesSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const profilesQuery = useAgencyProfilesOperations(filters);
  const agencyDirectoryQuery = useGetAgencyDirectory(agencyId || "");
  const createMutation = useCreateAgencyProfileOperation();
  const updateMutation = useUpdateAgencyProfileOperation();
  const selectedAgency = agencyDirectoryQuery.data;

  const columns: CrudColumn[] = [
    { key: "id", label: "Agency ID" },
    { key: "name", label: "Agency" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "agency_type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "total_agents", label: "Agents" },
  ];

  const fields: CrudField[] = [
    { key: "id", label: "Agency ID", type: "text", required: true, initialValue: agencyId || "" },
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
    { key: "commission_rate", label: "Commission Rate", type: "number" },
    { key: "total_agents", label: "Total Agents", type: "number" },
    { key: "total_clients", label: "Total Clients", type: "number" },
    { key: "total_properties", label: "Total Properties", type: "number" },
    { key: "average_deal_value", label: "Average Deal Value", type: "number" },
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
      isLoading={profilesQuery.isLoading || agencyDirectoryQuery.isLoading}
      error={toErrorText(profilesQuery.error)}
      columns={columns}
      fields={fields}
      canCreate={!agencyId || (profilesQuery.data || []).length === 0}
      canUpdate={true}
      canDelete={false}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onRefresh={() => profilesQuery.refetch()}
      emptyText={
        agencyId
          ? "No agency profile exists for this agency yet. Use Add to create the operational profile."
          : "No agency profiles available."
      }
    />
  );
};

const AgencyStaffSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const staffQuery = useAgencyStaffOperations(filters);
  const createMutation = useCreateAgencyStaffOperation();
  const updateMutation = useUpdateAgencyStaffOperation();
  const deleteMutation = useDeleteAgencyStaffOperation();

  const columns: CrudColumn[] = [
    { key: "agency_id", label: "Agency ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "agency_id", label: "Agency ID", type: "text", required: !agencyId, initialValue: agencyId || "" },
    { key: "first_name", label: "First Name", type: "text", required: true },
    { key: "last_name", label: "Last Name", type: "text", required: true },
    { key: "email", label: "Email", type: "text", required: true },
    { key: "phone", label: "Phone", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "position", label: "Position", type: "text" },
    { key: "employee_id", label: "Employee ID", type: "text" },
    { key: "salary", label: "Salary", type: "number" },
    { key: "commission_percentage", label: "Commission %", type: "number" },
    { key: "status", label: "Status", type: "text", initialValue: "Active" },
    { key: "is_active", label: "Is Active", type: "checkbox", initialValue: true },
  ];

  return (
    <AdminCrudSection
      id="agency-staff-workspace"
      title="Staff Management"
      subTitle="Manage agency team records with scoped write controls."
      rows={staffQuery.data || []}
      isLoading={staffQuery.isLoading}
      error={toErrorText(staffQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => staffQuery.refetch()}
      emptyText="No agency staff records found."
    />
  );
};

const AgencyServicesSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const servicesQuery = useAgencyServicesOperations(filters);
  const createMutation = useCreateAgencyServiceOperation();
  const updateMutation = useUpdateAgencyServiceOperation();
  const deleteMutation = useDeleteAgencyServiceOperation();

  const columns: CrudColumn[] = [
    { key: "agency_id", label: "Agency ID" },
    { key: "service_name", label: "Service" },
    { key: "category", label: "Category" },
    { key: "rate_type", label: "Rate Type" },
    { key: "base_price", label: "Base Price" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "agency_id", label: "Agency ID", type: "text", required: !agencyId, initialValue: agencyId || "" },
    { key: "service_name", label: "Service Name", type: "text", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "rate", label: "Rate", type: "number" },
    { key: "rate_type", label: "Rate Type", type: "text", initialValue: "hourly" },
    { key: "base_price", label: "Base Price", type: "number" },
    { key: "commission_rate", label: "Commission Rate", type: "number" },
    { key: "duration", label: "Duration", type: "text" },
    { key: "availability", label: "Availability", type: "text" },
    { key: "status", label: "Status", type: "text", initialValue: "active" },
  ];

  return (
    <AdminCrudSection
      id="agency-services-workspace"
      title="Services Management"
      subTitle="Agency service catalog and pricing operations."
      rows={servicesQuery.data || []}
      isLoading={servicesQuery.isLoading}
      error={toErrorText(servicesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => servicesQuery.refetch()}
      emptyText="No agency services found."
    />
  );
};

const AgencyFinanceSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const financeQuery = useAgencyFinanceOperations(filters);
  const createMutation = useCreateAgencyFinanceOperation();
  const updateMutation = useUpdateAgencyFinanceOperation();

  const columns: CrudColumn[] = [
    { key: "agency_id", label: "Agency ID" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "agency_id", label: "Agency ID", type: "text", required: !agencyId, initialValue: agencyId || "" },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "type", label: "Type", type: "text", required: true },
    { key: "category", label: "Category", type: "text", required: true },
    { key: "amount", label: "Amount", type: "number", required: true },
    { key: "status", label: "Status", type: "text", required: true, initialValue: "completed" },
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
      isLoading={financeQuery.isLoading}
      error={toErrorText(financeQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      canDelete={false}
      onRefresh={() => financeQuery.refetch()}
      emptyText="No agency finance transactions found."
    />
  );
};

const AgencyDocumentsSection = ({ agencyId }: { agencyId?: string }) => {
  const filters = useMemo(() => (agencyId ? { agencyId } : undefined), [agencyId]);
  const documentsQuery = useAgencyDocumentsOperations(filters);
  const createMutation = useCreateAgencyDocumentOperation();
  const updateMutation = useUpdateAgencyDocumentOperation();
  const deleteMutation = useDeleteAgencyDocumentOperation();

  const columns: CrudColumn[] = [
    { key: "agency_id", label: "Agency ID" },
    { key: "name", label: "Document Name" },
    { key: "category", label: "Category" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "uploaded_by_name", label: "Uploaded By" },
  ];

  const fields: CrudField[] = [
    { key: "agency_id", label: "Agency ID", type: "text", required: !agencyId, initialValue: agencyId || "" },
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
      rows={documentsQuery.data || []}
      isLoading={documentsQuery.isLoading}
      error={toErrorText(documentsQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => documentsQuery.refetch()}
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
