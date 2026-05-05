const categoryImageFiles = import.meta.glob("./styles/category-bases/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

export const STYLE_CATEGORY_IMAGES: Record<string, string> = {};

for (const [path, url] of Object.entries(categoryImageFiles)) {
  const fileName = path.split("/").pop();
  const key = fileName?.replace(/\.png$/i, "");
  if (key && typeof url === "string") {
    STYLE_CATEGORY_IMAGES[key] = url;
  }
}

export function styleCategoryImageKey(packId: string, category: string) {
  return `${packId}__${category
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}
