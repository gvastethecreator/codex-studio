const defaultImageFiles = import.meta.glob("./styles/defaults/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

export const STYLE_DEFAULT_IMAGES: Record<string, string> = {};

for (const [path, url] of Object.entries(defaultImageFiles)) {
  const fileName = path.split("/").pop();
  const presetId = fileName?.replace(/\.png$/i, "");
  if (presetId && typeof url === "string") {
    STYLE_DEFAULT_IMAGES[presetId] = url;
  }
}
