import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Role } from '@chr/db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      clinicId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    clinicId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    clinicId: string | null;
  }
}
