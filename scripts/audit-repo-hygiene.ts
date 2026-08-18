#!/usr/bin/env bun
/**
 * Reject tracked secrets, DBs, scratch dumps, and env files in git.
 */
import { execSync } from 'node:child_process';

const verify = process.argv.includes('--verify');
const tracked = execSync('git ls-files', { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const forbidden = [
  // Real secrets / local env, but keep committed templates.
  /^\.env(?!\.example$).+/,
  /^\.env$/,
  /\.sqlite$/i,
  /\.db$/i,
  /^\.scratch\//,
  /^logs\//,
  /^\.playwright-mcp\//,
  /^test-files\//,
  /\.pem$/i,
];

const hits = tracked.filter((file) => {
  if (file === '.env.example') return false;
  return forbidden.some((pattern) => pattern.test(file));
});
const report = {
  trackedCount: tracked.length,
  hygieneHits: hits,
  ok: hits.length === 0,
};

console.log(JSON.stringify(report, null, 2));

if (verify && hits.length > 0) {
  console.error('repo:hygiene:verify failed');
  process.exit(1);
}
