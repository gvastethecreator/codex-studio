import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BOOTSTRAP_RE = /<script\b([^>]*\bdata-github-bootstrap\b[^>]*)>([\s\S]*?)<\/script>/g;

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function annotateBootstrapHtml(html, { fetchedAt = Date.now(), file = "<html>" } = {}) {
  let count = 0;
  const output = String(html).replace(BOOTSTRAP_RE, (full, attrs, raw) => {
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      throw new Error(`[github-bootstrap] Invalid JSON in ${file}: ${error.message}`);
    }
    if (!payload || !payload.repo) return full;
    if (payload.repo.private === true || payload.repo.visibility === "private") {
      throw new Error(`[github-bootstrap] Refusing to serialize private repository data in ${file}`);
    }
    if (payload.bootstrapVersion) {
      count += 1;
      return full;
    }
    payload.bootstrapVersion = 2;
    payload.bootstrapSource = "build";
    payload.fetchedAt = Number(fetchedAt);
    count += 1;
    return `<script${attrs}>${safeJson(payload)}</script>`;
  });
  return { html: output, count };
}

function walkHtml(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    if (statSync(path).isDirectory()) walkHtml(path, files);
    else if (name.endsWith(".html")) files.push(path);
  }
  return files;
}

export function postprocessDirectory(dir, { fetchedAt = Date.now() } = {}) {
  const root = resolve(dir);
  if (!existsSync(root)) throw new Error(`[github-bootstrap] Missing output directory ${root}`);
  let filesChanged = 0;
  let bootstraps = 0;
  for (const file of walkHtml(root)) {
    const before = readFileSync(file, "utf8");
    const result = annotateBootstrapHtml(before, { fetchedAt, file });
    if (result.count && result.html !== before) {
      writeFileSync(file, result.html);
      filesChanged += 1;
    }
    bootstraps += result.count;
  }
  return { filesChanged, bootstraps };
}

function isCli() {
  const entry = process.argv[1];
  return Boolean(entry) && resolve(entry) === resolve(fileURLToPath(import.meta.url));
}

if (isCli()) {
  try {
    const target = process.argv[2] || "docs";
    const result = postprocessDirectory(target);
    console.log(`Annotated ${result.bootstraps} GitHub bootstrap payloads in ${result.filesChanged} HTML files`);
  } catch (error) {
    console.error(error.message ?? error);
    process.exitCode = 1;
  }
}
