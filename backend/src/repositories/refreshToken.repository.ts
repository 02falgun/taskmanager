import { prisma } from '../config/database';
import { RefreshToken, Prisma } from '@prisma/client';

/**
 * Repository for refresh token database operations
 */
export class RefreshTokenRepository {
  /**
   * Create a new refresh token
   */
  async create(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        token: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  }

  /**
   * Find a valid (non-revoked, non-expired) refresh token
   */
  async findValid(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: {
        token: tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Revoke a single token
   */
  async revoke(tokenHash: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all tokens for a user (logout from all devices)
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Clean up expired tokens (maintenance task)
   */
  async deleteExpired(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    return result.count;
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
