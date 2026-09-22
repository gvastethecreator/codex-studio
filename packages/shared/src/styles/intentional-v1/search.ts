export interface SearchEntry {
  id: string;
  name: string;
  aliases: string[];
  packId: string;
  categoryId: string;
  kind: string;
  tags: string[];
}
export interface SearchScope {
  packId?: string;
  categoryId?: string;
  favoriteIds?: readonly string[];
}
export function normalizeQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
/** Metadata-only, deterministic ranking. Query never silently discards the user's scope. */
export function searchCatalog(
  entries: readonly SearchEntry[],
  query: string,
  scope: SearchScope = {},
  limit = 100,
): SearchEntry[] {
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
    throw new Error('Search limit must be 1..1000.');
  const q = normalizeQuery(query),
    terms = q.split(/\s+/).filter(Boolean),
    favorites = scope.favoriteIds ? new Set(scope.favoriteIds) : null;
  return entries
    .filter(
      (e) =>
        (!scope.packId || e.packId === scope.packId) &&
        (!scope.categoryId || e.categoryId === scope.categoryId) &&
        (!favorites || favorites.has(e.id)),
    )
    .map((e) => {
      const name = normalizeQuery(e.name),
        aliases = e.aliases.map(normalizeQuery),
        haystack = normalizeQuery(
          [e.name, ...e.aliases, ...e.tags, e.id, e.kind, e.categoryId].join(' '),
        );
      const match = terms.every((t) => haystack.includes(t));
      const score = !q
        ? 0
        : name === q
          ? 100
          : aliases.includes(q)
            ? 90
            : name.startsWith(q)
              ? 70
              : terms.every((t) => name.includes(t))
                ? 50
                : 10;
      return { e, match, score };
    })
    .filter((x) => x.match)
    .sort((a, b) => b.score - a.score || a.e.id.localeCompare(b.e.id, 'en'))
    .slice(0, limit)
    .map((x) => x.e);
}
