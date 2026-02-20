import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ResidentActivity {
  id: string
  type: 'payment' | 'service' | 'activity'
  title: string
  status: string
  created_at: string
  amount?: number
  description?: string
}

export interface ResidentActivityStats {
  totalRequests: number
  paymentsMade: number
  activeServices: number
  completedPayments: number
  pendingPayments: number
}

// Get resident activities (payments, services, activity logs)
export const useResidentActivities = (residentId: string) => {
  return useQuery({
    queryKey: ['resident-activities', residentId],
    queryFn: async (): Promise<ResidentActivity[]> => {
      if (!residentId) return []

      try {
        const activities: ResidentActivity[] = []

        // Get payments for this resident's unit
        const { data: resident } = await supabase
          .from('profiles')
          .select('unit_id')
          .eq('id', residentId)
          .single()

        if (resident?.unit_id) {
          const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('unit_id', resident.unit_id)
            .order('due_date', { ascending: false })
            .limit(10)

          if (payments) {
            activities.push(...payments.map(payment => ({
              id: payment.id,
              type: 'payment' as const,
              title: payment.description || 'Payment',
              status: payment.status || 'pending',
              created_at: payment.due_date,
              amount: payment.amount,
              description: payment.notes || undefined
            })))
          }
        }

        // Get society services for this resident's society
        const { data: residentData } = await supabase
          .from('profiles')
          .select('society_id')
          .eq('id', residentId)
          .single()

        if (residentData?.society_id) {
          const { data: services } = await supabase
            .from('society_services')
            .select('*')
            .eq('society_id', residentData.society_id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5)

          if (services) {
            activities.push(...services.map(service => ({
              id: service.id,
              type: 'service' as const,
              title: service.name || 'Service',
              status: service.status || 'active',
              created_at: service.created_at,
              description: service.description
            })))
          }
        }

        // Get activity logs for this resident
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', residentId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (activityLogs) {
          activities.push(...activityLogs.map(log => ({
            id: log.id,
            type: 'activity' as const,
            title: log.action || 'Activity',
            status: log.status || 'completed',
            created_at: log.created_at || log.timestamp || new Date().toISOString(),
            description: log.details
          })))
        }

        // Sort all activities by date
        return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      } catch (error) {
        console.error('Error fetching resident activities:', error)
        return []
      }
    },
    enabled: !!residentId
  })
}

// Get resident activity statistics
export const useResidentActivityStats = (residentId: string) => {
  return useQuery({
    queryKey: ['resident-activity-stats', residentId],
    queryFn: async (): Promise<ResidentActivityStats> => {
      if (!residentId) {
        return {
          totalRequests: 0,
          paymentsMade: 0,
          activeServices: 0,
          completedPayments: 0,
          pendingPayments: 0
        }
      }

      try {
        const stats: ResidentActivityStats = {
          totalRequests: 0,
          paymentsMade: 0,
          activeServices: 0,
          completedPayments: 0,
          pendingPayments: 0
        }

        // Get resident's unit and society info
        const { data: resident } = await supabase
          .from('profiles')
          .select('unit_id, society_id')
          .eq('id', residentId)
          .single()

        if (resident?.unit_id) {
          // Count payments
          const { count: totalPayments } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('unit_id', resident.unit_id)

          const { count: completedPayments } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('unit_id', resident.unit_id)
            .eq('status', 'completed')

          const { count: pendingPayments } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('unit_id', resident.unit_id)
            .in('status', ['pending', 'overdue'])

          stats.paymentsMade = completedPayments || 0
          stats.completedPayments = completedPayments || 0
          stats.pendingPayments = pendingPayments || 0
          stats.totalRequests = totalPayments || 0
        }

        if (resident?.society_id) {
          // Count active services
          const { count: activeServicesCount } = await supabase
            .from('society_services')
            .select('*', { count: 'exact', head: true })
            .eq('society_id', resident.society_id)
            .eq('status', 'active')

          stats.activeServices = activeServicesCount || 0
        }

        return stats

      } catch (error) {
        console.error('Error fetching resident activity stats:', error)
        return {
          totalRequests: 0,
          paymentsMade: 0,
          activeServices: 0,
          completedPayments: 0,
          pendingPayments: 0
        }
      }
    },
    enabled: !!residentId
  })
} 