/**
 * Liveness/health check endpoints.
 */
import { Request, Response, Router } from 'express';

export const healthRouter = Router();

export const healthHandler = (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
};

healthRouter.get('/', healthHandler);
