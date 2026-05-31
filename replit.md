# FFG Foods Store

A full-stack e-commerce site for FFG Foods (Farm Fresh Grocery) — a Nigerian herbs-infused honey brand selling sachets and boxes in four flavors: Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Prices in Nigerian Naira (₦).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/ffg-store run dev` — run the storefront (port 22825)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (Tailwind CSS, shadcn/ui, wouter, TanStack Query)
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: bcryptjs + express-session (admin only)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI contract
- `lib/db/src/schema/index.ts` — DB schema (products, orders, admins)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Zod schemas (do not edit manually)
- `artifacts/api-server/src/routes/` — backend route handlers
- `artifacts/ffg-store/src/pages/` — frontend pages (home, products, product-detail, cart, checkout, order-confirmation, admin/*)
- `artifacts/ffg-store/src/components/` — shared components (layout, product-card, cart-context, ui/*)
- `artifacts/ffg-store/attached_assets/` — product images (referenced via `@assets` alias)

## Architecture decisions

- **Prices stored as kobo integers** (÷ 100 for Naira display). All `priceKobo`/`totalKobo` fields in DB and API are integers.
- **Session-based admin auth** — `POST /api/auth/login` sets a session cookie; `useGetAdminMe` used for frontend auth guard.
- **No customer auth** — customers place orders with name/email/phone; no account required.
- **Payment on delivery** — orders confirmed by phone after placement.
- **Contract-first API** — OpenAPI spec → Orval codegen → typed hooks. Run codegen after any spec change.

## Product

- Public storefront: browse products by flavor/type, view details, add to cart, place orders
- Cart persisted in localStorage
- Protected admin dashboard: view stats, manage products (CRUD), manage orders (status updates)
- Admin credentials: `admin@ffgfoods.com` / `admin123` (change in production)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before editing frontend files that use the generated hooks.
- Admin route `/admin` (and sub-routes) are protected by `AdminGuard` which redirects to `/admin/login` if not authenticated.
- Product images use the `@assets` Vite alias pointing to `artifacts/ffg-store/attached_assets/`.
- `getProductImage(flavor, type, imageUrl)` in `lib/utils.ts` maps flavor+type to the correct image file.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
