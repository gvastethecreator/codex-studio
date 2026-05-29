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

export interface JobInspectorRequestModel {
  blocks: JobInspectorTextBlock[];
  facts: JobInspectorFact[];
  referenceArtifacts: JobInspectorArtifact[];
}

export interface JobInspectorDetailModel {
  prompt: JobInspectorPromptModel;
  request: JobInspectorRequestModel;
  timeline: JobInspectorTimelineItem[];
  outputs: JobInspectorArtifact[];
  artifacts: JobInspectorArtifact[];
  stats: {
    transcriptCount: number;
    rawTranscriptCount: number;
    collapsedTranscriptCount: number;
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
const PROMPT_REFERENCE_PATH_RE =
  /Reference image:\s*([^\n\r]+?\.(?:avif|gif|jpe?g|png|svg|webp))/gi;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;
const DATA_IMAGE_RE = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{128,}/g;
const JSON_LIKE_RE = /^[\[{]/;
const MAX_FACTS = 8;
const MAX_RAW_JSON_LENGTH = 16_000;
const MAX_DATA_URL_PREVIEW_LENGTH = 80_000;
const OPAQUE_PAYLOAD_RE = /^[A-Za-z0-9+/=_-]+$/;

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

function normalizeOpaquePayloadCandidate(value: string) {
  return value.replace(/\s+/g, '');
}

function isLikelyWrappedOpaquePayload(value: string, normalized: string) {
  if (!/\s/.test(value)) return true;

  const segments = value.trim().split(/\s+/).filter(Boolean);

  if (segments.length === 0) return false;

  const longSegments = segments.filter((segment) => segment.length >= 32);
  return longSegments.length >= Math.min(segments.length, 3) && normalized.length >= 256;
}

function isLikelyBase64Payload(value: string) {
  const trimmed = value.trim();
  const normalized = normalizeOpaquePayloadCandidate(trimmed);
  if (normalized.length < 256) return false;
  if (normalized.includes('://') || normalized.includes('/library/')) return false;
  if (!OPAQUE_PAYLOAD_RE.test(normalized)) return false;
  return isLikelyWrappedOpaquePayload(trimmed, normalized);
}

function estimatePayloadKilobytes(value: string) {
  const trimmed = value.trim();
  const payload = isInlineImageDataUrl(trimmed)
    ? trimmed.split(',').slice(1).join(',')
    : normalizeOpaquePayloadCandidate(trimmed);
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

  for (const match of text.matchAll(PROMPT_REFERENCE_PATH_RE)) {
    if (match[1]) refs.push(match[1]);
  }

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

function resolveLibraryRelativePathFromLocalReference(reference: string) {
  const normalized = reference.trim().replaceAll('\\', '/');
  return normalized.match(/((?:\.studio|outputs|references|masks|transcripts|assets)\/.*)$/i)?.[1];
}

function resolveLibraryHrefFromLocalReference(reference: string, assetBaseUrl: string) {
  const libraryRelative = resolveLibraryRelativePathFromLocalReference(reference);
  if (!libraryRelative) return null;
  const encodedRelative = encodeURIComponent(libraryRelative).replaceAll('%2F', '/');
  return joinBaseUrl(assetBaseUrl, `library/${encodedRelative}`);
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

  const localLibraryHref = resolveLibraryHrefFromLocalReference(reference, assetBaseUrl);
  if (localLibraryHref) return localLibraryHref;

  return null;
}

function buildArtifact(
  reference: string,
  sourceLabel: string,
  assetBaseUrl: string,
): JobInspectorArtifact {
  const href = resolveArtifactHref(reference, assetBaseUrl);
  const kind =
    href && isPreviewableImageHref(href) ? ('image' as const) : getArtifactKind(reference);
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

function resolveTaskAssetPublicUrl(
  asset: {
    localPath?: string | null;
    sourceUrl?: string | null;
    dataUrl?: string | null;
  },
  assetBaseUrl: string,
) {
  const localPath = asset.localPath?.trim();
  if (localPath) {
    const localLibraryHref = resolveLibraryHrefFromLocalReference(localPath, assetBaseUrl);
    if (localLibraryHref) return localLibraryHref;
  }

  const sourceUrl = asset.sourceUrl?.trim();
  if (sourceUrl) return sourceUrl;

  const dataUrl = asset.dataUrl?.trim();
  if (dataUrl) return dataUrl;

  return null;
}

function isPreviewableImageHref(href: string) {
  return href.startsWith('data:image/') || IMAGE_FILE_RE.test(href);
}

function buildTaskAssetArtifact(
  asset: JobDetailResponse['job']['sourceSpec'] extends infer T
    ? T extends { assets: infer U }
      ? U extends Array<infer A>
        ? A
        : never
      : never
    : never,
  index: number,
  assetBaseUrl: string,
) {
  const href = resolveTaskAssetPublicUrl(asset, assetBaseUrl);
  const previewSrc = href && isPreviewableImageHref(href) ? href : null;
  const label = asset.name?.trim() || `Reference ${index + 1}`;
  const valueParts = [asset.role, asset.strength != null ? `strength ${asset.strength}` : null]
    .filter(Boolean)
    .join(' · ');

  return {
    id: `task-asset:${asset.role}:${index}:${asset.name}`,
    kind: href && isPreviewableImageHref(href) ? ('image' as const) : ('file' as const),
    label,
    value: valueParts || asset.localPath || asset.sourceUrl || 'Task asset',
    href,
    previewSrc,
    sourceLabel: asset.role === 'reference' ? 'reference image' : asset.role,
  } satisfies JobInspectorArtifact;
}

function buildReferenceArtifacts(
  assets: JobDetailResponse['job']['sourceSpec'] extends infer T
    ? T extends { assets: infer U }
      ? U extends Array<infer A>
        ? A[]
        : never
      : never
    : never,
  assetBaseUrl: string,
) {
  const artifacts: JobInspectorArtifact[] = [];
  let referenceIndex = 0;

  for (const asset of assets) {
    if (asset.role !== 'reference') continue;

    const artifact = buildTaskAssetArtifact(asset, referenceIndex, assetBaseUrl);
    referenceIndex += 1;

    if (!artifact.previewSrc && !artifact.href) continue;
    artifacts.push(artifact);
  }

  return artifacts;
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

function summarizeAssetNames(
  assets: JobDetailResponse['job']['sourceSpec'] extends infer T
    ? T extends { assets: infer U }
      ? U extends Array<infer A>
        ? A[]
        : never
      : never
    : never,
  role: string,
) {
  const roleAssets = assets.filter((asset) => asset.role === role);
  if (roleAssets.length === 0) return '—';

  const names: string[] = [];
  for (const asset of roleAssets) {
    if (!asset.name) continue;
    names.push(asset.name);
  }

  if (names.length === 0) return '—';
  const preview = names.slice(0, 3).join(', ');
  if (names.length <= 3) return preview;
  return `${preview} (+${names.length - 3} more)`;
}

function createRequestModel(
  detail: JobDetailResponse,
  assetBaseUrl: string,
): JobInspectorRequestModel {
  const sourceSpec = detail.job.sourceSpec;
  if (!sourceSpec) {
    return {
      blocks: [],
      referenceArtifacts: [],
      facts: [
        { label: 'Request source', value: 'No Generation Task Spec was stored for this job.' },
      ],
    };
  }

  const sourcePrompt = sourceSpec.prompt?.trim() ?? '';
  const finalPrompt = detail.job.finalPromptUsed?.trim() || detail.job.originalPrompt?.trim() || '';
  const promptMatchesSource = sourcePrompt ? sourcePrompt === finalPrompt : null;
  const assets = sourceSpec.assets ?? [];
  const inputCount = assets.filter((asset) => asset.role === 'input').length;
  const maskCount = assets.filter((asset) => asset.role === 'mask').length;
  const referenceCount = assets.filter((asset) => asset.role === 'reference').length;
  const controlCount = assets.filter((asset) => asset.role === 'control').length;
  const externalOutputCount = assets.filter((asset) => asset.role === 'external_output').length;
  const referenceArtifactsFromAssets = buildReferenceArtifacts(assets, assetBaseUrl);
  const referenceArtifactsFromPrompt = extractArtifacts(
    [detail.job.finalPromptUsed, sourcePrompt],
    'reference image',
    assetBaseUrl,
  ).filter((artifact) => artifact.kind === 'image' && Boolean(artifact.href));

  const referenceArtifacts = dedupeArtifacts([
    ...referenceArtifactsFromAssets,
    ...referenceArtifactsFromPrompt,
  ]).sort((left, right) => {
    const leftIsData = left.href?.startsWith('data:') ? 1 : 0;
    const rightIsData = right.href?.startsWith('data:') ? 1 : 0;
    return leftIsData - rightIsData;
  });

  const blocks: JobInspectorTextBlock[] = [];
  if (sourcePrompt) {
    blocks.push({
      kind: 'paragraph',
      text: sourcePrompt,
    });
  }

  return {
    blocks,
    referenceArtifacts,
    facts: [
      { label: 'Task', value: sourceSpec.task },
      { label: 'Provider', value: sourceSpec.providerId ?? detail.job.providerId ?? '—' },
      {
        label: 'Prompt matches source spec',
        value: promptMatchesSource == null ? '—' : promptMatchesSource ? 'Yes' : 'No',
      },
      { label: 'Source prompt chars', value: String(sourcePrompt.length) },
      { label: 'Final prompt chars', value: String(finalPrompt.length) },
      { label: 'Assets sent', value: String(assets.length) },
      { label: 'Input assets', value: String(inputCount) },
      { label: 'Mask assets', value: String(maskCount) },
      { label: 'Reference assets', value: String(referenceCount) },
      { label: 'Control assets', value: String(controlCount) },
      { label: 'External output assets', value: String(externalOutputCount) },
      { label: 'Input names', value: summarizeAssetNames(assets, 'input') },
      { label: 'Mask names', value: summarizeAssetNames(assets, 'mask') },
      { label: 'Reference names', value: summarizeAssetNames(assets, 'reference') },
    ],
  };
}

function readTranscriptMethod(entry: JobTranscriptEntry) {
  return isRecordLike(entry.raw) && typeof entry.raw.method === 'string' ? entry.raw.method : null;
}

function readTranscriptParams(entry: JobTranscriptEntry) {
  if (!isRecordLike(entry.raw)) return null;
  return isRecordLike(entry.raw.params) ? entry.raw.params : null;
}

function readTranscriptItemId(entry: JobTranscriptEntry) {
  const params = readTranscriptParams(entry);
  if (!params) return null;

  if (typeof params.itemId === 'string' && params.itemId.trim()) {
    return params.itemId.trim();
  }

  const item = isRecordLike(params.item) ? params.item : null;
  return typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : null;
}

function readCompletedTranscriptItemId(entry: JobTranscriptEntry) {
  const method = readTranscriptMethod(entry);
  if (!method || !method.endsWith('/completed')) return null;
  return readTranscriptItemId(entry);
}

function readTextFromUnknown(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => readTextFromUnknown(item)).join('');
  if (!isRecordLike(value)) return '';

  return [value.text, value.content, value.reasoning, value.output, value.delta, value.value]
    .map((item) => readTextFromUnknown(item))
    .join('');
}

function readTranscriptDeltaText(entry: JobTranscriptEntry) {
  const params = readTranscriptParams(entry);
  if (!params) return '';
  return readTextFromUnknown(params.delta);
}

function inferTranscriptDeltaPresentation(method: string) {
  const normalized = method.toLowerCase();

  if (normalized.includes('agentmessage') || normalized.includes('message')) {
    return {
      kind: 'message' as const,
      label: 'Assistant',
      source: 'item/agentMessage/stream',
    };
  }

  if (normalized.includes('reason')) {
    return {
      kind: 'reasoning' as const,
      label: 'Thinking',
      source: 'item/reasoning/stream',
    };
  }

  if (normalized.includes('tool')) {
    return {
      kind: 'tool' as const,
      label: 'Tool',
      source: 'item/tool/stream',
    };
  }

  return {
    kind: 'event' as const,
    label: 'Streaming update',
    source: method.replace(/\/delta$/i, '/stream'),
  };
}

function compactTranscriptEntries(entries: JobTranscriptEntry[]) {
  const completedItemIds = new Set<string>();
  for (const entry of entries) {
    const itemId = readCompletedTranscriptItemId(entry);
    if (!itemId) continue;
    completedItemIds.add(itemId);
  }

  const compacted: JobTranscriptEntry[] = [];
  let pendingDeltaGroup: {
    itemId: string;
    method: string;
    entryIds: string[];
    timestamp: string | null;
    textParts: string[];
    kind: JobTranscriptEntry['kind'];
    label: string;
    source: string;
  } | null = null;

  const flushPendingDeltaGroup = () => {
    if (!pendingDeltaGroup) return;

    const combinedText = compactReadableText(pendingDeltaGroup.textParts.join('')).trim();
    if (combinedText) {
      compacted.push({
        id: pendingDeltaGroup.entryIds.join('+'),
        kind: pendingDeltaGroup.kind,
        label: pendingDeltaGroup.label,
        text: combinedText,
        source: pendingDeltaGroup.source,
        timestamp: pendingDeltaGroup.timestamp,
        raw: null,
      });
    }

    pendingDeltaGroup = null;
  };

  for (const entry of entries) {
    const method = readTranscriptMethod(entry);
    const isDeltaEntry = Boolean(method?.endsWith('/delta'));
    const itemId = isDeltaEntry ? readTranscriptItemId(entry) : null;

    if (!isDeltaEntry || !itemId || !method) {
      flushPendingDeltaGroup();
      compacted.push(entry);
      continue;
    }

    if (completedItemIds.has(itemId)) {
      flushPendingDeltaGroup();
      continue;
    }

    if (
      !pendingDeltaGroup ||
      pendingDeltaGroup.itemId !== itemId ||
      pendingDeltaGroup.method !== method
    ) {
      flushPendingDeltaGroup();
      const presentation = inferTranscriptDeltaPresentation(method);
      pendingDeltaGroup = {
        itemId,
        method,
        entryIds: [],
        timestamp: entry.timestamp,
        textParts: [],
        kind: presentation.kind,
        label: presentation.label,
        source: presentation.source,
      };
    }

    pendingDeltaGroup.entryIds.push(entry.id);
    pendingDeltaGroup.textParts.push(readTranscriptDeltaText(entry));
  }

  flushPendingDeltaGroup();

  return {
    entries: compacted,
    collapsedCount: Math.max(0, entries.length - compacted.length),
  };
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
  const assetBaseUrl = options.assetBaseUrl ?? 'http://localhost:17223';
  const promptText = detail.job.finalPromptUsed || detail.job.originalPrompt;
  const outputs = dedupeArtifacts(buildCatalogOutputArtifacts(detail.catalogImages, assetBaseUrl));
  const compactedTranscript = compactTranscriptEntries(detail.transcriptEntries);
  const timeline = [
    ...compactedTranscript.entries.map((entry, index) =>
      createTranscriptTimelineItem(entry, index, assetBaseUrl),
    ),
    ...detail.events.map((event, index) => createEventTimelineItem(event, index, assetBaseUrl)),
  ].sort(compareTimelineItems);

  const timelineArtifacts = timeline.reduce<JobInspectorArtifact[]>((collected, item) => {
    collected.push(...item.artifacts);
    return collected;
  }, []);

  const artifacts = dedupeArtifacts(timelineArtifacts).filter(
    (artifact) => !outputs.some((output) => output.href && output.href === artifact.href),
  );

  return {
    prompt: createPromptModel(promptText),
    request: createRequestModel(detail, assetBaseUrl),
    timeline,
    outputs,
    artifacts,
    stats: {
      transcriptCount: compactedTranscript.entries.length,
      rawTranscriptCount: detail.transcriptEntries.length,
      collapsedTranscriptCount: compactedTranscript.collapsedCount,
      eventCount: detail.events.length,
      outputCount: outputs.length,
      artifactCount: artifacts.length,
    },
  };
}
