# Studio style system

This is the ownership map for the Studio UI. The dated, local audit receipts live under the ignored `.css-sanitization/` directory; they are evidence, not a second source of style rules.

## Loading and ownership

`index.html` loads `index.css`. Vite 8 with `@tailwindcss/vite` 4.3.3 compiles Tailwind 4.3.3 and the app CSS in this order:

1. Tailwind via `@import 'tailwindcss'` (Preflight and utilities).
2. `styles/workbench-tokens.css`: Carbon/Paper semantic colors, surface roles, control defaults, and ambient inputs.
3. `styles/workbench-precision.css`: density, type, size, gap and edge tokens (`--wbp-*`).
4. `styles/workbench-ambient.css`: opt-in, scoped Ambient lighting equations. Keep its third-party notice and license.
5. `styles/workbench-studio.css`: shared Studio chrome and controls mapped to Workbench tokens.
6. `styles/compact-style-selector.css`: style selector, catalog and detail surfaces.
7. Remaining `index.css`: global base/utilities, workspace/recipe layouts, responsive and route-specific rules.

`docs/index.html` separately loads `docs/site.css`; its selectors do not participate in the Studio UI cascade. React components also use Tailwind classes and occasional runtime inline values for measured geometry, image ratios and canvas transforms. Those are consumers of the system, not dead CSS by default.

`lib/workbenchAmbient.ts` applies appearance, theme, density and ambient attributes to the root. Carbon and Paper are supported; portals such as `GsapDropdown` carry the same theme data. Use semantic variables for surface and status color, since dark-only utility colors remain pale on Paper.

## Cascade contracts

`index.css` has `@theme`, `@layer base` and `@layer utilities`, followed by unlayered app rules. Important declarations **inside a layer** can outrank important declarations in unlayered Workbench CSS. The toolbar and global keyboard-focus rules at the start of `@layer utilities` are therefore winning declarations. Change those at their owner rather than adding another override to the end of a sheet. Do not move a rule between layers, reorder imports, remove Preflight, or flatten the Ambient `@scope` as cleanup.

The `react-scan` overlay's maximum z-index is an explicit development-tool exception. It is not part of the Studio modal scale. `!important` mobile popover geometry preserves its fixed positioning over inline animation coordinates; review the runtime consumer before changing it.

## Tokens and components

- Use `--wb-bg`, `--wb-panel`, `--wb-canvas`, `--wb-well`, `--wb-ink`, `--wb-muted`, `--wb-line`, `--wb-border` for surfaces and text. `--wb-success`, `--wb-warning`, `--wb-danger`, `--wb-info` carry status semantics across Carbon and Paper.
- Use `--wbp-row`, `--wbp-text`, `--wbp-gap`, `--wbp-pad`, `--wbp-radius` for precision/density. A component may keep a deliberate larger touch or primary-action size.
- `studio-*` classes own shared chrome; `create-*` owns the creation rail/composer; `styles-catalog-*`, `style-preset-*` and `cs-*` own style browsing and selector states. Keep new rules with the existing owner.
- `lib/providerBrand.ts` owns provider glyph wells and readiness/auth pill class choices. Text must resolve through semantic tokens; tinted backgrounds alone carry the brand cue.
- Preserve complete Tailwind class strings in source. `clsx` builds class lists and `tailwind-merge` resolves known utility conflicts in `lib/utils.ts`; neither is a proof of computed-style equivalence.

## Layout, motion and focus

The app shell intentionally owns the viewport and gives scrolling to its rails, dialogs and canvases. Check both 1280×720 and 390×844 before changing overflow, fixed menus or catalog container queries. Style card overlays must remain usable with keyboard and coarse pointer. The global reduced-motion policy in `index.css` shortens animations and transitions; the selector and Ambient sheets add local reductions. GSAP transitions are runtime-owned by their components and must clean up on unmount.

Keep a visible keyboard-focus indicator in both themes. Input controls may place that indicator on a `:focus-within` wrapper; inspect computed styles in the actual mounted route before treating `outline: none` as a failure. The Add styles search uses a two-pixel wrapper indicator and a forced-colors outline. `index.css` still has a layered `!important` focus rule that wins over unlayered selectors; its color must follow `--wb-ink`.

The style preview intentionally transitions its anchored `top` and `left` coordinates. The static audit marks this as a layout-cost candidate, not a demonstrated performance defect. Profile navigation before changing transform ownership or timing.

## Reviewed exceptions

| ID        | Owner and scope                                    | Reason and evidence                                                                                                                                                 | Review by or trigger                                   |
| --------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| CSS-EX-01 | `index.css`, development overlay only              | `react-scan` must float above Studio dialogs; its extreme z-index is confined to the overlay selectors.                                                             | 2027-03-20 or remove react-scan.                       |
| CSS-EX-02 | `index.css`, mobile recipe menus                   | Fixed geometry uses `!important` to win over inline dropdown positioning; the 390px Add styles dialog remained inside the viewport in the 2026-09-20 browser check. | 2027-03-20 or change dropdown positioning/mobile dock. |
| CSS-EX-03 | `styles/compact-style-selector.css`, image preview | Anchored `top`/`left` transition maintains continuity between list options; static layout-cost warning has no runtime profile yet.                                  | 2027-03-20 or profile preview navigation.              |
| CSS-EX-04 | `styles/workbench-studio.css`, range control       | WebKit and Firefox track rules repeat values because they target different pseudo-elements.                                                                         | 2027-03-20 or change supported browsers.               |

## Dependencies and review boundary

Installed versions checked on 2026-09-20: Tailwind CSS and `@tailwindcss/vite` 4.3.3, `tailwind-merge` 3.6.0, GSAP 3.15.0. Keep each for its distinct current role. This CSS audit did not update packages, change source scanning, or claim advisory clearance. Vite/Tailwind generate one app CSS chunk; measure emitted and compressed sizes after a production build before claiming byte savings.

The 2026-09-20 audit parsed seven CSS sources and reported 86 static candidates with 214 host-language coverage gaps. Repeated selectors, shared blocks, old `!important` declarations and `will-change` signals are not proof of dead or broken CSS. There were no helper-approved adjacent duplicate declarations to autofix. Preserve lazy-route, pseudo-state and JS-generated consumers until a bounded future review proves removal safe.
