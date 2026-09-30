import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CACHE = join(ROOT, ".cache", "favicons");
const DEFAULT_PUBLIC = join(ROOT, "public", "assets", "favicons");
const FETCH_MS = 8000;
const CONCURRENCY = 4;

export function collectHrefs(root = ROOT) {
  const files = [join(root, "site.yaml")];
  const examples = join(root, "examples");
  if (existsSync(examples)) {
    for (const name of readdirSync(examples, { withFileTypes: true })) {
      if (name.isDirectory()) {
        const yaml = join(examples, name.name, "site.yaml");
        if (existsSync(yaml)) files.push(yaml);
      }
    }
  }
  const cases = join(root, "playground", "cases");
  if (existsSync(cases)) {
    for (const name of readdirSync(cases)) {
      if (name.endsWith(".yaml")) files.push(join(cases, name));
    }
  }
  const hrefs = new Set();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/href:\s*["']?(https?:\/\/[^\s"']+)/g)) {
      hrefs.add(match[1]);
    }
  }
  return [...hrefs];
}

export function hostOf(href) {
  try {
    return new URL(href).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function faviconUrls(host) {
  const safe = encodeURIComponent(host);
  return [
    `https://www.google.com/s2/favicons?domain=${safe}&sz=64`,
    `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(`https://${host}`)}`,
    `https://icons.duckduckgo.com/ip3/${safe}.ico`,
    `https://${host}/favicon.ico`,
  ];
}

export function isImageBuffer(buf) {
  if (!buf || buf.length < 24) return false;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
  if (buf[0] === 0x52 && buf[8] === 0x57 && buf[9] === 0x45) return true;
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return true;
  return false;
}

function syncPublic(host, cacheDir, publicDir) {
  const dest = join(cacheDir, `${host}.png`);
  const pub = join(publicDir, `${host}.png`);
  if (!existsSync(dest)) return existsSync(pub);
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(dest, pub);
  return true;
}

const FETCH_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GvastePages/1.0",
  accept: "image/png,image/webp,image/*,*/*;q=0.8",
};

async function fetchBuffer(url, fetchImpl, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal, headers: FETCH_HEADERS, redirect: "follow" });
    if (!res?.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return isImageBuffer(buf) ? buf : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchOne(host, options = {}) {
  const cacheDir = options.cacheDir ?? DEFAULT_CACHE;
  const publicDir = options.publicDir ?? DEFAULT_PUBLIC;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? FETCH_MS;
  if (syncPublic(host, cacheDir, publicDir) && !options.force) return true;
  for (const url of faviconUrls(host)) {
    const buf = await fetchBuffer(url, fetchImpl, timeoutMs);
    if (!buf) continue;
    mkdirSync(cacheDir, { recursive: true });
    mkdirSync(publicDir, { recursive: true });
    const dest = join(cacheDir, `${host}.png`);
    writeFileSync(dest, buf);
    copyFileSync(dest, join(publicDir, `${host}.png`));
    return true;
  }
  return syncPublic(host, cacheDir, publicDir);
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => run());
  await Promise.all(workers);
  return results;
}

export async function prefetchFavicons(options = {}) {
  const root = options.root ?? ROOT;
  const cacheDir = options.cacheDir ?? join(root, ".cache", "favicons");
  const publicDir = options.publicDir ?? join(root, "public", "assets", "favicons");
  const hosts = [...new Set(collectHrefs(root).map(hostOf).filter(Boolean))];
  const results = await mapLimit(hosts, options.concurrency ?? CONCURRENCY, (host) =>
    fetchOne(host, { ...options, cacheDir, publicDir }),
  );
  const ok = results.filter(Boolean).length;
  return { ok, total: hosts.length, hosts };
}

const isMain =
  Boolean(process.argv[1]) && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const result = await prefetchFavicons();
  console.log(`Favicons cached ${result.ok}/${result.total}`);
}
