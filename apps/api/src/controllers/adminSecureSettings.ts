import { Request, Response, NextFunction } from 'express';
import {
  getAdminBusinessSettings,
  getAdminGeneralSystemSettings,
  getAdminIntegrationSettings,
  getAdminPaymentFeeSettings,
  getAdminPaymentGatewaySettings,
  getAdminPaymentMethodSettings,
  getAdminPushSettings,
  getAdminRegionalSettings,
  getAdminSecurityPrivacySettings,
  getAdminSmsSettings,
  getAdminSmtpSettings,
  saveAdminBusinessSettings,
  saveAdminGeneralSystemSettings,
  saveAdminIntegrationSettings,
  saveAdminPaymentFeeSettings,
  saveAdminPaymentGatewaySettings,
  saveAdminPaymentMethodSettings,
  saveAdminPushSettings,
  saveAdminRegionalSettings,
  saveAdminSecurityPrivacySettings,
  saveAdminSmsSettings,
  saveAdminSmtpSettings,
  testAdminIntegrationSetting,
  testAdminPaymentGatewaySettings,
  testAdminPushSettings,
  testAdminSmsSettings,
  testAdminSmtpSettings,
} from '../services/adminSecureSettings';

export async function getBusinessSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminBusinessSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateBusinessSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminBusinessSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function getRegionalSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminRegionalSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateRegionalSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminRegionalSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function getSecurityPrivacySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminSecurityPrivacySettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSecurityPrivacySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminSecurityPrivacySettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function getGeneralSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminGeneralSystemSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateGeneralSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminGeneralSystemSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function getSmtpSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminSmtpSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSmtpSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminSmtpSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function testSmtpSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await testAdminSmtpSettings(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getIntegrationSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminIntegrationSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateIntegrationSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminIntegrationSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function testIntegrationSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { service, value, settings } = req.body || {};
    const result = await testAdminIntegrationSetting(service, value, settings || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPushSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminPushSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updatePushSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminPushSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function testPushSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await testAdminPushSettings(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSmsSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminSmsSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSmsSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminSmsSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function testSmsSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await testAdminSmsSettings(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPaymentGatewaySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminPaymentGatewaySettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentGatewaySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminPaymentGatewaySettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function testPaymentGatewaySettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { gateway, settings } = req.body || {};
    const result = await testAdminPaymentGatewaySettings(gateway, settings || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPaymentMethodSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminPaymentMethodSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentMethodSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminPaymentMethodSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentFeeSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAdminPaymentFeeSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentFeeSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await saveAdminPaymentFeeSettings(req.body || {}, req.user?.id ?? null);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}
