import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uuidv7 } from 'uuidv7';

export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await auth();

  return {
    session: session ?? null,
    db: prisma,
    ip:
      opts.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      opts.headers.get('x-real-ip') ??
      '127.0.0.1',
    userAgent: opts.headers.get('user-agent') ?? 'unknown',
    requestId: uuidv7(),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
