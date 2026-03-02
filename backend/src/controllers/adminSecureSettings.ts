import { Request, Response, NextFunction } from 'express';
import {
  getAdminIntegrationSettings,
  getAdminSmtpSettings,
  saveAdminIntegrationSettings,
  saveAdminSmtpSettings,
  testAdminIntegrationSetting,
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
