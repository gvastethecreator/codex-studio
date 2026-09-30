import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundleHeroShade } from "./bundle-hero-shade.mjs";
import { FIRST_PARTY_RUNTIME } from "../kit/runtime-assets.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GSAP_SRC = join(ROOT, "node_modules", "gsap", "dist");
const PRETEXT_SRC = join(ROOT, "node_modules", "@chenglou", "pretext", "dist");
const DEST = join(ROOT, "kit", "vendor");
const PRETEXT_DEST = join(DEST, "pretext");
const PUBLIC = join(ROOT, "public");
const PUBLIC_VENDOR = join(PUBLIC, "vendor");
const GSAP_FILES = ["gsap.min.js", "ScrollToPlugin.min.js", "ScrollTrigger.min.js"];
const PRETEXT_FILES = [
  "layout.js",
  "analysis.js",
  "bidi.js",
  "measurement.js",
  "line-break.js",
  "line-text.js",
  join("generated", "bidi-data.js"),
];

const FIRST_PARTY = FIRST_PARTY_RUNTIME.map(([from, to]) => [join(ROOT, from), join(ROOT, to)]);

export async function syncVendor() {
  mkdirSync(DEST, { recursive: true });
  try {
    await bundleHeroShade();
    console.log("Bundled hero-shade.js (WebGPU first, WebGL fallback)");
  } catch (error) {
    if (existsSync(join(DEST, "hero-shade.js"))) {
      console.log("Hero shade bundle failed. Kept kit/vendor/hero-shade.js.");
    } else {
      console.error("[sync-vendor] Could not bundle kit/vendor/hero-shade.js. Run pnpm install.");
      console.error(error);
      process.exit(1);
    }
  }
  for (const [from, to] of FIRST_PARTY) {
    if (!existsSync(from)) {
      console.error(`[sync-vendor] Missing first-party runtime asset ${from}`);
      process.exit(1);
    }
    cpSync(from, to);
  }

  if (!existsSync(join(GSAP_SRC, "gsap.min.js"))) {
    if (GSAP_FILES.every((file) => existsSync(join(DEST, file)))) {
      console.log("GSAP is not installed. Kept kit/vendor copies.");
    } else {
      console.error("[sync-vendor] Missing node_modules/gsap/dist. Run pnpm install.");
      process.exit(1);
    }
  } else {
    for (const file of GSAP_FILES) {
      const from = join(GSAP_SRC, file);
      if (!existsSync(from)) {
        console.error(`[sync-vendor] Missing ${from}`);
        process.exit(1);
      }
      cpSync(from, join(DEST, file));
    }
    console.log("Synced GSAP vendor files from node_modules/gsap/dist");
  }

  const pretextSrcReady = PRETEXT_FILES.every((file) => existsSync(join(PRETEXT_SRC, file)));
  const pretextDestReady = PRETEXT_FILES.every((file) => existsSync(join(PRETEXT_DEST, file)));
  if (!pretextSrcReady) {
    if (pretextDestReady) {
      console.log("Pretext is not installed. Kept kit/vendor/pretext copies.");
    } else {
      console.error("[sync-vendor] Missing node_modules/@chenglou/pretext/dist. Run pnpm install.");
      process.exit(1);
    }
  } else {
    for (const file of PRETEXT_FILES) {
      const to = join(PRETEXT_DEST, file);
      mkdirSync(dirname(to), { recursive: true });
      cpSync(join(PRETEXT_SRC, file), to);
    }
    console.log("Synced Pretext vendor files from node_modules/@chenglou/pretext/dist");
  }

  // The Astro engine serves runtime assets from public/ so they are available
  // in `astro dev` and copied verbatim into the static output by `astro build`.
  mkdirSync(PUBLIC_VENDOR, { recursive: true });
  cpSync(join(ROOT, "kit", "js", "app.js"), join(PUBLIC, "app.js"));
  cpSync(join(ROOT, "kit", "noise.svg"), join(PUBLIC, "noise.svg"));
  for (const file of readdirSync(DEST)) {
    cpSync(join(DEST, file), join(PUBLIC_VENDOR, file), { recursive: true });
  }

  console.log("Synced first-party runtime loader and GitHub signal module");
  console.log("Synced public/ runtime assets (app.js + vendor/)");
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await syncVendor();
