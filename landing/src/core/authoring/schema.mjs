import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

const FILES = [
  "authoring-definitions.schema.json",
  "authoring-brief.schema.json",
  "authoring-plan.schema.json",
  "authoring-requirement.schema.json",
  "authoring-session.schema.json",
  "authoring-transport.schema.json",
];

/** Authoring schemas use JSON Schema type unions. Ajv strict needs allowUnionTypes. */
export function authoringAjv(root) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  for (const name of FILES) {
    ajv.addSchema(JSON.parse(readFileSync(join(root, "schema", name), "utf8")));
  }
  return ajv;
}
