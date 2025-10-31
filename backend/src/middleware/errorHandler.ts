import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/response';

/**
 * Error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send error response
  const response: ApiResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.stack,
      }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(404).json(response);
}
