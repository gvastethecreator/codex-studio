export interface AssetReference {
  path: string;
  value: string;
  alt?: string;
}

/** Declared media, not a network probe or a claim that the evidence is current. */
export function assetReferences(value: unknown, path = "/site"): AssetReference[] {
  if (!value || typeof value !== "object") return [];
  const refs: AssetReference[] = [];
  for (const [key, item] of Object.entries(value)) {
    const pointer = `${path}/${key}`;
    if (["src", "poster", "ogImage"].includes(key) && typeof item === "string" && item.trim()) {
      const alt = (value as { alt?: unknown }).alt;
      refs.push({ path: pointer, value: item, alt: typeof alt === "string" ? alt : undefined });
    } else if (item && typeof item === "object") refs.push(...assetReferences(item, pointer));
  }
  return refs;
}

export function isLocalAsset(value: string): boolean {
  return !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value);
}

export interface EvidenceIssue { path: string; message: string; kind: "missing" | "review" }

export function reviewEvidence(site: Record<string, any>, knownAssets: { path: string; exists: boolean }[] = []): EvidenceIssue[] {
  const issues: EvidenceIssue[] = [];
  const sections = Array.isArray(site.sections) ? site.sections : [];
  const visible = Object.fromEntries(Object.entries(site).filter(([key]) => sections.includes(key) || ["project", "brand", "header"].includes(key)));
  for (const ref of assetReferences(visible)) {
    if (ref.path.endsWith("/src") && /\.(?:png|jpe?g|webp|svg|gif|avif)(?:[?#]|$)/i.test(ref.value) && !ref.alt?.trim()) {
      issues.push({ path: ref.path.replace(/\/src$/, "/alt"), message: "Describe what this image shows in its alt text.", kind: "missing" });
    }
    if (ref.value.startsWith("blob:")) issues.push({ path: ref.path, message: "This temporary image cannot travel with the exported page. Use a project asset path.", kind: "missing" });
    else if (isLocalAsset(ref.value)) {
      const known = knownAssets.find((item) => item.path === ref.value);
      if (!known?.exists) issues.push({ path: ref.path, message: known ? `Missing source asset: ${ref.value}` : `Check this file in your project: ${ref.value}`, kind: known ? "missing" : "review" });
    }
  }
  if (sections.includes("hero") && !(site.hero?.actions ?? []).some((item: any) => item.href || item.command)) issues.push({ path: "/site/hero/actions", message: "Give the visitor one real next action.", kind: "missing" });
  if (sections.includes("screens") && !site.screens?.images?.length) issues.push({ path: "/site/screens/images", message: "Add a real screenshot or hide the empty Screens block.", kind: "missing" });
  const visit = (value: unknown, path: string) => {
    if (typeof value === "string" && /example\.com|github\.com\/example(?:\/|$)|describe the project|one line\.|what this path solves|new project\./i.test(value)) issues.push({ path, message: "Replace starter copy or this example destination with project evidence.", kind: "review" });
    else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) if (!["code", "html"].includes(key)) visit(child, `${path}/${key}`);
  };
  visit(visible, "/site");
  return issues;
}
