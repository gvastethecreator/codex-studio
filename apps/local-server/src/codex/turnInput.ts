import { buildCodexImagegenFallbackPrompt } from './imagegenContract';
import type { CodexImagegenCompiledInput } from '../providers/codexProvider';

export interface CodexTurnInputArgs {
  imagegenSkillPath: string;
  fallbackPrompt: string;
  compiledInput?: CodexImagegenCompiledInput | null;
}

export function buildCodexImagegenTurnInput({
  imagegenSkillPath,
  fallbackPrompt,
  compiledInput,
}: CodexTurnInputArgs) {
  return [
    { type: 'skill', name: 'imagegen', path: imagegenSkillPath },
    ...(compiledInput?.payload.imageInputs ?? []),
    {
      type: 'text',
      text: compiledInput?.payload.text ?? buildCodexImagegenFallbackPrompt(fallbackPrompt),
      text_elements: [],
    },
  ];
}
