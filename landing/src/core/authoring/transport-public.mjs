import { exportTransport } from "./contract.mjs";

/** Public transport keeps a scrubbed brief. Staging, local binding, and private evidence stay out. */
export function publicTransport({ projectId, sourceFingerprint, brief, pendingPaths = [] }) {
  const next = structuredClone(brief);
  next.notes = "";
  next.evidence = (next.evidence ?? []).filter((item) => item.visibility === "public" && item.type !== "public-github" && item.type !== "public-profile");
  const transport = exportTransport({ projectId, sourceFingerprint, brief: next, pendingPaths });
  delete transport.staging;
  delete transport.localBinding;
  return transport;
}
