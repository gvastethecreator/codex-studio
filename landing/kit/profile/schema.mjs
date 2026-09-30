/** Versioned Gitbound profile snapshot contract, ported for the kit renderer. */

export const PROFILE_SNAPSHOT_SCHEMA_VERSION = "1.0.0";
export const PROFILE_SNAPSHOT_SCHEMA_ID = "github-profile/profile-snapshot@1";

export const GITHUB_LOGIN_RE = /^(?!-)[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
export const PROFILE_SNAPSHOT_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;
export const PROFILE_SNAPSHOT_RESIDUE_RE = /(?:^|[._-])(tmp|temp|bak|backup)(?:[._-]|$)/i;

export const SOURCE_MODES = ["public-profile", "owner-anonymous", "sample"];
export const CALENDAR_VISIBILITY = [
  "public-profile",
  "authenticated-owner-view",
  "not-verified",
  "sample",
];
export const ROLES = ["author", "reviewer", "issue-solver", "maintainer"];

export function toUtcDayTimestamp(value) {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? `${value.slice(0, 10)}T00:00:00Z` : value;
}

export function normalizeGitHubLogin(value) {
  const normalized = String(value ?? "").trim().replace(/^@/, "");
  return GITHUB_LOGIN_RE.test(normalized) ? normalized : null;
}
