'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  
  // Keep track of credentials if we move to MFA step
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const mfaToken = formData.get('mfaToken') as string | null;
    
    let email = credentials.email;
    let password = credentials.password;

    if (!mfaRequired) {
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      setCredentials({ email, password });
    }

    try {
      const payload: any = {
        email,
        password,
        redirect: false,
      };

      if (mfaRequired && mfaToken) {
        payload.mfaToken = mfaToken;
      }

      const res: any = await signIn('credentials', payload);

      if (res?.error) {
        if (res.error === 'rate_limit_exceeded') {
          setError('Too many attempts. Please try again in 15 minutes.');
        } else if (res.error === 'account_locked') {
          setError('Account locked due to multiple failed login attempts. Please wait 15 minutes.');
        } else if (res.error === 'mfa_required') {
          setMfaRequired(true);
        } else if (res.error === 'invalid_mfa_token') {
          setError('Invalid authentication code.');
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
        <h1 className="text-2xl font-bold font-sans text-foreground">
          {mfaRequired ? 'Two-Factor Auth' : 'Sign In'}
        </h1>
        <p className="text-sm text-muted mt-2 font-mono">CHR-System Authentication</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!mfaRequired ? (
          <>
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
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2 font-mono text-muted" htmlFor="mfaToken">
              Authentication Code
            </label>
            <input
              id="mfaToken"
              name="mfaToken"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              required
              className="neu-input w-full text-center tracking-widest text-lg font-mono"
              placeholder="000000"
              maxLength={6}
            />
            <button 
              type="button" 
              className="text-sm text-accent mt-4 underline block mx-auto font-medium"
              onClick={() => { setMfaRequired(false); setError(''); }}
            >
              Cancel
            </button>
          </div>
        )}

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
          {isPending 
            ? 'Authenticating...' 
            : mfaRequired 
              ? 'Verify Code' 
              : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
