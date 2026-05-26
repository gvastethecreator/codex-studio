import type {
  CatalogImage,
  JobDetailResponse,
  JobEventRecord,
  JobTranscriptEntry,
} from '../packages/shared/src';

export interface JobInspectorArtifact {
  id: string;
  kind: 'image' | 'link' | 'file';
  label: string;
  value: string;
  href: string | null;
  previewSrc: string | null;
  sourceLabel: string;
}

export interface JobInspectorFact {
  label: string;
  value: string;
}

export interface JobInspectorTextBlock {
  kind: 'paragraph' | 'code';
  text: string;
}

export interface JobInspectorTimelineItem {
  id: string;
  sourceType: 'event' | 'transcript';
  tone: JobTranscriptEntry['kind'];
  title: string;
  badge: string;
  sourceLabel: string;
  timestamp: string | null;
  timestampMs: number | null;
  blocks: JobInspectorTextBlock[];
  facts: JobInspectorFact[];
  artifacts: JobInspectorArtifact[];
  rawJson: string | null;
}

export interface JobInspectorPromptModel {
  blocks: JobInspectorTextBlock[];
  facts: JobInspectorFact[];
  rawJson: string | null;
}

export interface JobInspectorDetailModel {
  prompt: JobInspectorPromptModel;
  timeline: JobInspectorTimelineItem[];
  outputs: JobInspectorArtifact[];
  artifacts: JobInspectorArtifact[];
  stats: {
    transcriptCount: number;
    eventCount: number;
    outputCount: number;
    artifactCount: number;
  };
}

interface BuildJobInspectorDetailModelOptions {
  assetBaseUrl?: string;
}

interface StringReferenceCandidate {
  value: string;
}

interface PrimitiveFactCandidate {
  path: string;
  value: string | number | boolean;
  depth: number;
}

const IMAGE_FILE_RE = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const HTTP_REF_RE = /https?:\/\/[^\s<>")']+/gi;
const LIBRARY_REF_RE = /(?:^|\s)(\/?library\/[^\s<>")']+)/gi;
const WINDOWS_IMAGE_PATH_RE =
  /(?:^|[\s('"`])([a-zA-Z]:[\\/][^\s<>")']+\.(?:avif|gif|jpe?g|png|svg|webp))/g;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;
const DATA_IMAGE_RE = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{128,}/g;
const JSON_LIKE_RE = /^[\[{]/;
const MAX_FACTS = 8;
const MAX_RAW_JSON_LENGTH = 16_000;
const MAX_DATA_URL_PREVIEW_LENGTH = 80_000;

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stripTrailingPunctuation(value: string) {
  return value.replace(/[),.;]+$/g, '');
}

function humanizeLabel(value: string) {
  const segment = value
    .replace(/\[(\d+)\]/g, ' $1 ')
    .split('.')
    .at(-1)
    ?.replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  if (!segment) return 'Value';
  return `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
}

function parseDateMs(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isInlineImageDataUrl(value: string) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value.trim());
}

function isLikelyBase64Payload(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 256 || /\s/.test(trimmed)) return false;
  if (trimmed.includes('://') || trimmed.includes('/library/')) return false;
  return /^[A-Za-z0-9+/=]+$/.test(trimmed);
}

function estimatePayloadKilobytes(value: string) {
  const trimmed = value.trim();
  const payload = isInlineImageDataUrl(trimmed) ? trimmed.split(',').slice(1).join(',') : trimmed;
  return Math.max(1, Math.round((payload.length * 3) / 4 / 1024));
}

function summarizeLargePayload(value: string) {
  if (isInlineImageDataUrl(value)) {
    return `Embedded image payload (~${estimatePayloadKilobytes(value)} KB)`;
  }

  if (isLikelyBase64Payload(value)) {
    return `Binary payload (~${estimatePayloadKilobytes(value)} KB)`;
  }

  return value;
}

function compactReadableText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (isInlineImageDataUrl(trimmed) || isLikelyBase64Payload(trimmed)) {
    return summarizeLargePayload(trimmed);
  }

  return text.replace(DATA_IMAGE_RE, (match) => summarizeLargePayload(match));
}

function sanitizeStructuredValue(value: unknown, seen = new Set<unknown>(), depth = 0): unknown {
  if (value == null || depth > 5) return value;

  if (typeof value === 'string') {
    return summarizeLargePayload(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 24).map((entry) => sanitizeStructuredValue(entry, seen, depth + 1));
  }

  if (!isRecordLike(value) || seen.has(value)) return value;
  seen.add(value);

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 40)
      .map(([key, entry]) => [key, sanitizeStructuredValue(entry, seen, depth + 1)]),
  );
}

function safePrettyJson(value: unknown) {
  try {
    const serialized = JSON.stringify(sanitizeStructuredValue(value), null, 2);
    if (!serialized) return null;
    if (serialized.length <= MAX_RAW_JSON_LENGTH) {
      return serialized;
    }
    return `${serialized.slice(0, MAX_RAW_JSON_LENGTH)}\n… truncated for readability …`;
  } catch {
    return null;
  }
}

function parseStructuredText(text: string) {
  const trimmed = text.trim();
  if (!trimmed || !JSON_LIKE_RE.test(trimmed)) return null;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function splitIntoBlocks(text: string): JobInspectorTextBlock[] {
  const compacted = compactReadableText(text);
  const trimmed = compacted.trim();
  if (!trimmed) return [];

  return trimmed
    .split(/\n{2,}/)
    .flatMap((block) => {
      const trimmedBlock = block.trim();
      return trimmedBlock ? [trimmedBlock] : [];
    })
    .map((block) => ({
      kind: block.split('\n').length >= 4 && /[{}[\]:]/.test(block) ? 'code' : 'paragraph',
      text: block,
    }));
}

function stringifyPrimitive(value: string | number | boolean) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function formatFactValue(path: string, value: string | number | boolean) {
  if (typeof value === 'string' && (isInlineImageDataUrl(value) || isLikelyBase64Payload(value))) {
    return summarizeLargePayload(value);
  }

  if (typeof value === 'number' && /duration|ms/i.test(path)) {
    if (value < 1000) return `${Math.round(value)}ms`;
    const seconds = value / 1000;
    return seconds < 60 ? `${seconds.toFixed(1)}s` : `${(seconds / 60).toFixed(1)}m`;
  }

  const text = stringifyPrimitive(value).trim();
  if (!text) return '—';
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

function collectPrimitiveFacts(
  value: unknown,
  path = 'root',
  depth = 0,
  output: PrimitiveFactCandidate[] = [],
  seen = new Set<unknown>(),
) {
  if (value == null || output.length >= 40 || depth > 3) return output;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    if (trimmed !== '' && trimmed !== null) {
      output.push({ path, value: trimmed as string | number | boolean, depth });
    }
    return output;
  }

  if (Array.isArray(value)) {
    const primitives = value.filter(
      (entry) =>
        typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean',
    );

    if (primitives.length > 0) {
      output.push({
        path,
        value: primitives.slice(0, 4).join(', '),
        depth,
      });
      return output;
    }

    value.slice(0, 8).forEach((entry, index) => {
      collectPrimitiveFacts(entry, `${path}[${index}]`, depth + 1, output, seen);
    });

    return output;
  }

  if (!isRecordLike(value) || seen.has(value)) return output;
  seen.add(value);

  Object.entries(value)
    .slice(0, 20)
    .forEach(([key, entry]) => {
      collectPrimitiveFacts(
        entry,
        path === 'root' ? key : `${path}.${key}`,
        depth + 1,
        output,
        seen,
      );
    });

  return output;
}

function factPriority(path: string, depth: number) {
  if (
    /status|model|provider|service|reasoning|tool|name|duration|token|width|height|size|asset|image|count|thread|turn|path|mime/i.test(
      path,
    )
  ) {
    return 0;
  }

  if (depth <= 1) return 1;
  return 2;
}

function extractFacts(value: unknown) {
  const seen = new Set<string>();
  return collectPrimitiveFacts(value)
    .sort((left, right) => {
      const leftPriority = factPriority(left.path, left.depth);
      const rightPriority = factPriority(right.path, right.depth);
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return left.depth - right.depth;
    })
    .reduce<{ label: string; value: string }[]>((acc, entry) => {
      const label = humanizeLabel(entry.path);
      const formatted = formatFactValue(entry.path, entry.value);
      const key = `${label}:${formatted}`;
      if (seen.has(key) || formatted === '—') return acc;
      seen.add(key);
      acc.push({ label, value: formatted });
      return acc;
    }, [])
    .slice(0, MAX_FACTS);
}

function collectStringCandidates(
  value: unknown,
  output: StringReferenceCandidate[] = [],
  seen = new Set<unknown>(),
  depth = 0,
) {
  if (value == null || output.length >= 80 || depth > 4) return output;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) output.push({ value: trimmed });
    return output;
  }

  if (Array.isArray(value)) {
    value.slice(0, 16).forEach((entry) => collectStringCandidates(entry, output, seen, depth + 1));
    return output;
  }

  if (!isRecordLike(value) || seen.has(value)) return output;
  seen.add(value);

  Object.values(value)
    .slice(0, 24)
    .forEach((entry) => collectStringCandidates(entry, output, seen, depth + 1));

  return output;
}

function extractReferenceValuesFromText(text: string) {
  const refs: string[] = [];

  for (const match of text.matchAll(MARKDOWN_IMAGE_RE)) {
    if (match[1]) refs.push(match[1]);
  }

  for (const match of text.matchAll(HTTP_REF_RE)) {
    refs.push(match[0]);
  }

  for (const match of text.matchAll(WINDOWS_IMAGE_PATH_RE)) {
    if (match[1]) refs.push(match[1]);
  }

  if (text.startsWith('data:image/')) {
    refs.push(text);
  }

  LIBRARY_REF_RE.lastIndex = 0;
  let libraryMatch: RegExpExecArray | null;
  while ((libraryMatch = LIBRARY_REF_RE.exec(text)) !== null) {
    if (libraryMatch[1]) refs.push(libraryMatch[1]);
  }

  return refs.flatMap((value) => {
    const stripped = stripTrailingPunctuation(value.trim());
    return stripped ? [stripped] : [];
  });
}

function joinBaseUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getArtifactKind(reference: string) {
  if (reference.startsWith('data:image/')) return 'image' as const;
  if (reference.startsWith('http://') || reference.startsWith('https://')) {
    return IMAGE_FILE_RE.test(reference) ? ('image' as const) : ('link' as const);
  }
  if (reference.startsWith('/library/') || reference.startsWith('library/')) {
    return IMAGE_FILE_RE.test(reference) ? ('image' as const) : ('file' as const);
  }
  if (/^[a-zA-Z]:[\\/]/.test(reference) || IMAGE_FILE_RE.test(reference)) {
    return 'file' as const;
  }
  return 'link' as const;
}

function deriveArtifactLabel(reference: string) {
  if (reference.startsWith('data:image/')) return 'Embedded image';

  if (reference.startsWith('http://') || reference.startsWith('https://')) {
    try {
      const url = new URL(reference);
      const pathnameLabel = decodeURIComponent(
        url.pathname.split('/').filter(Boolean).at(-1) || 'Remote asset',
      );
      return pathnameLabel || url.hostname;
    } catch {
      return 'Remote asset';
    }
  }

  const normalized = reference.replace(/\\/g, '/');
  return decodeURIComponent(normalized.split('/').filter(Boolean).at(-1) || 'Local file');
}

function resolveArtifactHref(reference: string, assetBaseUrl: string) {
  if (reference.startsWith('http://') || reference.startsWith('https://')) return reference;
  if (reference.startsWith('/library/') || reference.startsWith('library/')) {
    return joinBaseUrl(assetBaseUrl, reference.replace(/^\//, ''));
  }
  if (reference.startsWith('data:image/')) return reference;
  return null;
}

function buildArtifact(
  reference: string,
  sourceLabel: string,
  assetBaseUrl: string,
): JobInspectorArtifact {
  const kind = getArtifactKind(reference);
  const href = resolveArtifactHref(reference, assetBaseUrl);
  const previewSrc =
    kind === 'image' &&
    href &&
    (href.length <= MAX_DATA_URL_PREVIEW_LENGTH || !href.startsWith('data:'))
      ? href
      : null;

  return {
    id: `${kind}:${href ?? reference}`,
    kind,
    label: deriveArtifactLabel(reference),
    value: isInlineImageDataUrl(reference)
      ? summarizeLargePayload(reference)
      : reference.length > 160
        ? `${reference.slice(0, 157)}…`
        : reference,
    href,
    previewSrc,
    sourceLabel,
  };
}

function extractArtifacts(value: unknown, sourceLabel: string, assetBaseUrl: string) {
  const seen = new Set<string>();
  const artifacts: JobInspectorArtifact[] = [];

  collectStringCandidates(value).forEach(({ value: candidate }) => {
    extractReferenceValuesFromText(candidate).forEach((reference) => {
      const key = reference.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      artifacts.push(buildArtifact(reference, sourceLabel, assetBaseUrl));
    });
  });

  return artifacts;
}

function dedupeArtifacts(items: JobInspectorArtifact[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.kind}:${item.href ?? item.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveCatalogUrl(url: string | null, assetBaseUrl: string) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return joinBaseUrl(assetBaseUrl, url.replace(/^\//, ''));
}

function summarizeCatalogImage(image: CatalogImage) {
  const parts = [
    image.width && image.height ? `${image.width}×${image.height}` : null,
    image.aspectRatio,
    image.mimeType,
  ].filter(Boolean);

  return parts.join(' · ') || image.publicUrl;
}

function buildCatalogOutputArtifacts(images: CatalogImage[], assetBaseUrl: string) {
  return images.map((image, index) => ({
    id: `catalog:${image.id}`,
    kind: 'image' as const,
    label: image.prompt?.trim()
      ? `Returned image ${index + 1}`
      : deriveArtifactLabel(image.publicUrl),
    value: summarizeCatalogImage(image),
    href: resolveCatalogUrl(image.publicUrl, assetBaseUrl),
    previewSrc: resolveCatalogUrl(image.thumbnailUrl ?? image.publicUrl, assetBaseUrl),
    sourceLabel: 'returned image',
  }));
}

function createPromptModel(promptText: string) {
  const parsedPrompt = parseStructuredText(promptText);
  const sanitizedPrompt = parsedPrompt ? sanitizeStructuredValue(parsedPrompt) : null;
  return {
    blocks: parsedPrompt ? [] : splitIntoBlocks(promptText),
    facts: sanitizedPrompt ? extractFacts(sanitizedPrompt) : [],
    rawJson: sanitizedPrompt ? safePrettyJson(sanitizedPrompt) : null,
  } satisfies JobInspectorPromptModel;
}

function createTranscriptTimelineItem(
  entry: JobTranscriptEntry,
  index: number,
  assetBaseUrl: string,
): JobInspectorTimelineItem {
  const parsedText = parseStructuredText(entry.text);
  const structuredPayload = parsedText ?? entry.raw;
  const sanitizedPayload = structuredPayload ? sanitizeStructuredValue(structuredPayload) : null;

  return {
    id: `transcript:${entry.id}`,
    sourceType: 'transcript',
    tone: entry.kind,
    title: entry.label,
    badge: entry.kind,
    sourceLabel: entry.source,
    timestamp: entry.timestamp,
    timestampMs: parseDateMs(entry.timestamp),
    blocks: parsedText ? [] : splitIntoBlocks(entry.text),
    facts: sanitizedPayload ? extractFacts(sanitizedPayload) : [],
    artifacts: dedupeArtifacts(
      extractArtifacts([entry.text, entry.raw], `Transcript ${index + 1}`, assetBaseUrl),
    ),
    rawJson: sanitizedPayload ? safePrettyJson(sanitizedPayload) : null,
  };
}

function createEventTimelineItem(
  event: JobEventRecord,
  index: number,
  assetBaseUrl: string,
): JobInspectorTimelineItem {
  const parsedMessage = parseStructuredText(event.message);
  const structuredPayload = parsedMessage ?? event.metadata;
  const sanitizedPayload = structuredPayload ? sanitizeStructuredValue(structuredPayload) : null;

  return {
    id: `event:${event.id}`,
    sourceType: 'event',
    tone: 'event',
    title: event.message || humanizeLabel(event.type),
    badge: event.type,
    sourceLabel: 'system event',
    timestamp: event.createdAt,
    timestampMs: parseDateMs(event.createdAt),
    blocks: parsedMessage ? [] : splitIntoBlocks(event.message),
    facts: sanitizedPayload ? extractFacts(sanitizedPayload) : [],
    artifacts: dedupeArtifacts(
      extractArtifacts([event.message, event.metadata], `Event ${index + 1}`, assetBaseUrl),
    ),
    rawJson: sanitizedPayload ? safePrettyJson(sanitizedPayload) : null,
  };
}

function compareTimelineItems(left: JobInspectorTimelineItem, right: JobInspectorTimelineItem) {
  if (
    left.timestampMs !== null &&
    right.timestampMs !== null &&
    left.timestampMs !== right.timestampMs
  ) {
    return left.timestampMs - right.timestampMs;
  }

  if (left.timestampMs !== null && right.timestampMs === null) return -1;
  if (left.timestampMs === null && right.timestampMs !== null) return 1;
  return left.id.localeCompare(right.id);
}

export function buildJobInspectorDetailModel(
  detail: JobDetailResponse,
  options: BuildJobInspectorDetailModelOptions = {},
): JobInspectorDetailModel {
  const assetBaseUrl = options.assetBaseUrl ?? 'http://localhost:4317';
  const promptText = detail.job.finalPromptUsed || detail.job.originalPrompt;
  const outputs = dedupeArtifacts(buildCatalogOutputArtifacts(detail.catalogImages, assetBaseUrl));
  const timeline = [
    ...detail.transcriptEntries.map((entry, index) =>
      createTranscriptTimelineItem(entry, index, assetBaseUrl),
    ),
    ...detail.events.map((event, index) => createEventTimelineItem(event, index, assetBaseUrl)),
  ].sort(compareTimelineItems);

  const artifacts = dedupeArtifacts(timeline.flatMap((item) => item.artifacts)).filter(
    (artifact) => !outputs.some((output) => output.href && output.href === artifact.href),
  );

  return {
    prompt: createPromptModel(promptText),
    timeline,
    outputs,
    artifacts,
    stats: {
      transcriptCount: detail.transcriptEntries.length,
      eventCount: detail.events.length,
      outputCount: outputs.length,
      artifactCount: artifacts.length,
    },
  };
}
