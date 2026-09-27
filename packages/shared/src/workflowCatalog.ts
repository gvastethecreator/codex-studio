/** Shared navigation order; workflow identities and routes remain unchanged. */
export const WORKFLOW_CATEGORIES = [
  { id: 'create', label: 'Create & Edit', workflows: ['default', 'styles', 'remaster'] },
  {
    id: 'character',
    label: 'Character',
    workflows: [
      'character-poses',
      'character-sprites',
      'character-scenes',
      'character-variants',
      'character-transforms',
      'character',
      'character-lab',
    ],
  },
  { id: 'story', label: 'Camera & Story', workflows: ['camera', 'cinematic', 'timeline'] },
  { id: 'animation', label: 'Animation', workflows: ['animation-sequence'] },
  { id: 'game-assets', label: 'Game Assets', workflows: ['spritesheet', 'sprite-atlas'] },
] as const;

export type PreferredWorkflow = (typeof WORKFLOW_CATEGORIES)[number]['workflows'][number];

export function isPreferredWorkflow(value: unknown): value is PreferredWorkflow {
  return (
    typeof value === 'string' &&
    WORKFLOW_CATEGORIES.some((category) =>
      (category.workflows as readonly string[]).includes(value),
    )
  );
}

export function getWorkflowCategory(id: string) {
  return WORKFLOW_CATEGORIES.find((category) =>
    (category.workflows as readonly string[]).includes(id),
  );
}
