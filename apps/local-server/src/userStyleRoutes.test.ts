import { describe, expect, it, vi } from 'vite-plus/test';

import { createUserStyleRoutes } from './userStyleRoutes';
import { createMemoryUserStyleStore } from './userStyles';
import type { CreateUserStylePresetInput } from '../../../packages/shared/src';

const VISUAL_DNA: CreateUserStylePresetInput['visualDna'] = {
  aesthetic: 'Graphite storybook ink with gentle watercolor bloom',
  subject_treatment: 'Rounded silhouettes, clear expression, and storybook readability',
  color_and_tone: 'Graphite gray, warm cream, moss green, and muted rose',
  lighting_and_shadow: 'Soft ambient light with pencil-smudged shade',
  texture_and_material: 'Paper tooth, graphite grain, and light pigment wash',
  camera_and_composition: 'Centered editorial crop with generous quiet margins',
  atmosphere_and_mood: 'Tender handmade calm with low dramatic pressure',
  rendering_and_quality: 'Clean illustration finish, crisp focal linework, no watermark',
};

function createRoutes() {
  const store = createMemoryUserStyleStore();
  const publishEvent = vi.fn();
  const routes = createUserStyleRoutes({
    store,
    publishEvent,
    draftUserStyle: async () => ({
      source: 'local_fallback',
      warnings: ['ok'],
      draft: {
        name: 'Draft Style',
        category: 'Assisted',
        tags: ['draft'],
        supportedTasks: ['image_generate'],
        visualDna: VISUAL_DNA,
        avoidRules: ['watermark'],
        warnings: ['ok'],
      },
    }),
  });
  return { routes, publishEvent };
}

describe('user style routes', () => {
  it('creates, lists, updates, archives, and duplicates user styles', async () => {
    const { routes, publishEvent } = createRoutes();

    const createdResponse = await routes.request('/user', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Graphite Wash',
        visualDna: VISUAL_DNA,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(createdResponse.status).toBe(201);
    const created = await createdResponse.json();

    const listResponse = await routes.request('/user');
    await expect(listResponse.json()).resolves.toMatchObject({
      styles: [expect.objectContaining({ id: created.id, name: 'Graphite Wash' })],
    });

    const updatedResponse = await routes.request(`/user/${created.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ category: 'Saved Blends' }),
      headers: { 'Content-Type': 'application/json' },
    });
    await expect(updatedResponse.json()).resolves.toMatchObject({
      id: created.id,
      category: 'Saved Blends',
    });

    const duplicateResponse = await routes.request(`/user/${created.id}/duplicate`, {
      method: 'POST',
    });
    expect(duplicateResponse.status).toBe(201);

    const archivedResponse = await routes.request(`/user/${created.id}`, { method: 'DELETE' });
    await expect(archivedResponse.json()).resolves.toMatchObject({
      id: created.id,
      isArchived: true,
    });

    expect(publishEvent).toHaveBeenCalledWith(
      'style.user.created',
      expect.objectContaining({ id: created.id }),
    );
  });

  it('drafts a validated style through the assist route', async () => {
    const { routes } = createRoutes();

    const response = await routes.request('/draft', {
      method: 'POST',
      body: JSON.stringify({ action: 'draft_from_description', description: 'soft ink poster' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      source: 'local_fallback',
      draft: {
        name: 'Draft Style',
        visualDna: expect.objectContaining({
          aesthetic: VISUAL_DNA.aesthetic,
        }),
      },
    });
  });
});
