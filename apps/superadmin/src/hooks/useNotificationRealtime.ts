'use client';

import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UseNotificationRealtimeOptions {
  channelName: string;
  tables: string[];
  queryKeys: QueryKey[];
}

export function useNotificationRealtime({
  channelName,
  tables,
  queryKeys,
}: UseNotificationRealtimeOptions) {
  const queryClient = useQueryClient();
  const tableSignature = tables.join('|');
  const queryKeySignature = queryKeys.map((key) => JSON.stringify(key)).join('|');

  useEffect(() => {
    if (tables.length === 0 || queryKeys.length === 0) {
      return;
    }

    const channel = tables.reduce((builder, table) => {
      return builder.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          queryKeys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      );
  }, supabase.channel(channelName));

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, queryClient, queryKeySignature, tableSignature]);
}
