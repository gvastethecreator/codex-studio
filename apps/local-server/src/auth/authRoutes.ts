import { Hono } from 'hono';
import {
  isSubscriptionProviderId,
  type SubscriptionProviderId,
} from '../../../../packages/shared/src';
import {
  createSubscriptionAuthController,
  SubscriptionAuthRouteError,
  type SubscriptionAuthController,
} from './controller';

function providerFromParam(value: string): SubscriptionProviderId | null {
  return isSubscriptionProviderId(value) ? value : null;
}

export function createSubscriptionAuthRoutes(
  controller: SubscriptionAuthController = createSubscriptionAuthController(),
) {
  const routes = new Hono();

  const handleError = (error: unknown) => {
    if (error instanceof SubscriptionAuthRouteError) {
      return {
        body: { error: error.message, code: error.code },
        status: error.status as 409 | 503,
      };
    }
    const message = error instanceof Error ? error.message : 'Sign in failed.';
    return { body: { error: message, code: 'auth_failed' }, status: 503 as const };
  };

  routes.get('/:provider', (c) => {
    const providerId = providerFromParam(c.req.param('provider'));
    if (!providerId) return c.json({ error: 'Unknown provider.', code: 'unknown_provider' }, 404);
    return c.json(controller.readPublic(providerId));
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
    return c.json(controller.cancel(providerId));
  });

  routes.post('/:provider/logout', (c) => {
    const providerId = providerFromParam(c.req.param('provider'));
    if (!providerId) return c.json({ error: 'Unknown provider.', code: 'unknown_provider' }, 404);
    return c.json(controller.logout(providerId));
  });

  return routes;
}
