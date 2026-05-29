import { Hono } from "hono";
import type {
  CodexAccountStatusResponse,
  CodexModelCatalogResponse,
  LocalCodexSessionResponse,
} from "../../../packages/shared/src";

interface CodexRoutesDependencies {
  readCodexModelCatalog: () => Promise<CodexModelCatalogResponse>;
  readLocalCodexSession: () => Promise<LocalCodexSessionResponse>;
  readCodexAccountStatus: () => Promise<CodexAccountStatusResponse>;
}

export function createCodexRoutes({
  readCodexModelCatalog,
  readLocalCodexSession,
  readCodexAccountStatus,
}: CodexRoutesDependencies) {
  const routes = new Hono();

  routes.get("/models", async (c) => c.json(await readCodexModelCatalog()));

  routes.get("/session", async (c) => c.json(await readLocalCodexSession()));

  routes.get("/account", async (c) => c.json(await readCodexAccountStatus()));

  return routes;
}