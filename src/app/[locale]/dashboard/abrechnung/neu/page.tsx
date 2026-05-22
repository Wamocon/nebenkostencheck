import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WizardContainer } from '@/components/abrechnung/WizardContainer';
import type { BetrkvCategory } from '@/types';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NeuAbrechnungPage({ params }: Props) {
  const { locale } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // BetrKV-Kategorien für den Wizard laden
  const { data: kategorien } = await supabase
    .from('betrkv_categories')
    .select('*')
    .order('sort_order');

  return (
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <WizardContainer
        locale={locale}
        kategorien={(kategorien ?? []) as BetrkvCategory[]}
      />
    </div>
  );
}
