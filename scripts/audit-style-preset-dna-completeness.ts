import path from 'node:path';

import type { StylePresetManifest } from '../components/recipes/styles/manifestTypes';
import { loadStylePresetManifestRecords } from './style-manifest-files';

export type StyleDnaCompletenessSeverity = 'critical' | 'high' | 'medium' | 'low' | 'clean';

export type StyleDnaCompletenessIssueKind =
  | 'missing_required_field'
  | 'thin_required_field'
  | 'underdeveloped_required_field'
  | 'generic_boilerplate'
  | 'duplicate_field_value'
  | 'missing_recommended_field'
  | 'underdeveloped_recommended_field'
  | 'weak_router_contract'
  | 'weak_negative_controls';

export interface StyleDnaCompletenessIssue {
  kind: StyleDnaCompletenessIssueKind;
  field: string;
  weight: number;
  evidence: string;
  reason: string;
}

export interface StyleDnaCompletenessPresetFinding {
  id: string;
  packId: string;
  name: string;
  category: string;
  filePath: string;
  score: number;
  severity: StyleDnaCompletenessSeverity;
  fieldCoverage: string;
  requiredFieldWordCounts: Record<string, number>;
  issues: StyleDnaCompletenessIssue[];
  recommendedAction: string;
}

export interface StyleDnaCompletenessPackSummary {
  packId: string;
  presets: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  clean: number;
  averageScore: number;
  incompleteRequiredFields: number;
  genericFields: number;
}

export interface StyleDnaCompletenessAuditReport {
  totalPresets: number;
  severityCounts: Record<StyleDnaCompletenessSeverity, number>;
  packSummaries: StyleDnaCompletenessPackSummary[];
  findings: StyleDnaCompletenessPresetFinding[];
}

export interface StyleDnaCompletenessAuditOptions {
  packId?: string;
  minSeverity?: StyleDnaCompletenessSeverity;
  limit?: number;
}

interface PresetRecordLike {
  filePath: string;
  manifest: StylePresetManifest;
}

interface FieldProfile {
  key: keyof StylePresetManifest['visualDna'] & string;
  minWords: number;
}

interface GenericPattern {
  pattern: RegExp;
  reason: string;
}

const REQUIRED_FIELD_PROFILES: FieldProfile[] = [
  { key: 'aesthetic', minWords: 8 },
  { key: 'subject_treatment', minWords: 10 },
  { key: 'color_and_tone', minWords: 8 },
  { key: 'lighting_and_shadow', minWords: 8 },
  { key: 'texture_and_material', minWords: 8 },
  { key: 'camera_and_composition', minWords: 8 },
  { key: 'atmosphere_and_mood', minWords: 7 },
  { key: 'rendering_and_quality', minWords: 8 },
];

const RECOMMENDED_FIELD_PROFILES: FieldProfile[] = [
  { key: 'creative_brief', minWords: 18 },
  { key: 'key_features', minWords: 5 },
];

const SEVERITY_RANK: Record<StyleDnaCompletenessSeverity, number> = {
  clean: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const GENERIC_PATTERNS: GenericPattern[] = [
  {
    pattern: /\bvisual language with a clear stylistic thesis\b/i,
    reason: 'template visual-language filler',
  },
  {
    pattern: /\bUse a controlled palette that supports\b/i,
    reason: 'generic palette template',
  },
  {
    pattern: /\bcategory-appropriate color accents\b/i,
    reason: 'category-placeholder color wording',
  },
  {
    pattern: /\bShape light and shadow for\b/i,
    reason: 'generic lighting template',
  },
  {
    pattern: /\bRender surfaces with\b.*\bmaterial logic\b/i,
    reason: 'generic material template',
  },
  {
    pattern: /\btexture choices that reinforce the style rather than generic decoration\b/i,
    reason: 'generic material fallback',
  },
  {
    pattern: /\bCompose with\b.*\bstaging logic\b/i,
    reason: 'generic composition template',
  },
  {
    pattern: /\bstable readable framing\b/i,
    reason: 'generic readable-framing fallback',
  },
  {
    pattern: /\bBuild\b.*\bmood through environment, color, light, and texture\b/i,
    reason: 'generic mood template',
  },
  {
    pattern: /\bFinish as a polished\b.*\bstyle-card\b/i,
    reason: 'style-card finish template',
  },
  {
    pattern: /\bCreate a style-card that translates\b/i,
    reason: 'card-generation template',
  },
  {
    pattern: /\bPreserve the preset identity through style mechanics\b/i,
    reason: 'router boilerplate without concrete style vocabulary',
  },
];

const ROUTER_CONTRACT_PATTERNS = [
  /\bany prompt\b/i,
  /\bany subject\b/i,
  /\buser'?s subject\b/i,
  /\binput\b/i,
  /\bprompt X\b/i,
  /\btransferable\b/i,
  /\breusable\b/i,
  /\bwithout requiring\b/i,
  /\bwithout forcing\b/i,
  /\bstyle router\b/i,
  /\broutes?\b/i,
];

function argValue(name: string) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function fieldValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return isNonEmptyString(value) ? value.trim() : '';
}

function shortEvidence(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed.length <= 150 ? trimmed : `${trimmed.slice(0, 147)}...`;
}

function wordCount(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return 0;
  return normalized.split(/\s+/).filter(Boolean).length;
}

function scoreToSeverity(score: number, issues: StyleDnaCompletenessIssue[]) {
  if (issues.some((issue) => issue.kind === 'missing_required_field') || score >= 40) {
    return 'critical';
  }
  if (score >= 24) return 'high';
  if (score >= 10) return 'medium';
  if (score >= 1) return 'low';
  return 'clean';
}

function analyzeRequiredFields(manifest: StylePresetManifest) {
  const issues: StyleDnaCompletenessIssue[] = [];
  const requiredFieldWordCounts: Record<string, number> = {};

  for (const profile of REQUIRED_FIELD_PROFILES) {
    const value = fieldValue(manifest, profile.key);
    const count = wordCount(value);
    requiredFieldWordCounts[profile.key] = count;

    if (!value) {
      issues.push({
        kind: 'missing_required_field',
        field: `visualDna.${profile.key}`,
        weight: 16,
        evidence: '',
        reason: 'Required visual DNA field is missing or empty.',
      });
      continue;
    }

    if (count < 3) {
      issues.push({
        kind: 'thin_required_field',
        field: `visualDna.${profile.key}`,
        weight: 9,
        evidence: shortEvidence(value),
        reason: `Required field has only ${count} word(s); it names a cue but does not define style behavior.`,
      });
      continue;
    }

    if (count < profile.minWords) {
      issues.push({
        kind: 'underdeveloped_required_field',
        field: `visualDna.${profile.key}`,
        weight: 5,
        evidence: shortEvidence(value),
        reason: `Required field has ${count} words; expected at least ${profile.minWords} for a usable style-router property.`,
      });
    }
  }

  return { issues, requiredFieldWordCounts };
}

function analyzeRecommendedFields(manifest: StylePresetManifest) {
  const issues: StyleDnaCompletenessIssue[] = [];

  for (const profile of RECOMMENDED_FIELD_PROFILES) {
    const value = fieldValue(manifest, profile.key);
    if (!value) {
      issues.push({
        kind: 'missing_recommended_field',
        field: `visualDna.${profile.key}`,
        weight: profile.key === 'creative_brief' ? 5 : 3,
        evidence: '',
        reason: 'Recommended differentiator field is missing.',
      });
      continue;
    }

    const count = wordCount(value);
    if (count < profile.minWords) {
      issues.push({
        kind: 'underdeveloped_recommended_field',
        field: `visualDna.${profile.key}`,
        weight: profile.key === 'creative_brief' ? 4 : 2,
        evidence: shortEvidence(value),
        reason: `Recommended field has ${count} words; expected at least ${profile.minWords}.`,
      });
    }
  }

  return issues;
}

function analyzeGenericBoilerplate(manifest: StylePresetManifest) {
  const issues: StyleDnaCompletenessIssue[] = [];
  const visualDna = manifest.visualDna as Record<string, unknown>;

  for (const [key, rawValue] of Object.entries(visualDna)) {
    if (!isNonEmptyString(rawValue)) continue;
    for (const definition of GENERIC_PATTERNS) {
      if (!definition.pattern.test(rawValue)) continue;
      issues.push({
        kind: 'generic_boilerplate',
        field: `visualDna.${key}`,
        weight: 8,
        evidence: shortEvidence(rawValue),
        reason: definition.reason,
      });
      break;
    }
  }

  return issues;
}

function analyzeDuplicateFields(manifest: StylePresetManifest) {
  const issues: StyleDnaCompletenessIssue[] = [];
  const seen = new Map<string, string>();

  for (const profile of REQUIRED_FIELD_PROFILES) {
    const value = fieldValue(manifest, profile.key);
    const normalized = normalizeText(value);
    if (!normalized || wordCount(value) < 4) continue;

    const previousField = seen.get(normalized);
    if (previousField) {
      issues.push({
        kind: 'duplicate_field_value',
        field: `visualDna.${profile.key}`,
        weight: 6,
        evidence: shortEvidence(value),
        reason: `Duplicates ${previousField}; fields should cover different style properties.`,
      });
      continue;
    }

    seen.set(normalized, `visualDna.${profile.key}`);
  }

  return issues;
}

function analyzeRouterContract(manifest: StylePresetManifest) {
  const brief = fieldValue(manifest, 'creative_brief');
  const subjectTreatment = fieldValue(manifest, 'subject_treatment');
  const combined = `${brief} ${subjectTreatment}`;

  if (ROUTER_CONTRACT_PATTERNS.some((pattern) => pattern.test(combined))) {
    return [];
  }

  return [
    {
      kind: 'weak_router_contract',
      field: 'visualDna.creative_brief',
      weight: 4,
      evidence: shortEvidence(brief || subjectTreatment),
      reason:
        'Preset does not clearly state how the style transfers onto arbitrary user prompts or subjects.',
    } satisfies StyleDnaCompletenessIssue,
  ];
}

function analyzeNegativeControls(manifest: StylePresetManifest) {
  const issues: StyleDnaCompletenessIssue[] = [];
  const negativePrompt = manifest.attributes?.negativePrompt;
  const negativeWordCount = isNonEmptyString(negativePrompt) ? wordCount(negativePrompt) : 0;
  const avoidRuleCount = Array.isArray(manifest.avoidRules) ? manifest.avoidRules.length : 0;

  if (avoidRuleCount < 3) {
    issues.push({
      kind: 'weak_negative_controls',
      field: 'avoidRules',
      weight: 2,
      evidence: manifest.avoidRules?.join(', ') ?? '',
      reason: `Only ${avoidRuleCount} avoid rule(s); weak protection against common style drift.`,
    });
  }

  if (negativeWordCount > 0 && negativeWordCount < 3) {
    issues.push({
      kind: 'weak_negative_controls',
      field: 'attributes.negativePrompt',
      weight: 1,
      evidence: shortEvidence(String(negativePrompt)),
      reason: 'Negative prompt is present but too small to encode meaningful drift controls.',
    });
  }

  return issues;
}

function recommendedActionForFinding(finding: Pick<StyleDnaCompletenessPresetFinding, 'issues'>) {
  const kinds = new Set(finding.issues.map((issue) => issue.kind));
  if (kinds.has('missing_required_field')) {
    return 'Add every required visualDna field before judging style quality.';
  }
  if (kinds.has('thin_required_field') || kinds.has('underdeveloped_required_field')) {
    return 'Expand short required fields into concrete style mechanics: palette, light, texture, composition, mood, and finish.';
  }
  if (kinds.has('generic_boilerplate')) {
    return 'Replace generated template language with preset-specific vocabulary and remove category placeholders.';
  }
  if (kinds.has('weak_router_contract')) {
    return 'Add a clear prompt-preservation contract: prompt X supplies the scene, the preset supplies style behavior.';
  }
  return 'Review recommended fields and negative controls after the required DNA properties are complete.';
}

function analyzeManifest(record: PresetRecordLike): StyleDnaCompletenessPresetFinding {
  const { manifest } = record;
  const { issues: requiredIssues, requiredFieldWordCounts } = analyzeRequiredFields(manifest);
  const issues = [
    ...requiredIssues,
    ...analyzeRecommendedFields(manifest),
    ...analyzeGenericBoilerplate(manifest),
    ...analyzeDuplicateFields(manifest),
    ...analyzeRouterContract(manifest),
    ...analyzeNegativeControls(manifest),
  ];

  const score = issues.reduce((total, issue) => total + issue.weight, 0);
  const severity = scoreToSeverity(score, issues);
  const presentRequiredFields = REQUIRED_FIELD_PROFILES.filter(
    (profile) => requiredFieldWordCounts[profile.key] > 0,
  ).length;
  const fieldCoverage = `${presentRequiredFields}/${REQUIRED_FIELD_PROFILES.length}`;
  const partialFinding = { issues };

  return {
    id: manifest.id,
    packId: manifest.packId,
    name: manifest.name,
    category: manifest.category,
    filePath: path.relative(process.cwd(), record.filePath).replace(/\\/g, '/'),
    score,
    severity,
    fieldCoverage,
    requiredFieldWordCounts,
    issues,
    recommendedAction: recommendedActionForFinding(partialFinding),
  };
}

function sortFindings(
  first: StyleDnaCompletenessPresetFinding,
  second: StyleDnaCompletenessPresetFinding,
) {
  return (
    second.score - first.score ||
    SEVERITY_RANK[second.severity] - SEVERITY_RANK[first.severity] ||
    first.packId.localeCompare(second.packId) ||
    first.id.localeCompare(second.id)
  );
}

function summarizePack(findings: StyleDnaCompletenessPresetFinding[]) {
  const packMap = new Map<string, StyleDnaCompletenessPackSummary>();

  for (const finding of findings) {
    const summary =
      packMap.get(finding.packId) ??
      ({
        packId: finding.packId,
        presets: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        clean: 0,
        averageScore: 0,
        incompleteRequiredFields: 0,
        genericFields: 0,
      } satisfies StyleDnaCompletenessPackSummary);

    summary.presets += 1;
    summary[finding.severity] += 1;
    summary.averageScore += finding.score;
    summary.incompleteRequiredFields += finding.issues.filter(
      (issue) =>
        issue.kind === 'missing_required_field' ||
        issue.kind === 'thin_required_field' ||
        issue.kind === 'underdeveloped_required_field',
    ).length;
    summary.genericFields += finding.issues.filter(
      (issue) => issue.kind === 'generic_boilerplate',
    ).length;
    packMap.set(finding.packId, summary);
  }

  return [...packMap.values()]
    .map((summary) => ({
      ...summary,
      averageScore: summary.presets === 0 ? 0 : summary.averageScore / summary.presets,
    }))
    .sort(
      (first, second) =>
        second.critical - first.critical ||
        second.high - first.high ||
        second.medium - first.medium ||
        second.averageScore - first.averageScore ||
        first.packId.localeCompare(second.packId),
    );
}

export function createStyleDnaCompletenessAuditReport(
  records: PresetRecordLike[],
  options: StyleDnaCompletenessAuditOptions = {},
): StyleDnaCompletenessAuditReport {
  const selected = records.filter((record) =>
    options.packId ? record.manifest.packId === options.packId : true,
  );
  const allFindings = selected.map(analyzeManifest).sort(sortFindings);
  const severityCounts: Record<StyleDnaCompletenessSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    clean: 0,
  };

  for (const finding of allFindings) {
    severityCounts[finding.severity] += 1;
  }

  const minRank = SEVERITY_RANK[options.minSeverity ?? 'low'];
  const findings = allFindings
    .filter((finding) => SEVERITY_RANK[finding.severity] >= minRank)
    .slice(0, options.limit ?? 80);

  return {
    totalPresets: selected.length,
    severityCounts,
    packSummaries: summarizePack(allFindings),
    findings,
  };
}

export function formatStyleDnaCompletenessAuditMarkdown(report: StyleDnaCompletenessAuditReport) {
  const lines: string[] = [
    '# Style Preset DNA Completeness Audit',
    '',
    `Presets audited: ${report.totalPresets}`,
    '',
    '| Severity | Count |',
    '| --- | ---: |',
    `| Critical | ${report.severityCounts.critical} |`,
    `| High | ${report.severityCounts.high} |`,
    `| Medium | ${report.severityCounts.medium} |`,
    `| Low | ${report.severityCounts.low} |`,
    `| Clean | ${report.severityCounts.clean} |`,
    '',
    '## Pack Risk',
    '',
    '| Pack | Presets | Critical | High | Medium | Low | Clean | Avg score | Incomplete required fields | Generic fields |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const pack of report.packSummaries) {
    lines.push(
      `| ${pack.packId} | ${pack.presets} | ${pack.critical} | ${pack.high} | ${pack.medium} | ${pack.low} | ${pack.clean} | ${pack.averageScore.toFixed(2)} | ${pack.incompleteRequiredFields} | ${pack.genericFields} |`,
    );
  }

  lines.push('', '## Top Findings', '');

  for (const finding of report.findings) {
    lines.push(
      `### ${finding.id} - ${finding.name}`,
      '',
      `- Pack/category: ${finding.packId} / ${finding.category}`,
      `- Severity: ${finding.severity} (${finding.score})`,
      `- Required field coverage: ${finding.fieldCoverage}`,
      `- Recommended action: ${finding.recommendedAction}`,
      `- File: ${finding.filePath}`,
      '',
    );

    for (const issue of finding.issues.slice(0, 8)) {
      lines.push(
        `  - ${issue.kind} in ${issue.field}: ${issue.reason} Evidence: "${issue.evidence}"`,
      );
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function parseMinSeverity(): StyleDnaCompletenessSeverity {
  const raw = argValue('min-severity') as StyleDnaCompletenessSeverity | undefined;
  return raw && raw in SEVERITY_RANK ? raw : 'low';
}

if (import.meta.main) {
  const packId = argValue('pack');
  const limitRaw = Number(argValue('limit') ?? '80');
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, limitRaw)) : 80;
  const asJson = process.argv.includes('--json');
  const records = await loadStylePresetManifestRecords();
  const report = createStyleDnaCompletenessAuditReport(records, {
    packId,
    minSeverity: parseMinSeverity(),
    limit,
  });

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatStyleDnaCompletenessAuditMarkdown(report));
  }
}
