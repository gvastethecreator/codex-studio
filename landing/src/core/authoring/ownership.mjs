/** Wizard controls stage authoring fields. They do not write the live document until apply. */
export const FIELD_OWNERSHIP = {
  "project.name": { target: "brief.project.name", liveDocument: false },
  "project.description": { target: "brief.project.description", liveDocument: false },
  primaryAction: { target: "brief.primaryAction", liveDocument: false },
  "preferences.accentSource": { target: "brief.preferences.accentSource", liveDocument: false },
  "preferences.frame": { target: "brief.preferences.frame", liveDocument: false },
  sectionOrder: { target: "brief.sectionOrder", liveDocument: false },
  locks: { target: "brief.locks", liveDocument: false },
};

export function writesLiveDocument(field) {
  return FIELD_OWNERSHIP[field]?.liveDocument === true;
}
