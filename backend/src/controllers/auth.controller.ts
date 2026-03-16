import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response.utils';
import { LoginBody, RegisterBody, RefreshBody } from '../types/auth.types';
import { userRepository } from '../repositories/user.repository';
import { env } from '../config/env';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
};

/**
 * Auth Controller — handles authentication endpoints
 */
export class AuthController {
  /**
   * POST /auth/register
   * Register a new user account
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as RegisterBody;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.register(body, ipAddress, userAgent);
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      sendCreated(res, result, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Authenticate user and return tokens
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as LoginBody;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(body, ipAddress, userAgent);
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken: bodyToken } = req.body as RefreshBody;
      const cookieToken = req.cookies?.refreshToken as string | undefined;
      const refreshToken = cookieToken ?? bodyToken;

      if (!refreshToken) {
        sendError(res, 'Refresh token is required', 401);
        return;
      }

      const tokens = await authService.refresh(refreshToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      sendSuccess(res, { tokens }, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   * Revoke the current refresh token
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken: bodyToken } = req.body as RefreshBody;
      const cookieToken = req.cookies?.refreshToken as string | undefined;
      const refreshToken = cookieToken ?? bodyToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      clearAuthCookies(res);

      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout-all
   * Revoke all refresh tokens (logout from all devices)
   */
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await authService.logoutAll(userId);
      clearAuthCookies(res);

      sendSuccess(res, null, 'Logged out from all devices successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Get the current authenticated user profile
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await userRepository.findById(userId);

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, { user }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
