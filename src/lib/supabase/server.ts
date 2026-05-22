import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-Client: Fail-fast bei fehlenden Env Vars (verhindert stille Fehler in Produktion)
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL ist nicht gesetzt. Trage den Wert in .env.local und in den Vercel Environment Variables ein.'
    );
  }
  if (!supabaseKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY ist nicht gesetzt. Trage den Wert in .env.local und in den Vercel Environment Variables ein.'
    );
  }

  const cookieStore = await cookies(); // Next.js 16: cookies() ist async

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll kann in Server Components ohne aktive Response fehlschlagen - ignorieren
        }
      },
    },
  });
}
