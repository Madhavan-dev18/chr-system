import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createTRPCContext } from '@/server/trpc/context';
import { env } from '@/lib/env';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError({ error, path }) {
      if (env.NODE_ENV === 'development') {
        console.error(`[tRPC] /${path}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
