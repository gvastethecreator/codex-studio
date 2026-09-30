const HASH = "a".repeat(64);

/** Apply commits the section ids the checkboxes show. */
export function guidedApplySections(checkedIds) {
  if (!Array.isArray(checkedIds)) throw new Error("E_CHECKED_SECTIONS");
  return [...checkedIds];
}

export function wizardApplyPlan({ site, name, accentSource, frame, checkedIds }) {
  return buildGuidedPlan({
    site,
    nextName: name,
    nextAccentSource: accentSource === "legacy" ? undefined : accentSource,
    nextFrame: frame || undefined,
    sectionIds: guidedApplySections(checkedIds),
  });
}

function decision(id, selection) {
  return {
    id,
    variant: "default",
    selection,
    readiness: selection === "include" ? "needs-input" : "ready",
    evidenceIds: [],
    reasonCodes: [],
  };
}

/** Build a bounded plan. New sections stay pending until evidence exists. */
export function buildGuidedPlan({
  projectId = "project",
  briefId = "brief",
  sourceFingerprint = HASH,
  briefFingerprint = HASH,
  evidenceFingerprint = HASH,
  capabilitiesVersion = "registry",
  engineVersion = "gvaste-pages",
  site,
  nextName,
  nextAccentSource,
  nextFrame,
  sectionIds,
}) {
  const current = Array.isArray(site.sections) ? site.sections.map(String) : [];
  const wanted = Array.isArray(sectionIds) ? sectionIds.map(String) : current.slice();
  const kept = wanted.filter((id) => current.includes(id));
  const hidden = current.filter((id) => !wanted.includes(id));
  const pending = wanted.filter((id) => !current.includes(id));
  const sections = [
    ...kept.map((id) => decision(id, "preserve")),
    ...hidden.map((id) => decision(id, "omit")),
    ...pending.map((id) => decision(id, "include")),
  ];
  const operations = [];
  if (typeof nextName === "string" && nextName !== site.project?.name) {
    operations.push({ op: "set", path: "/site/project/name", value: nextName, reasonCode: "guided-name" });
  }
  if (nextAccentSource === "project" || nextAccentSource === "template") {
    operations.push({
      op: "set",
      path: "/template/tokens/color/accentSource",
      value: nextAccentSource,
      reasonCode: "guided-accent",
    });
  }
  if (nextFrame === "full" || nextFrame === "window") {
    operations.push({
      op: "set",
      path: "/template/chrome/frame/variant",
      value: nextFrame,
      reasonCode: "guided-frame",
    });
  }
  for (const id of hidden) operations.push({ op: "hide-section", sectionId: id, reasonCode: "guided-hide" });
  if (kept.length === wanted.filter((id) => current.includes(id)).length && kept.length > 0) {
    operations.push({ op: "reorder-sections", order: kept, reasonCode: "guided-order" });
  }
  return {
    plan: {
      schema: "gvaste-pages/authoring-plan/v2",
      id: "plan-guided",
      briefId,
      projectId,
      sourceFingerprint,
      briefFingerprint,
      evidenceFingerprint,
      capabilitiesVersion,
      engineVersion,
      sections,
      operations,
      warnings: pending.map((id) => `${id} stays pending until its evidence is ready.`),
    },
    ctx: {
      projectId,
      briefId,
      sourceFingerprint,
      briefFingerprint,
      evidenceFingerprint,
      capabilitiesVersion,
      engineVersion,
      documentValid: true,
      allowedSetPaths: ["/site/project/name", "/template/tokens/color/accentSource", "/template/chrome/frame/variant"],
      allowedUnsetPaths: [],
      catalog: [],
      evidence: [],
      requirements: {},
      locks: [],
      templates: {},
      resolvePresentation: (template) => template,
      validateSnapshot: () => [],
    },
    pending,
  };
}
