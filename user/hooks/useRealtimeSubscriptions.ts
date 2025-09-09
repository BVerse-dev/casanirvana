import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export const useRealtimeSubscriptions = (userId?: string, unitId?: string, societyId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const subscriptions: any[] = [];

    // Subscribe to visitor passes for user's unit
    if (unitId) {
      const visitorPassesSubscription = supabase
        .channel('visitor-passes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'visitor_passes',
            filter: `unit_id=eq.${unitId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['visitor-passes'] });
          }
        )
        .subscribe();
      subscriptions.push(visitorPassesSubscription);
    }

    // Subscribe to maintenance requests for user
    const maintenanceSubscription = supabase
      .channel('maintenance-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
        }
      )
      .subscribe();
    subscriptions.push(maintenanceSubscription);

    // Subscribe to complaints for user
    const complaintsSubscription = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['complaints'] });
        }
      )
      .subscribe();
    subscriptions.push(complaintsSubscription);

    // Subscribe to amenity bookings for user
    const amenityBookingsSubscription = supabase
      .channel('amenity-bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'amenity_bookings',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['amenity-bookings'] });
        }
      )
      .subscribe();
    subscriptions.push(amenityBookingsSubscription);

    // Subscribe to payments for user's unit
    if (unitId) {
      const paymentsSubscription = supabase
        .channel('payments-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `unit_id=eq.${unitId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
          }
        )
        .subscribe();
      subscriptions.push(paymentsSubscription);
    }

    // Subscribe to messages for user
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();
    subscriptions.push(messagesSubscription);

    // Subscribe to notices for user's society
    if (societyId) {
      const noticesSubscription = supabase
        .channel('notices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notices',
            filter: `society_id=eq.${societyId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
          }
        )
        .subscribe();
      subscriptions.push(noticesSubscription);
    }

    // Subscribe to comments for all notices
    const commentsSubscription = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          // Invalidate comments for the specific notice
          if (payload.new && 'notice_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['comments', payload.new.notice_id] });
          }
          if (payload.old && 'notice_id' in payload.old) {
            queryClient.invalidateQueries({ queryKey: ['comments', payload.old.notice_id] });
          }
        }
      )
      .subscribe();
    subscriptions.push(commentsSubscription);

    // Subscribe to emergency alerts for user's society
    if (societyId) {
      const emergencyAlertsSubscription = supabase
        .channel('emergency-alerts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'emergency_alerts',
            filter: `society_id=eq.${societyId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
          }
        )
        .subscribe();
      subscriptions.push(emergencyAlertsSubscription);
    }

    // Subscribe to amenities for user's society
    if (societyId) {
      const amenitiesSubscription = supabase
        .channel('amenities-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'amenities',
            filter: `society_id=eq.${societyId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['amenities'] });
          }
        )
        .subscribe();
      subscriptions.push(amenitiesSubscription);
    }

    // Subscribe to profile changes for the user
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      )
      .subscribe();
    subscriptions.push(profileSubscription);

    // Cleanup function
    return () => {
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, [userId, unitId, societyId, queryClient]);
};
