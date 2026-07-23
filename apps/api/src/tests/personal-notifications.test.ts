import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  getMyNotifications,
  markAllMyNotificationsAsRead,
  markMyNotificationAsRead,
} from '../controllers/notifications';

const state = vi.hoisted(() => ({ rows: [] as Record<string, any>[] }));

function builder() {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let operation: 'read' | 'update' = 'read';
  let payload: Record<string, unknown> = {};
  let limit = 50;
  let countRequested = false;

  const execute = () => {
    const matching = state.rows.filter((row) => filters.every((filter) => filter(row)));
    if (operation === 'update') {
      const ids = new Set(matching.map((row) => row.id));
      state.rows = state.rows.map((row) => (ids.has(row.id) ? { ...row, ...payload } : row));
      return { data: state.rows.filter((row) => ids.has(row.id)), error: null, count: null };
    }
    return { data: matching.slice(0, limit), error: null, count: countRequested ? matching.length : null };
  };

  const query: any = {
    select(_columns?: string, options?: { count?: string; head?: boolean }) {
      countRequested = options?.count === 'exact';
      return query;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return query;
    },
    order() {
      return query;
    },
    limit(value: number) {
      limit = value;
      return query;
    },
    update(next: Record<string, unknown>) {
      operation = 'update';
      payload = next;
      return query;
    },
    maybeSingle() {
      const result = execute();
      return Promise.resolve({ data: result.data[0] || null, error: null });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(execute()).then(resolve, reject);
    },
  };
  return query;
}

vi.mock('../lib/supabase', () => ({
  supabase: { from: () => builder() },
  adminSupabase: { from: () => builder() },
}));

const request = (overrides: Partial<Request> = {}) => ({
  user: { id: 'user-a' },
  query: {},
  params: {},
  ...overrides,
}) as Request;

const response = () => {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) { res.statusCode = code; return res; },
    json(body: unknown) { res.body = body; return res; },
  };
  return res as Response & { body: any };
};

describe('personal admin notifications', () => {
  beforeEach(() => {
    state.rows = [
      { id: 'owned-unread', user_id: 'user-a', title: 'Owned', is_read: false, created_at: '2026-07-23T10:00:00Z' },
      { id: 'owned-read', user_id: 'user-a', title: 'Read', is_read: true, created_at: '2026-07-22T10:00:00Z' },
      { id: 'other-unread', user_id: 'user-b', title: 'Private', is_read: false, created_at: '2026-07-23T11:00:00Z' },
    ];
  });

  it('returns only the authenticated administrator notifications and unread count', async () => {
    const res = response();
    const next = vi.fn();
    await getMyNotifications(request(), res, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
    expect(res.body.data.map((row: any) => row.id)).toEqual(['owned-unread', 'owned-read']);
    expect(res.body.unreadCount).toBe(1);
  });

  it('cannot mark another user notification as read', async () => {
    const res = response();
    const next = vi.fn();
    await markMyNotificationAsRead(request({ params: { id: 'other-unread' } }), res, next as NextFunction);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404, code: 'NOTIFICATION_NOT_FOUND' }));
    expect(state.rows.find((row) => row.id === 'other-unread')?.is_read).toBe(false);
  });

  it('marks every unread notification owned by the authenticated administrator', async () => {
    const res = response();
    const next = vi.fn();
    await markAllMyNotificationsAsRead(request(), res, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
    expect(state.rows.filter((row) => row.user_id === 'user-a').every((row) => row.is_read)).toBe(true);
    expect(state.rows.find((row) => row.id === 'other-unread')?.is_read).toBe(false);
  });
});
