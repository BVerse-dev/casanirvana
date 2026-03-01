import { Request, Response } from 'express';
import * as PaymentService from '../services/payment';
import { getClientPaymentMethodPolicy } from '../services/paymentMethodPolicy';
import {
  DEFAULT_PAYMENT_DISPLAY,
  generatePaymentStatementForUnit,
  getAdminPaymentTransaction,
  listAdminPaymentObligations,
  listAdminPaymentStatements,
  listAdminPaymentTransactions,
  listPaymentHistoryForUnit,
  listPaymentObligationsForUnit,
  listPaymentStatementsForUnit,
} from '../services/paymentLedger';

/**
 * Get payments by unit ID with filtering and pagination
 */
export async function getPaymentsByUnit(req: Request, res: Response) {
  try {
    const unitId = req.params.unitId || req.query.unitId as string;

    if (!unitId) {
      return res.status(400).json({ error: 'Unit ID is required' });
    }

    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: req.query.sortBy as string || 'payment_date',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const result = await PaymentService.getPaymentsByUnit(unitId, options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get payments by society ID with filtering and pagination
 */
export async function getPaymentsBySociety(req: Request, res: Response) {
  try {
    const societyId = req.params.societyId || req.query.societyId as string;

    if (!societyId) {
      return res.status(400).json({ error: 'Society ID is required' });
    }

    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: req.query.sortBy as string || 'payment_date',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      status: req.query.status as string,
      paymentType: req.query.paymentType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      unitId: req.query.unitId as string
    };

    const result = await PaymentService.getPaymentsBySociety(societyId, options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await PaymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new payment
 */
export async function createPayment(req: Request, res: Response) {
  try {
    const payment = await PaymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update a payment
 */
export async function updatePayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const payment = await PaymentService.updatePayment(id, req.body);
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id; // Assuming you have user info in the request

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const payment = await PaymentService.updatePaymentStatus(id, status, userId, notes);
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await PaymentService.deletePayment(id);
    res.json({ id, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(req: Request, res: Response) {
  try {
    const societyId = req.params.societyId || req.query.societyId as string;
    const timeFrame = (req.query.timeFrame as 'week' | 'month' | 'year') || 'month';

    const stats = await PaymentService.getPaymentStats(societyId, timeFrame);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get sanitized payment method policy for authenticated clients.
 */
export async function getPaymentMethodPolicy(req: Request, res: Response) {
  try {
    const policy = await getClientPaymentMethodPolicy();
    res.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment policy',
    });
  }
}

const getProfileUnitId = (req: Request) => {
  const profile = (req.userProfile || {}) as Record<string, unknown>;
  return typeof profile.unit_id === 'string' ? profile.unit_id : null;
};

export async function getPaymentObligations(req: Request, res: Response) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Your profile is missing a unit assignment.',
      });
    }

    const obligations = await listPaymentObligationsForUnit(unitId);
    res.json({
      success: true,
      data: {
        unit_id: unitId,
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: obligations,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment obligations',
    });
  }
}

export async function getPaymentHistoryFeed(req: Request, res: Response) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Your profile is missing a unit assignment.',
      });
    }

    const history = await listPaymentHistoryForUnit(unitId);
    res.json({
      success: true,
      data: {
        unit_id: unitId,
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: history,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment history',
    });
  }
}

export async function getPaymentStatementsFeed(req: Request, res: Response) {
  try {
    const unitId = getProfileUnitId(req);

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Your profile is missing a unit assignment.',
      });
    }

    const statements = await listPaymentStatementsForUnit(unitId);
    res.json({
      success: true,
      data: {
        unit_id: unitId,
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items: statements,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment statements',
    });
  }
}

export async function generatePaymentStatement(req: Request, res: Response) {
  try {
    const profile = (req.userProfile || {}) as Record<string, unknown>;
    const unitId = getProfileUnitId(req);
    const requestedUnitId = typeof req.body?.unit_id === 'string' ? req.body.unit_id : null;
    const targetUnitId =
      typeof profile.role === 'string' && ['admin', 'superadmin', 'agency_manager', 'facility_manager'].includes(profile.role)
        ? requestedUnitId || unitId
        : unitId;

    if (!targetUnitId) {
      return res.status(400).json({
        success: false,
        error: 'A target unit is required to generate a statement.',
      });
    }

    const result = await generatePaymentStatementForUnit({
      unitId: targetUnitId,
      monthYear: typeof req.body?.month_year === 'string' ? req.body.month_year : null,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate payment statement',
    });
  }
}

export async function listAdminTransactions(req: Request, res: Response) {
  try {
    const items = await listAdminPaymentTransactions({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      sourceType: typeof req.query.source_type === 'string' ? req.query.source_type : undefined,
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment transactions',
    });
  }
}

export async function getAdminTransaction(req: Request, res: Response) {
  try {
    const transaction = await getAdminPaymentTransaction(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Payment transaction not found.',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment transaction',
    });
  }
}

export async function listAdminObligations(req: Request, res: Response) {
  try {
    const items = await listAdminPaymentObligations({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment obligations',
    });
  }
}

export async function listAdminStatements(req: Request, res: Response) {
  try {
    const items = await listAdminPaymentStatements({
      unitId: typeof req.query.unit_id === 'string' ? req.query.unit_id : undefined,
    });

    res.json({
      success: true,
      data: {
        currency_code: DEFAULT_PAYMENT_DISPLAY.currencyCode,
        currency_symbol: DEFAULT_PAYMENT_DISPLAY.currencySymbol,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load payment statements',
    });
  }
}
