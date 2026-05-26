'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(
        authError.message.includes('Invalid login credentials')
          ? t('error_invalid')
          : `${t('error_generic')} (${authError.message})`
      );
      setIsLoading(false);
      return;
    }

    router.push('../dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] px-4">
      <div className="w-full max-w-md bg-[var(--surface-container)] rounded-2xl shadow-sm border border-[var(--outline-variant)] p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-center text-[var(--on-surface)] mb-6">
          {t('title')}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
              placeholder="name@example.de"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Passwort */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-[var(--on-surface)]">
                {t('password')}
              </label>
              <Link
                href="./reset-password"
                className="text-xs text-[var(--primary)] hover:underline"
              >
                {t('forgot_password')}
              </Link>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
            />
          </div>

          {/* Fehlermeldung */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '...' : t('submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--on-surface-variant)]">
          {t('no_account')}{' '}
          <Link href="./register" className="text-[var(--primary)] font-medium hover:underline">
            {t('register_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
