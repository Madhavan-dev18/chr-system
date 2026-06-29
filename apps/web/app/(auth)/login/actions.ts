'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { generateRefreshTokensV2, storeRefreshToken } from '@/lib/tokens';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Validate inputs
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      return {
        error: parsed.error.errors[0].message,
      };
    }

    // Call NextAuth signIn
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    
    // HACK/NOTE: In NextAuth v5, `signIn` throws an Error internally to handle redirects
    // if redirect: true. If redirect: false, it just returns or throws AuthError.
    
    // If we reach here, signIn was successful.
    // However, we need to provision a refresh token since NextAuth JWT is short-lived.
    // NOTE: In a full integration, you might want to issue the refresh token cookie here
    // manually using `next/headers` cookies(), or return the token to the client.
    
    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          if ((error as any).code === 'rate_limit_exceeded') {
            return { error: 'Too many attempts. Please try again in 15 minutes.' };
          }
          if ((error as any).code === 'account_locked') {
            return { error: 'Account locked due to multiple failed login attempts. Please wait 15 minutes.' };
          }
          return { error: 'Invalid email or password.' };
        default:
          return { error: 'An unexpected error occurred.' };
      }
    }
    
    // NextAuth redirect errors bubble up here, need to rethrow them
    throw error;
  }
}
