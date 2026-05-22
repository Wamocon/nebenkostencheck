import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

// Middleware-Client: Session-Refresh für jede Anfrage
// Gibt null zurück, wenn keine Supabase-Env-Vars gesetzt sind (z.B. im Placeholder-Build)
export async function updateSession(request: NextRequest): Promise<NextResponse | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Placeholder-Check: Middleware überspringen, wenn Vars nicht gesetzt
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return null;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
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
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
