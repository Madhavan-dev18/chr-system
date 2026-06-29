'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === 'rate_limit_exceeded') {
          setError('Too many attempts. Please try again in 15 minutes.');
        } else if (res.error === 'account_locked') {
          setError('Account locked due to multiple failed login attempts. Please wait 15 minutes.');
        } else {
          setError('Invalid email or password.');
        }
        setIsPending(false);
      } else if (res?.ok) {
        // Hard redirect to root triggers the server middleware to route to correct dashboard
        window.location.href = '/'; 
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsPending(false);
    }
  }

  return (
    <div className="neu-card">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-sans text-foreground">Sign In</h1>
        <p className="text-sm text-muted mt-2 font-mono">CHR-System Authentication</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {error && (
          <div className="p-3 bg-red/10 text-red border border-red/20 rounded-lg text-sm text-center">
            {error}
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
