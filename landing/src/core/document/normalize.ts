import { SITE_SCHEMA_ID, TEMPLATE_SCHEMA_ID, type Diagnostic } from "./diagnostics.ts";

export interface NormalizeResult<T = Record<string, unknown>> {
  value: T;
  diagnostics: Diagnostic[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Structural normalization for site documents. Lossless by contract: unknown
 * forward-compatible properties are retained, never stripped.
 */
export function normalizeSite(raw: unknown): NormalizeResult {
  const diagnostics: Diagnostic[] = [];
  if (!isPlainObject(raw)) {
    return {
      value: {},
      diagnostics: [{ severity: "error", source: "site", path: "/site", message: "site document must be a mapping" }],
    };
  }
  const site: Record<string, unknown> = { ...raw };
  if (site.schema === undefined) {
    site.schema = SITE_SCHEMA_ID;
    diagnostics.push({
      severity: "info",
      source: "site",
      path: "/site/schema",
      message: `schema defaulted to ${SITE_SCHEMA_ID}`,
      fix: "explicit version added",
    });
  }
  if (site.sections !== undefined) {
    if (!Array.isArray(site.sections)) {
      diagnostics.push({
        severity: "error",
        source: "site",
        path: "/site/sections",
        message: "sections must be a list of canonical section ids",
      });
      site.sections = [];
    } else {
      const ids = site.sections.filter((entry) => typeof entry === "string");
      if (ids.length !== site.sections.length) {
        diagnostics.push({
          severity: "warning",
          source: "site",
          path: "/site/sections",
          message: "non-string section entries were dropped",
        });
      }
      site.sections = ids;
    }
  }
  return { value: site, diagnostics };
}

/** Structural normalization for template documents (lossless). */
export function normalizeTemplate(raw: unknown): NormalizeResult {
  const diagnostics: Diagnostic[] = [];
  if (!isPlainObject(raw)) {
    return {
      value: {},
      diagnostics: [
        { severity: "error", source: "template", path: "/template", message: "template document must be a mapping" },
      ],
    };
  }
  const template: Record<string, unknown> = { ...raw };
  if (template.schema === undefined) {
    template.schema = TEMPLATE_SCHEMA_ID;
    diagnostics.push({
      severity: "info",
      source: "template",
      path: "/template/schema",
      message: `schema defaulted to ${TEMPLATE_SCHEMA_ID}`,
      fix: "explicit version added",
    });
  }
  for (const key of ["tokens", "themes", "chrome", "sections", "responsive"] as const) {
    const value = template[key];
    if (value !== undefined && !isPlainObject(value)) {
      diagnostics.push({
        severity: "error",
        source: "template",
        path: `/template/${key}`,
        message: `${key} must be a mapping`,
      });
      delete template[key];
    }
  }
  return { value: template, diagnostics };
}
