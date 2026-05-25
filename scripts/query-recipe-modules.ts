import type { GenerationProviderId, GenerationTaskKind } from '../packages/shared/src';
import { searchRecipeCatalog, validateRecipeCatalog } from '../lib/recipeCatalog';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

function numberArgValue(name: string) {
  const value = argValue(name);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const asJson = process.argv.includes('--json');
const verifyOnly = process.argv.includes('--verify');
const validation = validateRecipeCatalog();

if (!validation.valid) {
  console.error(`[recipes:catalog] errors=${validation.errors.length}`);
  for (const error of validation.errors) console.error(`- ${error}`);
  process.exit(1);
}

if (verifyOnly) {
  console.log('[recipes:catalog] ok');
  process.exit(0);
}

const results = searchRecipeCatalog({
  query: argValue('query') ?? argValue('q'),
  task: argValue('task') as GenerationTaskKind | undefined,
  providerId: argValue('provider') as GenerationProviderId | undefined,
  parameterId: argValue('parameter'),
  limit: numberArgValue('limit') ?? 20,
});

if (asJson) {
  console.log(JSON.stringify({ count: results.length, results }, null, 2));
} else {
  console.log(`[recipes:catalog] results=${results.length}`);
  for (const recipe of results) {
    console.log(
      `- ${recipe.id} | ${recipe.title} | task=${recipe.defaultTask} | providers=${recipe.supportedProviders.join(',')} | params=${recipe.parameters.length}`,
    );
  }
}
