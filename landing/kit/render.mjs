// Shared Gvaste Pages rendering engine: templates, view preparation, and section HTML.
// Consumed by the Astro renderer and Studio.
import { parse as parseYaml } from "yaml";
import { renderMarkdown } from "./markdown.mjs";
import { fileUrlToPath, lookupVirtualFile, posixDirname, posixJoin, posixPath, resolveEngineIo } from "./io.mjs";
import {
  buildPreviewDocument,
  detectLang,
  fileNameFor,
  highlightLines,
  isLiveLang,
  isTerminalLang,
  langLabel,
} from "./js/modules/highlight.mjs";
import { isHexColor, resolveAccent } from "./accent.mjs";
import {
  ARROW_KEYS,
  MAC_LAYOUTS,
  NAV_ISLAND,
  NUMPAD_KEYS,
  commandsKeyboardLayout,
  getKeyboardLayout,
} from "./keyboard-layouts.mjs";
import { parseGithubRepo, prepareGithub as prepareGithubSection } from "./github.mjs";
import { SCHEMA, V1_NAV_LABELS, V1_PRESET_IDS, V1_SECTION_IDS } from "./v1-contract.mjs";

export { commandsKeyboardLayout, LAYOUT_CATALOG, LAYOUT_ENUM, MAC_LAYOUTS } from "./keyboard-layouts.mjs";
export { SCHEMA, V1_NAV_LABELS, V1_PRESET_IDS, V1_SECTION_IDS } from "./v1-contract.mjs";

let io = resolveEngineIo();
const join = (...parts) => io.join(...parts);
const dirname = (path) => io.dirname(path);
const resolve = (...parts) => io.resolve(...parts);
const readFileSync = (path, encoding) => io.readFileSync(path, encoding);
const writeFileSync = (path, data) => io.writeFileSync(path, data);
const mkdirSync = (path, options) => io.mkdirSync(path, options);
const existsSync = (path) => io.existsSync(path);
const execFileSync = (command, args, options) => io.execFileSync(command, args, options);
const copyFileSync = (from, to) => io.copyFileSync(from, to);

const ENV = typeof process === "undefined" ? Object.create(null) : process.env ?? Object.create(null);
const ROOT_DEFAULT = ENV.GVASTE_ROOT ?? posixJoin(posixDirname(fileUrlToPath(import.meta.url)), "..");
let ROOT = ROOT_DEFAULT;
let KIT = posixJoin(ROOT, "kit");
let CHROME = posixJoin(KIT, "chrome");

let virtualFiles = null;
let githubProvider = null;
let contentRoot = ROOT_DEFAULT;

function virtualLookup(path) {
  return lookupVirtualFile(virtualFiles, path);
}

export function configureEngine(options = {}) {
  io = resolveEngineIo(options);
  virtualFiles = options.files ?? null;
  githubProvider = typeof options.github === "function" ? options.github : options.github ? () => options.github : null;
  if (virtualFiles) {
    ROOT = "";
    KIT = "kit";
    CHROME = "kit/chrome";
    contentRoot = "";
  } else {
    ROOT = ROOT_DEFAULT;
    KIT = join(ROOT, "kit");
    CHROME = join(KIT, "chrome");
    contentRoot = ROOT_DEFAULT;
  }
}

const PRESETS = V1_PRESET_IDS;
const SECTIONS = V1_SECTION_IDS;
const NAV_LABELS = V1_NAV_LABELS;
function githubCtx() {
  return {
    root: ROOT,
    env: ENV,
    io: { readFileSync, writeFileSync, mkdirSync, dirname, join, execFileSync },
    provider: githubProvider,
    titleHtml,
  };
}

function fail(message) {
  throw new Error(`[gvaste-pages] ${message}`);
}

function read(path) {
  const virtual = virtualLookup(path);
  if (virtual !== undefined) return virtual;
  return readFileSync(path, "utf8");
}

function exists(path) {
  if (virtualLookup(path) !== undefined) return true;
  if (virtualFiles) return false;
  return existsSync(path);
}

function loadYaml(path) {
  return parseYaml(read(path)) ?? {};
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  const slug = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "item";
}

function docsTitle(item) {
  return String(item?.title ?? item?.label ?? "").trim();
}

function docsBody(item) {
  return String(item?.body ?? item?.note ?? "").trim();
}

function docsFilledIcon(d, className = "") {
  const cls = className ? ` class="${className}"` : "";
  return `<svg${cls} viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
}

function docsStrokeIcon(paths, className = "") {
  const cls = className ? ` class="${className}"` : "";
  return `<svg${cls} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const DOCS_ICON = {
  folderClosed:
    "M9 3a1 1 0 0 1 .608 .206l.1 .087l2.706 2.707h6.586a3 3 0 0 1 2.995 2.824l.005 .176v8a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-11a3 3 0 0 1 2.824 -2.995l.176 -.005h4z",
  folderOpen:
    "M3 6a3 3 0 0 1 3 -3h4.172a3 3 0 0 1 2.12 .879l1.83 1.828a1 1 0 0 0 .707 .293h5.171a3 3 0 0 1 3 3v1h-21v-4zm-.8 6h19.6l-1.62 6.074a3 3 0 0 1 -2.91 2.226h-10.54a3 3 0 0 1 -2.91 -2.226z",
  file: "M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z",
  markdown:
    "M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3 14h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m-5 -4h-1a1 1 0 1 0 0 2h1a1 1 0 0 0 0 -2",
  link: '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/>',
};

function blobHref(repo, file) {
  if (!repo || !file) return "";
  return `${String(repo).replace(/\/$/, "")}/blob/main/${posixPath(file).replace(/^\.\//, "")}`;
}

function fileLinkBase(repo, file, fallback) {
  if (fallback && !file) return fallback;
  if (!repo) return fallback || "";
  const root = `${String(repo).replace(/\/$/, "")}/blob/main/`;
  if (!file) return root;
  const dir = posixPath(dirname(file)).replace(/^\.\/?$/, "");
  if (!dir || dir === ".") return root;
  return `${root}${dir}/`;
}

function fileFromHref(href) {
  const raw = String(href ?? "").trim();
  if (!raw) return "";
  const blob = raw.match(/github\.com\/[^/]+\/[^/]+\/(?:blob|raw)\/[^/]+\/(.+\.md)(?:$|\?|#)/i);
  if (blob) return blob[1];
  if (/^https?:\/\//i.test(raw) || raw.startsWith("#") || raw.endsWith("/")) return "";
  if (/\.md$/i.test(raw)) return raw.replace(/^\.\//, "");
  return "";
}

function readDocFile(rel) {
  const posix = posixPath(rel).replace(/^\.\//, "");
  const candidates = [posix];
  if (contentRoot) candidates.push(posixPath(join(contentRoot, posix)));
  if (ROOT) candidates.push(posixPath(join(ROOT, posix)));
  const seen = new Set();
  for (const path of candidates) {
    if (seen.has(path)) continue;
    seen.add(path);
    if (exists(path)) return { file: posix, markdown: read(path) };
  }
  return null;
}

// Inline an SVG from the site folder so its parts can be animated. Ids get a prefix
// so two copies of the same drawing on one page do not collide.
function inlineSvgAsset(rel, prefix) {
  const posix = posixPath(String(rel ?? "").trim()).replace(/^\.\//, "");
  if (!posix || !/\.svg$/i.test(posix)) return "";
  const candidates = [contentRoot && posixPath(join(contentRoot, posix)), ROOT && posixPath(join(ROOT, posix)), posix].filter(Boolean);
  const path = candidates.find((candidate) => exists(candidate));
  if (!path) throw new Error(`brand.mascot not found: ${posix}`);
  let svg = read(path)
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<title[^>]*>[\s\S]*?<\/title>/g, "")
    .replace(/<desc[^>]*>[\s\S]*?<\/desc>/g, "")
    .replace(/\s*aria-labelledby="[^"]*"/g, "")
    .trim();
  for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) {
    svg = svg
      .split(`id="${id}"`).join(`id="${prefix}-${id}"`)
      .split(`url(#${id})`).join(`url(#${prefix}-${id})`)
      .split(`href="#${id}"`).join(`href="#${prefix}-${id}"`);
  }
  return svg.replace(/^<svg\b[^>]*>/, (tag) => {
    let open = tag;
    if (!/\saria-hidden=/.test(open)) open = open.replace(/^<svg\b/, '<svg aria-hidden="true"');
    if (!/\sfocusable=/.test(open)) open = open.replace(/^<svg\b/, '<svg focusable="false"');
    return open;
  });
}

function uniqueDocSlug(base, used) {
  let slug = slugify(base);
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let n = 2;
  while (used.has(`${slug}-${n}`)) n += 1;
  slug = `${slug}-${n}`;
  used.add(slug);
  return slug;
}

function validateDocsItem(item, path) {
  requireValue(docsTitle(item), `${path}.title`);
  const children = item?.items;
  if (Array.isArray(children) && children.length) {
    children.forEach((child, index) => validateDocsItem(child, `${path}.items[${index}]`));
    return;
  }
  const has =
    String(item?.href ?? "").trim() ||
    String(item?.file ?? "").trim() ||
    String(item?.markdown ?? "").trim() ||
    docsBody(item);
  if (!has) fail(`${path} needs href, file, markdown, or body`);
}

function prepareDocLeaf(item, used, repo, linkBase) {
  const title = docsTitle(item);
  const body = docsBody(item);
  const authoredFile = String(item.file ?? "").trim();
  const hrefFile = fileFromHref(item.href);
  const loaded = authoredFile ? readDocFile(authoredFile) : hrefFile ? readDocFile(hrefFile) : null;
  const markdown = String(item.markdown ?? loaded?.markdown ?? "");
  const file = loaded?.file || authoredFile || hrefFile;
  const href = String(item.href ?? "").trim() || blobHref(repo, file);
  const slug = uniqueDocSlug(file || title, used);
  const kind = markdown ? "md" : "link";
  const html = markdown ? renderMarkdown(markdown, { linkBase: fileLinkBase(repo, file, linkBase) }) : "";
  return {
    id: slug,
    title,
    body,
    file,
    href,
    kind,
    pathLabel: file || href || title,
    html,
  };
}

function countDocLeaves(item) {
  if (Array.isArray(item?.items) && item.items.length) {
    return item.items.reduce((sum, child) => sum + countDocLeaves(child), 0);
  }
  return 1;
}

function renderDocsTree(items, used, repo, linkBase, pages, depth = 0) {
  if (!Array.isArray(items) || !items.length) return "";
  const inner = items
    .map((item) => {
      const children = Array.isArray(item.items) ? item.items : [];
      if (children.length) {
        const title = docsTitle(item);
        const count = children.reduce((sum, child) => sum + countDocLeaves(child), 0);
        return `<li class="docs-tree__node docs-tree__node--folder">
          <details class="docs-tree__folder" open>
            <summary class="docs-tree__summary">
              <span class="docs-tree__icon docs-tree__icon--folder">
                ${docsFilledIcon(DOCS_ICON.folderClosed, "docs-tree__mark docs-tree__mark--closed")}
                ${docsFilledIcon(DOCS_ICON.folderOpen, "docs-tree__mark docs-tree__mark--open")}
              </span>
              <span class="docs-tree__name">${escapeHtml(title)}</span>
              <span class="docs-tree__count">${count}</span>
            </summary>
            <div class="docs-tree__fold">
              ${renderDocsTree(children, used, repo, linkBase, pages, depth + 1)}
            </div>
          </details>
        </li>`;
      }
      const leaf = prepareDocLeaf(item, used, repo, linkBase);
      const selected = pages.length === 0;
      pages.push({ ...leaf, selected });
      const icon =
        leaf.kind === "md"
          ? docsFilledIcon(DOCS_ICON.markdown)
          : leaf.href
            ? docsStrokeIcon(DOCS_ICON.link)
            : docsFilledIcon(DOCS_ICON.file);
      const current = selected ? ' aria-current="page"' : "";
      return `<li class="docs-tree__node">
        <button type="button" class="docs-tree__file${selected ? " is-active" : ""}" id="docs-nav-${escapeHtml(leaf.id)}" data-doc="${escapeHtml(leaf.id)}" data-docs-path="${escapeHtml(leaf.pathLabel)}" data-docs-href="${escapeHtml(leaf.href)}" data-docs-title="${escapeHtml(leaf.title)}"${current}>
          <span class="docs-tree__icon">${icon}</span>
          <span class="docs-tree__name">${escapeHtml(leaf.title)}</span>
        </button>
      </li>`;
    })
    .join("");
  return `<ul class="docs-tree__list"${depth === 0 ? ' role="list"' : ""}>${inner}</ul>`;
}

function renderDocsPages(pages) {
  return pages
    .map((page) => {
      const hidden = page.selected ? "" : " hidden";
      if (page.kind === "md") {
        return `<article class="docs-page" id="doc-${escapeHtml(page.id)}" data-doc="${escapeHtml(page.id)}" data-docs-kind="md" data-docs-scroll tabindex="0"${hidden}>
          <div class="docs-md">${page.html}</div>
        </article>`;
      }
      const body = page.body ? `<p>${escapeHtml(page.body)}</p>` : "";
      const action = page.href
        ? `<p><a class="button" href="${escapeHtml(page.href)}">${escapeHtml(page.title)}</a></p>`
        : "";
      return `<article class="docs-page docs-page--link" id="doc-${escapeHtml(page.id)}" data-doc="${escapeHtml(page.id)}" data-docs-kind="link" data-docs-scroll tabindex="0"${hidden}>
        <div class="docs-destination">
          <p class="docs-destination__kicker">Open</p>
          <h3>${escapeHtml(page.title)}</h3>
          ${body}
          ${action}
        </div>
      </article>`;
    })
    .join("");
}

function prepareDocs(site) {
  if (!site.docs) return undefined;
  const repo = site.project?.repo ?? "";
  const used = new Set();
  const pages = [];
  const items = Array.isArray(site.docs.items) ? site.docs.items : [];
  const linkBase = repo ? `${String(repo).replace(/\/$/, "")}/blob/main/` : "";
  const treeHtml = renderDocsTree(items, used, repo, linkBase, pages);
  const first = pages[0];
  return {
    kicker: site.docs.kicker,
    title: site.docs.title,
    lede: site.docs.lede,
    source: site.docs.source,
    titleHtml: titleHtml(site.docs.title),
    treeHtml,
    pagesHtml: renderDocsPages(pages),
    firstId: first?.id ?? "",
    firstPath: first?.pathLabel ?? "",
    firstHref: first?.href ?? "",
    firstTitle: first?.title ?? "",
    count: pages.length,
  };
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function faqQuestion(item) {
  return String(item?.question ?? item?.title ?? "").trim();
}

function faqAnswer(item) {
  return String(item?.answer ?? item?.body ?? "").trim();
}

function titleLines(value) {
  return escapeHtml(value ?? "")
    .replaceAll("\r\n", "\n")
    .replaceAll("\\n", "\n")
    .split("\n")
    .map((line) => line.replaceAll(/\s+/g, " ").trim())
    .filter(Boolean);
}

function titleHtml(value) {
  return titleLines(value).join("<br>");
}

function titleLine(value) {
  return titleLines(value).join(" ");
}

function accentTitle(html, accent) {
  const needle = escapeHtml(String(accent ?? "").trim());
  if (!needle) return html;
  const at = html.indexOf(needle);
  if (at === -1) return html;
  return `${html.slice(0, at)}<span class="hero-accent">${needle}</span>${html.slice(at + needle.length)}`;
}

function demoImage(view) {
  const image = view?.image;
  if (!image) return { src: "", alt: "" };
  if (typeof image === "string") return { src: image, alt: String(view.title ?? "") };
  return {
    src: String(image.src ?? "").trim(),
    alt: String(image.alt ?? view.title ?? ""),
  };
}

function aboutFeatureImage(item) {
  const image = item?.image;
  if (!image || typeof image === "string") {
    const src = typeof image === "string" ? image.trim() : "";
    if (!src) return null;
    return { src, alt: String(item?.title ?? "").trim() };
  }
  const src = String(image.src ?? "").trim();
  if (!src) return null;
  return {
    src,
    alt: String(image.alt ?? "").trim(),
  };
}

function prepareAboutFeature(item, index) {
  const image = aboutFeatureImage(item);
  const html = String(item?.html ?? "").trim();
  const hasImage = Boolean(image?.src);
  const hasHtml = Boolean(html) && !hasImage;
  return {
    ...item,
    html,
    image: image ?? { src: "", alt: "" },
    hasImage,
    hasHtml,
    kind: hasImage ? "image" : "html",
    tablerSvg: loadTablerSvg(item.tabler),
    tabId: `about-tab-${index}`,
    panelId: `about-panel-${index}`,
    on: index === 0,
    selected: index === 0 ? "true" : "false",
    tabIndex: index === 0 ? "0" : "-1",
    hidden: index !== 0,
  };
}

function promptLeadHtml(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";
  return raw
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function prepareDemoView(view, index, theme) {
  const code = String(view.code ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
  const preview = String(view.preview ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
  const css = String(view.css ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
  const lang = detectLang(code, view.lang, view.file);
  const image = demoImage(view);
  let previewKind = "reading";
  if (preview.trim() || (code.trim() && isLiveLang(lang))) previewKind = "live";
  else if (image.src) previewKind = "image";
  else if (code.trim() && isTerminalLang(lang)) previewKind = "terminal";
  else if (code.trim()) previewKind = "file";
  const live = previewKind === "live";
  const hasSource = Boolean(code.trim());
  const hasPreview = live || previewKind === "image" || previewKind === "reading";
  const srcdoc = live
    ? buildPreviewDocument({
        code,
        lang,
        preview: preview.trim() || undefined,
        css,
        theme,
      })
    : "";
  const titleText = String(view.title ?? "").trim();
  const bodyText = String(view.body ?? "").trim();
  const authoredPrompt = String(view.prompt ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "").trim();
  const promptText = authoredPrompt || [titleText, bodyText, code.trim() ? `\`\`\`${lang}\n${code}\n\`\`\`` : ""]
    .filter(Boolean)
    .join("\n\n");
  const leadText = authoredPrompt || [titleText, bodyText].filter(Boolean).join("\n\n");
  return {
    ...view,
    index,
    first: index === 0,
    lang,
    langLabel: langLabel(lang),
    file: fileNameFor({ ...view, lang }),
    hasSource,
    hasPreview,
    previewKind,
    live,
    isImage: previewKind === "image",
    isFile: previewKind === "file",
    isTerminal: previewKind === "terminal",
    isReading: previewKind === "reading",
    imageSrc: image.src,
    imageAlt: image.alt,
    codeHighlighted: code.trim() ? highlightLines(code, lang) : "",
    previewSrcdoc: srcdoc,
    promptText,
    promptLeadHtml: promptLeadHtml(leadText),
  };
}

const KEYCAP_MOD = new Set([
  "ctrl",
  "control",
  "alt",
  "option",
  "opt",
  "shift",
  "tab",
  "caps",
  "capslock",
  "enter",
  "return",
  "backspace",
  "win",
  "windows",
  "cmd",
  "command",
  "meta",
  "space",
  "esc",
  "escape",
  "fn",
  "ins",
  "insert",
  "del",
  "delete",
  "home",
  "end",
  "pgup",
  "pageup",
  "pgdn",
  "pagedown",
  "numlock",
  "num lock",
  "printscreen",
  "print screen",
  "scrolllock",
  "scroll lock",
  "pause",
]);

function keycapsHtml(value) {
  const esc = escapeHtml(String(value ?? "").trim());
  if (!esc) return "";
  return esc
    .split(/(\+|…)/)
    .map((part) => {
      const token = part.trim();
      if (!token) return "";
      if (token === "+" || token === "…") return `<span class="key-sep" aria-hidden="true">${token}</span>`;
      const id = normalizeCommandKey(token);
      if (!id) return `<kbd>${token}</kbd>`;
      const isMod = KEYCAP_MOD.has(token.toLowerCase()) || KEYCAP_MOD.has(id);
      return `<kbd class="kb-key${isMod ? " kb-mod" : ""}"><span>${token}</span></kbd>`;
    })
    .join("");
}

const KEY_ALIASES = new Map([
  ["ctrl", "control"],
  ["control", "control"],
  ["ctl", "control"],
  ["alt", "alt"],
  ["option", "alt"],
  ["opt", "alt"],
  ["shift", "shift"],
  ["cmd", "meta"],
  ["command", "meta"],
  ["meta", "meta"],
  ["win", "meta"],
  ["windows", "meta"],
  ["super", "meta"],
  ["gui", "meta"],
  ["esc", "escape"],
  ["escape", "escape"],
  ["enter", "enter"],
  ["return", "enter"],
  ["ret", "enter"],
  ["space", "space"],
  ["spacebar", "space"],
  ["tab", "tab"],
  ["backspace", "backspace"],
  ["bksp", "backspace"],
  ["back", "backspace"],
  ["del", "delete"],
  ["delete", "delete"],
  ["ins", "insert"],
  ["insert", "insert"],
  ["home", "home"],
  ["end", "end"],
  ["pgup", "pageup"],
  ["pageup", "pageup"],
  ["page up", "pageup"],
  ["pgdn", "pagedown"],
  ["pagedown", "pagedown"],
  ["page down", "pagedown"],
  ["caps", "capslock"],
  ["capslock", "capslock"],
  ["caps lock", "capslock"],
  ["fn", "fn"],
  ["up", "up"],
  ["down", "down"],
  ["left", "left"],
  ["right", "right"],
  ["arrowup", "up"],
  ["arrowdown", "down"],
  ["arrowleft", "left"],
  ["arrowright", "right"],
  ["arrow up", "up"],
  ["arrow down", "down"],
  ["arrow left", "left"],
  ["arrow right", "right"],
  ["↑", "up"],
  ["↓", "down"],
  ["←", "left"],
  ["→", "right"],
  ["printscreen", "printscreen"],
  ["print screen", "printscreen"],
  ["prtsc", "printscreen"],
  ["prtscr", "printscreen"],
  ["prt sc", "printscreen"],
  ["sysrq", "printscreen"],
  ["scrolllock", "scrolllock"],
  ["scroll lock", "scrolllock"],
  ["scrlk", "scrolllock"],
  ["pause", "pause"],
  ["break", "pause"],
  ["numlock", "numlock"],
  ["num lock", "numlock"],
  ["numenter", "npenter"],
  ["num enter", "npenter"],
  ["kpenter", "npenter"],
  ["npenter", "npenter"],
  ["numdiv", "npdiv"],
  ["num /", "npdiv"],
  ["kpdiv", "npdiv"],
  ["npdiv", "npdiv"],
  ["nummul", "npmul"],
  ["num *", "npmul"],
  ["kpmul", "npmul"],
  ["npmul", "npmul"],
  ["numsub", "npsub"],
  ["num -", "npsub"],
  ["kpsub", "npsub"],
  ["npsub", "npsub"],
  ["numadd", "npadd"],
  ["num +", "npadd"],
  ["kpadd", "npadd"],
  ["npadd", "npadd"],
  ["numdot", "npdot"],
  ["num .", "npdot"],
  ["kpdot", "npdot"],
  ["npdot", "npdot"],
  ["num0", "np0"],
  ["num 0", "np0"],
  ["kp0", "np0"],
  ["keypad 0", "np0"],
  ["numpad 0", "np0"],
  ["np0", "np0"],
  ["num1", "np1"],
  ["num 1", "np1"],
  ["kp1", "np1"],
  ["keypad 1", "np1"],
  ["numpad 1", "np1"],
  ["np1", "np1"],
  ["num2", "np2"],
  ["num 2", "np2"],
  ["kp2", "np2"],
  ["keypad 2", "np2"],
  ["numpad 2", "np2"],
  ["np2", "np2"],
  ["num3", "np3"],
  ["num 3", "np3"],
  ["kp3", "np3"],
  ["keypad 3", "np3"],
  ["numpad 3", "np3"],
  ["np3", "np3"],
  ["num4", "np4"],
  ["num 4", "np4"],
  ["kp4", "np4"],
  ["keypad 4", "np4"],
  ["numpad 4", "np4"],
  ["np4", "np4"],
  ["num5", "np5"],
  ["num 5", "np5"],
  ["kp5", "np5"],
  ["keypad 5", "np5"],
  ["numpad 5", "np5"],
  ["np5", "np5"],
  ["num6", "np6"],
  ["num 6", "np6"],
  ["kp6", "np6"],
  ["keypad 6", "np6"],
  ["numpad 6", "np6"],
  ["np6", "np6"],
  ["num7", "np7"],
  ["num 7", "np7"],
  ["kp7", "np7"],
  ["keypad 7", "np7"],
  ["numpad 7", "np7"],
  ["np7", "np7"],
  ["num8", "np8"],
  ["num 8", "np8"],
  ["kp8", "np8"],
  ["keypad 8", "np8"],
  ["numpad 8", "np8"],
  ["np8", "np8"],
  ["num9", "np9"],
  ["num 9", "np9"],
  ["kp9", "np9"],
  ["keypad 9", "np9"],
  ["numpad 9", "np9"],
  ["np9", "np9"],
]);

const KEY_PUNCT = new Map([
  ["`", "backtick"],
  ["~", "backtick"],
  ["-", "minus"],
  ["_", "minus"],
  ["=", "equal"],
  ["[", "lbracket"],
  ["{", "lbracket"],
  ["]", "rbracket"],
  ["}", "rbracket"],
  ["\\", "backslash"],
  ["|", "backslash"],
  [";", "semicolon"],
  [":", "semicolon"],
  ["'", "quote"],
  ['"', "quote"],
  [",", "comma"],
  ["<", "comma"],
  [".", "period"],
  [">", "period"],
  ["/", "slash"],
  ["?", "slash"],
]);

function normalizeCommandKey(token) {
  const t = String(token ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!t) return null;
  if (KEY_ALIASES.has(t)) return KEY_ALIASES.get(t);
  const compact = t.replace(/[\s-]/g, "");
  if (KEY_ALIASES.has(compact)) return KEY_ALIASES.get(compact);
  if (/^f([1-9]|1[0-2])$/.test(compact)) return compact;
  if (/^[a-z0-9]$/.test(t)) return t;
  if (KEY_PUNCT.has(t)) return KEY_PUNCT.get(t);
  return null;
}

function expandKeyRange(start, end) {
  const a = String(start).trim().toLowerCase();
  const b = String(end).trim().toLowerCase();
  if (!/^[a-z0-9]$/.test(a) || !/^[a-z0-9]$/.test(b)) return null;
  const aDigit = /[0-9]/.test(a);
  const bDigit = /[0-9]/.test(b);
  if (aDigit !== bDigit) return null;
  const from = a.charCodeAt(0);
  const to = b.charCodeAt(0);
  if (to < from || to - from > 15) return null;
  const ids = [];
  for (let code = from; code <= to; code += 1) ids.push(String.fromCharCode(code));
  return ids;
}

export function commandKeyIds(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  const ids = [];
  const seen = new Set();
  const add = (id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };
  for (const chord of raw.split("+")) {
    const piece = chord.trim();
    if (!piece) continue;
    const ends = piece
      .split(/\s*(?:…|\.{3})\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (ends.length === 2) {
      const expanded = expandKeyRange(ends[0], ends[1]);
      if (expanded) {
        expanded.forEach(add);
        continue;
      }
    }
    add(normalizeCommandKey(piece));
  }
  return ids;
}

const KB_MOD = new Set([
  "tab",
  "enter",
  "caps",
  "backspace",
  "lshift",
  "rshift",
  "lctrl",
  "rctrl",
  "lalt",
  "ralt",
  "lwin",
  "rwin",
  "rctx",
  "escape",
  "delete",
  "insert",
  "home",
  "end",
  "pageup",
  "pagedown",
  "fn",
  "numlock",
  "printscreen",
  "scrolllock",
  "pause",
  "npenter",
]);

const FN_KEY = /^f([1-9]|1[0-2])$/;

const WIN_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 20l-12 -1.5c-1 -.1 -1.8 -.9 -1.8 -1.9v-9.2c0 -1 .8 -1.8 1.8 -1.9l12 -1.5c1.2 -.1 2.2 .8 2.2 1.9v13.1c0 1.2 -1.1 2.1 -2.2 1.9z"/><path d="M12 5v14"/><path d="M4 12h16"/></svg>';

function kbKey(bound, spec, opts = {}) {
  const item = typeof spec === "string" ? { key: spec } : spec;
  const key = String(item.key);
  const bind = item.bind ?? key;
  const isFn = item.fn === true || FN_KEY.test(key);
  const cls = [
    "kb-key",
    isFn ? "kb-fn" : "",
    item.mod === true || KB_MOD.has(key) ? "kb-mod" : "",
    bound.has(bind) ? "is-bound" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const bindAttr = bind !== key ? ` data-bind="${escapeHtml(bind)}"` : "";
  const altAttr = item.alt != null && item.alt !== "" ? ` data-alt="${escapeHtml(item.alt)}"` : "";
  const areaAttr = item.area ? ` data-area="${escapeHtml(item.area)}"` : "";
  const styleBits = [];
  if (opts.unitWidth) styleBits.push(`--kw:${item.width ?? 1}`);
  if (item.area) styleBits.push(`grid-area:${item.area}`);
  const styleAttr = styleBits.length ? ` style="${styleBits.join(";")}"` : "";
  const inner = key === "lwin" || key === "rwin" ? WIN_ICON : "";
  const dish = opts.tactile ? `<span class="kb-dish" aria-hidden="true"></span>` : "";
  const home = opts.tactile && (key === "f" || key === "j") ? `<span class="kb-home" aria-hidden="true"></span>` : "";
  return `<kbd class="${cls}" data-key="${escapeHtml(key)}"${bindAttr}${altAttr}${areaAttr}${styleAttr}>${inner}${dish}${home}</kbd>`;
}

function kbRow(inner) {
  return `<div class="keyboard__row">${inner}</div>`;
}

function kbLetters(bound, letters, opts = {}) {
  return [...String(letters)].map((ch) => kbKey(bound, ch, opts)).join("");
}

function keyboardHtml(boundIds, opts = {}) {
  const bound = boundIds instanceof Set ? boundIds : new Set(boundIds);
  const k = (spec) => kbKey(bound, spec, opts);
  const numbers = [
    k({ key: "`", bind: "backtick", alt: "~" }),
    k({ key: "1", alt: "!" }),
    k({ key: "2", alt: "@" }),
    k({ key: "3", alt: "#" }),
    k({ key: "4", alt: "$" }),
    k({ key: "5", alt: "%" }),
    k({ key: "6", alt: "^" }),
    k({ key: "7", alt: "&" }),
    k({ key: "8", alt: "*" }),
    k({ key: "9", alt: "(" }),
    k({ key: "0", alt: ")" }),
    k({ key: "-", bind: "minus", alt: "_" }),
    k({ key: "=", bind: "equal", alt: "+" }),
    k("backspace"),
  ].join("");
  const upper = [
    k("tab"),
    kbLetters(bound, "qwertyuiop", opts),
    k({ key: "[", bind: "lbracket", alt: "{" }),
    k({ key: "]", bind: "rbracket", alt: "}" }),
    k({ key: "\\", bind: "backslash", alt: "|" }),
  ].join("");
  const home = [
    k({ key: "caps", bind: "capslock" }),
    kbLetters(bound, "asdfghjkl", opts),
    k({ key: ";", bind: "semicolon", alt: ":" }),
    k({ key: "'", bind: "quote", alt: '"' }),
    k("enter"),
  ].join("");
  const shift = [
    k({ key: "lshift", bind: "shift" }),
    kbLetters(bound, "zxcvbnm", opts),
    k({ key: ",", bind: "comma", alt: "<" }),
    k({ key: ".", bind: "period", alt: ">" }),
    k({ key: "/", bind: "slash", alt: "?" }),
    k({ key: "rshift", bind: "shift" }),
  ].join("");
  const bottom = [
    k({ key: "lctrl", bind: "control" }),
    k({ key: "lwin", bind: "meta" }),
    k({ key: "lalt", bind: "alt" }),
    k("space"),
    k({ key: "ralt", bind: "alt" }),
    k({ key: "rwin", bind: "meta" }),
    k("rctx"),
    k({ key: "rctrl", bind: "control" }),
  ].join("");
  const rootClass = opts.tactile ? "keyboard keyboard--schematic" : "keyboard";
  return `<div class="${rootClass}" data-keyboard aria-hidden="true">
    <div class="keyboard__board">
      ${kbRow(numbers)}
      ${kbRow(upper)}
      ${kbRow(home)}
      ${kbRow(shift)}
      ${kbRow(bottom)}
    </div>
  </div>`;
}

const MAC_KEYBOARDS = new Set(["mac", "macos", "apple", "darwin"]);
const WINDOWS_KEYBOARDS = new Set(["windows", "pc", "default", ""]);
const TERMINAL_KEYBOARDS = new Set(["terminal", "tty", "tui", "phosphor"]);
const SCHEMATIC_KEYBOARDS = new Set(["schematic", "legend", "diagram", "blueprint"]);

export function commandsKeyboardKind(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (WINDOWS_KEYBOARDS.has(raw)) return "windows";
  if (MAC_KEYBOARDS.has(raw)) return "mac";
  if (TERMINAL_KEYBOARDS.has(raw)) return "terminal";
  if (SCHEMATIC_KEYBOARDS.has(raw)) return "schematic";
  return null;
}

const macSvg = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const MAC_ICON = {
  sun: macSvg(
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  ),
  moon: macSvg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
  grid: macSvg(
    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  ),
  search: macSvg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  mic: macSvg(
    '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  ),
  skipBack: macSvg('<polygon points="19 20 9 12 19 4 19 20" fill="currentColor" stroke="none"/><line x1="5" x2="5" y1="19" y2="5"/>'),
  play: macSvg('<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>'),
  skipForward: macSvg(
    '<polygon points="5 4 15 12 5 20 5 4" fill="currentColor" stroke="none"/><line x1="19" x2="19" y1="5" y2="19"/>',
  ),
  volMute: macSvg(
    '<path d="M11 5 6 9H2v6h4l5 4z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
  ),
  volLow: macSvg('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'),
  volHigh: macSvg(
    '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  ),
  lock: macSvg('<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  globe: macSvg('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),
  chevron: macSvg('<path d="m18 15-6-6-6 6"/>'),
  option: macSvg('<path d="M3 3h6l6 18h6"/><path d="M14 3h7"/>'),
  command: macSvg('<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>'),
  left: macSvg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),
  up: macSvg('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'),
  down: macSvg('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
  right: macSvg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
};

function macKeyInner(item) {
  if (item.icon && item.fnLabel) {
    return `<span class="kb-icon">${item.icon}</span><span class="kb-fn-id">${escapeHtml(item.fnLabel)}</span>`;
  }
  if (item.sub) {
    return `<span class="kb-shift">${escapeHtml(item.sub)}</span><span class="kb-main">${escapeHtml(item.label)}</span>`;
  }
  if (item.icon && item.label) {
    return `<span class="kb-icon">${item.icon}</span><span class="kb-label">${item.label}</span>`;
  }
  if (item.led) {
    return `<span class="kb-led"></span><span class="kb-label">${escapeHtml(item.label)}</span>`;
  }
  if (item.icon) return `<span class="kb-icon">${item.icon}</span>`;
  if (item.label != null) {
    const cls = String(item.label).length === 1 ? "kb-main" : "kb-label";
    return `<span class="${cls}">${escapeHtml(item.label)}</span>`;
  }
  return "";
}

function macKey(bound, spec) {
  const item = typeof spec === "string" ? { key: spec, label: spec } : spec;
  const key = String(item.key);
  const bind = item.bind ?? key;
  const binds = String(bind).split(/\s+/).filter(Boolean);
  const width = item.width ?? 1;
  const cls = [
    "kb-key",
    item.mod ? "kb-mod" : "",
    width !== 1 || item.half ? "kb-wide" : "",
    item.half ? "kb-half" : "",
    item.fn ? "kb-fn" : "",
    item.stack ? "kb-stack" : "",
    binds.some((id) => bound.has(id)) ? "is-bound" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const bindAttr = bind !== key ? ` data-bind="${escapeHtml(bind)}"` : "";
  const areaAttr = item.area ? ` data-area="${escapeHtml(item.area)}"` : "";
  const styleBits = [`--kw:${width}`];
  if (item.area) styleBits.push(`grid-area:${item.area}`);
  return `<kbd class="${cls}" data-key="${escapeHtml(key)}"${bindAttr}${areaAttr} style="${styleBits.join(";")}">${macKeyInner(item)}</kbd>`;
}

function macLetters(bound, letters) {
  return [...String(letters)]
    .map((ch) => macKey(bound, { key: ch, label: ch.toUpperCase() }))
    .join("");
}

function macKeyboardHtml(boundIds) {
  const bound = boundIds instanceof Set ? boundIds : new Set(boundIds);
  const k = (spec) => macKey(bound, spec);
  const fn = (id, icon) =>
    k({ key: id, bind: id, width: 1, fn: true, icon, fnLabel: id.toUpperCase() });
  const functions = [
    k({ key: "escape", bind: "escape", width: 1.5, mod: true, label: "esc" }),
    fn("f1", MAC_ICON.sun),
    fn("f2", MAC_ICON.sun),
    fn("f3", MAC_ICON.grid),
    fn("f4", MAC_ICON.search),
    fn("f5", MAC_ICON.mic),
    fn("f6", MAC_ICON.moon),
    fn("f7", MAC_ICON.skipBack),
    fn("f8", MAC_ICON.play),
    fn("f9", MAC_ICON.skipForward),
    fn("f10", MAC_ICON.volMute),
    fn("f11", MAC_ICON.volLow),
    fn("f12", MAC_ICON.volHigh),
    k({ key: "lock", width: 1, icon: MAC_ICON.lock }),
  ].join("");
  const numbers = [
    k({ key: "`", bind: "backtick", sub: "~", label: "`" }),
    k({ key: "1", sub: "!", label: "1" }),
    k({ key: "2", sub: "@", label: "2" }),
    k({ key: "3", sub: "#", label: "3" }),
    k({ key: "4", sub: "$", label: "4" }),
    k({ key: "5", sub: "%", label: "5" }),
    k({ key: "6", sub: "^", label: "6" }),
    k({ key: "7", sub: "&", label: "7" }),
    k({ key: "8", sub: "*", label: "8" }),
    k({ key: "9", sub: "(", label: "9" }),
    k({ key: "0", sub: ")", label: "0" }),
    k({ key: "-", bind: "minus", sub: "_", label: "-" }),
    k({ key: "=", bind: "equal", sub: "+", label: "=" }),
    k({ key: "delete", bind: "backspace delete", width: 1.5, mod: true, label: "delete" }),
  ].join("");
  const upper = [
    k({ key: "tab", bind: "tab", width: 1.5, mod: true, label: "tab" }),
    macLetters(bound, "qwertyuiop"),
    k({ key: "[", bind: "lbracket", sub: "{", label: "[" }),
    k({ key: "]", bind: "rbracket", sub: "}", label: "]" }),
    k({ key: "\\", bind: "backslash", sub: "|", label: "\\" }),
  ].join("");
  const home = [
    k({ key: "caps", bind: "capslock", width: 1.75, mod: true, led: true, label: "caps lock" }),
    macLetters(bound, "asdfghjkl"),
    k({ key: ";", bind: "semicolon", sub: ":", label: ";" }),
    k({ key: "'", bind: "quote", sub: '"', label: "'" }),
    k({ key: "return", bind: "enter", width: 1.75, mod: true, label: "return" }),
  ].join("");
  const shift = [
    k({ key: "lshift", bind: "shift", width: 2.25, mod: true, label: "shift" }),
    macLetters(bound, "zxcvbnm"),
    k({ key: ",", bind: "comma", sub: "<", label: "," }),
    k({ key: ".", bind: "period", sub: ">", label: "." }),
    k({ key: "/", bind: "slash", sub: "?", label: "/" }),
    k({ key: "rshift", bind: "shift", width: 2.25, mod: true, label: "shift" }),
  ].join("");
  const arrows = `<div class="keyboard__arrows">
    ${k({ key: "left", bind: "left", icon: MAC_ICON.left })}
    <div class="keyboard__arrows-mid">
      ${k({ key: "up", bind: "up", half: true, icon: MAC_ICON.up })}
      ${k({ key: "down", bind: "down", half: true, icon: MAC_ICON.down })}
    </div>
    ${k({ key: "right", bind: "right", icon: MAC_ICON.right })}
  </div>`;
  const bottom = [
    k({
      key: "fn",
      bind: "fn",
      mod: true,
      stack: true,
      icon: MAC_ICON.globe,
      label: "fn",
    }),
    k({
      key: "lctrl",
      bind: "control",
      mod: true,
      stack: true,
      icon: MAC_ICON.chevron,
      label: "control",
    }),
    k({
      key: "lopt",
      bind: "alt",
      width: 1.25,
      mod: true,
      stack: true,
      icon: MAC_ICON.option,
      label: "option",
    }),
    k({
      key: "lcmd",
      bind: "meta",
      width: 1.5,
      mod: true,
      stack: true,
      icon: MAC_ICON.command,
      label: "command",
    }),
    k({ key: "space", bind: "space", width: 4 }),
    k({
      key: "rcmd",
      bind: "meta",
      width: 1.5,
      mod: true,
      stack: true,
      icon: MAC_ICON.command,
      label: "command",
    }),
    k({
      key: "ropt",
      bind: "alt",
      width: 1.25,
      mod: true,
      stack: true,
      icon: MAC_ICON.option,
      label: "option",
    }),
    arrows,
  ].join("");
  return `<div class="keyboard keyboard--mac" data-keyboard aria-hidden="true">
    <div class="keyboard__board">
      ${kbRow(functions)}
      ${kbRow(numbers)}
      ${kbRow(upper)}
      ${kbRow(home)}
      ${kbRow(shift)}
      ${kbRow(bottom)}
    </div>
  </div>`;
}

const PC_BOARD_COPY = {
  esc: "ESC",
  del: "DEL",
  bksp: "BKSP",
  tab: "TAB",
  caps: "CAPS",
  enter: "RET",
  shift: "SHIFT",
  ctrl: "CTRL",
  win: "WIN",
  alt: "ALT",
  left: "←",
  up: "↑",
  down: "↓",
  right: "→",
};

const LAYOUT_KEY_LABEL = {
  escape: "Esc",
  delete: "Del",
  backspace: "Bksp",
  tab: "Tab",
  caps: "Caps",
  enter: "Ret",
  lshift: "Shift",
  rshift: "Shift",
  lctrl: "Ctrl",
  rctrl: "Ctrl",
  lwin: "Win",
  rwin: "Win",
  lalt: "Alt",
  ralt: "Alt",
  rctx: "☰",
  fn: "Fn",
  insert: "Ins",
  home: "Home",
  end: "End",
  pageup: "PgUp",
  pagedown: "PgDn",
  printscreen: "Prt",
  scrolllock: "Scr",
  pause: "Brk",
  numlock: "Num",
  npdiv: "/",
  npmul: "*",
  npsub: "-",
  npadd: "+",
  npenter: "Ent",
  npdot: ".",
  np0: "0",
  np1: "1",
  np2: "2",
  np3: "3",
  np4: "4",
  np5: "5",
  np6: "6",
  np7: "7",
  np8: "8",
  np9: "9",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  space: "",
};

function labeledLayoutSpec(spec) {
  const item = typeof spec === "string" ? { key: spec } : spec;
  const key = String(item.key);
  const width = item.width ?? 1;
  const isFn = item.fn === true || FN_KEY.test(key);
  const isMod = item.mod === true || KB_MOD.has(key);
  if (item.alt) {
    return {
      ...item,
      width,
      mod: isMod,
      fn: isFn,
      sub: item.alt,
      label: key,
    };
  }
  const mapped = LAYOUT_KEY_LABEL[key];
  const label =
    mapped != null
      ? mapped
      : isFn
        ? key.toUpperCase()
        : key.length === 1
          ? key.toUpperCase()
          : key;
  return {
    ...item,
    width,
    mod: isMod,
    fn: isFn,
    label,
  };
}

function clusterHtml(inner) {
  return `<div class="keyboard__cluster">${inner}</div>`;
}

function gapHtml() {
  return `<div class="keyboard__gap" aria-hidden="true"></div>`;
}

function joinClusters(clusters, gap) {
  const parts = clusters.filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  return parts.join(gap > 0 ? gapHtml() : "");
}

function pcArrowsHtml(renderKey) {
  return `<div class="keyboard__arrows keyboard__arrows--pc">${ARROW_KEYS.map(renderKey).join("")}</div>`;
}

function navIslandHtml(renderKey) {
  return `<div class="keyboard__nav">
      <div class="keyboard__nav-island">${[...NAV_ISLAND.top, ...NAV_ISLAND.bot].map(renderKey).join("")}</div>
      ${pcArrowsHtml(renderKey)}
    </div>`;
}

function numpadHtml(renderKey) {
  return `<div class="keyboard__numpad">${NUMPAD_KEYS.map(renderKey).join("")}</div>`;
}

function layoutRowHtml(row, spec, renderKey) {
  const clusters = [];
  if (row.main?.length) clusters.push(clusterHtml(row.main.map(renderKey).join("")));
  if (row.rail?.length) clusters.push(clusterHtml(row.rail.map(renderKey).join("")));
  if (row.arrows && !spec.nav) clusters.push(pcArrowsHtml(renderKey));
  return `<div class="keyboard__row">${joinClusters(clusters, spec.gap)}</div>`;
}

function layoutKeyboardHtml(boundIds, layoutId, skin) {
  const spec = getKeyboardLayout(layoutId);
  if (!spec) return "";
  const bound = boundIds instanceof Set ? boundIds : new Set(boundIds);
  const tactile = skin === "schematic";
  const labeled = skin === "terminal";
  const renderKey = (item) => {
    if (labeled) return macKey(bound, labeledLayoutSpec(item));
    return kbKey(bound, item, { tactile, unitWidth: true });
  };
  const fnRow = spec.fn
    ? `<div class="keyboard__fn"><div class="keyboard__row">${joinClusters(
        spec.fn.map((cluster) => clusterHtml(cluster.map(renderKey).join(""))),
        spec.gap,
      )}</div></div>`
    : "";
  const alpha = spec.rows.map((row) => layoutRowHtml(row, spec, renderKey)).join("");
  const nav = spec.nav ? navIslandHtml(renderKey) : "";
  const pad = spec.numpad ? numpadHtml(renderKey) : "";
  const skinClass =
    skin === "schematic"
      ? "keyboard keyboard--schematic"
      : skin === "terminal"
        ? "keyboard keyboard--terminal"
        : "keyboard";
  const exploded = spec.exploded ? " data-exploded" : "";
  return `<div class="${skinClass}" data-keyboard data-layout="${spec.id}"${exploded} aria-hidden="true">
    <div class="keyboard__board" style="--kb-cols:${spec.cols};--kb-gap:${spec.gap}">
      <div class="keyboard__stage">
        ${fnRow}
        <div class="keyboard__body">
          <div class="keyboard__alpha">${alpha}</div>
          ${nav}
        </div>
      </div>
      ${pad}
    </div>
  </div>`;
}

const MAC_FN_ICONS = [
  MAC_ICON.sun,
  MAC_ICON.sun,
  MAC_ICON.grid,
  MAC_ICON.search,
  MAC_ICON.mic,
  MAC_ICON.moon,
  MAC_ICON.skipBack,
  MAC_ICON.play,
  MAC_ICON.skipForward,
  MAC_ICON.volMute,
  MAC_ICON.volLow,
  MAC_ICON.volHigh,
];

function macNavSpec(item) {
  const key = String(item.key);
  const labels = {
    insert: "ins",
    home: "home",
    pageup: "pg up",
    delete: "del",
    end: "end",
    pagedown: "pg dn",
    printscreen: "prt sc",
    scrolllock: "scr lk",
    pause: "pause",
    numlock: "num",
    npdiv: "/",
    npmul: "*",
    npsub: "-",
    npadd: "+",
    npenter: "enter",
    npdot: ".",
    np0: "0",
    np1: "1",
    np2: "2",
    np3: "3",
    np4: "4",
    np5: "5",
    np6: "6",
    np7: "7",
    np8: "8",
    np9: "9",
  };
  if (key === "up") return { key: "up", bind: "up", icon: MAC_ICON.up };
  if (key === "down") return { key: "down", bind: "down", icon: MAC_ICON.down };
  if (key === "left") return { key: "left", bind: "left", icon: MAC_ICON.left };
  if (key === "right") return { key: "right", bind: "right", icon: MAC_ICON.right };
  const label = labels[key] ?? (FN_KEY.test(key) ? key.toUpperCase() : key);
  return {
    ...item,
    width: item.width ?? 1,
    mod: item.mod ?? KB_MOD.has(key),
    fn: item.fn === true || FN_KEY.test(key),
    label,
  };
}

function macLayoutKeyboardHtml(boundIds, layoutId) {
  const spec = getKeyboardLayout(layoutId);
  if (!spec) return macKeyboardHtml(boundIds);
  const bound = boundIds instanceof Set ? boundIds : new Set(boundIds);
  const k = (item) => macKey(bound, item);
  const fn = (id, icon) =>
    k({ key: id, bind: id, width: 1, fn: true, icon, fnLabel: id.toUpperCase() });
  const functions = [
    k({ key: "escape", bind: "escape", width: 1.5, mod: true, label: "esc" }),
    ...MAC_FN_ICONS.map((icon, index) => fn(`f${index + 1}`, icon)),
    k({ key: "lock", width: 1, icon: MAC_ICON.lock }),
    ...(layoutId === "tkl" || layoutId === "100"
      ? [
          k({ key: "printscreen", bind: "printscreen", mod: true, label: "prt sc" }),
          k({ key: "scrolllock", bind: "scrolllock", mod: true, label: "scr lk" }),
          k({ key: "pause", bind: "pause", mod: true, label: "pause" }),
        ]
      : []),
  ].join("");
  const numbers = [
    k({ key: "`", bind: "backtick", sub: "~", label: "`" }),
    k({ key: "1", sub: "!", label: "1" }),
    k({ key: "2", sub: "@", label: "2" }),
    k({ key: "3", sub: "#", label: "3" }),
    k({ key: "4", sub: "$", label: "4" }),
    k({ key: "5", sub: "%", label: "5" }),
    k({ key: "6", sub: "^", label: "6" }),
    k({ key: "7", sub: "&", label: "7" }),
    k({ key: "8", sub: "*", label: "8" }),
    k({ key: "9", sub: "(", label: "9" }),
    k({ key: "0", sub: ")", label: "0" }),
    k({ key: "-", bind: "minus", sub: "_", label: "-" }),
    k({ key: "=", bind: "equal", sub: "+", label: "=" }),
    k({ key: "delete", bind: "backspace delete", width: 1.5, mod: true, label: "delete" }),
  ].join("");
  const upper = [
    k({ key: "tab", bind: "tab", width: 1.5, mod: true, label: "tab" }),
    macLetters(bound, "qwertyuiop"),
    k({ key: "[", bind: "lbracket", sub: "{", label: "[" }),
    k({ key: "]", bind: "rbracket", sub: "}", label: "]" }),
    k({ key: "\\", bind: "backslash", sub: "|", label: "\\" }),
  ].join("");
  const home = [
    k({ key: "caps", bind: "capslock", width: 1.75, mod: true, led: true, label: "caps lock" }),
    macLetters(bound, "asdfghjkl"),
    k({ key: ";", bind: "semicolon", sub: ":", label: ";" }),
    k({ key: "'", bind: "quote", sub: '"', label: "'" }),
    k({ key: "return", bind: "enter", width: 1.75, mod: true, label: "return" }),
  ].join("");
  const shift = [
    k({ key: "lshift", bind: "shift", width: 2.25, mod: true, label: "shift" }),
    macLetters(bound, "zxcvbnm"),
    k({ key: ",", bind: "comma", sub: "<", label: "," }),
    k({ key: ".", bind: "period", sub: ">", label: "." }),
    k({ key: "/", bind: "slash", sub: "?", label: "/" }),
    k({ key: "rshift", bind: "shift", width: 2.25, mod: true, label: "shift" }),
  ].join("");
  const arrows = `<div class="keyboard__arrows">
    ${k({ key: "left", bind: "left", icon: MAC_ICON.left })}
    <div class="keyboard__arrows-mid">
      ${k({ key: "up", bind: "up", half: true, icon: MAC_ICON.up })}
      ${k({ key: "down", bind: "down", half: true, icon: MAC_ICON.down })}
    </div>
    ${k({ key: "right", bind: "right", icon: MAC_ICON.right })}
  </div>`;
  const sideNav = layoutId === "tkl" || layoutId === "100" || layoutId === "75-exploded";
  const bottomMods = [
    k({
      key: "fn",
      bind: "fn",
      mod: true,
      stack: true,
      icon: MAC_ICON.globe,
      label: "fn",
    }),
    k({
      key: "lctrl",
      bind: "control",
      mod: true,
      stack: true,
      icon: MAC_ICON.chevron,
      label: "control",
    }),
    k({
      key: "lopt",
      bind: "alt",
      width: 1.25,
      mod: true,
      stack: true,
      icon: MAC_ICON.option,
      label: "option",
    }),
    k({
      key: "lcmd",
      bind: "meta",
      width: 1.5,
      mod: true,
      stack: true,
      icon: MAC_ICON.command,
      label: "command",
    }),
    k({ key: "space", bind: "space", width: 4 }),
    k({
      key: "rcmd",
      bind: "meta",
      width: 1.5,
      mod: true,
      stack: true,
      icon: MAC_ICON.command,
      label: "command",
    }),
    k({
      key: "ropt",
      bind: "alt",
      width: 1.25,
      mod: true,
      stack: true,
      icon: MAC_ICON.option,
      label: "option",
    }),
  ].join("");
  const bottom = sideNav ? bottomMods : `${bottomMods}${arrows}`;
  const renderNav = (item) => k(macNavSpec(item));
  const explodedNav =
    layoutId === "75-exploded"
      ? `<div class="keyboard__nav">
      <div class="keyboard__nav-island">${[
        { key: "insert", bind: "insert", mod: true },
        { key: "home", bind: "home", mod: true },
        { key: "pageup", bind: "pageup", mod: true },
        { key: "delete", bind: "delete", mod: true },
        { key: "end", bind: "end", mod: true },
        { key: "pagedown", bind: "pagedown", mod: true },
      ]
        .map(renderNav)
        .join("")}</div>
      ${pcArrowsHtml(renderNav)}
    </div>`
      : "";
  const nav =
    layoutId === "tkl" || layoutId === "100" ? navIslandHtml(renderNav) : explodedNav;
  const pad = layoutId === "100" ? numpadHtml(renderNav) : "";
  const fnRow = layoutId === "60" ? "" : kbRow(functions);
  const exploded = spec.exploded || layoutId === "tkl" || layoutId === "100" ? " data-exploded" : "";
  return `<div class="keyboard keyboard--mac" data-keyboard data-layout="${spec.id}"${exploded} aria-hidden="true">
    <div class="keyboard__board" style="--kb-cols:${spec.cols};--kb-gap:${spec.gap}">
      <div class="keyboard__stage">
        ${fnRow}
        <div class="keyboard__body">
          <div class="keyboard__alpha">
            ${kbRow(numbers)}
            ${kbRow(upper)}
            ${kbRow(home)}
            ${kbRow(shift)}
            ${kbRow(bottom)}
          </div>
          ${nav}
        </div>
      </div>
      ${pad}
    </div>
  </div>`;
}

function labeledPcKeyboardHtml(boundIds) {
  const bound = boundIds instanceof Set ? boundIds : new Set(boundIds);
  const copy = PC_BOARD_COPY;
  const k = (spec) => macKey(bound, spec);
  const functions = [
    k({ key: "escape", bind: "escape", width: 1.25, mod: true, label: copy.esc }),
    ...Array.from({ length: 12 }, (_, index) => {
      const id = `f${index + 1}`;
      return k({ key: id, bind: id, fn: true, label: id.toUpperCase() });
    }),
    k({ key: "delete", bind: "delete", width: 1.25, mod: true, label: copy.del }),
  ].join("");
  const numbers = [
    k({ key: "`", bind: "backtick", sub: "~", label: "`" }),
    k({ key: "1", sub: "!", label: "1" }),
    k({ key: "2", sub: "@", label: "2" }),
    k({ key: "3", sub: "#", label: "3" }),
    k({ key: "4", sub: "$", label: "4" }),
    k({ key: "5", sub: "%", label: "5" }),
    k({ key: "6", sub: "^", label: "6" }),
    k({ key: "7", sub: "&", label: "7" }),
    k({ key: "8", sub: "*", label: "8" }),
    k({ key: "9", sub: "(", label: "9" }),
    k({ key: "0", sub: ")", label: "0" }),
    k({ key: "-", bind: "minus", sub: "_", label: "-" }),
    k({ key: "=", bind: "equal", sub: "+", label: "=" }),
    k({ key: "backspace", bind: "backspace", width: 1.5, mod: true, label: copy.bksp }),
  ].join("");
  const upper = [
    k({ key: "tab", bind: "tab", width: 1.5, mod: true, label: copy.tab }),
    macLetters(bound, "qwertyuiop"),
    k({ key: "[", bind: "lbracket", sub: "{", label: "[" }),
    k({ key: "]", bind: "rbracket", sub: "}", label: "]" }),
    k({ key: "\\", bind: "backslash", sub: "|", label: "\\" }),
  ].join("");
  const home = [
    k({ key: "caps", bind: "capslock", width: 1.75, mod: true, label: copy.caps }),
    macLetters(bound, "asdfghjkl"),
    k({ key: ";", bind: "semicolon", sub: ":", label: ";" }),
    k({ key: "'", bind: "quote", sub: '"', label: "'" }),
    k({ key: "enter", bind: "enter", width: 1.75, mod: true, label: copy.enter }),
  ].join("");
  const shift = [
    k({ key: "lshift", bind: "shift", width: 2.25, mod: true, label: copy.shift }),
    macLetters(bound, "zxcvbnm"),
    k({ key: ",", bind: "comma", sub: "<", label: "," }),
    k({ key: ".", bind: "period", sub: ">", label: "." }),
    k({ key: "/", bind: "slash", sub: "?", label: "/" }),
    k({ key: "rshift", bind: "shift", width: 2.25, mod: true, label: copy.shift }),
  ].join("");
  const arrows = `<div class="keyboard__arrows">
    ${k({ key: "left", bind: "left", label: copy.left })}
    <div class="keyboard__arrows-mid">
      ${k({ key: "up", bind: "up", half: true, label: copy.up })}
      ${k({ key: "down", bind: "down", half: true, label: copy.down })}
    </div>
    ${k({ key: "right", bind: "right", label: copy.right })}
  </div>`;
  const bottom = [
    k({ key: "lctrl", bind: "control", width: 1.25, mod: true, label: copy.ctrl }),
    k({ key: "lwin", bind: "meta", width: 1.25, mod: true, label: copy.win }),
    k({ key: "lalt", bind: "alt", width: 1.25, mod: true, label: copy.alt }),
    k({ key: "space", bind: "space", width: 7.75 }),
    arrows,
  ].join("");
  const rows = `${kbRow(functions)}
      ${kbRow(numbers)}
      ${kbRow(upper)}
      ${kbRow(home)}
      ${kbRow(shift)}
      ${kbRow(bottom)}`;
  return `<div class="keyboard keyboard--terminal" data-keyboard aria-hidden="true">
    <div class="keyboard__board">
      ${rows}
    </div>
  </div>`;
}

function terminalKeyboardHtml(boundIds) {
  return labeledPcKeyboardHtml(boundIds);
}

function schematicKeyboardHtml(boundIds) {
  return keyboardHtml(boundIds, { tactile: true });
}

const KEYBOARD_CLASS = {
  mac: "has-mac-keyboard",
  terminal: "has-terminal-keyboard",
  schematic: "has-schematic-keyboard",
};

function commandsKeyboardHtml(kind, boundIds, layoutId) {
  const layout = layoutId && getKeyboardLayout(layoutId) ? layoutId : null;
  if (!layout) {
    if (kind === "mac") return macKeyboardHtml(boundIds);
    if (kind === "terminal") return terminalKeyboardHtml(boundIds);
    if (kind === "schematic") return schematicKeyboardHtml(boundIds);
    return keyboardHtml(boundIds);
  }
  if (kind === "mac") return macLayoutKeyboardHtml(boundIds, layout);
  if (kind === "terminal") return layoutKeyboardHtml(boundIds, layout, "terminal");
  if (kind === "schematic") return layoutKeyboardHtml(boundIds, layout, "schematic");
  return layoutKeyboardHtml(boundIds, layout, "windows");
}

export { commandsKeyboardHtml };

const svgIcon = (inner) =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

function platformKey(platform) {
  const name = String(platform ?? "").toLowerCase();
  if (name.includes("windows")) return "windows";
  if (name.includes("mac") || name.includes("apple") || name.includes("darwin")) return "macos";
  if (name.includes("linux") || name.includes("unix") || name.includes("ubuntu") || name.includes("debian")) {
    return "linux";
  }
  if (name.includes("github") || name.includes("release")) return "github";
  return "archive";
}

function platformGlyphHtml(platform) {
  const key = platformKey(platform);
  const icons = {
    windows: "brand-windows",
    macos: "brand-apple",
    linux: "brand-ubuntu",
    github: "brand-github",
    archive: "file-zip",
  };
  return loadTablerSvg(icons[key] ?? "file-zip");
}

function linkHost(href) {
  const raw = String(href ?? "").trim();
  if (!/^https?:\/\//i.test(raw)) return "";
  try {
    return new URL(raw).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function linkTabler(href, label) {
  const raw = `${href} ${label}`.toLowerCase();
  if (raw.includes("github.com") && raw.includes("sponsor")) return "heart";
  if (raw.includes("github.com")) return "brand-github";
  if (raw.includes("docs") || raw.includes("readme") || raw.endsWith(".md")) return "book";
  if (raw.includes("playground") || raw.includes("demo")) return "player-play";
  if (raw.includes("studio") || raw.includes("editor")) return "adjustments";
  if (raw.includes("catalog") || raw.includes("example")) return "layout-board";
  if (raw.includes("download") || raw.includes("release")) return "archive";
  return "world";
}

function faviconPublicPath(host) {
  const base = String(ENV.GVASTE_ASTRO_BASE || "/").replace(/\/?$/, "/");
  return `${base}assets/favicons/${host}.png`;
}

function cachedFaviconSrc(host) {
  if (!host || virtualFiles) return "";
  const cache = join(ROOT, ".cache", "favicons", `${host}.png`);
  const pub = join(ROOT, "public", "assets", "favicons", `${host}.png`);
  if (exists(cache) && !exists(pub)) {
    mkdirSync(dirname(pub), { recursive: true });
    copyFileSync(cache, pub);
  }
  if (exists(cache) || exists(pub)) return faviconPublicPath(host);
  return "";
}

function get(ctx, path) {
  if (!path || path === ".") return ctx;
  if (path === "this") return Object.hasOwn(ctx, "this") ? ctx.this : ctx;
  return path.split(".").reduce((node, key) => {
    if (node == null) return undefined;
    return node[key];
  }, ctx);
}

function isTruthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function splitIfElse(inner) {
  let depth = 0;
  let i = 0;
  while (i < inner.length) {
    const open = inner.indexOf("{{", i);
    if (open === -1) break;
    const { tag, end } = readTag(inner, open);
    if (tag.startsWith("#if ") || tag.startsWith("#each ")) depth += 1;
    else if (tag.startsWith("/if") || tag.startsWith("/each")) depth = Math.max(0, depth - 1);
    else if (tag === "else" && depth === 0) {
      return [inner.slice(0, open), inner.slice(end)];
    }
    i = end;
  }
  return [inner, ""];
}

function extractBlock(src, start, kind) {
  const openTag = `{{#${kind}`;
  const closeTag = `{{/${kind}}}`;
  let depth = 1;
  let i = start;
  while (i < src.length) {
    const nextOpen = src.indexOf(openTag, i);
    const nextClose = src.indexOf(closeTag, i);
    if (nextClose === -1) fail(`Unclosed ${kind} block`);
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + openTag.length;
      continue;
    }
    depth -= 1;
    if (depth === 0) {
      return [src.slice(start, nextClose), nextClose + closeTag.length];
    }
    i = nextClose + closeTag.length;
  }
  fail(`Unclosed ${kind} block`);
}

function readTag(src, open) {
  const triple = src.startsWith("{{{", open);
  const start = open + (triple ? 3 : 2);
  const closeSeq = triple ? "}}}" : "}}";
  const close = src.indexOf(closeSeq, start);
  if (close === -1) fail("Unclosed template tag");
  return {
    triple,
    tag: src.slice(start, close).trim(),
    end: close + closeSeq.length,
  };
}

function render(src, ctx) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{{", i);
    if (open === -1) {
      out += src.slice(i);
      break;
    }
    out += src.slice(i, open);
    const { triple, tag, end } = readTag(src, open);
    if (tag.startsWith("#each ")) {
      const path = tag.slice(6).trim();
      const [inner, blockEnd] = extractBlock(src, end, "each");
      const list = get(ctx, path);
      if (Array.isArray(list)) {
        list.forEach((item, index) => {
          const base = { index, count: list.length, n: String(index + 1).padStart(2, "0"), first: index === 0, selected: index === 0 ? "true" : "false" };
          const child = item && typeof item === "object" ? { ...ctx, ...base, ...item } : { ...ctx, this: item, ...base };
          out += render(inner, child);
        });
      }
      i = blockEnd;
      continue;
    }
    if (tag.startsWith("#if ")) {
      const path = tag.slice(4).trim();
      const [inner, blockEnd] = extractBlock(src, end, "if");
      const [truthy, falsy] = splitIfElse(inner);
      out += render(isTruthy(get(ctx, path)) ? truthy : falsy, ctx);
      i = blockEnd;
      continue;
    }
    if (tag.startsWith("/") || tag.startsWith("#")) {
      fail(`Unexpected tag {{${tag}}}`);
    }
    const value = get(ctx, tag);
    if (value != null && value !== false) {
      out += triple ? String(value) : escapeHtml(value);
    }
    i = end;
  }
  return out;
}

function requireValue(value, path) {
  if (value == null || value === "") fail(`${path} is required`);
  return value;
}

function mergePreset(site) {
  const preset = site.preset ?? "library";
  if (!PRESETS.includes(preset)) fail(`Unknown preset "${preset}"`);
  const defaults = loadYaml(join(KIT, "presets", `${preset}.yaml`));
  return {
    ...defaults,
    ...site,
    sections: site.sections ?? defaults.sections,
    preset,
  };
}

function looksLikeLegacyScreens(block) {
  return Boolean(block && (block.images || block.image) && !block.items);
}

function renameProofToScreens(site) {
  const next = { ...site };
  if (looksLikeLegacyScreens(next.proof) && !next.screens) {
    next.screens = next.proof;
    if (Array.isArray(next.sections)) {
      next.sections = next.sections.map((id) => (id === "proof" ? "screens" : id));
    }
  }
  return next;
}

function markStackPanel(html) {
  return html.replace(/<section\s+class="/, '<section class="stack-panel ');
}

function validate(site) {
  if (site.schema !== SCHEMA) fail(`schema must be ${SCHEMA}`);
  requireValue(site.project?.name, "project.name");
  requireValue(site.project?.description, "project.description");
  requireValue(site.project?.repo, "project.repo");
  requireValue(site.brand?.initials, "brand.initials");
  if (site.brand?.accent != null && String(site.brand.accent).trim() !== "") {
    if (!resolveAccent(site.brand.accent)) {
      fail("brand.accent must be a hue name or a hex color like #c9c9c9");
    }
  }
  const theme = site.brand?.theme ?? "dark";
  if (theme !== "dark" && theme !== "light") fail("brand.theme must be dark or light");
  const sections = site.sections ?? [];
  for (const id of sections) {
    if (!SECTIONS.includes(id)) fail(`Unknown section "${id}"`);
  }
  if (sections.includes("hero")) requireValue(site.hero?.title, "hero.title");
  if (sections.includes("about")) {
    requireValue(site.about?.title, "about.title");
    const facts = Array.isArray(site.about?.facts) ? site.about.facts : [];
    const steps = Array.isArray(site.about?.steps) ? site.about.steps : [];
    const notes = Array.isArray(site.about?.notes) ? site.about.notes : [];
    const features = Array.isArray(site.about?.features) ? site.about.features : [];
    if (!features.length && !steps.length && !notes.length) {
      fail("about needs features, steps, or notes");
    }
    if (features.length && (features.length < 2 || features.length > 4)) {
      fail("about.features needs 2 to 4 items");
    }
    facts.forEach((item, index) => {
      requireValue(item?.value, `about.facts[${index}].value`);
      requireValue(item?.label, `about.facts[${index}].label`);
    });
    steps.forEach((item, index) => {
      requireValue(item?.title, `about.steps[${index}].title`);
      requireValue(item?.body, `about.steps[${index}].body`);
    });
    notes.forEach((item, index) => {
      requireValue(item?.title, `about.notes[${index}].title`);
      requireValue(item?.body, `about.notes[${index}].body`);
    });
    features.forEach((item, index) => {
      requireValue(item?.title, `about.features[${index}].title`);
      requireValue(item?.body, `about.features[${index}].body`);
      requireValue(item?.tabler, `about.features[${index}].tabler`);
      const image = aboutFeatureImage(item);
      const html = String(item?.html ?? "").trim();
      if (!image && !html) fail(`about.features[${index}] needs image or html`);
      if (item?.image) requireValue(image?.alt, `about.features[${index}].image.alt`);
    });
  }
  if (sections.includes("hero") && Array.isArray(site.hero?.actions)) {
    site.hero.actions.forEach((action, index) => {
      if (action?.command) {
        requireValue(String(action.command).trim(), `hero.actions[${index}].command`);
        return;
      }
      requireValue(action?.label, `hero.actions[${index}].label`);
      requireValue(action?.href, `hero.actions[${index}].href`);
    });
  }
  if (Array.isArray(site.hero?.examples)) {
    site.hero.examples.forEach((item, index) => {
      requireValue(item?.name, `hero.examples[${index}].name`);
      if (item?.src) requireValue(item?.alt, `hero.examples[${index}].alt`);
    });
  }
  if (sections.includes("demo")) {
    if (!Array.isArray(site.demo?.views) || site.demo.views.length === 0) {
      fail("demo.views must list at least one view");
    }
  }
  if (sections.includes("docs")) {
    if (!site.docs?.items?.length) fail("docs.items is required");
    site.docs.items.forEach((item, index) => validateDocsItem(item, `docs.items[${index}]`));
  }
  if (sections.includes("links") && !site.links?.items?.length) fail("links.items is required");
  if (sections.includes("download") && !site.download?.items?.length) fail("download.items is required");
  if (sections.includes("commands") && !site.commands?.items?.length) fail("commands.items is required");
  if (site.commands?.keyboard != null && String(site.commands.keyboard).trim() !== "") {
    if (!commandsKeyboardKind(site.commands.keyboard)) {
      fail("commands.keyboard must be windows, mac, terminal, or schematic");
    }
  }
  if (site.commands?.layout != null && String(site.commands.layout).trim() !== "") {
    const layoutId = commandsKeyboardLayout(site.commands.layout);
    if (layoutId === false) {
      fail("commands.layout must be 100, 1800, 96, tkl, 75-exploded, 75, 65-exploded, 65, 60, 50, or 40");
    }
    const kind = commandsKeyboardKind(site.commands.keyboard) ?? "windows";
    if (kind === "mac" && !MAC_LAYOUTS.has(layoutId)) {
      fail(`Mac keyboard does not support layout "${layoutId}"; use 100, tkl, 75, 75-exploded, or 60`);
    }
  }
  if (sections.includes("matrix") && !site.matrix?.rows?.length) fail("matrix.rows is required");
  if (sections.includes("faq")) {
    const items = site.faq?.items;
    if (!Array.isArray(items) || items.length === 0) fail("faq.items must list at least one question");
    items.forEach((item, index) => {
      requireValue(faqQuestion(item), `faq.items[${index}].question`);
      requireValue(faqAnswer(item), `faq.items[${index}].answer`);
    });
  }
  if (sections.includes("trust") && !site.trust?.local?.items?.length && !site.trust?.network?.items?.length) {
    fail("trust.local.items or trust.network.items is required");
  }
  if (sections.includes("skill")) {
    requireValue(site.skill?.command, "skill.command");
    const uses = Array.isArray(site.skill?.uses) ? site.skill.uses : [];
    uses.forEach((item, index) => {
      requireValue(item?.body, `skill.uses[${index}].body`);
    });
  }
  if (sections.includes("github")) {
    const url = site.github?.repo || site.project?.repo;
    if (!parseGithubRepo(url)) {
      fail("github needs a github.com repository URL in github.repo or project.repo");
    }
    if (site.github != null && (typeof site.github !== "object" || Array.isArray(site.github))) {
      fail("github must be a mapping");
    }
    if (site.github?.show != null && !Array.isArray(site.github.show)) {
      fail("github.show must be a list");
    }
  }
  for (const [section, key] of [
    ["screens", "images"],
    ["hero", "gallery"],
  ]) {
    const list = site[section]?.[key];
    if (Array.isArray(list)) {
      list.forEach((item, index) => {
        requireValue(item?.src, `${section}.${key}[${index}].src`);
      });
    }
  }
}

function loadTablerSvg(name) {
  const id = String(name ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    fail(`Invalid brand.tabler "${name}"`);
  }
  const path = join(KIT, "icons", "tabler", `${id}.svg`);
  if (!exists(path)) fail(`Missing Tabler icon kit/icons/tabler/${id}.svg`);
  return read(path)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace("<svg", '<svg aria-hidden="true"')
    .trim();
}

function prepare(site) {
  const theme = site.brand?.theme ?? "dark";
  const brand = {
    accent: "#c9c9c9",
    theme,
    ...site.brand,
  };
  const accentRaw = String(brand.accent ?? "").trim() || "#c9c9c9";
  const accent = resolveAccent(accentRaw) ?? resolveAccent("#c9c9c9");
  brand.accent = accent.input;
  brand.accentCss = accent.css;
  brand.accentStyle = accent.style;
  brand.tinted = accent.tinted;
  brand.tablerSvg = !brand.icon && brand.tabler ? loadTablerSvg(brand.tabler) : "";
  brand.hasMark = !brand.icon && !brand.tablerSvg;
  brand.mascotSvg = brand.mascot ? inlineSvgAsset(brand.mascot, "brand-mascot") : "";
  // brand.accentCycle: colours a visitor steps through by clicking the brand mark.
  const cycle = brand.accentCycle ?? [];
  if (!Array.isArray(cycle) || (cycle.length && (cycle.length < 2 || !cycle.every(isHexColor)))) {
    throw new Error("brand.accentCycle must list two or more hex colours");
  }
  brand.hasAccentCycle = cycle.length > 1;
  brand.accentCycleJson = brand.hasAccentCycle ? JSON.stringify(cycle.map((hex) => String(hex).toLowerCase())) : "";
  brand.hasMascot = Boolean(brand.mascotSvg);
  // An animated mascot replaces the other header marks.
  if (brand.hasMascot) {
    brand.tablerSvg = "";
    brand.hasMark = false;
  }
  brand.showIcon = Boolean(brand.icon) && !brand.hasMascot;
  const nav = site.sections
    .filter((id) => NAV_LABELS[id])
    .map((id) => ({ label: NAV_LABELS[id], href: `#${id}`, anchor: true }));
  const madeBy = {
    name: "gvastethecreator",
    url: "https://github.com/gvastethecreator",
    avatar: "https://github.com/gvastethecreator.png",
    ...site.project?.madeBy,
  };
  const withTitles = (block) => {
    if (!block) return block;
    return { ...block, titleHtml: titleHtml(block.title) };
  };
  const statusKey = (value) =>
    String(value ?? "default")
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-|-$/g, "") || "default";
  const screenImages = Array.isArray(site.screens?.images) ? site.screens.images : [];
  const screens = site.screens
    ? {
        ...withTitles(site.screens),
        // screens.head keeps the kicker, title and lede on screen above the carousel.
        isHeaded: site.screens.head === true,
        hasCarousel: screenImages.length > 0,
        hasBar: screenImages.length > 1,
        frameSrc: screenImages[0]?.src ?? "",
        frameAlt: screenImages[0]?.alt ?? "",
        counterInitial: `01 / ${String(screenImages.length).padStart(2, "0")}`,
        captionInitial: screenImages[0]?.caption ?? "",
        glowSrc: screenImages[0]?.src ?? "",
        images: screenImages,
        carouselLabel: `${site.project.name} screens`,
        image: site.screens.image && !screenImages.length
          ? {
              ...site.screens.image,
              plain: Boolean(site.screens.image.src) && !site.screens.image.href,
            }
          : undefined,
      }
    : undefined;
  const explicitGallery = Array.isArray(site.hero?.gallery) ? site.hero.gallery : [];
  const heroExamples = Array.isArray(site.hero?.examples)
    ? site.hero.examples.map((item) => ({
        ...item,
        isLink: Boolean(item?.href),
        plain: !item?.href,
      }))
    : [];
  const heroActions = Array.isArray(site.hero?.actions)
    ? site.hero.actions.map((action) => {
        const command = String(action?.command ?? "").trim();
        if (command) {
          return { ...action, command, isCommand: true, isLink: false };
        }
        return { ...action, isCommand: false, isLink: Boolean(action?.href) };
      })
    : [];
  // Rule: screens.images fill the hero carousel unless hero.gallery is set.
  const heroGallery = explicitGallery.length > 0 ? explicitGallery : screenImages;
  const hasGallery = heroGallery.length > 1;
  // hero.stage: deck shows the gallery as a stack of cards instead of the depth carousel.
  const heroStage = String(site.hero?.stage ?? "carousel").trim().toLowerCase();
  if (!["carousel", "deck"].includes(heroStage)) throw new Error('hero.stage must be "carousel" or "deck"');
  const hasDeck = hasGallery && heroStage === "deck";
  const singleStill = heroGallery.length === 1 ? heroGallery[0] : null;
  const hasExamples = heroExamples.length > 0 && !hasGallery && !singleStill;
  const artifact = singleStill
    ? { src: singleStill.src, alt: singleStill.alt }
    : site.hero?.artifact;
  const hasArtifact = Boolean(artifact?.src) && !hasGallery && !hasExamples;
  const demoViews = Array.isArray(site.demo?.views)
    ? site.demo.views.map((view, index) =>
        prepareDemoView(view, index, site.brand?.theme === "light" ? "light" : "dark"),
      )
    : [];
  const demo = site.demo
    ? {
        ...withTitles(site.demo),
        accessibleTitle: String(site.demo.title ?? "").trim() || "Demo",
        hasManyViews: demoViews.length > 1,
        firstCode: demoViews[0]?.code ?? "",
        firstFile: demoViews[0]?.file ?? "",
        views: demoViews,
      }
    : undefined;
  const aboutSteps = Array.isArray(site.about?.steps) ? site.about.steps : [];
  const aboutNotes = Array.isArray(site.about?.notes) ? site.about.notes : [];
  const aboutFeatures = Array.isArray(site.about?.features) ? site.about.features : [];
  const hasFeatures = aboutFeatures.length > 0;
  const about = site.about
    ? {
        ...withTitles(site.about),
        hasFeatures,
        hasSteps: !hasFeatures && aboutSteps.length > 0,
        hasNotes: !hasFeatures && aboutNotes.length > 0,
        featureCount: String(aboutFeatures.length),
        features: aboutFeatures.map(prepareAboutFeature),
        steps: aboutSteps.map((step, index) => ({
          ...step,
          on: index === 0,
          expanded: index === 0 ? "true" : "false",
        })),
        notes: aboutNotes,
        said: aboutSteps[0]?.body ?? "",
      }
    : undefined;
  const matrix = site.matrix
    ? {
        ...withTitles(site.matrix),
        columns: site.matrix.columns ?? ["Name", "Status", "Note"],
        rows: (site.matrix.rows ?? []).map((row) => ({
          ...row,
          statusKey: statusKey(row.status),
        })),
      }
    : undefined;
  const skillUses = Array.isArray(site.skill?.uses) ? site.skill.uses : [];
  const skill = site.skill
    ? {
        ...withTitles(site.skill),
        commandHtml: escapeHtml(site.skill.command ?? ""),
        hasUses: skillUses.length > 0,
        uses: skillUses,
        hostTabs: Array.isArray(site.skill.hosts) && site.skill.trigger
          ? site.skill.hosts.map((host) => ({
              label: host,
              path: `${host}/skills/${site.skill.trigger}`,
            }))
          : undefined,
      }
    : undefined;

  return {
    ...site,
    brand,
    madeBy,
    nav,
    pageTitle: site.project.tagline
      ? `${site.project.name} — ${site.project.tagline}`
      : site.project.name,
    colorScheme: theme,
    themeColor: theme === "light" ? "#eee8dc" : "#000000",
    hero: site.hero
      ? {
          ...withTitles(site.hero),
          titleHtml: accentTitle(titleLine(site.hero.title), site.hero.accent),
          actions: heroActions,
          hasArtifact,
          hasGallery: hasGallery && !hasDeck,
          hasDeck,
          deck: hasDeck
            ? heroGallery.map((item, index) => ({
                ...item,
                index,
                n: index + 1,
                count: heroGallery.length,
                file: String(item?.file ?? "").trim(),
              }))
            : [],
          deckNote: String(site.hero?.stageNote ?? "").trim(),
          mascotSvg: brand.hasMascot ? inlineSvgAsset(brand.mascot, "hero-mascot") : "",
          hasExamples,
          hasBar: false,
          hasStage: hasGallery || hasExamples || hasArtifact,
          hasCommand: heroActions.some((action) => action.isCommand),
          carouselLabel: `${site.project.name} screens`,
          captionInitial: heroGallery[0]?.caption ?? "",
          glowSrc: heroGallery[0]?.src ?? "",
          gallery: heroGallery,
          artifact,
          examples: heroExamples,
        }
      : undefined,
    about,
    screens,
    demo,
    docs: prepareDocs(site),
    download: site.download
      ? {
          ...withTitles(site.download),
          items: (site.download.items ?? []).map((item) => ({
            ...item,
            glyphHtml: platformGlyphHtml(item.platform),
            platformKey: platformKey(item.platform),
            meta: [item.arch, item.version, item.date].filter(Boolean).join(" · "),
          })),
        }
      : undefined,
    commands: site.commands
      ? (() => {
          const items = (site.commands.items ?? []).map((item) => {
            const keyIds = commandKeyIds(item.keys);
            return {
              ...item,
              keysHtml: keycapsHtml(item.keys),
              keysAttr: keyIds.join(" "),
              keyIds,
            };
          });
          const boundIds = [...new Set(items.flatMap((item) => item.keyIds))];
          const hasKeyboard = boundIds.length > 0;
          const keyboardKind = commandsKeyboardKind(site.commands.keyboard) ?? "windows";
          const keyboardLayout = commandsKeyboardLayout(site.commands.layout);
          return {
            ...withTitles(site.commands),
            items,
            hasKeyboard,
            isMacKeyboard: keyboardKind === "mac",
            keyboardClass: KEYBOARD_CLASS[keyboardKind] ?? "",
            keyboardHtml: hasKeyboard
              ? commandsKeyboardHtml(keyboardKind, boundIds, keyboardLayout || null)
              : "",
          };
        })()
      : undefined,
    matrix,
    // closing.accent marks a word like the hero title; closing.images puts a wall of pictures behind it.
    closing: site.closing
      ? {
          ...site.closing,
          textHtml: accentTitle(titleLine(site.closing.text), site.closing.accent),
          images: Array.isArray(site.closing.images) ? site.closing.images.map((src) => String(src)) : [],
          hasWall: Array.isArray(site.closing.images) && site.closing.images.length > 0,
        }
      : site.closing,
    faq: site.faq
      ? (() => {
          const exclusive = site.faq.exclusive !== false;
          const raw = Array.isArray(site.faq.items) ? site.faq.items : [];
          const authoredOpen = raw.some((item) => item?.open === true);
          const used = new Set();
          const items = raw.map((item, index) => {
            const question = faqQuestion(item);
            const answer = faqAnswer(item);
            let slug = slugify(question);
            if (used.has(slug)) {
              let n = 2;
              while (used.has(`${slug}-${n}`)) n += 1;
              slug = `${slug}-${n}`;
            }
            used.add(slug);
            const open = authoredOpen ? item?.open === true : index === 0;
            return {
              question,
              answer,
              slug,
              panelId: `faq-panel-${slug}`,
              headingId: `faq-q-${slug}`,
              open,
              expanded: open ? "true" : "false",
            };
          });
          return {
            ...withTitles(site.faq),
            exclusive,
            exclusiveAttr: exclusive ? "true" : "false",
            ariaLabel: site.faq.title ? undefined : "FAQ",
            items,
            jsonLd: jsonLd({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: items.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            }),
          };
        })()
      : undefined,
    trust: withTitles(site.trust),
    skill,
    links: site.links
      ? {
          ...withTitles(site.links),
          items: (site.links.items ?? []).map((item) => {
            const href = String(item.href ?? "");
            const label = item.label ?? item.title ?? "";
            const host = linkHost(href);
            const faviconSrc = host ? cachedFaviconSrc(host) : "";
            return {
              ...item,
              label,
              href,
              faviconSrc,
              tablerSvg: loadTablerSvg(linkTabler(href, label)),
            };
          }),
        }
      : undefined,
    github: prepareGithubSection(site, githubCtx()),
  };
}

function faviconSvg(initials) {
  const label = escapeHtml(initials.slice(0, 3).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#111111"/>
  <text x="16" y="21" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="11" font-weight="700" fill="#C9C9C9">${label}</text>
</svg>
`;
}

function renderSectionHtml(id, view) {
  return markStackPanel(render(read(join(KIT, "sections", `${id}.html`)), view));
}

function renderHeaderHtml(view) {
  return render(read(join(CHROME, "header.html")), view);
}

function renderFooterHtml(view) {
  return render(read(join(CHROME, "footer.html")), view);
}

function injectFooterHtml(sectionHtml, footerHtml) {
  return sectionHtml.replace(/<\/section>\s*$/i, `${footerHtml}\n</section>`);
}

function withContentRoot(yamlPath, fn) {
  const previous = contentRoot;
  contentRoot = virtualFiles ? ROOT : dirname(yamlPath);
  try {
    return fn();
  } finally {
    contentRoot = previous;
  }
}

function getContentRoot() {
  return contentRoot;
}

function prepareSite(yamlPath) {
  return withContentRoot(yamlPath, () => prepareView(loadYaml(yamlPath)));
}

function prepareSiteDocument(yamlPath, raw) {
  return withContentRoot(yamlPath, () => prepareView(raw));
}

function prepareView(raw) {
  const site = renameProofToScreens(mergePreset(raw));
  validate(site);
  return prepare(site);
}

export {
  exists as kitFileExists,
  faviconSvg,
  getContentRoot,
  injectFooterHtml,
  loadYaml,
  prepareSite,
  prepareSiteDocument,
  prepareView,
  read as readKitFile,
  renderFooterHtml,
  renderHeaderHtml,
  renderSectionHtml,
  validate,
};
