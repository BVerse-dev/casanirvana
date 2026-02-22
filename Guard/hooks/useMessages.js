import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import { useState, useEffect } from 'react';

export const useMessages = (otherUserId) => {
  const queryClient = useQueryClient();
  const { profile } = useGuardAuth();
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['messages', profile?.id, otherUserId],
    queryFn: async () => {
      if (!profile?.id || !otherUserId) {
        return [];
      }

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(from_user.eq.${profile.id},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${profile.id})`,
        )
        .order('sent_at', { ascending: true });

      if (messageError) {
        throw messageError;
      }

      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .or(
          `and(caller_id.eq.${profile.id},callee_id.eq.${otherUserId}),and(caller_id.eq.${otherUserId},callee_id.eq.${profile.id})`,
        )
        .order('created_at', { ascending: true });

      if (callsError) {
        throw callsError;
      }

      const callMessages = (callsData || []).map((call) => ({
        id: call.id,
        from_user: call.caller_id,
        to_user: call.callee_id,
        body: `Call ${call.call_type}`,
        sent_at: call.created_at,
        read: true,
        is_read: true,
        _messageType: 'call',
        _isCall: true,
        _callData: {
          type: 'call',
          call_type: call.call_type,
          status: call.status,
          duration_seconds: call.duration_seconds,
          started_at: call.started_at,
          answered_at: call.answered_at,
          ended_at: call.ended_at,
          call_id: call.id,
        },
      }));

      return [...(messageData || []), ...callMessages].sort(
        (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
      );
    },
    enabled: !!profile?.id && !!otherUserId,
    staleTime: 5 * 1000,
  });

  const allMessages = [...messages, ...optimisticMessages].sort(
    (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
  );

  const sendMessageMutation = useMutation({
    mutationFn: async ({ toUserId, content, messageType = 'text', attachments = null }) => {
      if (!profile?.id) {
        throw new Error('User profile not found. Please ensure you are logged in.');
      }

      if (!toUserId || !content?.trim()) {
        throw new Error('Missing required fields: recipient or message content');
      }

      const isAttachmentMessage = messageType !== 'text' && !!attachments;
      const messageData = {
        from_user: profile.id,
        to_user: toUserId,
        body: content,
        message_type: isAttachmentMessage ? 'file' : 'text',
        attachments: isAttachmentMessage ? { type: messageType, ...attachments } : null,
        sent_at: new Date().toISOString(),
        read: false,
        is_read: false,
        message_status: 'sent',
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onMutate: async ({ toUserId, content, messageType = 'text', attachments = null }) => {
      const isAttachmentMessage = messageType !== 'text' && !!attachments;
      const normalizedAttachments = isAttachmentMessage ? { type: messageType, ...attachments } : null;

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        from_user: profile.id,
        to_user: toUserId,
        body: content,
        message_type: isAttachmentMessage ? 'file' : 'text',
        attachments: normalizedAttachments,
        sent_at: new Date().toISOString(),
        read: false,
        is_read: false,
        message_status: 'sent',
        _messageType: messageType,
        _attachments: normalizedAttachments,
        _status: 'sending',
      };

      setOptimisticMessages((prev) => [...prev, optimisticMessage]);

      return { optimisticMessage };
    },
    onSuccess: (data, _variables, context) => {
      const queryKey = ['messages', profile.id, data.to_user];
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return [data];

        const messageExists = oldData.some((msg) => msg.id === data.id);
        if (messageExists) return oldData;

        return [...oldData, data].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
      });

      const reverseQueryKey = ['messages', data.to_user, profile.id];
      queryClient.setQueryData(reverseQueryKey, (oldData) => {
        if (!oldData) return [data];

        const messageExists = oldData.some((msg) => msg.id === data.id);
        if (messageExists) return oldData;

        return [...oldData, data].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
      });

      queryClient.invalidateQueries({ queryKey: ['conversations', profile.id] });

      if (context?.optimisticMessage) {
        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg.id !== context.optimisticMessage.id),
        );
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.optimisticMessage) {
        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg.id !== context.optimisticMessage.id),
        );
      }
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      const { error } = await supabase
        .from('messages')
        .update({
          read: true,
          is_read: true,
          read_at: new Date().toISOString(),
          message_status: 'read',
        })
        .eq('id', messageId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', profile?.id, otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['messages', otherUserId, profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', profile?.id] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const { error } = await supabase
        .from('messages')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', profile?.id, otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['messages', otherUserId, profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', profile?.id] });
    },
  });

  return {
    messages: allMessages,
    isLoading,
    error,
    refetch,
    sendMessage: sendMessageMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};

export const useConversations = () => {
  const { profile } = useGuardAuth();

  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['conversations', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        return [];
      }

      const { data: messageRows, error: messageError } = await supabase
        .from('messages')
        .select('id, from_user, to_user, body, sent_at, is_read, read, message_type, attachments, message_status')
        .or(`from_user.eq.${profile.id},to_user.eq.${profile.id}`)
        .order('sent_at', { ascending: false });

      if (messageError) {
        throw messageError;
      }

      const rows = messageRows || [];
      const partnerIds = [
        ...new Set(
          rows
            .map((message) =>
              message.from_user === profile.id ? message.to_user : message.from_user,
            )
            .filter(Boolean),
        ),
      ];

      if (partnerIds.length === 0) {
        return [];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, last_login, is_active, phone, community_id')
        .in('id', partnerIds);

      if (profilesError) {
        throw profilesError;
      }

      const profilesById = new Map((profilesData || []).map((item) => [item.id, item]));
      const conversationMap = new Map();

      rows.forEach((message) => {
        const partnerId = message.from_user === profile.id ? message.to_user : message.from_user;
        if (!partnerId) {
          return;
        }

        if (!conversationMap.has(partnerId)) {
          const partnerProfile = profilesById.get(partnerId);
          conversationMap.set(partnerId, {
            partnerId,
            partnerProfile,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        const isMessageRead = message.is_read ?? message.read ?? false;
        if (message.to_user === profile.id && !isMessageRead) {
          conversationMap.get(partnerId).unreadCount += 1;
        }
      });

      return Array.from(conversationMap.values()).sort((a, b) => {
        const aTs = new Date(a.lastMessage?.sent_at || 0).getTime();
        const bTs = new Date(b.lastMessage?.sent_at || 0).getTime();
        return bTs - aTs;
      });
    },
    enabled: !!profile?.id,
  });

  return {
    conversations,
    isLoading,
    error,
    refetch,
  };
};

export const useRealTimeMessages = (otherUserId) => {
  const queryClient = useQueryClient();
  const { profile } = useGuardAuth();

  useEffect(() => {
    if (!profile?.id || !otherUserId) {
      return;
    }

    const messagesSubscription = supabase
      .channel(`messages-${profile.id}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const row = payload.new || payload.old;
          const involvesCurrentChat =
            (row?.from_user === profile.id && row?.to_user === otherUserId) ||
            (row?.from_user === otherUserId && row?.to_user === profile.id);

          if (!involvesCurrentChat) return;

          const queryKey = ['messages', profile.id, otherUserId];
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({ queryKey: ['conversations', profile.id] });
        },
      )
      .subscribe();

    const callsSubscription = supabase
      .channel(`calls-${profile.id}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
        },
        (payload) => {
          const row = payload.new || payload.old;
          const involvesCurrentChat =
            (row?.caller_id === profile.id && row?.callee_id === otherUserId) ||
            (row?.caller_id === otherUserId && row?.callee_id === profile.id);

          if (!involvesCurrentChat) return;

          const queryKey = ['messages', profile.id, otherUserId];
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({ queryKey: ['conversations', profile.id] });
        },
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      callsSubscription.unsubscribe();
    };
  }, [profile?.id, otherUserId, queryClient]);
};

export const useRealTimeCalls = () => {
  const queryClient = useQueryClient();
  const { profile } = useGuardAuth();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    const subscription = supabase
      .channel('calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
        },
        (payload) => {
          if (payload.new.callee_id === profile.id) {
            setIncomingCall(payload.new);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
        },
        (payload) => {
          if (payload.new.status !== 'initiated' && payload.new.status !== 'ringing') {
            setIncomingCall(null);
          }

          queryClient.invalidateQueries({ queryKey: ['calls'] });
          queryClient.invalidateQueries({ queryKey: ['conversations', profile.id] });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id, queryClient]);

  return {
    incomingCall,
    clearIncomingCall: () => setIncomingCall(null),
  };
};
