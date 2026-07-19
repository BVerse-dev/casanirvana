import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { getScopedGuardIds, resolveAdminScope, type AdminScope } from '../services/adminScope';

const RESIDENT_ROLES = ['user', 'resident', 'tenant'] as const;
const CLOSED_MAINTENANCE_STATUSES = new Set(['resolved', 'completed', 'closed', 'cancelled', 'canceled']);
const ACTIVE_GUARD_SHIFT_STATUSES = new Set(['scheduled', 'active', 'in_progress']);
const ACTIVE_GUARD_ASSIGNMENT_STATUSES = new Set(['active']);
const SCHEDULED_GUARD_TRAINING_STATUSES = new Set(['scheduled']);
const COMPLETED_GUARD_TRAINING_STATUSES = new Set(['completed']);
const VALID_CERTIFICATION_STATUSES = new Set(['valid']);
const EXPIRING_SOON_CERTIFICATION_STATUSES = new Set(['expiring_soon']);
const EXPIRED_CERTIFICATION_STATUSES = new Set(['expired']);

type ResidentProfileRow = {
  id: string;
  role?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  last_login?: string | null;
  community_id?: string | null;
  unit_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

type UnitRow = {
  id: string;
  community_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  owner_id?: string | null;
  tenant_id?: string | null;
  bedrooms?: number | null;
  block?: string | null;
  number?: string | null;
  unit_number?: string | null;
};

type CommunityRow = {
  id: string;
  name?: string | null;
  address?: string | null;
};

type VisitorPassRow = {
  id: string;
  from_date: string;
  to_date: string;
  status?: string | null;
  community_id?: string | null;
  unit_id?: string | null;
};

type MaintenanceRequestRow = {
  id: number;
  created_at?: string | null;
  resolved_at?: string | null;
  completed_at?: string | null;
  status?: string | null;
  unit_id: string;
};

type InquiryRow = {
  id: string;
  created_at?: string | null;
  satisfaction_rating?: number | null;
  community_id?: string | null;
  user_id?: string | null;
};

type GuardRow = {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  community_id?: string | null;
  is_active?: boolean | null;
  salary?: number | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
};

type GuardAssignmentRow = {
  id: string;
  guard_id?: string | null;
  community_id?: string | null;
  assignment_name?: string | null;
  shift_type?: string | null;
  start_date: string;
  end_date?: string | null;
  status?: string | null;
  assigned_location?: string | null;
  assigned_gate?: string | null;
  responsibilities?: string[] | null;
  emergency_contact?: string | null;
  special_instructions?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type GuardPerformanceMetricRow = {
  id: string;
  guard_id: string;
  overall_rating?: number | null;
  punctuality_rating?: number | null;
  professionalism_rating?: number | null;
  reliability_rating?: number | null;
  communication_rating?: number | null;
  attendance_percentage?: number | null;
  total_shifts?: number | null;
  completed_shifts?: number | null;
  late_arrivals?: number | null;
  incident_reports?: number | null;
  compliments?: number | null;
  complaints?: number | null;
  last_review_date?: string | null;
  next_review_date?: string | null;
  status?: string | null;
};

type GuardPerformanceTrendRow = {
  guard_id?: string | null;
  evaluation_date: string;
  overall_score?: number | null;
  attendance_score?: number | null;
};

type GuardTrainingLegacyRow = {
  guard_id?: string | null;
  status?: string | null;
  certification_expiry?: string | null;
  end_date?: string | null;
};

type GuardTrainingRow = {
  guard_id: string;
  status: string;
  score?: number | null;
};

type GuardCertificationRow = {
  guard_id: string;
  status: string;
};

type GuardShiftRow = {
  guard_id?: string | null;
  community_id?: string | null;
  shift_date: string;
  start_time: string;
  end_time: string;
  status?: string | null;
};

type TrainingProgramRow = {
  status?: string | null;
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const buildLastMonths = (totalMonths: number) => {
  const now = new Date();
  return Array.from({ length: totalMonths }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (totalMonths - 1 - index), 1);
    return {
      key: monthKey(date),
      label: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  });
};

const buildLastDays = (days: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return date;
  });
};

const dedupeById = <T extends { id: string }>(rows: T[]) => [...new Map(rows.map((row) => [row.id, row])).values()];

const diffInDays = (start: Date, end: Date) => (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

const isResidentRole = (role?: string | null) => RESIDENT_ROLES.includes(String(role || '').toLowerCase() as typeof RESIDENT_ROLES[number]);

const isOccupiedUnit = (unit: UnitRow) => {
  const status = String(unit.status || '').toLowerCase();
  return status === 'occupied' || status === 'active' || Boolean(unit.owner_id || unit.tenant_id);
};

const getResidentName = (resident?: Partial<ResidentProfileRow> | null) => {
  if (!resident) return 'Resident';
  const fullName = resident.full_name?.trim();
  if (fullName) return fullName;
  const combined = [resident.first_name?.trim(), resident.last_name?.trim()].filter(Boolean).join(' ');
  return combined || resident.email || 'Resident';
};

const getUnitLabel = (unit?: Partial<UnitRow> | null) => {
  if (!unit) return 'N/A';
  const number = unit.number || unit.unit_number || null;
  if (unit.block && number) return `${unit.block}-${number}`;
  return number || 'N/A';
};

const getGuardName = (guard?: Partial<GuardRow> | null) => {
  if (!guard) return 'Unknown';
  const fullName = guard.full_name?.trim();
  if (fullName) return fullName;
  const combined = [guard.first_name?.trim(), guard.last_name?.trim()].filter(Boolean).join(' ');
  return combined || guard.email || 'Unknown';
};

const parseGuardShiftHours = (startTime?: string | null, endTime?: string | null) => {
  if (!startTime || !endTime) return 0;

  const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number);
  const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number);

  const start = startHour + startMinute / 60;
  let end = endHour + endMinute / 60;
  if (end < start) end += 24;
  return Math.max(0, end - start);
};

const guardAssignmentType = (assignment: GuardAssignmentRow) => (assignment.end_date ? 'temporary' : 'permanent');

const guardAssignmentPriority = (_assignment: GuardAssignmentRow) => 'medium';

const getLastSevenDaysSeries = (rows: Array<{ created_at?: string | null }>) => {
  const days = buildLastDays(7);

  return days.map((bucketDate) =>
    rows.filter((row) => {
      const createdAt = parseDate(row.created_at);
      return createdAt ? createdAt <= bucketDate : false;
    }).length
  );
};

async function loadScopedUnits(scope: AdminScope): Promise<UnitRow[]> {
  let query = supabase
    .from('units')
    .select('id, community_id, created_at, status, owner_id, tenant_id, bedrooms, block, number, unit_number');

  if (!scope.isGlobal) {
    if (scope.communityIds.length === 0) return [];
    query = query.in('community_id', scope.communityIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(500, 'ADMIN_DASHBOARD_UNITS_FETCH_FAILED', 'Failed to load units for dashboard reporting', error);
  }

  return (data || []) as UnitRow[];
}

async function loadScopedCommunities(scope: AdminScope): Promise<CommunityRow[]> {
  let query = supabase.from('communities').select('id, name, address');

  if (!scope.isGlobal) {
    if (scope.communityIds.length === 0) return [];
    query = query.in('id', scope.communityIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_COMMUNITIES_FETCH_FAILED',
      'Failed to load communities for dashboard reporting',
      error
    );
  }

  return (data || []) as CommunityRow[];
}

async function loadScopedResidents(scope: AdminScope, unitIds: string[]): Promise<ResidentProfileRow[]> {
  const selectColumns =
    'id, role, is_active, created_at, last_login, community_id, unit_id, first_name, last_name, full_name, email, avatar_url';

  if (scope.isGlobal) {
    const { data, error } = await supabase.from('profiles').select(selectColumns).in('role', [...RESIDENT_ROLES]);
    if (error) {
      throw createHttpError(
        500,
        'ADMIN_DASHBOARD_RESIDENTS_FETCH_FAILED',
        'Failed to load resident profiles for dashboard reporting',
        error
      );
    }
    return (data || []) as ResidentProfileRow[];
  }

  const [communityResult, unitResult] = await Promise.all([
    scope.communityIds.length > 0
      ? supabase.from('profiles').select(selectColumns).in('role', [...RESIDENT_ROLES]).in('community_id', scope.communityIds)
      : Promise.resolve({ data: [], error: null } as const),
    unitIds.length > 0
      ? supabase.from('profiles').select(selectColumns).in('role', [...RESIDENT_ROLES]).in('unit_id', unitIds)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  if (communityResult.error || unitResult.error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_RESIDENTS_FETCH_FAILED',
      'Failed to load resident profiles for dashboard reporting',
      { communityError: communityResult.error, unitError: unitResult.error }
    );
  }

  return dedupeById([...(communityResult.data || []), ...(unitResult.data || [])] as ResidentProfileRow[]);
}

async function loadScopedVisitorPasses(scope: AdminScope, unitIds: string[], sinceDate: string): Promise<VisitorPassRow[]> {
  const selectColumns = 'id, from_date, to_date, status, community_id, unit_id';

  if (scope.isGlobal) {
    const { data, error } = await supabase
      .from('visitor_passes')
      .select(selectColumns)
      .eq('status', 'approved')
      .gte('to_date', sinceDate);

    if (error) {
      throw createHttpError(
        500,
        'ADMIN_DASHBOARD_VISITORS_FETCH_FAILED',
        'Failed to load visitor activity for dashboard reporting',
        error
      );
    }

    return (data || []) as VisitorPassRow[];
  }

  const [communityResult, unitResult] = await Promise.all([
    scope.communityIds.length > 0
      ? supabase
          .from('visitor_passes')
          .select(selectColumns)
          .eq('status', 'approved')
          .in('community_id', scope.communityIds)
          .gte('to_date', sinceDate)
      : Promise.resolve({ data: [], error: null } as const),
    unitIds.length > 0
      ? supabase
          .from('visitor_passes')
          .select(selectColumns)
          .eq('status', 'approved')
          .in('unit_id', unitIds)
          .gte('to_date', sinceDate)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  if (communityResult.error || unitResult.error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_VISITORS_FETCH_FAILED',
      'Failed to load visitor activity for dashboard reporting',
      { communityError: communityResult.error, unitError: unitResult.error }
    );
  }

  return dedupeById([...(communityResult.data || []), ...(unitResult.data || [])] as VisitorPassRow[]);
}

async function loadScopedMaintenanceRequests(unitIds: string[]): Promise<MaintenanceRequestRow[]> {
  if (unitIds.length === 0) return [];

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('id, created_at, resolved_at, completed_at, status, unit_id')
    .in('unit_id', unitIds);

  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_MAINTENANCE_FETCH_FAILED',
      'Failed to load maintenance requests for dashboard reporting',
      error
    );
  }

  return (data || []) as MaintenanceRequestRow[];
}

async function loadScopedInquiries(scope: AdminScope, residentIds: string[]): Promise<InquiryRow[]> {
  const selectColumns = 'id, created_at, satisfaction_rating, community_id, user_id';

  if (scope.isGlobal) {
    const { data, error } = await supabase.from('inquiries').select(selectColumns);
    if (error) {
      throw createHttpError(
        500,
        'ADMIN_DASHBOARD_INQUIRIES_FETCH_FAILED',
        'Failed to load inquiries for dashboard reporting',
        error
      );
    }
    return (data || []) as InquiryRow[];
  }

  const [communityResult, residentResult] = await Promise.all([
    scope.communityIds.length > 0
      ? supabase.from('inquiries').select(selectColumns).in('community_id', scope.communityIds)
      : Promise.resolve({ data: [], error: null } as const),
    residentIds.length > 0
      ? supabase.from('inquiries').select(selectColumns).in('user_id', residentIds)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  if (communityResult.error || residentResult.error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_INQUIRIES_FETCH_FAILED',
      'Failed to load inquiries for dashboard reporting',
      { communityError: communityResult.error, residentError: residentResult.error }
    );
  }

  return dedupeById([...(communityResult.data || []), ...(residentResult.data || [])] as InquiryRow[]);
}

async function loadScopedGuards(scope: AdminScope, guardIds: string[]): Promise<GuardRow[]> {
  if (!scope.isGlobal && guardIds.length === 0) return [];

  let query = supabase
    .from('guards')
    .select('id, full_name, first_name, last_name, avatar_url, community_id, is_active, salary, phone, mobile, email');

  if (!scope.isGlobal) {
    query = query.in('id', guardIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(500, 'ADMIN_DASHBOARD_GUARDS_FETCH_FAILED', 'Failed to load guards for dashboard reporting', error);
  }

  return (data || []) as GuardRow[];
}

async function loadScopedGuardAssignments(scope: AdminScope): Promise<GuardAssignmentRow[]> {
  let query = supabase
    .from('guard_assignments')
    .select(
      'id, guard_id, community_id, assignment_name, shift_type, start_date, end_date, status, assigned_location, assigned_gate, responsibilities, emergency_contact, special_instructions, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (!scope.isGlobal) {
    if (scope.communityIds.length === 0) return [];
    query = query.in('community_id', scope.communityIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_GUARD_ASSIGNMENTS_FETCH_FAILED',
      'Failed to load guard assignments for dashboard reporting',
      error
    );
  }

  return (data || []) as GuardAssignmentRow[];
}

async function loadScopedGuardShifts(scope: AdminScope, guardIds: string[], sinceDate: string): Promise<GuardShiftRow[]> {
  if (!scope.isGlobal && scope.communityIds.length === 0 && guardIds.length === 0) return [];

  let query = supabase
    .from('guard_shifts')
    .select('guard_id, community_id, shift_date, start_time, end_time, status')
    .gte('shift_date', sinceDate);

  if (scope.isGlobal) {
    query = query.order('shift_date', { ascending: true });
  } else if (scope.communityIds.length > 0) {
    query = query.in('community_id', scope.communityIds).order('shift_date', { ascending: true });
  } else {
    query = query.in('guard_id', guardIds).order('shift_date', { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(500, 'ADMIN_DASHBOARD_GUARD_SHIFTS_FETCH_FAILED', 'Failed to load guard shifts for dashboard reporting', error);
  }

  return (data || []) as GuardShiftRow[];
}

async function loadScopedGuardPerformanceMetrics(scope: AdminScope, guardIds: string[]): Promise<GuardPerformanceMetricRow[]> {
  if (!scope.isGlobal && guardIds.length === 0) return [];

  let query = supabase
    .from('guard_performance_metrics')
    .select(
      'id, guard_id, overall_rating, punctuality_rating, professionalism_rating, reliability_rating, communication_rating, attendance_percentage, total_shifts, completed_shifts, late_arrivals, incident_reports, compliments, complaints, last_review_date, next_review_date, status'
    )
    .order('overall_rating', { ascending: false });

  if (!scope.isGlobal) {
    query = query.in('guard_id', guardIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_GUARD_PERFORMANCE_FETCH_FAILED',
      'Failed to load guard performance for dashboard reporting',
      error
    );
  }

  return (data || []) as GuardPerformanceMetricRow[];
}

async function loadScopedGuardPerformanceTrends(scope: AdminScope, guardIds: string[]): Promise<GuardPerformanceTrendRow[]> {
  if (!scope.isGlobal && guardIds.length === 0) return [];

  let query = supabase
    .from('guard_performance')
    .select('guard_id, evaluation_date, overall_score, attendance_score')
    .order('evaluation_date', { ascending: true });

  if (!scope.isGlobal) {
    query = query.in('guard_id', guardIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_GUARD_TREND_FETCH_FAILED',
      'Failed to load guard performance trends for dashboard reporting',
      error
    );
  }

  return (data || []) as GuardPerformanceTrendRow[];
}

async function loadScopedLegacyGuardTraining(scope: AdminScope, guardIds: string[]): Promise<GuardTrainingLegacyRow[]> {
  if (!scope.isGlobal && guardIds.length === 0) return [];

  let query = supabase
    .from('guard_training')
    .select('guard_id, status, certification_expiry, end_date');

  if (!scope.isGlobal) {
    query = query.in('guard_id', guardIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_GUARD_TRAINING_FETCH_FAILED',
      'Failed to load legacy guard training records for dashboard reporting',
      error
    );
  }

  return (data || []) as GuardTrainingLegacyRow[];
}

async function loadScopedGuardTrainings(scope: AdminScope, guardIds: string[]): Promise<GuardTrainingRow[]> {
  if (!scope.isGlobal && guardIds.length === 0) return [];

  let query = supabase.from('guard_trainings').select('guard_id, status, score');

  if (!scope.isGlobal) {
    query = query.in('guard_id', guardIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_GUARD_TRAININGS_FETCH_FAILED',
      'Failed to load guard trainings for dashboard reporting',
      error
    );
  }

  return (data || []) as GuardTrainingRow[];
}

async function loadScopedGuardCertifications(scope: AdminScope, guardIds: string[]): Promise<GuardCertificationRow[]> {
  if (!scope.isGlobal && guardIds.length === 0) return [];

  let query = supabase.from('guard_certifications').select('guard_id, status');

  if (!scope.isGlobal) {
    query = query.in('guard_id', guardIds);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_GUARD_CERTIFICATIONS_FETCH_FAILED',
      'Failed to load guard certifications for dashboard reporting',
      error
    );
  }

  return (data || []) as GuardCertificationRow[];
}

async function loadTrainingPrograms(): Promise<TrainingProgramRow[]> {
  const { data, error } = await supabase.from('training_programs').select('status');

  if (error) {
    throw createHttpError(
      500,
      'ADMIN_DASHBOARD_TRAINING_PROGRAMS_FETCH_FAILED',
      'Failed to load training programs for dashboard reporting',
      error
    );
  }

  return (data || []) as TrainingProgramRow[];
}

function buildAnalyticsCommunityDistribution(
  communities: CommunityRow[],
  units: UnitRow[],
  residents: ResidentProfileRow[]
) {
  const unitsByCommunityId = units.reduce<Map<string, UnitRow[]>>((acc, unit) => {
    if (!unit.community_id) return acc;
    const current = acc.get(unit.community_id) || [];
    current.push(unit);
    acc.set(unit.community_id, current);
    return acc;
  }, new Map());

  const unitIdsByCommunityId = new Map<string, Set<string>>();
  for (const [communityId, communityUnits] of unitsByCommunityId.entries()) {
    unitIdsByCommunityId.set(
      communityId,
      new Set(communityUnits.map((unit) => unit.id))
    );
  }

  const totalResidents = residents.length;

  return communities
    .map((community) => {
      const communityUnits = unitsByCommunityId.get(community.id) || [];
      const communityUnitIds = unitIdsByCommunityId.get(community.id) || new Set<string>();
      const residentCount = residents.filter((resident) => {
        if (resident.community_id === community.id) return true;
        return resident.unit_id ? communityUnitIds.has(resident.unit_id) : false;
      }).length;

      const occupiedUnits = communityUnits.filter((unit) => isOccupiedUnit(unit)).length;

      return {
        id: community.id,
        name: community.name || 'Unnamed Community',
        count: residentCount,
        occupancyRate: communityUnits.length > 0 ? round((occupiedUnits / communityUnits.length) * 100, 0) : 0,
        percentage: totalResidents > 0 ? round((residentCount / totalResidents) * 100, 0) : 0,
      };
    })
    .filter((community) => community.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function buildResidentDashboardPayload(
  residents: ResidentProfileRow[],
  units: UnitRow[],
  communities: CommunityRow[],
  maintenanceRequests: MaintenanceRequestRow[],
  inquiries: InquiryRow[],
  totalMonths: number
) {
  const months = buildLastMonths(totalMonths);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const activeResidents = residents.filter((resident) => resident.is_active);
  const newResidentsThisMonth = residents.filter((resident) => {
    const createdAt = parseDate(resident.created_at);
    return createdAt ? createdAt >= startOfMonth : false;
  }).length;

  const occupancyRate =
    units.length > 0 ? round((units.filter((unit) => isOccupiedUnit(unit)).length / units.length) * 100, 0) : 0;

  const averageStayDuration =
    residents.length > 0
      ? round(
          residents.reduce((sum, resident) => {
            const createdAt = parseDate(resident.created_at);
            return createdAt ? sum + diffInDays(createdAt, new Date()) / 30.4375 : sum;
          }, 0) / residents.length,
          1
        )
      : 0;

  const monthlyRegistrations = months.map((month) =>
    residents.filter((resident) => {
      const createdAt = parseDate(resident.created_at);
      return createdAt ? monthKey(createdAt) === month.key : false;
    }).length
  );

  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const communitiesById = new Map(communities.map((community) => [community.id, community]));

  const allResidentsPerSociety = Array.from(
    residents.reduce<Map<string, number>>((acc, resident) => {
      const communityId = resident.community_id || unitsById.get(resident.unit_id || '')?.community_id || null;
      const communityName = communityId ? communitiesById.get(communityId)?.name : null;
      if (!communityName) return acc;
      acc.set(communityName, (acc.get(communityName) || 0) + 1);
      return acc;
    }, new Map()).entries()
  )
    .map(([societyName, count]) => ({
      societyName,
      count,
      percentage: residents.length > 0 ? round((count / residents.length) * 100, 0) : 0,
    }))
    .sort((left, right) => right.count - left.count);

  const satisfactionScores = months.map((month) => {
    const scores = inquiries
      .filter((inquiry) => {
        const createdAt = parseDate(inquiry.created_at);
        return createdAt ? monthKey(createdAt) === month.key : false;
      })
      .map((inquiry) => Number(inquiry.satisfaction_rating))
      .filter((value) => Number.isFinite(value) && value > 0);

    return scores.length > 0 ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length, 1) : 0;
  });

  const maintenanceResponseTime = months.map((month) => {
    const values = maintenanceRequests
      .map((request) => {
        const createdAt = parseDate(request.created_at);
        const resolvedAt = parseDate(request.completed_at || request.resolved_at);
        if (!createdAt || !resolvedAt) return null;
        if (monthKey(resolvedAt) !== month.key) return null;
        return diffInDays(createdAt, resolvedAt);
      })
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0);

    return values.length > 0 ? round(values.reduce((sum, value) => sum + value, 0) / values.length, 1) : 0;
  });

  const communityEngagement = months.map((month) => {
    if (residents.length === 0) return 0;
    const activeCount = residents.filter((resident) => {
      const lastLogin = parseDate(resident.last_login);
      return lastLogin ? monthKey(lastLogin) === month.key : false;
    }).length;

    return round((activeCount / residents.length) * 100, 0);
  });

  const normalizedResidents = residents
    .map((resident) => {
      const unit = resident.unit_id ? unitsById.get(resident.unit_id) : null;
      return {
        id: resident.id,
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        full_name: getResidentName(resident),
        email: resident.email || '',
        avatar_url: resident.avatar_url || null,
        is_active: Boolean(resident.is_active),
        created_at: resident.created_at || null,
        unit_number: getUnitLabel(unit),
      };
    })
    .sort((left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime());

  const featuredResident = normalizedResidents.find((resident) => resident.is_active) || normalizedResidents[0] || null;

  return {
    summary: {
      totalResidents: residents.length,
      activeResidents: activeResidents.length,
      inactiveResidents: residents.length - activeResidents.length,
      newResidentsThisMonth,
      occupancyRate,
      averageStayDuration,
      pendingApprovals: 0,
      maintenanceRequests: maintenanceRequests.filter(
        (request) => !CLOSED_MAINTENANCE_STATUSES.has(String(request.status || '').toLowerCase())
      ).length,
    },
    stats: {
      monthlyRegistrations,
      monthlyLabels: months.map((month) => month.label),
      residentsPerSociety: allResidentsPerSociety.slice(0, 4),
      allResidentsPerSociety,
      residentsPerUnit: [],
    },
    performance: {
      labels: months.map((month) => month.label),
      satisfactionScores,
      maintenanceResponseTime,
      communityEngagement,
    },
    roster: {
      featuredResident,
      recentResidents: normalizedResidents.slice(0, 5),
      totalResidents: normalizedResidents.length,
      communityOptions: allResidentsPerSociety.map((society) => society.societyName),
    },
  };
}

function buildGuardDashboardPayload(
  guards: GuardRow[],
  communities: CommunityRow[],
  units: UnitRow[],
  assignments: GuardAssignmentRow[],
  shifts: GuardShiftRow[],
  performanceMetrics: GuardPerformanceMetricRow[],
  performanceTrends: GuardPerformanceTrendRow[],
  legacyTraining: GuardTrainingLegacyRow[],
  trainings: GuardTrainingRow[],
  certifications: GuardCertificationRow[],
  trainingPrograms: TrainingProgramRow[],
  totalWeeks: number
) {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const activeGuards = guards.filter((guard) => guard.is_active);
  const onDutyGuardIds = new Set(
    shifts
      .filter(
        (shift) => shift.shift_date === todayIso && ACTIVE_GUARD_SHIFT_STATUSES.has(String(shift.status || '').toLowerCase())
      )
      .map((shift) => shift.guard_id)
      .filter(Boolean) as string[]
  );

  const activeAssignmentGuardIds = new Set(
    assignments
      .filter((assignment) => ACTIVE_GUARD_ASSIGNMENT_STATUSES.has(String(assignment.status || '').toLowerCase()))
      .map((assignment) => assignment.guard_id)
      .filter(Boolean) as string[]
  );

  const summary = {
    totalGuards: guards.length,
    activeGuards: activeGuards.length,
    onDutyGuards: onDutyGuardIds.size,
    offDutyGuards: Math.max(0, activeGuards.length - onDutyGuardIds.size),
    availableGuards: Math.max(0, activeGuards.length - onDutyGuardIds.size),
    pendingAssignments: Math.max(0, activeGuards.length - activeAssignmentGuardIds.size),
    trainingRequired: legacyTraining.filter((training) =>
      SCHEDULED_GUARD_TRAINING_STATUSES.has(String(training.status || '').toLowerCase())
    ).length,
    expiredCertifications: legacyTraining.filter((training) => {
      const expiry = parseDate(training.certification_expiry);
      return (
        expiry &&
        expiry < today &&
        COMPLETED_GUARD_TRAINING_STATUSES.has(String(training.status || '').toLowerCase())
      );
    }).length,
  };

  const communityUnitCounts = units.reduce<Map<string, number>>((acc, unit) => {
    if (!unit.community_id) return acc;
    acc.set(unit.community_id, (acc.get(unit.community_id) || 0) + 1);
    return acc;
  }, new Map());

  const communityGuardCounts = assignments.reduce<Map<string, Set<string>>>((acc, assignment) => {
    if (!assignment.community_id || !assignment.guard_id) return acc;
    if (!ACTIVE_GUARD_ASSIGNMENT_STATUSES.has(String(assignment.status || '').toLowerCase())) return acc;
    const current = acc.get(assignment.community_id) || new Set<string>();
    current.add(assignment.guard_id);
    acc.set(assignment.community_id, current);
    return acc;
  }, new Map());

  const salaryByCommunity = guards.reduce<Map<string, { totalSalary: number; count: number }>>((acc, guard) => {
    if (!guard.community_id) return acc;
    const current = acc.get(guard.community_id) || { totalSalary: 0, count: 0 };
    current.totalSalary += Number(guard.salary || 0);
    current.count += 1;
    acc.set(guard.community_id, current);
    return acc;
  }, new Map());

  const communityOverview = communities
    .map((community) => {
      const totalUnits = communityUnitCounts.get(community.id) || 0;
      const currentGuards = communityGuardCounts.get(community.id)?.size || 0;
      const requiredGuards = Math.max(1, Math.ceil(totalUnits / 50));
      let securityRequirement: 'high' | 'medium' | 'low' = 'low';
      if (totalUnits > 150) securityRequirement = 'high';
      else if (totalUnits > 80) securityRequirement = 'medium';

      return {
        id: community.id,
        name: community.name || 'Unnamed Community',
        address: community.address || '',
        totalUnits,
        totalBuildings: 1,
        securityRequirement,
        currentGuards,
        requiredGuards,
      };
    })
    .sort((left, right) => right.currentGuards - left.currentGuards || right.requiredGuards - left.requiredGuards);

  const locationCards = communityOverview
    .filter((community) => community.currentGuards > 0 || community.requiredGuards > 0)
    .slice(0, 4)
    .map((community) => {
      const salaryInfo = salaryByCommunity.get(community.id);
      const avgSalary = salaryInfo && salaryInfo.count > 0 ? salaryInfo.totalSalary / salaryInfo.count : 0;
      const progress =
        community.requiredGuards > 0 ? Math.min((community.currentGuards / community.requiredGuards) * 100, 100) : 0;
      const staffingGap = Math.max(community.requiredGuards - community.currentGuards, 0);

      return {
        id: community.id,
        location: community.name,
        totalGuards: community.requiredGuards,
        activeGuards: community.currentGuards,
        detail: staffingGap > 0 ? `${staffingGap} short` : `${Math.round(progress)}% staffed`,
        progress: Math.round(progress),
        avgSalary: Math.round(avgSalary),
      };
    });

  const guardById = new Map(guards.map((guard) => [guard.id, guard]));

  const topGuards = performanceMetrics
    .map((metric) => {
      const guard = guardById.get(metric.guard_id);
      return {
        id: metric.id,
        guardId: metric.guard_id,
        guardName: getGuardName(guard),
        avatar: guard?.avatar_url || null,
        overallRating: Number(metric.overall_rating || 0),
        punctualityRating: Number(metric.punctuality_rating || 0),
        professionalismRating: Number(metric.professionalism_rating || 0),
        reliabilityRating: Number(metric.reliability_rating || 0),
        communicationRating: Number(metric.communication_rating || 0),
        attendancePercentage: Number(metric.attendance_percentage || 0),
        totalShifts: Number(metric.total_shifts || 0),
        completedShifts: Number(metric.completed_shifts || 0),
        lateArrivals: Number(metric.late_arrivals || 0),
        incidentReports: Number(metric.incident_reports || 0),
        compliments: Number(metric.compliments || 0),
        complaints: Number(metric.complaints || 0),
        lastReviewDate: metric.last_review_date || '',
        nextReviewDate: metric.next_review_date || '',
        status: metric.status || null,
        contactPhone: guard?.phone || guard?.mobile || null,
      };
    })
    .sort((left, right) => right.overallRating - left.overallRating)
    .slice(0, 5);

  const monthlyTrendBuckets = performanceTrends.reduce<
    Record<string, { label: string; performanceSum: number; attendanceSum: number; count: number }>
  >((acc, record) => {
    const evaluationDate = parseDate(record.evaluation_date);
    if (!evaluationDate) return acc;
    const key = monthKey(evaluationDate);
    if (!acc[key]) {
      acc[key] = {
        label: evaluationDate.toLocaleDateString('en-US', { month: 'short' }),
        performanceSum: 0,
        attendanceSum: 0,
        count: 0,
      };
    }

    acc[key].performanceSum += Number(record.overall_score || 0);
    acc[key].attendanceSum += Number(record.attendance_score || 0);
    acc[key].count += 1;
    return acc;
  }, {});

  const monthlyTrainingCompletion = legacyTraining.reduce<Record<string, { completed: number; total: number }>>((acc, record) => {
    const endDate = parseDate(record.end_date);
    if (!endDate) return acc;
    const key = monthKey(endDate);
    if (!acc[key]) acc[key] = { completed: 0, total: 0 };
    acc[key].total += 1;
    if (COMPLETED_GUARD_TRAINING_STATUSES.has(String(record.status || '').toLowerCase())) {
      acc[key].completed += 1;
    }
    return acc;
  }, {});

  const trendKeys = Object.keys(monthlyTrendBuckets).sort();

  const guardPerformanceTrends = {
    labels: trendKeys.map((key) => monthlyTrendBuckets[key].label),
    performanceScores: trendKeys.map((key) => round(monthlyTrendBuckets[key].performanceSum / monthlyTrendBuckets[key].count, 0)),
    attendanceRates: trendKeys.map((key) => round(monthlyTrendBuckets[key].attendanceSum / monthlyTrendBuckets[key].count, 0)),
    trainingCompletionRates: trendKeys.map((key) => {
      const bucket = monthlyTrainingCompletion[key];
      return bucket && bucket.total > 0 ? round((bucket.completed / bucket.total) * 100, 0) : 0;
    }),
  };

  const certifiedGuardCount = legacyTraining.filter((training) => {
    const expiry = parseDate(training.certification_expiry);
    return (
      expiry &&
      expiry > today &&
      COMPLETED_GUARD_TRAINING_STATUSES.has(String(training.status || '').toLowerCase())
    );
  }).length;

  const trainingStatus = {
    series: [
      {
        name: 'Guards',
        data: [certifiedGuardCount, summary.trainingRequired, summary.expiredCertifications],
      },
    ],
    categories: ['Certified', 'Training Required', 'Expired Certifications'],
  };

  const totalPrograms = trainingPrograms.length;
  const activePrograms = trainingPrograms.filter((program) => program.status === 'active').length;
  const completedTrainings = trainings.filter((training) => training.status === 'completed').length;
  const inProgressTrainings = trainings.filter((training) => training.status === 'in_progress').length;
  const totalCertifications = certifications.length;
  const validCertifications = certifications.filter((certification) =>
    VALID_CERTIFICATION_STATUSES.has(certification.status)
  ).length;
  const expiringSoon = certifications.filter((certification) =>
    EXPIRING_SOON_CERTIFICATION_STATUSES.has(certification.status)
  ).length;
  const expired = certifications.filter((certification) =>
    EXPIRED_CERTIFICATION_STATUSES.has(certification.status)
  ).length;
  const scores = trainings
    .map((training) => training.score)
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score));

  const trainingOverview = {
    totalPrograms,
    activePrograms,
    totalTrainings: trainings.length,
    completedTrainings,
    inProgressTrainings,
    totalCertifications,
    validCertifications,
    expiringSoon,
    expired,
    completionRate: trainings.length > 0 ? round((completedTrainings / trainings.length) * 100, 1) : 0,
    averageScore: scores.length > 0 ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length, 1) : 0,
  };

  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - totalWeeks * 7 + 1);

  const dutyBuckets = Array.from({ length: totalWeeks }, () => 0);
  const overtimeBuckets = Array.from({ length: totalWeeks }, () => 0);

  shifts.forEach((shift) => {
    const shiftDate = parseDate(shift.shift_date);
    if (!shiftDate) return;
    const daysFromStart = Math.max(
      0,
      Math.floor((shiftDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const weekIndex = Math.min(totalWeeks - 1, Math.floor(daysFromStart / 7));
    const hours = parseGuardShiftHours(shift.start_time, shift.end_time);
    dutyBuckets[weekIndex] += hours;
    overtimeBuckets[weekIndex] += Math.max(0, hours - 8);
  });

  const shiftTrends = {
    labels: Array.from({ length: totalWeeks }, (_, index) => `Week ${index + 1}`),
    totalDutyHours: dutyBuckets.map((hours) => Math.round(hours)),
    overtimeHours: overtimeBuckets.map((hours) => Math.round(hours)),
  };

  const latestAssignment = assignments[0];
  const latestAssignmentGuard = latestAssignment?.guard_id ? guardById.get(latestAssignment.guard_id) : null;
  const latestAssignmentCommunity = latestAssignment?.community_id
    ? communities.find((community) => community.id === latestAssignment.community_id)
    : null;

  return {
    summary,
    communityOverview,
    locationCards,
    topGuards,
    topGuardProfile: topGuards[0] || null,
    performanceTrends: guardPerformanceTrends,
    trainingStatus,
    trainingOverview,
    shiftTrends,
    recentAssignment: latestAssignment
      ? {
          id: latestAssignment.id,
          guardId: latestAssignment.guard_id || '',
          guardName: getGuardName(latestAssignmentGuard),
          guardAvatarUrl: latestAssignmentGuard?.avatar_url || null,
          guardContact: latestAssignmentGuard?.email || latestAssignmentGuard?.phone || latestAssignmentGuard?.mobile || null,
          societyName: latestAssignmentCommunity?.name || 'Unknown Community',
          postLocation: latestAssignment.assigned_location || latestAssignment.assigned_gate || 'Assigned location',
          assignmentType: guardAssignmentType(latestAssignment),
          shiftType: String(latestAssignment.shift_type || 'day'),
          priority: guardAssignmentPriority(latestAssignment),
          status: String(latestAssignment.status || 'active'),
        }
      : null,
  };
}

export async function getAnalyticsDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const days = Number(req.query.days || 7);
    const lastSevenDays = buildLastDays(days);
    const units = await loadScopedUnits(scope);
    const unitIds = units.map((unit) => unit.id);
    const [communities, residents, visitors] = await Promise.all([
      loadScopedCommunities(scope),
      loadScopedResidents(scope, unitIds),
      loadScopedVisitorPasses(scope, unitIds, lastSevenDays[0].toISOString().slice(0, 10)),
    ]);

    const activeResidents = residents.filter((resident) => resident.is_active);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const dailyApprovedSeries = lastSevenDays.map((bucketDate) =>
      visitors.filter((pass) => {
        const fromDate = parseDate(pass.from_date);
        const toDate = parseDate(pass.to_date);
        return fromDate && toDate ? fromDate <= bucketDate && toDate >= bucketDate : false;
      }).length
    );

    const todayApprovedCount = visitors.filter((pass) => {
      const fromDate = parseDate(pass.from_date);
      const toDate = parseDate(pass.to_date);
      return fromDate && toDate ? fromDate <= today && toDate >= startOfToday : false;
    }).length;

    const yesterdayApprovedCount = visitors.filter((pass) => {
      const fromDate = parseDate(pass.from_date);
      const toDate = parseDate(pass.to_date);
      return fromDate && toDate ? fromDate <= yesterday && toDate >= yesterday : false;
    }).length;

    const weeklyApprovedCount = visitors.filter((pass) => {
      const fromDate = parseDate(pass.from_date);
      const toDate = parseDate(pass.to_date);
      return fromDate && toDate ? fromDate <= today && toDate >= weekStart : false;
    }).length;

    return res.json({
      data: {
        summary: {
          totalUnits: units.length,
          occupiedRate: units.length > 0 ? round((units.filter((unit) => isOccupiedUnit(unit)).length / units.length) * 100, 0) : 0,
          cumulativeUnitSeries: getLastSevenDaysSeries(units),
          activeResidents: activeResidents.length,
          cumulativeResidentSeries: getLastSevenDaysSeries(residents),
        },
        visitorActivity: {
          dailyApprovedSeries,
          todayApprovedCount,
          weeklyApprovedCount,
          weeklyApprovedPercentage:
            activeResidents.length > 0 ? Math.min(Math.round((weeklyApprovedCount / activeResidents.length) * 100), 100) : 0,
          dayOverDayChangePercentage:
            yesterdayApprovedCount > 0 ? round(((todayApprovedCount - yesterdayApprovedCount) / yesterdayApprovedCount) * 100, 1) : null,
        },
        communityDistribution: buildAnalyticsCommunityDistribution(communities, units, residents),
      },
    });
  } catch (error) {
    return next(
      error instanceof Error && 'statusCode' in error
        ? error
        : createHttpError(500, 'ADMIN_ANALYTICS_DASHBOARD_FAILED', 'Failed to load the analytics dashboard', error)
    );
  }
}

export async function getResidentDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const months = Number(req.query.months || 12);
    const units = await loadScopedUnits(scope);
    const unitIds = units.map((unit) => unit.id);
    const [communities, residents] = await Promise.all([loadScopedCommunities(scope), loadScopedResidents(scope, unitIds)]);
    const residentIds = residents.map((resident) => resident.id);
    const [maintenanceRequests, inquiries] = await Promise.all([
      loadScopedMaintenanceRequests(unitIds),
      loadScopedInquiries(scope, residentIds),
    ]);

    return res.json({
      data: buildResidentDashboardPayload(residents, units, communities, maintenanceRequests, inquiries, months),
    });
  } catch (error) {
    return next(
      error instanceof Error && 'statusCode' in error
        ? error
        : createHttpError(500, 'ADMIN_RESIDENT_DASHBOARD_FAILED', 'Failed to load the resident dashboard', error)
    );
  }
}

export async function getGuardDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const weeks = Number(req.query.weeks || 4);
    const [guardIds, communities, units] = await Promise.all([
      getScopedGuardIds(scope),
      loadScopedCommunities(scope),
      loadScopedUnits(scope),
    ]);

    const shiftStartDate = new Date();
    shiftStartDate.setDate(shiftStartDate.getDate() - weeks * 7 + 1);

    const [
      guards,
      assignments,
      shifts,
      performanceMetrics,
      performanceTrends,
      legacyTraining,
      trainings,
      certifications,
      trainingPrograms,
    ] = await Promise.all([
      loadScopedGuards(scope, guardIds),
      loadScopedGuardAssignments(scope),
      loadScopedGuardShifts(scope, guardIds, shiftStartDate.toISOString().slice(0, 10)),
      loadScopedGuardPerformanceMetrics(scope, guardIds),
      loadScopedGuardPerformanceTrends(scope, guardIds),
      loadScopedLegacyGuardTraining(scope, guardIds),
      loadScopedGuardTrainings(scope, guardIds),
      loadScopedGuardCertifications(scope, guardIds),
      loadTrainingPrograms(),
    ]);

    return res.json({
      data: buildGuardDashboardPayload(
        guards,
        communities,
        units,
        assignments,
        shifts,
        performanceMetrics,
        performanceTrends,
        legacyTraining,
        trainings,
        certifications,
        trainingPrograms,
        weeks
      ),
    });
  } catch (error) {
    return next(
      error instanceof Error && 'statusCode' in error
        ? error
        : createHttpError(500, 'ADMIN_GUARD_DASHBOARD_FAILED', 'Failed to load the guard dashboard', error)
    );
  }
}
