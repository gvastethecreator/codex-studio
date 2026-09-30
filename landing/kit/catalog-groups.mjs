export const CATEGORY_ORDER = ["foundation", "proof", "adoption", "trust", "conversion"];

export const PAGE_TYPE_ORDER = [
  "agent-skill",
  "desktop-local-app",
  "library-sdk",
  "cli",
  "playground-showcase",
  "github-user",
];

export function groupCasesByCategory(cases, registry) {
  const groups = [];
  const index = new Map();
  const ensure = (id, label, order) => {
    let group = index.get(id);
    if (!group) {
      group = { id, label, order, rows: [] };
      index.set(id, group);
      groups.push(group);
    }
    return group;
  };
  for (const item of cases) {
    const sectionId = String(item.section ?? "");
    if (sectionId === "profile") {
      ensure("profile-pages", "Profile pages", CATEGORY_ORDER.indexOf("trust") + 0.5).rows.push(item);
      continue;
    }
    const section = registry.sections?.[sectionId];
    const category = section?.category ?? "foundation";
    const label = section?.studioCategory ?? category;
    const order = CATEGORY_ORDER.indexOf(category);
    ensure(category, label, order < 0 ? CATEGORY_ORDER.length : order).rows.push(item);
  }
  return groups.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

export function groupExamplesByPageType(examples, kinds) {
  const byId = new Map();
  for (const kind of Object.values(kinds)) {
    for (const preset of kind.mapsFromPresets ?? []) byId.set(preset, kind);
  }
  const groups = [];
  const index = new Map();
  for (const row of examples) {
    const kind = byId.get(row.preset);
    const id = kind?.id ?? row.preset;
    const label = kind?.label ?? row.preset;
    let group = index.get(id);
    if (!group) {
      group = { id, label, rows: [] };
      index.set(id, group);
      groups.push(group);
    }
    group.rows.push(row);
  }
  return groups.sort((a, b) => {
    const ai = PAGE_TYPE_ORDER.indexOf(a.id);
    const bi = PAGE_TYPE_ORDER.indexOf(b.id);
    const ao = ai < 0 ? PAGE_TYPE_ORDER.length : ai;
    const bo = bi < 0 ? PAGE_TYPE_ORDER.length : bi;
    return ao - bo || a.label.localeCompare(b.label);
  });
}
