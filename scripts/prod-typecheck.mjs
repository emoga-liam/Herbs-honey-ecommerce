/**
 * Hostinger-/PATH-safe typecheck without nested `pnpm`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");

if (!fs.existsSync(tsc)) {
  console.error(`Missing TypeScript: ${tsc}`);
  process.exit(1);
}

/**
 * @param {string} title
 * @param {string[]} args
 * @param {string} [cwd]
 */
function run(title, args, cwd = root) {
  console.log(`→ ${title}`);
  const result = spawnSync(node, args, {
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

run("typecheck libs (tsc --build)", [tsc, "--build"]);

for (const rel of [
  "artifacts/api-server",
  "artifacts/ffg-store",
  "scripts",
]) {
  run(`typecheck ${rel}`, [tsc, "-p", "tsconfig.json", "--noEmit"], path.join(root, rel));
}

console.log("✓ Typecheck complete");
