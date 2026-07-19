import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

const isGlobalAdminRole = (role?: string | null) => {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase().replace(/\s+/g, '_') : '';
  return ['superadmin', 'super_admin', 'admin', 'administrator'].includes(normalized);
};

const pickAllowedMessageUpdates = (payload: Record<string, unknown>) => {
  const allowedKeys = new Set([
    'body',
    'content',
    'attachments',
    'message_type',
    'read',
    'is_read',
    'read_at',
    'message_status',
    'delivered_at',
    'reply_to_id',
  ]);

  return Object.fromEntries(Object.entries(payload).filter(([key]) => allowedKeys.has(key)));
};

export async function createMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const senderProfileId = req.userProfile?.id;
    if (!senderProfileId) {
      return next(createHttpError(401, 'ADMIN_PROFILE_REQUIRED', 'Missing admin profile context'));
    }

    const scope = await resolveAdminScope(req);
    const toUser = typeof req.body?.to_user === 'string' ? req.body.to_user : null;
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : null;
    const attachments = req.body?.attachments ?? null;
    const messageType = typeof req.body?.message_type === 'string' ? req.body.message_type : 'text';
    const replyToId = typeof req.body?.reply_to_id === 'string' ? req.body.reply_to_id : null;

    if (!toUser) {
      return next(createHttpError(400, 'MESSAGE_RECIPIENT_REQUIRED', 'Recipient is required'));
    }

    if (!body && !content && !attachments) {
      return next(
        createHttpError(
          400,
          'MESSAGE_CONTENT_REQUIRED',
          'Message body, content, or attachments are required'
        )
      );
    }

    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, community_id')
      .eq('id', toUser)
      .maybeSingle();

    if (recipientError) {
      return next(
        createHttpError(500, 'MESSAGE_RECIPIENT_LOOKUP_FAILED', 'Failed to resolve message recipient', recipientError)
      );
    }

    if (!recipient) {
      return next(createHttpError(404, 'MESSAGE_RECIPIENT_NOT_FOUND', 'Recipient profile not found'));
    }

    if (!scope.isGlobal && (!recipient.community_id || !canAccessCommunity(scope, recipient.community_id))) {
      return next(
        createHttpError(403, 'MESSAGE_RECIPIENT_SCOPE_VIOLATION', 'Recipient is outside your tenant scope')
      );
    }

    const insertPayload = {
      from_user: senderProfileId,
      to_user: toUser,
      body: body || null,
      content,
      attachments,
      message_type: messageType,
      reply_to_id: replyToId,
      sent_at: new Date().toISOString(),
      read: false,
      is_read: false,
      message_status: 'sent',
      deleted_at: null,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'MESSAGE_CREATE_FAILED', 'Failed to create message', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const actorProfileId = req.userProfile?.id;

    if (!actorProfileId) {
      return next(createHttpError(401, 'ADMIN_PROFILE_REQUIRED', 'Missing admin profile context'));
    }

    const scope = await resolveAdminScope(req);
    const { data: existingMessage, error: existingMessageError } = await supabase
      .from('messages')
      .select('id, from_user, to_user, deleted_at')
      .eq('id', id)
      .maybeSingle();

    if (existingMessageError) {
      return next(createHttpError(500, 'MESSAGE_LOOKUP_FAILED', 'Failed to load message', existingMessageError));
    }

    if (!existingMessage) {
      return next(createHttpError(404, 'MESSAGE_NOT_FOUND', 'Message not found'));
    }

    if (
      !scope.isGlobal &&
      existingMessage.from_user !== actorProfileId &&
      existingMessage.to_user !== actorProfileId
    ) {
      return next(createHttpError(403, 'MESSAGE_UPDATE_FORBIDDEN', 'You cannot modify this message'));
    }

    const updates = pickAllowedMessageUpdates(req.body || {});
    if (Object.keys(updates).length === 0) {
      return next(
        createHttpError(400, 'MESSAGE_UPDATE_EMPTY', 'No supported message updates were provided')
      );
    }

    const touchesContent = ['body', 'content', 'attachments', 'message_type', 'reply_to_id'].some((key) => key in updates);
    if (touchesContent) {
      updates.edited_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'MESSAGE_UPDATE_FAILED', 'Failed to update message', error));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const actorProfileId = req.userProfile?.id;
    const actorRole = req.userProfile?.role;

    if (!actorProfileId) {
      return next(createHttpError(401, 'ADMIN_PROFILE_REQUIRED', 'Missing admin profile context'));
    }

    const { data: existingMessage, error: existingMessageError } = await supabase
      .from('messages')
      .select('id, from_user, to_user, deleted_at')
      .eq('id', id)
      .maybeSingle();

    if (existingMessageError) {
      return next(createHttpError(500, 'MESSAGE_LOOKUP_FAILED', 'Failed to load message', existingMessageError));
    }

    if (!existingMessage) {
      return next(createHttpError(404, 'MESSAGE_NOT_FOUND', 'Message not found'));
    }

    if (!isGlobalAdminRole(actorRole) && existingMessage.from_user !== actorProfileId) {
      return next(
        createHttpError(403, 'MESSAGE_DELETE_FORBIDDEN', 'You can only delete messages you sent')
      );
    }

    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return next(createHttpError(500, 'MESSAGE_DELETE_FAILED', 'Failed to delete message', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
