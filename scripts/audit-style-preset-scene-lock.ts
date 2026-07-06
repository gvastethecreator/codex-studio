import path from 'node:path';

import type { StylePresetManifest } from '../components/recipes/styles/manifestTypes';
import { loadStylePresetManifestRecords } from './style-manifest-files';

export type StyleSceneLockSeverity = 'critical' | 'high' | 'medium' | 'low' | 'clean';

export type StyleSceneLockIssueKind =
  | 'fixed_subject'
  | 'fixed_scene'
  | 'card_composition'
  | 'prop_bundle'
  | 'router_weakness';

export interface StyleSceneLockIssue {
  kind: StyleSceneLockIssueKind;
  field: string;
  weight: number;
  evidence: string;
  reason: string;
}

export interface StyleSceneLockPresetFinding {
  id: string;
  packId: string;
  name: string;
  category: string;
  filePath: string;
  score: number;
  severity: StyleSceneLockSeverity;
  confidence: 'high' | 'medium' | 'low';
  transferabilitySignals: string[];
  issues: StyleSceneLockIssue[];
  recommendedAction: string;
}

export interface StyleSceneLockPackSummary {
  packId: string;
  presets: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  clean: number;
  averageScore: number;
}

export interface StyleSceneLockAuditReport {
  totalPresets: number;
  severityCounts: Record<StyleSceneLockSeverity, number>;
  packSummaries: StyleSceneLockPackSummary[];
  findings: StyleSceneLockPresetFinding[];
}

export interface StyleSceneLockAuditOptions {
  packId?: string;
  minSeverity?: StyleSceneLockSeverity;
  limit?: number;
}

interface PresetRecordLike {
  filePath: string;
  manifest: StylePresetManifest;
}

interface PatternDefinition {
  pattern: RegExp;
  reason: string;
}

const SEVERITY_RANK: Record<StyleSceneLockSeverity, number> = {
  clean: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const TRANSFERABILITY_PATTERNS: PatternDefinition[] = [
  { pattern: /\btransferable\b/i, reason: 'transferable' },
  { pattern: /\breusable\b/i, reason: 'reusable' },
  { pattern: /\bany subject\b/i, reason: 'any subject' },
  { pattern: /\bacross subjects?\b/i, reason: 'across subjects' },
  { pattern: /\bbeyond one literal scene\b/i, reason: 'beyond one literal scene' },
  { pattern: /\bnot a fixed scene\b/i, reason: 'not a fixed scene' },
  { pattern: /\bwithout requiring\b/i, reason: 'without requiring' },
  { pattern: /\bno mandatory subject\b/i, reason: 'no mandatory subject' },
  { pattern: /\bstyle mechanics\b/i, reason: 'style mechanics' },
  { pattern: /\bvisual system\b/i, reason: 'visual system' },
  { pattern: /\brather than a specific\b/i, reason: 'rather than a specific' },
];

const ACTION_PATTERNS = [
  'holding',
  'wearing',
  'standing',
  'sitting',
  'crawling',
  'coiled',
  'riding',
  'carrying',
  'emerging',
  'kneeling',
  'walking',
  'running',
  'fighting',
  'looking',
  'surrounded',
  'posed',
  'placed',
  'tied',
  'visible',
] as const;

const SUBJECT_NOUN_PATTERNS = [
  'guardian',
  'beast',
  'creature',
  'monster',
  'wolf',
  'fox',
  'bird',
  'owl',
  'wyrm',
  'dragon',
  'familiar',
  'knight',
  'warrior',
  'soldier',
  'witch',
  'doctor',
  'rider',
  'hero',
  'villain',
  'girl',
  'boy',
  'figure',
  'animal',
  'robot',
  'mecha',
  'mask',
  'armor',
  'ship',
  'vehicle',
] as const;

const SCENE_NOUN_PATTERNS = [
  'chapel',
  'castle',
  'rampart',
  'ruin',
  'shrine',
  'dungeon',
  'court',
  'alley',
  'street',
  'temple',
  'city',
  'battlefield',
  'school',
  'ship',
  'arena',
  'room',
  'forest',
  'desert',
  'kitchen',
  'laboratory',
  'beach',
  'skyline',
  'cathedral',
  'market',
  'village',
  'station',
] as const;

const CARD_COMPOSITION_PATTERNS: PatternDefinition[] = [
  { pattern: /\bmonster-card crop\b/i, reason: 'monster-card crop' },
  { pattern: /\boracle-card crop\b/i, reason: 'oracle-card crop' },
  { pattern: /\bthumbnail\b/i, reason: 'thumbnail wording' },
  { pattern: /\bforeground\b/i, reason: 'foreground prop staging' },
  { pattern: /\bbackground\b/i, reason: 'background staging' },
  { pattern: /\bbehind\b/i, reason: 'fixed backdrop staging' },
  { pattern: /\btiny .* for scale\b/i, reason: 'scale-prop staging' },
  { pattern: /\bone (creature|figure|character|beast|animal)\b/i, reason: 'fixed subject count' },
  { pattern: /\bcentered .* crop\b/i, reason: 'fixed crop' },
  { pattern: /\bdiagonal .* body\b/i, reason: 'fixed body placement' },
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

function fieldValue(manifest: StylePresetManifest, key: string) {
  const value = manifest.visualDna[key];
  return typeof value === 'string' ? value.trim() : '';
}

function shortEvidence(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed.length <= 150 ? trimmed : `${trimmed.slice(0, 147)}...`;
}

function countMatches(text: string, words: readonly string[]) {
  const normalized = normalizeText(text);
  return words.reduce((count, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return count + (new RegExp(`\\b${escaped}\\w*\\b`, 'i').test(normalized) ? 1 : 0);
  }, 0);
}

function collectTransferabilitySignals(manifest: StylePresetManifest) {
  const text = [
    fieldValue(manifest, 'aesthetic'),
    fieldValue(manifest, 'subject_treatment'),
    fieldValue(manifest, 'camera_and_composition'),
    fieldValue(manifest, 'creative_brief'),
  ].join(' ');

  return TRANSFERABILITY_PATTERNS.flatMap((definition) =>
    definition.pattern.test(text) ? [definition.reason] : [],
  );
}

function analyzeSubjectTreatment(manifest: StylePresetManifest): StyleSceneLockIssue[] {
  const subject = fieldValue(manifest, 'subject_treatment');
  if (!subject) return [];

  const startsAsFixedEntity = /^(a|an|the|one|single|two|three)\s+[a-z0-9-]+/i.test(subject);
  const subjectCues = countMatches(subject, SUBJECT_NOUN_PATTERNS);
  const actionCues = countMatches(subject, ACTION_PATTERNS);
  const sceneCues = countMatches(subject, SCENE_NOUN_PATTERNS);
  const colonList = /:\s*[a-z0-9-]+/i.test(subject);
  const commaCount = (subject.match(/,/g) ?? []).length;
  const issues: StyleSceneLockIssue[] = [];

  if ((startsAsFixedEntity || colonList) && subjectCues > 0 && (actionCues > 0 || sceneCues > 0)) {
    issues.push({
      kind: 'fixed_subject',
      field: 'visualDna.subject_treatment',
      weight: 5,
      evidence: shortEvidence(subject),
      reason:
        'Subject treatment describes a concrete entity instead of how any prompt subject is transformed.',
    });
  }

  if (commaCount >= 3 && subjectCues + sceneCues + actionCues >= 3) {
    issues.push({
      kind: 'prop_bundle',
      field: 'visualDna.subject_treatment',
      weight: 3,
      evidence: shortEvidence(subject),
      reason:
        'Subject treatment bundles multiple props/actions likely copied from a thumbnail prompt.',
    });
  }

  return issues;
}

function analyzeSceneFields(manifest: StylePresetManifest): StyleSceneLockIssue[] {
  const fields = [
    ['visualDna.aesthetic', fieldValue(manifest, 'aesthetic')],
    ['visualDna.camera_and_composition', fieldValue(manifest, 'camera_and_composition')],
    ['visualDna.texture_and_material', fieldValue(manifest, 'texture_and_material')],
    ['visualDna.atmosphere_and_mood', fieldValue(manifest, 'atmosphere_and_mood')],
    ['visualDna.creative_brief', fieldValue(manifest, 'creative_brief')],
  ] as const;

  const issues: StyleSceneLockIssue[] = [];
  for (const [field, value] of fields) {
    if (!value) continue;
    const sceneCueCount = countMatches(value, SCENE_NOUN_PATTERNS);
    if (sceneCueCount >= 2) {
      issues.push({
        kind: 'fixed_scene',
        field,
        weight: field.endsWith('creative_brief') ? 2 : 3,
        evidence: shortEvidence(value),
        reason: 'Field names a repeated locale/set instead of style mechanics.',
      });
    }
  }

  return issues;
}

function analyzeCardComposition(manifest: StylePresetManifest): StyleSceneLockIssue[] {
  const fields = [
    ['visualDna.camera_and_composition', fieldValue(manifest, 'camera_and_composition')],
    ['visualDna.subject_treatment', fieldValue(manifest, 'subject_treatment')],
  ] as const;
  const issues: StyleSceneLockIssue[] = [];

  for (const [field, value] of fields) {
    if (!value) continue;
    for (const definition of CARD_COMPOSITION_PATTERNS) {
      if (!definition.pattern.test(value)) continue;
      issues.push({
        kind: 'card_composition',
        field,
        weight: 3,
        evidence: shortEvidence(value),
        reason: `Composition leaks card staging: ${definition.reason}.`,
      });
      break;
    }
  }

  return issues;
}

function scoreToSeverity(score: number): StyleSceneLockSeverity {
  if (score >= 11) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  if (score >= 1) return 'low';
  return 'clean';
}

function confidenceForFinding(score: number, issues: StyleSceneLockIssue[]) {
  const issueKinds = new Set(issues.map((issue) => issue.kind));
  if (score >= 8 && issueKinds.size >= 2) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function recommendedActionForFinding(finding: Pick<StyleSceneLockPresetFinding, 'issues'>) {
  const issueKinds = new Set(finding.issues.map((issue) => issue.kind));
  if (issueKinds.has('fixed_subject') || issueKinds.has('prop_bundle')) {
    return 'Rewrite subject_treatment into subject-agnostic transformation rules; move concrete thumbnail subjects into defaultImage only.';
  }
  if (issueKinds.has('card_composition')) {
    return 'Replace card/crop staging with reusable framing grammar unless the style itself is a card/poster medium.';
  }
  if (issueKinds.has('fixed_scene')) {
    return 'Convert named locales/props into texture, lighting, palette, and mood vocabulary.';
  }
  return 'Add explicit transferability language and verify prompt X can survive the preset.';
}

function analyzeManifest(record: PresetRecordLike): StyleSceneLockPresetFinding {
  const { manifest } = record;
  const transferabilitySignals = collectTransferabilitySignals(manifest);
  const issues = [
    ...analyzeSubjectTreatment(manifest),
    ...analyzeSceneFields(manifest),
    ...analyzeCardComposition(manifest),
  ];

  if (transferabilitySignals.length === 0) {
    issues.push({
      kind: 'router_weakness',
      field: 'visualDna.creative_brief',
      weight: 4,
      evidence: shortEvidence(
        fieldValue(manifest, 'creative_brief') || fieldValue(manifest, 'aesthetic'),
      ),
      reason: 'Preset does not state that the style transfers across arbitrary prompt subjects.',
    });
  }

  const transferabilityCredit = Math.min(2, transferabilitySignals.length);
  const rawScore = issues.reduce((score, issue) => score + issue.weight, 0);
  const score = Math.max(0, rawScore - transferabilityCredit);
  const severity = scoreToSeverity(score);
  const partialFinding = { issues };

  return {
    id: manifest.id,
    packId: manifest.packId,
    name: manifest.name,
    category: manifest.category,
    filePath: path.relative(process.cwd(), record.filePath).replace(/\\/g, '/'),
    score,
    severity,
    confidence: confidenceForFinding(score, issues),
    transferabilitySignals,
    issues,
    recommendedAction: recommendedActionForFinding(partialFinding),
  };
}

function sortFindings(first: StyleSceneLockPresetFinding, second: StyleSceneLockPresetFinding) {
  return (
    second.score - first.score ||
    SEVERITY_RANK[second.severity] - SEVERITY_RANK[first.severity] ||
    first.packId.localeCompare(second.packId) ||
    first.id.localeCompare(second.id)
  );
}

export function createStyleSceneLockAuditReport(
  records: PresetRecordLike[],
  options: StyleSceneLockAuditOptions = {},
): StyleSceneLockAuditReport {
  const selected = records.filter((record) =>
    options.packId ? record.manifest.packId === options.packId : true,
  );
  const findings = selected.map(analyzeManifest).sort(sortFindings);

  const severityCounts: Record<StyleSceneLockSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    clean: 0,
  };
  for (const finding of findings) {
    severityCounts[finding.severity] += 1;
  }

  const packMap = new Map<string, StyleSceneLockPackSummary>();
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
      } satisfies StyleSceneLockPackSummary);
    summary.presets += 1;
    summary[finding.severity] += 1;
    summary.averageScore += finding.score;
    packMap.set(finding.packId, summary);
  }

  const packSummaries = [...packMap.values()]
    .map((summary) => ({
      ...summary,
      averageScore: summary.presets === 0 ? 0 : summary.averageScore / summary.presets,
    }))
    .sort(
      (first, second) =>
        second.critical - first.critical ||
        second.high - first.high ||
        second.averageScore - first.averageScore ||
        first.packId.localeCompare(second.packId),
    );

  const minRank = SEVERITY_RANK[options.minSeverity ?? 'low'];
  const limitedFindings = findings
    .filter((finding) => SEVERITY_RANK[finding.severity] >= minRank)
    .slice(0, options.limit ?? 60);

  return {
    totalPresets: selected.length,
    severityCounts,
    packSummaries,
    findings: limitedFindings,
  };
}

export function formatStyleSceneLockAuditMarkdown(report: StyleSceneLockAuditReport) {
  const lines: string[] = [
    '# Style Preset Scene-Lock Audit',
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
    '| Pack | Presets | Critical | High | Medium | Low | Clean | Avg score |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const pack of report.packSummaries) {
    lines.push(
      `| ${pack.packId} | ${pack.presets} | ${pack.critical} | ${pack.high} | ${pack.medium} | ${pack.low} | ${pack.clean} | ${pack.averageScore.toFixed(2)} |`,
    );
  }

  lines.push('', '## Top Findings', '');

  for (const finding of report.findings) {
    const signals =
      finding.transferabilitySignals.length > 0
        ? finding.transferabilitySignals.join(', ')
        : 'none';
    lines.push(
      `### ${finding.id} - ${finding.name}`,
      '',
      `- Pack/category: ${finding.packId} / ${finding.category}`,
      `- Severity: ${finding.severity} (${finding.score}, ${finding.confidence} confidence)`,
      `- Transferability signals: ${signals}`,
      `- Recommended action: ${finding.recommendedAction}`,
      `- File: ${finding.filePath}`,
      '',
    );

    for (const issue of finding.issues.slice(0, 4)) {
      lines.push(
        `  - ${issue.kind} in ${issue.field}: ${issue.reason} Evidence: "${issue.evidence}"`,
      );
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function parseMinSeverity(): StyleSceneLockSeverity {
  const raw = argValue('min-severity') as StyleSceneLockSeverity | undefined;
  return raw && raw in SEVERITY_RANK ? raw : 'low';
}

const isDirectRun = import.meta.main;

if (isDirectRun) {
  const packId = argValue('pack');
  const limitRaw = Number(argValue('limit') ?? '60');
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, limitRaw)) : 60;
  const asJson = process.argv.includes('--json');
  const records = await loadStylePresetManifestRecords();
  const report = createStyleSceneLockAuditReport(records, {
    packId,
    minSeverity: parseMinSeverity(),
    limit,
  });

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatStyleSceneLockAuditMarkdown(report));
  }
}
