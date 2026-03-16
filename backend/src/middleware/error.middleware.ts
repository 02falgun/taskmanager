import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/auth.service';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

/**
 * Global Error Handler Middleware
 * Catches all errors thrown in request handlers and returns standardized responses
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] ${req.method} ${req.path}:`, error);

  const response: ErrorResponse = {
    success: false,
    message: 'An unexpected error occurred',
  };

  // Known application errors
  if (error instanceof AppError) {
    response.message = error.message;
    if (env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }
    res.status(error.statusCode).json(response);
    return;
  }

  // Prisma known errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const field = prismaError.meta?.target?.[0] ?? 'field';
      response.message = `A record with this ${field} already exists`;
      res.status(409).json(response);
      return;
    }

    if (prismaError.code === 'P2025') {
      // Record not found
      response.message = 'Resource not found';
      res.status(404).json(response);
      return;
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    response.message = 'Authentication failed';
    res.status(401).json(response);
    return;
  }

  // Validation errors from express-validator
  if (error.name === 'ValidationError') {
    response.message = error.message;
    res.status(400).json(response);
    return;
  }

  // Generic server error
  if (env.NODE_ENV === 'development') {
    response.error = error.message;
    response.stack = error.stack;
  }

  res.status(500).json(response);
};

/**
 * 404 Not Found Middleware
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
