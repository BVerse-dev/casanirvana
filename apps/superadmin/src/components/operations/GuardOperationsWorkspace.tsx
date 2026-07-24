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

const WEEKDAY_OPTIONS = [
  { label: "Sun", value: "0" },
  { label: "Mon", value: "1" },
  { label: "Tue", value: "2" },
  { label: "Wed", value: "3" },
  { label: "Thu", value: "4" },
  { label: "Fri", value: "5" },
  { label: "Sat", value: "6" },
];

const formatDate = (value: unknown) => {
  const text = String(value || "").trim();
  if (!text) return "—";
  const date = new Date(`${text.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? text
    : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const formatTime = (value: unknown) => String(value || "").slice(0, 5) || "—";

const formatWeekdays = (value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) return "Days not set";
  return value
    .map((day) => WEEKDAY_OPTIONS.find((option) => option.value === String(day))?.label)
    .filter(Boolean)
    .join(", ");
};

const titleCase = (value: unknown) =>
  String(value || "Not set")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const renderOperationalStatusBadge = (status: unknown) => {
  const normalized = String(status || "").toLowerCase();
  const variant = normalized === "active"
    ? "success"
    : normalized === "assigned"
      ? "success"
      : normalized === "available"
        ? "info"
    : normalized === "completed"
      ? "primary"
      : normalized === "scheduled"
        ? "info"
        : normalized === "cancelled"
          ? "danger"
        : normalized === "maintenance"
          ? "warning"
        : normalized === "lost"
          ? "danger"
        : normalized === "retired"
          ? "secondary"
      : normalized === "inactive"
        ? "secondary"
        : "warning";
  return (
    <Badge bg={`${variant}-subtle`} text={variant}>
      {titleCase(status)}
    </Badge>
  );
};

const renderPerformanceScore = (score: unknown) => {
  if (score === null || score === undefined || score === "") return "—";
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return String(score);
  const variant = numericScore >= 80 ? "success" : numericScore >= 60 ? "warning" : "danger";
  return (
    <Badge bg={`${variant}-subtle`} text={variant}>
      {numericScore.toFixed(Number.isInteger(numericScore) ? 0 : 1)}/100
    </Badge>
  );
};

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
          <Link
            href={`/guards/manage?tab=assignments&guardId=${encodeURIComponent(row.id)}`}
            className="btn btn-primary btn-sm"
          >
            Assign Community
          </Link>
        ) : row.active_assignment_id ? (
          <Link
            href={`/guards/manage?tab=assignments&guardId=${encodeURIComponent(row.id)}`}
            className="btn btn-outline-primary btn-sm"
          >
            Manage Assignment
          </Link>
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
    {
      key: "shift_type",
      label: "Shift",
      render: (row) => (
        <div>
          <div className="fw-semibold">{titleCase(row.shift_type)}</div>
          <small className="text-muted">{formatTime(row.start_time)}–{formatTime(row.end_time)}</small>
        </div>
      ),
    },
    {
      key: "assigned_date",
      label: "Schedule Period",
      render: (row) => (
        <span>{formatDate(row.assigned_date)}{row.end_date ? ` – ${formatDate(row.end_date)}` : " – Ongoing"}</span>
      ),
    },
    {
      key: "post_location",
      label: "Post",
      render: (row) => row.post_location || "Post not set",
    },
    { key: "status", label: "Status", render: (row) => renderOperationalStatusBadge(row.status) },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard", type: "select", required: true, options: guardOptions },
    { key: "community_id", label: "Community", type: "select", options: communityOptions },
    { key: "assigned_date", label: "Start Date", type: "date", required: true, initialValue: today },
    { key: "end_date", label: "End Date", type: "date" },
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
      subTitle="Plan guard shifts, post coverage and schedule periods within your authorized communities."
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
      itemLabel="Schedule"
      createLabel="Add Schedule"
      deleteConfirmation={(row) =>
        `Delete the ${titleCase(row.shift_type)} schedule for ${guardMap.get(String(row.guard_id || "")) || "this guard"}? This permanently removes the schedule record.`
      }
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
    {
      key: "assignment_name",
      label: "Assignment",
      render: (row) => (
        <div>
          <div className="fw-semibold">{row.assignment_name || "Community assignment"}</div>
          <small className="text-muted">
            {row.assigned_gate || row.assigned_location || "Location not set"}
          </small>
        </div>
      ),
    },
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
    {
      key: "shift_type",
      label: "Schedule",
      render: (row) => (
        <div>
          <div>{titleCase(row.shift_type)} · {formatTime(row.start_time)}–{formatTime(row.end_time)}</div>
          <small className="text-muted">{formatWeekdays(row.days_of_week)}</small>
        </div>
      ),
    },
    {
      key: "start_date",
      label: "Assignment Period",
      render: (row) => (
        <span>{formatDate(row.start_date)}{row.end_date ? ` – ${formatDate(row.end_date)}` : " – Ongoing"}</span>
      ),
    },
    { key: "status", label: "Status", render: (row) => renderOperationalStatusBadge(row.status) },
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
      type: "checkbox-group",
      required: true,
      initialValue: "0,1,2,3,4,5,6",
      options: WEEKDAY_OPTIONS,
      helpText: "Select every weekday covered by this assignment.",
      fromValue: (value) => (Array.isArray(value) ? value.join(",") : ""),
      toPayload: (value) =>
        String(value)
          .split(",")
          .map((entry) => Number(entry.trim()))
          .filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6),
    },
    { key: "assigned_location", label: "Assigned Location", type: "text" },
    { key: "assigned_gate", label: "Assigned Gate or Post", type: "text" },
    { key: "special_instructions", label: "Operational Instructions", type: "textarea" },
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
        itemLabel="Assignment"
        createLabel="Add Assignment"
        deleteConfirmation={(row) =>
          `Delete ${row.assignment_name || "this guard assignment"}? This permanently removes the assignment record and recalculates the guard's community access.`
        }
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
    {
      key: "name",
      label: "Equipment",
      render: (row) => (
        <div>
          <div className="fw-semibold">{row.name || "Unnamed equipment"}</div>
          <small className="text-muted">
            {[row.brand, row.model].filter(Boolean).join(" · ") || "Brand/model not set"}
          </small>
        </div>
      ),
    },
    {
      key: "equipment_type",
      label: "Type",
      render: (row) => titleCase(row.equipment_type || row.category || row.type),
    },
    { key: "serial_number", label: "Serial Number" },
    {
      key: "assigned_to",
      label: "Assigned Guard",
      render: (row) => guardMap.get(String(row.assigned_to || "")) || "Unassigned",
    },
    {
      key: "condition",
      label: "Condition",
      render: (row) => titleCase(row.condition),
    },
    { key: "status", label: "Status", render: (row) => renderOperationalStatusBadge(row.status) },
    { key: "location", label: "Location" },
  ];

  const fields: CrudField[] = [
    { key: "name", label: "Equipment Name", type: "text", required: true },
    { key: "equipment_type", label: "Equipment Type", type: "text" },
    { key: "serial_number", label: "Serial Number", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "model", label: "Model", type: "text" },
    {
      key: "condition",
      label: "Condition",
      type: "select",
      initialValue: "good",
      options: [
        { label: "New", value: "new" },
        { label: "Good", value: "good" },
        { label: "Fair", value: "fair" },
        { label: "Poor", value: "poor" },
        { label: "Damaged", value: "damaged" },
      ],
    },
    { key: "assigned_to", label: "Assigned Guard", type: "select", options: guardOptions },
    { key: "location", label: "Location", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "select",
      initialValue: "available",
      options: [
        { label: "Available", value: "available" },
        { label: "Assigned", value: "assigned" },
        { label: "Active", value: "active" },
        { label: "In Maintenance", value: "maintenance" },
        { label: "Retired", value: "retired" },
        { label: "Lost", value: "lost" },
      ],
    },
    { key: "cost", label: "Cost", type: "number" },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "warranty_expiry", label: "Warranty Expiry", type: "date" },
    { key: "assignment_date", label: "Assignment Date", type: "date" },
    { key: "next_maintenance", label: "Next Maintenance", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="guards-equipment-workspace"
      title="Equipment Management"
      subTitle="Track guard equipment identity, condition, assignment and maintenance status."
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
      itemLabel="Equipment"
      createLabel="Add Equipment"
      deleteConfirmation={(row) =>
        `Delete ${row.name || "this equipment record"}${row.serial_number ? ` (${row.serial_number})` : ""}? This permanently removes its assignment and maintenance history from this workspace.`
      }
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
    { key: "evaluation_date", label: "Evaluation Date", render: (row) => formatDate(row.evaluation_date) },
    {
      key: "evaluation_period",
      label: "Period",
      render: (row) => row.evaluation_period || "Not specified",
    },
    { key: "overall_score", label: "Overall Score", render: (row) => renderPerformanceScore(row.overall_score) },
    {
      key: "reviewed_by",
      label: "Evaluator",
      render: (row) => row.evaluator || row.reviewed_by || "Not recorded",
    },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard", type: "select", required: true, options: guardOptions },
    { key: "evaluation_date", label: "Evaluation Date", type: "date", required: true },
    { key: "evaluation_period", label: "Evaluation Period", type: "text", placeholder: "Q3 2026 or July 2026" },
    { key: "evaluator", label: "Evaluator", type: "text" },
    { key: "overall_score", label: "Overall Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "attendance_score", label: "Attendance Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "punctuality_score", label: "Punctuality Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "discipline_score", label: "Discipline Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "vigilance_score", label: "Vigilance Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "communication_score", label: "Communication Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "reliability_score", label: "Reliability Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "professionalism_score", label: "Professionalism Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "feedback", label: "Feedback", type: "textarea" },
    { key: "commendations", label: "Commendations", type: "textarea" },
    { key: "areas_of_improvement", label: "Areas of Improvement", type: "textarea" },
    { key: "improvement_plan", label: "Improvement Plan", type: "textarea" },
    { key: "follow_up_date", label: "Follow-up Date", type: "date" },
  ];

  return (
    <AdminCrudSection
      id="guards-performance-workspace"
      title="Guard Performance"
      subTitle="Record scoped guard evaluations, operational scores, feedback and follow-up actions."
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
      itemLabel="Performance Review"
      createLabel="Add Review"
      editLabel="Edit Review"
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
    {
      key: "start_date",
      label: "Start Date",
      render: (row) => formatDate(row.start_date),
    },
    {
      key: "completion_date",
      label: "Completion Date",
      render: (row) => formatDate(row.completion_date),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => renderStatus(row.status),
    },
  ];

  const fields: CrudField[] = [
    { key: "guard_id", label: "Guard", type: "select", required: true, options: guardOptions },
    { key: "training_name", label: "Training Name", type: "text", required: true },
    { key: "training_type", label: "Training Type", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
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
    { key: "end_date", label: "End Date", type: "date" },
    { key: "completion_date", label: "Completion Date", type: "date" },
    { key: "conducted_by", label: "Conducted By", type: "text" },
    { key: "trainer", label: "Trainer", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "expiry_date", label: "Expiry Date", type: "date" },
    { key: "certification", label: "Certification", type: "text" },
    { key: "certification_number", label: "Certification Number", type: "text" },
    { key: "certification_expiry", label: "Certification Expiry", type: "date" },
    { key: "score", label: "Score", type: "number", min: 0, max: 100, step: 0.1 },
    { key: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <AdminCrudSection
      id="guards-training-workspace"
      title="Training & Certification"
      subTitle="Track scoped guard training, completion, scores and certification validity."
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
      itemLabel="Training Record"
      createLabel="Add Training Record"
      editLabel="Edit Training Record"
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
