# FFG Foods — Hostinger deployment

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
  `pnpm run build`
- Start command:
  `pnpm run hostinger:start`
- Application port: use the port Hostinger provides through `PORT`

Use pnpm for installation in the Hostinger build environment:

```bash
pnpm install --frozen-lockfile
pnpm run build
```

The project uses pnpm 11 workspaces with a hoisted `node_modules` layout
(`nodeLinker: hoisted` in `pnpm-workspace.yaml`). This flattens the dependency
tree like standard npm, which resolves the `EACCES` binary-execution errors that
arise when Hostinger's filesystem cannot follow pnpm's default symlinks. Only
the build scripts for `esbuild`, `@firebase/util`, and `protobufjs` are
permitted to run during install (`allowBuilds` in `pnpm-workspace.yaml`).
Without `allowBuilds`, pnpm 11 fails install with `ERR_PNPM_IGNORED_BUILDS`.

Do not run the Vite development server in production. The production build
creates `artifacts/ffg-store/dist/public`, and the API server serves it.

## Environment variables

Set these in Hostinger's Node.js application environment settings. Never commit
the values to GitHub.

### Required

- `DATABASE_URL` — production PostgreSQL connection string
- `SESSION_SECRET` — long random value used for server sessions
- `GOOGLE_API_KEY` — Firebase Identity Toolkit API key used by admin auth
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

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

Then seed or create the initial admin account using the project's existing
database setup. Change the development admin password before going live.

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
