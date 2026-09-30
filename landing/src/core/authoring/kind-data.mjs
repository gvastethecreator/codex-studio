/** Compositions copied from kit/kinds. tests/authoring/core.test.mjs checks this list against those files. */
export const KIND_COMPOSITIONS = [
  { id: "agent-skill", defaultComposition: "contract", compositions: { contract: { v1SectionIds: ["hero", "skill", "docs", "links", "closing"] } } },
  { id: "cli", defaultComposition: "terminal-first", compositions: { "terminal-first": { v1SectionIds: ["hero", "commands", "docs", "links", "closing"] }, compact: { v1SectionIds: [] } } },
  { id: "configuration-tool", defaultComposition: "config-result", compositions: { "config-result": { v1SectionIds: [] } } },
  { id: "desktop-local-app", defaultComposition: "product", compositions: { product: { v1SectionIds: ["hero", "demo", "screens", "docs", "links", "closing"] } } },
  { id: "developer-utility", defaultComposition: "strongest-proof", compositions: { "strongest-proof": { v1SectionIds: [] } } },
  { id: "github-user", defaultComposition: "identity", compositions: { identity: { v1SectionIds: ["profile", "links", "closing"] } } },
  { id: "library-sdk", defaultComposition: "snippet", compositions: { snippet: { v1SectionIds: ["hero", "docs", "links", "closing"] } } },
  { id: "monitoring-dashboard", defaultComposition: "coverage", compositions: { coverage: { v1SectionIds: [] } } },
  { id: "playground-showcase", defaultComposition: "live", compositions: { live: { v1SectionIds: ["hero", "demo", "docs", "links", "closing"] } } },
  { id: "plugin-extension", defaultComposition: "host-effect", compositions: { "host-effect": { v1SectionIds: [] } } },
  { id: "small-browser-utility", defaultComposition: "compact", compositions: { compact: { v1SectionIds: [] } } },
  { id: "ui-component", defaultComposition: "live-code", compositions: { "live-code": { v1SectionIds: [] } } },
  { id: "visual-processor", defaultComposition: "result-first", compositions: { "result-first": { v1SectionIds: [] } } },
  { id: "web-app", defaultComposition: "try", compositions: { try: { v1SectionIds: [] } } },
];
