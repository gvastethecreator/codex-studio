import { Hono } from 'hono';
import {
  sanitizeCreateUserStylePresetInput,
  sanitizeUpdateUserStylePresetInput,
  type CodexStyleDraftRequest,
  type CodexStyleDraftResponse,
  type UserStylePreset,
} from '../../../packages/shared/src/userStyles';
import { createLocalUserStyleDraft } from './userStyleDrafts';
import type { UserStyleStore } from './userStyles';
import type { publishEvent } from './events';

interface UserStyleRoutesDependencies {
  store: UserStyleStore;
  publishEvent?: typeof publishEvent;
  draftUserStyle?: (request: CodexStyleDraftRequest) => Promise<CodexStyleDraftResponse>;
}

async function readJsonBody(request: { json: () => Promise<unknown> }) {
  return request.json().catch(() => ({ __invalidJson: true }) as { __invalidJson: true });
}

function isInvalidJsonMarker(value: unknown): value is { __invalidJson: true } {
  return typeof value === 'object' && value !== null && '__invalidJson' in value;
}

function invalidJson(c: { json: (payload: unknown, status: 400) => Response }) {
  return c.json(
    {
      error: 'Invalid request body',
      code: 'invalid_json',
      reason: 'Request body must be valid JSON.',
    },
    400,
  );
}

function invalidPayload(
  c: { json: (payload: unknown, status: 400) => Response },
  issues: string[],
) {
  return c.json(
    {
      error: 'Invalid request body',
      code: 'invalid_request_body',
      reason: issues.join(' '),
      issues,
    },
    400,
  );
}

function notFound(c: { json: (payload: unknown, status: 404) => Response }) {
  return c.json({ error: 'User style not found', code: 'not_found' }, 404);
}

function publishUserStyleEvent(
  publish: typeof publishEvent | undefined,
  type: string,
  style: UserStylePreset,
) {
  publish?.(type, {
    id: style.id,
    name: style.name,
    isArchived: style.isArchived,
    updatedAt: style.updatedAt,
  });
}

export function createUserStyleRoutes({
  store,
  publishEvent: publish,
  draftUserStyle = createLocalUserStyleDraft,
}: UserStyleRoutesDependencies) {
  const routes = new Hono();

  routes.get('/user', (c) => {
    const includeArchived = new URL(c.req.url).searchParams.get('include_archived') === 'true';
    return c.json({
      styles: store.listUserStyles({ includeArchived }),
    });
  });

  routes.post('/user', async (c) => {
    const body = await readJsonBody(c.req);
    if (isInvalidJsonMarker(body)) return invalidJson(c);

    const sanitized = sanitizeCreateUserStylePresetInput(body);
    if (!sanitized.ok || !sanitized.value) return invalidPayload(c, sanitized.issues);

    const style = store.createUserStyle(sanitized.value);
    publishUserStyleEvent(publish, 'style.user.created', style);
    return c.json(style, 201);
  });

  routes.post('/draft', async (c) => {
    const body = await readJsonBody(c.req);
    if (isInvalidJsonMarker(body)) return invalidJson(c);
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return invalidPayload(c, ['Draft request must be an object.']);
    }

    const request = body as CodexStyleDraftRequest;
    const action = request.action;
    if (
      action !== 'draft_from_description' &&
      action !== 'improve_draft' &&
      action !== 'make_transferable' &&
      action !== 'create_variants' &&
      action !== 'audit_style_quality'
    ) {
      return invalidPayload(c, ['Unsupported draft action.']);
    }

    try {
      return c.json(await draftUserStyle(request));
    } catch (error) {
      return c.json(
        {
          error: 'Could not draft user style',
          code: 'draft_failed',
          reason: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  });

  routes.get('/user/:id', (c) => {
    const style = store.getUserStyle(c.req.param('id'));
    if (!style) return notFound(c);
    return c.json(style);
  });

  routes.patch('/user/:id', async (c) => {
    const body = await readJsonBody(c.req);
    if (isInvalidJsonMarker(body)) return invalidJson(c);

    const sanitized = sanitizeUpdateUserStylePresetInput(body);
    if (!sanitized.ok || !sanitized.value) return invalidPayload(c, sanitized.issues);

    const style = store.updateUserStyle(c.req.param('id'), sanitized.value);
    if (!style) return notFound(c);
    publishUserStyleEvent(publish, 'style.user.updated', style);
    return c.json(style);
  });

  routes.delete('/user/:id', (c) => {
    const style = store.archiveUserStyle(c.req.param('id'));
    if (!style) return notFound(c);
    publishUserStyleEvent(publish, 'style.user.archived', style);
    return c.json(style);
  });

  routes.post('/user/:id/duplicate', (c) => {
    const style = store.duplicateUserStyle(c.req.param('id'));
    if (!style) return notFound(c);
    publishUserStyleEvent(publish, 'style.user.created', style);
    return c.json(style, 201);
  });

  return routes;
}
