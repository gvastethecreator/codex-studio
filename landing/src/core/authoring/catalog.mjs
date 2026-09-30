/** Selectable sections come from the registry. Legacy stays available on existing pages. */

export function catalogFromRegistry(registry) {
  const sections = registry?.sections ?? {};
  return Object.entries(sections)
    .map(([id, section]) => {
      const implemented = section.implementationStatus === "implemented" && Boolean(section.template);
      const declared = Array.isArray(section.implementedVariants)
        ? section.implementedVariants
        : Array.isArray(section.variants)
          ? section.variants
          : [];
      const legacy = section.semanticStatus === "legacy";
      return {
        id,
        variants: [...declared],
        legacy,
        preservable: implemented,
        selectable: implemented && !legacy,
        repeatable: false,
      };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function selectableIds(catalog) {
  return catalog.filter((item) => item.selectable).map((item) => item.id);
}
