import pino from 'pino';
import { env } from './env';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  redact: [
    'password',
    'passwordHash',
    'mfaSecret',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'req.headers.authorization',
    'req.headers.cookie'
  ],
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});
