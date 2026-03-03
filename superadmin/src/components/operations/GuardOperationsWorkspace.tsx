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
  useCreateGuardAssignment,
  useCreateGuardEquipment,
  useCreateGuardPerformance,
  useCreateGuardSchedule,
  useCreateGuardTraining,
  useDeleteGuardAssignment,
  useDeleteGuardEquipment,
  useDeleteGuardSchedule,
  useGuardAssignments,
  useGuardEquipment,
  useGuardPerformance,
  useGuardProfiles,
  useGuardSchedules,
  useGuardTraining,
  useUpdateGuardAssignment,
  useUpdateGuardEquipment,
  useUpdateGuardPerformance,
  useUpdateGuardSchedule,
  useUpdateGuardTraining,
} from "@/hooks/useGuardOperations";

const GUARD_TABS = [
  { key: "profiles", label: "Guard Profiles", href: "/guards/profiles", capability: "guards:profiles:view" },
  { key: "schedules", label: "Schedules & Shifts", href: "/guards/schedules", capability: "guards:schedules:view" },
  { key: "assignments", label: "Community Assignments", href: "/guards/assignments", capability: "guards:assignments:view" },
  { key: "equipment", label: "Equipment", href: "/guards/equipment", capability: "guards:equipment:view" },
  { key: "performance", label: "Performance", href: "/guards/performance", capability: "guards:performance:view" },
  { key: "training", label: "Training", href: "/guards/training", capability: "guards:training:view" },
] as const;

const defaultColumns: CrudColumn[] = [
  { key: "id", label: "ID" },
  { key: "created_at", label: "Created" },
];

const toErrorText = (error: unknown) => (error instanceof Error ? error.message : null);

type GuardSectionKey = (typeof GUARD_TABS)[number]["key"];

const GuardProfilesSection = () => {
  const profilesQuery = useGuardProfiles();

  const columns: CrudColumn[] = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "shift_type", label: "Shift" },
    { key: "community_id", label: "Community" },
  ];

  return (
    <AdminCrudSection
      id="guards-profiles-workspace"
      title="Guard Profiles"
      subTitle="Directory of guards scoped to your tenant access."
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
      emptyText="No guard profiles available for your scope."
    />
  );
};

const GuardSchedulesSection = () => {
  const schedulesQuery = useGuardSchedules();
  const createMutation = useCreateGuardSchedule();
  const updateMutation = useUpdateGuardSchedule();
  const deleteMutation = useDeleteGuardSchedule();

  const columns: CrudColumn[] = [
    { key: "guard_id", label: "Guard ID" },
    { key: "community_id", label: "Community" },
    { key: "assigned_date", label: "Assigned Date" },
    { key: "shift_type", label: "Shift Type" },
    { key: "start_time", label: "Start Time" },
    { key: "end_time", label: "End Time" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard ID", type: "text", required: true },
    { key: "community_id", label: "Community ID", type: "text" },
    { key: "assigned_date", label: "Assigned Date", type: "date", required: true },
    { key: "shift_type", label: "Shift Type", type: "text", required: true, initialValue: "day" },
    { key: "start_time", label: "Start Time", type: "time", required: true },
    { key: "end_time", label: "End Time", type: "time", required: true },
    { key: "post_location", label: "Post Location", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "scheduled",
      options: [
        { label: "Scheduled", value: "scheduled" },
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="guards-schedules-workspace"
      title="Schedules & Shifts"
      subTitle="Create and maintain guard shift schedules with tenant scope controls."
      rows={schedulesQuery.data || []}
      isLoading={schedulesQuery.isLoading}
      error={toErrorText(schedulesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => schedulesQuery.refetch()}
      emptyText="No schedules found."
    />
  );
};

const GuardAssignmentsSection = () => {
  const assignmentsQuery = useGuardAssignments();
  const createMutation = useCreateGuardAssignment();
  const updateMutation = useUpdateGuardAssignment();
  const deleteMutation = useDeleteGuardAssignment();

  const columns: CrudColumn[] = [
    { key: "assignment_name", label: "Assignment" },
    { key: "guard_id", label: "Guard ID" },
    { key: "community_id", label: "Community" },
    { key: "shift_type", label: "Shift" },
    { key: "start_date", label: "Start Date" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "assignment_name", label: "Assignment Name", type: "text" },
    { key: "guard_id", label: "Guard ID", type: "text", required: true },
    { key: "community_id", label: "Community ID", type: "text", required: true },
    {
      key: "shift_type",
      label: "Shift Type",
      type: "select",
      required: true,
      initialValue: "day",
      options: [
        { label: "Day", value: "day" },
        { label: "Night", value: "night" },
        { label: "Rotating", value: "rotating" },
      ],
    },
    { key: "start_time", label: "Start Time", type: "time", required: true },
    { key: "end_time", label: "End Time", type: "time", required: true },
    { key: "start_date", label: "Start Date", type: "date", required: true },
    { key: "end_date", label: "End Date", type: "date" },
    {
      key: "days_of_week",
      label: "Days of Week",
      type: "text",
      required: true,
      helpText: "Comma-separated weekday numbers (0=Sun ... 6=Sat).",
      fromValue: (value) => (Array.isArray(value) ? value.join(",") : ""),
      toPayload: (value) =>
        String(value)
          .split(",")
          .map((entry) => Number(entry.trim()))
          .filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6),
    },
    { key: "assigned_location", label: "Assigned Location", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Completed", value: "completed" },
      ],
    },
  ];

  return (
    <AdminCrudSection
      id="guards-assignments-workspace"
      title="Community Assignments"
      subTitle="Manage where guards are assigned across scoped communities."
      rows={assignmentsQuery.data || []}
      isLoading={assignmentsQuery.isLoading}
      error={toErrorText(assignmentsQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => assignmentsQuery.refetch()}
      emptyText="No assignments found."
    />
  );
};

const GuardEquipmentSection = () => {
  const equipmentQuery = useGuardEquipment();
  const createMutation = useCreateGuardEquipment();
  const updateMutation = useUpdateGuardEquipment();
  const deleteMutation = useDeleteGuardEquipment();

  const columns: CrudColumn[] = [
    { key: "name", label: "Equipment" },
    { key: "equipment_type", label: "Type" },
    { key: "serial_number", label: "Serial Number" },
    { key: "assigned_to", label: "Assigned Guard ID" },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
  ];

  const fields: CrudField[] = [
    { key: "name", label: "Equipment Name", type: "text", required: true },
    { key: "equipment_type", label: "Equipment Type", type: "text" },
    { key: "serial_number", label: "Serial Number", type: "text" },
    { key: "assigned_to", label: "Assigned Guard ID", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "status", label: "Status", type: "text", initialValue: "active" },
    { key: "cost", label: "Cost", type: "number" },
    { key: "assignment_date", label: "Assignment Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="guards-equipment-workspace"
      title="Equipment Management"
      subTitle="Track and update guard equipment allocations and status."
      rows={equipmentQuery.data || []}
      isLoading={equipmentQuery.isLoading}
      error={toErrorText(equipmentQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => equipmentQuery.refetch()}
      emptyText="No equipment records found."
    />
  );
};

const GuardPerformanceSection = () => {
  const performanceQuery = useGuardPerformance();
  const createMutation = useCreateGuardPerformance();
  const updateMutation = useUpdateGuardPerformance();

  const columns: CrudColumn[] = [
    { key: "guard_id", label: "Guard ID" },
    { key: "evaluation_date", label: "Evaluation Date" },
    { key: "overall_score", label: "Overall Score" },
    { key: "status", label: "Status" },
    { key: "reviewed_by", label: "Reviewed By" },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard ID", type: "text", required: true },
    { key: "evaluation_date", label: "Evaluation Date", type: "date", required: true },
    { key: "overall_score", label: "Overall Score", type: "number" },
    { key: "attendance_score", label: "Attendance Score", type: "number" },
    { key: "punctuality_score", label: "Punctuality Score", type: "number" },
    { key: "professionalism_score", label: "Professionalism Score", type: "number" },
    { key: "status", label: "Status", type: "text", initialValue: "active" },
    { key: "reviewed_by", label: "Reviewed By", type: "text" },
    { key: "feedback", label: "Feedback", type: "textarea" },
    { key: "improvement_plan", label: "Improvement Plan", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="guards-performance-workspace"
      title="Guard Performance"
      subTitle="Capture and review guard performance records."
      rows={performanceQuery.data || []}
      isLoading={performanceQuery.isLoading}
      error={toErrorText(performanceQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      canDelete={false}
      onRefresh={() => performanceQuery.refetch()}
      emptyText="No performance records found."
    />
  );
};

const GuardTrainingSection = () => {
  const trainingQuery = useGuardTraining();
  const createMutation = useCreateGuardTraining();
  const updateMutation = useUpdateGuardTraining();

  const columns: CrudColumn[] = [
    { key: "guard_id", label: "Guard ID" },
    { key: "training_name", label: "Training" },
    { key: "training_type", label: "Type" },
    { key: "start_date", label: "Start Date" },
    { key: "completion_date", label: "Completion Date" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard ID", type: "text", required: true },
    { key: "training_name", label: "Training Name", type: "text", required: true },
    { key: "training_type", label: "Training Type", type: "text" },
    { key: "status", label: "Status", type: "text", initialValue: "enrolled" },
    { key: "start_date", label: "Start Date", type: "date" },
    { key: "completion_date", label: "Completion Date", type: "date" },
    { key: "expiry_date", label: "Expiry Date", type: "date" },
    { key: "certification", label: "Certification", type: "text" },
    { key: "score", label: "Score", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="guards-training-workspace"
      title="Training & Certification"
      subTitle="Track training enrollment, completion, and certification details."
      rows={trainingQuery.data || []}
      isLoading={trainingQuery.isLoading}
      error={toErrorText(trainingQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      canDelete={false}
      onRefresh={() => trainingQuery.refetch()}
      emptyText="No training records found."
    />
  );
};

const GuardOperationsWorkspace = ({ section }: { section: GuardSectionKey }) => {
  const { data: capabilities } = useAdminCapabilities();
  const capabilitySet = new Set(capabilities?.menu_capabilities || []);
  const activeTab = GUARD_TABS.find((tab) => tab.key === section);

  const visibleTabs = GUARD_TABS.filter((tab) => capabilitySet.has(tab.capability));
  const hasAccess = activeTab ? capabilitySet.has(activeTab.capability) : false;

  return (
    <>
      <PageTitle
        title={activeTab?.label || "Guard Operations"}
        subName="Operational workspace under People → Guards"
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
          You do not have permission to access this guard operations page.
        </Alert>
      ) : null}

      {hasAccess && section === "profiles" ? <GuardProfilesSection /> : null}
      {hasAccess && section === "schedules" ? <GuardSchedulesSection /> : null}
      {hasAccess && section === "assignments" ? <GuardAssignmentsSection /> : null}
      {hasAccess && section === "equipment" ? <GuardEquipmentSection /> : null}
      {hasAccess && section === "performance" ? <GuardPerformanceSection /> : null}
      {hasAccess && section === "training" ? <GuardTrainingSection /> : null}
      {hasAccess && !activeTab ? (
        <Alert variant="danger">Unsupported guard operations section.</Alert>
      ) : null}
    </>
  );
};

export default GuardOperationsWorkspace;

