import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { auditLog } from './audit';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from './rate-limit';
import { authConfig } from './auth.config';
import { logger } from './logger';

class RateLimitError extends CredentialsSignin {
  code = 'rate_limit_exceeded';
}

class AccountLockedError extends CredentialsSignin {
  code = 'account_locked';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        mfaToken: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || typeof credentials.email !== 'string') return null;
        if (!credentials?.password || typeof credentials.password !== 'string') return null;

        const email = credentials.email.toLowerCase();

        // 1. Rate Limit Check (Redis) — fail open if Redis is unavailable
        try {
          const rateLimit = await checkRateLimit(email);
          if (rateLimit.limited) {
            throw new RateLimitError();
          }
        } catch (error) {
          // Re-throw known auth errors (rate limit), degrade gracefully on Redis failures
          if (error instanceof RateLimitError) throw error;
          logger.error({ err: error, email }, 'Redis rate-limit check failed — proceeding without rate limiting');
        }

        // 2. Find user
        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
        });

        if (!user) {
          await auditLog(prisma, {
            action: 'LOGIN_FAIL',
            resource: 'Auth',
            metadata: { email, reason: 'user_not_found' },
          });
          return null; // NextAuth handles this by returning 401
        }

        // 3. Lockout Check
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new AccountLockedError();
        }

        // 4. Verify password
        const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!passwordMatch) {
          // Increment failed logins
          const failedLogins = user.failedLogins + 1;
          const lockedUntil = failedLogins >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLogins, lockedUntil },
          });

          // Redis rate-limit increment — fail open
          try {
            await incrementRateLimit(email);
          } catch (error) {
            logger.error({ err: error, email }, 'Redis rate-limit increment failed — skipping');
          }

          await auditLog(prisma, {
            userId: user.id,
            clinicId: user.clinicId,
            action: 'LOGIN_FAIL',
            resource: 'Auth',
            metadata: { email, reason: 'invalid_password', failedLogins },
          });

          if (lockedUntil) {
             throw new AccountLockedError();
          }

          return null;
        }

        // 5. MFA Check
        if (user.mfaEnabled) {
          if (!credentials?.mfaToken || typeof credentials.mfaToken !== 'string') {
            // NextAuth doesn't natively support multi-step in standard credentials without a workaround.
            // Returning a specific error allows the frontend to show the MFA input.
            throw new CredentialsSignin('mfa_required');
          }

          const { authenticator } = require('otplib');
          const { decryptMfaSecret } = await import('./crypto');

          if (!user.mfaSecret) {
            throw new CredentialsSignin('mfa_configuration_error');
          }

          const secretBlob = user.mfaSecret;
          const iv = Buffer.from(secretBlob.subarray(0, 12));
          const authTag = Buffer.from(secretBlob.subarray(12, 28));
          const ciphertext = Buffer.from(secretBlob.subarray(28));

          const secret = decryptMfaSecret(ciphertext, iv, authTag);
          const isValid = authenticator.verify({ token: credentials.mfaToken, secret });

          if (!isValid) {
            throw new CredentialsSignin('invalid_mfa_token');
          }
        }

        // 6. Success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // Redis rate-limit reset — fail open
        try {
          await resetRateLimit(email);
        } catch (error) {
          logger.error({ err: error, email }, 'Redis rate-limit reset failed — skipping');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          clinicId: user.clinicId,
        };
      },
    }),
  ],
  // Cookie config is inherited from authConfig (auth.config.ts) via the spread.
  // Do NOT add a cookies override here — middleware and this instance must agree
  // on the cookie name, and authConfig is the single source of truth.
});
