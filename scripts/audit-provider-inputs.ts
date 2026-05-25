import { createProviderInputAuditReport, type ProviderInputAuditRow } from './provider-input-audit';
import type { GenerationProviderId } from '../packages/shared/src';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

function formatRow(row: ProviderInputAuditRow) {
  const estimate = row.estimatedPromptChars === null ? 'n/a' : String(row.estimatedPromptChars);
  const directives = row.hasRecipeProviderDirectives
    ? `${row.recipeProviderDirectivesChars}`
    : 'none';
  const leaks = row.inlineDataLeak || row.secretLikeLeak ? 'leak' : 'clean';
  const notes = row.notes.length ? ` | ${row.notes.join(', ')}` : '';

  return (
    [
      `- ${row.kind}`,
      row.providerId,
      row.recipeId ?? row.task,
      `task=${row.task}`,
      `payload=${row.payloadKind}`,
      `promptChars=${estimate}`,
      `payloadChars=${row.compiledPayloadChars}`,
      `sourceSpecChars=${row.sourceSpecChars}`,
      `directives=${directives}`,
      leaks,
    ].join(' | ') + notes
  );
}

const verifyOnly = process.argv.includes('--verify');
const asJson = process.argv.includes('--json');
const noExternalFixtures = process.argv.includes('--no-external-fixtures');

const report = createProviderInputAuditReport({
  providerId: argValue('provider') as GenerationProviderId | undefined,
  recipeId: argValue('recipe'),
  includeExternalFixtures: !noExternalFixtures,
});

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `[providers:audit] rows=${report.summary.totalRows} recipeRows=${report.summary.recipeRows} externalFixtures=${report.summary.externalFixtureRows} providers=${report.summary.providers.join(',')}`,
  );
  for (const row of report.rows) console.log(formatRow(row));
  if (report.summary.warnings.length) {
    console.log(`[providers:audit] warnings=${report.summary.warnings.length}`);
    for (const warning of report.summary.warnings) console.log(`- ${warning}`);
  }
  if (report.summary.failures.length) {
    console.error(`[providers:audit] failures=${report.summary.failures.length}`);
    for (const failure of report.summary.failures) console.error(`- ${failure}`);
  }
}

if (verifyOnly && report.summary.failures.length) {
  process.exit(1);
}
