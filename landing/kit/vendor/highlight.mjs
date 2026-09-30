/* Compact tokenizer for demo source panes. Sync, no deps, Node + browser. */

const LIVE = new Set(["html", "svg", "css", "javascript", "js"]);

const EXT = {
  yaml: "yaml",
  yml: "yaml",
  html: "html",
  htm: "html",
  svg: "svg",
  css: "css",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "javascript",
  json: "json",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  ps1: "bash",
  shell: "bash",
};

const LANG_LABEL = {
  yaml: "YAML",
  html: "HTML",
  svg: "SVG",
  css: "CSS",
  javascript: "JS",
  js: "JS",
  json: "JSON",
  bash: "Shell",
  text: "Text",
};

const JS_KEYWORDS = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "false", "finally", "for",
  "function", "if", "import", "in", "instanceof", "let", "new", "null",
  "return", "static", "super", "switch", "this", "throw", "true", "try",
  "typeof", "undefined", "var", "void", "while", "with", "yield", "async",
  "await", "of",
]);

const CSS_KEYWORDS = new Set([
  "important", "from", "to", "and", "or", "not", "only",
]);

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function isLiveLang(lang) {
  return LIVE.has(String(lang ?? "").toLowerCase());
}

export function langLabel(lang) {
  const id = normalizeLang(lang);
  return LANG_LABEL[id] ?? id.toUpperCase();
}

export function normalizeLang(lang) {
  const id = String(lang ?? "").trim().toLowerCase();
  if (!id) return "text";
  if (id === "js" || id === "ts") return "javascript";
  if (id === "yml") return "yaml";
  if (id === "htm") return "html";
  if (id === "sh" || id === "zsh" || id === "shell" || id === "console" || id === "ps1" || id === "powershell") {
    return "bash";
  }
  return id;
}

export function detectLang(code, hint, file) {
  const fromHint = normalizeLang(hint);
  if (hint && fromHint !== "text") return fromHint;
  const ext = String(file ?? "").split(".").pop()?.toLowerCase();
  if (ext && EXT[ext]) return EXT[ext];
  const src = String(code ?? "").trim();
  if (!src) return "text";
  if (src.startsWith("<!DOCTYPE") || src.startsWith("<?xml") || /^<[a-z!/]/i.test(src)) return "html";
  if (src.startsWith("{") || src.startsWith("[")) return "json";
  if (/^(schema|preset|project|brand|sections)\s*:/m.test(src)) return "yaml";
  if (/^\$\s+\S/m.test(src) || /^(pnpm|npm|npx|bun|yarn|git)\s/m.test(src)) return "bash";
  return "text";
}

export function fileNameFor(view) {
  const named = String(view?.file ?? "").trim();
  if (named) return named;
  const lang = detectLang(view?.code, view?.lang, view?.file);
  const id = String(view?.id ?? "snippet").trim() || "snippet";
  const ext = {
    yaml: "yaml",
    html: "html",
    svg: "svg",
    css: "css",
    javascript: "js",
    json: "json",
    bash: "sh",
    text: "txt",
  }[lang] ?? "txt";
  return `${id}.${ext}`;
}

function push(tokens, type, text) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === type) {
    last.text += text;
    return;
  }
  tokens.push({ type, text });
}

function tokenizeStringsAndComments(src, i, tokens, opts) {
  const ch = src[i];
  const next = src[i + 1];
  if (opts.hashComment && ch === "#") {
    const end = src.indexOf("\n", i);
    const at = end === -1 ? src.length : end;
    push(tokens, "comment", src.slice(i, at));
    return at;
  }
  if (opts.lineComment && ch === "/" && next === "/") {
    const end = src.indexOf("\n", i);
    const at = end === -1 ? src.length : end;
    push(tokens, "comment", src.slice(i, at));
    return at;
  }
  if (opts.blockComment && ch === "/" && next === "*") {
    const end = src.indexOf("*/", i + 2);
    const at = end === -1 ? src.length : end + 2;
    push(tokens, "comment", src.slice(i, at));
    return at;
  }
  if (ch === '"' || ch === "'") {
    return takeQuoted(src, i, tokens, ch);
  }
  if (opts.template && ch === "`") {
    return takeTemplate(src, i, tokens);
  }
  return -1;
}

function takeQuoted(src, i, tokens, quote) {
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === "\\") {
      j += 2;
      continue;
    }
    if (src[j] === quote) {
      j += 1;
      break;
    }
    j += 1;
  }
  push(tokens, "string", src.slice(i, j));
  return j;
}

function takeTemplate(src, i, tokens) {
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === "\\") {
      j += 2;
      continue;
    }
    if (src[j] === "`") {
      j += 1;
      break;
    }
    j += 1;
  }
  push(tokens, "string", src.slice(i, j));
  return j;
}

function takeIdent(src, i) {
  let j = i;
  while (j < src.length && /[A-Za-z0-9_$-]/.test(src[j])) j += 1;
  return [src.slice(i, j), j];
}

function tokenizeYaml(src) {
  const tokens = [];
  const lines = src.split("\n");
  lines.forEach((line, index) => {
    if (index) push(tokens, "", "\n");
    const trimmed = line.trimStart();
    const indent = line.slice(0, line.length - trimmed.length);
    if (indent) push(tokens, "", indent);
    if (!trimmed) return;
    if (trimmed.startsWith("#")) {
      push(tokens, "comment", trimmed);
      return;
    }
    let rest = trimmed;
    if (rest.startsWith("- ")) {
      push(tokens, "punct", "-");
      push(tokens, "", " ");
      rest = rest.slice(2);
    } else if (rest === "-") {
      push(tokens, "punct", "-");
      return;
    }
    const keyMatch = rest.match(/^([^:#\n]+?)(\s*)(:)(\s*)(.*)$/);
    if (keyMatch && !keyMatch[1].includes("{")) {
      push(tokens, "key", keyMatch[1]);
      if (keyMatch[2]) push(tokens, "", keyMatch[2]);
      push(tokens, "punct", ":");
      if (keyMatch[4]) push(tokens, "", keyMatch[4]);
      tokenizeYamlValue(keyMatch[5], tokens);
      return;
    }
    tokenizeYamlValue(rest, tokens);
  });
  return tokens;
}

function tokenizeYamlValue(value, tokens) {
  if (!value) return;
  const hash = value.indexOf(" #");
  let main = value;
  let comment = "";
  if (hash !== -1) {
    main = value.slice(0, hash);
    comment = value.slice(hash + 1);
  }
  let i = 0;
  while (i < main.length) {
    const ch = main[i];
    if (ch === '"' || ch === "'") {
      i = takeQuoted(main, i, tokens, ch);
      continue;
    }
    if (ch === "{" || ch === "}" || ch === "[" || ch === "]" || ch === "," || ch === ":") {
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < main.length && /\s/.test(main[j])) j += 1;
      push(tokens, "", main.slice(i, j));
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "-" && /[0-9]/.test(main[i + 1] ?? ""))) {
      let j = i + 1;
      while (j < main.length && /[0-9.eE+-]/.test(main[j])) j += 1;
      push(tokens, "number", main.slice(i, j));
      i = j;
      continue;
    }
    const [ident, j] = takeIdent(main, i);
    if (ident) {
      const lower = ident.toLowerCase();
      if (lower === "true" || lower === "false" || lower === "null") push(tokens, "bool", ident);
      else push(tokens, "", ident);
      i = j;
      continue;
    }
    push(tokens, "", ch);
    i += 1;
  }
  if (comment) push(tokens, "comment", comment);
}

function tokenizeHtml(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      const at = end === -1 ? src.length : end + 3;
      push(tokens, "comment", src.slice(i, at));
      i = at;
      continue;
    }
    if (src[i] === "<") {
      const gt = src.indexOf(">", i);
      if (gt === -1) {
        push(tokens, "tag", src.slice(i));
        break;
      }
      const tag = src.slice(i, gt + 1);
      tokenizeTag(tag, tokens);
      i = gt + 1;
      const name = tag.match(/^<\/?([A-Za-z0-9:-]+)/)?.[1]?.toLowerCase();
      const closing = tag.startsWith("</") || tag.endsWith("/>");
      if (!closing && (name === "style" || name === "script")) {
        const close = src.toLowerCase().indexOf(`</${name}`, i);
        const at = close === -1 ? src.length : close;
        const inner = src.slice(i, at);
        if (name === "style") tokenizeCss(inner).forEach((token) => tokens.push(token));
        else tokenizeJavascript(inner).forEach((token) => tokens.push(token));
        i = at;
      }
      continue;
    }
    const next = src.indexOf("<", i);
    const at = next === -1 ? src.length : next;
    push(tokens, "", src.slice(i, at));
    i = at;
  }
  return tokens;
}

function tokenizeTag(tag, tokens) {
  push(tokens, "punct", "<");
  let i = 1;
  if (tag[i] === "/") {
    push(tokens, "punct", "/");
    i += 1;
  }
  while (i < tag.length && /[A-Za-z0-9:-]/.test(tag[i])) i += 1;
  push(tokens, "tag", tag.slice(tag[1] === "/" ? 2 : 1, i));
  while (i < tag.length - 1) {
    const ch = tag[i];
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < tag.length && /\s/.test(tag[j])) j += 1;
      push(tokens, "", tag.slice(i, j));
      i = j;
      continue;
    }
    if (ch === "/" || ch === ">") {
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (ch === "=") {
      push(tokens, "punct", "=");
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = takeQuoted(tag, i, tokens, ch);
      continue;
    }
    const start = i;
    while (i < tag.length && /[A-Za-z0-9:_-]/.test(tag[i])) i += 1;
    if (i > start) {
      push(tokens, "attr", tag.slice(start, i));
      continue;
    }
    push(tokens, "", ch);
    i += 1;
  }
  if (i < tag.length) push(tokens, "punct", tag.slice(i));
}

function tokenizeCss(src) {
  const tokens = [];
  let i = 0;
  let inBlock = 0;
  while (i < src.length) {
    const jumped = tokenizeStringsAndComments(src, i, tokens, { blockComment: true });
    if (jumped >= 0) {
      i = jumped;
      continue;
    }
    const ch = src[i];
    if (ch === "{") {
      inBlock += 1;
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (ch === "}") {
      inBlock = Math.max(0, inBlock - 1);
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (ch === ":" || ch === ";" || ch === "," || ch === "(" || ch === ")") {
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /\s/.test(src[j])) j += 1;
      push(tokens, "", src.slice(i, j));
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i + 1;
      while (j < src.length && /[0-9.%eE+-]/.test(src[j])) j += 1;
      push(tokens, "number", src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === "#" && /[0-9a-fA-F]/.test(src[i + 1] ?? "")) {
      let j = i + 1;
      while (j < src.length && /[0-9a-fA-F]/.test(src[j])) j += 1;
      push(tokens, "number", src.slice(i, j));
      i = j;
      continue;
    }
    const [ident, j] = takeIdent(src, i);
    if (ident) {
      if (ident.startsWith("--") || (inBlock && src[j] === ":")) push(tokens, "key", ident);
      else if (CSS_KEYWORDS.has(ident)) push(tokens, "keyword", ident);
      else if (!inBlock) push(tokens, "tag", ident);
      else push(tokens, "", ident);
      i = j;
      continue;
    }
    push(tokens, "", ch);
    i += 1;
  }
  return tokens;
}

function tokenizeJavascript(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const jumped = tokenizeStringsAndComments(src, i, tokens, {
      lineComment: true,
      blockComment: true,
      template: true,
    });
    if (jumped >= 0) {
      i = jumped;
      continue;
    }
    const ch = src[i];
    if (/[{}()[\];,.]/.test(ch)) {
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /\s/.test(src[j])) j += 1;
      push(tokens, "", src.slice(i, j));
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /[0-9.xXeEn_]/.test(src[j])) j += 1;
      push(tokens, "number", src.slice(i, j));
      i = j;
      continue;
    }
    const [ident, j] = takeIdent(src, i);
    if (ident) {
      if (JS_KEYWORDS.has(ident)) push(tokens, ident === "true" || ident === "false" || ident === "null" || ident === "undefined" ? "bool" : "keyword", ident);
      else if (src[j] === "(") push(tokens, "fn", ident);
      else push(tokens, "", ident);
      i = j;
      continue;
    }
    push(tokens, "punct", ch);
    i += 1;
  }
  return tokens;
}

function tokenizeJson(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"') {
      const start = i;
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === '"') {
          j += 1;
          break;
        }
        j += 1;
      }
      const raw = src.slice(start, j);
      let k = j;
      while (k < src.length && /\s/.test(src[k])) k += 1;
      push(tokens, src[k] === ":" ? "key" : "string", raw);
      i = j;
      continue;
    }
    if (/[{}[\],:]/.test(ch)) {
      push(tokens, "punct", ch);
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /\s/.test(src[j])) j += 1;
      push(tokens, "", src.slice(i, j));
      i = j;
      continue;
    }
    if (/[0-9-]/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /[0-9.eE+-]/.test(src[j])) j += 1;
      push(tokens, "number", src.slice(i, j));
      i = j;
      continue;
    }
    const [ident, j] = takeIdent(src, i);
    if (ident) {
      push(tokens, ident === "true" || ident === "false" || ident === "null" ? "bool" : "", ident);
      i = j;
      continue;
    }
    push(tokens, "", ch);
    i += 1;
  }
  return tokens;
}

function tokenizeBash(src) {
  const tokens = [];
  const lines = src.split("\n");
  lines.forEach((line, index) => {
    if (index) push(tokens, "", "\n");
    const trimmed = line.trimStart();
    const indent = line.slice(0, line.length - trimmed.length);
    if (indent) push(tokens, "", indent);
    if (!trimmed) return;
    if (trimmed.startsWith("#")) {
      push(tokens, "comment", trimmed);
      return;
    }
    let i = 0;
    while (i < trimmed.length) {
      const ch = trimmed[i];
      const jumped = tokenizeStringsAndComments(trimmed, i, tokens, { hashComment: true });
      if (jumped >= 0) {
        i = jumped;
        continue;
      }
      if (ch === "$") {
        const [ident, j] = takeIdent(trimmed, i + 1);
        push(tokens, "key", `$${ident}`);
        i = ident ? j : i + 1;
        continue;
      }
      if (/\s/.test(ch)) {
        let j = i + 1;
        while (j < trimmed.length && /\s/.test(trimmed[j])) j += 1;
        push(tokens, "", trimmed.slice(i, j));
        i = j;
        continue;
      }
      const [ident, j] = takeIdent(trimmed, i);
      if (ident) {
        const first = i === 0 || /\s/.test(trimmed[i - 1] ?? " ");
        push(tokens, first ? "fn" : "", ident);
        i = j;
        continue;
      }
      push(tokens, "punct", ch);
      i += 1;
    }
  });
  return tokens;
}

function tokenizePlain(src) {
  if (!src) return [];
  const tokens = [];
  const re = /([\u2190-\u21FF\u2500-\u257F\u25A0-\u25FF]+|<-+|->+|<=+|=>+)/g;
  let last = 0;
  let match = re.exec(src);
  while (match) {
    if (match.index > last) push(tokens, "", src.slice(last, match.index));
    push(tokens, "diagram", match[1]);
    last = match.index + match[1].length;
    match = re.exec(src);
  }
  if (last < src.length) push(tokens, "", src.slice(last));
  return tokens;
}

export function tokenize(code, lang) {
  const src = String(code ?? "").replace(/\r\n/g, "\n").replace(/\n$/, "");
  const id = normalizeLang(lang);
  if (id === "yaml") return tokenizeYaml(src);
  if (id === "html" || id === "svg") return tokenizeHtml(src);
  if (id === "css") return tokenizeCss(src);
  if (id === "javascript") return tokenizeJavascript(src);
  if (id === "json") return tokenizeJson(src);
  if (id === "bash") return tokenizeBash(src);
  return tokenizePlain(src);
}

export function highlightLines(code, lang, options = {}) {
  const tokens = tokenize(code, lang);
  const lineClass = options.lineClass ?? "demo-line";
  let out = "";
  let line = "";
  const flush = () => {
    out += `<span class="${lineClass}">${line || " "}</span>`;
    line = "";
  };
  for (const token of tokens) {
    const parts = token.text.split("\n");
    for (let i = 0; i < parts.length; i += 1) {
      if (i > 0) flush();
      if (!parts[i]) continue;
      const esc = escapeHtml(parts[i]);
      line += token.type ? `<span class="tok tok-${token.type}">${esc}</span>` : esc;
    }
  }
  flush();
  return out;
}

function themeVars(theme) {
  if (theme === "light") {
    return `--paper:#eee8dc;--surface:#e7e1d4;--ink:#2a2a2a;--muted:#6a6a6a;--accent:#2a2a2a;--radius:12px;--hit:48px;--shadow:0 1px 1px rgb(42 42 42 / 0.12), 0 2px 8px rgb(42 42 42 / 0.08);`;
  }
  return `--paper:#000000;--surface:#111111;--ink:#c9c9c9;--muted:#8a8a8a;--accent:#c9c9c9;--radius:12px;--hit:48px;--shadow:0 1px 1px rgb(0 0 0 / 0.45), 0 2px 8px rgb(0 0 0 / 0.28);`;
}

const PREVIEW_BASE = `
html,body{margin:0;height:100%;background:var(--paper);color:var(--ink);font-family:Arimo,"Segoe UI Variable",ui-sans-serif,system-ui,sans-serif}
body{box-sizing:border-box;display:grid;place-items:center;padding:28px 24px}
*,*::before,*::after{box-sizing:border-box}
button,input,select{font:inherit}
`;

export function buildPreviewDocument({ code, lang, preview, css, theme }) {
  const id = normalizeLang(lang);
  const fragment = String(preview || code || "");
  if (!fragment.trim() && id !== "css") return "";
  if (/^\s*<(!DOCTYPE html|html[\s>])/i.test(fragment)) return fragment;
  const extra = String(css ?? "").trim();
  let body = fragment;
  if (!preview) {
    if (id === "css") {
      body = `<style>${fragment}</style><div class="specimen"><button type="button">Button</button><p>Preview text.</p></div>`;
    } else if (id === "javascript") {
      body = `<div id="root"></div><script>${fragment}<\/script>`;
    }
  }
  const scheme = theme === "light" ? "light" : "dark";
  return `<!DOCTYPE html><html lang="en" data-theme="${scheme}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>:root{color-scheme:${scheme};${themeVars(scheme)}}${PREVIEW_BASE}${extra ? `\n${extra}` : ""}</style></head><body>${body}</body></html>`;
}

export function isTerminalLang(lang) {
  return normalizeLang(lang) === "bash";
}
