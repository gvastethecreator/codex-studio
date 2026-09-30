type ColorKey = "paper" | "surface" | "ink" | "muted" | "accent" | "backdrop";

const COLOR_VARS: Array<[ColorKey, string]> = [
  ["paper", "--paper"],
  ["surface", "--surface"],
  ["ink", "--ink"],
  ["muted", "--muted"],
  ["accent", "--accent"],
  ["backdrop", "--backdrop"],
];

function colorBag(value: unknown): Partial<Record<ColorKey, unknown>> | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as Partial<Record<ColorKey, unknown>>;
}

export function colorVars(color: Partial<Record<ColorKey, unknown>> | undefined): string {
  if (!color) return "";
  const parts: string[] = [];
  for (const [key, css] of COLOR_VARS) {
    const value = color[key];
    if (typeof value === "string" && value) parts.push(`${css}:${value}`);
  }
  return parts.join(";");
}

/** Non-color tokens. Safe on the html style attribute; colors must be theme-scoped. */
export function templateTokenStyle(template: Record<string, unknown> | undefined): string {
  const tokens = (template?.tokens ?? {}) as Record<string, Record<string, unknown>>;
  const type = tokens.typography ?? {};
  const layout = tokens.layout ?? {};
  const shape = tokens.shape ?? {};
  const motion = tokens.motion ?? {};
  const parts: string[] = [];
  const px = (value: unknown) => (typeof value === "number" ? `${value}px` : undefined);
  const ms = (value: unknown) => (typeof value === "number" ? `${value}ms` : undefined);
  const set = (prop: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    parts.push(`${prop}:${value}`);
  };
  if (typeof type.display === "string") {
    set("--display", `"${type.display}", "Segoe UI Variable", ui-sans-serif, system-ui, sans-serif`);
    set("--text", `"${type.text ?? type.display}", "Segoe UI Variable", ui-sans-serif, system-ui, sans-serif`);
  }
  if (typeof type.mono === "string") {
    set("--mono", `"${type.mono}", ui-monospace, "Cascadia Code", monospace`);
  }
  set("--max", px(layout.maxWidth));
  set("--header", px(layout.headerHeight));
  set("--radius", px(shape.radius));
  if (typeof shape.borderWidth === "number") set("--column-border-width", `${shape.borderWidth}px`);
  set("--duration", ms(motion.duration));
  if (typeof type.scale === "number" && type.scale !== 1) {
    parts.push(`font-size:${Math.round(type.scale * 100)}%`);
  }
  return parts.join(";");
}

export function templateThemeCss(template: Record<string, unknown> | undefined): string {
  const dark = colorVars(colorBag((template?.tokens as { color?: unknown } | undefined)?.color));
  const light = colorVars(
    colorBag(
      (template?.themes as { light?: { tokens?: { color?: unknown } } } | undefined)?.light?.tokens?.color,
    ),
  );
  const parts: string[] = [];
  if (dark) parts.push(`:root[data-template], :root[data-template][data-theme="dark"] { ${dark} }`);
  if (light) parts.push(`:root[data-template][data-theme="light"] { ${light} }`);
  return parts.join("\n");
}

export function templatePaper(
  template: Record<string, unknown> | undefined,
  theme: "light" | "dark",
): string | undefined {
  if (theme === "light") {
    const light = (template?.themes as { light?: { tokens?: { color?: { paper?: unknown } } } } | undefined)?.light
      ?.tokens?.color?.paper;
    if (typeof light === "string" && light) return light;
  }
  const paper = (template?.tokens as { color?: { paper?: unknown } } | undefined)?.color?.paper;
  return typeof paper === "string" && paper ? paper : undefined;
}

export function lightThemeStyle(template: Record<string, unknown> | undefined): string {
  return colorVars(
    colorBag((template?.themes as { light?: { tokens?: { color?: unknown } } } | undefined)?.light?.tokens?.color),
  );
}
