import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

/**
 * JWT Authentication Middleware
 * Validates the Bearer token from Authorization header and attaches user to request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const token = cookieToken ?? headerToken;

  if (!token) {
    sendError(res, 'Authorization token is required', 401);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        sendError(res, 'Access token has expired', 401, 'TOKEN_EXPIRED');
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        sendError(res, 'Invalid access token', 401, 'TOKEN_INVALID');
        return;
      }
    }
    sendError(res, 'Authentication failed', 401);
  }
};
