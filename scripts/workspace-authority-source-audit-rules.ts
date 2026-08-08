const RETIRED_PROJECT_CONTRACT_PATTERNS = [
  /project\.created/i,
  /projectId/i,
  /project_id/i,
  /\/api\/projects/i,
  /listProjects/i,
  /ensureDefaultProject/i,
  /(?:interface|type)\s+Project\b/i,
];

export function containsRetiredProjectContract(source: string) {
  return RETIRED_PROJECT_CONTRACT_PATTERNS.some((pattern) => pattern.test(source));
}
