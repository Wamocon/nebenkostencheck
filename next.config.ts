import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // pdf-parse is CJS - exclude from bundling so require() works at runtime
  serverExternalPackages: ['pdf-parse'],
};

export default withNextIntl(nextConfig);

