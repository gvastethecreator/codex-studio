import { FIELDS, type Snapshot, type Layer, type Composition } from './types.js';
import { jsonClone, canonicalJson, sha256, utf8Bytes } from './canonical.js';
import {
  validateSnapshot,
  validateLayer,
  validateComposition,
  parseComposition,
  MAX_COMPOSITION_BYTES,
} from './validation.js';
export async function createLayer(snapshot: Snapshot, layerId: string): Promise<Layer> {
  validateSnapshot(snapshot);
  const frozen = jsonClone(snapshot);
  const result: Layer = {
    layerId,
    snapshot: frozen,
    snapshotHash: await sha256(frozen),
    enabled: true,
    strength: 0.75,
    fields: Object.fromEntries(
      FIELDS.map((field) => [
        field,
        { enabled: frozen.policy.defaultFields.includes(field), weight: 1 },
      ]),
    ) as Layer['fields'],
    avoidRulesMode: 'merge',
  };
  validateLayer(result);
  return result;
}
export async function verifyLayerHashes(layers: readonly Layer[]): Promise<void> {
  for (const layer of layers) {
    validateLayer(layer);
    if ((await sha256(layer.snapshot)) !== layer.snapshotHash)
      throw new Error(`Snapshot hash mismatch: ${layer.layerId}`);
  }
}
export async function exportComposition(composition: Composition): Promise<string> {
  validateComposition(composition);
  await verifyLayerHashes(composition.layers);
  const serialized = canonicalJson(composition) + '\n';
  if (utf8Bytes(serialized).byteLength > MAX_COMPOSITION_BYTES)
    throw new Error(
      'Composition export exceeds 1 MiB; simplify or split the composition without truncating it.',
    );
  return serialized;
}
export async function importComposition(serialized: string): Promise<Composition> {
  const composition = parseComposition(serialized);
  await verifyLayerHashes(composition.layers);
  return jsonClone(composition);
}
export class RevisionConflict extends Error {
  constructor() {
    super('Composition revision changed. Reload and reconcile before saving.');
    this.name = 'RevisionConflict';
  }
}
/** Pure CAS preparation. The actual database compare and write must occur in one backend transaction. */
export function reviseComposition(
  current: Composition,
  expectedRevision: number,
  changes: Pick<Composition, 'name' | 'mode' | 'locks' | 'variation' | 'layers'>,
  updatedAt: string,
): Composition {
  validateComposition(current);
  if (current.revision !== expectedRevision) throw new RevisionConflict();
  if (Date.parse(updatedAt) < Date.parse(current.updatedAt))
    throw new Error('Update timestamp cannot move backwards.');
  const revised: Composition = {
    ...jsonClone(current),
    ...jsonClone(changes),
    revision: current.revision + 1,
    updatedAt,
  };
  validateComposition(revised);
  return revised;
}
export function duplicateComposition(
  current: Composition,
  newId: string,
  newName: string,
  now: string,
): Composition {
  validateComposition(current);
  if (newId === current.id) throw new Error('Duplicate needs a new composition ID.');
  const copy: Composition = {
    ...jsonClone(current),
    id: newId,
    name: newName,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    layers: current.layers.map((l, i) => ({ ...jsonClone(l), layerId: `${newId}:layer:${i + 1}` })),
  };
  validateComposition(copy);
  return copy;
}
export function getAvailableUpdates(
  composition: Composition,
  versions: Readonly<Record<string, number>>,
) {
  validateComposition(composition);
  return composition.layers.flatMap((layer) => {
    const available = versions[layer.snapshot.presetId];
    return available !== undefined && available > layer.snapshot.version
      ? [
          {
            layerId: layer.layerId,
            presetId: layer.snapshot.presetId,
            pinnedVersion: layer.snapshot.version,
            availableVersion: available,
          },
        ]
      : [];
  });
}
