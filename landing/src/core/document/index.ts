import { prepareView } from "../../../kit/engine.mjs";
import { applySectionVariants, resolveTemplateChain } from "../template/resolver.ts";
import {
  validateSiteDocument,
  validateTemplateDocument,
  type Diagnostic,
} from "./diagnostics.ts";
import { normalizeSite, normalizeTemplate } from "./normalize.ts";
import { parseYamlDocument } from "./parse.ts";

export * from "./diagnostics.ts";
export * from "./normalize.ts";
export * from "./parse.ts";
export * from "./paths.ts";
export * from "./serialize.ts";

export interface StudioDocument {
  schemaVersion: "studio/v1";
  site: Record<string, unknown>;
  /** Authored template overrides (what serializes back to template.yaml). */
  templateAuthored: Record<string, unknown>;
  /** defaults + authored overrides (what the renderer consumes). */
  template: Record<string, unknown>;
  source: {
    siteFileName: string;
    templateFileName?: string;
  };
}

export interface StudioDocumentResult {
  document?: StudioDocument;
  diagnostics: Diagnostic[];
}

/**
 * Parse site/template YAML text into the canonical Studio document. When
 * parsing or validation fails, document is undefined and callers keep their
 * last valid document (spec: code parse failure keeps last valid canvas).
 */
export function parseStudioDocument(args: {
  siteText: string;
  templateText?: string;
  siteFileName?: string;
  templateFileName?: string;
}): StudioDocumentResult {
  const diagnostics: Diagnostic[] = [];

  const siteParsed = parseYamlDocument(args.siteText, "site");
  diagnostics.push(...siteParsed.diagnostics);
  if (!siteParsed.ok) return { diagnostics };

  const siteNormalized = normalizeSite(siteParsed.value);
  diagnostics.push(...siteNormalized.diagnostics);
  const siteFatal = siteNormalized.diagnostics.some((d) => d.severity === "error");
  if (siteFatal) return { diagnostics };
  diagnostics.push(...validateSiteDocument(siteNormalized.value));
  let templateAuthored: Record<string, unknown> = {};
  if (args.templateText !== undefined && args.templateText.trim() !== "") {
    const templateParsed = parseYamlDocument(args.templateText, "template");
    diagnostics.push(...templateParsed.diagnostics);
    if (templateParsed.ok) {
      const templateNormalized = normalizeTemplate(templateParsed.value);
      diagnostics.push(...templateNormalized.diagnostics);
      if (!templateNormalized.diagnostics.some((d) => d.severity === "error")) {
        const schemaErrors = validateTemplateDocument(templateNormalized.value);
        diagnostics.push(...schemaErrors);
        if (!schemaErrors.some((d) => d.severity === "error")) {
          templateAuthored = templateNormalized.value;
        }
      }
    }
  }

  const template = resolveTemplateChain(Object.keys(templateAuthored).length ? templateAuthored : undefined).resolved;
  try {
    prepareView(applySectionVariants(siteNormalized.value, template));
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    diagnostics.push({ severity: "error", source: "site", code: "semantic", message: raw.replace(/^\[gvaste-pages\]\s*/, "") });
  }
  return {
    document: {
      schemaVersion: "studio/v1",
      site: siteNormalized.value,
      templateAuthored,
      template,
      source: {
        siteFileName: args.siteFileName ?? "site.yaml",
        templateFileName: args.templateFileName,
      },
    },
    diagnostics,
  };
}
