import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

type CookieToSet = { name: string; value: string; options?: Partial<ResponseCookie> };

// Ergebnis der Session-Prüfung:
// - redirect: Nutzer muss zur Login-Seite (geschützte Route ohne Session)
// - cookies: Gesetzte Supabase-Cookies, die auf die finale Response kopiert werden müssen
// - skip: Env-Vars fehlen, nichts tun
export type SessionResult =
  | { type: 'redirect'; response: NextResponse }
  | { type: 'ok'; cookiesToForward: CookieToSet[] }
  | { type: 'skip' };

// Middleware-Client: Session-Refresh für jede Anfrage
export async function updateSession(request: NextRequest): Promise<SessionResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Placeholder-Check: Middleware überspringen, wenn Vars nicht gesetzt
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return { type: 'skip' };
  }

  const cookiesToForward: CookieToSet[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Request-Cookies mutieren, damit nachfolgende Middleware aktuelle Werte sieht
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Cookies merken, um sie auf die finale Response zu kopieren
        cookiesToForward.push(...cookiesToSet);
      },
    },
  });

  // Session auffrischen - WICHTIG: kein Code zwischen createServerClient und getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Geschützte Routen: Dashboard nur für eingeloggte Nutzer
  const isProtectedRoute = request.nextUrl.pathname.includes('/dashboard') ||
    request.nextUrl.pathname.includes('/admin');

  if (!user && isProtectedRoute) {
    const locale = request.nextUrl.pathname.split('/')[1] || 'de';
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return { type: 'redirect', response: NextResponse.redirect(loginUrl) };
  }

  return { type: 'ok', cookiesToForward };
}
