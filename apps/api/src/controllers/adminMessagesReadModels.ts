import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type ProfileRow = {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  community_id?: string | null;
  unit_id?: string | null;
  block_number?: string | null;
  is_active?: boolean | null;
  last_login?: string | null;
};

type UnitRow = {
  id: string;
  block?: string | null;
  number?: string | null;
  unit_number?: string | null;
  community_id?: string | null;
};

type CommunityRow = {
  id: string;
  name?: string | null;
};

type MessageRow = {
  id: string;
  from_user?: string | null;
  to_user?: string | null;
  body?: string | null;
  content?: string | null;
  attachments?: unknown;
  message_type?: string | null;
  sent_at?: string | null;
  is_read?: boolean | null;
  read?: boolean | null;
  deleted_at?: string | null;
  message_status?: string | null;
  read_at?: string | null;
  delivered_at?: string | null;
  reply_to_id?: string | null;
  edited_at?: string | null;
};

type GroupRow = {
  id: string;
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  is_active?: boolean | null;
  updated_at?: string | null;
};

type GroupMemberRow = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at?: string | null;
  joined_by?: string | null;
  is_active?: boolean | null;
};

type GroupMessageRow = {
  id: string;
  group_id?: string | null;
  from_user?: string | null;
  body?: string | null;
  attachments?: unknown;
  message_type?: string | null;
  sent_at?: string | null;
  read_by?: unknown;
  is_active?: boolean | null;
};

type ChatContactRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: string;
  name: string;
  contact: string;
  location: string;
  languages: string[];
  activityStatus: 'online' | 'offline';
  message: string;
  time: string;
  mutualCount: number;
  chatIcon?: string;
  unreadCount: number;
};

type ChatStatsRecord = {
  totalMessages: number;
  activeChats: number;
  unreadMessages: number;
  onlineUsers: number;
};

const PROFILE_SELECT =
  'id, user_id, first_name, last_name, full_name, email, phone, avatar_url, role, community_id, unit_id, block_number, is_active, last_login';
const UNIT_SELECT = 'id, block, number, unit_number, community_id';
const COMMUNITY_SELECT = 'id, name';
const MESSAGE_SELECT =
  'id, from_user, to_user, body, content, attachments, message_type, sent_at, is_read, read, deleted_at, message_status, read_at, delivered_at, reply_to_id, edited_at';
const GROUP_SELECT = 'id, name, description, avatar_url, created_at, created_by, is_active, updated_at';
const GROUP_MEMBER_SELECT = 'id, group_id, user_id, joined_at, joined_by, is_active';
const GROUP_MESSAGE_SELECT = 'id, group_id, from_user, body, attachments, message_type, sent_at, read_by, is_active';
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const MESSAGE_GROUP_ALLOWED_TYPES = new Set([
  'text',
  'image',
  'video',
  'audio',
  'file',
  'system',
  'location',
  'contact',
]);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const dedupeRowsById = <T extends { id: string }>(rows: T[]) =>
  [...new Map(rows.map((row) => [row.id, row])).values()];

const sortMessagesOldestFirst = <T extends { sent_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.sent_at ? new Date(left.sent_at).getTime() : 0;
    const rightTime = right.sent_at ? new Date(right.sent_at).getTime() : 0;
    return leftTime - rightTime;
  });

const sortMessagesNewestFirst = <T extends { sent_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.sent_at ? new Date(left.sent_at).getTime() : 0;
    const rightTime = right.sent_at ? new Date(right.sent_at).getTime() : 0;
    return rightTime - leftTime;
  });

const buildProfileName = (profile?: Partial<ProfileRow> | null) => {
  const combined = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return combined || profile?.full_name || profile?.email || 'Unknown user';
};

const isProfileOnline = (profile?: ProfileRow | null) => {
  if (!profile?.is_active || !profile.last_login) {
    return false;
  }

  const lastLogin = new Date(profile.last_login).getTime();
  if (Number.isNaN(lastLogin)) {
    return false;
  }

  return Date.now() - lastLogin <= ONLINE_THRESHOLD_MS;
};

const normalizeReadBy = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  if (value && typeof value === 'object' && 'users' in (value as Record<string, unknown>)) {
    const users = (value as Record<string, unknown>).users;
    return Array.isArray(users) ? users.filter((entry): entry is string => typeof entry === 'string') : [];
  }

  return [];
};

const isMessageUnread = (message: MessageRow) => message.is_read === false || message.read === false;

const buildMessagePreview = (message?: Pick<MessageRow, 'body' | 'content' | 'message_type' | 'attachments'> | null) => {
  if (!message) {
    return 'No messages yet';
  }

  if (message.message_type === 'file') {
    const label = trimString(message.body) || trimString(message.content);
    return `Shared a file${label ? `: ${label}` : ''}`;
  }

  if (message.message_type === 'video_call') {
    return 'Started a call';
  }

  const content = trimString(message.body) || trimString(message.content);
  return content || 'Message sent';
};

const buildMessageIcon = (message?: Pick<MessageRow, 'message_type'> | null) => {
  if (!message?.message_type) {
    return undefined;
  }

  if (message.message_type === 'file') {
    return 'ri:attachment-2';
  }

  if (message.message_type === 'video_call') {
    return 'ri:video-on-line';
  }

  return undefined;
};

const buildLocationLabel = (
  profile: ProfileRow,
  communitiesById: Map<string, CommunityRow>,
  unitsById: Map<string, UnitRow>
) => {
  const community = profile.community_id ? communitiesById.get(profile.community_id) || null : null;
  const unit = profile.unit_id ? unitsById.get(profile.unit_id) || null : null;
  const unitNumber = unit?.number || unit?.unit_number || null;
  const block = unit?.block || profile.block_number || null;

  if (community?.name && (block || unitNumber)) {
    const unitLabel = `${block || ''}${block && unitNumber ? '-' : ''}${unitNumber || ''}`.trim() || 'Unit assigned';
    return `${unitLabel} | ${community.name}`;
  }

  if (community?.name) {
    return community.name;
  }

  return 'No community assigned';
};

const toProfileSummary = (profile?: ProfileRow | null) =>
  profile
    ? {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || null,
        email: profile.email || '',
        phone: profile.phone || null,
      }
    : null;

const ensureActorProfileId = (req: Request) => {
  const actorProfileId = trimString(req.userProfile?.id);
  if (!actorProfileId) {
    throw createHttpError(401, 'ADMIN_PROFILE_REQUIRED', 'Missing admin profile context');
  }

  return actorProfileId;
};

async function loadProfilesByIds(profileIds: string[]) {
  if (profileIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data, error } = await supabase.from('profiles').select(PROFILE_SELECT).in('id', profileIds);

  if (error) {
    throw createHttpError(500, 'MESSAGE_PROFILE_LOAD_FAILED', 'Failed to load messaging profiles', error);
  }

  return new Map((data || []).map((row) => [row.id, row as ProfileRow]));
}

async function loadUnitsByIds(unitIds: string[]) {
  if (unitIds.length === 0) {
    return new Map<string, UnitRow>();
  }

  const { data, error } = await supabase.from('units').select(UNIT_SELECT).in('id', unitIds);

  if (error) {
    throw createHttpError(500, 'MESSAGE_UNIT_LOAD_FAILED', 'Failed to load messaging units', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadCommunitiesByIds(communityIds: string[]) {
  if (communityIds.length === 0) {
    return new Map<string, CommunityRow>();
  }

  const { data, error } = await supabase
    .from('communities')
    .select(COMMUNITY_SELECT)
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'MESSAGE_COMMUNITY_LOAD_FAILED', 'Failed to load messaging communities', error);
  }

  return new Map((data || []).map((row) => [row.id, row as CommunityRow]));
}

async function loadActorDirectMessages(actorProfileId: string) {
  const [sentResult, receivedResult] = await Promise.all([
    supabase.from('messages').select(MESSAGE_SELECT).eq('from_user', actorProfileId).is('deleted_at', null),
    supabase.from('messages').select(MESSAGE_SELECT).eq('to_user', actorProfileId).is('deleted_at', null),
  ]);

  if (sentResult.error || receivedResult.error) {
    throw createHttpError(500, 'MESSAGE_CONVERSATIONS_LOAD_FAILED', 'Failed to load message conversations', {
      sentError: sentResult.error,
      receivedError: receivedResult.error,
    });
  }

  return sortMessagesNewestFirst(
    dedupeRowsById([...(sentResult.data || []), ...(receivedResult.data || [])] as MessageRow[])
  );
}

async function loadScopedProfiles(scope: AdminScope) {
  if (scope.isGlobal) {
    const { data, error } = await supabase.from('profiles').select(PROFILE_SELECT);

    if (error) {
      throw createHttpError(500, 'MESSAGE_PROFILE_LOAD_FAILED', 'Failed to load messaging profiles', error);
    }

    return (data || []) as ProfileRow[];
  }

  if (scope.communityIds.length === 0) {
    return [] as ProfileRow[];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .in('community_id', scope.communityIds);

  if (error) {
    throw createHttpError(500, 'MESSAGE_PROFILE_LOAD_FAILED', 'Failed to load scoped messaging profiles', error);
  }

  return (data || []) as ProfileRow[];
}

async function loadAvailableMessageContacts(scope: AdminScope, actorProfileId: string) {
  const actorMessages = await loadActorDirectMessages(actorProfileId);
  const directCounterpartIds = dedupeStrings(
    actorMessages.flatMap((message) => {
      const ids = [message.from_user, message.to_user].filter((value): value is string => Boolean(value));
      return ids.filter((id) => id !== actorProfileId);
    })
  );

  const [scopedProfiles, directProfilesById, actorProfileById] = await Promise.all([
    loadScopedProfiles(scope),
    loadProfilesByIds(directCounterpartIds),
    loadProfilesByIds([actorProfileId]),
  ]);

  const allProfiles = dedupeRowsById([
    ...scopedProfiles,
    ...[...directProfilesById.values()],
    ...[...actorProfileById.values()],
  ]).filter((profile) => profile.id !== actorProfileId);

  const unitsById = await loadUnitsByIds(dedupeStrings(allProfiles.map((profile) => profile.unit_id)));
  const communitiesById = await loadCommunitiesByIds(
    dedupeStrings(
      allProfiles.flatMap((profile) => {
        const unitCommunityId = profile.unit_id ? unitsById.get(profile.unit_id)?.community_id || null : null;
        return [profile.community_id, unitCommunityId];
      })
    )
  );

  const records = allProfiles
    .map((profile) => {
      const contactMessages = actorMessages.filter((message) => {
        const fromUser = message.from_user;
        const toUser = message.to_user;
        return (
          (fromUser === actorProfileId && toUser === profile.id) ||
          (fromUser === profile.id && toUser === actorProfileId)
        );
      });
      const latestMessage = contactMessages[0] || null;
      const unreadCount = contactMessages.filter(
        (message) => message.from_user === profile.id && isMessageUnread(message)
      ).length;

      return {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || null,
        phone: profile.phone || null,
        role: profile.role || 'user',
        name: buildProfileName(profile),
        contact: profile.phone || 'Not provided',
        location: buildLocationLabel(profile, communitiesById, unitsById),
        languages: ['English'],
        activityStatus: isProfileOnline(profile) ? 'online' : 'offline',
        message: buildMessagePreview(latestMessage),
        time: latestMessage?.sent_at || new Date(0).toISOString(),
        mutualCount: 0,
        chatIcon: buildMessageIcon(latestMessage),
        unreadCount,
      } satisfies ChatContactRecord;
    })
    .sort((left, right) => {
      const leftTime = new Date(left.time).getTime();
      const rightTime = new Date(right.time).getTime();
      return rightTime - leftTime || left.name.localeCompare(right.name);
    });

  return {
    actorMessages,
    contacts: records,
    contactIds: new Set(records.map((record) => record.id)),
  };
}

async function ensureMessageContactAccess(scope: AdminScope, actorProfileId: string, contactId: string) {
  const { contacts, actorMessages, contactIds } = await loadAvailableMessageContacts(scope, actorProfileId);
  if (!contactIds.has(contactId)) {
    throw createHttpError(404, 'MESSAGE_CONTACT_NOT_FOUND', 'Messaging contact not found');
  }

  return {
    contact: contacts.find((entry) => entry.id === contactId) || null,
    actorMessages,
  };
}

async function ensureActiveGroupMembership(groupId: string, actorProfileId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(GROUP_MEMBER_SELECT)
    .eq('group_id', groupId)
    .eq('user_id', actorProfileId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'MESSAGE_GROUP_MEMBERSHIP_LOAD_FAILED', 'Failed to resolve group membership', error);
  }

  if (!data) {
    throw createHttpError(403, 'MESSAGE_GROUP_ACCESS_FORBIDDEN', 'You cannot access this group');
  }

  return data as GroupMemberRow;
}

async function loadGroupDetail(groupId: string) {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select(GROUP_SELECT)
    .eq('id', groupId)
    .eq('is_active', true)
    .maybeSingle();

  if (groupError) {
    throw createHttpError(500, 'MESSAGE_GROUP_LOAD_FAILED', 'Failed to load group', groupError);
  }

  if (!group) {
    throw createHttpError(404, 'MESSAGE_GROUP_NOT_FOUND', 'Group not found');
  }

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select(GROUP_MEMBER_SELECT)
    .eq('group_id', groupId)
    .eq('is_active', true);

  if (membersError) {
    throw createHttpError(500, 'MESSAGE_GROUP_MEMBERS_LOAD_FAILED', 'Failed to load group members', membersError);
  }

  const profilesById = await loadProfilesByIds(dedupeStrings((members || []).map((member) => member.user_id)));

  return {
    ...(group as GroupRow),
    group_members: (members || []).map((member) => ({
      ...(member as GroupMemberRow),
      profiles: toProfileSummary(profilesById.get(member.user_id) || null),
    })),
  };
}

async function loadGroupMessagesWithProfiles(groupId: string) {
  const { data, error } = await supabase
    .from('group_messages')
    .select(GROUP_MESSAGE_SELECT)
    .eq('group_id', groupId)
    .eq('is_active', true)
    .order('sent_at', { ascending: true });

  if (error) {
    throw createHttpError(500, 'MESSAGE_GROUP_MESSAGES_LOAD_FAILED', 'Failed to load group messages', error);
  }

  const profilesById = await loadProfilesByIds(
    dedupeStrings((data || []).map((message) => message.from_user))
  );

  return (data || []).map((message) => ({
    ...(message as GroupMessageRow),
    profiles: toProfileSummary(message.from_user ? profilesById.get(message.from_user) || null : null),
  }));
}

export async function getMessageStats(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const scope = await resolveAdminScope(req);
    const { actorMessages, contacts } = await loadAvailableMessageContacts(scope, actorProfileId);

    const uniqueChats = new Set(
      actorMessages.flatMap((message) => {
        const counterpartId = message.from_user === actorProfileId ? message.to_user : message.from_user;
        return counterpartId ? [counterpartId] : [];
      })
    );

    const payload: ChatStatsRecord = {
      totalMessages: actorMessages.length,
      activeChats: uniqueChats.size,
      unreadMessages: actorMessages.filter(
        (message) => message.to_user === actorProfileId && isMessageUnread(message)
      ).length,
      onlineUsers: contacts.filter((contact) => contact.activityStatus === 'online').length,
    };

    return res.json({ data: payload });
  } catch (error) {
    return next(error);
  }
}

export async function listMessageContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const scope = await resolveAdminScope(req);
    const { contacts } = await loadAvailableMessageContacts(scope, actorProfileId);

    return res.json({ data: contacts });
  } catch (error) {
    return next(error);
  }
}

export async function getMessageContact(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const scope = await resolveAdminScope(req);
    const contactId = trimString(req.params.id);
    const { contact } = await ensureMessageContactAccess(scope, actorProfileId, contactId);

    return res.json({ data: contact });
  } catch (error) {
    return next(error);
  }
}

export async function getMessageConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const scope = await resolveAdminScope(req);
    const contactId = trimString(req.params.id);
    const { actorMessages } = await ensureMessageContactAccess(scope, actorProfileId, contactId);

    const conversation = sortMessagesOldestFirst(
      actorMessages.filter((message) => {
        const fromUser = message.from_user;
        const toUser = message.to_user;
        return (
          (fromUser === actorProfileId && toUser === contactId) ||
          (fromUser === contactId && toUser === actorProfileId)
        );
      })
    );

    return res.json({ data: conversation });
  } catch (error) {
    return next(error);
  }
}

export async function listMessageGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const { data: memberships, error: membershipsError } = await supabase
      .from('group_members')
      .select(GROUP_MEMBER_SELECT)
      .eq('user_id', actorProfileId)
      .eq('is_active', true);

    if (membershipsError) {
      return next(
        createHttpError(500, 'MESSAGE_GROUPS_LOAD_FAILED', 'Failed to load group memberships', membershipsError)
      );
    }

    const groupIds = dedupeStrings((memberships || []).map((membership) => membership.group_id));
    if (groupIds.length === 0) {
      return res.json({ data: [] });
    }

    const [groupsResult, allMembersResult, allMessagesResult] = await Promise.all([
      supabase.from('groups').select(GROUP_SELECT).in('id', groupIds).eq('is_active', true),
      supabase.from('group_members').select(GROUP_MEMBER_SELECT).in('group_id', groupIds).eq('is_active', true),
      supabase.from('group_messages').select(GROUP_MESSAGE_SELECT).in('group_id', groupIds).eq('is_active', true),
    ]);

    if (groupsResult.error || allMembersResult.error || allMessagesResult.error) {
      return next(
        createHttpError(500, 'MESSAGE_GROUPS_LOAD_FAILED', 'Failed to load groups', {
          groupsError: groupsResult.error,
          membersError: allMembersResult.error,
          messagesError: allMessagesResult.error,
        })
      );
    }

    const senderProfilesById = await loadProfilesByIds(
      dedupeStrings((allMessagesResult.data || []).map((message) => message.from_user))
    );

    const summaries = ((groupsResult.data || []) as GroupRow[])
      .map((group) => {
        const groupMembers = (allMembersResult.data || []).filter((member) => member.group_id === group.id);
        const groupMessages = sortMessagesNewestFirst(
          ((allMessagesResult.data || []).filter((message) => message.group_id === group.id) as GroupMessageRow[])
        );
        const lastMessage = groupMessages[0] || null;
        const senderProfile =
          lastMessage?.from_user ? senderProfilesById.get(lastMessage.from_user) || null : null;

        return {
          ...group,
          member_count: groupMembers.length,
          last_message: buildMessagePreview(lastMessage),
          last_message_time: lastMessage?.sent_at || group.updated_at || group.created_at || null,
          last_message_sender:
            lastMessage?.from_user === actorProfileId
              ? 'You'
              : senderProfile
                ? buildProfileName(senderProfile)
                : '',
          unread_count: groupMessages.filter(
            (message) =>
              message.from_user !== actorProfileId && !normalizeReadBy(message.read_by).includes(actorProfileId)
          ).length,
          is_member: true,
          groupName: group.name,
          variant: 'primary',
          time: lastMessage?.sent_at || group.updated_at || group.created_at || new Date(0).toISOString(),
          change: groupMessages.filter(
            (message) =>
              message.from_user !== actorProfileId && !normalizeReadBy(message.read_by).includes(actorProfileId)
          ).length,
        };
      })
      .sort((left, right) => {
        const leftTime = new Date(left.time || 0).getTime();
        const rightTime = new Date(right.time || 0).getTime();
        return rightTime - leftTime;
      });

    return res.json({ data: summaries });
  } catch (error) {
    return next(error);
  }
}

export async function getMessageGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const groupId = trimString(req.params.id);
    await ensureActiveGroupMembership(groupId, actorProfileId);

    const data = await loadGroupDetail(groupId);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}

export async function createMessageGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const scope = await resolveAdminScope(req);
    const name = trimString(req.body?.name);
    const description = trimString(req.body?.description) || null;
    const requestedMemberIds = dedupeStrings(
      Array.isArray(req.body?.member_ids) ? req.body.member_ids : []
    ).filter((id) => id !== actorProfileId);

    if (!name) {
      return next(createHttpError(400, 'MESSAGE_GROUP_NAME_REQUIRED', 'Group name is required'));
    }

    const { contactIds } = await loadAvailableMessageContacts(scope, actorProfileId);
    const invalidMemberIds = requestedMemberIds.filter((memberId) => !contactIds.has(memberId));

    if (invalidMemberIds.length > 0) {
      return next(
        createHttpError(
          403,
          'MESSAGE_GROUP_MEMBER_SCOPE_VIOLATION',
          'One or more selected members are outside your allowed messaging scope',
          { invalidMemberIds }
        )
      );
    }

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        created_by: actorProfileId,
        is_active: true,
      })
      .select(GROUP_SELECT)
      .single();

    if (groupError || !group) {
      return next(
        createHttpError(500, 'MESSAGE_GROUP_CREATE_FAILED', 'Failed to create group', groupError)
      );
    }

    const memberRows = dedupeStrings([actorProfileId, ...requestedMemberIds]).map((memberId) => ({
      group_id: group.id,
      user_id: memberId,
      joined_by: actorProfileId,
      is_active: true,
    }));

    if (memberRows.length > 0) {
      const { error: membersError } = await supabase.from('group_members').insert(memberRows);
      if (membersError) {
        return next(
          createHttpError(500, 'MESSAGE_GROUP_MEMBERS_CREATE_FAILED', 'Failed to create group members', membersError)
        );
      }
    }

    const data = await loadGroupDetail(group.id);
    return res.status(201).json({ data });
  } catch (error) {
    return next(error);
  }
}

export async function listMessageGroupMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const groupId = trimString(req.params.id);
    await ensureActiveGroupMembership(groupId, actorProfileId);

    const data = await loadGroupMessagesWithProfiles(groupId);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}

export async function createMessageGroupMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const actorProfileId = ensureActorProfileId(req);
    const groupId = trimString(req.params.id);
    await ensureActiveGroupMembership(groupId, actorProfileId);

    const body = trimString(req.body?.body) || null;
    const attachments = req.body?.attachments ?? null;
    const messageTypeInput = trimString(req.body?.message_type).toLowerCase();
    const messageType = MESSAGE_GROUP_ALLOWED_TYPES.has(messageTypeInput) ? messageTypeInput : 'text';

    if (!body && attachments == null) {
      return next(
        createHttpError(
          400,
          'MESSAGE_GROUP_MESSAGE_CONTENT_REQUIRED',
          'Message body or attachments are required'
        )
      );
    }

    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        from_user: actorProfileId,
        body,
        attachments,
        message_type: messageType,
        sent_at: new Date().toISOString(),
        is_active: true,
        read_by: [actorProfileId],
      })
      .select(GROUP_MESSAGE_SELECT)
      .single();

    if (error || !data) {
      return next(
        createHttpError(500, 'MESSAGE_GROUP_MESSAGE_CREATE_FAILED', 'Failed to create group message', error)
      );
    }

    const profileById = await loadProfilesByIds([actorProfileId]);

    return res.status(201).json({
      data: {
        ...(data as GroupMessageRow),
        profiles: toProfileSummary(profileById.get(actorProfileId) || null),
      },
    });
  } catch (error) {
    return next(error);
  }
}
