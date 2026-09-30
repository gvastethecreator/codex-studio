/**
 * Canonical editor paths: JSON-pointer-like addresses shared by inspector
 * controls, commands, diagnostics and code mapping.
 *
 *   /site/project/name
 *   /site/screens/images/2/alt
 *   /template/tokens/color/accent
 */

export type PathSegment = string | number;

const NUMERIC = /^\d+$/;

export function parsePath(path: string): PathSegment[] {
  if (path === "" || path === "/") return [];
  if (!path.startsWith("/")) throw new Error(`canonical paths start with "/": ${path}`);
  return path
    .slice(1)
    .split("/")
    .map((raw) => raw.replace(/~1/g, "/").replace(/~0/g, "~"));
}

export function formatPath(segments: readonly PathSegment[]): string {
  if (segments.length === 0) return "/";
  return `/${segments.map((segment) => String(segment).replace(/~/g, "~0").replace(/\//g, "~1")).join("/")}`;
}

export function parentPath(path: string): string {
  const segments = parsePath(path);
  return formatPath(segments.slice(0, -1));
}

function child(container: unknown, segment: PathSegment): unknown {
  if (Array.isArray(container) && typeof segment !== "number" && NUMERIC.test(segment)) {
    return container[Number(segment)];
  }
  if (container !== null && typeof container === "object") {
    return (container as Record<string, unknown>)[String(segment)];
  }
  return undefined;
}

export function getAtPath(root: unknown, path: string | readonly PathSegment[]): unknown {
  const segments = typeof path === "string" ? parsePath(path) : path;
  let current: unknown = root;
  for (const segment of segments) {
    current = child(current, segment);
    if (current === undefined) return undefined;
  }
  return current;
}

function setIn(container: unknown, segments: readonly PathSegment[], value: unknown): unknown {
  if (segments.length === 0) return value;
  const [head, ...rest] = segments;
  if (Array.isArray(container)) {
    const index = typeof head === "number" ? head : NUMERIC.test(head) ? Number(head) : -1;
    if (index < 0) throw new Error(`array path segment must be numeric: ${String(head)}`);
    const next = container.slice();
    next[index] = setIn(container[index], rest, value);
    return next;
  }
  const base: Record<string, unknown> =
    container !== null && typeof container === "object" ? { ...(container as Record<string, unknown>) } : {};
  base[String(head)] = setIn(base[String(head)], rest, value);
  return base;
}

export function setAtPath<T>(root: T, path: string | readonly PathSegment[], value: unknown): T {
  const segments = typeof path === "string" ? parsePath(path) : path;
  return setIn(root, segments, value) as T;
}

function deleteIn(container: unknown, segments: readonly PathSegment[]): unknown {
  if (segments.length === 0) return container;
  const [head, ...rest] = segments;
  if (Array.isArray(container)) {
    const index = typeof head === "number" ? head : NUMERIC.test(head) ? Number(head) : -1;
    if (index < 0 || index >= container.length) return container;
    if (rest.length === 0) return container.filter((_, at) => at !== index);
    const next = container.slice();
    next[index] = deleteIn(container[index], rest);
    return next;
  }
  if (container === null || typeof container !== "object") return container;
  const key = String(head);
  if (!(key in (container as Record<string, unknown>))) return container;
  const next: Record<string, unknown> = { ...(container as Record<string, unknown>) };
  if (rest.length === 0) delete next[key];
  else next[key] = deleteIn(next[key], rest);
  return next;
}

export function deleteAtPath<T>(root: T, path: string | readonly PathSegment[]): T {
  const segments = typeof path === "string" ? parsePath(path) : path;
  return deleteIn(root, segments) as T;
}
