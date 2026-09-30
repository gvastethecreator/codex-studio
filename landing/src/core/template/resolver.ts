import { TEMPLATE_LIBRARY } from "../../studio/generated/kit-manifest.ts";
import { DEFAULT_TEMPLATE, type TemplateDocument } from "./defaults.ts";
import { deepMerge } from "./merge.ts";

export interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  document: TemplateDocument;
}

const TEMPLATE_CARDS: Omit<BuiltinTemplate, "document">[] = [
  { id: "default", name: "Default", description: "Production baseline. Reproduces kit/tokens.css.", tags: ["baseline", "landing"] },
  { id: "editorial-dark", name: "Editorial Dark", description: "Wider measure, quieter chrome, editorial hero.", tags: ["dark", "editorial", "landing"] },
  { id: "technical-mono", name: "Technical Mono", description: "Monospace, cooler ink, tighter radius.", tags: ["dark", "mono", "landing"] },
  { id: "soft-product", name: "Soft Product", description: "Light paper, larger radius, product density.", tags: ["light", "landing"] },
  { id: "terminal", name: "Terminal", description: "Green-on-black, zero radius.", tags: ["dark", "mono", "landing"] },
  { id: "profile-standard", name: "Profile Standard", description: "Identity aside, yearly heatmap, feed, and repositories.", tags: ["dark", "profile"] },
  { id: "profile-folio", name: "Profile Folio", description: "Editorial character folio in five chapters.", tags: ["dark", "profile", "editorial"] },
  { id: "profile-observatory", name: "Profile Observatory", description: "Rhythm chart, repository filters, and recent counts.", tags: ["dark", "profile"] },
  { id: "profile-heatmap", name: "Profile Heatmap", description: "Accessible daily grid with selected-day detail.", tags: ["dark", "profile"] },
  { id: "profile-orbit", name: "Profile Orbit", description: "SVG year terrain. No WebGL.", tags: ["dark", "profile", "mono"] },
  { id: "profile-projects", name: "Profile Projects", description: "Searchable public repository catalog.", tags: ["dark", "profile"] },
];

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = TEMPLATE_CARDS.map((card) => ({
  ...card,
  name: String(TEMPLATE_LIBRARY[card.id]?.name ?? card.name),
  document: (TEMPLATE_LIBRARY[card.id] ?? {}) as TemplateDocument,
}));

export function builtinById(id: string): BuiltinTemplate | undefined {
  return BUILTIN_TEMPLATES.find((item) => item.id === id);
}

const META = new Set(["schema", "name", "extends"]);

function stripMeta(doc: TemplateDocument): TemplateDocument {
  const next: TemplateDocument = {};
  for (const [key, value] of Object.entries(doc)) {
    if (!META.has(key)) next[key] = value;
  }
  return next;
}

export interface ResolveOptions {
  library?: Record<string, TemplateDocument>;
}

export interface ResolveResult {
  resolved: TemplateDocument;
  diagnostics: { message: string; path: string }[];
}

function defaultLibrary(): Record<string, TemplateDocument> {
  const library: Record<string, TemplateDocument> = {};
  for (const item of BUILTIN_TEMPLATES) library[item.id] = item.document;
  return library;
}

/**
 * Resolve default + inherited + authored template data.
 * Merge order: default → each extends ancestor → authored overrides.
 */
export function resolveTemplateChain(
  authored: TemplateDocument | undefined,
  options: ResolveOptions = {},
): ResolveResult {
  const library = options.library ?? defaultLibrary();
  const diagnostics: { message: string; path: string }[] = [];
  const chain: TemplateDocument[] = [];
  const seen = new Set<string>();
  let current = authored;
  let hops = 0;
  while (current && hops < 8) {
    hops += 1;
    chain.push(current);
    const parentId = typeof current.extends === "string" ? current.extends : "";
    if (!parentId) break;
    if (seen.has(parentId)) {
      diagnostics.push({ message: `template inheritance cycle at "${parentId}"`, path: "/template/extends" });
      break;
    }
    seen.add(parentId);
    const parent = library[parentId];
    if (!parent) {
      diagnostics.push({ message: `unknown template "${parentId}"`, path: "/template/extends" });
      break;
    }
    current = parent;
  }
  if (hops >= 8) {
    diagnostics.push({ message: "template inheritance exceeded max depth", path: "/template/extends" });
  }

  let resolved: TemplateDocument = structuredClone(DEFAULT_TEMPLATE) as TemplateDocument;
  for (const node of [...chain].reverse()) {
    resolved = deepMerge(resolved, stripMeta(node));
    if (typeof node.name === "string") resolved.name = node.name;
  }
  if (authored && typeof authored.name === "string") resolved.name = authored.name;
  resolved.schema = DEFAULT_TEMPLATE.schema;
  delete resolved.extends;
  return { resolved, diagnostics };
}

export function flattenTemplate(authored: TemplateDocument | undefined): TemplateDocument {
  const { resolved } = resolveTemplateChain(authored);
  const flat: TemplateDocument = { ...resolved };
  delete flat.extends;
  return flat;
}

export const RESPONSIVE_BREAKPOINTS = {
  mobile: 620,
  tablet: 900,
} as const;

export type TemplateScope = "base" | "tablet" | "mobile";

export function scopeForWidth(width: number): TemplateScope {
  if (width <= RESPONSIVE_BREAKPOINTS.mobile) return "mobile";
  if (width <= RESPONSIVE_BREAKPOINTS.tablet) return "tablet";
  return "base";
}

/** Apply the matching responsive override on top of the resolved base template. */
export function applyResponsiveScope(resolved: TemplateDocument, scope: TemplateScope): TemplateDocument {
  if (scope === "base") return resolved;
  const responsive = (resolved.responsive as Record<string, { tokens?: unknown }> | undefined)?.[scope];
  if (!responsive?.tokens) return resolved;
  return deepMerge(resolved, { tokens: responsive.tokens });
}

/** Copy `template.sections.<id>.variant` onto `site[id].variant` before prepare. */
export function applySectionVariants(
  site: Record<string, unknown>,
  template: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const sectionConfigs = template?.sections;
  if (!sectionConfigs || typeof sectionConfigs !== "object" || Array.isArray(sectionConfigs)) {
    return site;
  }
  const next: Record<string, unknown> = { ...site };
  for (const [id, config] of Object.entries(sectionConfigs as Record<string, { variant?: unknown }>)) {
    const variant = typeof config?.variant === "string" ? config.variant.trim() : "";
    if (!variant) continue;
    const current = next[id];
    const block =
      current && typeof current === "object" && !Array.isArray(current)
        ? { ...(current as Record<string, unknown>) }
        : {};
    next[id] = { ...block, variant };
  }
  return next;
}
