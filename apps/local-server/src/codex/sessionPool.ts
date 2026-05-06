export interface SessionHandle {
  threadId: string | null;
  turnId: string | null;
  sessionKey: string;
}

export interface SessionPool {
  getOrCreateSession(projectId: string): Promise<SessionHandle>;
  releaseSession(handle: SessionHandle): void;
  destroySession(threadId: string): Promise<void>;
}

export function createSessionPool(): SessionPool {
  return {
    async getOrCreateSession(projectId) {
      return { threadId: null, turnId: null, sessionKey: projectId };
    },
    releaseSession() {},
    async destroySession() {},
  };
}
