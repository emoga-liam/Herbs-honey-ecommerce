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

## Hostinger and Paystack production boundary

Hostinger deployment uses one combined Node.js app: the Express API serves the built React storefront and reads `PORT`, while the Vite storefront is built ahead of time. Paystack's secret key stays server-side; the browser only receives the public key. Payment completion must be accepted only after server verification or a signed webhook whose amount matches the order total.

**Why:** A separate static frontend and API deployment complicates same-origin routing and makes webhook setup less reliable; trusting only the browser callback would allow forged or mismatched payment confirmations.

**How to apply:** Keep `hostinger:build` and `hostinger:start` as the production contract, publish `/api/payments/webhook` only on a public HTTPS domain, and set both Paystack keys together when switching from test to live.

## Hostinger dependency manager

Hostinger deployment uses npm workspaces with a committed `package-lock.json` and a flat `node_modules` tree. The previous pnpm virtual-store path caused esbuild execute-permission failures during extraction.

**Why:** npm avoids the symlinked virtual-store layout that triggered Hostinger's `esbuild` `EACCES` postinstall failure.

**How to apply:** Use `npm install`/`npm ci`, `npm run build`, and `npm run hostinger:start`; do not reintroduce pnpm workspace or catalog specifiers without repeating the npm conversion.

## pnpm build-script allowlist format

The workspace uses a root `allowBuilds` mapping for pnpm 10/11 deployment installs, explicitly approving native/lifecycle builds for esbuild, Firebase utility code, protobufjs, and the other existing approved packages.

**Why:** Hostinger deployments otherwise report required dependency postinstall scripts as blocked, even when the lockfile is valid.

**How to apply:** Keep the explicit `allowBuilds: package: true` mapping in `pnpm-workspace.yaml`, plus the root wildcard workspace package glob required by the deployment configuration.

## Express 5 wildcard routes changed syntax

`app.get("*", handler)` throws `PathError: Missing parameter name` in Express 5 (path-to-regexp v8). Must use `app.get("/{*splat}", handler)` instead.

**Why:** path-to-regexp v8 (used by Express 5) requires named parameters for wildcards.

## Supabase DB pool needs SSL

`lib/db/src/index.ts` Pool config must include `ssl: { rejectUnauthorized: false }` when DATABASE_URL contains `supabase.com` to prevent connection errors over TLS.

## mockup-sandbox vite config must allow missing PORT during build

The mockup-sandbox `vite.config.ts` threw if `PORT`/`BASE_PATH` were missing, breaking `pnpm run build`. Fixed by only throwing at runtime (not when `NODE_ENV=production` or `argv` contains `build`).

## Dev server ports — 22825 (frontend) and 8080 (API)

The artifact.toml files are the source of truth for port allocation:
- `artifacts/ffg-store/.replit-artifact/artifact.toml` → `localPort = 22825`, dev command `pnpm --filter @workspace/ffg-store run dev`
- `artifacts/api-server/.replit-artifact/artifact.toml` → `localPort = 8080`

**Why:** Replit's proxy routes `/` → port 22825 and `/api` → port 8080 based on these artifact.toml entries. The `.replit` [[ports]] section maps `localPort=22825` → `externalPort=3000`.

**How to apply:** "Start application" workflow = `PORT=22825 pnpm --filter @workspace/ffg-store run dev`, waitForPort=22825; "API Server" = `PORT=8080 pnpm --filter @workspace/api-server run dev`, waitForPort=8080.

## Vite dev server must proxy /api to API server

`vite.config.ts` needs `server.proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } }` so the frontend dev server (port 22825) forwards API calls to the API server (port 8080).

**Why:** Without the proxy, the browser makes `/api/...` requests to port 22825 which has no API handlers, returning 404.

## createArtifact() fails for existing slug directories

`createArtifact({ slug: "ffg-store", ... })` fails if `artifacts/ffg-store/` already exists. The artifact.toml files already exist at `artifacts/<slug>/.replit-artifact/artifact.toml` — Replit's proxy reads them directly without requiring `listArtifacts()` to return them.
