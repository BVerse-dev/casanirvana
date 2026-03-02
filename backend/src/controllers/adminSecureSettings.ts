import { Request, Response, NextFunction } from 'express';
import {
  getAdminIntegrationSettings,
  getAdminPushSettings,
  getAdminSmsSettings,
  getAdminSmtpSettings,
  saveAdminIntegrationSettings,
  saveAdminPushSettings,
  saveAdminSmsSettings,
  saveAdminSmtpSettings,
  testAdminIntegrationSetting,
  testAdminPushSettings,
  testAdminSmsSettings,
  testAdminSmtpSettings,
} from '../services/adminSecureSettings';

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
    const { service, value } = req.body || {};
    const result = await testAdminIntegrationSetting(service, value);
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
