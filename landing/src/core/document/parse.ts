import { parseDocument } from "yaml";
import type { Diagnostic, DiagnosticSource } from "./diagnostics.ts";

export interface ParseResult {
  ok: boolean;
  value?: unknown;
  diagnostics: Diagnostic[];
}

interface YamlProblem {
  message: string;
  linePos?: readonly { line: number; col: number }[];
  pos?: readonly [number, number];
}

function toDiagnostic(problem: YamlProblem, source: DiagnosticSource, severity: Diagnostic["severity"]): Diagnostic {
  const at = problem.linePos?.[0];
  return {
    severity,
    source,
    code: "yaml",
    message: problem.message.split("\n")[0],
    line: at?.line,
    column: at?.col,
  };
}

export function uniqueDiagnostics(list: Diagnostic[]): Diagnostic[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    const key = `${item.source}:${item.code ?? ""}:${item.line ?? ""}:${item.column ?? ""}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Parse YAML text into a JS value. Syntax problems are reported as diagnostics
 * with line/column; callers keep their last valid document when ok is false.
 */
export function parseYamlDocument(text: string, source: DiagnosticSource): ParseResult {
  const doc = parseDocument(text, { prettyErrors: true });
  const errors = uniqueDiagnostics(doc.errors.map((error) => toDiagnostic(error, source, "error")));
  if (errors.length > 0) return { ok: false, diagnostics: errors };
  const warnings = uniqueDiagnostics(doc.warnings.map((warning) => toDiagnostic(warning, source, "warning")));
  let value: unknown;
  try {
    value = doc.toJS();
  } catch (error) {
    return {
      ok: false,
      diagnostics: [
        { severity: "error", source, message: error instanceof Error ? error.message : "YAML conversion failed" },
      ],
    };
  }
  return { ok: true, value, diagnostics: warnings };
}
