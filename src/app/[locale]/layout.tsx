import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import '../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://nebenkostencheck.eu'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer locale={locale} />
            <BottomNav locale={locale} />
            <Toaster richColors position="top-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
