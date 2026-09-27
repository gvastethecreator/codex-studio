# ADR 0011: Declarative extensions and style pack sources

## Status

Accepted

## Context

The style library has 27 packs and more than 4,000 presets. Its card images are about 14 GB, and git history is about 13.5 GB. Styles are data, but today they ship inside the app: manifests compile into `styleRuntimePacks.generated` and `stylePresetCatalogData.pack_XX.ts`, and full-size cards live under `assets/recipes/styles`. ADR 0008 keeps optional assets separate from the Core Asset Set. It also blocks a git history rewrite until a pack installer is proven.

## Decision

Studio gets a declarative extension system named Cozy Extensions.

- A **Cozy Extension** is a versioned content package. It contains data files and images only. It never contains code that Studio runs. This keeps the Provider Capability Catalog rule: providers are not runtime plugins.
- The first and only extension kind is `style-pack`. Other declarative kinds, such as recipes, can come later under the same rules.
- Each extension has an `extension.json` file:

  ```json
  {
    "schemaVersion": 1,
    "id": "cozy.mythic-noir",
    "kind": "style-pack",
    "version": "1.4.0",
    "studio": ">=0.9 <2",
    "title": "Mythic Noir Curated Vault",
    "files": { "manifest": "pack.json", "search": "search.json" },
    "assets": [{ "name": "cards-full", "optional": true, "sha256": "…", "bytes": 0 }]
  }
  ```

- Extension ids use a `publisher.name` namespace. A preset's global id is `<extensionId>/<presetId>`, so two extensions can never collide.
- Studio reads extensions from **Extension Sources**. A source is either a local folder or a GitHub repository that publishes extensions as release assets. Studio supports many sources at once. The planned sources are:
  - the public `cozy-styles` repository,
  - a private repository for work in progress,
  - local folders for authoring, read in place without install.
- A private source needs a GitHub token. The token follows the Provider Secret rules. It never goes into Studio Settings, SQLite, logs or catalog metadata.
- Installing an extension verifies every sha256, then writes the whole extension in one atomic step to the extension store of the Studio install. A failed or partial download leaves the previous version in place.
- The backend lists installed extensions and serves their data. The frontend loads styles at runtime through `services/studio-api/`, not from generated modules in the bundle.
- The current packs become built-in extensions and load through the same path. Studio still ships a small core set with thumbnails, so a first run works offline.
- The card generator stays in Studio because it needs the Generation Providers. It takes a `--styles-root` that points at an extension source folder.
- Third-party extensions are out of scope for now. Before they are allowed, extensions need signing and a trust decision in the UI.

## Consequences

- Style authoring (manifests, specs, briefs, curation reviews and tools) moves to `cozy-styles`. Card images are published only as release assets, never as git blobs. Releases are cut when a pack is ready, not after every card wave.
- Tests that count presets or packs change to count installed or built-in extensions.
- The installer from this ADR is the proof that ADR 0008 waits for. After it works, the app repository can remove style images from its history. That rewrite still needs explicit approval.
