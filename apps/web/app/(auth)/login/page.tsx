'use client';

import { Suspense, useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, Lock, Mail, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string().optional(),
});
type LoginForm = z.infer<typeof loginSchema>;

const ERROR_MAP: Record<string, string> = {
  CredentialsSignin: 'Invalid email or password.',
  rate_limit_exceeded: 'Too many failed attempts. Please wait 15 minutes.',
  account_locked: 'Account locked due to too many failed attempts. Contact your admin.',
  invalid_mfa_token: 'Invalid MFA code. Please try again.',
  default: 'An unexpected error occurred. Please try again.',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const callbackUrl = searchParams?.get('callbackUrl') ?? '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        mfaToken: data.mfaToken ?? '',
        redirect: false,
      });

      if (!result?.ok) {
        const code = result?.error ?? 'default';
        if (code === 'mfa_required') {
          setShowMfa(true);
          return;
        }
        setServerError(ERROR_MAP[code] ?? ERROR_MAP.default);
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface shadow-neu-out mb-4">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">CHR System</h1>
          <p className="text-sm text-muted mt-1 font-medium">Clinical Health Records</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-sm text-muted mb-6">Enter your credentials to access your workspace.</p>

          {serverError && (
            <div className="alert alert-error mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="form-field">
              <label className="label" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@clinic.com"
                  className={cn('input pl-10', errors.email && 'input-error')}
                  {...register('email')}
                />
              </div>
              {errors.email && <span className="form-error"><AlertCircle className="w-3 h-3" />{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="form-field">
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn('input pl-10 pr-10', errors.password && 'input-error')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="form-error"><AlertCircle className="w-3 h-3" />{errors.password.message}</span>}
            </div>

            {/* MFA */}
            {showMfa && (
              <div className="form-field animate-slide-up">
                <label className="label" htmlFor="mfaToken">Authenticator Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="mfaToken"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                    className={cn('input pl-10 tracking-widest text-center font-mono text-lg', errors.mfaToken && 'input-error')}
                    {...register('mfaToken')}
                  />
                </div>
                <p className="text-xs text-muted mt-1">Enter the 6-digit code from your authenticator app.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full btn-lg mt-2"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : showMfa ? 'Verify & Sign in' : 'Sign in'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Protected under HIPAA. Unauthorised access is a federal offence.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
