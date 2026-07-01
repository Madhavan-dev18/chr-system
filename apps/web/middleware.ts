import NextAuth from 'next-auth';
import { authConfig } from './lib/auth.config';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── Edge-safe Redis + rate limiter ───────────────────────────────
const hasUpstashConfig =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('[id]') &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('dummy');

const redis = hasUpstashConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, '10 s'),
      analytics: true,
      prefix: 'chr:api:global',
    })
  : null;

// ── Auth handler from edge-safe config ───────────────────────────
const { auth } = NextAuth(authConfig);

// ── Role-to-prefix map for fast RBAC ─────────────────────────────
const ROLE_PREFIX: Record<string, string> = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  NURSE: '/nurse',
  PATIENT: '/patient',
  RECEPTIONIST: '/receptionist',
  LAB_TECH: '/lab',
};

const DASHBOARD_PREFIXES = Object.values(ROLE_PREFIX);

function isDashboardPath(path: string): boolean {
  return DASHBOARD_PREFIXES.some((p) => path.startsWith(p));
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  // ── 1. Global API rate limiting ────────────────────────────────
  if (pathname.startsWith('/api/') && apiRateLimit) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'anon';

    const { success } = await apiRateLimit.limit(ip);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Too many requests', retryAfter: 10 }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '10',
          },
        }
      );
    }
  }

  // ── 2. Redirect logged-in users away from auth pages ──────────
  if (isLoggedIn && (pathname === '/' || pathname === '/login')) {
    const dest = role ? (ROLE_PREFIX[role] ?? '/unauthorized') : '/unauthorized';
    // Doctors → /doctor/patients (more useful than /doctor)
    const resolved =
      role === 'DOCTOR' ? '/doctor/patients'
      : role === 'RECEPTIONIST' ? '/receptionist/patients'
      : role === 'NURSE' ? '/nurse/patients'
      : role === 'LAB_TECH' ? '/lab/orders'
      : role === 'ADMIN' ? '/admin'
      : dest;
    return Response.redirect(new URL(resolved, nextUrl));
  }

  // ── 3. Protect dashboard routes ────────────────────────────────
  if (isDashboardPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  // ── 4. Role-based access control ──────────────────────────────
  if (isLoggedIn && role && isDashboardPath(pathname)) {
    const allowedPrefix = ROLE_PREFIX[role];
    if (!pathname.startsWith(allowedPrefix)) {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // Pass through
  return;
});

export const config = {
  matcher: [
    // Match all paths except Next.js static assets and browser internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
