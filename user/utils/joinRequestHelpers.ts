import { supabase } from '../utils/supabase';

// This is a helper function for testing the join community flow
// In production, this would be handled by admin approval in the admin panel
export const approveJoinRequestAndUpdateUser = async (joinRequestId: string) => {
  try {
    // 1. Get the join request details
    const { data: joinRequest, error: fetchError } = await supabase
      .from('join_requests')
      .select('*')
      .eq('id', joinRequestId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!joinRequest) {
      throw new Error('Join request not found');
    }
    
    // 2. Update the join request status to approved
    const { error: updateRequestError } = await supabase
      .from('join_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        review_notes: 'Approved automatically for testing'
      })
      .eq('id', joinRequestId);
    
    if (updateRequestError) {
      throw updateRequestError;
    }
    
    // 3. Update the user's community_id and unit_id in profiles table
    const { error: updateUserError } = await supabase
      .from('profiles')
      .update({
        community_id: joinRequest.community_id,
        unit_id: joinRequest.unit_id
      })
      .eq('id', joinRequest.user_id);
    
    if (updateUserError) {
      throw updateUserError;
    }
    
    return {
      success: true,
      message: 'Join request approved and user updated successfully'
    };
    
  } catch (error) {
    console.error('Error approving join request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve join request'
    };
  }
};

// Function to check the status of a user's join requests
export const getUserJoinRequestStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('join_requests')
      .select(`
        id,
        status,
        created_at,
        community:communities(name),
        unit:units(block, number)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching join request status:', error);
    return null;
  }
};
