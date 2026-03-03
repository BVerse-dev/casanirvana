"use client";

import Link from "next/link";
import { Alert, Nav } from "react-bootstrap";

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
  useCreateAgencyDocumentOperation,
  useCreateAgencyFinanceOperation,
  useCreateAgencyServiceOperation,
  useCreateAgencyStaffOperation,
  useDeleteAgencyDocumentOperation,
  useDeleteAgencyServiceOperation,
  useDeleteAgencyStaffOperation,
  useUpdateAgencyDocumentOperation,
  useUpdateAgencyFinanceOperation,
  useUpdateAgencyServiceOperation,
  useUpdateAgencyStaffOperation,
} from "@/hooks/useAgencyOperations";

const AGENCY_TABS = [
  { key: "profiles", label: "Agency Profile", href: "/agency/profiles", capability: "agency:profiles:view" },
  { key: "staff", label: "Staff Management", href: "/agency/staff", capability: "agency:staff:view" },
  { key: "services", label: "Services Management", href: "/agency/services", capability: "agency:services:view" },
  { key: "finance", label: "Finance & Billing", href: "/agency/finance", capability: "agency:finance:view" },
  { key: "documents", label: "Documents & Records", href: "/agency/documents", capability: "agency:documents:view" },
] as const;

const toErrorText = (error: unknown) => (error instanceof Error ? error.message : null);

type AgencySectionKey = (typeof AGENCY_TABS)[number]["key"];

const AgencyProfilesSection = () => {
  const profilesQuery = useAgencyProfilesOperations();

  const columns: CrudColumn[] = [
    { key: "name", label: "Agency" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "agency_type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "total_agents", label: "Agents" },
  ];

  return (
    <AdminCrudSection
      id="agency-profiles-workspace"
      title="Agency Profile"
      subTitle="Agency profile directory scoped to your assigned agencies."
      badgeLabel="Read Only"
      rows={profilesQuery.data || []}
      isLoading={profilesQuery.isLoading}
      error={toErrorText(profilesQuery.error)}
      columns={columns}
      fields={[]}
      canCreate={false}
      canUpdate={false}
      canDelete={false}
      onRefresh={() => profilesQuery.refetch()}
      emptyText="No agency profiles available."
    />
  );
};

const AgencyStaffSection = () => {
  const staffQuery = useAgencyStaffOperations();
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
    { key: "agency_id", label: "Agency ID", type: "text", required: true },
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

const AgencyServicesSection = () => {
  const servicesQuery = useAgencyServicesOperations();
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
    { key: "agency_id", label: "Agency ID", type: "text", required: true },
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

const AgencyFinanceSection = () => {
  const financeQuery = useAgencyFinanceOperations();
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
    { key: "agency_id", label: "Agency ID", type: "text", required: true },
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

const AgencyDocumentsSection = () => {
  const documentsQuery = useAgencyDocumentsOperations();
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
    { key: "agency_id", label: "Agency ID", type: "text", required: true },
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

const AgencyOperationsWorkspace = ({ section }: { section: AgencySectionKey }) => {
  const { data: capabilities } = useAdminCapabilities();
  const capabilitySet = new Set(capabilities?.menu_capabilities || []);
  const activeTab = AGENCY_TABS.find((tab) => tab.key === section);

  const visibleTabs = AGENCY_TABS.filter((tab) => capabilitySet.has(tab.capability));
  const hasAccess = activeTab ? capabilitySet.has(activeTab.capability) : false;

  return (
    <>
      <PageTitle
        title={activeTab?.label || "Agency Operations"}
        subName="Operational workspace under People → Agency"
      />

      {visibleTabs.length > 0 ? (
        <Nav variant="tabs" className="mb-4">
          {visibleTabs.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link as={Link} href={tab.href} active={tab.key === section}>
                {tab.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      ) : null}

      {!hasAccess ? (
        <Alert variant="warning" className="mb-0">
          You do not have permission to access this agency operations page.
        </Alert>
      ) : null}

      {hasAccess && section === "profiles" ? <AgencyProfilesSection /> : null}
      {hasAccess && section === "staff" ? <AgencyStaffSection /> : null}
      {hasAccess && section === "services" ? <AgencyServicesSection /> : null}
      {hasAccess && section === "finance" ? <AgencyFinanceSection /> : null}
      {hasAccess && section === "documents" ? <AgencyDocumentsSection /> : null}
      {hasAccess && !activeTab ? <Alert variant="danger">Unsupported agency operations section.</Alert> : null}
    </>
  );
};

export default AgencyOperationsWorkspace;

