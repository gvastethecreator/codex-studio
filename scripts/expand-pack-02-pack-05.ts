const message = [
  '[styles:expand-pack-02-pack-05] Legacy pack mutation is retired.',
  'Edit components/recipes/styles/manifests/** directly.',
  'Run bun run styles:validate -- --preset=<id>, then bun run styles:runtime.',
].join('\n');

console.error(message);
process.exitCode = 1;
