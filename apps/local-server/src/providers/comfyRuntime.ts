import { createHash } from 'node:crypto';
import { isRecord, type ExternalProviderFetch } from './externalProviderResults';

export function resolveComfyRuntime(env: Record<string, string | undefined>) {
  const configured = env.COMFY_API_URL?.trim() || env.COMFYUI_API_URL?.trim();
  if (!configured) throw new Error('Comfy executor missing COMFY_API_URL or COMFYUI_API_URL.');
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('Comfy runtime URL is invalid.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('Comfy runtime URL must use HTTP(S) without credentials, query, or fragment.');
  }
  const base = url.toString().replace(/\/$/, '');
  return { base, identity: createHash('sha256').update(base).digest('hex') };
}

export function comfyEndpoint(base: string, route: string) {
  return `${base}/api/${route}`;
}

export async function readComfyJson(
  fetch: ExternalProviderFetch,
  url: string,
  signal?: AbortSignal,
) {
  const deadline = AbortSignal.timeout(10_000);
  const response = await fetch(url, {
    signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
  });
  if (!response.ok) throw new Error(`Comfy status request failed (HTTP ${response.status}).`);
  return (await response.json()) as unknown;
}

/** Query only nodes used by this workflow; partner nodes require separate spend consent. */
export async function validateComfyWorkflow(
  workflow: unknown,
  base: string,
  fetch: ExternalProviderFetch,
  signal?: AbortSignal,
) {
  if (!isRecord(workflow) || Array.isArray(workflow.nodes) || Object.keys(workflow).length === 0) {
    throw new Error(
      'Comfy requires an API workflow. Convert the UI workflow with the local Comfy CLI first.',
    );
  }
  const classes = new Set<string>();
  for (const node of Object.values(workflow)) {
    if (!isRecord(node) || typeof node.class_type !== 'string' || !isRecord(node.inputs)) {
      throw new Error('Comfy API workflow nodes must have class_type and inputs.');
    }
    classes.add(node.class_type);
  }
  for (const name of classes) {
    const info = await readComfyJson(
      fetch,
      comfyEndpoint(base, `object_info/${encodeURIComponent(name)}`),
      signal,
    );
    const definition = isRecord(info) && isRecord(info[name]) ? info[name] : null;
    if (!definition) throw new Error(`Comfy node is not installed: ${name}.`);
    if (definition.api_node === true) {
      throw new Error(`Comfy partner node ${name} requires a separately authorized paid workflow.`);
    }
    const inputs = isRecord(definition.input) ? definition.input : {};
    const required = isRecord(inputs.required) ? inputs.required : {};
    const optional = isRecord(inputs.optional) ? inputs.optional : {};
    for (const node of Object.values(workflow)) {
      if (!isRecord(node) || node.class_type !== name || !isRecord(node.inputs)) continue;
      for (const field of Object.keys(required)) {
        if (!(field in node.inputs))
          throw new Error(`Comfy node ${name} is missing input ${field}.`);
      }
      for (const [field, schema] of Object.entries({ ...required, ...optional })) {
        const value = node.inputs[field];
        // Linked inputs are validated by Comfy during prompt intake; scalar enums
        // include checkpoint/LoRA filenames from this exact runtime.
        if (
          value !== undefined &&
          !Array.isArray(value) &&
          Array.isArray(schema) &&
          Array.isArray(schema[0]) &&
          !schema[0].includes(value)
        ) {
          throw new Error(`Comfy input ${name}.${field} is unavailable on this runtime.`);
        }
      }
    }
  }
}
