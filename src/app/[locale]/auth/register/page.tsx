'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? t('error_email_taken')
          : t('error_generic')
      );
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] px-4">
        <div className="w-full max-w-md bg-[var(--surface-container)] rounded-2xl shadow-sm border border-[var(--outline-variant)] p-8 text-center">
          <div className="w-14 h-14 bg-[var(--primary)]/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--on-surface)] mb-2">{t('success_title')}</h2>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('success_message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] px-4">
      <div className="w-full max-w-md bg-[var(--surface-container)] rounded-2xl shadow-sm border border-[var(--outline-variant)] p-8">
        <div className="flex justify-center mb-6">
          <Logo className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-center text-[var(--on-surface)] mb-6">
          {t('title')}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
              {t('name')}
            </label>
            <input
              type="text"
              autoComplete="name"
              {...register('name')}
              className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

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
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface)] mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
            />
            <p className="mt-1 text-xs text-[var(--on-surface-variant)]">{t('password_hint')}</p>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

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
          {t('already_account')}{' '}
          <Link href="../login" className="text-[var(--primary)] font-medium hover:underline">
            {t('login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
