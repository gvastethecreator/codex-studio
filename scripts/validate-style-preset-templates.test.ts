import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createStylePresetTemplateReport } from './validate-style-preset-templates';

async function writeRepoFile(rootDir: string, repoPath: string, source: string) {
  const filePath = path.join(rootDir, repoPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, source, 'utf8');
}

const validTemplate = ({ id, tasks }: { id: string; tasks: string[] }) => `schemaVersion: 1
id: ${id}
packId: pack_01
name: ${id} Name
category: 1. Portrait Styles
version: 1
supportedTasks:
${tasks.map((task) => `  - ${task}`).join('\n')}
tags:
  - template
visualDna:
  aesthetic: clear visual direction
  subject_treatment: clear subject treatment
  color_and_tone: clear color and tone
  lighting_and_shadow: clear lighting and shadow
  texture_and_material: clear texture and material
  camera_and_composition: clear camera and composition
  atmosphere_and_mood: clear atmosphere and mood
  rendering_and_quality: clear rendering and quality
avoidRules:
  - watermark
assets:
  defaultImage: /assets/recipes/styles/defaults/${id}.webp
taxonomy:
  packId: pack_01
  packName: Photography & Realism
  categoryId: portrait-styles
  categoryName: 1. Portrait Styles
  tags:
    - template
  supportedTasks:
${tasks.map((task) => `    - ${task}`).join('\n')}
  hasDefaultImage: true
`;

describe('style preset template validation', () => {
  it('accepts required task-specific templates', async () => {
    const rootDir = path.join(tmpdir(), `style-template-valid-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/style-preset.template.yaml',
      validTemplate({
        id: 'STYLE-TEMPLATE',
        tasks: ['image_generate', 'image_edit', 'style_preset_card'],
      }),
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml',
      validTemplate({
        id: 'SPRITE-TEMPLATE',
        tasks: ['sprite_sheet', 'image_generate', 'style_preset_card'],
      }),
    );
    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/texture-preset.template.yaml',
      validTemplate({
        id: 'TEXTURE-TEMPLATE',
        tasks: ['texture_generate', 'image_generate', 'style_preset_card'],
      }),
    );

    const report = await createStylePresetTemplateReport(rootDir);

    expect(report.templateCount).toBe(3);
    expect(report.violations).toEqual([]);
  });

  it('reports missing required templates and task drift', async () => {
    const rootDir = path.join(tmpdir(), `style-template-invalid-${Date.now()}`);

    await writeRepoFile(
      rootDir,
      'components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml',
      validTemplate({
        id: 'SPRITE-TEMPLATE',
        tasks: ['image_generate', 'style_preset_card'],
      }),
    );

    const report = await createStylePresetTemplateReport(rootDir);

    expect(report.violations).toContain(
      'components/recipes/styles/manifests/templates/style-preset.template.yaml is missing',
    );
    expect(report.violations).toContain(
      'components/recipes/styles/manifests/templates/texture-preset.template.yaml is missing',
    );
    expect(report.violations).toContain(
      'components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml missing supported task sprite_sheet',
    );
    expect(report.violations).toContain(
      'components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml taxonomy missing supported task sprite_sheet',
    );
  });
});
