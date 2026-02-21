import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export const useRealtimeSubscriptions = (
  userId?: string,
  unitId?: string,
  communityId?: string,
  profileId?: string,
) => {
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

    // Subscribe to maintenance requests for current profile
    if (profileId) {
      const maintenanceSubscription = supabase
        .channel('maintenance-requests-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'maintenance_requests',
            filter: `requested_by=eq.${profileId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === 'maintenance-requests' ||
                query.queryKey[0] === 'maintenance',
            });
          }
        )
        .subscribe();
      subscriptions.push(maintenanceSubscription);
    }

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

    // Subscribe to service requests for current actor
    const serviceRequestsSubscription = supabase
      .channel('service-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
        },
        (payload) => {
          const row = (payload.new || payload.old) as {
            user_id?: string | null;
            created_by?: string | null;
            id?: string | null;
          } | null;

          if (!row) return;
          if (row.user_id !== userId && row.created_by !== userId) return;

          queryClient.invalidateQueries({ queryKey: ['service-requests'] });
          queryClient.invalidateQueries({ queryKey: ['service-request'] });
        }
      )
      .subscribe();
    subscriptions.push(serviceRequestsSubscription);

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
          queryClient.invalidateQueries({ queryKey: ['amenityBookings'] });
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

    // Subscribe to messages for current profile (messages table uses profile ids)
    if (profileId) {
      const messagesSubscription = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const row = (payload.new || payload.old) as {
              from_user?: string;
              to_user?: string;
            } | null;

            if (!row) return;
            if (row.from_user !== profileId && row.to_user !== profileId) return;

            queryClient.invalidateQueries({ queryKey: ['messages'] });
            queryClient.invalidateQueries({ queryKey: ['conversations', profileId] });
          }
        )
        .subscribe();
      subscriptions.push(messagesSubscription);
    }

    // Subscribe to notices for user's community
    if (communityId) {
      const noticesSubscription = supabase
        .channel('notices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notices',
            filter: `community_id=eq.${communityId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notices'] });
          }
        )
        .subscribe();
      subscriptions.push(noticesSubscription);
    }

    // Subscribe to service catalog changes for user's community
    if (communityId) {
      const servicesSubscription = supabase
        .channel('services-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'services',
            filter: `community_id=eq.${communityId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['community-services'] });
          }
        )
        .subscribe();
      subscriptions.push(servicesSubscription);
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

    // Subscribe to emergency alerts for user's community
    if (communityId) {
      const emergencyAlertsSubscription = supabase
        .channel('emergency-alerts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'emergency_alerts',
            filter: `community_id=eq.${communityId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] });
          }
        )
        .subscribe();
      subscriptions.push(emergencyAlertsSubscription);
    }

    // Subscribe to amenities for user's community
    if (communityId) {
      const amenitiesSubscription = supabase
        .channel('amenities-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'amenities',
            filter: `community_id=eq.${communityId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['amenities'] });
          }
        )
        .subscribe();
      subscriptions.push(amenitiesSubscription);
    }

    // Subscribe to profile changes for the user
    const profileIdentity = profileId || userId;
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileIdentity}`,
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
  }, [userId, unitId, communityId, profileId, queryClient]);
};
