import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { auditLog } from './audit';
import { checkRateLimit } from './rate-limit';

class RateLimitError extends CredentialsSignin {
  code = 'rate_limit_exceeded';
}

class AccountLockedError extends CredentialsSignin {
  code = 'account_locked';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || typeof credentials.email !== 'string') return null;
        if (!credentials?.password || typeof credentials.password !== 'string') return null;

        const email = credentials.email.toLowerCase();

        // 1. Rate Limit Check (Redis)
        const rateLimit = await checkRateLimit(email);
        if (rateLimit.limited) {
          throw new RateLimitError();
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

        // 5. Success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLogins: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // The audit log for successful LOGIN will be recorded in the route handler or tRPC procedure
        // when the refresh token is also provisioned, to keep it cohesive.

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          clinicId: user.clinicId,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes (short-lived access token)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.clinicId = user.clinicId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.clinicId = token.clinicId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-auth.session-token' : 'auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
