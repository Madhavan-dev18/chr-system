import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['@chr/db'],
  // --- Security Headers ---
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://*.supabase.co https://*.upstash.io https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Prevent accidental exposure of server-side env vars
  typedRoutes: false,

  // Production-safe logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Output standalone for containerized deployments
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
};

export default nextConfig;
