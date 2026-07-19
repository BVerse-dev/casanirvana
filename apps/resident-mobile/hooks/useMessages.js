import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

import {
  buildStoredChatAttachment,
  hydrateChatAttachments,
  hydrateMessageChatAttachment,
  normalizeChatAttachment,
} from '../utils/chatAttachments';

export const useMessages = (otherUserId) => {
  const queryClient = useQueryClient();
  const { profile } = useAuth(); // Use profile instead of user
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  
  // Get messages between current user and another user
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

      // Fetch regular messages
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .is('deleted_at', null)
        .or(`and(from_user.eq.${profile.id},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${profile.id})`)
        .order('sent_at', { ascending: true }); // Oldest first for proper chat flow

      if (messageError) {
        console.error('Error fetching messages:', messageError);
        throw messageError;
      }

      // Fetch calls between users
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .or(`and(caller_id.eq.${profile.id},callee_id.eq.${otherUserId}),and(caller_id.eq.${otherUserId},callee_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (callsError) {
        console.error('Error fetching calls:', callsError);
      }

      // Transform calls to message-like format  
      const callMessages = (callsData || []).map(call => ({
        id: call.id,
        from_user: call.caller_id,
        to_user: call.callee_id,
        body: `Call ${call.call_type}`, // Simple text instead of JSON
        sent_at: call.created_at,
        read: true, // Calls are always considered "read"
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
        }
      }));

      const hydratedMessages = await hydrateChatAttachments(supabase.storage, messageData || []);

      // Combine and sort by timestamp
      const allMessages = [...hydratedMessages, ...callMessages].sort((a, b) =>
        new Date(a.sent_at) - new Date(b.sent_at)
      );

      return allMessages;
    },
    enabled: !!profile?.id && !!otherUserId,
    staleTime: 5 * 1000, // 5 seconds for faster updates
  });

  // Combine real messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.sent_at) - new Date(b.sent_at)
  );

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async ({ toUserId, content, messageType = 'text', attachments = null }) => {
      if (!profile?.id) {
        throw new Error('User profile not found. Please ensure you are logged in.');
      }

      if (!toUserId || !content?.trim()) {
        throw new Error('Missing required fields: recipient or message content');
      }

      const isAttachmentMessage = messageType !== 'text' && !!attachments;
      const storedAttachment = isAttachmentMessage
        ? buildStoredChatAttachment(attachments, messageType)
        : null;
      const messageData = {
        from_user: profile.id,
        to_user: toUserId,
        body: content,
        message_type: isAttachmentMessage ? 'file' : 'text',
        attachments: storedAttachment,
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
        console.error('❌ Database error:', error);
        throw error;
      }

      return data;
    },
    onMutate: async ({ toUserId, content, messageType = 'text', attachments = null }) => {
      const isAttachmentMessage = messageType !== 'text' && !!attachments;
      const normalizedAttachments = isAttachmentMessage
        ? normalizeChatAttachment(attachments, messageType)
        : null;

      // Create optimistic message
      const optimisticMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        from_user: profile.id,
        to_user: toUserId,
        body: content,
        message_type: isAttachmentMessage ? 'file' : 'text',
        attachments: normalizedAttachments,
        sent_at: new Date().toISOString(),
        read: false,
        is_read: false,
        message_status: 'sent',
        // Add temporary fields for display
        _messageType: messageType,
        _attachments: normalizedAttachments,
        _status: 'sending',
      };

      // Add to optimistic messages immediately
      setOptimisticMessages(prev => [...prev, optimisticMessage]);

      return { optimisticMessage };
    },
    onSuccess: async (data, variables, context) => {
      const hydratedMessage = await hydrateMessageChatAttachment(supabase.storage, data);

      // Immediately update the cache with the real message to avoid disappearing
      const queryKey = ['messages', profile.id, data.to_user];
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return [hydratedMessage];
        
        // Check if message already exists to avoid duplicates
        const messageExists = oldData.some(msg => msg.id === data.id);
        if (messageExists) return oldData;
        
        // Add the new message and sort by timestamp
        return [...oldData, hydratedMessage].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
      });

      // Also update the reverse query key for the other participant
      const reverseQueryKey = ['messages', data.to_user, profile.id];
      queryClient.setQueryData(reverseQueryKey, (oldData) => {
        if (!oldData) return [hydratedMessage];
        
        const messageExists = oldData.some(msg => msg.id === data.id);
        if (messageExists) return oldData;
        
        return [...oldData, hydratedMessage].sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
      });
      
      // Remove the specific optimistic message that was sent
      if (context?.optimisticMessage) {
        setOptimisticMessages(prev => 
          prev.filter(msg => msg.id !== context.optimisticMessage.id)
        );
      }
    },
    onError: (error, variables, context) => {
      // Remove failed optimistic message
      if (context?.optimisticMessage) {
        setOptimisticMessages(prev => 
          prev.filter(msg => msg.id !== context.optimisticMessage.id)
        );
      }
      throw error;
    },
  });

  // Send a message function
  const sendMessage = async (messageData) => {
    return sendMessageMutation.mutateAsync(messageData);
  };

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      const { error } = await supabase
        .from('messages')
        .update({
          read: true,
          is_read: true,
          read_at: new Date().toISOString(),
          message_status: 'read'
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', profile?.id, otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['messages', otherUserId, profile?.id] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId) => {
      const { error } = await supabase
        .from('messages')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', profile?.id, otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['messages', otherUserId, profile?.id] });
    },
  });

  return {
    messages: allMessages,
    isLoading,
    error,
    refetch,
    sendMessage: sendMessage,
    markAsRead: markAsReadMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    isSending: sendMessageMutation.isPending, // Use isPending from mutation
  };
};

export const useConversations = () => {
  const { profile } = useAuth();

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
        .select('id, from_user, to_user, body, sent_at, is_read, read, message_type, attachments')
        .is('deleted_at', null)
        .or(`from_user.eq.${profile.id},to_user.eq.${profile.id}`)
        .order('sent_at', { ascending: false });

      if (messageError) {
        console.error('Error fetching conversations:', messageError);
        throw messageError;
      }

      const rows = (messageRows || []).map((message) =>
        message.message_type === 'file' && message.attachments
          ? { ...message, attachments: normalizeChatAttachment(message.attachments) }
          : message,
      );
      const partnerIds = [...new Set(
        rows
          .map((message) => (message.from_user === profile.id ? message.to_user : message.from_user))
          .filter(Boolean)
      )];

      if (partnerIds.length === 0) {
        return [];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, last_login, is_active')
        .in('id', partnerIds);

      if (profilesError) {
        console.error('Error fetching conversation profiles:', profilesError);
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
  const { profile } = useAuth(); // Use profile instead of user

  useEffect(() => {
    if (!profile?.id || !otherUserId) {
      return;
    }

    // Subscribe to real-time changes for messages
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
        }
      )
      .subscribe();

    // Subscribe to real-time changes for calls (since they appear in message feed)
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

          // Invalidate messages query to include new calls
          const queryKey = ['messages', profile.id, otherUserId];
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({ queryKey: ['conversations', profile.id] });
        }
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
  const { profile } = useAuth(); // Use profile instead of user
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    // Subscribe to real-time changes for calls
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
          // Check if this is a call for the current user
          if (payload.new.callee_id === profile.id) {
            setIncomingCall(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
        },
        (payload) => {
          // Clear incoming call if it was answered/rejected/ended
          if (payload.new.status !== 'initiated' && payload.new.status !== 'ringing') {
            setIncomingCall(null);
          }

          queryClient.invalidateQueries({ queryKey: ['calls'] });
        }
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
