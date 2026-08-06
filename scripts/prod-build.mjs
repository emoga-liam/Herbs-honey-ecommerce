/**
 * Hostinger-safe production build. Hostinger's build shell often has `node`
 * but not `pnpm` on PATH, so nested `pnpm run …` / `pnpm --filter` fail.
 * This script only uses `process.execPath` and paths under node_modules.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;

/**
 * @param {string} title
 * @param {string} command
 * @param {string[]} args
 * @param {string} [cwd]
 */
function run(title, command, args, cwd = root) {
  console.log(`\n→ ${title}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolveBin(...parts) {
  const candidate = path.join(root, "node_modules", ...parts);
  if (!fs.existsSync(candidate)) {
    console.error(`Missing required binary: ${candidate}`);
    process.exit(1);
  }
  return candidate;
}

const tsc = resolveBin("typescript", "bin", "tsc");
const vite = resolveBin("vite", "bin", "vite.js");

run("fix esbuild binary permissions", node, [
  path.join(root, "scripts", "fix-esbuild-bins.mjs"),
]);

run("typecheck libs (tsc --build)", node, [tsc, "--build"]);

const typecheckPackages = [
  "artifacts/api-server",
  "artifacts/ffg-store",
  "artifacts/mockup-sandbox",
  "scripts",
];

for (const rel of typecheckPackages) {
  run(`typecheck ${rel}`, node, [tsc, "-p", "tsconfig.json", "--noEmit"], path.join(root, rel));
}

run(
  "build @workspace/ffg-store (vite)",
  node,
  [vite, "build", "--config", "vite.config.ts"],
  path.join(root, "artifacts", "ffg-store"),
);

run(
  "build @workspace/api-server (esbuild)",
  node,
  [path.join(root, "artifacts", "api-server", "build.mjs")],
  path.join(root, "artifacts", "api-server"),
);

console.log("\n✓ Production build complete");
