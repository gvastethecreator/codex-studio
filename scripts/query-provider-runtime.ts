import {
  getExternalProviderRuntimePreflight,
  readExternalProviderRuntimePreflights,
  type ProviderRuntimePreflight,
} from '../apps/local-server/src/providers/runtimeConfig';
import type { GenerationProviderId } from '../packages/shared/src';

function argValue(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
}

const providerId = argValue('provider') as GenerationProviderId | undefined;
const asJson = process.argv.includes('--json');
function isProviderRuntimePreflight(
  value: ProviderRuntimePreflight | null,
): value is ProviderRuntimePreflight {
  return Boolean(value);
}

const rows = providerId
  ? [getExternalProviderRuntimePreflight(providerId)].filter(isProviderRuntimePreflight)
  : readExternalProviderRuntimePreflights();

if (asJson) {
  console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
} else {
  console.log(`[providers:preflight] rows=${rows.length}`);
  for (const row of rows) {
    console.log(
      [
        `- ${row.providerId}`,
        `runtime=${row.runtimeKind}`,
        `secret=${row.secretState}`,
        `secretSource=${row.secretSource ?? 'none'}`,
        `localRuntime=${row.localRuntimeState}`,
        `localRuntimeSource=${row.localRuntimeSource ?? 'none'}`,
        `canAttempt=${row.canAttemptExecution}`,
      ].join(' | '),
    );
    for (const diagnostic of row.diagnostics) console.log(`  - ${diagnostic}`);
  }
}
