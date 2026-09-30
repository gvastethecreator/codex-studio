// Copy the page engine from a local gh-pages-template clone into this folder.
// Usage: node scripts/sync-engine.mjs <path-to-gh-pages-template>
// The landing keeps only what builds one page: no Studio editor, playground or examples.
import { cpSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] && resolve(process.argv[2]);
if (!source || !existsSync(join(source, "kit", "section-registry.json"))) {
  console.error("Usage: node scripts/sync-engine.mjs <path-to-gh-pages-template>");
  process.exit(1);
}

const PATHS = [
  "kit",
  "templates",
  "src/core",
  "src/layouts",
  "src/components",
  "src/styles",
  "src/env.d.ts",
  "src/kit-render.d.ts",
  "src/pages/index.astro",
  "src/pages/404.astro",
  "src/pages/favicon.svg.ts",
  "scripts/build-astro.mjs",
  "scripts/sync-vendor.mjs",
  "scripts/postprocess-github-bootstrap.mjs",
  "scripts/build-studio-manifest.mjs",
  "scripts/prefetch-favicons.mjs",
  "scripts/bundle-hero-shade.mjs",
];

for (const path of PATHS) {
  cpSync(join(source, path), join(HERE, path), { recursive: true, force: true });
}
console.log(`Copied ${PATHS.length} engine paths from ${source}`);
