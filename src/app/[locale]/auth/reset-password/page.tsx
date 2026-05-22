'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

const resetSchema = z.object({
  email: z.string().email(),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations('auth.reset');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });
    // Kein Fehler zurückgeben (verhindert E-Mail-Enumeration)
    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--muted)] px-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[var(--border)] p-8 text-center">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{t('success_title')}</h2>
          <p className="text-sm text-zinc-500">{t('success_message')}</p>
          <Link href="../login" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
            {t('back_to_login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--muted)] px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-[var(--border)] p-8">
        <div className="flex justify-center mb-6">
          <Logo className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-6">
          {t('title')}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-lg border border-[var(--border)] bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
              placeholder="name@example.de"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors"
          >
            {isLoading ? '...' : t('submit')}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link href="../login" className="text-sm text-[var(--primary)] hover:underline">
            {t('back_to_login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
