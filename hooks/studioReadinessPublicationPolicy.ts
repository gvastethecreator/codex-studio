export interface StudioReadinessPublicationPolicy {
  beginRefresh(): number;
  endRefresh(): boolean;
  shouldPublishRefresh(requestId: number): boolean;
  beginSnapshotRead(): number;
  shouldPublishSnapshot(requestId: number): boolean;
}

export function createStudioReadinessPublicationPolicy(): StudioReadinessPublicationPolicy {
  let activeRefreshCount = 0;
  let latestRefreshRequestId = 0;
  let latestSnapshotRequestId = 0;

  return {
    beginRefresh() {
      activeRefreshCount += 1;
      latestRefreshRequestId += 1;
      return latestRefreshRequestId;
    },
    endRefresh() {
      activeRefreshCount = Math.max(0, activeRefreshCount - 1);
      return activeRefreshCount > 0;
    },
    shouldPublishRefresh(requestId: number) {
      return requestId === latestRefreshRequestId;
    },
    beginSnapshotRead() {
      latestSnapshotRequestId += 1;
      return latestSnapshotRequestId;
    },
    shouldPublishSnapshot(requestId: number) {
      return requestId === latestSnapshotRequestId;
    },
  };
}
