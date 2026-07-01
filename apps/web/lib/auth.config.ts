import type { NextAuthConfig } from 'next-auth';
import { Role } from '@chr/db';

export const authConfig: NextAuthConfig = {
  providers: [], // Providers added in auth.ts (can't import bcrypt in edge)
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 hours — short session for healthcare compliance
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-auth.session-token'
          : 'auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Persist role + clinicId into the JWT on sign-in
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
        token.clinicId = (user as { clinicId?: string | null }).clinicId ?? null;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.clinicId = (token.clinicId as string | null) ?? null;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
