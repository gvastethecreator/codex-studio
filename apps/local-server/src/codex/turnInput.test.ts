import { describe, expect, it } from 'vite-plus/test';

import { createGenerationTaskSpec } from '../../../../packages/shared/src';
import { CODEX_IMAGEGEN_DENOISE_INSTRUCTION } from '../providers/codexProvider';
import { compileCodexImagegenInput } from '../providers/codexProvider';
import { buildCodexImagegenTurnInput } from './turnInput';

describe('codex turn input', () => {
  it('sends persisted source spec assets as app-server localImage inputs', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-refs',
      task: 'image_generate',
      providerId: 'codex',
      prompt: 'Apply the selected style using the provided reference image.',
      assets: [
        {
          role: 'reference',
          name: 'download.jpg',
          localPath: 'D:/AI-Studio-Library/references/job-1/download.jpg',
          strength: 0.15,
        },
      ],
    });

    const imagegenSkillPath = '/home/test-user/.codex/skills/.system/imagegen/SKILL.md';
    const input = buildCodexImagegenTurnInput({
      imagegenSkillPath,
      fallbackPrompt: sourceSpec.prompt,
      compiledInput: compileCodexImagegenInput({
        id: 'job-refs',
        projectId: 'project-1',
        prompt: sourceSpec.prompt,
        execution: null,
        sourceSpec,
      }),
    });

    expect(input).toEqual([
      {
        type: 'skill',
        name: 'imagegen',
        path: imagegenSkillPath,
      },
      {
        type: 'localImage',
        path: 'D:/AI-Studio-Library/references/job-1/download.jpg',
      },
      expect.objectContaining({
        type: 'text',
        text: expect.stringContaining(
          'Apply the selected style using the provided reference image.',
        ),
      }),
    ]);
  });

  it('keeps the artifact denoise instruction in fallback turns', () => {
    const input = buildCodexImagegenTurnInput({
      imagegenSkillPath: '/home/test-user/.codex/skills/.system/imagegen/SKILL.md',
      fallbackPrompt: 'small brass key',
    });

    expect(input.at(-1)).toMatchObject({
      type: 'text',
      text: expect.stringContaining(CODEX_IMAGEGEN_DENOISE_INSTRUCTION),
    });
  });
});
