// First-party browser runtime files. kit/js is source; kit/vendor copies exist
// for drop-in. scripts/sync-vendor.mjs and tests import this table.
export const FIRST_PARTY_RUNTIME = [
  ["kit/js/runtime-loader.js", "kit/vendor/runtime-loader.js"],
  ["kit/js/modules/github-signal.js", "kit/vendor/github-signal.js"],
  ["kit/js/modules/github-signal.css", "kit/vendor/github-signal.css"],
  ["kit/js/modules/highlight.mjs", "kit/vendor/highlight.mjs"],
  ["kit/js/modules/demo-workbench.js", "kit/vendor/demo-workbench.js"],
  ["kit/js/modules/type-fit.js", "kit/vendor/type-fit.js"],
  ["kit/js/modules/profile.js", "kit/vendor/profile.js"],
  ["kit/js/modules/stage-motion.js", "kit/vendor/stage-motion.js"],
  ["kit/js/modules/accent-cycle.js", "kit/vendor/accent-cycle.js"],
  ["kit/js/modules/card-fx.js", "kit/vendor/card-fx.js"],
];
