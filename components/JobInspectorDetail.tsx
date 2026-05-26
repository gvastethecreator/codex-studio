import React, { useMemo } from 'react';
import {
  Activity,
  BrainCircuit,
  Clock3,
  FileText,
  Image as ImageIcon,
  Layers3,
  Link2,
  MessageSquare,
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
    <section className={cn('rounded-[22px] border border-white/8 bg-white/[0.04] p-4', className)}>
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

function OutputPreviewStrip({ artifacts }: { artifacts: JobInspectorArtifact[] }) {
  if (artifacts.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        <ImageIcon size={14} className="text-accent-300" />
        <span>Returned images</span>
      </div>
      <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-1">
        {artifacts.map((artifact) => (
          <ArtifactTile key={artifact.id} artifact={artifact} className="w-[190px] shrink-0" />
        ))}
      </div>
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
  return (
    <article className={cn('rounded-[22px] border p-3.5', toneForTimeline(item))}>
      <div className="grid gap-3 lg:grid-cols-[148px_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border border-white/8 bg-black/20 p-3">
          <div className="flex items-center gap-2 text-zinc-200">
            <TimelineIcon item={item} />
            <span className="text-[10px] font-black uppercase tracking-[0.18em]">
              {item.sourceType === 'transcript' ? 'Transcript' : 'Event'}
            </span>
          </div>
          <div className="mt-2 text-[13px] font-semibold text-white [overflow-wrap:anywhere]">
            {item.badge}
          </div>
          <div className="mt-1.5 text-[11px] leading-5 text-zinc-400 [overflow-wrap:anywhere]">
            {item.sourceLabel}
          </div>
          <div className="mt-2 text-[11px] font-medium text-zinc-300">
            {formatTimestamp(item.timestamp)}
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <div>
            <h4 className="text-[15px] font-semibold leading-6 text-white [overflow-wrap:anywhere]">
              {item.title}
            </h4>
          </div>

          <RenderTextBlocks blocks={item.blocks} />
          <FactGrid facts={item.facts} />

          {item.artifacts.length > 0 ? (
            <div>
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Attachments and outputs
              </div>
              <ArtifactGallery
                artifacts={item.artifacts}
                emptyMessage="No attachments or output references were detected for this step."
              />
            </div>
          ) : null}

          {item.rawJson ? (
            <details className="rounded-2xl border border-white/8 bg-black/25 p-3">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Raw payload
              </summary>
              <pre className="custom-scrollbar mt-3 max-h-72 overflow-auto rounded-2xl border border-white/8 bg-black/40 p-3 text-[11px] leading-6 text-zinc-300">
                {item.rawJson}
              </pre>
            </details>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export const JobInspectorDetail: React.FC<JobInspectorDetailProps> = ({
  detail,
  onClearSelectedJob,
}) => {
  const model = useMemo(
    () =>
      buildJobInspectorDetailModel(detail, {
        assetBaseUrl: getStudioApiBase(),
      }),
    [detail],
  );

  const titlePrompt = detail.job.finalPromptUsed || detail.job.originalPrompt;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,360px)]">
      <div className="min-w-0 space-y-4">
        <section className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
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
              <h2 className="mt-2 max-w-5xl text-[22px] font-semibold leading-tight text-white">
                {truncateHeadline(titlePrompt)}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                <span className="font-mono [overflow-wrap:anywhere]">{detail.job.id}</span>
                <span>•</span>
                <span>{model.stats.transcriptCount} transcript steps</span>
                <span>•</span>
                <span>{model.stats.eventCount} system events</span>
                <span>•</span>
                <span>{model.stats.outputCount} returned images</span>
                <span>•</span>
                <span>{model.stats.artifactCount} detected references</span>
              </div>
            </div>

            <button
              onClick={onClearSelectedJob}
              className="shrink-0 rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Back to activity
            </button>
          </div>

          <div className="mt-4">
            <OutputPreviewStrip artifacts={model.outputs} />
          </div>
        </section>

        <SectionCard title="Prompt used" eyebrow="Input" icon={<FileText size={16} />}>
          {model.prompt.blocks.length > 0 ? (
            <RenderTextBlocks blocks={model.prompt.blocks} />
          ) : null}
          {model.prompt.facts.length > 0 ? <FactGrid facts={model.prompt.facts} /> : null}
          {model.prompt.rawJson ? (
            <details className="mt-4 rounded-2xl border border-white/8 bg-black/25 p-3">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Structured prompt
              </summary>
              <pre className="custom-scrollbar mt-3 max-h-80 overflow-auto rounded-2xl border border-white/8 bg-black/40 p-3 text-[11px] leading-6 text-zinc-300">
                {model.prompt.rawJson}
              </pre>
            </details>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Activity timeline"
          eyebrow="Readable transcript"
          icon={<Layers3 size={16} />}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            <span>{model.timeline.length} timeline items</span>
            <span>•</span>
            <span>Transcript and events merged in chronological order</span>
          </div>
          <div className="space-y-3">
            {model.timeline.length > 0 ? (
              model.timeline.map((item) => <TimelineItemCard key={item.id} item={item} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-white/8 bg-black/20 px-4 py-6 text-sm text-zinc-500">
                No transcript or event history was recorded for this job.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <aside className="space-y-4">
        <TaskMetricSummary metrics={detail.metrics} />

        <SectionCard title="Runtime facts" eyebrow="Execution" icon={<BrainCircuit size={16} />}>
          <dl className="space-y-3">
            {[
              ['Created', new Date(detail.job.createdAt).toLocaleString()],
              ['Updated', new Date(detail.job.updatedAt).toLocaleString()],
              [
                'Completed',
                detail.job.completedAt ? new Date(detail.job.completedAt).toLocaleString() : '—',
              ],
              ['Model', detail.job.execution?.model || 'default'],
              ['Thinking', detail.job.execution?.reasoningEffort || 'default'],
              ['Speed', detail.job.execution?.serviceTier || 'standard'],
              ['Token source', detail.metrics.tokenUsage?.source || 'not reported'],
              ['Estimated prompt tokens', formatTokenCount(detail.metrics.estimatedPromptTokens)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-black/25 px-3 py-3"
              >
                <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  {label}
                </dt>
                <dd className="min-w-0 text-right text-[13px] leading-5 text-zinc-200 [overflow-wrap:anywhere]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Turn state" eyebrow="Codex turn" icon={<Layers3 size={16} />}>
          <dl className="space-y-3">
            {[
              ['Status', detail.turn?.status || 'n/a'],
              ['Thread', detail.turn?.codexThreadId || '—'],
              ['Turn ID', detail.turn?.codexTurnId || '—'],
              ['Transcript path', detail.turn?.transcriptPath || '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-black/25 px-3 py-3">
                <dt className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  {label}
                </dt>
                <dd className="mt-1 break-all text-sm leading-6 text-zinc-200">{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Referenced assets" eyebrow="Artifacts" icon={<ImageIcon size={16} />}>
          <ArtifactGallery
            artifacts={model.artifacts}
            emptyMessage="No extra image links or file references were detected beyond the returned outputs."
          />
        </SectionCard>
      </aside>
    </div>
  );
};
