import { describe, expect, it } from "vite-plus/test";
import {
  isGenerationCancellationError,
  throwIfGenerationAborted,
  toGenerationDataUrl,
} from "./localGenerationRuntimeAdapters";

describe("localGenerationRuntimeAdapters", () => {
  it("throws AbortError when signal is already aborted", () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => throwIfGenerationAborted(controller.signal)).toThrow(
      "Operation cancelled by user",
    );
  });

  it("detects cancellation-like errors", () => {
    expect(isGenerationCancellationError(new Error("cancelled by user"))).toBe(true);
    expect(isGenerationCancellationError(new Error("regular failure"))).toBe(false);
  });

  it("returns data urls unchanged", async () => {
    const dataUrl = "data:image/png;base64,AAAA";
    await expect(toGenerationDataUrl(dataUrl)).resolves.toBe(dataUrl);
  });
});
