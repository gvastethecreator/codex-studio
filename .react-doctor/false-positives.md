# React Doctor False Positives

## effect-needs-cleanup — hooks/useCameraViewport.ts:162

The `useEffect` at line 162 wraps its subscription logic in an `async` IIFE. The
`addEventListener` call happens inside that async callback so the static analyser
cannot trace it. The cleanup IS returned: at the end of the effect the function
returns `() => { cancelled = true; cleanupViewport?.(); }`, which calls the
teardown registered by the async setup. This is a confirmed false positive.

## unused-file (315 instances)

React Doctor's static graph walk cannot follow `React.lazy(() => import(...))` or
dynamic `import(...)` calls. The project root is `App.tsx`/`main.tsx`; every file
under `components/`, `hooks/`, `lib/`, `services/`, `utils/`, `apps/local-server/`,
and `packages/` is transitively reachable via lazy routes, context providers, or
re-exports. No files are actually unused — all instances are false positives caused
by dynamic-import opacity.
