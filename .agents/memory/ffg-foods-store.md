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
