import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

import {
  getSettingsPreferenceStats,
  getSettingsSystemOverview,
} from '../controllers/adminSettingsWorkspaces';

const supabaseState = vi.hoisted(() => ({
  tables: {} as Record<string, Record<string, any>[]>,
}));

function createQueryBuilder(table: string) {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  const sortRules: Array<{ column: string; ascending: boolean }> = [];
  let limitValue: number | null = null;

  const executeRead = () => {
    let rows = [...(supabaseState.tables[table] || [])];
    rows = rows.filter((row) => filters.every((filter) => filter(row)));

    if (sortRules.length > 0) {
      rows = [...rows].sort((left, right) => {
        for (const rule of sortRules) {
          const leftValue = left[rule.column];
          const rightValue = right[rule.column];

          if (leftValue === rightValue) continue;
          if (leftValue === undefined || leftValue === null) return 1;
          if (rightValue === undefined || rightValue === null) return -1;

          const comparison = leftValue < rightValue ? -1 : 1;
          return rule.ascending ? comparison : comparison * -1;
        }

        return 0;
      });
    }

    if (typeof limitValue === 'number') {
      rows = rows.slice(0, limitValue);
    }

    return { data: rows, error: null };
  };

  const builder: any = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push((row) => row[column] === value);
      return builder;
    },
    in(column: string, values: unknown[]) {
      filters.push((row) => values.includes(row[column]));
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      sortRules.push({ column, ascending: options?.ascending ?? true });
      return builder;
    },
    limit(value: number) {
      limitValue = value;
      return builder;
    },
    maybeSingle() {
      const result = executeRead();
      return Promise.resolve({ data: result.data[0] || null, error: result.error });
    },
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(executeRead()).then(resolve, reject);
    },
  };

  return builder;
}

vi.mock('../lib/supabase', () => {
  const client = {
    from: (table: string) => createQueryBuilder(table),
  };

  return {
    supabase: client,
    adminSupabase: client,
    createPublicClient: vi.fn(() => client),
    default: client,
  };
});

function createMockRequest(overrides: Partial<Request> = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    method: 'GET',
    originalUrl: '/test',
    url: '/test',
    ...overrides,
  } as Request;
}

function createMockResponse() {
  return {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload?: unknown) {
      this.body = payload ?? null;
      return this;
    },
  } as Response & { statusCode: number; body: unknown };
}

async function runController(
  handler: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
  req: Request
) {
  const res = createMockResponse();
  const next = vi.fn();

  await handler(req, res, next as NextFunction);

  return { res, next };
}

describe('admin settings workspaces', () => {
  beforeEach(() => {
    supabaseState.tables = {
      system_overview: [
        {
          cpu_usage: 23,
          memory_usage: 41,
          total_users: 128,
          total_units: 84,
        },
      ],
      system_activities: [
        {
          id: 'activity-1',
          created_at: '2026-03-16T09:00:00.000Z',
          action: 'Deployed backend release',
          user_info: 'Ops Admin',
          activity_type: 'system',
          icon: 'ri:settings-line',
        },
      ],
      system_alerts: [
        {
          id: 'alert-1',
          is_active: true,
          created_at: '2026-03-16T09:30:00.000Z',
          alert_type: 'warning',
          message: 'Storage usage is above 80%',
          time_ago: '5m ago',
        },
      ],
      system_performance: [
        {
          id: 'performance-1',
          created_at: '2026-03-01T00:00:00.000Z',
          month: 'Mar',
          users: 100,
          complaints: 12,
          satisfaction: 92,
        },
      ],
      system_components: [
        {
          id: 'component-1',
          component_label: 'API',
          component_status: 'operational',
        },
      ],
      preference_categories: [
        { id: 'cat-1', name: 'Notifications' },
        { id: 'cat-2', name: 'Privacy' },
      ],
      profiles: [{ id: 'profile-1' }, { id: 'profile-2' }, { id: 'profile-3' }],
      preference_settings_with_stats: [
        {
          id: 'pref-1',
          category_id: 'cat-1',
          key: 'email_updates',
          name: 'Email Updates',
          description: 'Receive updates by email',
          type: 'boolean',
          default_value: true,
          options: null,
          validation: null,
          is_user_editable: true,
          is_system_setting: false,
          created_at: '2026-03-10T08:00:00.000Z',
          updated_at: '2026-03-10T08:00:00.000Z',
          affected_users: 2,
        },
        {
          id: 'pref-2',
          category_id: 'cat-2',
          key: 'profile_visibility',
          name: 'Profile Visibility',
          description: 'Visibility level',
          type: 'select',
          default_value: 'community',
          options: ['community', 'private'],
          validation: null,
          is_user_editable: false,
          is_system_setting: true,
          created_at: '2026-03-11T08:00:00.000Z',
          updated_at: '2026-03-11T08:00:00.000Z',
          affected_users: 1,
        },
      ],
    };
  });

  it('returns the combined system overview workspace payload', async () => {
    const { res, next } = await runController(getSettingsSystemOverview, createMockRequest());

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      data: {
        metrics: { cpu_usage: 23, memory_usage: 41, total_users: 128, total_units: 84 },
      },
    });
    expect((res.body as any).data.activities).toHaveLength(1);
    expect((res.body as any).data.alerts).toHaveLength(1);
    expect((res.body as any).data.performance).toHaveLength(1);
    expect((res.body as any).data.components).toHaveLength(1);
  });

  it('computes preference stats from live categories, settings, and profile counts', async () => {
    const { res, next } = await runController(getSettingsPreferenceStats, createMockRequest());

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: {
        total: 2,
        userEditable: 1,
        systemSettings: 1,
        totalUsers: 3,
        byCategory: {
          'cat-1': 1,
          'cat-2': 1,
        },
        categoriesMap: {
          'cat-1': 'Notifications',
          'cat-2': 'Privacy',
        },
        byType: {
          boolean: 1,
          select: 1,
        },
      },
    });
  });
});
