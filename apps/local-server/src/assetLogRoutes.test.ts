import { describe, expect, it } from "vite-plus/test";
import type { Asset, JobEventRecord } from "../../../packages/shared/src";
import { createAssetLogRoutes } from "./assetLogRoutes";

describe("assetLogRoutes", () => {
  it("returns assets and logs through the route seam", async () => {
    const assets: Asset[] = [
      {
        id: "asset-1",
        projectId: "project-1",
        jobId: "job-1",
        filePath: "D:/library/outputs/a.png",
        thumbnailPath: null,
        publicUrl: "/library/outputs/a.png",
        prompt: "a",
        width: null,
        height: null,
        mimeType: "image/png",
        createdAt: "2026-05-29T00:00:00.000Z",
        deletedAt: null,
      },
    ];

    const logs: JobEventRecord[] = [
      {
        id: 1,
        jobId: "job-1",
        type: "job.created",
        message: "created",
        metadata: null,
        createdAt: "2026-05-29T00:00:00.000Z",
      },
    ];

    const routes = createAssetLogRoutes({
      listAssets: () => assets,
      listLogs: () => logs,
    });

    const assetsResponse = await routes.request("/assets");
    expect(assetsResponse.status).toBe(200);
    await expect(assetsResponse.json()).resolves.toEqual(assets);

    const logsResponse = await routes.request("/logs");
    expect(logsResponse.status).toBe(200);
    await expect(logsResponse.json()).resolves.toEqual(logs);
  });
});