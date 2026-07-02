"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

export interface GuardSummary {
  totalGuards: number;
  activeGuards: number;
  onDutyGuards: number;
  offDutyGuards: number;
  availableGuards: number;
  pendingAssignments: number;
  trainingRequired: number;
  expiredCertifications: number;
}

export interface GuardPerformanceTrends {
  labels: string[];
  performanceScores: number[];
  attendanceRates: number[];
  trainingCompletionRates: number[];
}

export interface GuardTrainingStatus {
  series: Array<{
    name: string;
    data: number[];
  }>;
  categories: string[];
}

export interface GuardShiftTrends {
  labels: string[];
  totalDutyHours: number[];
  overtimeHours: number[];
}

export interface GuardCommunityOverview {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  totalBuildings: number;
  securityRequirement: "high" | "medium" | "low";
  currentGuards: number;
  requiredGuards: number;
}

export interface GuardLocationCard {
  id: string;
  location: string;
  totalGuards: number;
  activeGuards: number;
  detail: string;
  progress: number;
  avgSalary: number;
}

export interface GuardLeaderboardRow {
  id: string;
  guardId: string;
  guardName: string;
  avatar: string | null;
  overallRating: number;
  punctualityRating: number;
  professionalismRating: number;
  reliabilityRating: number;
  communicationRating: number;
  attendancePercentage: number;
  totalShifts: number;
  completedShifts: number;
  lateArrivals: number;
  incidentReports: number;
  compliments: number;
  complaints: number;
  lastReviewDate: string;
  nextReviewDate: string;
  status: string | null;
  contactPhone: string | null;
}

export interface GuardTrainingOverview {
  totalPrograms: number;
  activePrograms: number;
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  totalCertifications: number;
  validCertifications: number;
  expiringSoon: number;
  expired: number;
  completionRate: number;
  averageScore: number;
}

export interface RecentGuardAssignment {
  id: string;
  guardId: string;
  guardName: string;
  guardAvatarUrl: string | null;
  guardContact: string | null;
  societyName: string;
  postLocation: string;
  assignmentType: string;
  shiftType: string;
  priority: string;
  status: string;
}

export interface GuardDashboardSnapshot {
  summary: GuardSummary;
  communityOverview: GuardCommunityOverview[];
  locationCards: GuardLocationCard[];
  topGuards: GuardLeaderboardRow[];
  topGuardProfile: GuardLeaderboardRow | null;
  performanceTrends: GuardPerformanceTrends;
  trainingStatus: GuardTrainingStatus;
  trainingOverview: GuardTrainingOverview;
  shiftTrends: GuardShiftTrends;
  recentAssignment: RecentGuardAssignment | null;
}

const useGuardDashboardQuery = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["admin-dashboard", "guards"],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: GuardDashboardSnapshot }>("/admin/dashboard/guards");
      return payload.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useGuardDashboardSnapshot = () => useGuardDashboardQuery();

export const useGuardSummary = () => {
  const query = useGuardDashboardQuery();
  return { ...query, data: query.data?.summary };
};

export const useGuardPerformanceTrends = () => {
  const query = useGuardDashboardQuery();
  return { ...query, data: query.data?.performanceTrends };
};

export const useGuardDutyDistribution = () => {
  const query = useGuardDashboardQuery();
  const summary = query.data?.summary;

  return {
    ...query,
    data: summary
      ? {
          series: [
            summary.onDutyGuards,
            summary.availableGuards,
            summary.offDutyGuards,
            summary.trainingRequired,
          ],
          labels: ["On Duty", "Available", "Off Duty", "Training"],
        }
      : undefined,
  };
};

export const useGuardTrainingStatus = () => {
  const query = useGuardDashboardQuery();
  return { ...query, data: query.data?.trainingStatus };
};

export const useGuardShiftTrends = () => {
  const query = useGuardDashboardQuery();
  return { ...query, data: query.data?.shiftTrends };
};

export const useRecentGuardActivities = () => {
  const query = useGuardDashboardQuery();
  const recentAssignment = query.data?.recentAssignment;

  return {
    ...query,
    data: recentAssignment
      ? [
          {
            id: recentAssignment.id,
            type: "assignment",
            title: `Assignment updated for ${recentAssignment.guardName}`,
            description: `${recentAssignment.postLocation} at ${recentAssignment.societyName}`,
            time: recentAssignment.status,
            icon: "ri:shield-user-line",
            color: "primary",
          },
        ]
      : [],
  };
};
