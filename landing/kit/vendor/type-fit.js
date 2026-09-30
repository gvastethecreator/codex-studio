const FIT_SELECTOR = ".hero-copy h1, .section-head h2, .about-head h2, .screens-copy h2";
const BALANCE_SELECTOR = ".lede, .closing__text";
const SIZE_STEPS = 20;

export function parsePx(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw || raw === "normal" || raw === "none") return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function cssLengthToPx(value, { rootPx = 16, emPx = 16, chPx = 8, percentBase = null } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "normal" || raw === "none") return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  if (raw.endsWith("%")) {
    if (percentBase == null) return null;
    return (n / 100) * percentBase;
  }
  if (raw.endsWith("rem")) return n * rootPx;
  if (raw.endsWith("em")) return n * emPx;
  if (raw.endsWith("ch")) return n * chPx;
  return n;
}

export function fontShorthand({ style = "normal", weight = "400", sizePx, family }) {
  const prefix = style && style !== "normal" ? `${style} ` : "";
  return `${prefix}${weight} ${sizePx}px ${family}`;
}

export function letterSpacingPx(letterSpacing, fontSizePx) {
  const raw = String(letterSpacing ?? "").trim();
  if (!raw || raw === "normal") return 0;
  if (raw.endsWith("em")) return parseFloat(raw) * fontSizePx;
  return parsePx(raw) || 0;
}

export function fitFontSize({ minPx, maxPx, width, maxLines, lineCountAt }) {
  const loBound = Math.min(minPx, maxPx);
  const hiBound = Math.max(minPx, maxPx);
  const budget = Math.max(1, maxLines);
  if (!(hiBound > 0) || width <= 0) return loBound;
  if (lineCountAt(hiBound, width) <= budget) return hiBound;
  let lo = loBound;
  let hi = hiBound;
  let best = loBound;
  for (let i = 0; i < SIZE_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (lineCountAt(mid, width) <= budget) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

export function isCentered(textAlign) {
  return textAlign === "center";
}

export function balanceWidth({ fullWidth, lineCountAt, naturalWidthAt, textAlign = "start" }) {
  const cap = Math.max(0, fullWidth);
  if (cap <= 0) return 0;
  const lines = lineCountAt(cap);
  if (!isCentered(textAlign) || lines > 1) return cap;
  const natural = typeof naturalWidthAt === "function" ? naturalWidthAt() : cap;
  return Math.min(cap, Math.max(0, natural));
}

export function targetText(el) {
  const visible = normalizeText(el && el.innerText);
  if (visible) return visible;
  return normalizeText(textWithBreaks(el) || (el && el.textContent));
}

function supported() {
  try {
    if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") return false;
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext && canvas.getContext("2d"));
  } catch {
    return false;
  }
}

function roundType(value) {
  return Math.round(value * 20) / 20;
}

function normalizeText(value) {
  return String(value || "")
    .replaceAll("\r\n", "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function textWithBreaks(el) {
  if (!el) return "";
  let out = "";
  const walk = (node) => {
    if (!node) return;
    if (node.nodeType === 3) {
      out += node.nodeValue || "";
      return;
    }
    if (node.nodeName === "BR") {
      out += "\n";
      return;
    }
    const kids = node.childNodes;
    if (!kids || !kids.length) return;
    for (let i = 0; i < kids.length; i++) walk(kids[i]);
  };
  walk(el);
  return out;
}

function maxLinesFor(el) {
  return el.matches(".hero-copy h1") ? 3 : 2;
}

function skipFit(el) {
  return Boolean(el.closest(".commands.has-keyboard"));
}

function parentInnerWidth(el) {
  const parent = el.parentElement;
  if (!parent) return 0;
  const cs = getComputedStyle(parent);
  return Math.max(0, parent.clientWidth - (parsePx(cs.paddingLeft) || 0) - (parsePx(cs.paddingRight) || 0));
}

function availableWidth(el) {
  const inner = parentInnerWidth(el);
  if (inner <= 0) return 0;
  const raw = getComputedStyle(el).getPropertyValue("--type-measure-max").trim();
  if (!raw || raw === "none") return inner;
  const rootPx = parsePx(getComputedStyle(document.documentElement).fontSize) || 16;
  const fontPx = parsePx(getComputedStyle(el).fontSize) || 16;
  const cap = cssLengthToPx(raw, {
    rootPx,
    emPx: fontPx,
    chPx: chWidth(el),
    percentBase: inner,
  });
  if (cap == null) return inner;
  return Math.min(inner, Math.max(0, cap));
}

function chWidth(el) {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return (parsePx(getComputedStyle(el).fontSize) || 16) * 0.5;
    ctx.font = getComputedStyle(el).font;
    const width = ctx.measureText("0").width;
    return width > 0 ? width : (parsePx(getComputedStyle(el).fontSize) || 16) * 0.5;
  } catch {
    return (parsePx(getComputedStyle(el).fontSize) || 16) * 0.5;
  }
}

function sizeRange(el) {
  const prev = el.style.getPropertyValue("--type-size");
  if (prev) el.style.removeProperty("--type-size");
  const style = getComputedStyle(el);
  const current = parsePx(style.fontSize) || 16;
  const rootPx = parsePx(getComputedStyle(document.documentElement).fontSize) || 16;
  const min = cssLengthToPx(style.getPropertyValue("--type-size-min"), { rootPx, emPx: current }) ?? current;
  if (prev) el.style.setProperty("--type-size", prev);
  return { minPx: Math.min(min, current), maxPx: current };
}

function spacingEm(el) {
  const style = getComputedStyle(el);
  const size = parsePx(style.fontSize) || 16;
  const px = letterSpacingPx(style.letterSpacing, size);
  return size ? px / size : 0;
}

// Pretext has no word-spacing. Spread a heading's extra space width over its letters instead,
// so a line measures a touch wider than it renders and never narrower.
function wordSpacingShare(el, text, sizePx) {
  const style = getComputedStyle(el);
  const size = parsePx(style.fontSize) || 16;
  const px = parsePx(style.wordSpacing) || 0;
  if (!px) return 0;
  const spaces = (text.match(/\s/g) || []).length;
  const letters = text.length - spaces;
  return letters > 0 ? ((px / size) * sizePx * spaces) / letters : 0;
}

function whiteSpaceFor(text) {
  return text.includes("\n") ? "pre-wrap" : "normal";
}

function applyMeasure(el, width, measure, textAlign) {
  const shrink = isCentered(textAlign) && measure < width - 0.5;
  // Round up with a pixel of room: a width rounded down by a fraction wraps the last word.
  if (shrink) return applyVar(el, "--type-measure", Math.min(width, Math.ceil(measure) + 1));
  if (el.style.getPropertyValue("--type-measure")) {
    el.style.removeProperty("--type-measure");
    return true;
  }
  return false;
}

function applyVar(el, name, value) {
  const next = `${roundType(value)}px`;
  if (el.style.getPropertyValue(name) === next) return false;
  el.style.setProperty(name, next);
  return true;
}

function refreshScroll() {
  const trigger = window.ScrollTrigger;
  if (trigger && typeof trigger.refresh === "function") trigger.refresh();
}

export async function initTypeFit() {
  if (!supported()) return;
  let pretext;
  try {
    pretext = await import(new URL("./pretext/layout.js", import.meta.url));
  } catch {
    return;
  }
  const { prepareWithSegments, measureLineStats, measureNaturalWidth } = pretext;
  if (typeof prepareWithSegments !== "function") return;

  const preparedCache = new Map();
  const prepareAt = (text, font, letterSpacing, whiteSpace) => {
    const key = `${text}\0${font}\0${letterSpacing}\0${whiteSpace}`;
    let handle = preparedCache.get(key);
    if (handle) return handle;
    handle = prepareWithSegments(text, font, { letterSpacing, whiteSpace });
    preparedCache.set(key, handle);
    return handle;
  };

  const measurer = (el, text, sizePx) => {
    const style = getComputedStyle(el);
    const font = fontShorthand({
      style: style.fontStyle,
      weight: style.fontWeight,
      sizePx,
      family: style.fontFamily,
    });
    const spacing = letterSpacingPx(`${spacingEm(el)}em`, sizePx) + wordSpacingShare(el, text, sizePx);
    const whiteSpace = whiteSpaceFor(text);
    const prepared = prepareAt(text, font, spacing, whiteSpace);
    return {
      lineCount(width) {
        const stats = measureLineStats(prepared, Math.max(1, width));
        return Math.max(1, stats.lineCount || 1);
      },
      naturalWidth() {
        return measureNaturalWidth(prepared);
      },
    };
  };

  const collect = () => {
    const fit = [...document.querySelectorAll(FIT_SELECTOR)].filter((el) => !skipFit(el));
    const balance = [...document.querySelectorAll(BALANCE_SELECTOR)];
    return { fit, balance };
  };

  let queued = false;

  const applyAll = () => {
    const { fit, balance } = collect();
    let changed = false;
    for (const el of fit) {
      try {
        const text = targetText(el);
        const width = availableWidth(el);
        if (!text || width < 8) continue;
        const { minPx, maxPx } = sizeRange(el);
        const size = roundType(
          fitFontSize({
            minPx,
            maxPx,
            width,
            maxLines: maxLinesFor(el),
            lineCountAt: (candidate, cap) => measurer(el, text, candidate).lineCount(cap),
          }),
        );
        const atSize = measurer(el, text, size);
        const textAlign = getComputedStyle(el).textAlign;
        const measure = roundType(
          balanceWidth({
            fullWidth: width,
            lineCountAt: (cap) => atSize.lineCount(cap),
            naturalWidthAt: () => atSize.naturalWidth(),
            textAlign,
          }),
        );
        if (applyVar(el, "--type-size", size)) changed = true;
        if (applyMeasure(el, width, measure, textAlign)) changed = true;
      } catch {}
    }
    for (const el of balance) {
      try {
        const text = targetText(el);
        const width = availableWidth(el);
        if (!text || width < 8) continue;
        const size = parsePx(getComputedStyle(el).fontSize) || 16;
        const atSize = measurer(el, text, size);
        const textAlign = getComputedStyle(el).textAlign;
        const measure = roundType(
          balanceWidth({
            fullWidth: width,
            lineCountAt: (cap) => atSize.lineCount(cap),
            naturalWidthAt: () => atSize.naturalWidth(),
            textAlign,
          }),
        );
        if (applyMeasure(el, width, measure, textAlign)) changed = true;
      } catch {}
    }
    if (changed) refreshScroll();
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyAll();
    });
  };

  const start = () => {
    schedule();
    window.addEventListener("load", schedule);
    window.setTimeout(schedule, 80);
    window.setTimeout(schedule, 480);
    const column = document.querySelector(".column") || document.body;
    if (typeof ResizeObserver === "function" && column) {
      const observer = new ResizeObserver(schedule);
      observer.observe(column);
    }
    window.addEventListener("resize", schedule);
    // Web fonts from a template stylesheet can land after the first fit; measure again.
    document.fonts?.addEventListener?.("loadingdone", schedule);
  };

  const fonts = document.fonts;
  if (fonts && fonts.ready) {
    fonts.ready.then(start).catch(start);
  } else {
    start();
  }
}

if (typeof document !== "undefined") {
  initTypeFit();
}
