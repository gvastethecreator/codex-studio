/**
 * Deployable snapshots may not carry owner-only calendars or private aggregates.
 * Schema validity is not publication policy.
 */
export function deployPolicyViolations(name, snapshot) {
  const violations = [];
  if (snapshot.sourceMode === "owner-anonymous") {
    violations.push(`${name}: owner-anonymous snapshots are not deployable`);
  }
  if (snapshot.privacy?.privateAggregateIncluded || snapshot.privateAggregate !== undefined) {
    violations.push(`${name}: anonymous private aggregates must be absent from deployable snapshots`);
  }
  if (
    snapshot.contributions?.calendarVisibility === "authenticated-owner-view" &&
    Array.isArray(snapshot.contributions.daily) &&
    snapshot.contributions.daily.length > 0
  ) {
    violations.push(`${name}: an authenticated owner-view contribution calendar must not be published`);
  }
  return violations;
}

export function assertDeployableSnapshot(name, snapshot) {
  const violations = deployPolicyViolations(name, snapshot);
  if (violations.length) {
    throw new Error(`[gvaste-pages] ${violations.join("; ")}`);
  }
  return snapshot;
}
