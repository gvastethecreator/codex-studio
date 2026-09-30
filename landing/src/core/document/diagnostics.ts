import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject, ValidateFunction } from "ajv";
import siteSchema from "../../../schema/site.schema.json" with { type: "json" };
import templateSchema from "../../../schema/template.schema.json" with { type: "json" };
import registry from "../../../kit/section-registry.json" with { type: "json" };

export type DiagnosticSeverity = "error" | "warning" | "info";
export type DiagnosticSource = "site" | "template";
export type DiagnosticCode = "yaml" | "schema" | "semantic";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  source: DiagnosticSource;
  code?: DiagnosticCode;
  message: string;
  path?: string;
  line?: number;
  column?: number;
  fix?: string;
}

export const SITE_SCHEMA_ID = "gvaste-pages/v1";
export const TEMPLATE_SCHEMA_ID = "gvaste-pages/template/v1";

let siteValidator: ValidateFunction | undefined;
let templateValidator: ValidateFunction | undefined;
const implementedSectionIds = () => Object.entries(registry.sections)
  .filter(([, section]) => section.implementationStatus === "implemented")
  .map(([id]) => id);

function ajv(): Ajv2020 {
  return new Ajv2020({ allErrors: true, strict: false });
}

export function siteDocumentValidator(): ValidateFunction {
  if (!siteValidator) {
    // The editor consumes the engine bridge's implemented catalog. The published
    // v1 schema stays unchanged; semantic payloads are checked by prepareView.
    const editorSchema = structuredClone(siteSchema);
    editorSchema.$defs.sectionId.enum = implementedSectionIds();
    siteValidator = ajv().compile(editorSchema as object);
  }
  return siteValidator;
}

export function templateDocumentValidator(): ValidateFunction {
  if (!templateValidator) {
    const editorSchema = structuredClone(templateSchema);
    editorSchema.properties.sections.propertyNames.enum = implementedSectionIds();
    templateValidator = ajv().compile(editorSchema as object);
  }
  return templateValidator;
}

function ajvPath(error: ErrorObject, source: DiagnosticSource): string {
  const root = source === "site" ? "/site" : "/template";
  return error.instancePath ? `${root}${error.instancePath}` : root;
}

function ajvMessage(error: ErrorObject): string {
  if (error.keyword === "additionalProperties") {
    const extra = (error.params as { additionalProperty?: string }).additionalProperty;
    return `unsupported property "${extra ?? "?"}"`;
  }
  if (error.keyword === "required") {
    const missing = (error.params as { missingProperty?: string }).missingProperty;
    return `missing required property "${missing ?? "?"}"`;
  }
  return error.message ?? "schema violation";
}

export function schemaDiagnostics(errors: ErrorObject[] | null | undefined, source: DiagnosticSource): Diagnostic[] {
  return (errors ?? []).map((error) => ({
    severity: "error" as const,
    source,
    code: "schema" as const,
    path: ajvPath(error, source),
    message: ajvMessage(error),
  }));
}

export function validateSiteDocument(value: unknown): Diagnostic[] {
  const validate = siteDocumentValidator();
  return validate(value) ? [] : schemaDiagnostics(validate.errors, "site");
}

export function validateTemplateDocument(value: unknown): Diagnostic[] {
  const validate = templateDocumentValidator();
  return validate(value) ? [] : schemaDiagnostics(validate.errors, "template");
}
