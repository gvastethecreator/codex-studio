import { describe, expect, it } from 'vitest';

import catalogJson from '../../packages/shared/src/styles/intentional-v1/catalog.fixture.json';
import { RECIPE_CONTEXT_BUILDERS } from '../../lib/recipeContextBuilders';
import { compileIntentionalStylePlan } from './intentionalStyleCompile';
import type { SelectedStyleSlot } from './styleLayerComposer';

const catalog = catalogJson as Array<{
  id: string;
  name: string;
  packId: string;
  packName: string;
  snapshot: { dna: SelectedStyleSlot['preset']['style'] };
}>;

function slotFor(id: string): SelectedStyleSlot {
  const entry = catalog.find((item) => item.id === id);
  if (!entry) throw new Error(`Missing catalog fixture ${id}`);
  return {
    preset: {
      id: entry.id,
      name: entry.name,
      style: entry.snapshot.dna,
    },
    packId: entry.packId,
    packName: entry.packName,
    strength: 0.75,
    enabled: true,
  };
}

describe('intentionalStyleCompile', () => {
  it('compiles the same Headshot request to the same hash', async () => {
    const input = {
      slots: [slotFor('SP01-001')],
      prompt: 'A ceramic pitcher on a plain surface.',
      attachments: [],
      mode: 'generate' as const,
      locks: {
        identity: true,
        pose: false,
        camera: false,
        composition: false,
      },
      variation: { enabled: false, instruction: '' },
      permissions: {
        structure: false,
        wardrobe: false,
        design: false,
        environment: false,
        materialTarget: '',
        accent: '',
      },
      baseAvoidRules: [] as string[],
    };
    const first = await compileIntentionalStylePlan(input);
    const second = await compileIntentionalStylePlan(input);
    expect(first.styleRequestHash).toBe(second.styleRequestHash);
    expect(first.effectivePrompt).not.toMatch(/force substantial variation/i);
    expect(first.effectivePrompt).not.toMatch(/Vary camera framing/i);
    expect(first.recipeParams.effectivePrompt).toBe(first.effectivePrompt);
  });

  it('preserves pose and composition when an image is attached', async () => {
    const compiled = await compileIntentionalStylePlan({
      slots: [slotFor('SP01-001')],
      prompt: 'Keep this person in the same studio setup.',
      attachments: [
        {
          id: 'ref-1',
          name: 'source.png',
          dataUrl: 'data:image/png;base64,aaaa',
          strength: 1,
        },
      ],
      mode: 'preserve',
      locks: {
        identity: true,
        pose: true,
        camera: true,
        composition: true,
      },
      variation: { enabled: false, instruction: '' },
      permissions: {
        structure: false,
        wardrobe: false,
        design: false,
        environment: false,
        materialTarget: '',
        accent: '',
      },
      baseAvoidRules: [],
    });
    expect(compiled.recipeParams.styleReferenceMode).toBe('preserve');
    expect(compiled.effectivePrompt).toContain('Mode: preserve.');
    expect(compiled.effectivePrompt).toContain('Preserve pose');
    expect(compiled.effectivePrompt).toContain('ref-1:composition — composition:');
  });

  it('releases pose and camera when the reference is reinterpreted', async () => {
    const compiled = await compileIntentionalStylePlan({
      slots: [slotFor('SP01-001')],
      prompt: 'Keep this person, but change the pose and framing.',
      attachments: [
        {
          id: 'ref-1',
          name: 'source.png',
          dataUrl: 'data:image/png;base64,aaaa',
          strength: 1,
        },
      ],
      mode: 'reinterpret',
      locks: {
        identity: true,
        pose: false,
        camera: false,
        composition: false,
      },
      variation: { enabled: false, instruction: '' },
      permissions: {
        structure: false,
        wardrobe: false,
        design: false,
        environment: false,
        materialTarget: '',
        accent: '',
      },
      baseAvoidRules: [],
    });
    expect(compiled.recipeParams.styleReferenceMode).toBe('reinterpret');
    expect(compiled.effectivePrompt).toContain('Mode: reinterpret.');
    expect(compiled.effectivePrompt).toContain('Restage only the aspects whose locks are released');
    expect(compiled.effectivePrompt).not.toContain('Preserve pose');
    expect(compiled.effectivePrompt).not.toContain('composition:');
  });

  it('does not emit restage copy when a reference is attached', async () => {
    const compiled = await compileIntentionalStylePlan({
      slots: [slotFor('SP01-001')],
      prompt: 'Keep this person in the same studio setup.',
      attachments: [
        {
          id: 'ref-1',
          name: 'source.png',
          dataUrl: 'data:image/png;base64,aaaa',
          strength: 1,
        },
      ],
      mode: 'generate',
      locks: {
        identity: true,
        pose: false,
        camera: false,
        composition: false,
      },
      variation: { enabled: false, instruction: '' },
      permissions: {
        structure: false,
        wardrobe: false,
        design: false,
        environment: false,
        materialTarget: '',
        accent: '',
      },
      baseAvoidRules: [],
    });
    expect(compiled.effectivePrompt).not.toContain('Re-stage the subject');
    expect(compiled.effectivePrompt).not.toContain('Do not preserve pose');
  });

  it('blocks Oak Wood until a material target is set', async () => {
    await expect(
      compileIntentionalStylePlan({
        slots: [slotFor('SP09-001')],
        prompt: 'A wooden bowl.',
        attachments: [],
        mode: 'generate',
        locks: {
          identity: true,
          pose: false,
          camera: false,
          composition: false,
        },
        variation: { enabled: false, instruction: '' },
        permissions: {
          structure: false,
          wardrobe: false,
          design: false,
          environment: false,
          materialTarget: '',
          accent: '',
        },
        baseAvoidRules: [],
      }),
    ).rejects.toMatchObject({ name: 'CompilationBlocked' });
  });

  it('keeps compiled request context free of style names and restage rules', () => {
    const context = RECIPE_CONTEXT_BUILDERS.styles.buildContext({
      effectivePrompt: 'Apply charcoal editorial ink. Keep the pitcher identity.',
      styleRequestHash: 'a'.repeat(64),
      presetName: 'Katana Zero Neo-Noir Sideview',
      roleInstruction: 'Re-stage the subject with a different gesture.',
      creativeBrief: 'strict side-on action sprite',
    });
    expect(context).toContain('INTENTIONAL STYLE REQUEST');
    expect(context).toContain('Apply charcoal editorial ink');
    expect(context).not.toContain('Katana');
    expect(context).not.toContain('Re-stage the subject');
    expect(context).not.toContain('strict side-on');
  });
});
