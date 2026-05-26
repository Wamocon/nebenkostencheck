// src/middleware.ts - PFLICHTDATEINAME: niemals src/proxy.ts verwenden
// In Next.js 16.2.1 mit Turbopack erzeugt proxy.ts ein leeres middleware-manifest.json
// und bricht next-intl komplett (HTTP 500 auf allen SSR-Routen).
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

// Pfade, die NICHT durch intlMiddleware laufen sollen (liegen außerhalb von [locale])
const INTL_BYPASS_PATHS = ['/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Supabase Session refresh (mutiert request.cookies mit aktuellen Token)
  const sessionResult = await updateSession(request);

  // Auth-Redirect (z.B. geschützte Route ohne Login) sofort zurückgeben
  if (sessionResult.type === 'redirect') {
    return sessionResult.response;
  }

  // 2. Pfade außerhalb von [locale] direkt durchlassen (z.B. /auth/callback)
  if (INTL_BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next({ request });
    if (sessionResult.type === 'ok') {
      for (const { name, value, options } of sessionResult.cookiesToForward) {
        response.cookies.set(name, value, options);
      }
    }
    return response;
  }

  // 3. next-intl Middleware (Locale-Detection, Routing, Header)
  const response = intlMiddleware(request);

  // 4. Supabase-Cookies auf die finale Response kopieren
  if (sessionResult.type === 'ok') {
    for (const { name, value, options } of sessionResult.cookiesToForward) {
      response.cookies.set(name, value, options);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Alle Pfade ausser _next, statische Dateien und API-Routen
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
