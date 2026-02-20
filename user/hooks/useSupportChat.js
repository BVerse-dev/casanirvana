import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { resolveProfileIdByAuthId } from '../utils/profileResolver';

// Hook to start a support chat with an admin
export const useStartSupportChat = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const startSupportChat = async (userId, communityId) => {
    setIsCreating(true);
    setError(null);

    try {
      const resolvedUserId = await resolveProfileIdByAuthId(userId) || userId;

      // First, get an available admin from the same community
      const { data: adminUsers, error: adminError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('community_id', communityId)
        .in('role', ['admin', 'superadmin'])
        .limit(1);

      if (adminError) throw adminError;

      let adminUser = null;

      if (!adminUsers || adminUsers.length === 0) {
        // Fallback to any admin if no community-specific admin found
        const { data: fallbackAdmins, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('role', ['admin', 'superadmin'])
          .limit(1);

        if (fallbackError) throw fallbackError;
        
        if (!fallbackAdmins || fallbackAdmins.length === 0) {
          throw new Error('No admin users available for support chat');
        }
        
        adminUser = fallbackAdmins[0];
      } else {
        adminUser = adminUsers[0];
      }

      console.log('🔍 useSupportChat: Found admin:', adminUser);

      // Check if there's already an active support chat between this user and any admin
      // Check if any of these chats have an admin participant
      let existingChatId = null;
      let existingChatAdmin = null;

      try {
        const { data: existingChats, error: existingError } = await supabase
          .from('chat_participants')
          .select(`
            chat_id,
            chats:chat_id (
              id,
              created_at
            )
          `)
          .eq('user_id', resolvedUserId);

        if (existingError) throw existingError;

        if (existingChats && existingChats.length > 0) {
          for (const chat of existingChats) {
            const { data: adminParticipant, error: adminParticipantError } = await supabase
              .from('chat_participants')
              .select(`
                id,
                user_id,
                profiles:user_id(
                  id,
                  full_name,
                  email,
                  avatar_url,
                  phone
                )
              `)
              .eq('chat_id', chat.chat_id)
              .eq('is_admin', true)
              .limit(1);

            if (adminParticipantError) continue;

            if (adminParticipant && adminParticipant.length > 0) {
              existingChatId = chat.chat_id;
              existingChatAdmin = adminParticipant[0].profiles;
              break;
            }
          }
        }
      } catch (lookupError) {
        // If RLS/policy blocks existing-chat lookup, continue by creating a new support chat.
        console.warn('Support chat lookup failed, falling back to new chat creation:', lookupError);
      }

      // If existing support chat found, return it with the actual admin from that chat
      if (existingChatId && existingChatAdmin) {
        return { 
          success: true, 
          chatId: existingChatId,
          adminUser: {
            ...existingChatAdmin,
            avatar_url: existingChatAdmin.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingChatAdmin.full_name || 'Admin'}`
          },
          isNew: false
        };
      }

      // Create new chat
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([{
          community_id: communityId
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Add user as participant
      const { error: userParticipantError } = await supabase
        .from('chat_participants')
        .insert([{
          chat_id: newChat.id,
          user_id: resolvedUserId,
          is_admin: false
        }]);

      if (userParticipantError) throw userParticipantError;

      // Add admin as participant
      console.log('🔍 Adding admin as participant:', adminUser.id);
      const { error: adminParticipantError } = await supabase
        .from('chat_participants')
        .insert([{
          chat_id: newChat.id,
          user_id: adminUser.id,
          is_admin: true
        }]);

      if (adminParticipantError) throw adminParticipantError;

      // Skip initial system message for now to avoid RLS issues
      // const { error: messageError } = await supabase
      //   .from('messages')
      //   .insert([{
      //     from_user: null, // System message
      //     to_user: userId,
      //     content: `Hello! You've been connected to ${adminUser.full_name || 'Support Team'} for assistance. How can we help you today?`,
      //     message_type: 'system',
      //     sent_at: new Date().toISOString()
      //   }]);

      // if (messageError) {
      //   console.warn('Failed to send initial message:', messageError);
      //   // Don't throw error for message failure
      // }

      return { 
        success: true, 
        chatId: newChat.id,
        adminUser: {
          ...adminUser,
          avatar_url: adminUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser.full_name || 'Admin'}`
        },
        isNew: true
      };

    } catch (err) {
      console.error('Error starting support chat:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };

  return { startSupportChat, isCreating, error };
};

// Hook to get existing support chats for a user
export const useGetSupportChats = (userId) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupportChats = async () => {
      try {
        const resolvedUserId = await resolveProfileIdByAuthId(userId) || userId;

        // Get all chats where user is participant
        const { data: userChats, error: userChatsError } = await supabase
          .from('chat_participants')
          .select(`
            chat_id,
            chats:chat_id (
              id,
              created_at,
              community_id
            )
          `)
          .eq('user_id', resolvedUserId);

        if (userChatsError) throw userChatsError;

        // Filter for support chats (those with admin participants)
        const supportChats = [];
        
        for (const chat of userChats || []) {
          const { data: adminParticipants, error: adminError } = await supabase
            .from('chat_participants')
            .select(`
              user_id,
              profiles:user_id (
                id,
                full_name,
                email,
                role
              )
            `)
            .eq('chat_id', chat.chat_id)
            .eq('is_admin', true);

          if (adminError) continue;

          if (adminParticipants && adminParticipants.length > 0) {
            supportChats.push({
              ...chat.chats,
              adminParticipants: adminParticipants
            });
          }
        }

        setChats(supportChats);
      } catch (err) {
        console.error('Error fetching support chats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSupportChats();
    }
  }, [userId]);

  return { chats, loading, error };
};
