# GRICH20 — Hostinger deployment

This project is prepared as one Node.js web application: the Express API serves
the built React storefront, and the same public domain handles both the shop
and `/api/*` endpoints.

## Requirements

Use a Hostinger plan that supports Node.js Web Apps (Business Web Hosting or a
Cloud plan). Hostinger currently supports Node.js 18, 20, 22, and 24. This
project is pinned to Node.js 22 because it is the current LTS line supported by
Hostinger.

The application also needs a PostgreSQL database. Use the connection string
from the production database provider; do not use a local database file.

## Hostinger application settings

Create a **Node.js Web App** in hPanel and connect the repository (GitHub is
recommended for repeatable deployments).

Recommended settings:

- Node.js version: `22.x`
- Framework: `Other` or `Express.js`
- Application root: repository root
- Build command:
  `pnpm run build` (script uses Node only — no nested `pnpm` on PATH)
- Start command:
  `node --enable-source-maps artifacts/api-server/dist/index.mjs`
  (do **not** use `pnpm run hostinger:start` — Hostinger’s start shell often
  lacks `pnpm` on PATH)
- Application port: Hostinger usually injects `PORT`. If it does not, the app
  defaults to `3000`. You may also set `PORT` manually in Environment variables.

Use pnpm for installation in the Hostinger build environment:

```bash
pnpm install --frozen-lockfile
pnpm run build
```

The project uses pnpm 11 workspaces with a hoisted `node_modules` layout
(`nodeLinker: hoisted` in `pnpm-workspace.yaml`). This flattens the dependency
tree like standard npm, which resolves symlink-related `EACCES` errors on
Hostinger.

Build scripts are controlled by `allowBuilds` in `pnpm-workspace.yaml`:

- `@firebase/util` and `protobufjs` are allowed (required postinstalls).
- `esbuild` is **disallowed** on purpose. Hostinger strips execute bits from
  native binaries, so esbuild’s own postinstall (`spawnSync bin/esbuild`) fails
  with `EACCES`. Platform packages still install; `scripts/fix-esbuild-bins.mjs`
  restores `+x` via root `postinstall` and again at the start of `pnpm run build`.

The production `build` script runs `node ./scripts/prod-build.mjs`, which invokes
`tsc`, Vite, and the API esbuild bundle through `node` and `node_modules` paths.
Nested `pnpm` calls are avoided because Hostinger’s build/start shells often do
not have `pnpm` on `PATH` (`pnpm: command not found`).

Without the `allowBuilds` map, pnpm 11 fails install with `ERR_PNPM_IGNORED_BUILDS`.

Do not run the Vite development server in production. The production build
creates `artifacts/ffg-store/dist/public`, and the API server serves it.

## Environment variables

Set these in Hostinger's Node.js application environment settings. Never commit
the values to GitHub.

### Required

- `DATABASE_URL` — production PostgreSQL connection string from **Supabase →
  Project Settings → Database → Connect**. On Hostinger, prefer the **Session
  pooler** URI (host like `*.pooler.supabase.com`, port `5432` session or
  `6543` transaction), **not** the Direct connection to `db.<project>.supabase.co`.
  Supabase direct hosts are often **IPv6-only**; Hostinger Node apps are commonly
  **IPv4-only**, so a “correct” direct URL still fails and every Express DB route
  (admin login `/api/auth/me`, `/api/products`, checkout) returns 500 while the
  public catalog (Supabase JS client) still works.
  After changing `DATABASE_URL`, restart/redeploy and open
  `https://YOUR-DOMAIN/api/healthz/db` — it must return `"database":"connected"`.
- `SESSION_SECRET` — long random value used for server sessions
- `GOOGLE_API_KEY` — Firebase Identity Toolkit API key used by admin auth
  (same value as `VITE_FIREBASE_API_KEY` is fine)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SUPABASE_URL` — e.g. `https://YOUR-PROJECT.supabase.co` (baked in at build)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable/anon key (baked in at build)

The storefront loads public catalog data (`products`, `product_images`,
`categories`) via the Supabase JS client. After adding the `VITE_SUPABASE_*`
vars, redeploy so Vite rebuilds with them.

Also run [`scripts/supabase-public-catalog-rls.sql`](scripts/supabase-public-catalog-rls.sql)
once in the Supabase SQL Editor so anon/publishable keys can `SELECT` those
tables (RLS). Admin/checkout still use Express + `DATABASE_URL`.

### Paystack

- `PAYSTACK_SECRET_KEY` — Paystack secret key, server-side only
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack public key, used when building the
  storefront

Use test keys while testing. Replace both keys with live keys together when
going live. The public key may be embedded in the browser bundle; the secret
key must only exist in the API server environment.

## Paystack webhook

After the site has a stable HTTPS domain, set this webhook URL in the Paystack
Dashboard:

```text
https://YOUR-DOMAIN.example/api/payments/webhook
```

The endpoint:

- accepts Paystack's raw JSON body;
- validates `x-paystack-signature` with HMAC-SHA512;
- only accepts a successful event whose amount matches the order total;
- is safe to receive more than once because marking an order paid is
  idempotent.

Paystack must be able to reach the domain publicly. Do not put the webhook
behind a login page, password gate, or development URL.

## Database setup

Before the first launch, apply the schema against the production database:

```bash
pnpm --filter @workspace/db run push
```

Then ensure an admin allow-list row exists in Supabase `admins` (email must match
a Firebase Auth user). Admin login uses **Firebase Authentication**, not the
`password_hash` column:

1. Firebase Console → Authentication → Users → add/reset `info@grich20.online`
2. Confirm `admins.email` is `info@grich20.online`
3. Sign in at `/admin/login` with that Firebase email and password

## Uploads

Product uploads are served from `artifacts/api-server/uploads`. The API also
supports an `UPLOADS_DIR` environment variable, so set it to a persistent
Hostinger path if the plan's deployment process replaces the application
directory during redeploys.

## Go-live checklist

1. Confirm Node.js 22 and a supported Hostinger plan.
2. Set all required production environment variables.
3. Run the production build and start commands from the Hostinger settings.
4. Open `/api/healthz` and confirm it returns a healthy response.
5. Test one Paystack transaction with test keys.
6. Confirm the order changes to `paid` after the callback/webhook.
7. Configure the webhook URL in Paystack.
8. Switch both Paystack keys from test to live only after the test order works.
9. Add the final domain to Firebase Authentication's authorized domains.
10. Replace any default admin credentials and verify backups for the database
    and uploaded product media.
