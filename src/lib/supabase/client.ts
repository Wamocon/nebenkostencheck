import { createBrowserClient } from '@supabase/ssr';

// Browser-Client: Placeholder verhindert Modul-Level-Crash bei fehlendem Env Var
// (relevanter Vercel-SSR-Edge-Case - leere Strings crashen createBrowserClient)
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
