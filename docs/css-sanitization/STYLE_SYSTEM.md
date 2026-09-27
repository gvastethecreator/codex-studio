# Studio style system

Studio uses React client rendering, Vite+, Tailwind CSS 4, and local CSS. Keep the current visual identity: Carbon and Paper themes, runtime accent colors, Workbench controls, and the shared canvas layout. This document is the ownership map, not a replacement token catalog.

## Loading and precedence

The application starts at `index.html`. It loads the Manrope font, `index.css`, and `main.tsx`. The CSS entrypoint imports these sources in this order:

| Source                              | Responsibility                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `tailwindcss`                       | Theme, one Preflight reset, generated utilities, and Tailwind layers                        |
| `styles/workbench-tokens.css`       | Theme colors, semantic aliases, ambient inputs, and shared action height                    |
| `styles/workbench-precision.css`    | Control size, typography, density, and edge tokens                                          |
| `styles/workbench-ambient.css`      | Workbench material and lighting paint                                                       |
| `styles/workbench-studio.css`       | Studio-specific Workbench controls and ambient specificity bridges                          |
| `styles/compact-style-selector.css` | Compact style selection, catalogs, tiles, and disclosures                                   |
| `styles/studio-foundation.css`      | Tailwind theme extensions, base defaults, shared utilities, and CSS motion primitives       |
| `styles/studio-workspace.css`       | Create and recipe composition, responsive rails, result tools, Library, and viewer surfaces |

Vite uses the React and `@tailwindcss/vite` plugins. CSS is bundled eagerly into one stylesheet shared by lazy workflow routes. There is no CSS import in a recipe component, second Preflight, Sass pipeline, CSS Modules build, or runtime CSS-in-JS engine in the application. `motion/react` resolves to the local GSAP adapter; it is not an additional installed motion engine.

Import order is a contract. Workbench and workspace component rules are unlayered; the foundation retains its existing `base` and `utilities` layers. Unlayered normal rules outrank normal layered utilities. Do not move the component sheets into a new layer or reorder imports during routine cleanup. The 2026-09-26 extraction preserved the ordered PostCSS tree.

Important declarations reverse that layer priority: the toolbar and global keyboard-focus rules in the foundation's utilities layer can outrank unlayered Workbench rules. Change those at their owner. Keep the Ambient kernel's scoped rules, third-party notice, and license intact.

`docs/site.css` belongs to the separate documentation site. `review/review-chrome.css` belongs to review tooling. Neither is imported by the Studio entrypoint. Generated reports and embedded HTML previews are separate documents, not additional Studio themes.

`lib/workbenchAmbient.ts` applies theme, density, appearance, and ambient attributes to the root. Portals such as `GsapDropdown` carry the same theme data. `lib/providerBrand.ts` owns provider glyph wells and readiness/auth pill classes; brand tint must not replace semantic text and status colors.

## Conventions

- Add theme semantics to the token owner. Keep Workbench, precision, ambient, and Create aliases where they serve different scopes. Equal values alone do not make two tokens interchangeable.
- Add component rules at their existing owner. Keep one root definition per selector where cascade precedence allows it; put intentional responsive and state variants beside the owning family. Do not append a second override sheet.
- Keep complete Tailwind class names in maps and variants. `lib/utils.ts` owns the existing `clsx` plus `tailwind-merge` helper. Do not add a second class-merging abstraction.
- Keep runtime values in the current component style or bounded custom property. Examples include image transforms, portal positions, virtualized layout, card sizing, and accent colors. They are not dead CSS.
- Preserve the existing 639/640 and 1023/1024 viewport boundaries, container queries for catalog/result/viewer widths, and the ResizeObserver-driven workspace layout. A Jobs rail changes available workspace width without changing the viewport.
- Preserve specificity and shorthand order when merging rules. A repeated selector inside a media query has a different role from a duplicate root rule.

## Form and action geometry

`studio-field` owns text input and select insets: 6 px vertically and 12 px horizontally. `studio-ghost-control` owns labeled action padding and an 8 px icon gap; icon-only SVG actions keep compact equal insets. `--wb-control-border` supplies a neutral boundary in both themes. These two primitives do not use Ambient bevel paint; the surrounding shell retains its material.

Settings overrides the shared control size to 40 px with 14 px text. Desktop content and header/footer share 24 px edge insets; narrow layouts use 16 px. Provider account cards use two readable columns when space permits, and one on narrow screens. Setup guidance wraps instead of being clamped. The narrow footer reserves a row for save status above the actions.

The Create generation action uses content height, a 48 px minimum, and 10 px vertical padding. A two-line action and its thumbnail must not be squeezed into a fixed 36 px row. `studio-workspace.css` owns that geometry; `workbench-studio.css` owns its theme paint and type.

## Motion and interaction owners

`lib/motionRuntime.ts` owns GSAP. `lib/gsapMotion.tsx` owns shared presence and route/dialog motion; `components/ui/GsapDropdown.tsx` owns dropdown animation, portal placement, interruption, and cleanup. Exiting surfaces become inert and focus returns through the existing handlers. CSS selectors exclude motion-owned surfaces where the shared adapter writes transforms.

`hooks/useTheme.ts` writes accent custom properties and handles theme motion. CSS owns hover/focus paint, spinners, and small disclosure transitions. Reduced motion has both CSS and JavaScript paths. Keep their existing durations, easing, transform ownership, and completion behavior together. Do not infer animation completion from screenshots.

The shell owns the viewport and delegates scrolling to rails, dialogs, and canvases. Check desktop and narrow mobile widths when changing overflow or fixed menus. Input focus may be drawn by a `:focus-within` wrapper; the Add styles search also has a forced-colors outline. The layered global focus rule uses `--wb-ink`. Inspect the mounted control before removing an `outline: none` declaration. The anchored style preview's `top`/`left` transition is an intentional continuity mechanism whose layout cost has not been profiled.

## Dependency decisions

Resolved locally on 2026-09-26; retained without lockfile changes:

| Package                    | Version         | Role and decision                                                  |
| -------------------------- | --------------- | ------------------------------------------------------------------ |
| Tailwind CSS / Vite plugin | 4.3.3 / 4.3.3   | Utility generation and CSS integration; keep the existing pipeline |
| Vite+ / aliased Vite core  | 1.0.0-rc.0      | Build, formatting, lint integration; keep                          |
| PostCSS                    | 8.5.28          | Existing resolved parser/transform dependency and override; keep   |
| clsx / tailwind-merge      | 2.1.1 / 3.7.0   | Class construction and conflict resolution; distinct roles, keep   |
| GSAP / React binding       | 3.15.0 / 2.1.2  | Shared animation engine and lifecycle binding; keep                |
| oxfmt / oxlint             | 0.70.0 / 1.85.0 | Existing formatting/lint tools; keep                               |

No duplicate UI framework was established by this audit. No dependency was upgraded, removed, or installed. No Stylelint or CI job was added: the repository already uses its Bun checks and browser verification. Dependency security advisories were not audited, so this document makes no security certification.

Version-matched behavior was checked against [Tailwind source detection](https://tailwindcss.com/docs/detecting-classes-in-source-files), [theme variables](https://tailwindcss.com/docs/theme), [tailwind-merge](https://github.com/dcastil/tailwind-merge), and [GSAP media queries](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>). Automatic Tailwind source detection remains unchanged; narrowing it would require proving all dynamic consumers first.

## Preserved exceptions

| ID        | Owner and reason                                             | Evidence and review trigger                                                                                                                               |
| --------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS-EX-01 | The react-scan development overlay must float above dialogs  | Now in `studio-foundation.css`; review by 2027-03-20 or when removing react-scan                                                                          |
| CSS-EX-02 | Mobile recipe menu geometry must win over inline placement   | Foundation/workspace rules; keep the earlier 390px evidence distinct from this run. Review by 2027-03-20 or when dropdown positioning/mobile dock changes |
| CSS-EX-03 | Anchored style previews transition top/left for continuity   | `compact-style-selector.css`; review by 2027-03-20 or when profiling preview navigation                                                                   |
| CSS-EX-04 | WebKit and Mozilla range pseudo elements need separate rules | `workbench-studio.css`; review by 2027-03-20 or when supported browsers change                                                                            |
| CSS-EX-05 | Pixel-art rendering uses ordered compatibility values        | `studio-foundation.css`; review against explicit browser targets before removal                                                                           |
| CSS-EX-06 | Workbench bridges preserve ambient and utility precedence    | `workbench-studio.css`; review when the imported Workbench contract changes                                                                               |
| CSS-EX-07 | Reduced-motion rules shorten CSS animations and JS movement  | Foundation, workspace, GSAP adapters, theme hook; review with focus and completion behavior                                                               |
| CSS-EX-08 | Some CSS and utility variants have unvisited consumers       | Audit inventory and host markers; absence in one browser session is not proof of disuse                                                                   |

Exceptions were reviewed on 2026-09-26. Revisit them when the listed owner changes; do not remove them solely because a static audit reports a warning.

## Validation record

The local run is `.css-sanitization/2026-09-26-consolidation/`. It contains the source hashes and backups, pre-existing Git diff, helper inventories, reviewed plan, applied-rule journal, build logs, emitted CSS metrics, browser captures and computed properties, and completion receipt. These artifacts are ignored by Git.

The audit covers all eight original CSS sources and inspects dynamic styling at the shared React, theme, dropdown, catalog, and canvas boundaries. Browser coverage uses representative Create, Character, Styles, Settings, and Library surfaces. It is not proof of every provider, lazy workflow, embedded document, browser engine, or user-generated state. Read the completion receipt for passed checks and remaining limits before treating the run as release evidence.

## Settings and Cozy surfaces

Settings uses a 1120 × 760 dialog bounded by the viewport. Header, section navigation, and footer stay fixed; only the content scrolls. Narrow screens use a section selector. Shared label/help/control rows belong to `workbench-studio.css`, as do the modal scrim and Cozy layout rules.

Modal scrims use a translucent theme surface with `blur(12px) saturate(0.25)`. Opening and closing use the existing GSAP presence adapter at about 160 ms and 100 ms. Do not animate Settings height. `useDialogFocus` owns focus, nested Escape, body scroll locks, and inert background branches.

`CozyMascot` renders the supplied SVG in full and compact variants. The dark body and light features stay fixed; steam, coffee, pencil, and notebook inherit the accent. GSAP pauses hidden mascots. System motion follows the OS; Reduced disables decorative CSS and GSAP motion. Appearance changes in Settings are previews until Save, and Discard restores the saved appearance.

Onboarding uses a centered, content-sized dialog up to 960 px wide and 800 px high, bounded by the viewport. Body text starts at 14 px, the introduction uses 16 px, and setup diagnostics stay collapsed when Studio is ready. Provider names use the existing brand marks. Three brief steps enter in sequence; Cozy waves the pencil, blinks, and draws once. Reduced motion leaves all content visible without decorative movement.
