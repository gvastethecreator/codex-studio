import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import registry from "./section-registry.json" with { type: "json" };

const DIR = join(dirname(fileURLToPath(import.meta.url)), "kinds");

export function loadKinds(directory = DIR) {
  const kinds = {};
  for (const name of readdirSync(directory)
    .filter((file) => file.endsWith(".yaml"))
    .sort()) {
    const id = name.replace(/\.yaml$/, "");
    kinds[id] = parseYaml(readFileSync(join(directory, name), "utf8"));
  }
  return kinds;
}

export function kindForPreset(preset, kinds = loadKinds()) {
  const id = String(preset ?? "").trim();
  return Object.values(kinds).find((kind) => (kind.mapsFromPresets ?? []).includes(id)) ?? null;
}

export const SEMANTIC_V1_BLOCKLIST = Object.entries(registry.sections ?? {})
  .filter(([, section]) => section?.v1 === false)
  .map(([id]) => id);
