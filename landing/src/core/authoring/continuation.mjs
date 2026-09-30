import { canonicalJson } from "./contract.mjs";
import { nextQuestions } from "./interview.mjs";
import { publicTransport } from "./transport-public.mjs";

/** Resume after a manual edit. A stale plan does not rewrite the YAML. */
export function resumeAfterManualEdit(page, { planFingerprint, known = {}, construction = "ai-assisted", brief, projectId, sourceFingerprint, pendingPaths = [] }) {
  const documentFingerprint = canonicalJson(page.siteText);
  const stale = planFingerprint !== documentFingerprint;
  return {
    stale,
    applied: false,
    yamlText: page.siteText,
    siteName: page.site?.project?.name ?? "",
    questions: nextQuestions({ known, construction }),
    transport: publicTransport({ projectId, sourceFingerprint, brief, pendingPaths }),
  };
}
