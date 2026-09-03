import { Hono } from 'hono';
import {
  isSubscriptionProviderId,
  type SubscriptionProviderId,
} from '../../../../packages/shared/src';
import {
  getSubscriptionAuthController,
  SubscriptionAuthRouteError,
  type SubscriptionAuthController,
} from './controller';
import { safeOAuthText } from './oauthHttp';

function providerFromParam(value: string): SubscriptionProviderId | null {
  return isSubscriptionProviderId(value) ? value : null;
}

export function createSubscriptionAuthRoutes(
  controller: SubscriptionAuthController = getSubscriptionAuthController(),
) {
  const routes = new Hono();

  routes.use('*', async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-store');
    c.header('Pragma', 'no-cache');
  });

  const handleError = (error: unknown) => {
    if (error instanceof SubscriptionAuthRouteError) {
      return {
        body: { error: error.message, code: error.code },
        status: error.status as 409 | 503,
      };
    }
    const candidate = safeOAuthText(error instanceof Error ? error.message : '');
    const message = /^(ChatGPT|xAI|Google|Studio Sign in credential store)\b/.test(candidate)
      ? candidate
      : 'Authentication request failed.';
    return { body: { error: message, code: 'auth_failed' }, status: 503 as const };
  };

  routes.get('/:provider', (c) => {
    const providerId = providerFromParam(c.req.param('provider'));
    if (!providerId) return c.json({ error: 'Unknown provider.', code: 'unknown_provider' }, 404);
    try {
      return c.json(controller.readPublic(providerId));
    } catch (error) {
      const mapped = handleError(error);
      return c.json(mapped.body, mapped.status);
    }
  });

  routes.post('/:provider/start', async (c) => {
    const providerId = providerFromParam(c.req.param('provider'));
    if (!providerId) return c.json({ error: 'Unknown provider.', code: 'unknown_provider' }, 404);
    try {
      return c.json(await controller.start(providerId));
    } catch (error) {
      const mapped = handleError(error);
      return c.json(mapped.body, mapped.status);
    }
  });

  routes.post('/:provider/cancel', (c) => {
    const providerId = providerFromParam(c.req.param('provider'));
    if (!providerId) return c.json({ error: 'Unknown provider.', code: 'unknown_provider' }, 404);
    try {
      return c.json(controller.cancel(providerId));
    } catch (error) {
      const mapped = handleError(error);
      return c.json(mapped.body, mapped.status);
    }
  });

  routes.post('/:provider/logout', async (c) => {
    const providerId = providerFromParam(c.req.param('provider'));
    if (!providerId) return c.json({ error: 'Unknown provider.', code: 'unknown_provider' }, 404);
    try {
      return c.json(await controller.logout(providerId));
    } catch (error) {
      const mapped = handleError(error);
      return c.json(mapped.body, mapped.status);
    }
  });

  return routes;
}
