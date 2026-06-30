import type { NextAuthConfig } from 'next-auth';
import { Role } from '@chr/db';

export const authConfig = {
  providers: [],
  session: { strategy: 'jwt', maxAge: 15 * 60 },
  pages: { signIn: '/login' },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
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
        token.id = user.id;
        token.role = user.role;
        token.clinicId = user.clinicId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.clinicId = token.clinicId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
