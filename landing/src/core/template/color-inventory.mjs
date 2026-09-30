const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/** Classify authored color literals. This does not rewrite the files it reads. */
export function inventoryColorLiterals(text, path = "") {
  const literals = [...new Set(String(text).match(HEX) ?? [])].sort();
  return {
    path,
    count: literals.length,
    literals,
    usesPageAccent: String(text).includes("var(--accent)"),
  };
}
