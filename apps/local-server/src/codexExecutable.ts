import { existsSync } from 'node:fs';

const NPM_CODEX_CMD = 'C:\\Users\\cristian\\AppData\\Roaming\\npm\\codex.cmd';
const NPM_CODEX_EXE =
  'C:\\Users\\cristian\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\node_modules\\@openai\\codex-win32-x64\\vendor\\x86_64-pc-windows-msvc\\codex\\codex.exe';
const APP_CODEX_EXE =
  'C:\\Program Files\\WindowsApps\\OpenAI.Codex_26.429.3425.0_x64__2p2nqsd0c76g0\\app\\resources\\codex.exe';

export function resolveCodexInvocation(args: string[]) {
  if (existsSync(NPM_CODEX_EXE)) {
    return [NPM_CODEX_EXE, ...args];
  }
  if (existsSync(NPM_CODEX_CMD)) {
    return ['cmd.exe', '/d', '/s', '/c', `${NPM_CODEX_CMD} ${args.map((arg) => `"${arg}"`).join(' ')}`];
  }
  if (existsSync(APP_CODEX_EXE)) {
    return [APP_CODEX_EXE, ...args];
  }
  return ['codex', ...args];
}
