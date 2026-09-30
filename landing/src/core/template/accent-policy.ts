import { accentRootCss, resolveAccent } from "../../../kit/accent.mjs";
import { frameVariantFromTemplate, shadeVariantFromTemplate } from "../../../kit/js/modules/shade-variants.js";
import { templateThemeCss } from "./tokens.ts";

/** Status roles stay fixed. actionStyle must not repaint them. */
export const STATUS_ROLE_CSS =
  "--status-danger:#b42318;--status-success:#067647;--status-warning:#b54708;--status-info:#175cd3";

export type AccentPolicySource = "project" | "template" | "legacy";
export type ActionStyle = "accent" | "neutral";

type TemplateDoc = Record<string, any> | undefined;

function bag(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function baseColor(template: TemplateDoc): Record<string, unknown> {
  return bag(bag(template?.tokens).color);
}

function themeColor(template: TemplateDoc, theme: "light" | "dark"): Record<string, unknown> {
  return bag(bag(bag(bag(template?.themes)?.[theme]).tokens).color);
}

export function readAccentPolicy(template: TemplateDoc): {
  source: AccentPolicySource;
  actionStyle: ActionStyle;
  error?: string;
} {
  for (const theme of ["dark", "light"] as const) {
    const scoped = themeColor(template, theme);
    if ("accentSource" in scoped || "actionStyle" in scoped) {
      return {
        source: "legacy",
        actionStyle: "neutral",
        error: "accentSource and actionStyle are allowed only on base tokens.color.",
      };
    }
  }
  const color = baseColor(template);
  const source = color.accentSource;
  const action = color.actionStyle;
  return {
    source: source === "project" || source === "template" || source === "legacy" ? source : "legacy",
    actionStyle: action === "accent" || action === "neutral" ? action : "neutral",
  };
}

export function colorMigrationReport(
  pages: Array<{ path: string; brandAccent: string; template: TemplateDoc }>,
): Array<{ path: string; source: AccentPolicySource; wouldChange: boolean; migrated: false }> {
  return pages.map((page) => {
    const current = composePageColorCss({ brandAccent: page.brandAccent, template: page.template, theme: "dark" });
    const proposed = structuredClone(page.template ?? {});
    proposed.tokens = { ...(proposed.tokens ?? {}) };
    proposed.tokens.color = { ...(proposed.tokens.color ?? {}), accentSource: "project" };
    const next = composePageColorCss({ brandAccent: page.brandAccent, template: proposed, theme: "dark" });
    return {
      path: page.path,
      source: current.source,
      wouldChange: current.css !== next.css,
      migrated: false,
    };
  });
}

export function presentationFields(template: TemplateDoc): { frame: string; shade: string } {
  return {
    frame: frameVariantFromTemplate(template ?? {}),
    shade: shadeVariantFromTemplate(template ?? {}),
  };
}

function accentInput(template: TemplateDoc, theme: "light" | "dark", brandAccent: string, source: AccentPolicySource): string {
  if (source === "project") return String(brandAccent || "#c9c9c9");
  const base = baseColor(template).accent;
  const themed = themeColor(template, theme).accent;
  const chosen = typeof themed === "string" && themed ? themed : base;
  return typeof chosen === "string" && chosen ? chosen : "#c9c9c9";
}

// Text on an accent fill: near-black or white, whichever contrasts more (WCAG luminance;
// the two meet at 0.179). The theme paper is not used: a light paper on a mid accent fails AA.
export function textOnAccent(hex: string): string | null {
  const match = /^#([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!match) return null;
  const [r, g, b] = [0, 2, 4].map((at) => {
    const c = parseInt(match[1].slice(at, at + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#0b0a10" : "#ffffff";
}

function actionCss(actionStyle: ActionStyle, accentCss: string, accentHex: string, template: TemplateDoc, theme: "light" | "dark"): string {
  const color = { ...baseColor(template), ...themeColor(template, theme) };
  const ink = typeof color.ink === "string" ? color.ink : "#c9c9c9";
  const paper = typeof color.paper === "string" ? color.paper : "#000000";
  // var(--accent) keeps accent buttons in step when the page accent changes at runtime.
  if (actionStyle === "accent") return `--action-bg:var(--accent, ${accentCss});--action-fg:${textOnAccent(accentHex) ?? paper}`;
  return `--action-bg:${ink};--action-fg:${paper}`;
}

function stripAccentDecls(css: string): string {
  return css.replace(/--accent:[^;]*;?/g, "");
}

// A declaration block without a closing ";" would swallow the next one: "--muted:#aaa--accent:#b"
// is one custom property, and --accent stays undeclared.
function endDeclarations(body: string): string {
  const kept = body.trim();
  return kept && !kept.endsWith(";") ? `${kept};` : kept;
}

function embed(themeCss: string, extra: string): string {
  const neutral = stripAccentDecls(themeCss);
  if (!neutral.includes("{")) return extra;
  return neutral.replace(/\{([^}]*)\}/g, (_all, body) => `{ ${endDeclarations(body)}${extra}}`);
}

export function composePageColorCss(input: {
  brandAccent: string;
  template: TemplateDoc;
  theme?: "light" | "dark";
}): { css: string; source: AccentPolicySource; actionStyle: ActionStyle; error?: string } {
  const policy = readAccentPolicy(input.template);
  const brand = resolveAccent(input.brandAccent) ?? resolveAccent("#c9c9c9");
  const legacy = `${accentRootCss(brand.style)}\n${templateThemeCss(input.template)}`;
  if (policy.error || policy.source === "legacy") {
    return { css: legacy, source: "legacy", actionStyle: policy.actionStyle, error: policy.error };
  }
  const theme = input.theme === "light" ? "light" : "dark";
  const blocks = (["dark", "light"] as const).map((mode) => {
    const value = accentInput(input.template, mode, input.brandAccent, policy.source);
    const resolved = resolveAccent(value) ?? resolveAccent("#c9c9c9");
    const extra = `${resolved.style};${STATUS_ROLE_CSS};${actionCss(policy.actionStyle, resolved.css, value, input.template, mode)}`;
    return { mode, extra };
  });
  const themed = templateThemeCss(input.template);
  if (!themed.trim()) {
    const active = blocks.find((item) => item.mode === theme) ?? blocks[0];
    return { css: accentRootCss(active.extra), source: policy.source, actionStyle: policy.actionStyle };
  }
  let css = themed;
  for (const block of blocks) {
    const marker = block.mode === "light" ? '[data-theme="light"]' : '[data-theme="dark"]';
    css = css.replace(new RegExp(`([^{]*${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^{]*\\{)([^}]*)(\\})`), (_all, open, body, close) => {
      return `${open}${endDeclarations(stripAccentDecls(body))}${block.extra}${close}`;
    });
  }
  if (!css.includes("--accent-1:")) css = embed(themed, blocks[0].extra);
  return { css, source: policy.source, actionStyle: policy.actionStyle };
}
