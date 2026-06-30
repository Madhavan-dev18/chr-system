import { auth } from '@/lib/auth';
import { uuidv7 } from 'uuidv7';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  
  // Basic request info for auditing
  const ip = opts.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = opts.headers.get('user-agent') || 'unknown';
  const requestId = uuidv7();

  return {
    session,
    ip,
    userAgent,
    requestId,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
