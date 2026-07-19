import { NextFunction, Request, Response } from 'express';
import { createHttpError } from '../lib/httpError';
import { createPublicClient, supabase } from '../lib/supabase';

const DELETE_CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';
const BACKUP_BUCKET = process.env.ACCOUNT_BACKUP_BUCKET || 'account-backups';
const DEFAULT_BACKUP_RETENTION_DAYS = Number(process.env.ACCOUNT_BACKUP_RETENTION_DAYS || 30);
const BACKUP_HISTORY_LIMIT = 20;
const BACKUP_MAX_ROWS_PER_TABLE = Number(process.env.ACCOUNT_BACKUP_MAX_ROWS || 5000);
const BACKUP_SCHEMA_VERSION = '2026-02-16';
const APP_UPDATE_SETTINGS_CATEGORY = process.env.APP_UPDATE_SETTINGS_CATEGORY || 'app_updates';
const RELEASE_MANIFEST_KEYS = [
  'user_app_update_manifest',
  'mobile_app_update_manifest',
  'app_update_manifest',
  'release_manifest',
  'manifest',
];

const getBearerToken = (headerValue?: string): string | null => {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toRecord = (value: unknown): Record<string, unknown> => (isObject(value) ? value : {});

const toStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const parseSettingValue = (value: unknown, dataType?: string | null): unknown => {
  try {
    if (dataType === 'boolean') {
      return value === true || value === 'true';
    }
    if (dataType === 'number') {
      return Number(value);
    }
    if (dataType === 'json' && typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  } catch {
    return value;
  }
};

const compareVersions = (leftVersion: string, rightVersion: string): number => {
  const parseParts = (version: string) =>
    version
      .split('.')
      .map((part) => Number.parseInt(part.replace(/\D+/g, ''), 10))
      .map((part) => (Number.isFinite(part) ? part : 0));

  const left = parseParts(leftVersion);
  const right = parseParts(rightVersion);
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = left[index] || 0;
    const rightPart = right[index] || 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
};

const calculateNextBackupAt = (lastBackupAt: string | null, frequency: string | null): string | null => {
  if (!lastBackupAt) {
    return null;
  }

  const baseDate = new Date(lastBackupAt);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const nextDate = new Date(baseDate);
  switch ((frequency || '').toLowerCase()) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'daily':
    default:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
  }

  return nextDate.toISOString();
};

const selectLatestString = (...values: Array<unknown>): string | null => {
  for (const value of values) {
    const normalized = toStringOrNull(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const parseReleaseHistory = (value: unknown): Array<Record<string, unknown>> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => {
      if (!isObject(entry)) {
        return null;
      }

      const version = selectLatestString(entry.version);
      if (!version) {
        return null;
      }

      return {
        id: selectLatestString(entry.id, `${version}-${index}`),
        version,
        date: selectLatestString(entry.date, entry.release_date),
        size: selectLatestString(entry.size, entry.update_size),
        type: selectLatestString(entry.type, 'stable'),
        features: toStringArray(entry.features),
        bugFixes: toStringArray(entry.bugFixes ?? entry.bug_fixes),
      };
    })
    .filter((entry): entry is Record<string, unknown> => Boolean(entry));
};

async function authenticateAccountRequest(
  req: Request,
  next: NextFunction
): Promise<{ userId: string; email: string | null } | null> {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    next(createHttpError(401, 'ACCOUNT_AUTH_TOKEN_MISSING', 'Missing authorization token'));
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    next(createHttpError(401, 'ACCOUNT_AUTH_TOKEN_INVALID', 'Invalid or expired token'));
    return null;
  }

  return {
    userId: authData.user.id,
    email: authData.user.email || null,
  };
}

const forwardAccountControllerError = (
  next: NextFunction,
  error: unknown,
  code: string,
  fallbackMessage: string
) => {
  if (error instanceof Error && 'statusCode' in error) {
    return next(error);
  }

  const message = error instanceof Error && error.message ? error.message : fallbackMessage;
  return next(createHttpError(500, code, message, error));
};

async function fetchLatestChatSettingsRow(userId: string) {
  const { data, error } = await supabase
    .from('chat_settings')
    .select(
      'id, user_id, chat_backup_enabled, chat_backup_frequency, backup_include_videos, app_info_preferences, updated_at'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

async function upsertChatSettings(
  userId: string,
  rowPatch: Record<string, unknown> = {},
  appInfoPatch: Record<string, unknown> = {}
) {
  const existingRow = await fetchLatestChatSettingsRow(userId);
  const existingAppInfo = toRecord(existingRow?.app_info_preferences);
  const nextAppInfo = {
    ...existingAppInfo,
    ...appInfoPatch,
  };

  if (existingRow?.id) {
    const updatePayload = {
      ...rowPatch,
      app_info_preferences: nextAppInfo,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('chat_settings')
      .update(updatePayload as never)
      .eq('id', existingRow.id);

    if (error) {
      throw error;
    }

    return {
      ...existingRow,
      ...rowPatch,
      app_info_preferences: nextAppInfo,
    };
  }

  const insertPayload = {
    user_id: userId,
    ...rowPatch,
    app_info_preferences: nextAppInfo,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('chat_settings')
    .insert(insertPayload as never)
    .select(
      'id, user_id, chat_backup_enabled, chat_backup_frequency, backup_include_videos, app_info_preferences, updated_at'
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureBackupBucketExists() {
  const { data, error } = await supabase.storage.getBucket(BACKUP_BUCKET);
  if (!error && data) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BACKUP_BUCKET, {
    public: false,
  });

  if (createError && !createError.message.toLowerCase().includes('already')) {
    throw createError;
  }
}

type BackupFileDescriptor = {
  name: string;
  path: string;
  createdAt: string | null;
  updatedAt: string | null;
  sizeBytes: number;
};

async function listUserBackups(userId: string): Promise<BackupFileDescriptor[]> {
  await ensureBackupBucketExists();

  const { data, error } = await supabase.storage.from(BACKUP_BUCKET).list(userId, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    if (error.message.toLowerCase().includes('not found')) {
      return [];
    }
    throw error;
  }

  return (data || [])
    .filter((file) => typeof file.name === 'string' && file.name.toLowerCase().endsWith('.json'))
    .map((file) => {
      const metadata = toRecord(file.metadata);
      return {
        name: file.name,
        path: `${userId}/${file.name}`,
        createdAt: toStringOrNull(file.created_at),
        updatedAt: toStringOrNull(file.updated_at),
        sizeBytes: toNumber(metadata.size) || 0,
      };
    });
}

async function safeCount(queryPromise: Promise<{ count: number | null; error: unknown }>) {
  const { count, error } = await queryPromise;
  if (error) {
    console.error('Failed count query:', error);
    return 0;
  }
  return count || 0;
}

async function getUserDataSummary(userId: string, profileId: string) {
  const [
    messageCount,
    maintenanceCount,
    complaintCount,
    notificationCount,
    serviceBookingCount,
    paymentCount,
    inquiryCount,
    visitorCount,
  ] = await Promise.all([
    safeCount(
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .or(`from_user.eq.${profileId},to_user.eq.${profileId}`)
    ),
    safeCount(
      supabase
        .from('maintenance_requests')
        .select('id', { count: 'exact', head: true })
        .eq('requested_by', profileId)
    ),
    safeCount(
      supabase
        .from('complaints')
        .select('id', { count: 'exact', head: true })
        .or(`created_by_profile_id.eq.${profileId},raised_by.eq.${profileId},created_by.eq.${userId}`)
    ),
    safeCount(
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .or(`user_id.eq.${profileId},user_id.eq.${userId}`)
    ),
    safeCount(
      supabase
        .from('service_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profileId)
    ),
    safeCount(
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .or(`payer_id.eq.${profileId},payer_id.eq.${userId}`)
    ),
    safeCount(
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
    ),
    safeCount(
      supabase
        .from('visitor_passes')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId)
    ),
  ]);

  return {
    profileRecords: 1,
    messages: messageCount,
    maintenanceRequests: maintenanceCount,
    complaints: complaintCount,
    notifications: notificationCount,
    serviceBookings: serviceBookingCount,
    payments: paymentCount,
    inquiries: inquiryCount,
    visitorPasses: visitorCount,
  };
}

async function resolveProfileForAuthUser(authUserId: string) {
  const byUserId = await supabase
    .from('profiles')
    .select('id, preferences')
    .eq('user_id', authUserId)
    .limit(1)
    .maybeSingle();

  if (byUserId.error && byUserId.error.code !== 'PGRST116') {
    throw byUserId.error;
  }

  if (byUserId.data) {
    return byUserId.data;
  }

  const byId = await supabase
    .from('profiles')
    .select('id, preferences')
    .eq('id', authUserId)
    .limit(1)
    .maybeSingle();

  if (byId.error && byId.error.code !== 'PGRST116') {
    throw byId.error;
  }

  return byId.data || null;
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return next(createHttpError(401, 'ACCOUNT_AUTH_TOKEN_MISSING', 'Missing authorization token'));
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return next(createHttpError(401, 'ACCOUNT_AUTH_TOKEN_INVALID', 'Invalid or expired token'));
    }

    const user = authData.user;
    const {
      current_password: currentPassword,
      reason,
      reason_details: reasonDetails,
      confirmation_text: confirmationText,
    } = req.body as {
      current_password: string;
      reason?: string;
      reason_details?: string;
      confirmation_text: string;
    };

    if (confirmationText.trim().toUpperCase() !== DELETE_CONFIRMATION_TEXT) {
      return next(
        createHttpError(
          400,
          'ACCOUNT_DELETE_CONFIRMATION_INVALID',
          `Confirmation text must match "${DELETE_CONFIRMATION_TEXT}"`
        )
      );
    }

    if (!user.email) {
      return next(
        createHttpError(
          400,
          'ACCOUNT_DELETE_REAUTH_UNAVAILABLE',
          'Account deletion via password re-auth is only available for email accounts.'
        )
      );
    }

    const publicClient = createPublicClient();
    const { data: reauthData, error: reauthError } = await publicClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reauthError || !reauthData.user || reauthData.user.id !== user.id) {
      return next(
        createHttpError(401, 'ACCOUNT_DELETE_REAUTH_FAILED', 'Re-authentication failed. Please verify your password.')
      );
    }

    await publicClient.auth.signOut();

    const profileRecord = await resolveProfileForAuthUser(user.id);

    if (profileRecord?.id) {
      const existingPreferences = isObject(profileRecord.preferences) ? profileRecord.preferences : {};
      const deletionAudit = {
        requested_at: new Date().toISOString(),
        requested_by: user.id,
        reason: reason || null,
        reason_details: reasonDetails || null,
        source: 'user_app',
      };

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          first_name: 'Deleted',
          last_name: 'User',
          full_name: 'Deleted User',
          phone: null,
          emergency_contact: null,
          avatar_url: null,
          push_notification_token: null,
          push_notifications_enabled: false,
          email: `deleted+${user.id}@deleted.local`,
          is_active: false,
          status: 'deleted',
          preferences: {
            ...existingPreferences,
            account_deletion: deletionAudit,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileRecord.id);

      if (profileUpdateError) {
        return next(
          createHttpError(
            500,
            'ACCOUNT_DELETE_PROFILE_ANONYMIZE_FAILED',
            'Failed to anonymize user profile before deletion',
            profileUpdateError
          )
        );
      }
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return next(createHttpError(500, 'ACCOUNT_DELETE_FAILED', 'Failed to delete account', deleteError));
    }

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    return forwardAccountControllerError(next, error, 'ACCOUNT_DELETE_FAILED', 'Failed to delete account');
  }
}

export async function deactivateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return next(createHttpError(401, 'ACCOUNT_AUTH_TOKEN_MISSING', 'Missing authorization token'));
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return next(createHttpError(401, 'ACCOUNT_AUTH_TOKEN_INVALID', 'Invalid or expired token'));
    }

    const user = authData.user;
    const { reason, reason_details: reasonDetails } = req.body as {
      reason?: string;
      reason_details?: string;
    };

    const profileRecord = await resolveProfileForAuthUser(user.id);
    if (!profileRecord?.id) {
      return next(createHttpError(404, 'ACCOUNT_PROFILE_NOT_FOUND', 'Profile not found for authenticated user'));
    }

    const existingPreferences = isObject(profileRecord.preferences) ? profileRecord.preferences : {};
    const deactivationAudit = {
      requested_at: new Date().toISOString(),
      requested_by: user.id,
      reason: reason || null,
      reason_details: reasonDetails || null,
      source: 'user_app',
    };

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        status: 'deactivated',
        preferences: {
          ...existingPreferences,
          account_deactivation: deactivationAudit,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileRecord.id);

    if (profileUpdateError) {
      return next(
        createHttpError(500, 'ACCOUNT_DEACTIVATION_FAILED', 'Failed to deactivate account', profileUpdateError)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    return forwardAccountControllerError(next, error, 'ACCOUNT_DEACTIVATION_FAILED', 'Failed to deactivate account');
  }
}

export async function getBackupStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = await authenticateAccountRequest(req, next);
    if (!authUser) {
      return;
    }

    const profileRecord = await resolveProfileForAuthUser(authUser.userId);
    if (!profileRecord?.id) {
      return next(createHttpError(404, 'ACCOUNT_PROFILE_NOT_FOUND', 'Profile not found for authenticated user'));
    }

    const settingsRow = await fetchLatestChatSettingsRow(authUser.userId);
    const appInfoPreferences = toRecord(settingsRow?.app_info_preferences);
    const backupState = toRecord(appInfoPreferences.backup_state);
    const backupFiles = await listUserBackups(authUser.userId);
    const latestBackupPath =
      toStringOrNull(backupState.latest_backup_path) || (backupFiles[0]?.path ?? null);
    const latestBackupCreatedAt =
      toStringOrNull(backupState.latest_backup_at) || backupFiles[0]?.createdAt || null;
    const latestBackupSizeBytes =
      toNumber(backupState.latest_backup_size_bytes) || backupFiles[0]?.sizeBytes || 0;
    const dataSummary = await getUserDataSummary(authUser.userId, profileRecord.id);
    const autoBackupEnabled =
      typeof settingsRow?.chat_backup_enabled === 'boolean' ? settingsRow.chat_backup_enabled : true;
    const backupFrequency =
      toStringOrNull(settingsRow?.chat_backup_frequency) || 'daily';

    return res.status(200).json({
      success: true,
      data: {
        backup_bucket: BACKUP_BUCKET,
        auto_backup_enabled: autoBackupEnabled,
        backup_frequency: backupFrequency,
        backup_include_videos: Boolean(settingsRow?.backup_include_videos),
        backup_location: toStringOrNull(appInfoPreferences.backup_location) || 'Google Drive',
        last_backup_at: latestBackupCreatedAt,
        last_backup_size_bytes: latestBackupSizeBytes,
        last_backup_size_label:
          toStringOrNull(backupState.latest_backup_size_label) || formatBytes(latestBackupSizeBytes),
        next_backup_at: autoBackupEnabled
          ? calculateNextBackupAt(latestBackupCreatedAt, backupFrequency)
          : null,
        latest_backup_path: latestBackupPath,
        last_restore_at: toStringOrNull(backupState.last_restore_at),
        last_cleanup_at: toStringOrNull(backupState.last_cleanup_at),
        available_backups: backupFiles.map((file) => ({
          name: file.name,
          path: file.path,
          created_at: file.createdAt,
          updated_at: file.updatedAt,
          size_bytes: file.sizeBytes,
          size_label: formatBytes(file.sizeBytes),
        })),
        data_summary: dataSummary,
      },
    });
  } catch (error) {
    return forwardAccountControllerError(next, error, 'ACCOUNT_BACKUP_STATUS_FAILED', 'Failed to load backup status');
  }
}

async function fetchBackupDataset(userId: string, profileId: string) {
  const [profile, chatSettings, maintenanceRequests, complaints, messages, notifications, serviceBookings, payments, inquiries, visitorPasses] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, user_id, community_id, unit_id, role, first_name, last_name, full_name, email, phone, avatar_url, emergency_contact, preferences, created_at, updated_at'
      )
      .eq('id', profileId)
      .maybeSingle(),
    supabase
      .from('chat_settings')
      .select(
        'id, user_id, app_info_preferences, app_language, chat_backup_enabled, chat_backup_frequency, backup_include_videos, updated_at'
      )
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('maintenance_requests')
      .select('*')
      .eq('requested_by', profileId)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('complaints')
      .select('*')
      .or(`created_by_profile_id.eq.${profileId},raised_by.eq.${profileId},created_by.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('messages')
      .select('*')
      .or(`from_user.eq.${profileId},to_user.eq.${profileId}`)
      .order('sent_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${profileId},user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('service_bookings')
      .select('*')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('payments')
      .select('*')
      .or(`payer_id.eq.${profileId},payer_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
    supabase
      .from('visitor_passes')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(BACKUP_MAX_ROWS_PER_TABLE),
  ]);

  const results = [
    profile,
    chatSettings,
    maintenanceRequests,
    complaints,
    messages,
    notifications,
    serviceBookings,
    payments,
    inquiries,
    visitorPasses,
  ];

  for (const result of results) {
    if (result.error && result.error.code !== 'PGRST116') {
      throw result.error;
    }
  }

  return {
    profile: profile.data || null,
    chat_settings: chatSettings.data || null,
    maintenance_requests: maintenanceRequests.data || [],
    complaints: complaints.data || [],
    messages: messages.data || [],
    notifications: notifications.data || [],
    service_bookings: serviceBookings.data || [],
    payments: payments.data || [],
    inquiries: inquiries.data || [],
    visitor_passes: visitorPasses.data || [],
  };
}

export async function exportBackup(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = await authenticateAccountRequest(req, next);
    if (!authUser) {
      return;
    }

    const profileRecord = await resolveProfileForAuthUser(authUser.userId);
    if (!profileRecord?.id) {
      return next(createHttpError(404, 'ACCOUNT_PROFILE_NOT_FOUND', 'Profile not found for authenticated user'));
    }

    const snapshot = await fetchBackupDataset(authUser.userId, profileRecord.id);
    const summary = await getUserDataSummary(authUser.userId, profileRecord.id);
    const generatedAt = new Date().toISOString();

    const backupPayload = {
      meta: {
        schema_version: BACKUP_SCHEMA_VERSION,
        generated_at: generatedAt,
        user_id: authUser.userId,
        profile_id: profileRecord.id,
      },
      summary,
      ...snapshot,
    };

    const serializedPayload = JSON.stringify(backupPayload, null, 2);
    const sizeBytes = Buffer.byteLength(serializedPayload, 'utf8');

    await ensureBackupBucketExists();
    const fileName = `backup-${generatedAt.replace(/[:.]/g, '-')}.json`;
    const backupPath = `${authUser.userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BACKUP_BUCKET)
      .upload(backupPath, Buffer.from(serializedPayload, 'utf8'), {
        upsert: true,
        contentType: 'application/json',
      });

    if (uploadError) {
      return next(createHttpError(500, 'ACCOUNT_BACKUP_UPLOAD_FAILED', 'Failed to upload backup file', uploadError));
    }

    const existingSettings = await fetchLatestChatSettingsRow(authUser.userId);
    const appInfoPreferences = toRecord(existingSettings?.app_info_preferences);
    const existingBackupState = toRecord(appInfoPreferences.backup_state);
    const existingBackupHistory = Array.isArray(appInfoPreferences.backup_history)
      ? appInfoPreferences.backup_history
      : [];

    const nextBackupState = {
      ...existingBackupState,
      latest_backup_path: backupPath,
      latest_backup_file: fileName,
      latest_backup_at: generatedAt,
      latest_backup_size_bytes: sizeBytes,
      latest_backup_size_label: formatBytes(sizeBytes),
    };

    const nextHistoryEntry = {
      path: backupPath,
      file_name: fileName,
      created_at: generatedAt,
      size_bytes: sizeBytes,
      size_label: formatBytes(sizeBytes),
    };

    const nextBackupHistory = [
      nextHistoryEntry,
      ...existingBackupHistory.filter((entry) => isObject(entry)),
    ].slice(0, BACKUP_HISTORY_LIMIT);

    await upsertChatSettings(
      authUser.userId,
      {},
      {
        backup_state: nextBackupState,
        backup_history: nextBackupHistory,
      }
    );

    const { data: signedUrlData } = await supabase.storage
      .from(BACKUP_BUCKET)
      .createSignedUrl(backupPath, 60 * 10);

    return res.status(200).json({
      success: true,
      data: {
        generated_at: generatedAt,
        backup_path: backupPath,
        backup_file_name: fileName,
        backup_size_bytes: sizeBytes,
        backup_size_label: formatBytes(sizeBytes),
        summary,
        download_url: signedUrlData?.signedUrl || null,
      },
    });
  } catch (error) {
    return forwardAccountControllerError(next, error, 'ACCOUNT_BACKUP_EXPORT_FAILED', 'Failed to create backup');
  }
}

export async function restoreBackup(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = await authenticateAccountRequest(req, next);
    if (!authUser) {
      return;
    }

    const profileRecord = await resolveProfileForAuthUser(authUser.userId);
    if (!profileRecord?.id) {
      return next(createHttpError(404, 'ACCOUNT_PROFILE_NOT_FOUND', 'Profile not found for authenticated user'));
    }

    const sourcePath = toStringOrNull((req.body as { source_path?: string })?.source_path);
    const currentSettings = await fetchLatestChatSettingsRow(authUser.userId);
    const currentAppInfo = toRecord(currentSettings?.app_info_preferences);
    const currentBackupState = toRecord(currentAppInfo.backup_state);

    const backupFiles = await listUserBackups(authUser.userId);
    const backupPath =
      sourcePath ||
      toStringOrNull(currentBackupState.latest_backup_path) ||
      (backupFiles[0]?.path ?? null);

    if (!backupPath) {
      return next(createHttpError(404, 'ACCOUNT_BACKUP_NOT_FOUND', 'No backup found to restore'));
    }

    const { data: backupBlob, error: downloadError } = await supabase.storage
      .from(BACKUP_BUCKET)
      .download(backupPath);

    if (downloadError || !backupBlob) {
      return next(createHttpError(404, 'ACCOUNT_BACKUP_DOWNLOAD_FAILED', 'Backup file not found', downloadError));
    }

    const backupText = await backupBlob.text();
    const parsedBackup = JSON.parse(backupText) as Record<string, unknown>;
    const parsedMeta = toRecord(parsedBackup.meta);
    const backupUserId =
      toStringOrNull(parsedMeta.user_id) ||
      toStringOrNull(parsedBackup.user_id);

    if (backupUserId && backupUserId !== authUser.userId) {
      return next(
        createHttpError(403, 'ACCOUNT_BACKUP_FORBIDDEN', 'Backup file does not belong to the authenticated user')
      );
    }

    const backupProfile = toRecord(parsedBackup.profile);
    const backupPreferences = toRecord(
      backupProfile.preferences || (parsedBackup.preferences as Record<string, unknown>)
    );
    const existingPreferences = toRecord(profileRecord.preferences);
    const nextPreferences = {
      ...existingPreferences,
      ...backupPreferences,
    };

    const profilePatch: Record<string, unknown> = {
      preferences: nextPreferences,
      updated_at: new Date().toISOString(),
    };

    if (Object.prototype.hasOwnProperty.call(backupProfile, 'phone')) {
      profilePatch.phone = backupProfile.phone ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(backupProfile, 'emergency_contact')) {
      profilePatch.emergency_contact = backupProfile.emergency_contact ?? null;
    }

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update(profilePatch as never)
      .eq('id', profileRecord.id);

    if (profileUpdateError) {
      return next(
        createHttpError(
          500,
          'ACCOUNT_BACKUP_PROFILE_RESTORE_FAILED',
          'Failed to restore profile settings',
          profileUpdateError
        )
      );
    }

    const backupChatSettings = toRecord(parsedBackup.chat_settings);
    const backupAppInfo = toRecord(backupChatSettings.app_info_preferences);
    const restoredAt = new Date().toISOString();
    const nextBackupState = {
      ...currentBackupState,
      last_restore_at: restoredAt,
      last_restore_source: backupPath,
    };

    const chatRowPatch: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(backupChatSettings, 'chat_backup_enabled')) {
      chatRowPatch.chat_backup_enabled = Boolean(backupChatSettings.chat_backup_enabled);
    }
    if (Object.prototype.hasOwnProperty.call(backupChatSettings, 'chat_backup_frequency')) {
      chatRowPatch.chat_backup_frequency = toStringOrNull(backupChatSettings.chat_backup_frequency) || 'daily';
    }
    if (Object.prototype.hasOwnProperty.call(backupChatSettings, 'backup_include_videos')) {
      chatRowPatch.backup_include_videos = Boolean(backupChatSettings.backup_include_videos);
    }
    if (Object.prototype.hasOwnProperty.call(backupChatSettings, 'app_language')) {
      chatRowPatch.app_language = toStringOrNull(backupChatSettings.app_language);
    }

    await upsertChatSettings(authUser.userId, chatRowPatch, {
      ...backupAppInfo,
      backup_state: nextBackupState,
    });

    return res.status(200).json({
      success: true,
      data: {
        restored_at: restoredAt,
        restored_from_path: backupPath,
        restored_sections: ['profile_preferences', 'chat_settings'],
      },
    });
  } catch (error) {
    return forwardAccountControllerError(next, error, 'ACCOUNT_BACKUP_RESTORE_FAILED', 'Failed to restore backup');
  }
}

export async function cleanupBackups(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = await authenticateAccountRequest(req, next);
    if (!authUser) {
      return;
    }

    const requestedRetention = toNumber((req.body as { retention_days?: number }).retention_days);
    const retentionDays = requestedRetention || DEFAULT_BACKUP_RETENTION_DAYS;
    const retentionCutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    const backupFiles = await listUserBackups(authUser.userId);
    const filesToDelete = backupFiles
      .filter((file) => {
        if (!file.createdAt) {
          return false;
        }
        const createdAtMs = new Date(file.createdAt).getTime();
        return Number.isFinite(createdAtMs) && createdAtMs < retentionCutoffMs;
      })
      .map((file) => file.path);

    if (filesToDelete.length > 0) {
      const { error: removeError } = await supabase.storage.from(BACKUP_BUCKET).remove(filesToDelete);
      if (removeError) {
        return next(
          createHttpError(500, 'ACCOUNT_BACKUP_CLEANUP_FAILED', 'Failed to remove old backups', removeError)
        );
      }
    }

    const remainingBackups = await listUserBackups(authUser.userId);
    const currentSettings = await fetchLatestChatSettingsRow(authUser.userId);
    const currentAppInfo = toRecord(currentSettings?.app_info_preferences);
    const currentBackupState = toRecord(currentAppInfo.backup_state);
    const latestRemainingBackup = remainingBackups[0];
    const cleanedAt = new Date().toISOString();

    await upsertChatSettings(authUser.userId, {}, {
      backup_state: {
        ...currentBackupState,
        latest_backup_path: latestRemainingBackup?.path || null,
        latest_backup_file: latestRemainingBackup?.name || null,
        latest_backup_at: latestRemainingBackup?.createdAt || null,
        latest_backup_size_bytes: latestRemainingBackup?.sizeBytes || 0,
        latest_backup_size_label: formatBytes(latestRemainingBackup?.sizeBytes || 0),
        last_cleanup_at: cleanedAt,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        deleted_backups: filesToDelete.length,
        remaining_backups: remainingBackups.length,
        retention_days: retentionDays,
        cleaned_at: cleanedAt,
      },
    });
  } catch (error) {
    return forwardAccountControllerError(next, error, 'ACCOUNT_BACKUP_CLEANUP_FAILED', 'Failed to clean old backups');
  }
}

export async function getAppUpdateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = await authenticateAccountRequest(req, next);
    if (!authUser) {
      return;
    }

    const query = req.query as {
      platform?: 'ios' | 'android' | 'web';
      channel?: 'stable' | 'beta';
      current_version?: string;
      current_build?: string;
    };

    const platform = query.platform || 'web';
    const channel = query.channel || 'stable';
    const currentVersion = toStringOrNull(query.current_version) || '0.0.0';
    const currentBuild = toStringOrNull(query.current_build);

    const { data: settingsRows, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value, data_type')
      .eq('category', APP_UPDATE_SETTINGS_CATEGORY);

    if (settingsError && settingsError.code !== '42P01') {
      return next(
        createHttpError(500, 'ACCOUNT_APP_UPDATE_SETTINGS_FAILED', 'Failed to fetch app update settings', settingsError)
      );
    }

    const settingsMap = (settingsRows || []).reduce<Record<string, unknown>>((acc, row) => {
      acc[row.key] = parseSettingValue(row.value, row.data_type);
      return acc;
    }, {});

    let manifest: Record<string, unknown> = {};
    for (const manifestKey of RELEASE_MANIFEST_KEYS) {
      const candidate = settingsMap[manifestKey];
      if (isObject(candidate)) {
        manifest = candidate;
        break;
      }
    }

    const latestStableVersion = selectLatestString(
      manifest.latest_stable_version,
      settingsMap.latest_stable_version,
      manifest.latest_version,
      settingsMap.latest_version,
      currentVersion
    ) as string;

    const latestBetaVersion = selectLatestString(
      manifest.latest_beta_version,
      settingsMap.latest_beta_version,
      latestStableVersion
    ) as string;

    const latestVersion = channel === 'beta' ? latestBetaVersion : latestStableVersion;
    const minimumSupportedVersion = selectLatestString(
      manifest.minimum_supported_version,
      settingsMap.minimum_supported_version
    );
    const latestBuild = channel === 'beta'
      ? selectLatestString(manifest.latest_beta_build, settingsMap.latest_beta_build, currentBuild)
      : selectLatestString(manifest.latest_stable_build, settingsMap.latest_stable_build, currentBuild);
    const latestReleaseDate = channel === 'beta'
      ? selectLatestString(manifest.latest_beta_release_date, settingsMap.latest_beta_release_date)
      : selectLatestString(manifest.latest_stable_release_date, settingsMap.latest_stable_release_date);
    const updateSize = channel === 'beta'
      ? selectLatestString(manifest.latest_beta_size, settingsMap.latest_beta_size)
      : selectLatestString(manifest.latest_stable_size, settingsMap.latest_stable_size);

    const iosStoreUrl = selectLatestString(
      manifest.ios_store_url,
      settingsMap.ios_store_url,
      process.env.IOS_APP_STORE_URL
    );
    const androidStoreUrl = selectLatestString(
      manifest.android_store_url,
      settingsMap.android_store_url,
      process.env.ANDROID_PLAY_STORE_URL
    );
    const webUpdateUrl = selectLatestString(
      manifest.web_update_url,
      settingsMap.web_update_url,
      process.env.WEB_APP_UPDATE_URL
    );
    const updateUrl =
      platform === 'ios' ? iosStoreUrl : platform === 'android' ? androidStoreUrl : webUpdateUrl;

    const releaseHistory = parseReleaseHistory(
      manifest.release_history ?? settingsMap.release_history
    );
    const fallbackHistory = [
      {
        id: `version-${latestVersion}`,
        version: latestVersion,
        date: latestReleaseDate,
        size: updateSize,
        type: channel,
        features: [],
        bugFixes: [],
      },
    ];
    const normalizedHistory = releaseHistory.length > 0 ? releaseHistory : fallbackHistory;

    const isUpdateAvailable = compareVersions(latestVersion, currentVersion) > 0;
    const isMandatory = minimumSupportedVersion
      ? compareVersions(currentVersion, minimumSupportedVersion) < 0
      : false;

    return res.status(200).json({
      success: true,
      data: {
        user_id: authUser.userId,
        platform,
        channel,
        current_version: currentVersion,
        current_build: currentBuild,
        latest_version: latestVersion,
        latest_build: latestBuild,
        latest_release_date: latestReleaseDate,
        minimum_supported_version: minimumSupportedVersion,
        update_size: updateSize,
        update_url: updateUrl,
        is_update_available: isUpdateAvailable,
        is_mandatory_update: isMandatory,
        release_history: normalizedHistory,
        checked_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return forwardAccountControllerError(
      next,
      error,
      'ACCOUNT_APP_UPDATE_STATUS_FAILED',
      'Failed to fetch app update status'
    );
  }
}
