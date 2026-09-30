// v1 authoring contract derived from the section registry.
// render.mjs (compatibility adapter) and tests import this module so the
// registry stays the only composition authority.
import registry from "./section-registry.json" with { type: "json" };

const CATALOG = registry.sections ?? {};

export const SCHEMA = registry.runtimeVersion ?? "gvaste-pages/v1";

export const V1_SECTION_IDS = Object.entries(CATALOG)
  .filter(([, section]) => section?.v1 === true)
  .map(([id]) => id);

export const V1_NAV_LABELS = Object.fromEntries(
  Object.entries(CATALOG)
    .filter(([, section]) => section?.v1 === true && section.navLabel)
    .map(([id, section]) => [id, section.navLabel]),
);

export const V1_PRESET_IDS = Object.keys(registry.presets ?? {});
export const V1_PRESETS = registry.presets ?? {};
