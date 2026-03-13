"use client";

import Link from "next/link";
import { Alert, Badge, Button, Nav } from "react-bootstrap";

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
  useGuardCommunities,
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
  { key: "profiles", label: "Guard Profiles", href: "/guards/manage?tab=profiles", capability: "guards:profiles:view" },
  { key: "schedules", label: "Schedules & Shifts", href: "/guards/manage?tab=schedules", capability: "guards:schedules:view" },
  { key: "assignments", label: "Community Assignments", href: "/guards/manage?tab=assignments", capability: "guards:assignments:view" },
  { key: "equipment", label: "Equipment", href: "/guards/manage?tab=equipment", capability: "guards:equipment:view" },
  { key: "performance", label: "Performance", href: "/guards/manage?tab=performance", capability: "guards:performance:view" },
  { key: "training", label: "Training & Certification", href: "/guards/manage?tab=training", capability: "guards:training:view" },
] as const;

const defaultColumns: CrudColumn[] = [
  { key: "id", label: "ID" },
  { key: "created_at", label: "Created" },
];

const toErrorText = (error: unknown) => (error instanceof Error ? error.message : null);

export type GuardSectionKey = (typeof GUARD_TABS)[number]["key"];

const renderAssignmentStatusBadge = (status: string | null | undefined) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "assigned") {
    return (
      <Badge bg="success-subtle" text="success">
        Assigned
      </Badge>
    );
  }
  if (normalized === "inactive") {
    return (
      <Badge bg="secondary-subtle" text="secondary">
        Inactive
      </Badge>
    );
  }
  return (
    <Badge bg="warning-subtle" text="warning">
      Awaiting Assignment
    </Badge>
  );
};

const formatGuardName = (guard: {
  id?: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}) => {
  const fullName = String(guard.full_name || "").trim();
  if (fullName) return fullName;
  const joinedName = [guard.first_name, guard.last_name].filter(Boolean).join(" ").trim();
  if (joinedName) return joinedName;
  return guard.id ? `Guard ${guard.id.slice(0, 8)}` : "Unknown Guard";
};

const buildGuardOptions = (
  guards: Array<{
    id: string;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    assignment_status?: string | null;
    resolved_community_name?: string | null;
  }>,
  prioritizeAwaitingAssignment = false
) =>
  guards
    .slice()
    .sort((left, right) => {
      if (prioritizeAwaitingAssignment) {
        const leftScore = left.assignment_status === "awaiting_assignment" ? 0 : 1;
        const rightScore = right.assignment_status === "awaiting_assignment" ? 0 : 1;
        if (leftScore !== rightScore) return leftScore - rightScore;
      }
      return formatGuardName(left).localeCompare(formatGuardName(right));
    })
    .map((guard) => {
      const guardName = formatGuardName(guard);
      if (guard.assignment_status === "awaiting_assignment") {
        return {
          value: guard.id,
          label: `${guardName} — Awaiting assignment`,
        };
      }

      return {
        value: guard.id,
        label: guard.resolved_community_name
          ? `${guardName} — ${guard.resolved_community_name}`
          : guardName,
      };
    });

const GuardProfilesSection = () => {
  const profilesQuery = useGuardProfiles();
  const awaitingAssignmentCount =
    profilesQuery.data?.filter((row) => row.assignment_status === "awaiting_assignment").length || 0;

  const columns: CrudColumn[] = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "assignment_status",
      label: "Provisioning",
      render: (row) => renderAssignmentStatusBadge(row.assignment_status),
    },
    { key: "shift_type", label: "Shift" },
    {
      key: "resolved_community_name",
      label: "Community",
      render: (row) => row.resolved_community_name || "—",
    },
    {
      key: "assignment_action",
      label: "Next Step",
      render: (row) =>
        row.assignment_status === "awaiting_assignment" ? (
          <Button
            as={Link}
            href={`/guards/manage?tab=assignments&guardId=${encodeURIComponent(row.id)}`}
            size="sm"
          >
            Assign Community
          </Button>
        ) : row.active_assignment_id ? (
          <Button
            as={Link}
            href={`/guards/manage?tab=assignments&guardId=${encodeURIComponent(row.id)}`}
            variant="outline-primary"
            size="sm"
          >
            Manage Assignment
          </Button>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <>
      {awaitingAssignmentCount > 0 ? (
        <Alert variant="warning">
          {awaitingAssignmentCount} guard{awaitingAssignmentCount === 1 ? "" : "s"} currently
          await first community assignment. Use <strong>Assign Community</strong> to complete
          onboarding before first login.
        </Alert>
      ) : null}
      <AdminCrudSection
        id="guards-profiles-workspace"
        title="Guard Profiles"
        subTitle="Directory of guards scoped to your tenant access. Self-registered guards appear here until a superadmin provisions their first community assignment."
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
    </>
  );
};

const GuardSchedulesSection = () => {
  const schedulesQuery = useGuardSchedules();
  const createMutation = useCreateGuardSchedule();
  const updateMutation = useUpdateGuardSchedule();
  const deleteMutation = useDeleteGuardSchedule();
  const profilesQuery = useGuardProfiles();
  const communitiesQuery = useGuardCommunities();
  const guardMap = new Map((profilesQuery.data || []).map((guard) => [guard.id, formatGuardName(guard)]));
  const communityMap = new Map((communitiesQuery.data || []).map((community) => [community.id, community.name]));
  const guardOptions = buildGuardOptions(profilesQuery.data || []);
  const communityOptions = (communitiesQuery.data || []).map((community) => ({
    value: community.id,
    label: community.name,
  }));
  const today = new Date().toISOString().slice(0, 10);

  const columns: CrudColumn[] = [
    {
      key: "guard_id",
      label: "Guard",
      render: (row) => guardMap.get(String(row.guard_id || "")) || "—",
    },
    {
      key: "community_id",
      label: "Community",
      render: (row) => communityMap.get(String(row.community_id || "")) || "—",
    },
    { key: "assigned_date", label: "Assigned Date" },
    { key: "shift_type", label: "Shift Type" },
    { key: "start_time", label: "Start Time" },
    { key: "end_time", label: "End Time" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard", type: "select", required: true, options: guardOptions },
    { key: "community_id", label: "Community", type: "select", options: communityOptions },
    { key: "assigned_date", label: "Assigned Date", type: "date", required: true, initialValue: today },
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
      isLoading={schedulesQuery.isLoading || profilesQuery.isLoading || communitiesQuery.isLoading}
      error={
        toErrorText(schedulesQuery.error) ||
        toErrorText(profilesQuery.error) ||
        toErrorText(communitiesQuery.error)
      }
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => {
        schedulesQuery.refetch();
        profilesQuery.refetch();
        communitiesQuery.refetch();
      }}
      emptyText="No schedules found."
    />
  );
};

const GuardAssignmentsSection = ({ initialGuardId }: { initialGuardId?: string | null }) => {
  const today = new Date().toISOString().slice(0, 10);
  const assignmentsQuery = useGuardAssignments(initialGuardId ? { guardId: initialGuardId } : undefined);
  const createMutation = useCreateGuardAssignment();
  const updateMutation = useUpdateGuardAssignment();
  const deleteMutation = useDeleteGuardAssignment();
  const profilesQuery = useGuardProfiles();
  const communitiesQuery = useGuardCommunities();
  const communities = communitiesQuery.data || [];
  const guardOptions = buildGuardOptions(profilesQuery.data || [], true);
  const communityOptions = communities.map((community) => ({
    value: community.id,
    label: community.name,
  }));
  const guardMap = new Map((profilesQuery.data || []).map((guard) => [guard.id, formatGuardName(guard)]));
  const communityMap = new Map(communities.map((community) => [community.id, community.name]));
  const awaitingAssignmentCount =
    profilesQuery.data?.filter((row) => row.assignment_status === "awaiting_assignment").length || 0;

  const columns: CrudColumn[] = [
    { key: "assignment_name", label: "Assignment" },
    {
      key: "guard_id",
      label: "Guard",
      render: (row) => guardMap.get(String(row.guard_id || "")) || "—",
    },
    {
      key: "community_id",
      label: "Community",
      render: (row) => communityMap.get(String(row.community_id || "")) || "—",
    },
    { key: "shift_type", label: "Shift" },
    { key: "start_date", label: "Start Date" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    {
      key: "guard_id",
      label: "Guard",
      type: "select",
      required: true,
      options: guardOptions,
      initialValue: initialGuardId || undefined,
      helpText: "Self-registered guards awaiting first assignment are listed at the top.",
    },
    {
      key: "community_id",
      label: "Community",
      type: "select",
      required: true,
      options: communityOptions,
    },
    {
      key: "assignment_name",
      label: "Assignment Name",
      type: "text",
      placeholder: "Main gate coverage",
      helpText: "Use a clear operational label for audit and shift planning.",
    },
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
    { key: "start_time", label: "Start Time", type: "time", required: true, initialValue: "08:00" },
    { key: "end_time", label: "End Time", type: "time", required: true, initialValue: "17:00" },
    { key: "start_date", label: "Start Date", type: "date", required: true, initialValue: today },
    { key: "end_date", label: "End Date", type: "date" },
    {
      key: "days_of_week",
      label: "Days of Week",
      type: "text",
      required: true,
      initialValue: "0,1,2,3,4,5,6",
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
    <>
      {awaitingAssignmentCount > 0 ? (
        <Alert variant="info">
          {awaitingAssignmentCount} guard{awaitingAssignmentCount === 1 ? "" : "s"} are ready for
          onboarding completion. Create an active community assignment here to unlock first login in
          the Guard app.
        </Alert>
      ) : null}
      <AdminCrudSection
        id="guards-assignments-workspace"
        title="Community Assignments"
        subTitle="Manage where guards are assigned across scoped communities. Saving an active assignment now also syncs the guard's canonical community scope for Guard app access."
        rows={assignmentsQuery.data || []}
        isLoading={assignmentsQuery.isLoading || profilesQuery.isLoading || communitiesQuery.isLoading}
        error={
          toErrorText(assignmentsQuery.error) ||
          toErrorText(profilesQuery.error) ||
          toErrorText(communitiesQuery.error)
        }
        columns={columns}
        fields={fields}
        onCreate={(payload) => createMutation.mutateAsync(payload)}
        onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
        onRefresh={() => {
          assignmentsQuery.refetch();
          profilesQuery.refetch();
          communitiesQuery.refetch();
        }}
        emptyText="No assignments found."
      />
    </>
  );
};

const GuardEquipmentSection = () => {
  const equipmentQuery = useGuardEquipment();
  const createMutation = useCreateGuardEquipment();
  const updateMutation = useUpdateGuardEquipment();
  const deleteMutation = useDeleteGuardEquipment();
  const profilesQuery = useGuardProfiles();
  const guardMap = new Map((profilesQuery.data || []).map((guard) => [guard.id, formatGuardName(guard)]));
  const guardOptions = buildGuardOptions(profilesQuery.data || []);

  const columns: CrudColumn[] = [
    { key: "name", label: "Equipment" },
    { key: "equipment_type", label: "Type" },
    { key: "serial_number", label: "Serial Number" },
    {
      key: "assigned_to",
      label: "Assigned Guard",
      render: (row) => guardMap.get(String(row.assigned_to || "")) || "Unassigned",
    },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
  ];

  const fields: CrudField[] = [
    { key: "name", label: "Equipment Name", type: "text", required: true },
    { key: "equipment_type", label: "Equipment Type", type: "text" },
    { key: "serial_number", label: "Serial Number", type: "text" },
    { key: "assigned_to", label: "Assigned Guard", type: "select", options: guardOptions },
    { key: "location", label: "Location", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "In Maintenance", value: "maintenance" },
        { label: "Retired", value: "retired" },
        { label: "Lost", value: "lost" },
      ],
    },
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
      isLoading={equipmentQuery.isLoading || profilesQuery.isLoading}
      error={toErrorText(equipmentQuery.error) || toErrorText(profilesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      onRefresh={() => {
        equipmentQuery.refetch();
        profilesQuery.refetch();
      }}
      emptyText="No equipment records found."
    />
  );
};

const GuardPerformanceSection = () => {
  const performanceQuery = useGuardPerformance();
  const createMutation = useCreateGuardPerformance();
  const updateMutation = useUpdateGuardPerformance();
  const profilesQuery = useGuardProfiles();
  const guardMap = new Map((profilesQuery.data || []).map((guard) => [guard.id, formatGuardName(guard)]));
  const guardOptions = buildGuardOptions(profilesQuery.data || []);

  const columns: CrudColumn[] = [
    {
      key: "guard_id",
      label: "Guard",
      render: (row) => guardMap.get(String(row.guard_id || "")) || "—",
    },
    { key: "evaluation_date", label: "Evaluation Date" },
    { key: "overall_score", label: "Overall Score" },
    { key: "status", label: "Status" },
    { key: "reviewed_by", label: "Reviewed By" },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard", type: "select", required: true, options: guardOptions },
    { key: "evaluation_date", label: "Evaluation Date", type: "date", required: true },
    { key: "overall_score", label: "Overall Score", type: "number" },
    { key: "attendance_score", label: "Attendance Score", type: "number" },
    { key: "punctuality_score", label: "Punctuality Score", type: "number" },
    { key: "professionalism_score", label: "Professionalism Score", type: "number" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Needs Improvement", value: "needs_improvement" },
        { label: "Probation", value: "probation" },
        { label: "Suspended", value: "suspended" },
      ],
    },
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
      isLoading={performanceQuery.isLoading || profilesQuery.isLoading}
      error={toErrorText(performanceQuery.error) || toErrorText(profilesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      canDelete={false}
      onRefresh={() => {
        performanceQuery.refetch();
        profilesQuery.refetch();
      }}
      emptyText="No performance records found."
    />
  );
};

const GuardTrainingSection = () => {
  const trainingQuery = useGuardTraining();
  const createMutation = useCreateGuardTraining();
  const updateMutation = useUpdateGuardTraining();
  const profilesQuery = useGuardProfiles();
  const guardMap = new Map((profilesQuery.data || []).map((guard) => [guard.id, formatGuardName(guard)]));
  const guardOptions = buildGuardOptions(profilesQuery.data || []);

  const columns: CrudColumn[] = [
    {
      key: "guard_id",
      label: "Guard",
      render: (row) => guardMap.get(String(row.guard_id || "")) || "—",
    },
    { key: "training_name", label: "Training" },
    { key: "training_type", label: "Type" },
    { key: "start_date", label: "Start Date" },
    { key: "completion_date", label: "Completion Date" },
    { key: "status", label: "Status" },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard", type: "select", required: true, options: guardOptions },
    { key: "training_name", label: "Training Name", type: "text", required: true },
    { key: "training_type", label: "Training Type", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "enrolled",
      options: [
        { label: "Enrolled", value: "enrolled" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Expired", value: "expired" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
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
      isLoading={trainingQuery.isLoading || profilesQuery.isLoading}
      error={toErrorText(trainingQuery.error) || toErrorText(profilesQuery.error)}
      columns={columns}
      fields={fields}
      onCreate={(payload) => createMutation.mutateAsync(payload)}
      onUpdate={(id, payload) => updateMutation.mutateAsync({ id, payload })}
      canDelete={false}
      onRefresh={() => {
        trainingQuery.refetch();
        profilesQuery.refetch();
      }}
      emptyText="No training records found."
    />
  );
};

const GuardOperationsWorkspace = ({
  section,
  initialGuardId,
}: {
  section: GuardSectionKey;
  initialGuardId?: string | null;
}) => {
  const { data: capabilities } = useAdminCapabilities();
  const capabilitySet = new Set(capabilities?.menu_capabilities || []);
  const visibleTabs = GUARD_TABS.filter((tab) => capabilitySet.has(tab.capability));
  const resolvedSection = visibleTabs.some((tab) => tab.key === section)
    ? section
    : visibleTabs[0]?.key;
  const activeTab = GUARD_TABS.find((tab) => tab.key === resolvedSection);
  const hasAccess = Boolean(activeTab);

  return (
    <>
      <PageTitle
        title="Manage Guards"
        subName="Operational workspace under People → Guards"
      />

      {visibleTabs.length > 0 ? (
        <Nav variant="tabs" className="mb-4">
          {visibleTabs.map((tab) => (
            <Nav.Item key={tab.key}>
              <Nav.Link as={Link} href={tab.href} active={tab.key === resolvedSection}>
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

      {hasAccess && resolvedSection === "profiles" ? <GuardProfilesSection /> : null}
      {hasAccess && resolvedSection === "schedules" ? <GuardSchedulesSection /> : null}
      {hasAccess && resolvedSection === "assignments" ? (
        <GuardAssignmentsSection initialGuardId={initialGuardId} />
      ) : null}
      {hasAccess && resolvedSection === "equipment" ? <GuardEquipmentSection /> : null}
      {hasAccess && resolvedSection === "performance" ? <GuardPerformanceSection /> : null}
      {hasAccess && resolvedSection === "training" ? <GuardTrainingSection /> : null}
      {hasAccess && !activeTab ? (
        <Alert variant="danger">Unsupported guard operations section.</Alert>
      ) : null}
    </>
  );
};

export default GuardOperationsWorkspace;
