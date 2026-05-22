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
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] px-4">
        <div className="w-full max-w-md bg-[var(--surface-container)] rounded-2xl shadow-sm border border-[var(--outline-variant)] p-8 text-center">
          <div className="w-14 h-14 bg-[var(--secondary-container)]/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--on-surface)] mb-2">{t('success_title')}</h2>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('success_message')}</p>
          <Link href="../login" className="mt-4 inline-block text-sm text-[var(--primary)] hover:underline">
            {t('back_to_login')}
          </Link>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50 transition-colors"
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
