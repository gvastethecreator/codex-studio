import { parse as parseYaml } from "yaml";
import { canonicalJson, prepareReferenceApply } from "./contract.mjs";

function clone(value) {
  return structuredClone(value);
}

export function loadAuthoringPage({ draftId, siteText, templateText, site, templateAuthored }) {
  return {
    draftId,
    siteText,
    templateText,
    site: clone(site),
    templateAuthored: clone(templateAuthored ?? {}),
    retained: {},
    history: [],
    wizard: null,
    setups: {},
    rawInvalid: false,
    applied: false,
    validationRequestId: 0,
  };
}

export function noteEdit(state) {
  return { ...state, validationRequestId: (state.validationRequestId ?? 0) + 1 };
}

/** An older validation id must not commit. */
export function applyIfCurrent(state, requestId, plan, ctx) {
  if ((state.validationRequestId ?? 0) !== requestId) return state;
  return applyAuthoring(state, plan, ctx);
}

export function beginNewSetup(state) {
  const id = `setup-${Object.keys(state.setups).length + 1}`;
  return {
    ...state,
    draftId: state.draftId,
    setups: {
      ...state.setups,
      [id]: { id, siteText: "", templateText: "", status: "editing" },
    },
  };
}

export function openWizard(state, mode) {
  return { ...state, wizard: { mode, step: 1, status: "editing", draftAtOpen: state.draftId } };
}

export function cancelWizard(state) {
  return { ...state, wizard: null, applied: false };
}

export function rememberRaw(state, siteText) {
  let parsed = null;
  try {
    parsed = parseYaml(siteText);
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ...state, siteText, rawInvalid: true };
  }
  return { ...state, siteText, rawInvalid: false, site: parsed };
}

export function applyAuthoring(state, plan, ctx) {
  const result = prepareReferenceApply(plan, {
    ...ctx,
    snapshot: {
      site: state.site,
      templateAuthored: state.templateAuthored,
      retained: state.retained ?? {},
    },
  });
  if (!result.ok) return state;
  return {
    ...state,
    site: result.snapshot.site,
    templateAuthored: result.snapshot.templateAuthored,
    retained: result.snapshot.retained ?? {},
    history: [
      ...state.history,
      {
        site: clone(state.site),
        templateAuthored: clone(state.templateAuthored),
        siteText: state.siteText,
        templateText: state.templateText,
        retained: clone(state.retained ?? {}),
      },
    ],
    wizard: state.wizard ? { ...state.wizard, status: "applied" } : null,
    applied: true,
  };
}

export function undoAuthoring(state) {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return {
    ...state,
    site: previous.site,
    templateAuthored: previous.templateAuthored,
    siteText: previous.siteText,
    templateText: previous.templateText,
    retained: previous.retained,
    history: state.history.slice(0, -1),
    applied: false,
    wizard: state.wizard ? { ...state.wizard, status: "editing" } : null,
  };
}

export function pageFingerprint(state) {
  return canonicalJson({
    draftId: state.draftId,
    siteText: state.siteText,
    templateText: state.templateText,
    site: state.site,
    templateAuthored: state.templateAuthored,
  });
}
