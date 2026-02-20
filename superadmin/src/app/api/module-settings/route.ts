import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_ROLES,
  apiError,
  hasCommunityAccess,
  isUuid,
  requireAdminScope,
} from '@/lib/adminAuth';

/**
 * Module Settings API
 * 
 * GET: Fetch module settings for a user type (with optional community override)
 * POST: Update module status (admin only)
 * 
 * Response format follows OvoPay pattern:
 * { status: 'success'|'error', remark: string, message: string[], data: T }
 */

interface ModuleSetting {
  id: number;
  slug: string;
  name: string;
  hub_type: string;
  user_type: string;
  status: number;
  description: string | null;
  icon: string | null;
  display_order: number;
}

interface ModuleWithOverride extends ModuleSetting {
  effective_status: number;
  has_override: boolean;
}

interface CommunityOverride {
  module_id: number;
  status: number;
}

function apiResponse<T>(
  status: 'success' | 'error',
  remark: string,
  message: string[],
  data?: T
) {
  return NextResponse.json({ status, remark, message, data });
}

/**
 * GET /api/module-settings
 * Query params:
 *   - user_type: 'RESIDENT' | 'GUARD' (required)
 *   - community_id: UUID (optional - for per-community overrides)
 */
export async function GET(request: NextRequest) {
  try {
    const { scope, error } = await requireAdminScope(ADMIN_ROLES);
    if (error || !scope) return error;
    const { searchParams } = new URL(request.url);
    
    const userType = searchParams.get('user_type');
    let communityId = searchParams.get('community_id');
    
    if (!userType || !['RESIDENT', 'GUARD'].includes(userType)) {
      return apiResponse('error', 'invalid_user_type', ['user_type must be RESIDENT or GUARD']);
    }
    
    if (communityId && !isUuid(communityId)) {
      return apiError('invalid_community_id', ['community_id must be a valid UUID'], 400);
    }

    if (!scope.isSuperadmin) {
      if (!communityId) {
        communityId = scope.scopedCommunityIds[0] || null;
      }

      if (!communityId) {
        return apiError('no_community_scope', ['No community scope is assigned to this admin.'], 403);
      }

      if (!hasCommunityAccess(scope, communityId)) {
        return apiError(
          'forbidden_community_access',
          ['You do not have access to this community.'],
          403
        );
      }
    }

    // Fetch base modules for user type
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('module_settings')
      .select('*')
      .eq('user_type', userType)
      .order('hub_type')
      .order('display_order');
    
    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return apiResponse('error', 'fetch_failed', ['Failed to fetch module settings']);
    }
    
    // If community_id provided, fetch overrides
    let overrides: Record<number, number> = {};
    if (communityId) {
      const { data: communityOverrides, error: overridesError } = await supabaseAdmin
        .from('community_module_overrides')
        .select('module_id, status')
        .eq('community_id', communityId);
      
      if (!overridesError && communityOverrides) {
        overrides = (communityOverrides as CommunityOverride[]).reduce((acc: Record<number, number>, override: CommunityOverride) => {
          acc[override.module_id] = override.status;
          return acc;
        }, {});
      }
    }
    
    // Merge modules with overrides
    const modulesWithStatus: ModuleWithOverride[] = (modules || []).map((module: ModuleSetting) => ({
      ...module,
      effective_status: overrides[module.id] !== undefined ? overrides[module.id] : module.status,
      has_override: overrides[module.id] !== undefined,
    }));
    
    // Group by hub_type
    const grouped = modulesWithStatus.reduce((acc: Record<string, ModuleWithOverride[]>, module: ModuleWithOverride) => {
      if (!acc[module.hub_type]) {
        acc[module.hub_type] = [];
      }
      acc[module.hub_type].push(module);
      return acc;
    }, {});
    
    return apiResponse('success', 'module_settings', ['Module settings fetched successfully'], {
      user_type: userType,
      community_id: communityId || null,
      modules: grouped,
    });
    
  } catch (error: unknown) {
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error),
      hint: '',
      code: '',
    };
    console.error('Error fetching modules:', errorDetails);
    
    // Check if it's a network error
    if (errorDetails.message.includes('fetch failed')) {
      return apiResponse('error', 'network_error', [
        'Failed to connect to database. Please check your internet connection.',
        'If this persists, the database may be temporarily unavailable.'
      ]);
    }
    
    return apiResponse('error', 'server_error', ['Internal server error']);
  }
}

/**
 * POST /api/module-settings
 * Body:
 *   - module_id: number (required)
 *   - status: 0 | 1 (required)
 *   - community_id: UUID (optional - for per-community override)
 */
export async function POST(request: NextRequest) {
  try {
    const { scope, error } = await requireAdminScope(ADMIN_ROLES);
    if (error || !scope) return error;
    const body = await request.json();
    const { module_id, status, community_id } = body;
    
    if (!Number.isInteger(module_id) || ![0, 1].includes(status)) {
      return apiResponse('error', 'invalid_input', ['module_id and status (0 or 1) are required']);
    }
    
    if (community_id) {
      if (!isUuid(community_id)) {
        return apiError('invalid_community_id', ['community_id must be a valid UUID'], 400);
      }

      if (!hasCommunityAccess(scope, community_id)) {
        return apiError(
          'forbidden_community_access',
          ['You do not have access to this community.'],
          403
        );
      }

      // Update or insert community override
      const { error: upsertError } = await supabaseAdmin
        .from('community_module_overrides')
        .upsert({
          community_id,
          module_id,
          status,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'community_id,module_id',
        });
      
      if (upsertError) {
        console.error('Error upserting override:', upsertError);
        return apiResponse('error', 'update_failed', ['Failed to update community override']);
      }
      
      return apiResponse('success', 'override_updated', ['Community module override updated successfully']);
      
    } else {
      if (!scope.isSuperadmin) {
        return apiError(
          'forbidden_global_update',
          ['Only superadmin can update global module settings.'],
          403
        );
      }

      // Update global default
      const { error: updateError } = await supabaseAdmin
        .from('module_settings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', module_id);
      
      if (updateError) {
        console.error('Error updating module:', updateError);
        return apiResponse('error', 'update_failed', ['Failed to update module setting']);
      }
      
      return apiResponse('success', 'module_updated', ['Module setting updated successfully']);
    }
    
  } catch (error) {
    console.error('Module settings POST error:', error);
    return apiResponse('error', 'server_error', ['Internal server error']);
  }
}

/**
 * DELETE /api/module-settings
 * Body:
 *   - module_id: number (required)
 *   - community_id: UUID (required - only for removing overrides)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { scope, error } = await requireAdminScope(ADMIN_ROLES);
    if (error || !scope) return error;
    const body = await request.json();
    const { module_id, community_id } = body;
    
    if (!Number.isInteger(module_id) || !community_id) {
      return apiResponse('error', 'invalid_input', ['module_id and community_id are required']);
    }

    if (!isUuid(community_id)) {
      return apiError('invalid_community_id', ['community_id must be a valid UUID'], 400);
    }

    if (!hasCommunityAccess(scope, community_id)) {
      return apiError(
        'forbidden_community_access',
        ['You do not have access to this community.'],
        403
      );
    }
    
    const { error: deleteError } = await supabaseAdmin
      .from('community_module_overrides')
      .delete()
      .eq('community_id', community_id)
      .eq('module_id', module_id);
    
    if (deleteError) {
      console.error('Error deleting override:', deleteError);
      return apiResponse('error', 'delete_failed', ['Failed to remove community override']);
    }
    
    return apiResponse('success', 'override_removed', ['Community module override removed successfully']);
    
  } catch (error) {
    console.error('Module settings DELETE error:', error);
    return apiResponse('error', 'server_error', ['Internal server error']);
  }
}
