import { Hono } from 'hono';
import { Either, Schema } from 'effect';
import type { publishEvent } from './events';
import type { Project } from '../../../packages/shared/src';

interface ProjectRoutesDependencies {
  listProjects: () => Project[];
  createProject: (name: string, description: string | null) => Project;
  publishEvent: typeof publishEvent;
  logProjectCreated: (projectName: string) => void;
}

const CreateProjectBoundarySchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.Union(Schema.String, Schema.Null)),
});

export function createProjectRoutes({
  listProjects,
  createProject,
  publishEvent,
  logProjectCreated,
}: ProjectRoutesDependencies) {
  const routes = new Hono();

  routes.get('/', (c) => c.json(listProjects()));

  routes.post('/', async (c) => {
    const rawBody = await c.req
      .json()
      .catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
    if ('__invalidJson' in rawBody) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_json',
          reason: 'Request body must be valid JSON.',
        },
        400,
      );
    }

    const decodedBody = Schema.decodeUnknownEither(CreateProjectBoundarySchema)(rawBody);
    if (Either.isLeft(decodedBody)) {
      return c.json(
        {
          error: 'Invalid request body',
          code: 'invalid_request_body',
          reason: 'Project payload is invalid.',
        },
        400,
      );
    }

    const body = decodedBody.right;
    const project = createProject(body.name || 'Untitled Project', body.description || null);
    publishEvent('project.created', project);
    logProjectCreated(project.name);
    return c.json(project, 201);
  });

  return routes;
}
