import { runCodexImagegenJob } from '../codexClient';

export interface TurnParams {
  projectId: string;
  prompt: string;
  jobId: string;
  sessionKey?: string;
}

export interface TurnResult {
  assets: { type: 'file'; sourcePath: string; mimeType: string }[];
  transcript: string;
  turnId: string | null;
  threadId: string | null;
  durationMs: number;
}

export interface CodexTurn {
  runTurn(params: TurnParams): Promise<TurnResult>;
}

export function createCodexTurn(): CodexTurn {
  return {
    async runTurn(params) {
      const startedAt = Date.now();
      const result = await runCodexImagegenJob({
        id: params.jobId,
        projectId: params.projectId,
        prompt: params.prompt,
      });
      return {
        assets: result.discoveredImagePath ? [{ type: 'file', sourcePath: result.discoveredImagePath, mimeType: 'image/png' }] : [],
        transcript: result.transcriptPath,
        turnId: result.codexTurnId,
        threadId: result.codexThreadId,
        durationMs: Date.now() - startedAt,
      };
    },
  };
}
