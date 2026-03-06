import { Request, Response, NextFunction } from 'express';

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
      return res.status(401).json({ error: 'Missing admin profile context' });
    }

    const scope = await resolveAdminScope(req);
    const toUser = typeof req.body?.to_user === 'string' ? req.body.to_user : null;
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : null;
    const attachments = req.body?.attachments ?? null;
    const messageType = typeof req.body?.message_type === 'string' ? req.body.message_type : 'text';
    const replyToId = typeof req.body?.reply_to_id === 'string' ? req.body.reply_to_id : null;

    if (!toUser) {
      return res.status(400).json({ error: 'Recipient is required' });
    }

    if (!body && !content && !attachments) {
      return res.status(400).json({ error: 'Message body, content, or attachments are required' });
    }

    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, community_id')
      .eq('id', toUser)
      .maybeSingle();

    if (recipientError) {
      return res.status(500).json({ error: 'Failed to resolve message recipient' });
    }

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient profile not found' });
    }

    if (!scope.isGlobal && (!recipient.community_id || !canAccessCommunity(scope, recipient.community_id))) {
      return res.status(403).json({ error: 'Recipient is outside your tenant scope' });
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
      return res.status(500).json({ error: 'Failed to create message' });
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
      return res.status(401).json({ error: 'Missing admin profile context' });
    }

    const scope = await resolveAdminScope(req);
    const { data: existingMessage, error: existingMessageError } = await supabase
      .from('messages')
      .select('id, from_user, to_user, deleted_at')
      .eq('id', id)
      .maybeSingle();

    if (existingMessageError) {
      return res.status(500).json({ error: 'Failed to load message' });
    }

    if (!existingMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (
      !scope.isGlobal &&
      existingMessage.from_user !== actorProfileId &&
      existingMessage.to_user !== actorProfileId
    ) {
      return res.status(403).json({ error: 'You cannot modify this message' });
    }

    const updates = pickAllowedMessageUpdates(req.body || {});
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No supported message updates were provided' });
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
      return res.status(500).json({ error: 'Failed to update message' });
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
      return res.status(401).json({ error: 'Missing admin profile context' });
    }

    const { data: existingMessage, error: existingMessageError } = await supabase
      .from('messages')
      .select('id, from_user, to_user, deleted_at')
      .eq('id', id)
      .maybeSingle();

    if (existingMessageError) {
      return res.status(500).json({ error: 'Failed to load message' });
    }

    if (!existingMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!isGlobalAdminRole(actorRole) && existingMessage.from_user !== actorProfileId) {
      return res.status(403).json({ error: 'You can only delete messages you sent' });
    }

    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete message' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
