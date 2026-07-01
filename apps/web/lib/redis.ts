import { Redis } from '@upstash/redis';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createRedisClient(): Redis {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 8000),
    },
  });
}

export const redis: Redis =
  global.__redis ?? createRedisClient();

if (env.NODE_ENV !== 'production') {
  global.__redis = redis;
}
