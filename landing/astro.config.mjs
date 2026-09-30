import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  outDir: process.env.GVASTE_ASTRO_OUT ?? "./dist",
  base: process.env.GVASTE_ASTRO_BASE ?? "/",
  build: {
    format: "directory",
  },
});
