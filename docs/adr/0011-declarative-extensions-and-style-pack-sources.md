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

### Workflow modules

Every workflow except `default` and `styles` becomes an optional built-in module. Examples are Character Lab, Sprite Atlas, Animation Sequence and Camera Angles.

- A module is Studio code. It ships and is versioned with the app. It is not a Cozy Extension and is never downloaded.
- The Extensions panel lists modules next to installed extensions, and the user can turn each module on or off.
- A disabled module loads no frontend chunk, mounts no backend routes, accepts no jobs of its kinds and does not appear in navigation. Existing jobs and assets stay in the Studio Library.
- A module's content, such as recipe parameters, prompt templates, presets and catalogs, can come from a declarative extension of a later kind named `workflow-content`. That content feeds the built-in module and never adds code.
- Workflows written by third parties would need extensions that run code. That needs its own ADR with signing, sandboxing and a stable API.

## Consequences

- Style authoring (manifests, specs, briefs, curation reviews and tools) moves to `cozy-styles`. Card images are published only as release assets, never as git blobs. Releases are cut when a pack is ready, not after every card wave.
- Tests that count presets or packs change to count installed or built-in extensions.
- The installer from this ADR is the proof that ADR 0008 waits for. After it works, the app repository can remove style images from its history. That rewrite still needs explicit approval.
