import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { hashPassword, comparePassword } from '../utils/hash.utils';
import {
  generateTokenPair,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from '../utils/jwt.utils';
import { AuthResponse, AuthUser, RegisterBody, LoginBody } from '../types/auth.types';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Service layer for authentication logic
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(
    data: RegisterBody,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    // Check if email already exists
    const emailExists = await userRepository.emailExists(data.email);
    if (emailExists) {
      throw new AppError('Email address is already in use', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const tokens = await this.issueTokenPair(user.id, user.email, ipAddress, userAgent);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login an existing user
   */
  async login(
    data: LoginBody,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    // Find user with password
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      // Use same error message to prevent user enumeration
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const passwordMatch = await comparePassword(data.password, user.password);
    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = await this.issueTokenPair(user.id, user.email, ipAddress, userAgent);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify the JWT signature
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Check if token exists in DB and is not revoked
    const storedToken = await refreshTokenRepository.findValid(refreshTokenHash);
    if (!storedToken) {
      throw new AppError('Refresh token has been revoked or expired', 401);
    }

    // Rotate refresh token (revoke old, issue new)
    await refreshTokenRepository.revoke(refreshTokenHash);

    const newTokens = await this.issueTokenPair(payload.userId, payload.email);

    return newTokens;
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt++) {
      const tokens = generateTokenPair(userId, email);
      const refreshTokenHash = hashRefreshToken(tokens.refreshToken);

      try {
        await refreshTokenRepository.create({
          tokenHash: refreshTokenHash,
          userId,
          expiresAt: getRefreshTokenExpiry(),
          ipAddress,
          userAgent,
        });

        return tokens;
      } catch (error) {
        lastError = error;
        const code = (error as { code?: string }).code;
        if (code !== 'P2002') {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Logout user by revoking their refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    await refreshTokenRepository.revoke(refreshTokenHash);
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await refreshTokenRepository.revokeAllForUser(userId);
  }

  /**
   * Sanitize user object (remove password)
   */
  private sanitizeUser(user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    createdAt: Date;
    updatedAt?: Date;
  }): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
