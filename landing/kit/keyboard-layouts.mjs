// Physical keyboard form factors. Skin (windows / mac / terminal / schematic) is separate.

const LAYOUT_ALIASES = new Map([
  ["100", "100"],
  ["100%", "100"],
  ["full", "100"],
  ["full-size", "100"],
  ["fullsize", "100"],
  ["1800", "1800"],
  ["96", "96"],
  ["96%", "96"],
  ["96-compact", "96"],
  ["tkl", "tkl"],
  ["80", "tkl"],
  ["80%", "tkl"],
  ["tenkeyless", "tkl"],
  ["75-exploded", "75-exploded"],
  ["75e", "75-exploded"],
  ["75", "75"],
  ["75%", "75"],
  ["75-compact", "75"],
  ["65-exploded", "65-exploded"],
  ["65e", "65-exploded"],
  ["65", "65"],
  ["65%", "65"],
  ["65-compact", "65"],
  ["60", "60"],
  ["60%", "60"],
  ["50", "50"],
  ["50%", "50"],
  ["40", "40"],
  ["40%", "40"],
]);

export const MAC_LAYOUTS = new Set(["100", "tkl", "75", "75-exploded", "60"]);

const NUM_ALTS = {
  1: "!",
  2: "@",
  3: "#",
  4: "$",
  5: "%",
  6: "^",
  7: "&",
  8: "*",
  9: "(",
  0: ")",
};

function letters(text) {
  return [...String(text)].map((key) => ({ key }));
}

function numberRow() {
  return [
    { key: "`", bind: "backtick", alt: "~" },
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => ({ key: String(n), alt: NUM_ALTS[n] })),
    { key: "-", bind: "minus", alt: "_" },
    { key: "=", bind: "equal", alt: "+" },
    { key: "backspace", width: 2, mod: true },
  ];
}

function qRow() {
  return [
    { key: "tab", width: 1.5, mod: true },
    ...letters("qwertyuiop"),
    { key: "[", bind: "lbracket", alt: "{" },
    { key: "]", bind: "rbracket", alt: "}" },
    { key: "\\", bind: "backslash", alt: "|", width: 1.5 },
  ];
}

function aRow() {
  return [
    { key: "caps", bind: "capslock", width: 1.75, mod: true },
    ...letters("asdfghjkl"),
    { key: ";", bind: "semicolon", alt: ":" },
    { key: "'", bind: "quote", alt: '"' },
    { key: "enter", width: 2.25, mod: true },
  ];
}

function zRow() {
  return [
    { key: "lshift", bind: "shift", width: 2.25, mod: true },
    ...letters("zxcvbnm"),
    { key: ",", bind: "comma", alt: "<" },
    { key: ".", bind: "period", alt: ">" },
    { key: "/", bind: "slash", alt: "?" },
    { key: "rshift", bind: "shift", width: 2.75, mod: true },
  ];
}

function bottomFull() {
  return [
    { key: "lctrl", bind: "control", width: 1.25, mod: true },
    { key: "lwin", bind: "meta", width: 1.25, mod: true },
    { key: "lalt", bind: "alt", width: 1.25, mod: true },
    { key: "space", width: 6.25 },
    { key: "ralt", bind: "alt", width: 1.25, mod: true },
    { key: "rwin", bind: "meta", width: 1.25, mod: true },
    { key: "rctx", width: 1.25, mod: true },
    { key: "rctrl", bind: "control", width: 1.25, mod: true },
  ];
}

function bottomShort(extra = []) {
  return [
    { key: "lctrl", bind: "control", width: 1.25, mod: true },
    { key: "lwin", bind: "meta", width: 1.25, mod: true },
    { key: "lalt", bind: "alt", width: 1.25, mod: true },
    { key: "space", width: 6.25 },
    { key: "ralt", bind: "alt", width: 1.25, mod: true },
    ...extra,
  ];
}

function fKeys() {
  return Array.from({ length: 12 }, (_, index) => ({ key: `f${index + 1}`, fn: true }));
}

function k(key, extra = {}) {
  return { key, bind: extra.bind ?? key, mod: extra.mod ?? true, ...extra };
}

const SYS = [k("printscreen"), k("scrolllock"), k("pause")];
const ESC = k("escape", { bind: "escape" });

export const NUMPAD_KEYS = [
  { key: "numlock", bind: "numlock", mod: true, area: "nl" },
  { key: "npdiv", bind: "npdiv", area: "div" },
  { key: "npmul", bind: "npmul", area: "mul" },
  { key: "npsub", bind: "npsub", area: "sub" },
  { key: "np7", bind: "np7", area: "n7" },
  { key: "np8", bind: "np8", area: "n8" },
  { key: "np9", bind: "np9", area: "n9" },
  { key: "npadd", bind: "npadd", area: "add" },
  { key: "np4", bind: "np4", area: "n4" },
  { key: "np5", bind: "np5", area: "n5" },
  { key: "np6", bind: "np6", area: "n6" },
  { key: "np1", bind: "np1", area: "n1" },
  { key: "np2", bind: "np2", area: "n2" },
  { key: "np3", bind: "np3", area: "n3" },
  { key: "npenter", bind: "npenter", mod: true, area: "ent" },
  { key: "np0", bind: "np0", area: "n0" },
  { key: "npdot", bind: "npdot", area: "dot" },
];

export const ARROW_KEYS = [
  { key: "up", bind: "up" },
  { key: "left", bind: "left" },
  { key: "down", bind: "down" },
  { key: "right", bind: "right" },
];

export const NAV_ISLAND = {
  top: [k("insert"), k("home"), k("pageup", { bind: "pageup" })],
  bot: [k("delete", { bind: "delete" }), k("end"), k("pagedown", { bind: "pagedown" })],
};

function countKeys(spec) {
  if (!spec) return 0;
  let n = 0;
  if (spec.fn) {
    for (const cluster of spec.fn) n += cluster.length;
  }
  if (spec.nav) n += 6 + 4;
  if (spec.numpad) n += 17;
  for (const row of spec.rows ?? []) {
    n += (row.main ?? []).length;
    n += (row.rail ?? []).length;
    if (row.arrows) n += spec.nav ? 0 : 4;
  }
  return n;
}

export const LAYOUTS = {
  40: {
    id: "40",
    title: "40%",
    cols: 12.25,
    gap: 0,
    exploded: false,
    rows: [
      {
        main: [
          { key: "tab", width: 1.25, mod: true },
          ...letters("qwertyuiop"),
          { key: "[", bind: "lbracket", alt: "{" },
        ],
      },
      {
        main: [
          { key: "caps", bind: "capslock", width: 1.5, mod: true },
          ...letters("asdfghjkl"),
          { key: ";", bind: "semicolon", alt: ":" },
        ],
      },
      {
        main: [
          { key: "lshift", bind: "shift", width: 1.75, mod: true },
          ...letters("zxcvbnm"),
          { key: ".", bind: "period", alt: ">" },
          { key: "/", bind: "slash", alt: "?" },
        ],
      },
      {
        main: [
          { key: "lctrl", bind: "control", width: 1.25, mod: true },
          { key: "lwin", bind: "meta", width: 1.25, mod: true },
          { key: "lalt", bind: "alt", width: 1.25, mod: true },
          { key: "space", width: 3.5 },
          { key: "ralt", bind: "alt", width: 1.25, mod: true },
          { key: "rctx", width: 1.25, mod: true },
          { key: "fn", bind: "fn", width: 1.25, mod: true },
          { key: "rctrl", bind: "control", width: 1 },
        ],
      },
    ],
  },
  50: {
    id: "50",
    title: "50%",
    cols: 16.5,
    gap: 0,
    exploded: false,
    rows: [
      { main: qRow(), rail: [k("delete", { bind: "delete" })] },
      { main: aRow(), rail: [k("pageup", { bind: "pageup" })] },
      { main: zRow(), rail: [k("pagedown", { bind: "pagedown" })] },
      { main: bottomFull() },
    ],
  },
  60: {
    id: "60",
    title: "60%",
    cols: 15.43,
    gap: 0,
    exploded: false,
    packed: false,
    rows: [
      { main: numberRow() },
      { main: qRow() },
      { main: aRow() },
      { main: zRow() },
      { main: bottomFull() },
    ],
  },
  65: {
    id: "65",
    title: "65% compact",
    cols: 18.25,
    gap: 0,
    exploded: false,
    rows: [
      { main: numberRow(), rail: [k("delete", { bind: "delete" }), k("end"), k("pagedown", { bind: "pagedown" })] },
      { main: qRow(), rail: [k("pageup", { bind: "pageup" })] },
      { main: aRow(), rail: [k("home")] },
      { main: zRow(), rail: [{ key: "up", bind: "up" }] },
      {
        main: [
          ...bottomShort([{ key: "rctrl", bind: "control", width: 1.25, mod: true }]),
          { key: "left", bind: "left" },
          { key: "down", bind: "down" },
          { key: "right", bind: "right" },
        ],
      },
    ],
  },
  "65-exploded": {
    id: "65-exploded",
    title: "65% exploded",
    cols: 18.9,
    gap: 0.45,
    exploded: true,
    rows: [
      { main: numberRow(), rail: [k("delete", { bind: "delete" }), k("home")] },
      { main: qRow(), rail: [k("pageup", { bind: "pageup" })] },
      { main: aRow(), rail: [k("pagedown", { bind: "pagedown" })] },
      { main: zRow() },
      { main: bottomShort([{ key: "rctrl", bind: "control", width: 1.25, mod: true }]), arrows: true },
    ],
  },
  75: {
    id: "75",
    title: "75% compact",
    cols: 19.5,
    gap: 0,
    exploded: false,
    fn: [[ESC, ...fKeys(), k("delete", { bind: "delete" }), k("insert"), k("home")]],
    rows: [
      { main: numberRow(), rail: [k("pageup", { bind: "pageup" })] },
      { main: qRow(), rail: [k("pagedown", { bind: "pagedown" })] },
      { main: aRow(), rail: [k("end")] },
      { main: zRow(), rail: [{ key: "up", bind: "up" }] },
      {
        main: [
          ...bottomShort([
            { key: "rwin", bind: "meta", width: 1.25, mod: true },
            { key: "rctx", width: 1.25, mod: true },
            { key: "rctrl", bind: "control", width: 1.25, mod: true },
          ]),
          { key: "left", bind: "left" },
          { key: "down", bind: "down" },
          { key: "right", bind: "right" },
        ],
      },
    ],
  },
  "75-exploded": {
    id: "75-exploded",
    title: "75% exploded",
    cols: 19.4,
    gap: 0.45,
    exploded: true,
    fn: [[ESC, ...fKeys()], [k("delete", { bind: "delete" }), k("insert")]],
    rows: [
      { main: numberRow(), rail: [k("pageup", { bind: "pageup" })] },
      { main: qRow(), rail: [k("pagedown", { bind: "pagedown" })] },
      { main: aRow(), rail: [k("home")] },
      { main: zRow(), rail: [k("end")] },
      { main: bottomShort([{ key: "rctrl", bind: "control", width: 1.25, mod: true }]), arrows: true },
    ],
  },
  tkl: {
    id: "tkl",
    title: "80% TKL",
    cols: 18.5,
    gap: 0.45,
    exploded: true,
    fn: [[ESC], fKeys().slice(0, 4), fKeys().slice(4, 8), fKeys().slice(8, 12), SYS],
    rows: [
      { main: numberRow() },
      { main: qRow() },
      { main: aRow() },
      { main: zRow() },
      { main: bottomFull() },
    ],
    nav: true,
  },
  100: {
    id: "100",
    title: "100% full size",
    cols: 23.4,
    gap: 0.45,
    exploded: true,
    fn: [[ESC], fKeys().slice(0, 4), fKeys().slice(4, 8), fKeys().slice(8, 12), SYS],
    rows: [
      { main: numberRow() },
      { main: qRow() },
      { main: aRow() },
      { main: zRow() },
      { main: bottomFull() },
    ],
    nav: true,
    numpad: true,
  },
  1800: {
    id: "1800",
    title: "1800",
    cols: 22.4,
    gap: 0.25,
    exploded: true,
    fn: [[ESC, ...fKeys()]],
    rows: [
      { main: numberRow(), rail: [k("delete", { bind: "delete" }), k("home"), k("pageup", { bind: "pageup" })] },
      { main: qRow() },
      { main: aRow(), rail: [k("pagedown", { bind: "pagedown" })] },
      { main: zRow(), rail: [{ key: "up", bind: "up" }] },
      {
        main: [
          ...bottomShort(),
          { key: "left", bind: "left" },
          { key: "down", bind: "down" },
          { key: "right", bind: "right" },
        ],
      },
    ],
    numpad: true,
  },
  96: {
    id: "96",
    title: "96% compact",
    cols: 22.6,
    gap: 0,
    exploded: false,
    fn: [[ESC, ...fKeys(), k("delete", { bind: "delete" })]],
    rows: [
      { main: numberRow(), rail: [k("insert"), k("home"), k("pageup", { bind: "pageup" })] },
      { main: qRow() },
      { main: aRow(), rail: [k("pagedown", { bind: "pagedown" })] },
      { main: zRow(), rail: [{ key: "up", bind: "up" }] },
      {
        main: [
          ...bottomShort([{ key: "rctrl", bind: "control", width: 1.25, mod: true }]),
          { key: "left", bind: "left" },
          { key: "down", bind: "down" },
          { key: "right", bind: "right" },
        ],
      },
    ],
    numpad: true,
  },
};

for (const layout of Object.values(LAYOUTS)) {
  layout.keys = countKeys(layout);
}

export function layoutKeyCount(id) {
  return LAYOUTS[id]?.keys ?? 0;
}

export function commandsKeyboardLayout(value) {
  if (value == null) return null;
  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;
  return LAYOUT_ALIASES.get(raw) ?? false;
}

export function getKeyboardLayout(id) {
  return LAYOUTS[id] ?? null;
}

export const LAYOUT_CATALOG = [
  "100",
  "1800",
  "96",
  "tkl",
  "75-exploded",
  "75",
  "65-exploded",
  "65",
  "60",
  "50",
  "40",
].map((id) => {
  const layout = LAYOUTS[id];
  return {
    id,
    title: layout.title,
    keys: layout.keys,
    exploded: layout.exploded,
    mac: MAC_LAYOUTS.has(id),
  };
});

export const LAYOUT_ENUM = [...new Set(LAYOUT_ALIASES.keys())];
