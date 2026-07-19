import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProfileByAuthId } from '../utils/profileResolver';

// Helper function to format time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString();
};

export interface ChatEnhancement {
  userId: string;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  unreadCount: number;
}

export interface ChatListItem {
  id: string;
  name: string;
  image: string;
  time: string;
  message: string;
  recipientId: string;
  unreadCount?: number;
}

interface ChatData {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  recipientId: string;
  unreadCount?: number;
}

interface EnhancementData {
  isOnline?: boolean;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  hasUnread?: boolean;
  lastMessageAt?: string | null;
}

interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  last_login: string | null;
  is_active: boolean;
}

export const useChatEnhancements = () => {
  const [enhancements, setEnhancements] = useState<Record<string, EnhancementData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const isRefreshingRef = useRef(false); // Prevent multiple simultaneous refreshes

  const fetchChatEnhancements = async () => {
    // Prevent multiple simultaneous calls
    if (isRefreshingRef.current) {
      console.log('⏭️ fetchChatEnhancements already running, skipping...');
      return;
    }
    
    console.log('🔄 fetchChatEnhancements starting...', new Date().toISOString());
    isRefreshingRef.current = true;
    setIsLoading(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.log('❌ No authenticated user found');
        setIsLoading(false);
        return;
      }

      console.log('👤 Auth user:', authUser.id);

      // Get the current user's profile to get the profile ID and community
      const currentProfile = await getProfileByAuthId(
        authUser.id,
        'id, user_id, first_name, last_name, email, community_id'
      );

      if (!currentProfile) {
        console.error('❌ Error fetching current user profile for auth user:', authUser.id);
        setIsLoading(false);
        return;
      }

      const currentUserId = currentProfile.id; // Use profile ID for message queries
      const currentCommunityId = currentProfile.community_id;
      console.log('👤 Current user profile ID:', currentUserId, 'Name:', `${currentProfile.first_name} ${currentProfile.last_name}`, 'Community:', currentCommunityId);

      // Get users from profiles table with online status using last_login
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, last_login, is_active')
        .eq('community_id', currentCommunityId);
      
      if (authError) {
        console.error('❌ Auth users query error:', authError);
      } else {
        console.log('📊 Auth users data:', authUsers?.length, 'users');
      }

      // Get all users from the same community in the profiles table (filter by community)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name, role, community_id')
        .eq('community_id', currentCommunityId);

      if (usersError) {
        console.error('❌ Error fetching profiles:', usersError);
        setIsLoading(false);
        return;
      }

      console.log('👥 Community profiles data:', users?.length, 'profiles found for community:', currentCommunityId);
      console.log('👥 Profile names:', users?.map(u => `${u.first_name} ${u.last_name} (${u.role})`).join(', '));

      // Get chat messages involving the current user (FRESH QUERY)
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('from_user, to_user, body, sent_at')
        .or(`from_user.eq.${currentUserId},to_user.eq.${currentUserId}`)
        .order('sent_at', { ascending: false });

      if (messagesError) {
        console.error('❌ Error fetching messages:', messagesError);
        setIsLoading(false);
        return;
      }

      // Get calls involving the current user
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('caller_id, callee_id, call_type, status, duration_seconds, created_at, answered_at, ended_at')
        .or(`caller_id.eq.${currentUserId},callee_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (callsError) {
        console.error('❌ Error fetching calls:', callsError);
        // Continue without calls if there's an error
      }

      // Convert calls to message-like format for unified handling
      const callMessages = (calls || []).map(call => ({
        from_user: call.caller_id,
        to_user: call.callee_id,
        body: JSON.stringify({
          type: 'call',
          call_type: call.call_type,
          status: call.status,
          duration_seconds: call.duration_seconds,
        }),
        sent_at: call.created_at,
        _isCall: true,
      }));

      // Combine messages and calls, then sort by timestamp
      const allCommunications = [...(messages || []), ...callMessages].sort((a, b) => 
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      );

      console.log('💬 Fresh messages data:', messages?.length, 'messages found');
      console.log('📞 Fresh calls data:', calls?.length, 'calls found');
      console.log('🔄 Combined communications:', allCommunications?.length, 'total items');
      if (allCommunications?.length > 0) {
        console.log('📝 Latest 3 communications:', allCommunications.slice(0, 3).map(m => ({
          body: m.body,
          sent_at: m.sent_at,
          from_user: m.from_user,
          to_user: m.to_user,
          isCall: (m as any)._isCall
        })));
      }

      const enhancementMap: Record<string, EnhancementData> = {};

      // Process each user ONCE, but skip users with null user_id (incomplete profiles)
      users?.forEach(user => {
        if (user.id === currentUserId) return; // Skip current user
        if (!user.user_id) {
          console.log(`⚠️ Skipping profile with null user_id: ${user.first_name} ${user.last_name} (${user.id})`);
          return; // Skip profiles that aren't properly linked to auth users
        }
        
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        console.log(`\n👤 Processing user: ${fullName} (${user.email}) ID: ${user.id}`);
        
        // Find messages and calls with this user
        const userCommunications = allCommunications?.filter(comm => 
          (comm.from_user === user.id && comm.to_user === currentUserId) ||
          (comm.from_user === currentUserId && comm.to_user === user.id)
        ) || [];
        
        console.log(`💬 Found ${userCommunications.length} communications for ${fullName}`);
        if (userCommunications.length > 0) {
          console.log(`📝 All communications for ${fullName}:`, userCommunications.map(m => ({ body: m.body, sent_at: m.sent_at, isCall: (m as any)._isCall })));
        }
        
        // Get latest communication (message or call)
        const lastCommunication = userCommunications[0];
        console.log(`📝 Last communication for ${fullName}:`, lastCommunication);
        
        // Format the last message/call for display
        let lastMessage = lastCommunication?.body || undefined;
        let lastMessageTime = lastCommunication?.sent_at || null;
        
        // If it's a call, format it for display
        if (lastCommunication && (lastCommunication as any)._isCall) {
          try {
            const callData = JSON.parse(lastCommunication.body);
            const isOutgoing = lastCommunication.from_user === currentUserId;
            const isMissed = callData.status === 'missed' || (callData.status === 'ended' && !callData.answered_at);
            
            if (callData.call_type === 'video') {
              lastMessage = isOutgoing ? 
                (isMissed ? '📹 Outgoing video call (missed)' : '📹 Outgoing video call') :
                (isMissed ? '📹 Missed video call' : '📹 Incoming video call');
            } else {
              lastMessage = isOutgoing ? 
                (isMissed ? '📞 Outgoing call (missed)' : '📞 Outgoing call') :
                (isMissed ? '📞 Missed call' : '📞 Incoming call');
            }
          } catch (e) {
            lastMessage = '📞 Call';
          }
        }
        
        // Get online status from profiles table - calculate based on last_login
        const authUser = authUsers?.find((au: any) => au.id === user.id);
        const isOnline = authUser?.last_login ? 
          (new Date().getTime() - new Date(authUser.last_login).getTime()) < 5 * 60 * 1000 && authUser.is_active
          : false;
        
        console.log(`🟢 Online status for ${fullName}: ${isOnline}`);
        
        // Store enhancement data for this user
        const enhancementData = {
          isOnline,
          lastMessage: lastMessage || undefined,
          lastMessageAt: lastMessageTime || null,
          time: lastMessageTime ? formatTime(lastMessageTime) : undefined,
          hasUnread: false
        };
        
        console.log(`📊 Enhancement data for ${fullName}:`, enhancementData);
        
        // Store by multiple keys for flexible lookup
        // Only overwrite existing entries if this profile has a message and the existing one doesn't
        const storeEnhancement = (key: string) => {
          const existing = enhancementMap[key];
          if (!existing || !existing.lastMessage || enhancementData.lastMessage) {
            enhancementMap[key] = enhancementData;
          } else {
            console.log(`🔄 Keeping existing enhancement for key "${key}" because it has a message`);
          }
        };
        
        storeEnhancement(fullName);                          // "Emmanuel Broni"
        storeEnhancement(user.id);                           // UUID
        storeEnhancement(user.email);                        // email
        storeEnhancement(user.first_name);                   // "Emmanuel"
        if (user.last_name) {
          storeEnhancement(`${user.first_name} ${user.last_name}`);  // Alternative format
        }
        
        console.log(`✅ Enhancement for ${fullName}:`, enhancementData);
        console.log(`📝 Mapped keys: [${fullName}, ${user.id}, ${user.email}, ${user.first_name}]`);
      });

      console.log('🔍 All Chat Enhancements:', enhancementMap);
      console.log('🔍 Enhancement keys available:', Object.keys(enhancementMap).length, 'total keys');
      console.log('🔍 Sample enhancement data:', {
        'Emmanuel Broni': enhancementMap['Emmanuel Broni'],
        'Sarah Williams': enhancementMap['Sarah Williams'],
        'Eva Davis': enhancementMap['Eva Davis'],
        'Jane Smith': enhancementMap['Jane Smith']
      });
      
      // Set the enhancements state with the completed map
      setEnhancements(enhancementMap);
      console.log('✅ Enhancement state updated with', Object.keys(enhancementMap).length, 'keys');
    } catch (error) {
      console.error('Error in fetchChatEnhancements:', error);
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false; // Reset the flag
    }
  };

  const forceRefresh = () => {
    const now = Date.now();
    // Debounce rapid refresh calls (min 500ms between refreshes)
    if (now - lastRefreshTime < 500) {
      console.log('🚫 Skipping refresh - too soon after last refresh');
      return;
    }
    
    console.log('🔄 Force refreshing chat enhancements...');
    setLastRefreshTime(now);
    fetchChatEnhancements();
  };

  const immediateRefresh = () => {
    console.log('🔄 Immediate refresh (no debounce)...');
    setLastRefreshTime(Date.now());
    fetchChatEnhancements(); // Don't update refreshKey to avoid re-renders
  };

  useEffect(() => {
    // Initial load - no debounce
    console.log('🔄 Initial chat enhancements load...');
    setLastRefreshTime(Date.now());
    fetchChatEnhancements();

    // Set up real-time subscription for chat messages
    const channel = supabase
      .channel('messages_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('📨 Real-time message event:', payload.eventType);
          console.log('📨 Message data:', payload.new);
          
          // Add throttling to real-time events to prevent rapid-fire updates
          const now = Date.now();
          if (now - lastRefreshTime < 1000) { // Min 1 second between real-time refreshes
            console.log('🚫 Throttling real-time refresh - too soon after last refresh');
            return;
          }
          
          console.log('🔄 Triggering throttled real-time chat list refresh...');
          setLastRefreshTime(now);
          
          // Use a small delay to batch potential rapid events
          setTimeout(() => {
            fetchChatEnhancements();
          }, 250);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array - only run once on mount

  const enhanceChatItem = (item: any) => {
    console.log(`\n🔍 === ENHANCING: ${item.name} ===`);
    console.log('🔍 Total enhancement keys:', Object.keys(enhancements).length);
    console.log('🔍 Enhancement keys containing name:', Object.keys(enhancements).filter(key => key.includes(item.name)));
    console.log('🔍 Checking direct lookup for:', item.name);
    
    // Direct lookup by name (should work for exact matches)
    let enhancement = enhancements[item.name];
    console.log('🔍 Direct lookup result:', enhancement);
    
    // If no enhancement found, try alternative lookups
    if (!enhancement || !enhancement.hasOwnProperty('lastMessage')) {
      console.log('🔍 Trying alternative lookups...');
      // Try trimmed name
      enhancement = enhancements[item.name?.trim()];
      console.log('🔍 Trimmed lookup result:', enhancement);
      
      // Try first name only
      if (!enhancement || !enhancement.hasOwnProperty('lastMessage')) {
        const firstName = item.name?.split(' ')[0];
        enhancement = enhancements[firstName];
        console.log(`🔍 First name "${firstName}" lookup result:`, enhancement);
      }
    }
    
    // Fallback to empty object if nothing found
    if (!enhancement) {
      enhancement = {};
      console.log('🔍 No enhancement found, using empty object');
    }
    
    console.log(`🔍 Final enhancement for ${item.name}:`, enhancement);
    
    // Use enhanced last message if available, otherwise fallback
    const displayMessage = enhancement.lastMessage || 'Tap to start a conversation';
    const displayTime = enhancement.time || item.time || '';
    
    const result = {
      ...item,
      isOnline: enhancement.isOnline || false,
      message: displayMessage,
      lastMessage: displayMessage,
      time: displayTime,
      unreadCount: enhancement.unreadCount || 0,
      hasUnread: enhancement.hasUnread || false,
      lastMessageAt: enhancement.lastMessageAt
    };
    
    console.log(`🔍 Enhanced result for ${item.name}:`, {
      originalMessage: item.message,
      enhancedMessage: result.message,
      enhancedTime: result.time,
      hasActualMessage: result.message !== 'Tap to start a conversation'
    });
    console.log(`🔍 === END ENHANCING: ${item.name} ===\n`);
    
    return result;
  };

  const sortChatsByRecent = (chatList: any[]) => {
    const sorted = [...chatList].sort((a, b) => {
      // Get enhancement data for each chat
      const aEnhancement = enhancements[a.name] || enhancements[a.name?.trim()] || enhancements[a.name?.split(' ')[0]] || {};
      const bEnhancement = enhancements[b.name] || enhancements[b.name?.trim()] || enhancements[b.name?.split(' ')[0]] || {};
      
      const aLastMessageAt = aEnhancement?.lastMessageAt;
      const bLastMessageAt = bEnhancement?.lastMessageAt;
      
      console.log(`� Sorting ${a.name} vs ${b.name}:`, {
        aTime: aLastMessageAt,
        bTime: bLastMessageAt,
        aHasMessage: !!aLastMessageAt,
        bHasMessage: !!bLastMessageAt
      });
      
      // If both have messages, sort by most recent first (WhatsApp style)
      if (aLastMessageAt && bLastMessageAt) {
        const aTime = new Date(aLastMessageAt).getTime();
        const bTime = new Date(bLastMessageAt).getTime();
        return bTime - aTime; // Most recent first
      }
      
      // If only one has messages, that conversation goes to the top
      if (aLastMessageAt && !bLastMessageAt) return -1;
      if (!aLastMessageAt && bLastMessageAt) return 1;
      
      // If neither have messages, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    console.log('� Final sorted chat list:', sorted.map(chat => {
      const enhancement = enhancements[chat.name] || enhancements[chat.name?.trim()] || enhancements[chat.name?.split(' ')[0]] || {};
      return {
        name: chat.name,
        lastMessage: enhancement?.lastMessage,
        lastMessageAt: enhancement?.lastMessageAt,
        time: enhancement?.time
      };
    }));

    return sorted;
  };

  // Generate dynamic chat list from users with messages
  const generateDynamicChatList = (): any[] => {
    const chatUsers = new Set<string>();
    const dynamicChatList: any[] = [];

    // Add all users who have messages (from enhancements)
    Object.keys(enhancements).forEach(key => {
      const enhancement = enhancements[key];
      if (enhancement && enhancement.lastMessage) {
        // Try to match the key to a user name (avoid duplicates)
        const userName = key;
        if (!chatUsers.has(userName) && userName.includes(' ')) { // Only full names
          chatUsers.add(userName);
          dynamicChatList.push({
            key: key,
            name: userName,
            time: enhancement.time || "2.00am",
            message: "Dynamic chat entry", // Will be replaced by enhancement
            image: require("../assets/images/img1.png"), // Default image
          });
        }
      }
    });

    console.log('🔍 Dynamic chat list generated:', dynamicChatList.length, 'users');
    console.log('🔍 Dynamic chat users:', dynamicChatList.map(u => u.name));
    
    return dynamicChatList;
  };

  return {
    enhanceChatItem,
    sortChatsByRecent,
    generateDynamicChatList,
    isLoading,
    refresh: fetchChatEnhancements,
    forceRefresh,
    immediateRefresh // For focus events - no debounce
  };
};

export const useCreateOrGetDirectChat = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string): Promise<string> => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      // First, check if a direct chat already exists between these users
      const { data: existingChats, error: searchError } = await supabase
        .from('chats')
        .select(`
          id,
          participants!inner (
            user_id
          )
        `)
        .eq('chat_type', 'direct');

      if (searchError) {
        throw searchError;
      }

      // Find a chat that has exactly these two participants
      const existingChat = existingChats?.find((chat) => {
        const userIds = chat.participants.map((p) => p.user_id).sort();
        const targetIds = [profile.id, recipientId].sort();
        return userIds.length === 2 && 
               userIds[0] === targetIds[0] && 
               userIds[1] === targetIds[1];
      });

      if (existingChat) {
        return existingChat.id;
      }

      // Create new direct chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          chat_type: 'direct',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Add participants
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: profile.id },
          { chat_id: newChat.id, user_id: recipientId },
        ]);

      if (participantError) {
        throw participantError;
      }

      // Invalidate chats query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['chats'] });

      return newChat.id;
    },
  });
};
