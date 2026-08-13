import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT || "22825";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

const DEFAULT_HERO_BASENAME =
  "a19fa264-b1a2-4592-a852-d2e2934d4852_1780225496305";

/** Inject a static LCP image preload into built index.html (hashed asset URL). */
function lcpHeroPreloadPlugin(): Plugin {
  return {
    name: "lcp-hero-preload",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        const asset = Object.values(ctx.bundle).find((item) => {
          if (item.type !== "asset" || typeof item.fileName !== "string") return false;
          return (
            item.fileName.includes(DEFAULT_HERO_BASENAME) &&
            item.fileName.endsWith(".webp")
          );
        });

        if (!asset || asset.type !== "asset") return html;

        const href = `${basePath.replace(/\/$/, "")}/${asset.fileName}`.replace(
          /\/{2,}/g,
          "/",
        );
        const tag = `<link rel="preload" as="image" type="image/webp" href="${href}" fetchpriority="high">`;
        return html.replace("</head>", `    ${tag}\n  </head>`);
      },
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), lcpHeroPreloadPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    modulePreload: {
      resolveDependencies(filename, deps) {
        // Keep Firebase off the critical home path; AuthProvider loads it async.
        return deps.filter((dep) => !dep.includes("firebase"));
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("@tanstack/react-query")) return "query";
            if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
            if (id.includes("recharts")) return "recharts";
          }
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
