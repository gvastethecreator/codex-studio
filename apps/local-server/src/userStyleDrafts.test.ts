import { describe, expect, it } from 'vitest';
import { createLocalUserStyleDraft } from './userStyleDrafts';

describe('createLocalUserStyleDraft', () => {
  it('uses the description as the source of truth for new drafts', async () => {
    const response = await createLocalUserStyleDraft({
      action: 'draft_from_description',
      description: 'moody editorial paper cut with cyan rim light',
      draft: {
        name: 'Custom Style',
      },
    });

    expect(response.source).toBe('local_fallback');
    expect(response.draft.name).toBe('Moody Editorial Paper Cut With');
    expect(response.draft.visualDna.aesthetic).toContain('moody editorial paper cut');
    expect(response.draft.visualDna.creative_brief).toContain('moody editorial paper cut');
  });
});
