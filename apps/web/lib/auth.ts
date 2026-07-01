import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { auditLog } from './audit';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from './rate-limit';
import { authConfig } from './auth.config';
import { getLogger } from './logger';

const log = getLogger('auth');

// ── Custom error classes ─────────────────────────────────────────

class RateLimitError extends CredentialsSignin {
  code = 'rate_limit_exceeded' as const;
}
class AccountLockedError extends CredentialsSignin {
  code = 'account_locked' as const;
}
class MFARequiredError extends CredentialsSignin {
  code = 'mfa_required' as const;
}
class InvalidMFAError extends CredentialsSignin {
  code = 'invalid_mfa_token' as const;
}

// ── NextAuth instance ────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaToken: { label: 'MFA Token', type: 'text' },
      },

      authorize: async (credentials) => {
        if (
          !credentials?.email ||
          typeof credentials.email !== 'string' ||
          !credentials?.password ||
          typeof credentials.password !== 'string'
        ) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        // ── 1. Redis rate-limit (fail-open) ──────────────────────
        try {
          const { limited } = await checkRateLimit(email);
          if (limited) throw new RateLimitError();
        } catch (err) {
          if (err instanceof RateLimitError) throw err;
          log.error({ err, email }, 'Rate-limit check failed — proceeding without limit');
        }

        // ── 2. Lookup user ────────────────────────────────────────
        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
        });

        if (!user) {
          await auditLog(prisma, {
            action: 'LOGIN_FAIL',
            resource: 'Auth',
            metadata: { email, reason: 'user_not_found' },
          });
          return null;
        }

        // ── 3. Account lockout check ──────────────────────────────
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new AccountLockedError();
        }

        // ── 4. Password verification ──────────────────────────────
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) {
          const failedLogins = user.failedLogins + 1;
          const lockedUntil =
            failedLogins >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

          await prisma.user.update({
            where: { id: user.id },
            data: { failedLogins, lockedUntil },
          });

          try {
            await incrementRateLimit(email);
          } catch (err) {
            log.error({ err, email }, 'Rate-limit increment failed — skipping');
          }

          await auditLog(prisma, {
            userId: user.id,
            clinicId: user.clinicId,
            action: 'LOGIN_FAIL',
            resource: 'Auth',
            metadata: { email, reason: 'invalid_password', attempt: failedLogins },
          });

          if (lockedUntil) throw new AccountLockedError();
          return null;
        }

        // ── 5. MFA check ──────────────────────────────────────────
        if (user.mfaEnabled) {
          const mfaToken = credentials.mfaToken;
          if (!mfaToken || typeof mfaToken !== 'string') {
            throw new MFARequiredError();
          }

          if (!user.mfaSecret) throw new InvalidMFAError();

          const { authenticator } = (await import('otplib')) as any;
          const { unpackEncryptedBlob, decryptMfaSecret } = await import('./crypto');
          const { ciphertext, iv, authTag } = unpackEncryptedBlob(
            Buffer.from(user.mfaSecret)
          );
          const secret = decryptMfaSecret(ciphertext, iv, authTag);
          const isValid = authenticator.verify({ token: mfaToken, secret });

          if (!isValid) throw new InvalidMFAError();
        }

        // ── 6. Success ─────────────────────────────────────────────
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        try {
          await resetRateLimit(email);
        } catch (err) {
          log.error({ err, email }, 'Rate-limit reset failed — skipping');
        }

        await auditLog(prisma, {
          userId: user.id,
          clinicId: user.clinicId,
          action: 'LOGIN',
          resource: 'Auth',
          metadata: { email, mfaUsed: user.mfaEnabled },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          clinicId: user.clinicId,
        };
      },
    }),
  ],
});
