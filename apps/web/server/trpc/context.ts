import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { uuidv7 } from 'uuidv7';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  
  // Basic request info for auditing
  const ip = opts.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = opts.headers.get('user-agent') || 'unknown';
  const requestId = uuidv7();

  return {
    session,
    prisma,
    redis,
    ip,
    userAgent,
    requestId,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
