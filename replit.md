# FFG Foods Store

A full-stack e-commerce site for FFG Foods (Farm Fresh Grocery) — a Nigerian herbs-infused honey brand selling sachets and boxes in four flavors: Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Prices in Nigerian Naira (₦).

## Run & Operate

- `yarn workspace @workspace/api-server dev` — run the API server (port 8080)
- `yarn workspace @workspace/ffg-store dev` — run the storefront (port 22825)
- `yarn typecheck` — full typecheck across all packages
- `yarn build` — production typecheck + storefront/API build
- `yarn hostinger:build` — production build for the combined Hostinger app
- `yarn hostinger:start` — start the combined production app
- `yarn workspace @workspace/api-spec codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `yarn workspace @workspace/db push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- Yarn workspaces, Node.js 22+, TypeScript 5.9
- Frontend: React + Vite (Tailwind CSS, shadcn/ui, wouter, TanStack Query)
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Firebase Authentication for customers/admin identity, with admin allow-list checks in the API

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
- **Firebase-backed admin auth** — the browser sends a Firebase ID token; the API verifies it with Firebase Identity Toolkit and checks the admin allow-list.
- **Customer accounts** — customers can sign in with Firebase and view orders by email; checkout still records delivery contact details on every order.
- **Paystack plus payment on delivery** — Paystack payments are verified server-side and by signed webhook; orders can also be placed for payment on delivery.
- **Contract-first API** — OpenAPI spec → Orval codegen → typed hooks. Run codegen after any spec change.

## Product

- Public storefront: browse products by flavor/type, view details, add to cart, place orders
- Cart persisted in localStorage
- Protected admin dashboard: view stats, manage products (CRUD), manage orders (status updates)
- Admin credentials: `admin@ffgfoods.com` / `admin123` (change in production)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `yarn workspace @workspace/api-spec codegen` after any OpenAPI spec change before editing frontend files that use the generated hooks.
- Admin route `/admin` (and sub-routes) are protected by `AdminGuard` which redirects to `/admin/login` if not authenticated.
- Product images use the `@assets` Vite alias pointing to `artifacts/ffg-store/attached_assets/`.
- `getProductImage(flavor, type, imageUrl)` in `lib/utils.ts` maps flavor+type to the correct image file.

## Pointers

- See the Yarn workspaces configuration in the root `package.json` for workspace structure and package details
