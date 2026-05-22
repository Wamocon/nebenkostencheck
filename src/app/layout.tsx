import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NebenkostenCheck",
  description: "Nebenkostenabrechnung prüfen - schnell, einfach, kostenlos.",
};

// Root-Layout: Minimal - der [locale]-Layout übernimmt alle Styles und Provider
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

