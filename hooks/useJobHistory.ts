import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JobListPage, TerminalJobStatus } from '../packages/shared/src';
import { listStudioJobs } from '../services/studio-api/jobs';
import { createStudioEventStream } from '../services/studioEventSource';
import { toShellActivityJob, type ShellActivityJob } from '../lib/shellActivityJob';
import { useLatestRef } from './useLatestRef';

interface HistoryState {
  key: string;
  page: JobListPage | null;
  history: ShellActivityJob[];
  nextCursor: string | null;
  seenHistoryIds: string[];
  knownAtRequest: ShellActivityJob[];
  loading: boolean;
  error: string | null;
  failedCursor?: string;
}

function emptyHistoryState(key: string): HistoryState {
  return {
    key,
    page: null,
    history: [],
    nextCursor: null,
    seenHistoryIds: [],
    knownAtRequest: [],
    loading: true,
    error: null,
  };
}

function matchesHistory(job: ShellActivityJob, workspaceId: string, status: string) {
  return (
    ['completed', 'failed', 'cancelled'].includes(job.status) &&
    (!workspaceId || job.workspaceId === workspaceId) &&
    (!status || job.status === status)
  );
}

export function mergeJobHistory(
  previous: ShellActivityJob[],
  page: JobListPage,
  known: ShellActivityJob[],
  workspaceId: string,
  status: string,
) {
  const rows = new Map(previous.map((job) => [job.id, job]));
  const snapshots = new Map([...page.open, ...page.history].map((job) => [job.id, job]));
  for (const job of page.history) rows.set(job.id, toShellActivityJob(job));
  for (const job of page.open) rows.delete(job.id);
  for (const job of known) {
    const snapshot = snapshots.get(job.id);
    if (snapshot && Date.parse(job.updatedAt) <= Date.parse(snapshot.updatedAt)) continue;
    const old = rows.get(job.id);
    if (!old && job.source !== 'backend_event') continue;
    if (old && Date.parse(job.updatedAt) < Date.parse(old.updatedAt)) continue;
    if (matchesHistory(job, workspaceId, status)) rows.set(job.id, job);
    else rows.delete(job.id);
  }
  return [...rows.values()]
    .filter((job) => matchesHistory(job, workspaceId, status))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id));
}

export function useJobHistory(
  serverJobs: ShellActivityJob[],
  workspaceId: string,
  status: TerminalJobStatus | '',
) {
  const key = JSON.stringify([workspaceId, status]);
  const [state, setState] = useState<HistoryState>(() => emptyHistoryState(key));
  const current = useLatestRef(state);
  const known = useLatestRef(serverJobs);
  const pending = useRef<AbortController | null>(null);
  const refreshAfterRequest = useRef(false);
  const request = useCallback(
    async (cursor?: string) => {
      pending.current?.abort();
      const controller = new AbortController();
      const knownAtRequest = known.current;
      pending.current = controller;
      setState((previous) => ({
        ...(previous.key === key ? previous : emptyHistoryState(key)),
        loading: true,
        error: null,
      }));
      try {
        const page = await listStudioJobs(
          { workspaceId: workspaceId || undefined, status: status || undefined, cursor, limit: 20 },
          controller.signal,
        );
        if (controller.signal.aborted || pending.current !== controller) return;
        setState((previous) => {
          const sameFilter = previous.key === key;
          const seenHistoryIds = [
            ...new Set([
              ...(sameFilter && cursor ? previous.seenHistoryIds : []),
              ...page.history.map((job) => job.id),
            ]),
          ];
          const seen = new Set(seenHistoryIds);
          const history = mergeJobHistory(
            sameFilter ? previous.history : [],
            page,
            known.current,
            workspaceId,
            status,
          );
          return {
            key,
            page,
            history: page.nextCursor ? history : history.filter((job) => seen.has(job.id)),
            nextCursor: page.nextCursor,
            seenHistoryIds,
            knownAtRequest,
            loading: false,
            error: null,
          };
        });
      } catch (error) {
        if (controller.signal.aborted || pending.current !== controller) return;
        setState((previous) => ({
          ...previous,
          failedCursor: cursor,
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load job history.',
        }));
      } finally {
        if (pending.current === controller) pending.current = null;
      }
    },
    [key, workspaceId, status, known],
  );

  useEffect(() => {
    void request();
    return () => pending.current?.abort();
  }, [request]);
  useEffect(() => {
    const stream = createStudioEventStream();
    const unsubscribe = stream.onRevisionGap?.(() => {
      // Missed events can change older pages while the recent summary stays identical.
      if (pending.current) refreshAfterRequest.current = true;
      else void request();
    });
    return () => {
      unsubscribe?.();
      stream.close();
    };
  }, [request]);
  const previousJobs = useRef(serverJobs);
  useEffect(() => {
    if (previousJobs.current === serverJobs) return;
    if (
      previousJobs.current.length === serverJobs.length &&
      previousJobs.current.every((previous, index) => {
        const next = serverJobs[index];
        return (
          previous.id === next.id &&
          previous.updatedAt === next.updatedAt &&
          previous.status === next.status
        );
      })
    ) {
      previousJobs.current = serverJobs;
      return;
    }
    const timer = setTimeout(() => {
      previousJobs.current = serverJobs;
      if (pending.current) refreshAfterRequest.current = true;
      else void request();
    }, 100);
    return () => clearTimeout(timer);
  }, [serverJobs, request]);
  useEffect(() => {
    if (!state.loading && refreshAfterRequest.current) {
      refreshAfterRequest.current = false;
      void request();
    }
  }, [state.loading, request]);
  const visible = state.key === key ? state : emptyHistoryState(key);
  const recentEvents = useMemo(() => {
    const observed = new Map(visible.knownAtRequest.map((job) => [job.id, job]));
    return serverJobs.filter(
      (job) => job.source === 'backend_event' && observed.get(job.id) !== job,
    );
  }, [visible.knownAtRequest, serverJobs]);
  const open = useMemo(() => {
    const rows = new Map(visible.page?.open.map((job) => [job.id, toShellActivityJob(job)]));
    for (const job of visible.page ? recentEvents : serverJobs) {
      const snapshot = rows.get(job.id);
      if (snapshot && Date.parse(snapshot.updatedAt) > Date.parse(job.updatedAt)) continue;
      rows.set(job.id, job);
    }
    return [...rows.values()].filter(
      (job) =>
        ['queued', 'running', 'needs_review'].includes(job.status) &&
        (!workspaceId || job.workspaceId === workspaceId),
    );
  }, [visible.page, recentEvents, serverJobs, workspaceId]);
  const history = useMemo(
    () =>
      visible.page
        ? mergeJobHistory(visible.history, visible.page, recentEvents, workspaceId, status)
        : [],
    [visible.history, visible.page, recentEvents, workspaceId, status],
  );
  return {
    ...visible,
    workspaces: state.page?.workspaces ?? [],
    open,
    history,
    loadMore: () => {
      if (current.current.nextCursor && !pending.current) void request(current.current.nextCursor);
    },
    retry: () => {
      void request(current.current.failedCursor);
    },
  };
}
