import { describe, expect, it } from 'vitest';
import { schemas } from '../validation/schemas';

const COMMUNITY_ID = '11111111-1111-1111-1111-111111111111';

describe('Bulk validation contracts', () => {
  it('accepts the typed bulk admin payloads now in use', () => {
    const cases = [
      schemas.adminBulkUpdateUsers.safeParse({
        userIds: ['user-1'],
        updates: {
          first_name: 'Ada',
          is_active: false,
        },
      }),
      schemas.adminBulkUpdateMaintenance.safeParse({
        requestIds: ['request-1'],
        updates: {
          status: 'completed',
          notes: 'Closed after inspection',
        },
      }),
      schemas.adminBulkUpdateComplaints.safeParse({
        complaintIds: ['complaint-1'],
        updates: {
          priority: 'high',
          resolution: 'Resolved by site team',
        },
      }),
      schemas.adminBulkUpdatePayments.safeParse({
        paymentIds: ['payment-1'],
        updates: {
          amount: 42,
          status: 'completed',
          payment_method: 'cash',
        },
      }),
      schemas.adminBulkCreateNotices.safeParse({
        notices: [
          {
            community_id: COMMUNITY_ID,
            title: 'Water shutdown',
            body: 'Water will be unavailable from 10:00 to 12:00.',
            status: 'published',
          },
        ],
      }),
    ];

    for (const result of cases) {
      expect(result.success).toBe(true);
    }
  });

  it('rejects unknown-only bulk update payloads', () => {
    const cases = [
      schemas.adminBulkUpdateUsers.safeParse({
        userIds: ['user-1'],
        updates: { rogue: true },
      }),
      schemas.adminBulkUpdateMaintenance.safeParse({
        requestIds: ['request-1'],
        updates: { rogue: true },
      }),
      schemas.adminBulkUpdateComplaints.safeParse({
        complaintIds: ['complaint-1'],
        updates: { rogue: true },
      }),
      schemas.adminBulkUpdatePayments.safeParse({
        paymentIds: ['payment-1'],
        updates: { rogue: true },
      }),
    ];

    for (const result of cases) {
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors.updates).toContain('At least one field is required');
      }
    }
  });

  it('strips unknown keys from otherwise valid bulk payment updates', () => {
    const result = schemas.adminBulkUpdatePayments.safeParse({
      paymentIds: ['payment-1'],
      updates: {
        status: 'completed',
        rogue: true,
      },
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.updates).toEqual({
        status: 'completed',
      });
    }
  });

  it('rejects arbitrary notice objects that do not match the notice contract', () => {
    const result = schemas.adminBulkCreateNotices.safeParse({
      notices: [
        {
          rogue: true,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
