import crypto from 'node:crypto';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const SETTINGS_ASSET_CONFIG = {
  splash: {
    bucket: 'splash-images',
    prefix: 'settings/splash',
  },
  onboarding: {
    bucket: 'splash-images',
    prefix: 'settings/onboarding',
  },
} as const;

type SettingsAssetType = keyof typeof SETTINGS_ASSET_CONFIG;

const getAssetTypeConfig = (assetType: unknown) => {
  if (typeof assetType !== 'string') {
    return null;
  }

  return SETTINGS_ASSET_CONFIG[assetType as SettingsAssetType] ?? null;
};

const buildObjectPath = (assetType: SettingsAssetType, originalName: string) => {
  const extension = path.extname(originalName || '').toLowerCase();
  const safeExtension = extension || '.bin';
  return `${SETTINGS_ASSET_CONFIG[assetType].prefix}/${crypto.randomUUID()}${safeExtension}`;
};

export async function uploadSettingsAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const assetType = req.params.assetType as SettingsAssetType;
    const config = getAssetTypeConfig(assetType);

    if (!config) {
      return next(createHttpError(400, 'SETTINGS_ASSET_TYPE_INVALID', 'Invalid settings asset type'));
    }

    if (!req.file) {
      return next(createHttpError(400, 'SETTINGS_ASSET_FILE_REQUIRED', 'No file uploaded'));
    }

    if (!IMAGE_MIME_TYPES.has(req.file.mimetype)) {
      return next(createHttpError(400, 'SETTINGS_ASSET_FILE_TYPE_INVALID', 'Unsupported image type'));
    }

    const objectPath = buildObjectPath(assetType, req.file.originalname);
    const { data, error } = await supabase.storage.from(config.bucket).upload(objectPath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    });

    if (error) {
      return next(
        createHttpError(500, 'SETTINGS_ASSET_UPLOAD_FAILED', 'Failed to upload settings asset', error)
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(config.bucket).getPublicUrl(data.path);

    return res.status(201).json({
      data: {
        assetType,
        bucket: config.bucket,
        path: data.path,
        url: publicUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSettingsAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const assetType = req.params.assetType as SettingsAssetType;
    const config = getAssetTypeConfig(assetType);
    const pathToDelete = typeof req.body?.path === 'string' ? req.body.path.trim() : '';

    if (!config) {
      return next(createHttpError(400, 'SETTINGS_ASSET_TYPE_INVALID', 'Invalid settings asset type'));
    }

    if (!pathToDelete) {
      return next(createHttpError(400, 'SETTINGS_ASSET_PATH_REQUIRED', 'Asset path is required'));
    }

    if (!pathToDelete.startsWith(`${config.prefix}/`)) {
      return next(
        createHttpError(400, 'SETTINGS_ASSET_PATH_INVALID', 'Asset path does not belong to the selected settings area')
      );
    }

    const { error } = await supabase.storage.from(config.bucket).remove([pathToDelete]);

    if (error) {
      return next(
        createHttpError(500, 'SETTINGS_ASSET_DELETE_FAILED', 'Failed to delete settings asset', error)
      );
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
