/**
 * Default template values from templates/default.yaml, snapshotted into the
 * Studio kit manifest so Node and the browser resolve the same documents.
 */
import { TEMPLATE_LIBRARY } from "../../studio/generated/kit-manifest.ts";

export const DEFAULT_TEMPLATE = TEMPLATE_LIBRARY.default;

export type TemplateDocument = Record<string, unknown>;
