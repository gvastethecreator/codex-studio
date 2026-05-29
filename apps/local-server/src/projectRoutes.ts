import { Hono } from "hono";
import type { publishEvent } from "./events";
import type { Project } from "../../../packages/shared/src";

interface ProjectRoutesDependencies {
  listProjects: () => Project[];
  createProject: (name: string, description: string | null) => Project;
  publishEvent: typeof publishEvent;
  logProjectCreated: (projectName: string) => void;
}

export function createProjectRoutes({
  listProjects,
  createProject,
  publishEvent,
  logProjectCreated,
}: ProjectRoutesDependencies) {
  const routes = new Hono();

  routes.get("/", (c) => c.json(listProjects()));

  routes.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const project = createProject(body.name || "Untitled Project", body.description || null);
    publishEvent("project.created", project);
    logProjectCreated(project.name);
    return c.json(project, 201);
  });

  return routes;
}