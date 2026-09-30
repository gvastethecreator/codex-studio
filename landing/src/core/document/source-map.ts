import { parseDocument } from "yaml";
import { parsePath } from "./paths.ts";

export interface SourceRange {
  from: number;
  to: number;
  line: number;
  column: number;
}

function lineOf(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < text.length; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else column += 1;
  }
  return { line, column };
}

/**
 * Best-effort YAML source range for a canonical path like /site/hero/title.
 * The first segment (site|template) is stripped because each editor tab is one document.
 */
export function rangeForPath(text: string, path: string): SourceRange | undefined {
  const segments = parsePath(path).filter((segment) => segment !== "site" && segment !== "template");
  if (segments.length === 0) return { from: 0, to: Math.min(text.length, 1), line: 1, column: 1 };
  try {
    const doc = parseDocument(text);
    let node: { get?: (key: unknown, keep: boolean) => unknown; getIn?: (path: unknown[], keep: boolean) => unknown; range?: [number, number, number?] } | null =
      doc.contents as never;
    if (!node) return undefined;
    const found = node.getIn?.(segments, true) as { range?: [number, number, number?] } | undefined;
    const range = found?.range;
    if (!range) return undefined;
    const from = range[0];
    const to = range[1];
    return { from, to, ...lineOf(text, from) };
  } catch {
    return undefined;
  }
}

export function pathAtOffset(text: string, offset: number): string | undefined {
  try {
    const doc = parseDocument(text);
    const contents = doc.contents as { items?: unknown[] } | null;
    if (!contents) return undefined;
    const trail: string[] = [];
    walk(contents, offset, trail);
    if (trail.length === 0) return undefined;
    return `/${trail.join("/")}`;
  } catch {
    return undefined;
  }
}

function walk(node: unknown, offset: number, trail: string[]): boolean {
  if (!node || typeof node !== "object") return false;
  const range = (node as { range?: [number, number] }).range;
  if (range && (offset < range[0] || offset > range[1])) return false;
  const items = (node as { items?: { key?: { value?: unknown; range?: [number, number] }; value?: unknown }[] }).items;
  if (!Array.isArray(items)) return Boolean(range);
  for (const pair of items) {
    const key = pair?.key;
    const value = pair?.value;
    const valueRange = (value as { range?: [number, number] } | undefined)?.range;
    const keyRange = key?.range;
    const covers =
      (valueRange && offset >= valueRange[0] && offset <= valueRange[1]) ||
      (keyRange && offset >= keyRange[0] && offset <= keyRange[1]);
    if (!covers) continue;
    if (key && "value" in key) trail.push(String(key.value));
    if (value) walk(value, offset, trail);
    return true;
  }
  return Boolean(range);
}
