import NextAuth from 'next-auth';
import { authConfig } from './lib/auth.config';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Note: Ensure Redis URL and Token are available in Edge Env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '10 s'), // 100 requests per 10 seconds per IP
  analytics: true,
});

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  // Protect all dashboard routes
  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/nurse') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/lab');

  // API Rate Limiting
  if (pathname.startsWith('/api')) {
    // Get IP from request headers or default to anonymous
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';

    const { success } = await rateLimit.limit(`ratelimit_api_${ip}`);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // If not logged in and trying to access a protected route
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  // Role-based access control
  if (isLoggedIn) {
    // 1. Admin restricted routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }

    // 2. Doctor restricted routes
    if (pathname.startsWith('/doctor') && role !== 'DOCTOR') {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }

    // 3. Nurse restricted routes
    if (pathname.startsWith('/nurse') && role !== 'NURSE') {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }

    // 4. Patient restricted routes
    if (pathname.startsWith('/patient') && role !== 'PATIENT') {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }

    // 5. Receptionist restricted routes
    if (pathname.startsWith('/receptionist') && role !== 'RECEPTIONIST') {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }

    // 6. Lab Tech restricted routes
    if (pathname.startsWith('/lab') && role !== 'LAB_TECH') {
      return Response.redirect(new URL('/unauthorized', nextUrl));
    }

    // If logged in and hitting the root or login page, redirect to their specific dashboard
    if (pathname === '/' || pathname === '/login') {
      switch (role) {
        case 'ADMIN': return Response.redirect(new URL('/admin', nextUrl));
        case 'DOCTOR': return Response.redirect(new URL('/doctor', nextUrl));
        case 'NURSE': return Response.redirect(new URL('/nurse', nextUrl));
        case 'PATIENT': return Response.redirect(new URL('/patient', nextUrl));
        case 'RECEPTIONIST': return Response.redirect(new URL('/receptionist', nextUrl));
        case 'LAB_TECH': return Response.redirect(new URL('/lab', nextUrl));
        default: return Response.redirect(new URL('/unauthorized', nextUrl));
      }
    }
  }

  return; // Let the request proceed
});

// Optionally, configure the matcher to optimize performance
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
