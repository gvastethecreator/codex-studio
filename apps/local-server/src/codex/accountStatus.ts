import type { CodexAccountStatusResponse } from '../../../../packages/shared/src';
import {
  createLocalCodexSessionReader,
  getLocalCodexSession,
} from './localCodexSession';

export async function getCodexAccountStatus(): Promise<CodexAccountStatusResponse> {
  return getLocalCodexSession();
}

export { createLocalCodexSessionReader };