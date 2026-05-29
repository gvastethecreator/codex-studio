import { Hono } from "hono";
import type { EditableStudioSettings } from "../../../packages/shared/src";

interface SettingsRoutesDependencies {
  readSettings: () => EditableStudioSettings;
  updateSettings: (patch: unknown) => EditableStudioSettings;
}

export function createSettingsRoutes({
  readSettings,
  updateSettings,
}: SettingsRoutesDependencies) {
  const routes = new Hono();

  routes.get("/", (c) => c.json(readSettings()));

  routes.patch("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    return c.json(updateSettings(body));
  });

  return routes;
}