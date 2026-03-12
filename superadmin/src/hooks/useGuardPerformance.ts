import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';

// Type definitions based on UI requirements
export interface GuardPerformance {
  id: string;
  guardId: string;
  guardName: string;
  avatar?: string;
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
  status: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
  monthlyProgress: {
    month: string;
    rating: number;
    attendance: number;
  }[];
}

export interface PerformanceReview {
  id: string;
  guardId: string;
  guardName: string;
  reviewDate: string;
  reviewerId: string;
  reviewerName: string;
  overallRating: number;
  punctualityRating: number;
  professionalismRating: number;
  reliabilityRating: number;
  communicationRating: number;
  strengths: string;
  areasForImprovement: string;
  goals: string;
  comments: string;
  actionPlan: string;
  followUpDate: string;
  status: 'draft' | 'completed' | 'acknowledged';
}

export interface CreateReviewData {
  guardId: string;
  overallRating: number;
  punctualityRating: number;
  professionalismRating: number;
  reliabilityRating: number;
  communicationRating: number;
  strengths: string;
  areasForImprovement: string;
  goals?: string;
  comments?: string;
  actionPlan?: string;
  followUpDate: string;
}

export interface PerformanceStats {
  totalGuards: number;
  averageRating: number;
  averageAttendance: number;
  totalCompliments: number;
  totalComplaints: number;
  performanceDistribution: {
    excellent: number;
    good: number;
    satisfactory: number;
    needsImprovement: number;
    poor: number;
  };
}

// Query Keys
const QUERY_KEYS = {
  performances: ['guard-performances'] as const,
  performanceById: (id: string) => ['guard-performances', id] as const,
  reviews: ['performance-reviews'] as const,
  reviewById: (id: string) => ['performance-reviews', id] as const,
  reviewsByGuard: (guardId: string) => ['performance-reviews', 'by-guard', guardId] as const,
  performanceStats: ['performance-stats'] as const,
};

type GuardLookup = Pick<
  Database['public']['Tables']['guards']['Row'],
  'id' | 'full_name' | 'first_name' | 'last_name' | 'avatar_url'
>;

const formatGuardName = (guard?: Partial<GuardLookup> | null) => {
  if (!guard) return 'Unknown';
  const fullName = guard.full_name?.trim();
  if (fullName) return fullName;
  const parts = [guard.first_name?.trim(), guard.last_name?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unknown';
};

// Hook for fetching all guard performance data
export const useGuardPerformances = () => {
  return useQuery({
    queryKey: QUERY_KEYS.performances,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guard_performance_metrics')
        .select(`
          id,
          guard_id,
          overall_rating,
          punctuality_rating,
          professionalism_rating,
          reliability_rating,
          communication_rating,
          attendance_percentage,
          total_shifts,
          completed_shifts,
          late_arrivals,
          incident_reports,
          compliments,
          complaints,
          last_review_date,
          next_review_date,
          status,
          monthly_progress,
          created_at,
          updated_at
        `)
        .order('overall_rating', { ascending: false });

      if (error) {
        console.error('Error fetching guard performances:', error);
        throw new Error(`Failed to fetch guard performances: ${error.message}`);
      }

      // Fetch related guard data
      const performances = data || [];
      const guardIds = performances.map(p => p.guard_id).filter(Boolean);

      // Fetch guards data
      const { data: guardsData } = await supabase
        .from('guards')
        .select('id, full_name, first_name, last_name, avatar_url')
        .in('id', guardIds);

      // Create lookup map
      const guardsMap = new Map(guardsData?.map(g => [g.id, g]) || []);

      // Transform performance data with guard details
      return performances.map(performance => {
        const guard = guardsMap.get(performance.guard_id);
        
        return {
          id: performance.id,
          guardId: performance.guard_id,
          guardName: formatGuardName(guard),
          avatar: guard?.avatar_url,
          overallRating: Number(performance.overall_rating) || 0,
          punctualityRating: Number(performance.punctuality_rating) || 0,
          professionalismRating: Number(performance.professionalism_rating) || 0,
          reliabilityRating: Number(performance.reliability_rating) || 0,
          communicationRating: Number(performance.communication_rating) || 0,
          attendancePercentage: Number(performance.attendance_percentage) || 0,
          totalShifts: performance.total_shifts || 0,
          completedShifts: performance.completed_shifts || 0,
          lateArrivals: performance.late_arrivals || 0,
          incidentReports: performance.incident_reports || 0,
          compliments: performance.compliments || 0,
          complaints: performance.complaints || 0,
          lastReviewDate: performance.last_review_date || '',
          nextReviewDate: performance.next_review_date || '',
          status: performance.status as GuardPerformance['status'],
          monthlyProgress: Array.isArray(performance.monthly_progress) 
            ? performance.monthly_progress 
            : [],
        } as GuardPerformance;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Hook for fetching performance reviews
export const usePerformanceReviews = () => {
  return useQuery({
    queryKey: QUERY_KEYS.reviews,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guard_performance_reviews')
        .select(`
          id,
          guard_id,
          reviewer_id,
          review_date,
          overall_rating,
          punctuality_rating,
          professionalism_rating,
          reliability_rating,
          communication_rating,
          strengths,
          areas_for_improvement,
          goals,
          comments,
          action_plan,
          follow_up_date,
          status,
          created_at,
          updated_at
        `)
        .order('review_date', { ascending: false });

      if (error) {
        console.error('Error fetching performance reviews:', error);
        throw new Error(`Failed to fetch performance reviews: ${error.message}`);
      }

      // Fetch related data
      const reviews = data || [];
      const guardIds = [...new Set(reviews.map(r => r.guard_id))];
      const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id).filter(Boolean))];

      // Fetch guard and reviewer data
      const { data: guardsData } = await supabase
        .from('guards')
        .select('id, full_name, first_name, last_name')
        .in('id', guardIds);

      const { data: reviewersData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', reviewerIds);

      // Create lookup maps
      const guardsMap = new Map(guardsData?.map(g => [g.id, g]) || []);
      const reviewersMap = new Map(reviewersData?.map(r => [r.id, r]) || []);

      // Transform reviews with related data
      return reviews.map(review => {
        const guard = guardsMap.get(review.guard_id);
        const reviewer = review.reviewer_id ? reviewersMap.get(review.reviewer_id) : null;

        return {
          id: review.id,
          guardId: review.guard_id,
          guardName: formatGuardName(guard),
          reviewDate: review.review_date,
          reviewerId: review.reviewer_id || '',
          reviewerName: reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : 'Unknown',
          overallRating: Number(review.overall_rating),
          punctualityRating: Number(review.punctuality_rating),
          professionalismRating: Number(review.professionalism_rating),
          reliabilityRating: Number(review.reliability_rating),
          communicationRating: Number(review.communication_rating),
          strengths: review.strengths || '',
          areasForImprovement: review.areas_for_improvement || '',
          goals: review.goals || '',
          comments: review.comments || '',
          actionPlan: review.action_plan || '',
          followUpDate: review.follow_up_date || '',
          status: review.status as PerformanceReview['status'],
        } as PerformanceReview;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for performance statistics
export const usePerformanceStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.performanceStats,
    queryFn: async () => {
      const { data: performances, error } = await supabase
        .from('guard_performance_metrics')
        .select(`
          overall_rating,
          attendance_percentage,
          compliments,
          complaints,
          status
        `);

      if (error) {
        console.error('Error fetching performance stats:', error);
        throw new Error(`Failed to fetch performance stats: ${error.message}`);
      }

      if (!performances || performances.length === 0) {
        return {
          totalGuards: 0,
          averageRating: 0,
          averageAttendance: 0,
          totalCompliments: 0,
          totalComplaints: 0,
          performanceDistribution: {
            excellent: 0,
            good: 0,
            satisfactory: 0,
            needsImprovement: 0,
            poor: 0,
          },
        };
      }

      const totalGuards = performances.length;
      const averageRating = performances.reduce((sum, p) => sum + (Number(p.overall_rating) || 0), 0) / totalGuards;
      const averageAttendance = performances.reduce((sum, p) => sum + (Number(p.attendance_percentage) || 0), 0) / totalGuards;
      const totalCompliments = performances.reduce((sum, p) => sum + (p.compliments || 0), 0);
      const totalComplaints = performances.reduce((sum, p) => sum + (p.complaints || 0), 0);

      // Calculate distribution
      const distribution = performances.reduce((acc, p) => {
        switch (p.status) {
          case 'excellent':
            acc.excellent++;
            break;
          case 'good':
            acc.good++;
            break;
          case 'satisfactory':
            acc.satisfactory++;
            break;
          case 'needs_improvement':
            acc.needsImprovement++;
            break;
          case 'poor':
            acc.poor++;
            break;
        }
        return acc;
      }, {
        excellent: 0,
        good: 0,
        satisfactory: 0,
        needsImprovement: 0,
        poor: 0,
      });

      return {
        totalGuards,
        averageRating: Number(averageRating.toFixed(2)),
        averageAttendance: Number(averageAttendance.toFixed(1)),
        totalCompliments,
        totalComplaints,
        performanceDistribution: distribution,
      } as PerformanceStats;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Mutation for creating a performance review
export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      const { data, error } = await supabase
        .from('guard_performance_reviews')
        .insert({
          guard_id: reviewData.guardId,
          reviewer_id: null,
          overall_rating: reviewData.overallRating,
          punctuality_rating: reviewData.punctualityRating,
          professionalism_rating: reviewData.professionalismRating,
          reliability_rating: reviewData.reliabilityRating,
          communication_rating: reviewData.communicationRating,
          strengths: reviewData.strengths,
          areas_for_improvement: reviewData.areasForImprovement,
          goals: reviewData.goals || null,
          comments: reviewData.comments || null,
          action_plan: reviewData.actionPlan || null,
          follow_up_date: reviewData.followUpDate,
          status: 'completed',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating performance review:', error);
        throw new Error(`Failed to create performance review: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performances });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceStats });
      toast.success('Performance review created successfully!');
    },
    onError: (error: Error) => {
      console.error('Create review error:', error);
      toast.error(error.message || 'Failed to create performance review');
    },
  });
};

// Mutation for updating a performance review
export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reviewData }: { id: string; reviewData: Partial<CreateReviewData> }) => {
      const updateData: any = {};
      
      if (reviewData.overallRating !== undefined) updateData.overall_rating = reviewData.overallRating;
      if (reviewData.punctualityRating !== undefined) updateData.punctuality_rating = reviewData.punctualityRating;
      if (reviewData.professionalismRating !== undefined) updateData.professionalism_rating = reviewData.professionalismRating;
      if (reviewData.reliabilityRating !== undefined) updateData.reliability_rating = reviewData.reliabilityRating;
      if (reviewData.communicationRating !== undefined) updateData.communication_rating = reviewData.communicationRating;
      if (reviewData.strengths !== undefined) updateData.strengths = reviewData.strengths;
      if (reviewData.areasForImprovement !== undefined) updateData.areas_for_improvement = reviewData.areasForImprovement;
      if (reviewData.goals !== undefined) updateData.goals = reviewData.goals || null;
      if (reviewData.comments !== undefined) updateData.comments = reviewData.comments || null;
      if (reviewData.actionPlan !== undefined) updateData.action_plan = reviewData.actionPlan || null;
      if (reviewData.followUpDate !== undefined) updateData.follow_up_date = reviewData.followUpDate;

      const { data, error } = await supabase
        .from('guard_performance_reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating performance review:', error);
        throw new Error(`Failed to update performance review: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performances });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceStats });
      toast.success('Performance review updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update review error:', error);
      toast.error(error.message || 'Failed to update performance review');
    },
  });
};

// Mutation for updating review status
export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PerformanceReview['status'] }) => {
      const { data, error } = await supabase
        .from('guard_performance_reviews')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review status:', error);
        throw new Error(`Failed to update review status: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
      toast.success('Review status updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update review status error:', error);
      toast.error(error.message || 'Failed to update review status');
    },
  });
};

// Mutation for deleting a performance review
export const useDeletePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guard_performance_reviews')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting performance review:', error);
        throw new Error(`Failed to delete performance review: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performances });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceStats });
      toast.success('Performance review deleted successfully!');
    },
    onError: (error: Error) => {
      console.error('Delete review error:', error);
      toast.error(error.message || 'Failed to delete performance review');
    },
  });
};

// Mutation for updating performance metrics manually
export const useUpdatePerformanceMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      guardId, 
      metrics 
    }: { 
      guardId: string; 
      metrics: Partial<{
        attendancePercentage: number;
        totalShifts: number;
        completedShifts: number;
        lateArrivals: number;
        incidentReports: number;
        compliments: number;
        complaints: number;
      }> 
    }) => {
      const updateData: any = {};
      
      if (metrics.attendancePercentage !== undefined) updateData.attendance_percentage = metrics.attendancePercentage;
      if (metrics.totalShifts !== undefined) updateData.total_shifts = metrics.totalShifts;
      if (metrics.completedShifts !== undefined) updateData.completed_shifts = metrics.completedShifts;
      if (metrics.lateArrivals !== undefined) updateData.late_arrivals = metrics.lateArrivals;
      if (metrics.incidentReports !== undefined) updateData.incident_reports = metrics.incidentReports;
      if (metrics.compliments !== undefined) updateData.compliments = metrics.compliments;
      if (metrics.complaints !== undefined) updateData.complaints = metrics.complaints;

      const { data, error } = await supabase
        .from('guard_performance_metrics')
        .upsert({ guard_id: guardId, ...updateData })
        .select()
        .single();

      if (error) {
        console.error('Error updating performance metrics:', error);
        throw new Error(`Failed to update performance metrics: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performances });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceStats });
      toast.success('Performance metrics updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Update metrics error:', error);
      toast.error(error.message || 'Failed to update performance metrics');
    },
  });
};

// Hook to setup real-time subscriptions
export const useGuardPerformanceRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const reviewsChannel = supabase
      .channel('guard_performance_reviews_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guard_performance_reviews',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performances });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceStats });
        }
      )
      .subscribe();

    const metricsChannel = supabase
      .channel('guard_performance_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guard_performance_metrics',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performances });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performanceStats });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(metricsChannel);
    };
  }, [queryClient]);
}; 
