---
name: FFG Foods Store
description: Quirks and decisions for the FFG Foods e-commerce project (honey sachets, Nigeria).
---

## Orval-generated hook query options require `queryKey`

When passing `{ query: { enabled: ... } }` to hooks like `useGetProduct` or `useGetOrder`, TypeScript requires `queryKey` too. Always import and use the corresponding getter (e.g. `getGetProductQueryKey(id)`) and pass it in the options.

**Why:** Orval generates hooks where `UseQueryOptions` mandates `queryKey` at the type level even though TanStack Query makes it optional at runtime.

**How to apply:** `useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } })`

## Logout mutation takes `void` not `{}`

`useAdminLogout().mutate` expects `undefined` / no arguments (the mutation variable is typed `void`). Passing `{}` causes a TS2345 error.

**How to apply:** Call `logout.mutate(undefined, { onSuccess: ... })` or just `logout.mutate()`.

## Prices are stored as kobo integers

All price fields in DB and API (`priceKobo`, `totalKobo`) are integers in kobo (÷ 100 = Naira). `formatNaira(kobo)` in `lib/utils.ts` handles display.

## Product images use `@assets` Vite alias

`artifacts/ffg-store/attached_assets/` holds real product photos. `getProductImage(flavor, type, imageUrl)` in `lib/utils.ts` maps flavor+type to the right file. The alias is configured in `vite.config.ts`.

## Admin credentials (dev seed)

`admin@ffgfoods.com` / `admin123` — seeded via `lib/db/src/seed.ts`. Change before production.

## Session auth pattern

Express-session with `SESSION_SECRET` env var. `useGetAdminMe` hook is used by `AdminGuard` to check auth on protected routes; redirects to `/admin/login` on 401.

## Express module augmentation must be in a global types file

`req.admin` augmentation placed inside `middleware/auth.ts` as `declare module "express"` is NOT visible in other route files. Must live in `src/types/express.d.ts` using `declare global { namespace Express { interface Request { admin?: ... } } }` — this is globally visible without imports.

**Why:** TypeScript module augmentation in a non-ambient file is scoped to that file's import graph. Routes that don't import the middleware won't see the augmented type.

**How to apply:** Always put Express Request/Response augmentations in `src/types/express.d.ts`, never inline in middleware files.

## Express 5 wildcard routes changed syntax

`app.get("*", handler)` throws `PathError: Missing parameter name` in Express 5 (path-to-regexp v8). Must use `app.get("/{*splat}", handler)` instead.

**Why:** path-to-regexp v8 (used by Express 5) requires named parameters for wildcards.

## Supabase DB pool needs SSL

`lib/db/src/index.ts` Pool config must include `ssl: { rejectUnauthorized: false }` when DATABASE_URL contains `supabase.com` to prevent connection errors over TLS.

## mockup-sandbox vite config must allow missing PORT during build

The mockup-sandbox `vite.config.ts` threw if `PORT`/`BASE_PATH` were missing, breaking `pnpm run build`. Fixed by only throwing at runtime (not when `NODE_ENV=production` or `argv` contains `build`).

## Dev servers run on port 5173 (frontend) and 5000 (API)

Workflow: "Start application" → `PORT=5173 pnpm --filter @workspace/ffg-store run dev`, "API Server" → builds then starts on PORT=5000. Both confirmed running via logs even when Replit workflow badge shows "failed" (port detection timing quirk with pnpm workspace commands).
