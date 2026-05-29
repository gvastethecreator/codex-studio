import React, { useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  BrainCircuit,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers3,
  Link2,
  MessageSquare,
  RotateCcw,
  Wrench,
} from 'lucide-react';

import type { Job as StudioJob, JobDetailResponse } from '../packages/shared/src';
import {
  buildJobInspectorDetailModel,
  type JobInspectorArtifact,
  type JobInspectorTextBlock,
  type JobInspectorTimelineItem,
} from '../lib/jobInspectorFormatter';
import { cn } from '../lib/utils';
import { getStudioApiBase } from '../services/localStudioService';

interface JobInspectorDetailProps {
  detail: JobDetailResponse;
  onClearSelectedJob: () => void;
  onRetryJob?: (jobId: string) => void;
}

function toneForStatus(status: StudioJob['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
    case 'failed':
    case 'cancelled':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
    case 'needs_review':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-100';
    default:
      return 'border-accent-500/20 bg-accent-500/10 text-accent-200';
  }
}

function toneForTimeline(item: JobInspectorTimelineItem) {
  if (item.sourceType === 'event') {
    return 'border-white/10 bg-white/[0.04] text-zinc-100';
  }

  switch (item.tone) {
    case 'reasoning':
      return 'border-fuchsia-500/20 bg-fuchsia-500/8 text-fuchsia-100';
    case 'tool':
      return 'border-cyan-500/20 bg-cyan-500/8 text-cyan-100';
    case 'message':
      return 'border-emerald-500/20 bg-emerald-500/8 text-emerald-100';
    default:
      return 'border-white/10 bg-white/[0.04] text-zinc-100';
  }
}

function formatDuration(durationMs: number | null) {
  if (durationMs == null) return '—';
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
  const seconds = durationMs / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

function formatTokenCount(value: number | null | undefined) {
  return value == null ? '—' : value.toLocaleString();
}

function findTiming(
  timings: JobDetailResponse['metrics']['timings'],
  id: JobDetailResponse['metrics']['timings'][number]['id'],
) {
  return timings.find((segment) => segment.id === id)?.durationMs ?? null;
}

function truncateHeadline(value: string, maxLength = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function formatTimestamp(value: string | null) {
  if (!value) return 'No timestamp';
  return new Date(value).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function JobStatusBanner({
  detail,
  hasReadableAssistantReply,
}: {
  detail: JobDetailResponse;
  hasReadableAssistantReply: boolean;
}) {
  const { status, error } = detail.job;

  if (status === 'failed' || status === 'cancelled') {
    const isFailure = status === 'failed';
    const title = isFailure ? 'Job failed' : 'Job was cancelled';
    const body = error
      ? error
      : isFailure
        ? 'No error details were recorded. Check the activity timeline for more context.'
        : 'This job was cancelled before it could complete.';

    return (
      <section className="rounded-[22px] border border-rose-500/25 bg-rose-500/8 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-400" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-rose-200">{title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-rose-100/75 [overflow-wrap:anywhere]">
                {body}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'needs_review') {
    const transcriptPath = detail.turn?.transcriptPath;

    return (
      <section className="rounded-[22px] border border-amber-500/25 bg-amber-500/8 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Eye size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <div className="min-w-0 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-amber-200">No image was generated</h3>
                <p className="mt-2 text-[13px] leading-6 text-amber-100/70">
                  Codex completed this turn but did not return a usable image file. Review the
                  timeline below to see the final assistant reply and any provider events before
                  retrying with an adjusted prompt or the same settings.
                </p>
              </div>

              {hasReadableAssistantReply ? (
                <div className="rounded-2xl border border-amber-500/10 bg-black/20 px-3 py-2.5 text-[12px] leading-5 text-amber-100/70">
                  The final assistant response is already captured in the timeline below, so we do
                  not repeat it here.
                </div>
              ) : null}

              {transcriptPath ? (
                <div className="rounded-2xl border border-amber-500/10 bg-black/20 px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400/50">
                    Transcript path
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-amber-200/40 [overflow-wrap:anywhere]">
                    {transcriptPath}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

function TimelineIcon({ item }: { item: JobInspectorTimelineItem }) {
  if (item.sourceType === 'event') return <Activity size={16} />;
  if (item.tone === 'reasoning') return <BrainCircuit size={16} />;
  if (item.tone === 'tool') return <Wrench size={16} />;
  if (item.tone === 'message') return <MessageSquare size={16} />;
  return <FileText size={16} />;
}

function SectionCard({
  title,
  eyebrow,
  icon,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="mb-3 flex items-center gap-3">
        {icon ? <span className="text-accent-300">{icon}</span> : null}
        <div>
          {eyebrow ? (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function RenderTextBlocks({ blocks }: { blocks: JobInspectorTextBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, index) =>
        block.kind === 'code' ? (
          <pre
            key={`${block.kind}-${index}`}
            className="custom-scrollbar overflow-x-auto rounded-2xl border border-white/8 bg-black/30 p-3 text-[11px] leading-6 text-zinc-300"
          >
            {block.text}
          </pre>
        ) : (
          <p
            key={`${block.kind}-${index}`}
            className="whitespace-pre-wrap text-[13px] leading-6 text-zinc-200 [overflow-wrap:anywhere]"
          >
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}

function ArtifactTile({
  artifact,
  className,
}: {
  artifact: JobInspectorArtifact;
  className?: string;
}) {
  const tile = (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-black/30 transition-colors hover:border-white/15 hover:bg-black/40',
        className,
      )}
    >
      {artifact.previewSrc ? (
        <div className="aspect-[4/3] overflow-hidden border-b border-white/8 bg-black/50">
          <img
            src={artifact.previewSrc}
            alt={artifact.label}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
      <div className="space-y-1 p-3">
        <div className="flex items-center gap-2 text-zinc-400">
          {artifact.kind === 'image' ? (
            <ImageIcon size={14} />
          ) : artifact.kind === 'link' ? (
            <Link2 size={14} />
          ) : (
            <FileText size={14} />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.18em]">
            {artifact.sourceLabel}
          </span>
        </div>
        <p className="line-clamp-2 text-sm font-medium text-white [overflow-wrap:anywhere]">
          {artifact.label}
        </p>
        <p className="line-clamp-2 text-[11px] leading-5 text-zinc-500 [overflow-wrap:anywhere]">
          {artifact.value}
        </p>
      </div>
    </div>
  );

  if (!artifact.href) return tile;

  return (
    <a href={artifact.href} target="_blank" rel="noreferrer" className="block">
      {tile}
    </a>
  );
}

function OutputPreviewStrip({
  title,
  emptyMessage,
  artifacts,
}: {
  title: string;
  emptyMessage: string;
  artifacts: JobInspectorArtifact[];
}) {
  if (artifacts.length === 0) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
          <ImageIcon size={14} className="text-accent-300" />
          <span>{title}</span>
        </div>
        <div className="rounded-2xl border border-dashed border-white/8 bg-black/20 px-4 py-5 text-sm text-zinc-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        <ImageIcon size={14} className="text-accent-300" />
        <span>{title}</span>
      </div>
      <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-1">
        {artifacts.map((artifact) => (
          <ArtifactTile key={artifact.id} artifact={artifact} className="w-[190px] shrink-0" />
        ))}
      </div>
      {artifacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/8 bg-black/20 px-4 py-5 text-sm text-zinc-500">
          {emptyMessage}
        </div>
      ) : null}
    </div>
  );
}

function ArtifactGallery({
  artifacts,
  emptyMessage,
}: {
  artifacts: JobInspectorArtifact[];
  emptyMessage: string;
}) {
  if (artifacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/8 bg-black/20 px-4 py-5 text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
      {artifacts.map((artifact) => (
        <ArtifactTile key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
}

function FactGrid({ facts }: { facts: JobInspectorTimelineItem['facts'] }) {
  if (facts.length === 0) return null;

  return (
    <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
      {facts.map((fact) => (
        <div
          key={`${fact.label}-${fact.value}`}
          className="min-w-0 rounded-2xl border border-white/8 bg-black/25 px-3 py-2.5"
        >
          <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            {fact.label}
          </dt>
          <dd className="mt-1 text-[13px] leading-5 text-zinc-200 [overflow-wrap:anywhere]">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TaskMetricSummary({ metrics }: { metrics: JobDetailResponse['metrics'] }) {
  const queuedMs = findTiming(metrics.timings, 'queued');
  const providerMs = findTiming(metrics.timings, 'provider');
  const assetImportMs = findTiming(metrics.timings, 'asset_import');

  return (
    <SectionCard title="Runtime summary" eyebrow="Metrics" icon={<Clock3 size={16} />}>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-black/25 p-3.5">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Total runtime
          </div>
          <div className="mt-1.5 font-mono text-xl font-semibold text-white">
            {formatDuration(findTiming(metrics.timings, 'total'))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/25 p-3.5">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Tokens spent
          </div>
          <div className="mt-1.5 font-mono text-xl font-semibold text-accent-200">
            {formatTokenCount(metrics.tokenUsage?.totalTokens)}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            in {formatTokenCount(metrics.tokenUsage?.inputTokens)} · out{' '}
            {formatTokenCount(metrics.tokenUsage?.outputTokens)}
          </div>
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {[
          ['Queue wait', formatDuration(queuedMs)],
          ['Provider turn', formatDuration(providerMs)],
          ['Asset import', formatDuration(assetImportMs)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-black/25 px-3 py-2.5">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              {label}
            </div>
            <div className="mt-1 font-mono text-[13px] font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TimelineItemCard({ item }: { item: JobInspectorTimelineItem }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const previewText =
    item.blocks[0]?.text ??
    item.facts[0]?.value ??
    (item.rawJson ? 'Structured payload available.' : 'No payload text detected.');

  return (
    <article
      className={cn(
        'rounded-[20px] border p-3 transition-colors',
        isExpanded ? 'border-white/12 bg-white/[0.055]' : toneForTimeline(item),
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
        className="flex w-full items-start gap-3 text-left cursor-pointer"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-zinc-100">
          <TimelineIcon item={item} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[14px] font-semibold leading-5 text-white [overflow-wrap:anywhere]">
              {item.title}
            </h4>
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
              {item.sourceType === 'transcript' ? 'Transcript' : 'Event'}
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
              {formatTimestamp(item.timestamp)}
            </span>
          </div>

          <p className="max-w-4xl text-[12px] leading-5 text-zinc-400 [overflow-wrap:anywhere]">
            {truncateHeadline(previewText, 180)}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
            <span>{item.facts.length} facts</span>
            <span>•</span>
            <span>{item.artifacts.length} refs</span>
            {item.rawJson ? (
              <>
                <span>•</span>
                <span>structured payload</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-1 shrink-0 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:border-white/15 hover:text-white">
          {isExpanded ? 'Hide' : 'Open'}
        </div>
      </button>

      {isExpanded ? (
        <div className="mt-3 space-y-3 border-t border-white/8 pt-3">
          <RenderTextBlocks blocks={item.blocks} />
          <FactGrid facts={item.facts} />

          {item.artifacts.length > 0 ? (
            <div>
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Attachments and outputs
              </div>
              <ArtifactGallery
                artifacts={item.artifacts}
                emptyMessage="No attachments or output references were detected for this step."
              />
            </div>
          ) : null}

          {item.rawJson && item.tone !== 'reasoning' && item.tone !== 'message' ? (
            <details className="rounded-2xl border border-white/8 bg-black/25 p-3">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                {item.tone === 'tool' ? 'Tool call payload' : 'Event payload'}
              </summary>
              <pre className="custom-scrollbar mt-3 max-h-72 overflow-auto rounded-2xl border border-white/8 bg-black/40 p-3 text-[11px] leading-6 text-zinc-300">
                {item.rawJson}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- inspector view intentionally kept cohesive pending dedicated decomposition pass
export const JobInspectorDetail: React.FC<JobInspectorDetailProps> = ({
  detail,
  onClearSelectedJob,
  onRetryJob,
}) => {
  const model = useMemo(
    () =>
      buildJobInspectorDetailModel(detail, {
        assetBaseUrl: getStudioApiBase(),
      }),
    [detail],
  );

  const titlePrompt = detail.job.finalPromptUsed || detail.job.originalPrompt;
  const hasReadableAssistantReply = model.timeline.some(
    (item) => item.sourceType === 'transcript' && item.tone === 'message',
  );
  const referenceArtifacts = model.request.referenceArtifacts;
  const primaryOutput = model.outputs[0] ?? null;
  const primaryReference = referenceArtifacts[0] ?? null;
  const additionalReferences = referenceArtifacts.slice(1);
  const primaryCatalogImage = detail.catalogImages[0] ?? null;
  const referenceSourceSpec =
    detail.job.sourceSpec?.assets.find((asset) => asset.role === 'reference') ?? null;

  const outputName = primaryOutput?.label || 'Returned image';
  const outputMeta = [
    primaryCatalogImage?.width && primaryCatalogImage?.height
      ? `${primaryCatalogImage.width} × ${primaryCatalogImage.height}`
      : null,
    primaryCatalogImage?.mimeType?.replace('image/', '').toUpperCase() ?? null,
    primaryCatalogImage?.aspectRatio ?? null,
  ].filter(Boolean) as string[];

  const requestFactMap = new Map(model.request.facts.map((fact) => [fact.label, fact.value]));
  const snapshotItems = [
    ['Task', requestFactMap.get('Task') ?? detail.job.kind],
    ['Provider', requestFactMap.get('Provider') ?? detail.job.providerId ?? '—'],
    ['Input assets', requestFactMap.get('Input assets') ?? '0'],
    [
      'Reference assets',
      requestFactMap.get('Reference assets') ?? String(referenceArtifacts.length),
    ],
    ['Prompt chars', requestFactMap.get('Final prompt chars') ?? String(titlePrompt.length)],
    ['Transcript path', detail.turn?.transcriptPath ?? '—'],
  ] as const;

  const executionItems = [
    ['Created', new Date(detail.job.createdAt).toLocaleString()],
    ['Completed', detail.job.completedAt ? new Date(detail.job.completedAt).toLocaleString() : '—'],
    ['Model', detail.job.execution?.model || 'default'],
    ['Speed', detail.job.execution?.serviceTier || 'standard'],
    ['Token source', detail.metrics.tokenUsage?.source || 'not reported'],
  ] as const;

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
      <div className="border-b border-white/8 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                  toneForStatus(detail.job.status),
                )}
              >
                {detail.job.status}
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300">
                {detail.job.kind.replace(/_/g, ' ')}
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                {detail.job.providerId ?? 'provider unknown'}
              </span>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Job inspector
            </p>
            <h2 className="mt-2 max-w-5xl text-[21px] font-semibold leading-tight text-white">
              {truncateHeadline(titlePrompt)}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
              <span className="font-mono [overflow-wrap:anywhere]">{detail.job.id}</span>
              <span>•</span>
              <span>{model.stats.transcriptCount} transcript steps</span>
              {model.stats.collapsedTranscriptCount > 0 ? (
                <>
                  <span>•</span>
                  <span>{model.stats.collapsedTranscriptCount} streaming updates compacted</span>
                </>
              ) : null}
              <span>•</span>
              <span>{model.stats.eventCount} system events</span>
              <span>•</span>
              <span>{model.stats.outputCount} returned images</span>
              <span>•</span>
              <span>{referenceArtifacts.length} reference context</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {onRetryJob ? (
              <button
                type="button"
                onClick={() => onRetryJob(detail.job.id)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent-500/20 bg-black/25 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-accent-100 transition-colors hover:border-accent-400/35 hover:bg-black/35 hover:text-white cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Retry job</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClearSelectedJob}
              className="shrink-0 rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Back to activity
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)]">
          <JobStatusBanner detail={detail} hasReadableAssistantReply={hasReadableAssistantReply} />

          <section className="rounded-2xl border border-white/10 bg-zinc-900/80 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-200">
                <ImageIcon size={14} className="text-emerald-400" />
                <span>Returned image</span>
              </div>
              <span
                className={cn(
                  'rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]',
                  toneForStatus(detail.job.status),
                )}
              >
                {detail.job.status}
              </span>
            </div>

            <div className="bg-black/35">
              {primaryOutput?.previewSrc || primaryOutput?.href ? (
                <img
                  src={primaryOutput.previewSrc ?? primaryOutput?.href ?? ''}
                  alt={outputName}
                  className="h-[320px] w-full object-contain bg-zinc-950"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-zinc-500">
                  No returned image available.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-200">
                  {outputName}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {outputMeta.length > 0 ? outputMeta.join(' · ') : 'No output metadata available'}
                </p>
              </div>
              {primaryOutput?.href ? (
                <a
                  href={primaryOutput.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
                >
                  Open image
                </a>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/80 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-200">
              <Layers3 size={14} className="text-indigo-300" />
              <span>Reference context</span>
            </div>

            <div className="p-3">
              {primaryReference?.previewSrc || primaryReference?.href ? (
                <img
                  src={primaryReference.previewSrc ?? primaryReference?.href ?? ''}
                  alt={primaryReference.label}
                  className="h-[214px] w-full rounded-xl border border-white/10 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-[214px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-zinc-500">
                  No reference image.
                </div>
              )}
            </div>

            <div className="border-t border-white/8 px-4 py-3 space-y-2">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
                {primaryReference?.label ?? 'Reference unavailable'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="uppercase tracking-[0.16em] text-zinc-500 text-[9px] font-black">
                  Reference strength
                </span>
                <span className="font-mono text-zinc-200">
                  {referenceSourceSpec?.strength != null
                    ? referenceSourceSpec.strength.toFixed(2)
                    : '—'}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-indigo-300"
                  style={{
                    width: `${Math.max(0, Math.min(100, (referenceSourceSpec?.strength ?? 0) * 100))}%`,
                  }}
                />
              </div>

              {additionalReferences.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    More references ({additionalReferences.length})
                  </p>
                  <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                    {additionalReferences.map((artifact) => {
                      const preview = artifact.previewSrc ?? artifact.href;
                      return (
                        <a
                          key={artifact.id}
                          href={artifact.href ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="block size-16 shrink-0"
                        >
                          <div className="size-16 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                            {preview ? (
                              <img
                                src={preview}
                                alt={artifact.label}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-500">
                                N/A
                              </div>
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-zinc-900/80 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-200">
              <FileText size={14} className="text-violet-300" />
              <span>Prompt used</span>
            </div>
          </div>
          <div className="p-4">
            {model.prompt.blocks.length > 0 ? (
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-zinc-200">
                “{model.prompt.blocks.map((block) => block.text).join('\n\n')}”
              </p>
            ) : (
              <p className="text-sm text-zinc-500">No prompt text captured for this job.</p>
            )}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
            <TaskMetricSummary metrics={detail.metrics} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-200">
              <BrainCircuit size={14} className="text-emerald-300" />
              <span>Execution facts</span>
            </div>
            <dl className="space-y-2.5">
              {executionItems.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {label}
                  </dt>
                  <dd className="text-right text-[12px] leading-5 text-zinc-200 [overflow-wrap:anywhere]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-200">
              <Layers3 size={14} className="text-amber-300" />
              <span>Job snapshot</span>
            </div>
            <dl className="space-y-2.5">
              {snapshotItems.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                    {label}
                  </dt>
                  <dd className="text-right text-[12px] leading-5 text-zinc-200 [overflow-wrap:anywhere]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <details className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
          <summary className="cursor-pointer text-[11px] font-black uppercase tracking-[0.18em] text-zinc-300">
            Activity timeline ({model.timeline.length})
          </summary>
          <div className="mt-4 space-y-3">
            {model.timeline.length > 0 ? (
              model.timeline.map((item) => <TimelineItemCard key={item.id} item={item} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-white/8 bg-black/20 px-4 py-6 text-sm text-zinc-500">
                No transcript or event history was recorded for this job.
              </div>
            )}
          </div>
        </details>
      </div>
    </section>
  );
};
