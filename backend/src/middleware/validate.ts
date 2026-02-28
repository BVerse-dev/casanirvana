import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

type RequestSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const replaceMutableObject = (target: Record<string, unknown>, parsed: Record<string, unknown>) => {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, parsed);
};

export const validateRequest =
  (schemas: RequestSchemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        if (isRecord(req.params) && isRecord(parsedParams)) {
          replaceMutableObject(req.params as Record<string, unknown>, parsedParams);
        } else {
          req.params = parsedParams;
        }
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        if (isRecord(req.query) && isRecord(parsedQuery)) {
          replaceMutableObject(req.query as Record<string, unknown>, parsedQuery);
        }
      }
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body);
        if (isRecord(req.body) && isRecord(parsedBody)) {
          replaceMutableObject(req.body as Record<string, unknown>, parsedBody);
        } else {
          req.body = parsedBody;
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next({
          statusCode: 400,
          message: 'Validation failed',
          details: err.flatten(),
        });
      }
      next(err);
    }
  };
