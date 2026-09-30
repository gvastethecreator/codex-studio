// Small CommonMark-ish renderer for embedded docs. Browser-safe; no deps.
import { escapeHtml, highlightLines, langLabel, normalizeLang } from "./js/modules/highlight.mjs";

function safeUrl(href) {
  const raw = String(href ?? "").trim();
  if (!raw) return "";
  if (/^\s*(javascript|data|vbscript):/i.test(raw)) return "";
  if (/^(https?:|mailto:|#|\/|\.\/|\.\.\/|[A-Za-z0-9_@.+-])/i.test(raw)) return raw;
  return "";
}

function resolveUrl(href, options = {}) {
  const raw = safeUrl(href);
  if (!raw) return "";
  if (/^(https?:|mailto:|#|\/)/i.test(raw)) return raw;
  const base = String(options.linkBase ?? "").replace(/\/?$/, "/");
  if (!base) return raw;
  return base + raw.replace(/^\.\//, "");
}

function renderInline(text, options) {
  const src = String(text ?? "");
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "`") {
      const end = src.indexOf("`", i + 1);
      if (end !== -1) {
        out += `<code>${escapeHtml(src.slice(i + 1, end))}</code>`;
        i = end + 1;
        continue;
      }
    }
    if (src.startsWith("**", i) || src.startsWith("__", i)) {
      const mark = src.slice(i, i + 2);
      const end = src.indexOf(mark, i + 2);
      if (end !== -1) {
        out += `<strong>${renderInline(src.slice(i + 2, end), options)}</strong>`;
        i = end + 2;
        continue;
      }
    }
    if ((src[i] === "*" || src[i] === "_") && src[i + 1] !== src[i]) {
      const mark = src[i];
      const end = src.indexOf(mark, i + 1);
      if (end !== -1 && src[end + 1] !== mark) {
        out += `<em>${renderInline(src.slice(i + 1, end), options)}</em>`;
        i = end + 1;
        continue;
      }
    }
    if (src.startsWith("~~", i)) {
      const end = src.indexOf("~~", i + 2);
      if (end !== -1) {
        out += `<del>${renderInline(src.slice(i + 2, end), options)}</del>`;
        i = end + 2;
        continue;
      }
    }
    if (src[i] === "[") {
      const close = src.indexOf("]", i + 1);
      const paren = close !== -1 && src[close + 1] === "(" ? src.indexOf(")", close + 2) : -1;
      if (close !== -1 && paren !== -1) {
        const label = src.slice(i + 1, close);
        const href = resolveUrl(src.slice(close + 2, paren), options);
        if (href) {
          const external = /^(https?:)/i.test(href);
          const rel = external ? ' rel="noreferrer" target="_blank"' : "";
          out += `<a href="${escapeHtml(href)}"${rel}>${renderInline(label, options)}</a>`;
          i = paren + 1;
          continue;
        }
      }
    }
    if (src[i] === "!" && src[i + 1] === "[") {
      const close = src.indexOf("]", i + 2);
      const paren = close !== -1 && src[close + 1] === "(" ? src.indexOf(")", close + 2) : -1;
      if (close !== -1 && paren !== -1) {
        const alt = src.slice(i + 2, close);
        const srcUrl = resolveUrl(src.slice(close + 2, paren), options);
        if (srcUrl) {
          out += `<img src="${escapeHtml(srcUrl)}" alt="${escapeHtml(alt)}">`;
          i = paren + 1;
          continue;
        }
      }
    }
    out += escapeHtml(src[i]);
    i += 1;
  }
  return out;
}

function fenceOpen(line) {
  const match = line.match(/^(```|~~~)([A-Za-z0-9_-]*)\s*$/);
  if (!match) return null;
  return { mark: match[1], lang: match[2] || "" };
}

function heading(line) {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

function isHr(line) {
  return /^(?:-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function listKind(line) {
  const ul = line.match(/^(\s*)([-*+])\s+(.+)$/);
  if (ul) return { type: "ul", indent: ul[1].length, text: ul[3] };
  const ol = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
  if (ol) return { type: "ol", indent: ol[1].length, text: ol[3] };
  return null;
}

function tableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line) {
  const cells = tableRow(line);
  if (!cells) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function flushParagraph(buf, options) {
  const text = buf.join(" ").trim();
  buf.length = 0;
  if (!text) return "";
  return `<p>${renderInline(text, options)}</p>`;
}

export function renderMarkdown(src, options = {}) {
  const lines = String(src ?? "").replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").split("\n");
  const out = [];
  const para = [];
  let i = 0;

  const flush = () => {
    const html = flushParagraph(para, options);
    if (html) out.push(html);
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    const fence = fenceOpen(trimmed);
    if (fence) {
      flush();
      const body = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== fence.mark) {
        body.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const lang = normalizeLang(fence.lang);
      const label = fence.lang ? `<span class="docs-code__lang">${escapeHtml(langLabel(lang))}</span>` : "";
      out.push(
        `<pre class="docs-code" data-lang="${escapeHtml(lang)}">${label}<code class="lang-${escapeHtml(lang)}">${highlightLines(body.join("\n"), lang, { lineClass: "docs-line" })}</code></pre>`,
      );
      continue;
    }

    if (isHr(trimmed)) {
      flush();
      out.push("<hr>");
      i += 1;
      continue;
    }

    const head = heading(trimmed);
    if (head) {
      flush();
      out.push(`<h${head.level}>${renderInline(head.text, options)}</h${head.level}>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      flush();
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote>${renderMarkdown(quote.join("\n"), options)}</blockquote>`);
      continue;
    }

    const row = tableRow(trimmed);
    if (row && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flush();
      const align = tableRow(lines[i + 1]).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "end";
        return "start";
      });
      i += 2;
      const body = [];
      while (i < lines.length) {
        const next = tableRow(lines[i].trim());
        if (!next) break;
        body.push(next);
        i += 1;
      }
      const th = row
        .map(
          (cell, index) =>
            `<th style="text-align:${align[index] ?? "start"}">${renderInline(cell, options)}</th>`,
        )
        .join("");
      const tb = body
        .map(
          (cells) =>
            `<tr>${cells
              .map(
                (cell, index) =>
                  `<td style="text-align:${align[index] ?? "start"}">${renderInline(cell, options)}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("");
      out.push(`<div class="docs-table"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`);
      continue;
    }

    const item = listKind(line);
    if (item) {
      flush();
      const type = item.type;
      const items = [];
      while (i < lines.length) {
        const next = listKind(lines[i]);
        if (!next || next.type !== type) break;
        if (next.indent < item.indent) break;
        items.push(next.text);
        i += 1;
      }
      out.push(
        `<${type}>${items.map((text) => `<li>${renderInline(text, options)}</li>`).join("")}</${type}>`,
      );
      continue;
    }

    if (!trimmed) {
      flush();
      i += 1;
      continue;
    }

    para.push(trimmed);
    i += 1;
  }

  flush();
  return out.join("\n");
}

export { escapeHtml };
