import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { prepareSiteDocument, loadYaml } from "../../kit/engine.mjs";
import { applySectionVariants, resolveTemplateChain } from "./template/resolver.ts";
import { templateShowcase } from "./template/showcases.ts";
import { applyResolvedTemplate } from "./template/apply.ts";

export type SiteConfig = Record<string, any>;

const defaultSitePath = () => resolve(process.cwd(), process.env.GVASTE_SITE_YAML ?? "site.yaml");

export { applyResolvedTemplate };

export function applyTemplateDocument(
  view: SiteConfig,
  authored: Record<string, unknown> | undefined,
): SiteConfig {
  if (!authored || Object.keys(authored).length === 0) return view;
  return applyResolvedTemplate(view, resolveTemplateChain(authored).resolved);
}

export function loadSite(path = defaultSitePath(), options: { templatePath?: string } = {}): SiteConfig {
  const raw = loadYaml(path) as Record<string, unknown>;
  const templatePath = options.templatePath ?? resolve(dirname(path), "template.yaml");
  let authored: Record<string, unknown> | undefined;
  if (existsSync(templatePath)) {
    authored = (parseYaml(readFileSync(templatePath, "utf8")) ?? {}) as Record<string, unknown>;
  }
  const resolved = authored ? resolveTemplateChain(authored).resolved : undefined;
  const view = prepareSiteDocument(path, applySectionVariants(raw, resolved as Record<string, unknown> | undefined)) as SiteConfig;
  if (authored) applyTemplateDocument(view, authored);
  return view;
}

export function loadTemplateShowcase(id: string, root = process.cwd()): SiteConfig {
  const spec = templateShowcase(id);
  if (!spec) throw new Error(`Unknown template showcase "${id}"`);
  const yamlPath = join(root, "examples", spec.example, "site.yaml");
  const templatePath = join(root, "templates", `${id}.yaml`);
  const raw = (parseYaml(readFileSync(yamlPath, "utf8")) ?? {}) as Record<string, any>;
  raw.brand = { ...raw.brand, theme: spec.theme, accent: spec.accent };
  if (spec.heroGallery?.length) {
    raw.hero = { ...raw.hero, gallery: spec.heroGallery };
  }
  let authored: Record<string, unknown> | undefined;
  if (existsSync(templatePath)) {
    authored = (parseYaml(readFileSync(templatePath, "utf8")) ?? {}) as Record<string, unknown>;
  }
  const resolved = authored ? resolveTemplateChain(authored).resolved : undefined;
  const view = prepareSiteDocument(yamlPath, applySectionVariants(raw, resolved as Record<string, unknown> | undefined)) as SiteConfig;
  if (authored) applyTemplateDocument(view, authored);
  return view;
}
