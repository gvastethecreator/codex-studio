# Code map: cozy-studio

Generated: 2026-10-02T23:23:33Z | Commit: `f05e19ded81d` | Schema: 2
Generation: `4e6dad4b908a56601a90e50f3a01218da42930026e5fecc0a4c141bf5648145a`
Scope: . | Inventory: working-tree
Nodes: 1005 | Edges: 6051 | Flows: 5

## Coverage

- Analysis: **partial**; 926 analyzed of 938 included files.
- Configuration files: 7; omitted untracked files: 0.
- Unresolved references and analysis limits: 3898.
- Static references and call paths do not prove runtime execution or test coverage.

## Modules

- `App.tsx` | module | Repository | callers: main.tsx, review/entry.tsx | callees: components/AppContent.tsx, contexts/GenerationContext.tsx, contexts/GlobalContext.tsx, external:javascript:react | tests: 0 | entry: none
- `apps/local-server/src/animationGifEncoder.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/animationGifEncoder.ts, apps/local-server/src/animationGifEncoder.ts, external:javascript:sharp, external:javascript:sharp | tests: 0 | entry: none
- `apps/local-server/src/animationGifEncoder.ts` | module | Repository | callers: apps/local-server/src/animationGifEncoder.test.ts, apps/local-server/src/animationGifEncoder.test.ts, apps/local-server/src/animationSequenceService.ts, apps/local-server/src/animationSequenceService.ts | callees: none | tests: 1 | entry: none
- `apps/local-server/src/animationSequenceRoutes.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/animationSequenceRoutes.ts, apps/local-server/src/animationSequenceRoutes.ts, external:javascript:node:fs, external:javascript:node:fs | tests: 0 | entry: none
- `apps/local-server/src/animationSequenceRoutes.ts` | module | Repository | callers: apps/local-server/src/animationSequenceRoutes.test.ts, apps/local-server/src/animationSequenceRoutes.test.ts, apps/local-server/src/appFactory.ts, apps/local-server/src/appFactory.ts | callees: apps/local-server/src/animationSequenceRunView.ts, apps/local-server/src/animationSequenceRunView.ts, apps/local-server/src/animationSequenceService.ts, apps/local-server/src/animationSequenceService.ts | tests: 1 | entry: none
- `apps/local-server/src/animationSequenceRunView.ts` | module | Repository | callers: apps/local-server/src/animationSequenceRoutes.ts, apps/local-server/src/animationSequenceRoutes.ts | callees: packages/shared/src/index.ts | tests: 0 | entry: none
- `apps/local-server/src/animationSequenceService.ts` | module | Repository | callers: apps/local-server/src/animationSequenceRoutes.ts, apps/local-server/src/animationSequenceRoutes.ts | callees: apps/local-server/src/animationGifEncoder.ts, apps/local-server/src/animationGifEncoder.ts, apps/local-server/src/library.ts, apps/local-server/src/library.ts | tests: 0 | entry: none
- `apps/local-server/src/antigravityExecutable.ts` | module | Repository | callers: apps/local-server/src/antigravityRuntimeDoctor.test.ts, apps/local-server/src/antigravityRuntimeDoctor.test.ts, apps/local-server/src/antigravityRuntimeDoctor.ts, apps/local-server/src/antigravityRuntimeDoctor.ts | callees: apps/local-server/src/platformHome.ts, apps/local-server/src/platformHome.ts, external:javascript:node:fs, external:javascript:node:fs | tests: 1 | entry: none
- `apps/local-server/src/antigravityRuntimeDoctor.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/antigravityExecutable.ts, apps/local-server/src/antigravityExecutable.ts, apps/local-server/src/antigravityRuntimeDoctor.ts, apps/local-server/src/antigravityRuntimeDoctor.ts | tests: 0 | entry: none
- `apps/local-server/src/antigravityRuntimeDoctor.ts` | module | Repository | callers: apps/local-server/src/antigravityRuntimeDoctor.test.ts, apps/local-server/src/antigravityRuntimeDoctor.test.ts, apps/local-server/src/appFactory.test.ts, apps/local-server/src/appFactory.ts | callees: apps/local-server/src/antigravityExecutable.ts, apps/local-server/src/antigravityExecutable.ts, external:javascript:node:child_process, external:javascript:node:fs | tests: 4 | entry: none
- `apps/local-server/src/appFactory.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/antigravityRuntimeDoctor.ts, apps/local-server/src/appFactory.ts, apps/local-server/src/appFactory.ts, apps/local-server/src/catalogStore.ts | tests: 0 | entry: none
- `apps/local-server/src/appFactory.ts` | module | Repository | callers: apps/local-server/src/appFactory.test.ts, apps/local-server/src/appFactory.test.ts, apps/local-server/src/index.ts, apps/local-server/src/index.ts | callees: apps/local-server/src/animationSequenceRoutes.ts, apps/local-server/src/animationSequenceRoutes.ts, apps/local-server/src/antigravityRuntimeDoctor.ts, apps/local-server/src/assetLogRoutes.ts | tests: 1 | entry: none
- `apps/local-server/src/assetLogRoutes.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/assetLogRoutes.ts, apps/local-server/src/assetLogRoutes.ts, external:javascript:vitest, external:javascript:vitest | tests: 0 | entry: none
- `apps/local-server/src/assetLogRoutes.ts` | module | Repository | callers: apps/local-server/src/appFactory.ts, apps/local-server/src/appFactory.ts, apps/local-server/src/assetLogRoutes.test.ts, apps/local-server/src/assetLogRoutes.test.ts | callees: external:javascript:hono, packages/shared/src/index.ts | tests: 1 | entry: none
- `apps/local-server/src/auth/authRoutes.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/auth/authRoutes.ts, apps/local-server/src/auth/authRoutes.ts, apps/local-server/src/auth/constants.ts, apps/local-server/src/auth/controller.ts | tests: 0 | entry: none
- `apps/local-server/src/auth/authRoutes.ts` | module | Repository | callers: apps/local-server/src/appFactory.ts, apps/local-server/src/appFactory.ts, apps/local-server/src/auth/authRoutes.test.ts, apps/local-server/src/auth/authRoutes.test.ts | callees: apps/local-server/src/auth/controller.ts, apps/local-server/src/auth/oauthHttp.ts, apps/local-server/src/auth/oauthHttp.ts, external:javascript:hono | tests: 1 | entry: none
- `apps/local-server/src/auth/constants.ts` | module | Repository | callers: apps/local-server/src/auth/authRoutes.test.ts, apps/local-server/src/auth/deviceCode.test.ts, apps/local-server/src/auth/deviceCode.ts, apps/local-server/src/auth/deviceCode.ts | callees: none | tests: 3 | entry: none
- `apps/local-server/src/auth/controller.ts` | module | Repository | callers: apps/local-server/src/auth/authRoutes.test.ts, apps/local-server/src/auth/authRoutes.test.ts, apps/local-server/src/auth/authRoutes.ts, apps/local-server/src/reset.ts | callees: apps/local-server/src/auth/deviceCode.ts, apps/local-server/src/auth/googleAuthorizationCode.ts, apps/local-server/src/auth/oauthHttp.ts, apps/local-server/src/auth/oauthHttp.ts | tests: 1 | entry: none
- `apps/local-server/src/auth/deviceCode.test.ts` | module | Repository | callers: none | callees: apps/local-server/src/auth/constants.ts, apps/local-server/src/auth/deviceCode.ts, apps/local-server/src/auth/deviceCode.ts, external:javascript:vitest | tests: 0 | entry: none
- `apps/local-server/src/auth/deviceCode.ts` | module | Repository | callers: apps/local-server/src/auth/controller.ts, apps/local-server/src/auth/deviceCode.test.ts, apps/local-server/src/auth/deviceCode.test.ts | callees: apps/local-server/src/auth/constants.ts, apps/local-server/src/auth/constants.ts, apps/local-server/src/auth/oauthHttp.ts, apps/local-server/src/auth/oauthHttp.ts | tests: 1 | entry: none
- Showing 20 of 1005 nodes. Query `impact --module <path>` or open the HTML hierarchy for the rest.

## Edges

- `App.tsx` -> `components/AppContent.tsx` | imports
- `App.tsx` -> `contexts/GenerationContext.tsx` | imports
- `App.tsx` -> `contexts/GlobalContext.tsx` | imports
- `App.tsx` -> `external:javascript:react` | imports
- `App.tsx` -> `hooks/useTheme.ts` | imports
- `apps/local-server/src/animationGifEncoder.test.ts` -> `apps/local-server/src/animationGifEncoder.ts` | calls
- `apps/local-server/src/animationGifEncoder.test.ts` -> `apps/local-server/src/animationGifEncoder.ts` | imports
- `apps/local-server/src/animationGifEncoder.test.ts` -> `external:javascript:sharp` | calls
- `apps/local-server/src/animationGifEncoder.test.ts` -> `external:javascript:sharp` | imports
- `apps/local-server/src/animationGifEncoder.test.ts` -> `external:javascript:vitest` | calls
- `apps/local-server/src/animationGifEncoder.test.ts` -> `external:javascript:vitest` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `apps/local-server/src/animationSequenceRoutes.ts` | calls
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `apps/local-server/src/animationSequenceRoutes.ts` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:node:fs` | calls
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:node:fs` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:node:os` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:node:path` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:sharp` | calls
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:sharp` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:vitest` | calls
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `external:javascript:vitest` | imports
- `apps/local-server/src/animationSequenceRoutes.test.ts` -> `packages/shared/src/index.ts` | imports (type only)
- `apps/local-server/src/animationSequenceRoutes.ts` -> `apps/local-server/src/animationSequenceRunView.ts` | calls
- `apps/local-server/src/animationSequenceRoutes.ts` -> `apps/local-server/src/animationSequenceRunView.ts` | imports
- `apps/local-server/src/animationSequenceRoutes.ts` -> `apps/local-server/src/animationSequenceService.ts` | calls
- `apps/local-server/src/animationSequenceRoutes.ts` -> `apps/local-server/src/animationSequenceService.ts` | imports
- `apps/local-server/src/animationSequenceRoutes.ts` -> `external:javascript:hono` | imports
- `apps/local-server/src/animationSequenceRoutes.ts` -> `external:javascript:node:fs` | calls
- `apps/local-server/src/animationSequenceRoutes.ts` -> `external:javascript:node:fs` | imports
- `apps/local-server/src/animationSequenceRoutes.ts` -> `packages/shared/src/index.ts` | imports (type only)
- `apps/local-server/src/animationSequenceRunView.ts` -> `packages/shared/src/index.ts` | imports (type only)
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/animationGifEncoder.ts` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/animationGifEncoder.ts` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/library.ts` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/library.ts` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/managedAssetPolicy.ts` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/managedAssetPolicy.ts` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/outputDestination.ts` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/outputDestination.ts` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `apps/local-server/src/sharpAuthoringAdapter.ts` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `external:javascript:node:crypto` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `external:javascript:node:crypto` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `external:javascript:node:fs` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `external:javascript:node:fs` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `external:javascript:node:path` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `packages/shared/src/animationSequenceContracts.ts` | calls
- `apps/local-server/src/animationSequenceService.ts` -> `packages/shared/src/animationSequenceContracts.ts` | imports
- `apps/local-server/src/animationSequenceService.ts` -> `packages/shared/src/types.ts` | imports (type only)
- `apps/local-server/src/antigravityExecutable.ts` -> `apps/local-server/src/platformHome.ts` | calls
- `apps/local-server/src/antigravityExecutable.ts` -> `apps/local-server/src/platformHome.ts` | imports
- Showing 50 of 6051 edges; JSON contains every edge and its evidence.

## Unknown

- `apps/local-server/src/animationSequenceRoutes.test.ts:29`: object-member-call-not-resolved (path)
- `apps/local-server/src/animationSequenceRoutes.test.ts:54`: object-member-call-not-resolved (path)
- `apps/local-server/src/animationSequenceRoutes.test.ts:54`: object-member-call-not-resolved (os)
- `apps/local-server/src/animationSequenceRoutes.test.ts:56`: object-member-call-not-resolved (path)
- `apps/local-server/src/animationSequenceRoutes.test.ts:57`: object-member-call-not-resolved (path)
- `apps/local-server/src/animationSequenceRoutes.test.ts:66`: object-member-call-not-resolved (path)
- `apps/local-server/src/animationSequenceRoutes.test.ts:99`: object-member-call-not-resolved (expect)
- `apps/local-server/src/animationSequenceRoutes.test.ts:169`: object-member-call-not-resolved (expect)
- `apps/local-server/src/animationSequenceRoutes.test.ts:180`: object-member-call-not-resolved (expect)
- `apps/local-server/src/animationSequenceRoutes.test.ts:181`: object-member-call-not-resolved (expect)
- `apps/local-server/src/animationSequenceRoutes.test.ts:194`: object-member-call-not-resolved (path)
- `apps/local-server/src/animationSequenceRoutes.test.ts:194`: object-member-call-not-resolved (os)

## Flows

- Python __main__: `skills/imagegen/scripts/remove_chroma_key.py` -> `external:python:argparse` | Static call path reaches external:python:argparse:ArgumentParser
- Python __main__: `skills/imagegen/scripts/remove_chroma_key.py` -> `external:python:re` | Static call path reaches external:python:re:fullmatch
- Python __main__: `skills/imagegen/scripts/remove_chroma_key.py` -> `external:python:statistics` | Static call path reaches external:python:statistics:median
- Python __main__: `skills/imagegen/scripts/remove_chroma_key.py` -> `external:python:pathlib` | Static call path reaches external:python:pathlib:Path
- Python __main__: `skills/imagegen/scripts/remove_chroma_key.py` -> `external:python:io` | Static call path reaches external:python:io:BytesIO

## Architecture changes

- Nodes: +1 / -0; edges: +53 / -7.
- Boundary changes: 0; new cycles: 0.

## Read next

- Use `status` before relying on this generation.
- Use `impact --changed` for possible impact and related test evidence.
- Use `diff --before <model> --after <model>` for architecture changes.
