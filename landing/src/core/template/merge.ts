import { DEFAULT_TEMPLATE, type TemplateDocument } from "./defaults.ts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Template merge semantics (spec 02): objects deep-merge, scalars replace,
 * arrays replace, null is an explicit reset for fields that allow it.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (override === null) return null as T;
  if (Array.isArray(override)) return override.slice() as T;
  if (isPlainObject(override) && isPlainObject(base)) {
    const next: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      next[key] = deepMerge((base as Record<string, unknown>)[key], value);
    }
    return next as T;
  }
  return override as T;
}

const AUTHORED_META_KEYS = new Set(["schema", "name", "extends"]);

/**
 * Resolve an authored template over the default template. Inheritance via
 * `extends` (with cycle detection) lands in the E06 milestone; v0 resolution
 * is defaults + authored overrides.
 */
export function resolveTemplate(
  authored: TemplateDocument | undefined,
  defaults: TemplateDocument = DEFAULT_TEMPLATE as TemplateDocument,
): TemplateDocument {
  if (!authored) return structuredClone(defaults);
  const overrides: TemplateDocument = {};
  for (const [key, value] of Object.entries(authored)) {
    if (!AUTHORED_META_KEYS.has(key)) overrides[key] = value;
  }
  const resolved = deepMerge(defaults, overrides);
  resolved.name = typeof authored.name === "string" ? authored.name : defaults.name;
  resolved.schema = defaults.schema;
  return resolved;
}
