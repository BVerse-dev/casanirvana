// Overview page integration hooks to supplement the existing useGuards hooks

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Helper function for relative time
const toRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} week${Math.round(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Activity interface
interface GuardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

type SortedGuardActivity = GuardActivity & {
  sortAt: number;
};

// Fetch guard summary statistics
export const useGuardSummary = () => {
  return useQuery({
    queryKey: ['guard-summary'],
    queryFn: async () => {
      try {
        // Get total guards count
        const { count: totalGuards, error: countError } = await supabase
          .from('guards')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get active guards count
        const { count: activeGuards, error: activeError } = await supabase
          .from('guards')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (activeError) throw activeError;
        const safeActiveGuards = activeGuards || 0;

        // Get on duty guards (those with active shifts today)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const { count: onDutyGuards, error: onDutyError } = await supabase
          .from('guard_shifts')
          .select('*', { count: 'exact', head: true })
          .eq('shift_date', today)
          .eq('status', 'scheduled');

        if (onDutyError) throw onDutyError;
        const safeOnDutyGuards = onDutyGuards || 0;

        // Get active guard assignments so we can track guards awaiting assignment.
        const { data: activeAssignments, error: assignmentError } = await supabase
          .from('guard_assignments')
          .select('guard_id')
          .eq('status', 'active');

        if (assignmentError) throw assignmentError;

        const assignedGuardIds = new Set(
          (activeAssignments || [])
            .map((assignment) => assignment.guard_id)
            .filter((guardId): guardId is string => Boolean(guardId))
        );

        const pendingAssignments = Math.max(0, safeActiveGuards - assignedGuardIds.size);

        // Get available guards (active but not on duty)
        const availableGuards = Math.max(0, safeActiveGuards - safeOnDutyGuards);
        
        // Get training required count
        const { count: trainingRequired, error: trainingError } = await supabase
          .from('guard_training')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled');

        if (trainingError) throw trainingError;

        // Get expired certifications count
        const today2 = new Date();
        const { count: expiredCertifications, error: expiredError } = await supabase
          .from('guard_training')
          .select('*', { count: 'exact', head: true })
          .lt('certification_expiry', today2.toISOString())
          .eq('status', 'completed');

        if (expiredError) throw expiredError;

        return {
          totalGuards: totalGuards || 0,
          activeGuards: safeActiveGuards,
          onDutyGuards: safeOnDutyGuards,
          offDutyGuards: Math.max(0, safeActiveGuards - safeOnDutyGuards),
          availableGuards: availableGuards || 0,
          pendingAssignments,
          trainingRequired: trainingRequired || 0,
          expiredCertifications: expiredCertifications || 0
        };
      } catch (error) {
        console.error('Error fetching guard summary:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Fetch guard performance data for charts
export const useGuardPerformanceTrends = () => {
  return useQuery({
    queryKey: ['guard-performance-trends'],
    queryFn: async () => {
      try {
        // Get performance data aggregated by month
        const { data, error } = await supabase
          .from('guard_performance')
          .select('evaluation_date, attendance_score, overall_score')
          .order('evaluation_date', { ascending: true });

        if (error) throw error;

        // Process data to get monthly averages
        const monthlyData = (data || []).reduce((acc, record) => {
          const date = new Date(record.evaluation_date);
          const monthKey = date.toISOString().slice(0, 7);
          const monthLabel = date.toLocaleString('default', { month: 'short' });
          
          if (!acc[monthKey]) {
            acc[monthKey] = {
              label: monthLabel,
              performanceSum: 0,
              attendanceSum: 0,
              count: 0
            };
          }
          
          acc[monthKey].performanceSum += record.overall_score || 0;
          acc[monthKey].attendanceSum += record.attendance_score || 0;
          acc[monthKey].count += 1;
          
          return acc;
        }, {} as Record<string, { label: string; performanceSum: number; attendanceSum: number; count: number }>);
        
        // Convert to series format for ApexCharts
        const monthKeys = Object.keys(monthlyData).sort();
        const months = monthKeys.map((monthKey) => monthlyData[monthKey].label);
        const performanceData = monthKeys.map(monthKey => 
          Math.round(monthlyData[monthKey].performanceSum / monthlyData[monthKey].count)
        );
        const attendanceData = monthKeys.map(monthKey => 
          Math.round(monthlyData[monthKey].attendanceSum / monthlyData[monthKey].count)
        );
        
        // Get training completion data from guard_training
        const { data: trainingData, error: trainingError } = await supabase
          .from('guard_training')
          .select('end_date, status')
          .order('end_date', { ascending: true });

        if (trainingError) throw trainingError;

        // Process training data by month
        const trainingMonthly = (trainingData || []).reduce((acc, record) => {
          if (!record.end_date) return acc;
          
          const date = new Date(record.end_date);
          const monthKey = date.toISOString().slice(0, 7);
          
          if (!acc[monthKey]) {
            acc[monthKey] = {
              completed: 0,
              total: 0
            };
          }
          
          acc[monthKey].total += 1;
          if (record.status === 'completed') {
            acc[monthKey].completed += 1;
          }
          
          return acc;
        }, {} as Record<string, { completed: number; total: number }>);

        // Calculate training completion percentages
        const trainingCompletionData = monthKeys.map((monthKey) => {
          const bucket = trainingMonthly[monthKey];
          if (!bucket || bucket.total === 0) return 0;
          return Math.round((bucket.completed / bucket.total) * 100);
        });

        return {
          labels: months,
          performanceScores: performanceData,
          attendanceRates: attendanceData,
          trainingCompletionRates: trainingCompletionData
        };
      } catch (error) {
        console.error('Error fetching guard performance trends:', error);
        throw error;
      }
    }
  });
};

// Fetch duty distribution data for donut chart
export const useGuardDutyDistribution = () => {
  return useQuery({
    queryKey: ['guard-duty-distribution'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Get on duty count
        const { count: onDuty, error: onDutyError } = await supabase
          .from('guard_shifts')
          .select('*', { count: 'exact', head: true })
          .eq('shift_date', today)
          .eq('status', 'scheduled');
        
        if (onDutyError) throw onDutyError;
        
        // Get active guards count
        const { count: active, error: activeError } = await supabase
          .from('guards')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        
        if (activeError) throw activeError;
        
        // Calculate available (active but not on duty)
        const safeActive = active || 0;
        const safeOnDuty = onDuty || 0;
        const available = Math.max(0, safeActive - safeOnDuty);
        
        // Get off duty count (inactive guards)
        const { count: inactive, error: inactiveError } = await supabase
          .from('guards')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', false);
        
        if (inactiveError) throw inactiveError;
        
        // Get training count (guards in training)
        const { count: inTraining, error: trainingError } = await supabase
          .from('guard_training')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');
        
        if (trainingError) throw trainingError;
        
        return {
          series: [safeOnDuty, available, inactive || 0, inTraining || 0],
          labels: ['On Duty', 'Available', 'Off Duty', 'Training']
        };
      } catch (error) {
        console.error('Error fetching guard duty distribution:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Fetch training status data for bar chart
export const useGuardTrainingStatus = () => {
  return useQuery({
    queryKey: ['guard-training-status'],
    queryFn: async () => {
      try {
        const today = new Date();
        
        // Get certified guards count
        const { count: certified, error: certifiedError } = await supabase
          .from('guard_training')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gt('certification_expiry', today.toISOString());
        
        if (certifiedError) throw certifiedError;
        
        // Get training required count
        const { count: trainingRequired, error: requiredError } = await supabase
          .from('guard_training')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled');
        
        if (requiredError) throw requiredError;
        
        // Get expired certifications count
        const { count: expired, error: expiredError } = await supabase
          .from('guard_training')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .lt('certification_expiry', today.toISOString());
        
        if (expiredError) throw expiredError;
        
        return {
          series: [{
            name: 'Guards',
            data: [certified || 0, trainingRequired || 0, expired || 0]
          }],
          categories: ['Certified', 'Training Required', 'Expired Certifications']
        };
      } catch (error) {
        console.error('Error fetching guard training status:', error);
        throw error;
      }
    }
  });
};

// Fetch recent shift-hour trends for the analytics view
export const useGuardShiftTrends = () => {
  return useQuery({
    queryKey: ['guard-shift-trends'],
    queryFn: async () => {
      try {
        const periodEnd = new Date();
        const periodStart = new Date();
        periodStart.setDate(periodEnd.getDate() - 27);

        const { data, error } = await supabase
          .from('guard_shifts')
          .select('shift_date, start_time, end_time')
          .gte('shift_date', periodStart.toISOString().slice(0, 10))
          .lte('shift_date', periodEnd.toISOString().slice(0, 10))
          .order('shift_date', { ascending: true });

        if (error) throw error;

        const weeklyBuckets = [0, 0, 0, 0];
        const overtimeBuckets = [0, 0, 0, 0];

        const parseShiftHours = (startTime?: string | null, endTime?: string | null) => {
          if (!startTime || !endTime) return 0;

          const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number);
          const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number);

          const start = startHour + startMinute / 60;
          let end = endHour + endMinute / 60;
          if (end < start) {
            end += 24;
          }

          return Math.max(0, end - start);
        };

        (data || []).forEach((shift) => {
          const shiftDate = new Date(shift.shift_date);
          const daysFromStart = Math.max(
            0,
            Math.floor((shiftDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
          );
          const weekIndex = Math.min(3, Math.floor(daysFromStart / 7));
          const hours = parseShiftHours(shift.start_time, shift.end_time);

          weeklyBuckets[weekIndex] += hours;
          overtimeBuckets[weekIndex] += Math.max(0, hours - 8);
        });

        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          totalDutyHours: weeklyBuckets.map((hours) => Math.round(hours)),
          overtimeHours: overtimeBuckets.map((hours) => Math.round(hours)),
        };
      } catch (error) {
        console.error('Error fetching guard shift trends:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000,
  });
};

// Fetch recent guard activities
export const useRecentGuardActivities = () => {
  return useQuery({
    queryKey: ['recent-guard-activities'],
    queryFn: async () => {
      try {
        const activities: SortedGuardActivity[] = [];
        
        // Get recent shift assignments
        const { data: shifts, error: shiftsError } = await supabase
          .from('guard_shifts')
          .select(`
            id,
            guard_id,
            community_id,
            shift_date,
            location,
            status,
            created_at,
            guards:guard_id (
              full_name
            ),
            communities:community_id (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (shiftsError) throw shiftsError;
        
        if (shifts) {
          shifts.forEach(shift => {
            activities.push({
              id: `shift-${shift.id}`,
              type: 'assignment',
              title: 'New Guard Assignment',
              description: `${shift.guards?.full_name || 'Guard'} assigned to ${shift.communities?.name || 'Community'} - ${shift.location}`,
              time: toRelativeTime(new Date(shift.created_at)),
              icon: 'ri:user-add-line',
              color: 'success',
              sortAt: new Date(shift.created_at).getTime(),
            });
          });
        }
        
        // Get recent completed trainings
        const { data: trainings, error: trainingsError } = await supabase
          .from('guard_training')
          .select(`
            id,
            guard_id,
            training_name,
            end_date,
            status,
            guards:guard_id (
              full_name
            )
          `)
          .eq('status', 'completed')
          .order('end_date', { ascending: false })
          .limit(5);
        
        if (trainingsError) throw trainingsError;
        
        if (trainings) {
          trainings.forEach(training => {
            if (training.end_date) {
              activities.push({
                id: `training-${training.id}`,
                type: 'training',
                title: 'Training Completed',
                description: `${training.guards?.full_name || 'Guard'} completed ${training.training_name}`,
                time: toRelativeTime(new Date(training.end_date)),
                icon: 'ri:graduation-cap-line',
                color: 'info',
                sortAt: new Date(training.end_date).getTime(),
              });
            }
          });
        }
        
        // Get certifications expiring soon
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);
        
        const { data: expiringCerts, error: expiringError } = await supabase
          .from('guard_training')
          .select(`
            id,
            guard_id,
            certification,
            certification_expiry,
            guards:guard_id (
              full_name
            )
          `)
          .gt('certification_expiry', today.toISOString())
          .lt('certification_expiry', sevenDaysLater.toISOString())
          .order('certification_expiry', { ascending: true })
          .limit(5);
        
        if (expiringError) throw expiringError;
        
        if (expiringCerts) {
          expiringCerts.forEach(cert => {
            const daysLeft = Math.ceil((new Date(cert.certification_expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            activities.push({
              id: `cert-${cert.id}`,
              type: 'alert',
              title: 'Certification Expiring',
              description: `${cert.guards?.full_name || 'Guard'}'s ${cert.certification} expires in ${daysLeft} days`,
              time: `${daysLeft} days remaining`,
              icon: 'ri:alarm-warning-line',
              color: 'warning',
              sortAt: new Date(cert.certification_expiry).getTime(),
            });
          });
        }
        
        // Sort by recency and limit to 10 items
        activities.sort((a, b) => b.sortAt - a.sortAt);
        
        return activities.slice(0, 10).map(({ sortAt: _sortAt, ...activity }) => activity);
      } catch (error) {
        console.error('Error fetching recent guard activities:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};
