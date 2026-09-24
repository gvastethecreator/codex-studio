import atlas from './atlas/tcg-catalog.source.json';

interface PendingEntry {
  id: string;
  name: string;
  summary: string;
  caution?: string;
}

const groups: { id: string; title: string; description: string; entries: PendingEntry[] }[] = [
  {
    id: 'finishes',
    title: 'Finishes',
    description: 'Surface effects that need masks and a separate finishing step.',
    entries: atlas.finishes,
  },
  {
    id: 'layouts',
    title: 'Layouts',
    description: 'Card composition templates that need an independent renderer.',
    entries: atlas.layouts,
  },
  {
    id: 'recipes',
    title: 'Combinations',
    description: 'Cross-style recipes awaiting field selection and visual validation.',
    entries: atlas.recipes,
  },
];

export function TcgPendingCatalog({ query }: { query: string }) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleGroups = groups.map((group) => ({
    ...group,
    entries: group.entries.filter((entry) =>
      `${entry.id} ${entry.name} ${entry.summary}`.toLocaleLowerCase().includes(normalizedQuery),
    ),
  }));
  const resultCount = visibleGroups.reduce((total, group) => total + group.entries.length, 0);

  return (
    <div className="space-y-5" data-tcg-pending-catalog>
      <p className="text-[length:var(--wbp-label)] leading-relaxed text-[color:var(--wb-muted)]">
        These 42 atlas records are visible for review. They are pending implementation and cannot be
        applied or generated yet.
      </p>
      {visibleGroups.map((group) =>
        group.entries.length > 0 ? (
          <section key={group.id} aria-labelledby={`tcg-${group.id}`} className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2 border-b border-[color:var(--wb-line)] pb-2">
              <h3
                id={`tcg-${group.id}`}
                className="text-sm font-semibold text-[color:var(--wb-ink)]"
              >
                {group.title}
              </h3>
              <span className="text-xs text-[color:var(--wb-dim)]">{group.entries.length}</span>
              <span className="text-xs text-[color:var(--wb-muted)]">{group.description}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {group.entries.map((entry) => (
                <article
                  key={entry.id}
                  className="min-w-0 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="min-w-0 text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)]">
                      {entry.name}
                    </h4>
                    <span className="shrink-0 rounded border border-[color:var(--wb-line)] px-1.5 py-0.5 text-[10px] text-[color:var(--wb-muted)]">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[color:var(--wb-muted)]">
                    {entry.summary}
                  </p>
                  <p className="mt-2 text-[10px] text-[color:var(--wb-dim)]">{entry.id}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null,
      )}
      {resultCount === 0 ? (
        <p className="py-10 text-center text-sm text-[color:var(--wb-muted)]">
          No pending components match this search.
        </p>
      ) : null}
    </div>
  );
}
