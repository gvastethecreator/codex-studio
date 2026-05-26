const message = [
  '[styles:split] Legacy pack splitting is retired.',
  'Edit components/recipes/styles/manifests/** directly for normal authoring.',
  'Use bun run styles:validate -- --preset=<id> and bun run styles:runtime after manifest edits.',
].join('\n');

console.error(message);
process.exitCode = 1;
