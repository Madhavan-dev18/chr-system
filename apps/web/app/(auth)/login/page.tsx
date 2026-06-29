'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard');
    }
  }, [state?.success, router]);

  return (
    <div className="neu-card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-sans text-foreground">Sign In</h1>
        <p className="text-sm text-muted mt-2 font-mono">CHR-System Authentication</p>
      </div>

      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 font-mono text-muted" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="neu-input w-full"
            placeholder="doctor@clinic.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 font-mono text-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="neu-input w-full"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <div className="p-3 bg-red/10 text-red border border-red/20 rounded-lg text-sm text-center">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="neu-btn neu-btn-primary w-full py-3"
        >
          {isPending ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
