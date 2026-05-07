import { existsSync, readFileSync } from 'node:fs';
import type { JobDetailResponse, JobTranscriptEntry } from '../../../packages/shared/src';

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

export async function getJobDetail(jobId: string): Promise<JobDetailResponse | null> {
  const { getCodexTurnByJobId, getJob, listJobEvents } = await import('./db');
  const job = getJob(jobId);
  if (!job) return null;

  const turn = getCodexTurnByJobId(jobId);
  const events = listJobEvents(jobId);
  const transcriptEntries =
    turn?.transcriptPath && existsSync(turn.transcriptPath)
      ? parseJobTranscript(readFileSync(turn.transcriptPath, 'utf8')).slice(-120)
      : [];

  return {
    job,
    events,
    turn,
    transcriptEntries,
  };
}