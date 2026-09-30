/** Project accent hues. Surfaces stay on paper/surface/ink. */

export const ACCENT_HUES = [
  "flamingo", "pink", "red", "coral", "mahogany", "apricot", "bronze", "orange",
  "amber", "mustard", "yellow", "turmeric", "pear", "avocado", "lime", "green",
  "emerald", "aquamarine", "turquoise", "cyan", "electric", "pelorus", "sky",
  "cerulean", "steel", "azure", "blue", "neon", "iris", "lavender", "violet",
  "purple", "fuchsia", "orchid", "byzantium", "mulberry",
];

const HUE_ANGLE = Object.fromEntries(ACCENT_HUES.map((name, index) => [name, index * 10]));

const STEPS = [
  [0.97, 0.02],
  [0.92, 0.05],
  [0.87, 0.1],
  [0.81, 0.15],
  [0.73, 0.23],
  [0.63, 0.29],
  [0.54, 0.24],
  [0.42, 0.19],
  [0.3, 0.13],
];

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function oklch(step, angle) {
  const [l, c] = STEPS[step - 1];
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${angle})`;
}

function parseHex(value) {
  let h = String(value ?? "").trim().replace(/^#/, "");
  if (h.length === 3 || h.length === 4) h = [...h].map((ch) => ch + ch).join("");
  if (h.length !== 6 && h.length !== 8) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function isHueName(value) {
  return ACCENT_HUES.includes(String(value ?? "").trim().toLowerCase());
}

export function isHexColor(value) {
  return HEX.test(String(value ?? "").trim());
}

export function isUntintedHex(value) {
  const rgb = parseHex(value);
  if (!rgb) return false;
  return Math.max(...rgb) - Math.min(...rgb) < 10;
}

function rampFromHex(hex) {
  const parts = [];
  const mixes = [0.12, 0.22, 0.34, 0.48, 0.62, 1, 0.82, 0.64, 0.48];
  for (let step = 1; step <= 9; step += 1) {
    const mix = mixes[step - 1];
    const other = step < 6 ? "white" : "black";
    const amount = step === 6 ? 100 : Math.round(mix * 100);
    parts.push(`--accent-${step}:color-mix(in oklch,${hex} ${amount}%,${other})`);
  }
  parts[5] = `--accent-6:${hex}`;
  return parts;
}

function grayRamp(hex) {
  return STEPS.map(([l], index) => `--accent-${index + 1}:oklch(${l.toFixed(3)} 0 0)`).concat([`--accent:${hex}`]);
}

export function resolveAccent(value) {
  const raw = String(value ?? "").trim();
  if (isHueName(raw)) {
    const hue = raw.toLowerCase();
    const angle = HUE_ANGLE[hue];
    const vars = [];
    for (let step = 1; step <= 9; step += 1) vars.push(`--accent-${step}:${oklch(step, angle)}`);
    vars.push(`--accent:${oklch(6, angle)}`);
    return {
      input: hue,
      hue,
      tinted: true,
      css: oklch(6, angle),
      style: vars.join(";"),
    };
  }
  if (isHexColor(raw)) {
    if (isUntintedHex(raw)) {
      return {
        input: raw,
        hue: "",
        tinted: false,
        css: raw,
        style: grayRamp(raw).join(";"),
      };
    }
    return {
      input: raw,
      hue: "",
      tinted: true,
      css: raw,
      style: [`--accent:${raw}`, ...rampFromHex(raw)].join(";"),
    };
  }
  return null;
}

const OKLCH_TRIPLE = /^oklch\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)(?:deg)?\s*\)$/i;

export function clampUnit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

export function scaleChroma(css, amount) {
  const t = clampUnit(amount);
  const raw = String(css ?? "").trim();
  if (!raw) return raw;
  const match = raw.match(OKLCH_TRIPLE);
  if (match) return `oklch(${match[1]} ${(Number(match[2]) * t).toFixed(3)} ${match[3]})`;
  if (t === 1) return raw;
  return `oklch(from ${raw} l calc(c * ${t}) h)`;
}

export function scaleAccentStyle(style, amount) {
  const t = clampUnit(amount);
  const block = String(style ?? "").trim();
  if (!block || t === 1) return block;
  return block
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const at = part.indexOf(":");
      if (at < 0) return part;
      return `${part.slice(0, at).trim()}:${scaleChroma(part.slice(at + 1).trim(), t)}`;
    })
    .join(";");
}

export function accentRootCss(style) {
  const block = String(style ?? "").trim();
  if (!block) return "";
  return `html:root, html:root[data-theme="dark"], html:root[data-theme="light"] { ${block} }`;
}

export function paletteCss() {
  const lines = [":root {"];
  for (const name of ACCENT_HUES) {
    const angle = HUE_ANGLE[name];
    for (let step = 1; step <= 9; step += 1) {
      lines.push(`  --${name}-${step}: ${oklch(step, angle)};`);
    }
  }
  lines.push("}");
  return `${lines.join("\n")}\n`;
}
