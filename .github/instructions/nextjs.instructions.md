---
applyTo: "**/*.tsx,**/*.ts,**/*.jsx,**/*.js"
---
# Next.js 16 + App Router Instructions

## Server vs. Client Components

- Default to **Server Components** (no directive needed).
- Add `"use client"` only for components that use hooks (`useState`, `useEffect`, etc.), event handlers, or browser APIs.
- Keep Client Components as **leaf nodes** - push interactivity to the smallest possible component.

## Async APIs (Next.js 16 Breaking Change)

In Next.js 16, the following are **async** and must be awaited:

```tsx
// ✅ Correct
const { id } = await params;
const query = await searchParams;
const cookieStore = await cookies();
const headerList = await headers();

// ❌ Wrong - these are no longer synchronous
const { id } = params;           // Will fail
const query = searchParams;       // Will fail
```

## Data Fetching

- Fetch data in Server Components using `async/await`.
- Use Server Actions (`"use server"`) for data mutations.
- Use `Suspense` boundaries with `loading.tsx` for granular loading states.
- Handle errors with `error.tsx` (client-side error boundary).

## Routing

- Use `layout.tsx` for shared UI across routes.
- Use `page.tsx` for route-specific content.
- Use `route.ts` for API routes (Route Handlers).
- Use dynamic routes: `[id]/page.tsx` and catch-all: `[...slug]/page.tsx`.

## Metadata & SEO

- Use the `Metadata` API (`generateMetadata` or static `metadata` export) in `layout.tsx` or `page.tsx`.
- Never use `<Head>` from `next/head` - that is Pages Router only.

## Middleware

> **CRITICAL - Read this before generating any middleware or next-intl code.**

- **ALWAYS** use `src/middleware.ts` as the middleware file. This is the ONLY filename Next.js
  recognises as middleware.
- **NEVER** create `src/proxy.ts` as middleware - not even if a deprecation warning says to.

**Why proxy.ts must never be used as middleware:**
Next.js 16.2.1 emits a cosmetic deprecation warning hinting that `proxy.ts` is the future
replacement for `middleware.ts`. This is a FORWARD-LOOKING notice. In the current release,
`proxy.ts` is NOT processed as middleware. It produces an empty `middleware-manifest.json`,
which silently breaks the entire application:
- No middleware executes.
- `next-intl` cannot inject locale context for Server Components.
- Every `getMessages()` / `useTranslations()` call in a locale layout throws HTTP 500.
- The root cause is invisible in logs because no error appears - the middleware just does nothing.

**Correct middleware file for a next-intl project:**

```ts
// src/middleware.ts  <-- filename is NON-NEGOTIABLE
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

**Verification after generating middleware:**
Always confirm middleware is active by checking the build output shows:
`middleware: src/middleware.ts (Xms)` in the route manifest. If you see an empty
`sortedMiddleware: []` in `.next/server/middleware-manifest.json`, the file is wrong.

## Optimisation

- Use `next/image` for images (automatic optimisation).
- Use `next/font` for fonts (zero layout shift).
- Use `next/link` for client-side navigation.
- Prefer `next/dynamic` for code-splitting heavy Client Components.
