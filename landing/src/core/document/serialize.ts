import { stringify } from "yaml";
import sectionRegistry from "../../../kit/section-registry.json" with { type: "json" };

const SECTION_IDS = Object.keys(sectionRegistry.sections);

/** Stable top-level ordering for serialized site documents. */
const SITE_KEY_ORDER = ["schema", "preset", "sections", "project", "brand", ...SECTION_IDS];

/** Stable top-level ordering for serialized template documents. */
const TEMPLATE_KEY_ORDER = ["schema", "name", "extends", "tokens", "themes", "chrome", "sections", "responsive"];

function orderObject(value: Record<string, unknown>, order: readonly string[]): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const key of order) {
    if (key in value) next[key] = value[key];
  }
  for (const key of Object.keys(value).sort()) {
    if (!(key in next)) next[key] = value[key];
  }
  return next;
}

function isEmptyObject(value: unknown): boolean {
  return (
    value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0
  );
}

function stringifyDeterministic(value: unknown): string {
  return stringify(value, { indent: 2, lineWidth: 0 });
}

/**
 * Serialize a site document: stable ordering for major fields, unknown fields
 * retained (sorted after known ones), user content arrays never reordered.
 */
export function serializeSite(site: Record<string, unknown>): string {
  return stringifyDeterministic(orderObject(site, SITE_KEY_ORDER));
}

/**
 * Serialize a template document: authored overrides only (callers pass the
 * authored template, not the resolved one), empty objects omitted.
 */
export function serializeTemplate(template: Record<string, unknown>): string {
  const pruned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(template)) {
    if (isEmptyObject(value)) continue;
    pruned[key] = value;
  }
  return stringifyDeterministic(orderObject(pruned, TEMPLATE_KEY_ORDER));
}
