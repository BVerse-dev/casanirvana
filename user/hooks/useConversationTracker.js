import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useConversationTracker = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const startConversation = async (otherUserId, otherUserName, otherUserImage) => {
    if (!profile?.id || !otherUserId) {
      console.error('❌ Cannot start conversation: missing user data');
      return false;
    }

    try {
      console.log('🔄 Starting conversation tracking for:', {
        currentUser: profile.id,
        otherUser: otherUserId,
        otherUserName,
      });

      // Check if conversation already exists in our chats enhancement system
      const existingChats = queryClient.getQueryData(['chat-enhancements']) || {};
      
      // If this conversation doesn't exist in the chat system, add it
      if (!existingChats[otherUserId]) {
        console.log('📝 Adding new conversation to chat tracking');
        
        // Invalidate chat enhancements to trigger a refresh and include this new conversation
        queryClient.invalidateQueries(['chat-enhancements']);
        
        // Also invalidate the specific conversation messages
        queryClient.invalidateQueries(['messages', profile.id, otherUserId]);
      }

      return true;
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      return false;
    }
  };

  const markConversationActive = async (otherUserId) => {
    if (!profile?.id || !otherUserId) return;

    try {
      // Update the last activity timestamp for this conversation
      // This helps ensure it appears at the top of the chat list
      queryClient.invalidateQueries(['chat-enhancements']);
      queryClient.invalidateQueries(['messages', profile.id, otherUserId]);
    } catch (error) {
      console.error('❌ Error marking conversation active:', error);
    }
  };

  return {
    startConversation,
    markConversationActive,
  };
};
