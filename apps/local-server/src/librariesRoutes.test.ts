import { describe, expect, it, vi } from 'vite-plus/test';
import type { StudioLibrary } from './libraries';
import { createLibrariesRoutes } from './librariesRoutes';

function makeLibrary(overrides: Partial<StudioLibrary> = {}): StudioLibrary {
  return {
    id: overrides.id ?? 'library-1',
    name: overrides.name ?? 'Library 1',
    path: overrides.path ?? 'D:/Library-1',
    isDefault: overrides.isDefault ?? true,
    createdAt: overrides.createdAt ?? '2026-05-29T00:00:00.000Z',
  };
}

describe('librariesRoutes', () => {
  it('lists and registers libraries through the route seam', async () => {
    const listed = [makeLibrary()];
    const created = makeLibrary({ id: 'library-2', isDefault: false, name: 'New Library' });
    const listLibraries = vi.fn(() => listed);
    const registerLibrary = vi.fn(() => created);
    const setDefaultLibrary = vi.fn(() => null);
    const removeLibrary = vi.fn(() => false);
    const publishEvent = vi.fn();

    const routes = createLibrariesRoutes({
      listLibraries,
      registerLibrary,
      setDefaultLibrary,
      removeLibrary,
      publishEvent,
    });

    const listResponse = await routes.request('/');
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toEqual(listed);

    const createResponse = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Library', path: 'D:/new-library', isDefault: false }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toEqual(created);
    expect(registerLibrary).toHaveBeenCalledWith({
      name: 'New Library',
      path: 'D:/new-library',
      isDefault: false,
    });
    expect(publishEvent).toHaveBeenCalledWith('library.created', created);
  });

  it('handles set-default and delete responses', async () => {
    const listLibraries = vi.fn(() => []);
    const registerLibrary = vi.fn(() => makeLibrary());
    const setDefaultLibrary = vi
      .fn<(...args: [string]) => StudioLibrary | null>()
      .mockReturnValueOnce(makeLibrary({ id: 'library-2', isDefault: true }))
      .mockReturnValueOnce(null);
    const removeLibrary = vi
      .fn<(...args: [string]) => boolean>()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const publishEvent = vi.fn();

    const routes = createLibrariesRoutes({
      listLibraries,
      registerLibrary,
      setDefaultLibrary,
      removeLibrary,
      publishEvent,
    });

    const setDefaultOk = await routes.request('/library-2/default', { method: 'PUT' });
    expect(setDefaultOk.status).toBe(200);
    await expect(setDefaultOk.json()).resolves.toEqual(
      expect.objectContaining({ id: 'library-2' }),
    );

    const setDefaultMissing = await routes.request('/missing/default', { method: 'PUT' });
    expect(setDefaultMissing.status).toBe(404);

    const deleteOk = await routes.request('/library-2', { method: 'DELETE' });
    expect(deleteOk.status).toBe(200);
    await expect(deleteOk.json()).resolves.toEqual({ ok: true });

    const deleteMissing = await routes.request('/missing', { method: 'DELETE' });
    expect(deleteMissing.status).toBe(400);

    expect(publishEvent).toHaveBeenCalledWith(
      'library.default',
      expect.objectContaining({ id: 'library-2' }),
    );
  });

  it('rejects malformed JSON and invalid create-library payload', async () => {
    const listLibraries = vi.fn(() => []);
    const registerLibrary = vi.fn(() => makeLibrary({ id: 'library-2' }));
    const setDefaultLibrary = vi.fn(() => null);
    const removeLibrary = vi.fn(() => false);
    const publishEvent = vi.fn();

    const routes = createLibrariesRoutes({
      listLibraries,
      registerLibrary,
      setDefaultLibrary,
      removeLibrary,
      publishEvent,
    });

    const malformed = await routes.request('/', {
      method: 'POST',
      body: '{"name":"New Library"',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(malformed.status).toBe(400);
    await expect(malformed.json()).resolves.toMatchObject({ code: 'invalid_json' });

    const invalid = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ name: 'x', path: 123 }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ code: 'invalid_request_body' });
    expect(registerLibrary).not.toHaveBeenCalled();
  });
});
