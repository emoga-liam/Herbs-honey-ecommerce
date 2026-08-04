---
name: FFG Foods Store
description: Key quirks, package-manager history, and Hostinger deployment decisions for the FFG Foods herbs-infused honey e-commerce monorepo.
---

## Package manager: pnpm (current)

The project is a pnpm monorepo. After detours through npm and Yarn, it is back on pnpm.

**Current version:** pnpm v10.26.1 (system-installed on Replit; `packageManager: "pnpm@10.26.1"` in root `package.json`).

**Why:**
- Hostinger's `/tmp` is `noexec`, which blocked Yarn's temp script execution.
- npm's workspace resolution caused repeated install/exit-handler failures.
- pnpm with `node-linker=hoisted` (set in `.npmrc`) flattens `node_modules` like npm, avoiding Hostinger's EACCES symlink/binary errors.

## Critical `.npmrc` settings

```ini
node-linker=hoisted
only-built-dependencies[]=esbuild
only-built-dependencies[]=@firebase/util
only-built-dependencies[]=protobufjs
manage-package-manager-versions=false
registry=https://registry.npmjs.org/
```

**Why `manage-package-manager-versions=false`:** Without it, pnpm 10 tries to self-reinstall via corepack using `@pnpm/exe`, whose build script isn't on the `only-built-dependencies` allowlist, causing a boot loop.

**Why `registry=https://registry.npmjs.org/`:** Replit injects `npm_config_registry=http://package-firewall.replit.local/npm/` as an environment variable. In pnpm, env vars override `.npmrc`, so the explicit registry line is still needed. If pnpm ever stops picking up the env var override, the line is still harmless.

## Workspace package protocol: `workspace:*`

Internal cross-package references must use `workspace:*` (not `"0.0.0"`). pnpm does not auto-link workspace packages by name — it requires the `workspace:` protocol or it tries to fetch from the registry.

Packages that reference other workspace packages:
- `artifacts/api-server`: `@workspace/api-zod`, `@workspace/db` → both `workspace:*`
- `artifacts/ffg-store`: `@workspace/api-client-react` → `workspace:*`

## `pnpm-workspace.yaml`

Defines workspace package globs and `onlyBuiltDependencies` (the pnpm v9+ canonical key):

```yaml
packages:
  - 'artifacts/*'
  - 'lib/*'
  - 'lib/integrations/*'
  - 'scripts'

onlyBuiltDependencies:
  - esbuild
  - '@firebase/util'
  - protobufjs
```

Note: root `package.json` must NOT have a `workspaces` field — pnpm warns about it and ignores it in favour of `pnpm-workspace.yaml`.

## esbuild pinned to 0.25.8

`esbuild-plugin-pino` does not support esbuild versions newer than 0.25.8. Keep this pin in `artifacts/api-server/package.json`.

## Hostinger deployment commands

```bash
pnpm install --frozen-lockfile
pnpm run build
```

Start command: `pnpm run hostinger:start`

The combined app: Express API at port `$PORT`, serving the built React storefront from `artifacts/ffg-store/dist/public`.

## Pricing

All prices are stored as kobo integers (`priceKobo`, `totalKobo`). Divide by 100 for Naira display.

## Orval codegen

Run after any OpenAPI spec change:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## Paystack + payment on delivery

Both Paystack (server-side verified + signed webhook) and payment-on-delivery are supported checkout methods.
