import { describe, expect, it, vi } from 'vite-plus/test';
import type { Project } from '../../../packages/shared/src';
import { createProjectRoutes } from './projectRoutes';

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: overrides.id ?? 'project-1',
    name: overrides.name ?? 'Default Project',
    description: overrides.description ?? null,
    createdAt: overrides.createdAt ?? '2026-05-29T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-05-29T00:00:00.000Z',
  };
}

describe('projectRoutes', () => {
  it('lists projects and creates new projects through the seam', async () => {
    const listed = [makeProject()];
    const created = makeProject({ id: 'project-2', name: 'New Project', description: 'desc' });

    const listProjects = vi.fn(() => listed);
    const createProject = vi.fn(() => created);
    const publishEvent = vi.fn();
    const logProjectCreated = vi.fn();

    const routes = createProjectRoutes({
      listProjects,
      createProject,
      publishEvent,
      logProjectCreated,
    });

    const listResponse = await routes.request('/');
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toEqual(listed);

    const createResponse = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Project', description: 'desc' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toEqual(created);
    expect(createProject).toHaveBeenCalledWith('New Project', 'desc');
    expect(publishEvent).toHaveBeenCalledWith('project.created', created);
    expect(logProjectCreated).toHaveBeenCalledWith('New Project');
  });

  it('returns 400 for malformed JSON and invalid payload', async () => {
    const listProjects = vi.fn(() => []);
    const createProject = vi.fn(() => makeProject({ id: 'project-2' }));
    const publishEvent = vi.fn();
    const logProjectCreated = vi.fn();

    const routes = createProjectRoutes({
      listProjects,
      createProject,
      publishEvent,
      logProjectCreated,
    });

    const malformed = await routes.request('/', {
      method: 'POST',
      body: '{"name":"x"',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(malformed.status).toBe(400);
    await expect(malformed.json()).resolves.toMatchObject({ code: 'invalid_json' });

    const invalid = await routes.request('/', {
      method: 'POST',
      body: JSON.stringify({ name: 123 }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ code: 'invalid_request_body' });
    expect(createProject).not.toHaveBeenCalled();
  });
});
