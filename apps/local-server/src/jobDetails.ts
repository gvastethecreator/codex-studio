import { closeSync, existsSync, fstatSync, openSync, readFileSync, readSync } from 'node:fs';
import type {
  Job,
  JobDetailResponse,
  JobEventRecord,
  JobMetricSummary,
  JobTokenUsageSummary,
  JobTranscriptEntry,
} from '../../../packages/shared/src';

type RecordLike = Record<string, unknown>;

function isRecordLike(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function coercePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

function findNumberByKeys(record: RecordLike, keys: string[]) {
  for (const key of keys) {
    if (key in record) {
      const value = coercePositiveNumber(record[key]);
      if (value !== null) return value;
    }
  }
  return null;
}

function extractTokenUsage(value: unknown, source: string): JobTokenUsageSummary | null {
  if (!isRecordLike(value)) return null;

  const directInput = findNumberByKeys(value, [
    'inputTokens',
    'input_tokens',
    'promptTokens',
    'prompt_tokens',
  ]);
  const directOutput = findNumberByKeys(value, [
    'outputTokens',
    'output_tokens',
    'completionTokens',
    'completion_tokens',
  ]);
  const directTotal = findNumberByKeys(value, ['totalTokens', 'total_tokens', 'tokens']);

  if (directInput !== null || directOutput !== null || directTotal !== null) {
    return {
      inputTokens: directInput,
      outputTokens: directOutput,
      totalTokens: directTotal ?? (directInput ?? 0) + (directOutput ?? 0),
      source,
    };
  }

  for (const [key, child] of Object.entries(value)) {
    if (/usage|token/i.test(key)) {
      const nested = extractTokenUsage(child, `${source}.${key}`);
      if (nested) return nested;
    }
  }

  for (const [key, child] of Object.entries(value)) {
    if (isRecordLike(child)) {
      const nested = extractTokenUsage(child, `${source}.${key}`);
      if (nested) return nested;
    }
    if (Array.isArray(child)) {
      for (let index = 0; index < child.length; index += 1) {
        const nested = extractTokenUsage(child[index], `${source}.${key}[${index}]`);
        if (nested) return nested;
      }
    }
  }

  return null;
}

function parseDateMs(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function durationBetween(start: string | null | undefined, end: string | null | undefined) {
  const startMs = parseDateMs(start);
  const endMs = parseDateMs(end);
  if (startMs === null || endMs === null || endMs < startMs) return null;
  return endMs - startMs;
}

function getEvent(events: JobEventRecord[], type: string) {
  return events.find((event) => event.type === type) ?? null;
}

function getEventDuration(event: JobEventRecord | null) {
  return coercePositiveNumber(event?.metadata?.durationMs);
}

export function buildJobMetrics(
  job: Job,
  events: JobEventRecord[],
  transcriptEntries: JobTranscriptEntry[],
): JobMetricSummary {
  const startedEvent =
    getEvent(events, 'job.started') ??
    getEvent(events, 'codex.started') ??
    getEvent(events, 'external.started') ??
    getEvent(events, 'dry_run.started');
  const providerCompletedEvent =
    getEvent(events, 'codex.completed') ??
    getEvent(events, 'external.completed') ??
    getEvent(events, 'dry_run.completed');
  const assetEvent = getEvent(events, 'asset.created');
  const totalDurationMs = durationBetween(job.createdAt, job.completedAt ?? job.updatedAt);
  const queuedDurationMs = startedEvent
    ? durationBetween(job.createdAt, startedEvent.createdAt)
    : null;
  const providerDurationMs =
    getEventDuration(providerCompletedEvent) ??
    (startedEvent && providerCompletedEvent
      ? durationBetween(startedEvent.createdAt, providerCompletedEvent.createdAt)
      : null);
  const assetImportDurationMs =
    providerCompletedEvent && assetEvent
      ? durationBetween(providerCompletedEvent.createdAt, assetEvent.createdAt)
      : null;
  const tokenUsage =
    events.map((event) => extractTokenUsage(event.metadata, `event.${event.type}`)).find(Boolean) ??
    transcriptEntries
      .map((entry) => extractTokenUsage(entry.raw, `transcript.${entry.source}`))
      .find(Boolean) ??
    null;

  return {
    timings: [
      { id: 'total', label: 'Total process', durationMs: totalDurationMs },
      { id: 'queued', label: 'Queue wait', durationMs: queuedDurationMs },
      { id: 'provider', label: 'Provider turn', durationMs: providerDurationMs },
      { id: 'asset_import', label: 'Asset import', durationMs: assetImportDurationMs },
    ],
    tokenUsage,
    estimatedPromptTokens: Math.ceil((job.finalPromptUsed || job.originalPrompt).length / 4),
  };
}

function coerceText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => coerceText(entry))
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  if (isRecordLike(value)) {
    const candidates = [
      value.text,
      value.message,
      value.summary,
      value.content,
      value.reasoning,
      value.output,
      value.result,
      value.arguments,
      value.payload,
    ];

    const combined = candidates
      .map((candidate) => coerceText(candidate))
      .filter(Boolean)
      .join('\n')
      .trim();

    if (combined) return combined;
  }

  return '';
}

function inferTranscriptKind(source: string, itemType: string | null) {
  const normalized = `${source} ${itemType ?? ''}`.toLowerCase();

  if (normalized.includes('reason')) {
    return {
      kind: 'reasoning' as const,
      label: 'Thinking',
    };
  }

  if (normalized.includes('tool')) {
    return {
      kind: 'tool' as const,
      label: 'Tool',
    };
  }

  if (itemType === 'agentMessage') {
    return {
      kind: 'message' as const,
      label: 'Assistant',
    };
  }

  if (source.startsWith('turn/')) {
    return {
      kind: 'event' as const,
      label: source.replace('turn/', 'Turn '),
    };
  }

  return {
    kind: 'event' as const,
    label: itemType || source || 'Event',
  };
}

function parseTranscriptLine(rawLine: string, index: number): JobTranscriptEntry | null {
  const trimmedLine = rawLine.trim();
  if (!trimmedLine) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmedLine);
  } catch {
    return {
      id: `line-${index}`,
      kind: 'event',
      label: 'Transcript',
      text: trimmedLine,
      source: 'raw',
      timestamp: null,
      raw: null,
    };
  }

  const message = isRecordLike(parsed) ? parsed : null;
  const params = isRecordLike(message?.params) ? message.params : null;
  const item = isRecordLike(params?.item) ? params.item : null;
  const source = typeof message?.method === 'string' ? message.method : 'notification';
  const itemType = typeof item?.type === 'string' ? item.type : null;
  const meta = inferTranscriptKind(source, itemType);
  const timestamp =
    typeof params?.timestamp === 'string'
      ? params.timestamp
      : typeof item?.createdAt === 'string'
        ? item.createdAt
        : null;

  let text = coerceText(item) || coerceText(params);
  if (!text && source === 'turn/completed') {
    const turn = isRecordLike(params?.turn) ? params.turn : null;
    text = typeof turn?.status === 'string' ? `Turn ${turn.status}` : 'Turn completed';
  }

  if (!text) {
    text = safeStringify(parsed);
  }

  return {
    id: `line-${index}`,
    kind: meta.kind,
    label: meta.label,
    text,
    source,
    timestamp,
    raw: message,
  };
}

export function parseJobTranscript(transcriptText: string) {
  return transcriptText
    .split(/\r?\n/)
    .map((line, index) => parseTranscriptLine(line, index))
    .filter((entry): entry is JobTranscriptEntry => Boolean(entry));
}

function readLastTranscriptLines(
  transcriptPath: string,
  lineLimit: number,
  options: { chunkSize?: number; maxBytes?: number } = {},
) {
  const chunkSize = options.chunkSize ?? 64 * 1024;
  const maxBytes = options.maxBytes ?? 512 * 1024;
  const handle = openSync(transcriptPath, 'r');

  try {
    const fileSize = fstatSync(handle).size;
    if (fileSize <= 0) return '';

    const chunks: string[] = [];
    let cursor = fileSize;
    let bytesReadTotal = 0;
    let newlineCount = 0;

    while (cursor > 0 && newlineCount <= lineLimit && bytesReadTotal < maxBytes) {
      const bytesToRead = Math.min(chunkSize, cursor);
      cursor -= bytesToRead;

      const buffer = Buffer.allocUnsafe(bytesToRead);
      const readCount = readSync(handle, buffer, 0, bytesToRead, cursor);
      if (readCount <= 0) break;

      const textChunk = buffer.toString('utf8', 0, readCount);
      chunks.unshift(textChunk);
      bytesReadTotal += readCount;
      newlineCount += textChunk.match(/\n/g)?.length ?? 0;
    }

    return chunks.join('').split(/\r?\n/).slice(-lineLimit).join('\n');
  } finally {
    closeSync(handle);
  }
}

export async function getJobDetail(jobId: string): Promise<JobDetailResponse | null> {
  const [{ queryCatalog }, { getCodexTurnByJobId, getJob, listJobEvents }] = await Promise.all([
    import('./catalog'),
    import('./db'),
  ]);
  const job = getJob(jobId);
  if (!job) return null;

  const turn = getCodexTurnByJobId(jobId);
  const events = listJobEvents(jobId);
  const catalogImages = queryCatalog({
    jobId,
    isDeleted: false,
    limit: 24,
  }).images;
  const transcriptEntries =
    turn?.transcriptPath && existsSync(turn.transcriptPath)
      ? parseJobTranscript(readLastTranscriptLines(turn.transcriptPath, 180)).slice(-120)
      : [];

  return {
    job,
    events,
    turn,
    transcriptEntries,
    catalogImages,
    metrics: buildJobMetrics(job, events, transcriptEntries),
  };
}
