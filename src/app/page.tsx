import { redirect } from 'next/navigation';

// Root-Seite leitet zur Standard-Locale (de) weiter
// next-intl Middleware übernimmt das Routing danach
export default function RootPage() {
  redirect('/de');
}

