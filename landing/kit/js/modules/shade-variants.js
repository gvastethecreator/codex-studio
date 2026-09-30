export const SHADE_VARIANTS = [
  { id: "mist", label: "Mist", note: "Moving fog and a drifting sheen." },
  { id: "grain", label: "Grain", note: "Paper fiber with live film grain." },
  { id: "veil", label: "Veil", note: "Breathing wash and orbiting light." },
  { id: "liquid", label: "Liquid", note: "Viscous oil on the surface." },
  { id: "flow", label: "Flow", note: "Soft caustic light in the pigment." },
  { id: "speckle", label: "Speckle", note: "Twinkling dust on the fill." },
];

export const SHADE_IDS = SHADE_VARIANTS.map((item) => item.id);

export const DEFAULT_SHADE = "mist";

const SHADE_ALIASES = {
  grid: "liquid",
  ribbon: "flow",
};

export function resolveShadeId(value) {
  const raw = String(value ?? "").trim();
  const id = SHADE_ALIASES[raw] ?? raw;
  return SHADE_IDS.includes(id) ? id : DEFAULT_SHADE;
}

export function shadeVariantFromTemplate(template) {
  const chrome = template && typeof template === "object" ? template.chrome : null;
  const shade = chrome && typeof chrome === "object" ? chrome.shade : null;
  return resolveShadeId(shade && shade.variant);
}

export function frameVariantFromTemplate(template) {
  const chrome = template && typeof template === "object" ? template.chrome : null;
  const frame = chrome && typeof chrome === "object" ? chrome.frame : null;
  return frame && frame.variant === "window" ? "window" : "full";
}
