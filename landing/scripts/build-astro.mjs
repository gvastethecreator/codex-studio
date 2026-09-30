import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { postprocessDirectory } from "./postprocess-github-bootstrap.mjs";
import { syncVendor } from "./sync-vendor.mjs";
import { TEMPLATE_SHOWCASES } from "../src/core/template/showcases.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const astroPkg = require("astro/package.json");
const ASTRO_VERSION = astroPkg.version;
const astroCli = join(dirname(require.resolve("astro/package.json")), "bin", "astro.mjs");
const [yamlArg = "site.yaml", outArg = "docs", baseArg] = process.argv.slice(2);
const yamlPath = resolve(ROOT, yamlArg);
const siteDir = dirname(yamlPath);
const outDir = resolve(ROOT, outArg);
const astroRoot = resolve(ROOT, "dist-astro");
const nested = relative(astroRoot, outDir);
const inferredBase = nested && !nested.startsWith("..")
  ? `/${nested.split(sep).join("/").replace(/^\/+|\/+$/g, "")}/`
  : "/";
const base = baseArg || process.env.GVASTE_ASTRO_BASE || inferredBase;
const authoredDocs = ["agents", "adr", "studio", "codemap", "landing-system", "architecture", "css-sanitization"];
const stashDir = join(ROOT, ".cache", "astro-authored-docs");

function copyDir(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

function stashAuthoredDocs() {
  if (outDir !== join(ROOT, "docs")) return false;
  rmSync(stashDir, { recursive: true, force: true });
  for (const name of authoredDocs) copyDir(join(outDir, name), join(stashDir, name));
  return true;
}

function restoreAuthoredDir(from, to, { skip = [] } = {}) {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (skip.includes(name)) continue;
    copyDir(join(from, name), join(to, name));
  }
}

function restoreAuthoredDocs(stashed) {
  if (!stashed) return;
  for (const name of authoredDocs) {
    const from = join(stashDir, name);
    const to = join(outDir, name);
    // /studio/ is both the React editor route and the planning-doc folder.
    // Keep Astro's generated index.html and merge the authored markdown back in.
    if (name === "studio") restoreAuthoredDir(from, to, { skip: ["index.html"] });
    else copyDir(from, to);
  }
  rmSync(stashDir, { recursive: true, force: true });
}

const stashed = stashAuthoredDocs();

await syncVendor();
const favicons = spawnSync(process.execPath, [join(ROOT, "scripts", "prefetch-favicons.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
if (favicons.status !== 0) {
  console.warn("Favicon prefetch skipped or failed; Tabler fallbacks will show.");
}
const manifest = spawnSync(process.execPath, [join(ROOT, "scripts", "build-studio-manifest.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
if (manifest.status !== 0) {
  restoreAuthoredDocs(stashed);
  process.exit(manifest.status ?? 1);
}

const result = spawnSync(process.execPath, [astroCli, "build"], {
  cwd: ROOT,
  stdio: "inherit",
  env: {
    ...process.env,
    GVASTE_ROOT: ROOT,
    GVASTE_SITE_YAML: yamlPath,
    GVASTE_ASTRO_OUT: outDir,
    GVASTE_ASTRO_BASE: base,
  },
});

if (result.error) {
  restoreAuthoredDocs(stashed);
  throw result.error;
}
if (result.status !== 0) {
  restoreAuthoredDocs(stashed);
  process.exit(result.status ?? 1);
}

restoreAuthoredDocs(stashed);
copyDir(join(siteDir, "assets"), join(outDir, "assets"));

const github = postprocessDirectory(outDir);
if (github.bootstraps > 0) {
  console.log(`Annotated ${github.bootstraps} GitHub bootstrap payloads in ${github.filesChanged} HTML files`);
}

const examplesRoot = join(ROOT, "examples");
if (existsSync(examplesRoot)) {
  for (const entry of readdirSync(examplesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !existsSync(join(examplesRoot, entry.name, "site.yaml"))) continue;
    copyDir(join(examplesRoot, entry.name, "assets"), join(outDir, "examples", entry.name, "assets"));
  }
}

for (const spec of TEMPLATE_SHOWCASES) {
  const dest = join(outDir, "playground", "templates", spec.id, "assets");
  copyDir(join(ROOT, "examples", spec.example, "assets"), dest);
  for (const asset of spec.extraAssets ?? []) {
    const from = join(ROOT, asset.from);
    if (!existsSync(from)) continue;
    mkdirSync(dest, { recursive: true });
    copyFileSync(from, join(dest, asset.to));
  }
}

const casesPath = join(ROOT, "playground", "cases.json");
if (existsSync(casesPath)) {
  const cases = JSON.parse(readFileSync(casesPath, "utf8")).cases ?? [];
  for (const item of cases) {
    copyDir(join(ROOT, "playground", "cases", "assets"), join(outDir, "playground", "cases", item.id, "assets"));
  }
}

console.log(`Astro ${ASTRO_VERSION} rendered ${relative(ROOT, yamlPath)} plus corpus -> ${relative(ROOT, outDir)}/ (base ${base})`);
