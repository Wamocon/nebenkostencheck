// src/middleware.ts - PFLICHTDATEINAME: niemals src/proxy.ts verwenden
// In Next.js 16.2.1 mit Turbopack erzeugt proxy.ts ein leeres middleware-manifest.json
// und bricht next-intl komplett (HTTP 500 auf allen SSR-Routen).
import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Supabase Session refresh (muss vor intl laufen, damit Cookies gesetzt werden)
  const supabaseResponse = await updateSession(request);
  if (supabaseResponse) return supabaseResponse;

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Alle Pfade ausser _next, statische Dateien und API-Routen
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
