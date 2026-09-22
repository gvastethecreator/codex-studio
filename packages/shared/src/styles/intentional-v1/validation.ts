import { FIELDS, type Snapshot, type Layer, type Composition, type RequestInput } from './types.js';
import { canonicalJson, utf8Bytes } from './canonical.js';
type Obj = Record<string, unknown>;
function fail(label: string): never {
  throw new Error(`Invalid ${label}`);
}
function obj(value: unknown, label: string): Obj {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(label + ': object required');
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value)))
    fail(label + ': plain object required');
  return value as Obj;
}
function keys(value: Obj, allowed: readonly string[], label: string) {
  const extra = Object.keys(value).filter((k) => !allowed.includes(k));
  if (extra.length) fail(`${label}: unknown fields ${extra.join(', ')}`);
  for (const key of allowed) if (!(key in value)) fail(`${label}.${key}: missing`);
}
function text(value: unknown, label: string, min = 1, max = 12000): asserts value is string {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max)
    fail(label + ': text length');
}
function bool(v: unknown, label: string) {
  if (typeof v !== 'boolean') fail(label + ': boolean required');
}
function num(v: unknown, label: string, min: number, max: number, integer = false) {
  if (
    typeof v !== 'number' ||
    !Number.isFinite(v) ||
    v < min ||
    v > max ||
    (integer && !Number.isInteger(v))
  )
    fail(label + ': number out of range');
}
function one(v: unknown, options: readonly unknown[], label: string) {
  if (!options.includes(v)) fail(label + ': unsupported value');
}
function array(v: unknown, label: string, max: number): unknown[] {
  if (!Array.isArray(v) || v.length > max) fail(label + ': array limit');
  return v;
}
function id(v: unknown, label: string) {
  text(v, label, 1, 180);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.:-]*$/.test(v)) fail(label + ': unsafe identifier');
}
function hash(v: unknown, label: string) {
  if (typeof v !== 'string' || !/^[a-f0-9]{64}$/.test(v)) fail(label + ': SHA-256 required');
}
function timestamp(v: unknown, label: string) {
  text(v, label, 1, 40);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(v) ||
    !Number.isFinite(Date.parse(v))
  )
    fail(label + ': UTC ISO timestamp required');
  if (new Date(v).toISOString().replace('.000Z', 'Z') !== v.replace('.000Z', 'Z'))
    fail(label + ': invalid calendar time');
}
function policy(v: unknown) {
  const p = obj(v, 'policy');
  keys(
    p,
    ['schemaVersion', 'kind', 'defaultFields', 'requires', 'medium', 'constraints', 'avoidRules'],
    'policy',
  );
  one(p.schemaVersion, [1], 'policy.schemaVersion');
  one(
    p.kind,
    ['full_style', 'modifier', 'representation_profile', 'thematic_direction'],
    'policy.kind',
  );
  const mask = array(p.defaultFields, 'policy.defaultFields', 8);
  if (!mask.length || new Set(mask).size !== mask.length)
    fail('policy.defaultFields: nonempty unique fields required');
  mask.forEach((f) => one(f, FIELDS, 'policy.defaultFields'));
  one(
    p.requires,
    [null, 'structure', 'wardrobe', 'design', 'environment', 'materialTarget', 'accent'],
    'policy.requires',
  );
  text(p.medium, 'policy.medium', 1, 80);
  array(p.constraints, 'policy.constraints', 24).forEach((v) => {
    const c = obj(v, 'constraint');
    keys(c, ['field', 'group', 'value'], 'constraint');
    one(c.field, FIELDS, 'constraint.field');
    text(c.group, 'constraint.group', 1, 80);
    text(c.value, 'constraint.value', 1, 120);
  });
  array(p.avoidRules, 'policy.avoidRules', 64).forEach((v) => {
    const a = obj(v, 'avoid rule');
    keys(a, ['text', 'field'], 'avoid rule');
    text(a.text, 'avoid rule.text', 1, 500);
    one(a.field, [...FIELDS, 'global'], 'avoid rule.field');
  });
}
export function validateSnapshot(value: unknown): asserts value is Snapshot {
  const s = obj(value, 'snapshot');
  keys(s, ['presetId', 'packId', 'version', 'name', 'dna', 'policy'], 'snapshot');
  id(s.presetId, 'snapshot.presetId');
  id(s.packId, 'snapshot.packId');
  num(s.version, 'snapshot.version', 1, 1e9, true);
  text(s.name, 'snapshot.name', 1, 240);
  const d = obj(s.dna, 'snapshot.dna');
  keys(d, FIELDS, 'snapshot.dna');
  FIELDS.forEach((f) => text(d[f], `snapshot.dna.${f}`));
  policy(s.policy);
}
export function validateLayer(value: unknown): asserts value is Layer {
  const l = obj(value, 'layer');
  keys(
    l,
    ['layerId', 'snapshot', 'snapshotHash', 'enabled', 'strength', 'fields', 'avoidRulesMode'],
    'layer',
  );
  id(l.layerId, 'layer.layerId');
  validateSnapshot(l.snapshot);
  hash(l.snapshotHash, 'layer.snapshotHash');
  bool(l.enabled, 'layer.enabled');
  num(l.strength, 'layer.strength', 0.1, 1);
  one(l.avoidRulesMode, ['merge', 'strict', 'ignore'], 'layer.avoidRulesMode');
  const fs = obj(l.fields, 'layer.fields');
  keys(fs, FIELDS, 'layer.fields');
  FIELDS.forEach((f) => {
    const c = obj(fs[f], `field ${f}`);
    keys(c, ['enabled', 'weight'], `field ${f}`);
    bool(c.enabled, `field ${f}.enabled`);
    num(c.weight, `field ${f}.weight`, 0.1, 1);
  });
}
function layers(v: unknown) {
  const ls = array(v, 'layers', 5);
  ls.forEach(validateLayer);
  if (new Set(ls.map((l) => (l as Layer).layerId)).size !== ls.length)
    fail('layers: duplicate instance IDs');
}
function mode(v: unknown) {
  one(v, ['generate', 'preserve', 'reinterpret'], 'mode');
}
function locks(v: unknown) {
  const l = obj(v, 'locks');
  keys(l, ['identity', 'pose', 'camera', 'composition'], 'locks');
  Object.entries(l).forEach(([k, x]) => bool(x, 'locks.' + k));
}
function variation(v: unknown) {
  const x = obj(v, 'variation');
  keys(x, ['enabled', 'instruction'], 'variation');
  bool(x.enabled, 'variation.enabled');
  text(x.instruction, 'variation.instruction', 0, 2000);
  if (x.enabled && !String(x.instruction).trim()) fail('variation: explicit instruction required');
}
export function validateComposition(value: unknown): asserts value is Composition {
  const c = obj(value, 'composition');
  keys(
    c,
    [
      'schemaVersion',
      'id',
      'name',
      'revision',
      'createdAt',
      'updatedAt',
      'mode',
      'locks',
      'variation',
      'layers',
    ],
    'composition',
  );
  one(c.schemaVersion, [1], 'composition.schemaVersion');
  id(c.id, 'composition.id');
  text(c.name, 'composition.name', 1, 240);
  num(c.revision, 'composition.revision', 1, 1e9, true);
  timestamp(c.createdAt, 'composition.createdAt');
  timestamp(c.updatedAt, 'composition.updatedAt');
  if (Date.parse(String(c.updatedAt)) < Date.parse(String(c.createdAt)))
    fail('composition timestamps: update before creation');
  mode(c.mode);
  locks(c.locks);
  variation(c.variation);
  layers(c.layers);
  canonicalJson(c);
}
export function validateRequest(value: unknown): asserts value is RequestInput {
  const r = obj(value, 'request');
  keys(
    r,
    [
      'prompt',
      'layers',
      'mode',
      'locks',
      'variation',
      'permissions',
      'references',
      'baseAvoidRules',
    ],
    'request',
  );
  text(r.prompt, 'request.prompt', 1, 60000);
  layers(r.layers);
  mode(r.mode);
  locks(r.locks);
  variation(r.variation);
  const p = obj(r.permissions, 'permissions');
  keys(
    p,
    ['structure', 'wardrobe', 'design', 'environment', 'materialTarget', 'accent'],
    'permissions',
  );
  ['structure', 'wardrobe', 'design', 'environment'].forEach((k) => bool(p[k], 'permission.' + k));
  ['materialTarget', 'accent'].forEach((k) => text(p[k], 'permission.' + k, 0, 1000));
  const refs = array(r.references, 'references', 12);
  refs.forEach((v) => {
    const x = obj(v, 'reference');
    keys(x, ['id', 'role', 'contentHash'], 'reference');
    id(x.id, 'reference.id');
    one(x.role, ['subject', 'style', 'composition', 'avoid'], 'reference.role');
    hash(x.contentHash, 'reference.contentHash');
  });
  if (new Set(refs.map((v) => (v as Obj).id)).size !== refs.length)
    fail('reference IDs: duplicates');
  array(r.baseAvoidRules, 'baseAvoidRules', 100).forEach((v) => text(v, 'baseAvoidRule', 1, 1000));
  canonicalJson(r);
}
export const MAX_COMPOSITION_BYTES = 1024 * 1024;
export function parseComposition(textValue: string): Composition {
  if (utf8Bytes(textValue).byteLength > MAX_COMPOSITION_BYTES)
    fail('composition file: exceeds 1 MiB');
  const value: unknown = JSON.parse(textValue);
  validateComposition(value);
  return value;
}
