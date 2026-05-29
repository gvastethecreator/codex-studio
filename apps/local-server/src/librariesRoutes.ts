import { Hono } from "hono";
import type { registerLibrary, listLibraries, removeLibrary, setDefaultLibrary } from "./libraries";
import type { publishEvent } from "./events";

interface LibrariesRoutesDependencies {
  listLibraries: typeof listLibraries;
  registerLibrary: typeof registerLibrary;
  setDefaultLibrary: typeof setDefaultLibrary;
  removeLibrary: typeof removeLibrary;
  publishEvent: typeof publishEvent;
}

export function createLibrariesRoutes({
  listLibraries,
  registerLibrary,
  setDefaultLibrary,
  removeLibrary,
  publishEvent,
}: LibrariesRoutesDependencies) {
  const routes = new Hono();

  routes.get("/", (c) => c.json(listLibraries()));

  routes.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const library = registerLibrary({
      name: body.name || "Untitled Library",
      path: body.path,
      isDefault: Boolean(body.isDefault),
    });
    publishEvent("library.created", library);
    return c.json(library, 201);
  });

  routes.put("/:id/default", (c) => {
    const library = setDefaultLibrary(c.req.param("id"));
    if (!library) return c.json({ error: "Library not found" }, 404);
    publishEvent("library.default", library);
    return c.json(library);
  });

  routes.delete("/:id", (c) => {
    if (!removeLibrary(c.req.param("id"))) {
      return c.json({ error: "Library not found or default library cannot be removed" }, 400);
    }
    return c.json({ ok: true });
  });

  return routes;
}