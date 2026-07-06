import { readCodexRuntimeDoctor } from '../apps/local-server/src/codexRuntimeDoctor';

const asJson = process.argv.includes('--json');
const report = readCodexRuntimeDoctor({ maxAgeMs: 0 });

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`[runtime:doctor] status=${report.status} canRunJobs=${report.canRunJobs}`);
  console.log(`- selected: ${report.selectedExecutable}`);
  console.log(`- CLI metadata: ${report.selectedVersion ?? 'unavailable'}`);
  console.log(`- app-server: ${report.appServerSupported ? 'supported' : 'blocked'}`);
  console.log(`- action: ${report.recommendedAction}`);

  if (report.issues.length > 0) {
    console.log('- issues:');
    for (const issue of report.issues) {
      console.log(`  - ${issue.code}: ${issue.message}`);
      console.log(`    action: ${issue.action}`);
    }
  }

  console.log('- candidates:');
  for (const candidate of report.candidates) {
    const selected = candidate.selected ? 'selected' : 'candidate';
    const exists = candidate.exists ? 'exists' : 'not-found-or-path';
    console.log(`  - ${selected} | ${exists} | ${candidate.source} | ${candidate.executable}`);
  }
}
