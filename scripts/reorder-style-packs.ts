const message = [
  '[styles:reorder-style-packs] Legacy pack reordering is retired.',
  'Edit components/recipes/styles/manifests/** directly.',
  'Run bun run styles:source:verify, then bun run styles:runtime.',
].join('\n');

console.error(message);
process.exitCode = 1;
