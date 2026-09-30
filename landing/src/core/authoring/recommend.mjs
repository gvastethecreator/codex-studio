import { selectableIds } from "./catalog.mjs";

function unique(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Same normalized inputs always return the same section ids. automatic stays empty. */
export function recommendComposition({ projectKind, goal = "unknown", construction = "ai-assisted", kinds = [], catalog = [] }) {
  if (construction === "automatic") {
    return { sectionIds: [], reason: "automatic-mechanical", goal };
  }
  const allowed = new Set(selectableIds(catalog));
  const kind = kinds.find((item) => item.id === projectKind);
  const composition = kind?.compositions?.[kind.defaultComposition];
  const raw = Array.isArray(composition?.v1SectionIds) ? composition.v1SectionIds : [];
  const sectionIds = unique(raw.filter((id) => allowed.has(id)));
  return {
    sectionIds,
    reason: kind ? kind.defaultComposition ?? "kind" : "unknown-kind",
    goal,
  };
}
