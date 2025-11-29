/**
 * Centralized HTTP error handling middleware.
 */
import { NextFunction, Request, Response } from 'express';

type ErrorWithStatus = {
  status?: number;
  message?: string;
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Resource not found' });
};

export const errorHandler = (
  err: ErrorWithStatus | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCandidate = (err as ErrorWithStatus).status;
  const status =
    typeof statusCandidate === 'number' && Number.isInteger(statusCandidate) && statusCandidate > 0
      ? statusCandidate
      : 500;

  const messageCandidate = (err as ErrorWithStatus).message;
  const message =
    status === 500 || typeof messageCandidate !== 'string'
      ? 'Internal server error'
      : messageCandidate || 'Unexpected error';

  if (status === 500) {
    // Log the detailed error server-side without exposing internals to clients.
    console.error(err);
  }

  res.status(status).json({ message });
};
