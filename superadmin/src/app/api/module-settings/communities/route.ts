import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ADMIN_ROLES, requireAdminScope } from '@/lib/adminAuth';

function apiResponse<T>(
  status: 'success' | 'error',
  remark: string,
  message: string[],
  data?: T
) {
  return NextResponse.json({ status, remark, message, data });
}

async function requireAdminSession() {
  const { scope, error } = await requireAdminScope(ADMIN_ROLES);
  if (error || !scope) {
    return { scope: null, error: error || apiResponse('error', 'unauthorized', ['Admin access required']) };
  }
  return { scope, error: null };
}

export async function GET() {
  try {
    const { scope, error: authError } = await requireAdminSession();
    if (authError || !scope) return authError;

    let query = supabaseAdmin.from('communities').select('id, name').order('name');

    if (!scope.isSuperadmin) {
      if (scope.scopedCommunityIds.length === 0) {
        return apiResponse('success', 'communities_fetched', ['Communities fetched successfully'], []);
      }
      query = query.in('id', scope.scopedCommunityIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching communities for module settings:', error);
      return apiResponse('error', 'fetch_failed', ['Failed to fetch communities']);
    }

    return apiResponse('success', 'communities_fetched', ['Communities fetched successfully'], data || []);
  } catch (error) {
    console.error('Module settings communities route error:', error);
    return apiResponse('error', 'server_error', ['Internal server error']);
  }
}
