import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import catalogJson from './catalog.fixture.json';
import * as core from './index';

interface CatalogFixtureEntry {
  id: string;
  name: string;
  aliases: string[];
  packId: string;
  categoryId: string;
  kind: core.Kind;
  tags: string[];
  snapshot: core.Snapshot;
  snapshotHash: string;
  defaultFields: core.FieldId[];
  visualDna: core.Dna;
}

const catalog = catalogJson as unknown as CatalogFixtureEntry[];
const snapshots = new Map(catalog.map((x) => [x.id, x.snapshot]));
const clone = <T>(value: T): T => structuredClone(value);
const snap = (id: string): core.Snapshot => {
  const snapshot = snapshots.get(id);
  if (!snapshot) throw new Error(`Missing fixture snapshot: ${id}`);
  return clone(snapshot);
};
const subjectRef: core.Reference = {
  id: 'subject-1',
  role: 'subject',
  contentHash: 'a'.repeat(64),
};
async function request(id = 'SP18-010'): Promise<core.RequestInput> {
  const snapshot = snap(id);
  return {
    prompt: 'A ceramic pitcher with one handle on a plain surface.',
    layers: [await core.createLayer(snapshot, 'layer-1')],
    mode: 'generate',
    locks: { ...core.FREE_LAYOUT_LOCKS },
    variation: { ...core.NO_VARIATION },
    permissions: { ...core.NO_PERMISSIONS },
    references: [],
    baseAvoidRules: [],
  };
}
function grant(req: core.RequestInput): core.RequestInput {
  for (const l of req.layers) {
    const p = l.snapshot.policy.requires;
    if (p === 'materialTarget') req.permissions.materialTarget = 'the ceramic pitcher surface only';
    else if (p === 'accent') req.permissions.accent = 'muted vermilion on the pitcher handle';
    else if (p) req.permissions[p] = true;
  }
  return req;
}
async function composition(): Promise<core.Composition> {
  const r = await request();
  return {
    schemaVersion: 1,
    id: 'composition-1',
    name: 'Study',
    revision: 1,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
    mode: 'preserve',
    locks: { ...core.PRESERVE_LOCKS },
    variation: { ...core.NO_VARIATION },
    layers: r.layers,
  };
}
const rejectsCode = (promise: Promise<unknown>, code: string) =>
  assert.rejects(
    promise,
    (error) =>
      error instanceof core.CompilationBlocked && error.issues.some((i) => i.code === code),
  );
describe('intentional styles core', () => {
  for (const entry of catalog) {
    it(`catalog ${entry.id}: exact snapshot hash, default scope and compile`, async () => {
      core.validateSnapshot(entry.snapshot);
      assert.equal(await core.sha256(entry.snapshot), entry.snapshotHash);
      const req = grant(await request(entry.id));
      const out = await core.compileStyleRequest(req);
      assert.deepEqual(
        out.appliedFields.map((f) => f.field),
        core.FIELDS.filter((f) => entry.defaultFields.includes(f)),
      );
      assert.ok(out.effectivePrompt.includes(req.prompt));
      assert.match(out.styleRequestHash, /^[a-f0-9]{64}$/);
      assert.ok(out.appliedFields.every((f) => f.text === entry.visualDna[f.field]));
    });
  }
  it('canonical object key ordering is stable', () =>
    assert.equal(
      core.canonicalJson({ z: 1, a: { y: 2, b: 3 } }),
      core.canonicalJson({ a: { b: 3, y: 2 }, z: 1 }),
    ));
  it('canonical array order remains meaningful', () =>
    assert.notEqual(core.canonicalJson([1, 2]), core.canonicalJson([2, 1])));
  it('canonical Unicode remains intact', () =>
    assert.equal(
      core.canonicalJson({ text: 'ceniza · carbón 日本語' }),
      ' {"text":"ceniza · carbón 日本語"}'.trim(),
    ));
  const unsupportedCanonicalValues: ReadonlyArray<readonly [string, unknown]> = [
    ['undefined', undefined],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['bigint', 1n],
    ['date', new Date()],
  ];
  for (const [name, value] of unsupportedCanonicalValues)
    it(`canonical rejects ${name}`, () => assert.throws(() => core.canonicalJson(value)));
  it('canonical rejects cycle', () => {
    const x: { x?: unknown } = {};
    x.x = x;
    assert.throws(() => core.canonicalJson(x), /Cyclic/);
  });
  it('canonical rejects sparse array', () =>
    assert.throws(() => core.canonicalJson(Array(2)), /Sparse/));
  it('canonical rejects prototype pollution keys', () =>
    assert.throws(() => core.canonicalJson(JSON.parse('{"__proto__":{}}')), /Forbidden/));
  it('canonical rejects symbol keys', () =>
    assert.throws(() => core.canonicalJson({ [Symbol('x')]: 1 }), /Symbol/));
  it('canonical rejects getters', () =>
    assert.throws(
      () =>
        core.canonicalJson({
          get x() {
            return 1;
          },
        }),
      /Accessors/,
    ));
  it('createLayer isolates the authored snapshot', async () => {
    const s = snap('SP18-001');
    const l = await core.createLayer(s, 'a');
    s.dna.aesthetic = 'changed';
    assert.notEqual(s.dna.aesthetic, l.snapshot.dna.aesthetic);
  });
  it('snapshot requires all eight DNA fields', () => {
    const s = snap('SP18-001');
    delete (s.dna as Partial<core.Dna>).camera_and_composition;
    assert.throws(() => core.validateSnapshot(s), /missing/);
  });
  it('snapshot rejects unknown secret field', () => {
    const s = snap('SP18-001');
    (s as core.Snapshot & { apiKey?: string }).apiKey = 'not-a-real-key';
    assert.throws(() => core.validateSnapshot(s), /unknown/);
  });
  it('snapshot rejects duplicate mask fields', () => {
    const s = snap('SP18-001');
    s.policy.defaultFields.push('aesthetic');
    assert.throws(() => core.validateSnapshot(s), /unique/);
  });
  it('snapshot rejects invalid requirement', () => {
    const s = snap('SP18-001');
    (s.policy as { requires: string | null }).requires = 'automatic';
    assert.throws(() => core.validateSnapshot(s), /unsupported/);
  });
  it('snapshot hash mutation blocks compile', async () => {
    const r = await request();
    r.layers[0].snapshot.dna.aesthetic = 'tampered';
    await assert.rejects(core.compileStyleRequest(r), /hash mismatch/);
  });
  it('zero style strength rejected rather than silently clamped', async () => {
    const r = await request();
    r.layers[0].strength = 0;
    await assert.rejects(core.compileStyleRequest(r), /out of range/);
  });
  it('NaN field weight rejected', async () => {
    const r = await request();
    r.layers[0].fields.aesthetic.weight = NaN;
    await assert.rejects(core.compileStyleRequest(r), /out of range/);
  });
  it('six layers rejected', async () => {
    const r = await request();
    r.layers = Array.from({ length: 6 }, (_, i) => ({ ...clone(r.layers[0]), layerId: 'x' + i }));
    await assert.rejects(core.compileStyleRequest(r), /array limit/);
  });
  it('duplicate layer instance IDs rejected', async () => {
    const r = await request();
    r.layers.push(clone(r.layers[0]));
    await assert.rejects(core.compileStyleRequest(r), /duplicate instance/);
  });
  it('same preset can appear in distinct layer instances', async () => {
    const r = await request();
    r.layers.push({ ...clone(r.layers[0]), layerId: 'layer-2' });
    assert.equal((await core.compileStyleRequest(r)).appliedFields.length, 14);
  });
  it('same request produces identical output and hash', async () => {
    const r = await request();
    assert.deepEqual(await core.compileStyleRequest(r), await core.compileStyleRequest(r));
  });
  it('disabled variation text is not compiled', async () => {
    const r = await request();
    const a = await core.compileStyleRequest(r);
    r.variation.instruction = 'Move the camera';
    const b = await core.compileStyleRequest(r);
    assert.equal(a.styleRequestHash, b.styleRequestHash);
    assert.ok(!b.effectivePrompt.includes('Move the camera'));
  });
  it('explicit variation changes the request hash', async () => {
    const r = await request();
    const a = await core.compileStyleRequest(r);
    r.variation = { enabled: true, instruction: 'Use a wider spacing between existing shapes.' };
    const b = await core.compileStyleRequest(r);
    assert.notEqual(a.styleRequestHash, b.styleRequestHash);
    assert.ok(b.effectivePrompt.includes(r.variation.instruction));
  });
  it('variation needs explicit nonempty text', async () => {
    const r = await request();
    r.variation.enabled = true;
    await assert.rejects(core.compileStyleRequest(r), /explicit instruction/);
  });
  it('preservation needs a content reference', async () => {
    const r = await request();
    r.mode = 'preserve';
    r.locks = { ...core.PRESERVE_LOCKS };
    await rejectsCode(core.compileStyleRequest(r), 'PRESERVATION_NEEDS_CONTENT_REFERENCE');
  });
  it('style-only reference cannot masquerade as preservation target', async () => {
    const r = await request();
    r.mode = 'preserve';
    r.locks = { ...core.PRESERVE_LOCKS };
    r.references = [{ ...subjectRef, role: 'style' }];
    await rejectsCode(core.compileStyleRequest(r), 'PRESERVATION_NEEDS_CONTENT_REFERENCE');
  });
  it('preservation suppresses camera DNA', async () => {
    const r = await request();
    r.layers[0].fields.camera_and_composition.enabled = true;
    r.mode = 'preserve';
    r.locks = { ...core.PRESERVE_LOCKS };
    r.references = [subjectRef];
    const out = await core.compileStyleRequest(r);
    assert.ok(!out.appliedFields.some((f) => f.field === 'camera_and_composition'));
    assert.ok(out.issues.some((i) => i.code === 'CAMERA_FIELD_SUPPRESSED'));
    assert.ok(!out.effectivePrompt.includes('force substantial variation'));
  });
  it('preservation refuses released locks', async () => {
    const r = await request();
    r.mode = 'preserve';
    r.locks = { ...core.PRESERVE_LOCKS, camera: false };
    r.references = [subjectRef];
    await rejectsCode(core.compileStyleRequest(r), 'PRESERVATION_LOCKS_REQUIRED');
  });
  it('preservation refuses variation', async () => {
    const r = await request();
    r.mode = 'preserve';
    r.locks = { ...core.PRESERVE_LOCKS };
    r.references = [subjectRef];
    r.variation = { enabled: true, instruction: 'Change the pose' };
    await rejectsCode(core.compileStyleRequest(r), 'PRESERVATION_VARIATION_CONFLICT');
  });
  it('reference role is explicit in request', async () => {
    const r = await request();
    r.references = [{ ...subjectRef, role: 'style' }];
    const out = await core.compileStyleRequest(r);
    assert.ok(out.effectivePrompt.includes('Borrow visual treatment only'));
  });
  it('reference digest affects style request hash', async () => {
    const r = await request();
    r.references = [subjectRef];
    const a = await core.compileStyleRequest(r);
    r.references[0] = { ...subjectRef, contentHash: 'b'.repeat(64) };
    assert.notEqual(a.styleRequestHash, (await core.compileStyleRequest(r)).styleRequestHash);
  });
  it('reference digest requires SHA-256 format', async () => {
    const r = await request();
    r.references = [{ ...subjectRef, contentHash: 'bad' }];
    await assert.rejects(core.compileStyleRequest(r), /SHA-256/);
  });
  it('duplicate reference IDs rejected', async () => {
    const r = await request();
    r.references = [subjectRef, subjectRef];
    await assert.rejects(core.compileStyleRequest(r), /reference IDs/);
  });
  it('style name cannot reintroduce camera anchors', async () => {
    const r = await request('SP12-001');
    for (const f of core.FIELDS) r.layers[0].fields[f].enabled = f === 'color_and_tone';
    const out = await core.compileStyleRequest(r);
    assert.ok(!out.effectivePrompt.includes('Katana'));
    assert.ok(!out.effectivePrompt.includes('strict side-on'));
  });
  it('material modifier requires target', async () =>
    await rejectsCode(core.compileStyleRequest(await request('SP09-001')), 'PERMISSION_REQUIRED'));
  it('material target is compiled and does not enable camera', async () => {
    const r = grant(await request('SP09-001'));
    const out = await core.compileStyleRequest(r);
    assert.equal(out.appliedFields.length, 2);
    assert.ok(out.effectivePrompt.includes('Material target:'));
  });
  it('thematic wardrobe requires permission', async () =>
    await rejectsCode(core.compileStyleRequest(await request('SP08-001')), 'PERMISSION_REQUIRED'));
  it('palette alone from wardrobe does not require redesign permission', async () => {
    const r = await request('SP08-001');
    for (const f of core.FIELDS) r.layers[0].fields[f].enabled = f === 'color_and_tone';
    assert.equal((await core.compileStyleRequest(r)).appliedFields.length, 1);
  });
  it('structural profile rejects preservation even with grant', async () => {
    const r = grant(await request('SP18-041'));
    r.mode = 'preserve';
    r.locks = { ...core.PRESERVE_LOCKS };
    r.references = [subjectRef];
    await rejectsCode(core.compileStyleRequest(r), 'STRUCTURE_LOCK_CONFLICT');
  });
  it('contradictory camera profiles are detected', async () => {
    const r = grant(await request('SP18-041'));
    r.layers.push(await core.createLayer(snap('SP18-042'), 'layer-2'));
    await rejectsCode(core.compileStyleRequest(r), 'STRUCTURAL_CONFLICT');
  });
  it('different full media yield an explicit warning', async () => {
    const r = await request('SP01-001');
    r.layers.push(await core.createLayer(snap('SP17-001'), 'layer-2'));
    assert.ok(
      (await core.compileStyleRequest(r)).issues.some((i) => i.code === 'MEDIUM_COMPETITION'),
    );
  });
  it('known negative-medium conflict blocks', async () => {
    const r = await request('SP06-001');
    r.baseAvoidRules = ['painting'];
    await rejectsCode(core.compileStyleRequest(r), 'NEGATIVE_MEDIUM_CONFLICT');
  });
  it('unknown negative semantics are not guessed', async () => {
    const r = await request('SP06-001');
    r.baseAvoidRules = ['bad painting edges'];
    await core.compileStyleRequest(r);
  });
  it('all inactive fields produce an explicit error', async () => {
    const r = await request();
    for (const f of core.FIELDS) r.layers[0].fields[f].enabled = false;
    await rejectsCode(core.compileStyleRequest(r), 'NO_ACTIVE_FIELDS');
  });
  it('inactive layers contribute no avoid rules or DNA', async () => {
    const r = await request();
    const extra = await core.createLayer(snap('SP09-001'), 'disabled');
    extra.enabled = false;
    r.layers.push(extra);
    const out = await core.compileStyleRequest(r);
    assert.ok(!out.avoidRules.some((x) => x.text.includes('varnished')));
  });
  it('field-scoped rules disappear with their field', async () => {
    const r = grant(await request('SP09-001'));
    r.layers[0].fields.texture_and_material.enabled = false;
    const out = await core.compileStyleRequest(r);
    assert.equal(out.avoidRules.length, 0);
  });
  it('ignore mode removes layer negatives', async () => {
    const r = await request();
    r.layers[0].avoidRulesMode = 'ignore';
    assert.equal((await core.compileStyleRequest(r)).avoidRules.length, 0);
  });
  it('strict dedup preserves rule text and provenance', async () => {
    const r = await request();
    const text = r.layers[0].snapshot.policy.avoidRules[0].text;
    r.baseAvoidRules = [text.toUpperCase()];
    r.layers[0].avoidRulesMode = 'strict';
    const out = await core.compileStyleRequest(r);
    const matches = out.avoidRules.filter((x) => x.text.toLowerCase() === text.toLowerCase());
    assert.equal(matches.length, 1);
    assert.equal(matches[0].strict, true);
    assert.deepEqual(matches[0].layerIds, ['layer-1']);
  });
  it('negative clauses containing commas are not split', async () => {
    const r = await request();
    r.baseAvoidRules = ['keep dry texture, not glossy'];
    const out = await core.compileStyleRequest(r);
    assert.ok(out.avoidRules.some((x) => x.text === 'keep dry texture, not glossy'));
  });
  it('compile does not mutate caller data', async () => {
    const r = await request();
    const before = JSON.stringify(r);
    await core.compileStyleRequest(r);
    assert.equal(JSON.stringify(r), before);
  });
  it('composition round-trip retains all settings and disabled layers', async () => {
    const c = await composition();
    c.layers[0].fields.aesthetic = { enabled: false, weight: 0.17 };
    c.layers[0].strength = 0.43;
    c.layers[0].avoidRulesMode = 'strict';
    const second = await core.createLayer(snap('SP18-031'), 'layer-2');
    second.enabled = false;
    c.layers.push(second);
    assert.deepEqual(await core.importComposition(await core.exportComposition(c)), c);
  });
  it('composition preserves DNA beyond the old 860-character cap', async () => {
    const c = await composition();
    c.layers[0].snapshot.dna.aesthetic = 'Concrete field detail. '.repeat(100);
    c.layers[0].snapshotHash = await core.sha256(c.layers[0].snapshot);
    const copy = await core.importComposition(await core.exportComposition(c));
    assert.equal(
      copy.layers[0].snapshot.dna.aesthetic.length,
      c.layers[0].snapshot.dna.aesthetic.length,
    );
    assert.ok(copy.layers[0].snapshot.dna.aesthetic.length > 860);
  });
  for (const key of ['prompt', 'attachments', 'apiKey', 'provider', 'referenceImages'])
    it(`composition excludes ${key}`, async () => {
      const c = await composition();
      (c as core.Composition & Record<string, unknown>)[key] = 'forbidden';
      await assert.rejects(core.exportComposition(c), /unknown/);
    });
  it('composition rejects oversize input before parse', async () =>
    await assert.rejects(
      core.importComposition(' '.repeat(core.MAX_COMPOSITION_BYTES + 1)),
      /exceeds/,
    ));
  it('composition rejects bad JSON', async () =>
    await assert.rejects(core.importComposition('{broken')));
  it('composition rejects unsupported schema version', async () => {
    const c = await composition();
    (c as { schemaVersion: number }).schemaVersion = 2;
    await assert.rejects(core.exportComposition(c), /unsupported/);
  });
  it('composition rejects impossible date', async () => {
    const c = await composition();
    c.createdAt = '2026-02-30T00:00:00Z';
    await assert.rejects(core.exportComposition(c), /calendar/);
  });
  it('composition rejects update before creation', async () => {
    const c = await composition();
    c.updatedAt = '2025-09-20T00:00:00Z';
    await assert.rejects(core.exportComposition(c), /before creation/);
  });
  it('revision uses expected revision and isolates inputs', async () => {
    const c = await composition();
    const changes = {
      name: 'Changed',
      mode: c.mode,
      locks: c.locks,
      variation: c.variation,
      layers: c.layers,
    };
    const next = core.reviseComposition(c, 1, changes, '2026-09-20T01:00:00Z');
    assert.equal(next.revision, 2);
    assert.equal(c.revision, 1);
    next.layers[0].strength = 0.2;
    assert.notEqual(next.layers[0].strength, c.layers[0].strength);
  });
  it('revision conflicts reject stale writes', async () => {
    const c = await composition();
    assert.throws(
      () => core.reviseComposition(c, 0, c, '2026-09-20T01:00:00Z'),
      core.RevisionConflict,
    );
  });
  it('revision forbids backward timestamp', async () => {
    const c = await composition();
    assert.throws(() => core.reviseComposition(c, 1, c, '2026-09-19T01:00:00Z'), /backwards/);
  });
  it('duplicate gets new instance identities and pinned snapshots', async () => {
    const c = await composition();
    const d = core.duplicateComposition(c, 'copy', 'Copy', '2026-09-20T02:00:00Z');
    assert.notEqual(d.layers[0].layerId, c.layers[0].layerId);
    assert.deepEqual(d.layers[0].snapshot, c.layers[0].snapshot);
    assert.equal(d.revision, 1);
  });
  it('duplicate rejects same composition identity', async () => {
    const c = await composition();
    assert.throws(() => core.duplicateComposition(c, c.id, 'Copy', c.createdAt), /new composition/);
  });
  it('available updates never rewrite pinned snapshot', async () => {
    const c = await composition();
    const before = JSON.stringify(c);
    const updates = core.getAvailableUpdates(c, { 'SP18-010': 4 });
    assert.equal(updates[0].availableVersion, 4);
    assert.equal(JSON.stringify(c), before);
  });
  const searchEntries = catalog.map((x) => ({
    id: x.id,
    name: x.name,
    aliases: x.aliases,
    packId: x.packId,
    categoryId: x.categoryId,
    kind: x.kind,
    tags: x.tags,
  }));
  it('metadata search returns exact name first', () =>
    assert.equal(core.searchCatalog(searchEntries, 'Studio Headshot')[0].id, 'SP01-001'));
  it('search retains explicit pack scope', () =>
    assert.equal(
      core
        .searchCatalog(searchEntries, 'oil', { packId: 'pack_18' })
        .some((x) => x.packId === 'pack_06'),
      false,
    ));
  it('search retains favorites scope with query', () =>
    assert.deepEqual(
      core.searchCatalog(searchEntries, '', { favoriteIds: ['SP09-001'] }).map((x) => x.id),
      ['SP09-001'],
    ));
  it('search finds historical source alias', () =>
    assert.equal(
      core.searchCatalog(searchEntries, 'Octane Spectral GPU Path Tracer')[0].id,
      'SP03-001',
    ));
  it('search normalizes accents', () =>
    assert.equal(core.normalizeQuery('  Ilustración '), 'ilustracion'));
  it('search limits validated', () =>
    assert.throws(() => core.searchCatalog(searchEntries, '', {}, 0), /limit/));
  it('search pagination bound respected', () =>
    assert.equal(core.searchCatalog(searchEntries, '', {}, 5).length, 5));
  const current = { presetId: 'X', version: 2, snapshotHash: 'a'.repeat(64) };
  const verified: core.PreviewEvidence = {
    presetId: 'X',
    presetVersion: 2,
    snapshotHash: 'a'.repeat(64),
    state: 'verified',
    provider: 'test-provider',
    model: 'test-model',
    benchmarkId: 'test-case',
    verified: true,
  };
  it('image without metadata is unknown', () =>
    assert.equal(core.previewStatus(null, current, true), 'unknown'));
  it('missing bytes are missing regardless of metadata', () =>
    assert.equal(core.previewStatus(verified, current, false), 'missing'));
  it('preview version change invalidates evidence', () =>
    assert.equal(core.previewStatus({ ...verified, presetVersion: 1 }, current, true), 'stale'));
  it('preview hash change invalidates evidence', () =>
    assert.equal(
      core.previewStatus({ ...verified, snapshotHash: 'b'.repeat(64) }, current, true),
      'stale',
    ));
  it('preview needs provider evidence', () =>
    assert.equal(core.previewStatus({ ...verified, provider: null }, current, true), 'unknown'));
  it('complete preview evidence verifies only matching snapshot', () =>
    assert.equal(core.previewStatus(verified, current, true), 'verified'));
  it('legacy adapter uses reviewed masks for new selections', async () => {
    const s = snap('SP09-001');
    const slot = {
      preset: { id: s.presetId, name: s.name, style: s.dna },
      packId: s.packId,
      packName: 'Materials',
      strength: 0.75,
      fieldControls: { cameraComposition: { enabled: true, weight: 0.4 } },
    };
    const layer = await core.layerFromLegacySlot(slot, s.policy, s.version, 'l');
    assert.equal(layer.fields.camera_and_composition.enabled, false);
  });
  it('legacy adapter explicitly restores saved controls', async () => {
    const s = snap('SP09-001');
    const slot = {
      preset: { id: s.presetId, name: s.name, style: s.dna },
      packId: s.packId,
      packName: 'Materials',
      strength: 0.61,
      fieldControls: { cameraComposition: { enabled: true, weight: 0.4 } },
    };
    const layer = await core.layerFromLegacySlot(slot, s.policy, s.version, 'l', true);
    assert.equal(layer.fields.camera_and_composition.enabled, true);
    assert.equal(layer.fields.camera_and_composition.weight, 0.4);
  });
  it('legacy adapter never inserts generic Standard DNA', () => {
    const s = snap('SP18-001');
    delete (s.dna as Partial<core.Dna>).aesthetic;
    assert.throws(() =>
      core.snapshotFromRuntime(
        { id: s.presetId, name: s.name, style: s.dna },
        s.packId,
        s.version,
        s.policy,
      ),
    );
  });

  it('oversize Unicode export rejects rather than making an unimportable file', async () => {
    const c = await composition();
    const s = snap('SP18-001');
    for (const f of core.FIELDS) s.dna[f] = '界'.repeat(12000);
    c.layers = [];
    for (let i = 0; i < 5; i++) c.layers.push(await core.createLayer(s, 'large-' + i));
    await assert.rejects(core.exportComposition(c), /exceeds 1 MiB/);
  });
});
