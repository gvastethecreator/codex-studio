import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vite-plus/test';

import type {
  StylePackManifest,
  StylePresetManifest,
} from '../components/recipes/styles/manifestTypes';
import { createStylePresetScaffoldPlan, scaffoldStylePreset } from './scaffold-style-preset';

const yamlDumpOptions = {
  lineWidth: -1,
  noRefs: true,
  sortKeys: false,
} as const;

async function createTempRepo() {
  return mkdtemp(path.join(tmpdir(), 'style-scaffold-'));
}

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

async function writeYamlRepoFile(rootDir: string, repoPath: string, value: unknown) {
  await writeRepoFile(rootDir, repoPath, `${yaml.dump(value, yamlDumpOptions)}\n`);
}

function createStyleTemplate(): StylePresetManifest {
  return {
    schemaVersion: 1,
    id: 'PRESET-ID',
    packId: 'pack_01',
    name: 'Human Readable Preset Name',
    category: '1. Portrait Styles',
    version: 1,
    supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
    tags: ['pack-slug', 'category-slug'],
    visualDna: {
      aesthetic: 'Overall visual style direction in one precise sentence.',
      subject_treatment: 'How the subject is shaped, posed, rendered, or stylized.',
      color_and_tone: 'Palette, contrast, grading, and tonal range.',
      lighting_and_shadow: 'Light source, direction, softness, shadow behavior.',
      texture_and_material: 'Surface detail, material feel, grain, fabric, skin, ink, pixels.',
      camera_and_composition: 'Lens, framing, perspective, crop, depth of field, layout.',
      atmosphere_and_mood: 'Emotional tone, scene energy, ambient quality.',
      rendering_and_quality: 'Output polish, fidelity, medium-specific finish.',
    },
    avoidRules: ['watermark', 'text'],
    assets: {
      defaultImage: '/assets/recipes/styles/defaults/PRESET-ID.webp',
    },
    attributes: {
      negativePrompt: 'watermark, text',
    },
    taxonomy: {
      packId: 'pack_01',
      packName: 'Photography & Realism',
      categoryId: 'portrait-styles',
      categoryName: '1. Portrait Styles',
      tags: ['pack-slug', 'category-slug'],
      supportedTasks: ['image_generate', 'image_edit', 'style_preset_card'],
      hasDefaultImage: true,
    },
  };
}

function createSpriteTemplate(): StylePresetManifest {
  return {
    schemaVersion: 1,
    id: 'SPRITE-PRESET-ID',
    packId: 'pack_06',
    name: 'Human Readable Sprite Style',
    category: '6. Video Game & Pixel Art Styles',
    version: 1,
    supportedTasks: ['sprite_sheet', 'image_generate', 'style_preset_card'],
    tags: ['game-art', 'sprite-sheet'],
    visualDna: {
      aesthetic:
        'Sprite-ready game art with clear silhouette language and readable shape hierarchy.',
      subject_treatment:
        'Consistent proportions across frames, strong pose readability, clean action arcs.',
      color_and_tone:
        'Limited palette with separated shadow, midtone, highlight, and accent ramps.',
      lighting_and_shadow: 'Simple directional lighting that stays stable across animation frames.',
      texture_and_material: 'Controlled pixel/noise detail that does not shimmer between frames.',
      camera_and_composition:
        'Orthographic side or three-quarter view, centered subject, stable scale.',
      atmosphere_and_mood: 'Expressive game feel without scene clutter or background dependency.',
      rendering_and_quality: 'Animation-sheet friendly, crisp edges, no motion blur, no text.',
    },
    avoidRules: ['motion blur', 'watermark', 'text'],
    assets: {
      defaultImage: '/assets/recipes/styles/defaults/SPRITE-PRESET-ID.webp',
    },
    attributes: {
      negativePrompt: 'motion blur, watermark, text',
      layout: {
        preferredFrameCount: 8,
      },
    },
    taxonomy: {
      packId: 'pack_06',
      packName: 'Essential Art Styles',
      categoryId: 'video-game-and-pixel-art-styles',
      categoryName: '6. Video Game & Pixel Art Styles',
      tags: ['game-art', 'sprite-sheet'],
      supportedTasks: ['sprite_sheet', 'image_generate', 'style_preset_card'],
      hasDefaultImage: true,
    },
  };
}

describe('scaffold-style-preset', () => {
  it('plans a preset manifest and grouped pack refs without touching real manifests', async () => {
    const rootDir = await createTempRepo();

    await writeYamlRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/style-preset.template.yaml',
      createStyleTemplate(),
    );
    await writeYamlRepoFile(rootDir, 'components/recipes/styles/manifests/packs/pack_99.yaml', {
      schemaVersion: 1,
      id: 'pack_99',
      name: 'Test Pack',
      description: 'Preset scaffolding pack',
      categories: [
        {
          id: 'portrait-styles',
          name: '1. Portrait Styles',
          presetRefs: ['pack_99/SP99-001.yaml'],
        },
        {
          id: 'lighting',
          name: '2. Lighting',
          presetRefs: ['pack_99/SP99-010.yaml'],
        },
      ],
      presetRefs: ['pack_99/SP99-001.yaml', 'pack_99/SP99-010.yaml'],
    } satisfies StylePackManifest);

    const plan = await createStylePresetScaffoldPlan({
      rootDir,
      presetId: 'SP99-002',
      packId: 'pack_99',
      category: 'portrait-styles',
      name: 'Soft Test Portrait',
      template: 'style',
    });

    expect(plan.dryRun).toBe(true);
    expect(plan.presetRef).toBe('pack_99/SP99-002.yaml');
    expect(plan.presetFileRepoPath).toBe(
      'components/recipes/styles/manifests/presets/pack_99/SP99-002.yaml',
    );
    expect(plan.defaultImagePath).toBe('/assets/recipes/styles/defaults/SP99-002.webp');

    const presetManifest = yaml.load(plan.presetManifestYaml) as StylePresetManifest;
    const updatedPackManifest = yaml.load(plan.packManifestYaml) as StylePackManifest;

    expect(presetManifest.id).toBe('SP99-002');
    expect(presetManifest.packId).toBe('pack_99');
    expect(presetManifest.name).toBe('Soft Test Portrait');
    expect(presetManifest.category).toBe('1. Portrait Styles');
    expect(presetManifest.tags).toEqual(['test-pack', 'portrait-styles']);
    expect(presetManifest.taxonomy).toMatchObject({
      packId: 'pack_99',
      packName: 'Test Pack',
      categoryId: 'portrait-styles',
      categoryName: '1. Portrait Styles',
      hasDefaultImage: false,
    });
    expect(updatedPackManifest.categories[0].presetRefs).toEqual([
      'pack_99/SP99-001.yaml',
      'pack_99/SP99-002.yaml',
    ]);
    expect(updatedPackManifest.presetRefs).toEqual([
      'pack_99/SP99-001.yaml',
      'pack_99/SP99-002.yaml',
      'pack_99/SP99-010.yaml',
    ]);
    expect(plan.nextSteps[0]).toContain('/assets/recipes/styles/defaults/SP99-002.webp');
  });

  it('supports category lookup by exact display name and normalizes custom default-image paths', async () => {
    const rootDir = await createTempRepo();

    await writeYamlRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml',
      createSpriteTemplate(),
    );
    await writeYamlRepoFile(rootDir, 'components/recipes/styles/manifests/packs/pack_06.yaml', {
      schemaVersion: 1,
      id: 'pack_06',
      name: 'Essential Art Styles',
      description: 'Sprite scaffolding pack',
      categories: [
        {
          id: 'video-game-and-pixel-art-styles',
          name: '6. Video Game & Pixel Art Styles',
          presetRefs: [],
        },
      ],
      presetRefs: [],
    } satisfies StylePackManifest);

    const plan = await createStylePresetScaffoldPlan({
      rootDir,
      presetId: 'SPR99-001',
      packId: 'pack_06',
      category: '6. Video Game & Pixel Art Styles',
      name: 'Battle Sprite Hero',
      template: 'sprite',
      defaultImage: 'assets\\recipes\\styles\\defaults\\SPR99-001.webp',
    });

    const presetManifest = yaml.load(plan.presetManifestYaml) as StylePresetManifest;
    expect(plan.categoryId).toBe('video-game-and-pixel-art-styles');
    expect(plan.defaultImagePath).toBe('/assets/recipes/styles/defaults/SPR99-001.webp');
    expect(presetManifest.assets.defaultImage).toBe(
      '/assets/recipes/styles/defaults/SPR99-001.webp',
    );
    expect(presetManifest.taxonomy).toMatchObject({
      categoryId: 'video-game-and-pixel-art-styles',
      categoryName: '6. Video Game & Pixel Art Styles',
      hasDefaultImage: true,
    });
    expect(presetManifest.supportedTasks).toEqual([
      'sprite_sheet',
      'image_generate',
      'style_preset_card',
    ]);
  });

  it('refuses duplicate preset ids before writing any files', async () => {
    const rootDir = await createTempRepo();

    await writeYamlRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/style-preset.template.yaml',
      createStyleTemplate(),
    );
    await writeYamlRepoFile(rootDir, 'components/recipes/styles/manifests/packs/pack_99.yaml', {
      schemaVersion: 1,
      id: 'pack_99',
      name: 'Test Pack',
      description: 'Preset scaffolding pack',
      categories: [
        {
          id: 'portrait-styles',
          name: '1. Portrait Styles',
          presetRefs: [],
        },
      ],
      presetRefs: [],
    } satisfies StylePackManifest);
    await writeYamlRepoFile(
      rootDir,
      'components/recipes/styles/manifests/presets/pack_98/SP99-002.yaml',
      {
        ...createStyleTemplate(),
        id: 'SP99-002',
        packId: 'pack_98',
      } satisfies StylePresetManifest,
    );

    await expect(
      createStylePresetScaffoldPlan({
        rootDir,
        presetId: 'SP99-002',
        packId: 'pack_99',
        category: 'portrait-styles',
        name: 'Soft Test Portrait',
        template: 'style',
      }),
    ).rejects.toThrow('Preset id SP99-002 already exists');
  });

  it('refuses duplicate refs and writes files only when --write behavior is requested', async () => {
    const rootDir = await createTempRepo();

    await writeYamlRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/style-preset.template.yaml',
      createStyleTemplate(),
    );
    await writeYamlRepoFile(rootDir, 'components/recipes/styles/manifests/packs/pack_99.yaml', {
      schemaVersion: 1,
      id: 'pack_99',
      name: 'Test Pack',
      description: 'Preset scaffolding pack',
      categories: [
        {
          id: 'portrait-styles',
          name: '1. Portrait Styles',
          presetRefs: ['pack_99/SP99-003.yaml'],
        },
      ],
      presetRefs: ['pack_99/SP99-003.yaml'],
    } satisfies StylePackManifest);

    await expect(
      createStylePresetScaffoldPlan({
        rootDir,
        presetId: 'SP99-003',
        packId: 'pack_99',
        category: 'portrait-styles',
        name: 'Duplicate Ref Preset',
        template: 'style',
      }),
    ).rejects.toThrow('already references pack_99/SP99-003.yaml');

    const writeRootDir = await createTempRepo();
    await writeYamlRepoFile(
      writeRootDir,
      'components/recipes/styles/manifests/templates/style-preset.template.yaml',
      createStyleTemplate(),
    );
    await writeYamlRepoFile(
      writeRootDir,
      'components/recipes/styles/manifests/packs/pack_99.yaml',
      {
        schemaVersion: 1,
        id: 'pack_99',
        name: 'Test Pack',
        description: 'Preset scaffolding pack',
        categories: [
          {
            id: 'portrait-styles',
            name: '1. Portrait Styles',
            presetRefs: [],
          },
        ],
        presetRefs: [],
      } satisfies StylePackManifest,
    );

    const appliedPlan = await scaffoldStylePreset({
      rootDir: writeRootDir,
      presetId: 'SP99-004',
      packId: 'pack_99',
      category: 'portrait-styles',
      name: 'Writable Test Portrait',
      template: 'style',
      write: true,
    });

    expect(appliedPlan.dryRun).toBe(false);
    await expect(
      readFile(
        path.join(
          writeRootDir,
          'components/recipes/styles/manifests/presets/pack_99/SP99-004.yaml',
        ),
        'utf8',
      ),
    ).resolves.toContain('id: SP99-004');
    await expect(
      readFile(
        path.join(writeRootDir, 'components/recipes/styles/manifests/packs/pack_99.yaml'),
        'utf8',
      ),
    ).resolves.toContain('pack_99/SP99-004.yaml');
  });
});
