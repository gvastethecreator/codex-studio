# User Experience Review — 2026-08-16

- Repository: `codex-studio`
- Date: 2026-08-16
- Mode: direct execution (`haz una pasada`)
- Language: Spanish
- Status: 6 additions implemented and verified in the running studio
- Surface: Command Center, composer, image review, Grok Imagine edit

## Summary

The pass stayed on the live studio loop. It removed three blockers that made Grok Imagine look broken, and it hid Codex-only tools when they cannot help.

Existing Codex inpaint, recipes, routes, and the dirty Grok Imagine work stay in place.

## Users and paths

- Creator on Home: write a prompt, switch provider, generate
- Creator on image review: read what the image is, send it to context, edit it
- Creator on a Codex-only recipe with Grok selected: see why Generate is blocked

## Completed additions

### UX-01. Grok edit without a required mask

**Ticket / status**
- Local work item. Closed.

**Initial friction**
- The editor said Grok does not use the painted mask, then blocked Apply Edit until the user painted.

**Implemented addition**
- `requireMask` is false for Grok. The title is Prompt Edit. Apply Edit needs a prompt only.

**Value demonstrated**
- After `To Context` and `Edit Generated Image`, Apply Edit enabled with `softer stage light, keep the spin` and no paint.

**Preserved value**
- Codex inpaint still requires a mask.

**Affected states**
- Success: prompt-only Grok edit is available
- Empty: Apply Edit stays disabled without a prompt
- Error / recovery: not executed as a live Grok job in this pass

**Verification**
- Unit: `isImageEditorApplyDisabled`
- Browser: `#editor` on 1440x900

**Residual risk**
- Apply Edit still sends a blank mask payload. The Grok executor already drops it.

### UX-02. Composer attachments can be edited and removed

**Ticket / status**
- Local work item. Closed.

**Initial friction**
- `onOpenEditor` was unused. Remove appeared only on hover.

**Implemented addition**
- Click the thumbnail to open the editor. A remove control stays visible.

**Value demonstrated**
- After `To Context`, `Edit Generated Image` and `Remove Generated Image` were visible on desktop and 390x844.

**Preserved value**
- Add image, generate, and attachment data stay the same.

**Verification**
- Browser: Home composer after carousel `To Context`

**Residual risk**
- None observed

### UX-03. Hide Codex-only composer tools on Grok

**Ticket / status**
- Local work item. Closed.

**Initial friction**
- Negative, Refine, and Enhance stayed on Grok and pointed at Codex behavior.

**Implemented addition**
- Those tools hide when the provider is Grok. They return on Codex.

**Value demonstrated**
- Grok composer showed ratio, batch, Grok Imagine, Generate.
- After a switch back to Codex, Negative, Refine, Enhance, model, and task execution returned.

**Preserved value**
- Codex prompt tools remain on Codex.

**Verification**
- Browser: Home on Grok and Codex

**Residual risk**
- Hidden controls stay in the DOM for the mobile sheet. They are not visible.

### UX-04. Specific Grok blocked recovery

**Ticket / status**
- Local work item. Closed.

**Initial friction**
- Every not-ready Grok block said `Run grok login`.

**Implemented addition**
- The block uses the runtime status line: login, install, update, or model.

**Value demonstrated**
- Unit: model-unavailable diagnostics produce `Grok Imagine is blocked. Choose a current Grok model.`
- Browser: Camera + Grok showed `This recipe uses Codex. Switch provider or open a Grok recipe.` and disabled Generate.

**Preserved value**
- Login remains the default recovery when that is the real fault.

**Verification**
- `lib/grokImagineUiPolicy.test.ts`
- Browser: `#recipe-camera`

**Residual risk**
- This runtime was already ready, so the login/install lines were not shown live.

### UX-05. Carousel prompt and source label

**Ticket / status**
- Local work item. Closed.

**Initial friction**
- The footer started with `GROK OUTPUT OVERRIDE` and said `CODEX IMAGEGEN` on a Grok image.

**Implemented addition**
- The preview prefers `TARGET STYLE`. The source label is Grok Imagine when the stored prompt is a Grok override.

**Value demonstrated**
- Opened image 1: `EXPRESSIVE PERFORMANCE SPIN STYLE` + `GROK IMAGINE` + `3:4 OUTPUT`.

**Preserved value**
- Copy Prompt still copies the stored prompt.

**Verification**
- Browser: `#modal`
- Unit: preview and source helpers

**Residual risk**
- Catalog entries still lack `providerId`. The label uses the stored prompt as a fallback.

### UX-06. Provider menu tooltip

**Ticket / status**
- Local work item. Closed.

**Initial friction**
- `Change image generation provider` sat on top of the open menu.

**Implemented addition**
- The tooltip hides while the menu is open.

**Value demonstrated**
- Open provider menu: tooltip node gone from the snapshot.

**Preserved value**
- The tooltip still explains the closed button.

**Verification**
- Browser: provider menu on 1440x900

**Residual risk**
- None observed

## Rejected or deferred

- WEEKLY 0% copy. The tooltip says `0% available`. That can be a real quota fact, not a UI fault.
- Catalog `providerId` on image records. Larger than this pass.
- Unavailable providers stay disabled in the switcher. Settings remains the setup path.

## Runtime proof

- App: `http://localhost:17222/` with API on `127.0.0.1:17223`
- Desktop 1440x900 and mobile 390x844
- Console errors: none on the verified path
- Tests: `vp test run lib/grokImagineUiPolicy.test.ts lib/studioGenerationRequest.test.ts hooks/useGenerationToolbarConfig.test.ts` — 8 passed
- Lint/format on the 14 touched files: passed
- Full `bun run check` / `bun run test` / `bun run build`: not run. Unrelated `.playwright-mcp` format noise and the existing dirty tree would mix into a global gate.

## Residual risk

- No live Grok edit job was queued.
- The default provider was returned to Codex after the Grok checks.
- Code map is stale. This pass did not add a module boundary.
