# Codex Studio Context

Canonical language for the local-first image studio. This file defines the project vocabulary only; current system shape lives in `docs/ARCHITECTURE.md`, and hard-to-reverse trade-offs live in `docs/adr/`.

## Language

### Storage and catalog

**Studio Library**:
External local folder that stores assets, thumbnails, references, transcripts, logs, and SQLite state for the studio.
_Avoid_: output folder, data dir, library path

**Library Registry**:
SQLite-backed registry of Studio Library directories, with one default library for new generations.
_Avoid_: libraries list, path registry

**Studio Settings**:
Editable application preferences stored with the Studio Library, such as default provider, output behavior, library choices, and UI/runtime defaults.
_Avoid_: env config, bootstrap vars, hidden preferences

**Bootstrap Configuration**:
Minimal startup-only configuration needed before Studio Settings can be loaded, such as initial library path, ports, development flags, and secrets.
_Avoid_: app settings, user preferences, runtime defaults

**Provider Secret**:
Credential or token needed by a Generation Provider and stored outside SQLite-backed Studio Settings.
_Avoid_: provider setting, catalog metadata, visible config value

**Image Catalog**:
SQLite-backed index of generated images and their searchable metadata across one or more Studio Libraries.
_Avoid_: asset table, gallery cache

**Catalog Entry**:
One image record inside the Image Catalog.
_Avoid_: asset row, generated image record

**Catalog Page**:
Paginated metadata payload returned by `/api/catalog`.
_Avoid_: gallery response, asset dump

**Embedded Metadata**:
Generation metadata written into an image file so the asset stays self-describing outside the studio.
_Avoid_: sidecar metadata, prompt note

**Local Asset**:
Image file stored in a Studio Library and served to the UI through `/library/...`.
_Avoid_: blob, attachment

**External Output Source**:
Registered external directory produced by Codex, Comfy, or another generator that can be discovered and imported without being treated as unmanaged free-form storage.
_Avoid_: arbitrary path, loose output folder, file browser root

### Jobs and execution

**Persistent Job**:
SQLite-backed backend job that survives UI reloads and tracks local execution state.
_Avoid_: visual job, queue row

**Generation Task**:
Provider-independent user intent executed by a Persistent Job, such as image generation, image editing, sprite sheets, or texture generation.
_Avoid_: provider job kind, vendor-specific job type

**Generation Provider**:
Backend adapter selected through the Provider Boundary to execute a Generation Task through Codex or another image system.
_Avoid_: engine, model, vendor route

**Generation Task Spec**:
Provider-independent description of a Generation Task that can be compiled into a Codex prompt, hosted API payload, or local workflow input.
_Avoid_: final prompt, recipeContext, provider payload

**Compiled Provider Input**:
Provider-specific execution payload derived from a Generation Task Spec, such as a compact Codex prompt, hosted API request, or Comfy workflow input.
_Avoid_: source spec, recipeContext, stored prompt

**Provider Session Contract**:
Stable provider-level instructions and output rules reused across jobs so each Compiled Provider Input only carries task-specific delta.
_Avoid_: repeated prompt boilerplate, per-job system prompt, hidden recipe text

**Recipe Provider Directives**:
Compact provider-ready directive snapshot derived from a Recipe Module's Generation Task Spec metadata when the recipe has enough structured data to avoid sending the full Recipe Context.
_Avoid_: recipeContext replacement for every recipe, hidden prompt copy, lossy summary

**Codex Product Runtime**:
Interactive Codex integration powered by `codex app-server` for local jobs, events, sessions, readiness, and lifecycle supervision.
_Avoid_: SDK runner, non-interactive command, generic automation path

**Codex Automation Surface**:
Auxiliary Codex SDK or script-driven workflow used for audits, verification, migrations, or maintenance outside the interactive product runtime.
_Avoid_: primary runtime, UI generation engine, app-server replacement

**Recipe Module**:
Declarative reusable workflow that exposes metadata, parameter schema, assets, compatible tasks/providers, and a builder for a Generation Task Spec.
_Avoid_: prompt component, recipe page, workflow string

**Recipe Module Catalog**:
Queryable index of Recipe Modules used by UI cards, scripts, and agents to inspect recipe identity, tasks, providers, and parameters without reading React pages.
_Avoid_: recipe card copy, hardcoded recipes list, UI-only recipe metadata

**Style Preset Manifest**:
Granular style preset record with stable identity, category, editorial taxonomy, visual DNA, avoid rules, asset references, supported tasks, tags, and versioning.
_Avoid_: inline pack entry, giant YAML row, prompt-only preset

**Style Pack Manifest**:
Lightweight grouping record for style pack metadata, categories, ordering, and references to Style Preset Manifests.
_Avoid_: monolithic preset pack, category dump, generated style bundle

**Codex Turn**:
One `codex app-server` turn executed by the backend for a local image task.
_Avoid_: generation step, rpc call

**Local Codex Session**:
Capability snapshot that says whether the user's local Codex CLI ChatGPT login can run Codex Studio jobs right now.
_Avoid_: account status, API key session, remote auth

**App-Server Lifecycle**:
Backend supervision of `codex app-server`, including ensure reasons and the latest diagnostics.
_Avoid_: just process supervisor, websocket status

**Provider Boundary**:
Backend seam that lets non-Codex image systems satisfy the same local job, asset, metadata, log, and catalog contract without becoming the studio's product center.
_Avoid_: multi-provider orchestrator, vendor switch, direct provider call

### Frontend seams

**Visual Batch**:
UI-facing `GenerationBatch` cache materialized from Catalog Entries and persisted in IndexedDB for the current grid.
_Avoid_: durable catalog record, source of truth

**Local Studio Sync**:
Frontend seam that mirrors backend jobs, logs, and live events while importing Catalog Entries into the Visual Batch cache.
_Avoid_: polling loop, ad-hoc refresh code

**Local Generation Run**:
Frontend seam that creates Persistent Jobs, waits for completion, queries catalog results, and returns one Visual Batch.
_Avoid_: inline job choreography, direct editor pipeline

**Studio Runtime**:
Frontend runtime adapter that resolves how the renderer reaches the local backend in web or desktop contexts.
_Avoid_: readiness state, onboarding snapshot

**Studio Shell**:
Frontend seam that materializes navigation, overlays, Studio Runtime state, and Visual Batch presentation into one renderable layout for the app shell.
_Avoid_: AppContent glue, root orchestrator

**Studio Readiness**:
Frontend ready-or-blocked snapshot built from Studio Runtime, backend health, Studio Library, App-Server Lifecycle, and Local Codex Session.
_Avoid_: simple health boolean, account check

**Command Center**:
Top toolbar surface for global studio status, provider/runtime usage, queue awareness, library/workspace switching, and entry points to configuration or diagnostics.
_Avoid_: floating status panel, scattered global controls, dashboard-only command surface

**Demand-Mounted Surface**:
UI surface that mounts, fetches, animates, or renders expensive details only while visible or explicitly active.
_Avoid_: always-on panel, hidden live widget, background diagnostics view

## Relationships

- A **Library Registry** tracks one or more **Studio Libraries** and exactly one default library at a time.
- **Bootstrap Configuration** locates the initial **Studio Library**, then **Studio Settings** become the editable source of truth.
- **Provider Secrets** live outside **Studio Settings**; settings may expose only availability or validation state.
- One **Studio Library** contains many **Local Assets** and contributes many **Catalog Entries** to the **Image Catalog**.
- An **External Output Source** can be discovered or registered, then imported into a **Studio Library** before destructive or catalog operations.
- A **Catalog Page** contains many **Catalog Entries**.
- A generation-flavored **Persistent Job** executes one or more **Codex Turns**.
- A **Persistent Job** has one **Generation Task** and one **Generation Provider** selected through the **Provider Boundary**.
- A **Recipe Module** produces a **Generation Task Spec** for a **Generation Task**.
- A **Recipe Module Catalog** exposes Recipe Module metadata for navigation, scripts, and agents; it does not build provider payloads.
- **Recipe Provider Directives** may be attached to a **Generation Task Spec** when structured recipe data is strong enough to compile a compact prompt safely.
- A **Generation Provider** compiles a **Generation Task Spec** into provider-specific execution.
- A **Compiled Provider Input** is derived from a **Generation Task Spec** and may be much smaller than the stored spec.
- A **Provider Session Contract** supplies stable rules that do not need to be repeated in every **Compiled Provider Input**.
- The **Codex Product Runtime** powers interactive Codex jobs; the **Codex Automation Surface** supports non-interactive maintenance workflows.
- A **Style Pack Manifest** groups many **Style Preset Manifests** without owning all preset content inline.
- A **Local Generation Run** creates one or more **Persistent Jobs** and materializes one **Visual Batch** for the UI.
- **Local Studio Sync** imports **Catalog Entries** into **Visual Batches** for the current grid.
- **Studio Shell** materializes **Studio Runtime**, navigation state, overlays, and **Visual Batches** into the renderable app layout.
- **Studio Readiness** depends on **Studio Runtime**, **Studio Library**, **App-Server Lifecycle**, and the **Local Codex Session**.
- The **Command Center** exposes global status and commands, while deeper configuration and diagnostics open from it.
- A **Demand-Mounted Surface** is opened from the **Command Center** or another explicit user action.
- The **Provider Boundary** is Codex-first: Codex remains the primary integration path, while external image systems plug into the same durable local contracts.

## Example dialogue

> **Dev:** "When a generation finishes, do we render the **Catalog Entry** directly?"
> **Domain expert:** "Not yet — the backend persists the **Catalog Entry**, then **Local Studio Sync** imports it into a **Visual Batch** so the current grid keeps working."
>
> **Dev:** "So what actually blocks the user from generating?"
> **Domain expert:** "**Studio Readiness** does; it combines backend health, the **Studio Library**, the **App-Server Lifecycle**, and the **Local Codex Session** into one answer."

## Flagged ambiguities

- `CONTEXT.md` is glossary-only; system shape belongs in `docs/ARCHITECTURE.md`, and hard-to-reverse trade-offs belong in `docs/adr/`.
- `AGENTS.md` should guide repo work practices, while `SKILLS.md` should guide specialized workflows; neither should duplicate the glossary in `CONTEXT.md`.
- **Visual Batch** is a UI compatibility cache, not the durable source of truth; the durable record is the **Catalog Entry** in the **Image Catalog**.
- **Studio Settings** are not `.env.local`; environment files are for **Bootstrap Configuration** and secrets that must exist before the app can load the library.
- **Provider Secret** values must not be stored in the Image Catalog, job metadata, or SQLite-backed Studio Settings.
- **External Output Source** is not a second source of truth; catalog operations belong to imported **Local Assets** in a **Studio Library**.
- **Studio Runtime** names the backend-resolution adapter; readiness and onboarding status belong to **Studio Readiness**.
- **Command Center** does not mean putting every control in the toolbar; it means global controls live there or open from there instead of floating separately.
- **Demand-Mounted Surface** should be the default for heavy diagnostics, file views, activity panels, and visual effects that are not always visible.
- **Local Codex Session** is the local ChatGPT-login capability snapshot; avoid calling it "account status" except when referring to the compatibility endpoint `/api/codex/account`.
- **Provider Boundary** does not mean the product becomes a generic provider router; it preserves a Codex-first studio while allowing external generation systems behind backend adapters.
- **Generation Task** and **Generation Provider** are separate concepts; do not encode provider names into task names.
- **Recipe Module** means a declarative workflow module, not a React-only page or a prebuilt prompt string.
- **Style Preset Manifest** preserves preset identity and editing locality; avoid returning to giant pack files where one edit risks a whole category.
- **Compiled Provider Input** is execution data, not the durable source of truth; preserve the richer **Generation Task Spec** for traceability.
- **Provider Session Contract** should contain stable rules only; task-specific requirements belong in the **Generation Task Spec** and its **Compiled Provider Input**.
- **Codex Automation Surface** should not replace the **Codex Product Runtime** unless a future ADR explicitly changes the product architecture.
