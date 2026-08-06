/**
 * Hostinger strips execute bits from native binaries during install.
 * esbuild's postinstall then fails with EACCES on spawnSync(bin/esbuild).
 * We skip esbuild lifecycle scripts (allowBuilds.esbuild: false) and restore
 * +x here so Vite / API esbuild builds can run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nodeModules = path.join(root, "node_modules");

/** @type {string[]} */
const fixed = [];

/**
 * @param {string} dir
 */
function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip huge / irrelevant trees when possible
      if (entry.name === ".cache" || entry.name === ".git") continue;
      walk(full);
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;

    const parent = path.basename(path.dirname(full));
    const grand = path.basename(path.dirname(path.dirname(full)));
    const isEsbuildBin =
      entry.name === "esbuild" &&
      parent === "bin" &&
      (grand === "esbuild" || grand.startsWith("linux-") || grand.startsWith("darwin-") || grand.startsWith("win32-") || grand.startsWith("android-") || grand.startsWith("freebsd-") || grand.startsWith("netbsd-") || grand.startsWith("openbsd-") || grand.startsWith("aix-") || grand.startsWith("sunos-"));

    // Match **/esbuild/bin/esbuild and **/@esbuild/<platform>/bin/esbuild
    const normalized = full.replace(/\\/g, "/");
    const matchesPath =
      /\/esbuild\/bin\/esbuild$/.test(normalized) ||
      /\/@esbuild\/[^/]+\/bin\/esbuild$/.test(normalized);

    if (!matchesPath && !isEsbuildBin) continue;

    try {
      fs.chmodSync(full, 0o755);
      fixed.push(path.relative(root, full));
    } catch {
      // Windows or read-only: ignore
    }
  }
}

if (fs.existsSync(nodeModules)) {
  walk(nodeModules);
}

if (fixed.length > 0) {
  console.log(`fix-esbuild-bins: chmod +x on ${fixed.length} file(s)`);
} else {
  console.log("fix-esbuild-bins: no esbuild binaries found (ok if not installed yet)");
}
