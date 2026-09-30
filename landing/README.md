# Cozy Studio landing page

This folder builds the public page at <https://cozy.gvaste.dev/>. It does not ship with the app.

- `site.yaml` holds the words, links, and pictures.
- `template.yaml` holds colours, type, and layout.
- `assets/` holds the images, the mascot drawing, and the provider logos.
- `kit/`, `src/`, `templates/`, and `scripts/` are the page engine, copied from gh-pages-template.

## Build

You need Bun and Node 22.18 or newer.

```bash
cd landing
bun install
bun run build:local   # dist-local/, for http://localhost:<port>/
bun run build         # dist/, for GitHub Pages at cozy.gvaste.dev
```

`.github/workflows/pages.yml` runs `bun run build` and deploys `dist/` when a push to `main` changes this folder.

The build prints two notices that are not errors:

- `Could not resolve "vgpu"`: the shader for hero icons is not rebuilt. The build keeps the copy in `kit/vendor/`. This page does not use it.
- `Pretext is not installed`: the build keeps the copy in `kit/vendor/pretext/`.

## Update the engine

Change the engine in a gh-pages-template clone, where its tests live. Then copy it here:

```bash
node scripts/sync-engine.mjs ../../gh-pages-template
```

The copy leaves out the template's Studio editor, playground, and examples. `astro.config.mjs` is local to this folder and has no React integration.
