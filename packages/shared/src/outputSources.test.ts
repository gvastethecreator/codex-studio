import { describe, expect, it } from 'vite-plus/test';

import {
  createDefaultExternalOutputSourceRegistry,
  normalizeExternalOutputSourceRegistry,
  sanitizeRegisterExternalOutputSourceInput,
} from './outputSources';

describe('outputSources', () => {
  it('creates an empty external output source registry', () => {
    expect(createDefaultExternalOutputSourceRegistry()).toEqual({
      schemaVersion: 'external-output-sources/v1',
      sources: [],
    });
  });

  it('normalizes persisted registered output sources and drops corrupt entries', () => {
    expect(
      normalizeExternalOutputSourceRegistry({
        schemaVersion: 'external-output-sources/v1',
        sources: [
          {
            id: 'source-1',
            label: 'Comfy output',
            path: 'D:/Comfy/output',
            providerId: 'comfy',
            status: 'registered',
            createdAt: '2026-05-25T00:00:00.000Z',
            updatedAt: '2026-05-25T00:00:00.000Z',
            token: 'must-drop',
          },
          { id: 'broken' },
        ],
      }),
    ).toEqual({
      schemaVersion: 'external-output-sources/v1',
      sources: [
        {
          id: 'source-1',
          label: 'Comfy output',
          path: 'D:/Comfy/output',
          providerId: 'comfy',
          status: 'registered',
          createdAt: '2026-05-25T00:00:00.000Z',
          updatedAt: '2026-05-25T00:00:00.000Z',
        },
      ],
    });
  });

  it('sanitizes register requests without accepting secret-like fields', () => {
    expect(
      sanitizeRegisterExternalOutputSourceInput({
        label: '  Nano Banana exports ',
        path: ' D:/exports ',
        providerId: 'google',
        apiKey: 'must-drop',
      }),
    ).toEqual({
      label: 'Nano Banana exports',
      path: 'D:/exports',
      providerId: 'google',
    });
  });
});
