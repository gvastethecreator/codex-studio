import { Hono } from "hono";
import type { Asset, JobEventRecord } from "../../../packages/shared/src";

interface AssetLogRoutesDependencies {
  listAssets: () => Asset[];
  listLogs: () => JobEventRecord[];
}

export function createAssetLogRoutes({ listAssets, listLogs }: AssetLogRoutesDependencies) {
  const routes = new Hono();

  routes.get("/assets", (c) => c.json(listAssets()));
  routes.get("/logs", (c) => c.json(listLogs()));

  return routes;
}