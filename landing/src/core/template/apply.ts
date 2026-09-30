import { frameVariantFromTemplate, shadeVariantFromTemplate } from "../../../kit/js/modules/shade-variants.js";
import { composePageColorCss } from "./accent-policy.ts";
import { templatePaper, templateThemeCss, templateTokenStyle } from "./tokens.ts";

export function applyResolvedTemplate(
  view: Record<string, any>,
  resolved: Record<string, unknown> | undefined,
): Record<string, any> {
  if (!resolved || Object.keys(resolved).length === 0) return view;
  view.templateStyle = templateTokenStyle(resolved);
  view.templateThemeCss = templateThemeCss(resolved);
  const theme = view.brand?.theme === "light" ? "light" : "dark";
  view.pageColorCss = composePageColorCss({
    brandAccent: String(view.brand?.accent ?? "#c9c9c9"),
    template: resolved,
    theme,
  }).css;
  const darkPaper = templatePaper(resolved, "dark");
  const lightPaper = templatePaper(resolved, "light");
  if (darkPaper) view.themeColorDark = darkPaper;
  if (lightPaper) view.themeColorLight = lightPaper;
  const paper = theme === "light" ? lightPaper : darkPaper;
  if (paper) view.themeColor = paper;
  view.shadeVariant = shadeVariantFromTemplate(resolved);
  view.frameVariant = frameVariantFromTemplate(resolved);
  const typography = (resolved.tokens as { typography?: { stylesheet?: unknown } } | undefined)?.typography;
  if (typeof typography?.stylesheet === "string" && typography.stylesheet.startsWith("https://")) {
    view.fontStylesheet = typography.stylesheet;
  }
  const panels = (resolved.chrome as { panels?: { align?: unknown } } | undefined)?.panels;
  if (panels?.align === "center") view.panelAlign = "center";
  const column = (resolved.chrome as { column?: { variant?: unknown } } | undefined)?.column;
  if (column?.variant === "seamless") view.columnVariant = "seamless";
  return view;
}
