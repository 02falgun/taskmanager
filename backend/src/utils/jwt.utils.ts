import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  tokenId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Sign a JWT access token
 */
export const signAccessToken = (payload: Omit<TokenPayload, keyof JwtPayload>): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: 'tms-api',
    audience: 'tms-client',
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

/**
 * Sign a JWT refresh token
 */
export const signRefreshToken = (payload: Omit<TokenPayload, keyof JwtPayload>): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: 'tms-api',
    audience: 'tms-client',
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'tms-api',
    audience: 'tms-client',
  }) as TokenPayload;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'tms-api',
    audience: 'tms-client',
  }) as TokenPayload;
};

/**
 * Generate access + refresh token pair
 */
export const generateTokenPair = (userId: string, email: string): TokenPair => {
  const payload = { userId, email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, tokenId: crypto.randomUUID() }),
  };
};

/**
 * Get refresh token expiry date
 */
export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''));
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Hash refresh token before storing in database
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
