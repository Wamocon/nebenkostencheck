import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // pdf-parse is CJS - exclude from bundling so require() works at runtime
  serverExternalPackages: ['pdf-parse'],
  // Public env vars baked into the bundle at build time.
  // These are NEXT_PUBLIC_ values (visible in client JS, protected by Supabase RLS).
  // Defined here because Vercel CLI build does not reliably pull dashboard env vars.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://jadxvuiucoxhrjvscwcg.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_f1NZ5ZNsodekMfeCU6TQHg_N62Z-k9d',
    NEXT_PUBLIC_APP_URL: 'https://nebenkostencheck.eu',
  },
};

export default withNextIntl(nextConfig);

