import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../constants';
import type { Attachment } from '../types';
import { prepareStudioGenerationRequest } from './studioGenerationRequest';

function attachment(id: string): Attachment {
  return {
    id,
    name: `${id}.png`,
    dataUrl: `data:image/png;base64,${id}`,
    strength: 0.5,
  };
}

describe('prepareStudioGenerationRequest', () => {
  it('keeps source plus three references for Character Lab requests', () => {
    const request = prepareStudioGenerationRequest({
      generationConfig: {
        ...DEFAULT_GENERATION_CONFIG,
        prompt: 'generate a character lab action',
        recipeId: 'character-lab',
        attachments: ['source', 'ref-1', 'ref-2', 'ref-3', 'extra'].map(attachment),
      },
    });

    expect(request.ok).toBe(true);
    if (!request.ok) return;
    expect(request.finalConfig.attachments.map((item) => item.id)).toEqual([
      'source',
      'ref-1',
      'ref-2',
      'ref-3',
    ]);
  });
});
