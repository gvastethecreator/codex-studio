import type { SpriteAtlasService } from './spriteAtlasService';
import type { WorkflowRunParticipant } from './workflowRunReconciler';

/** Sprite Atlas lane of the workflow run reconciler. */
export function createSpriteAtlasRunParticipant(
  _service: SpriteAtlasService,
): WorkflowRunParticipant {
  return {
    recipeId: 'sprite-atlas',
    recordDispatch: async () => {},
    settle: async () => false,
    recover: async () => {},
  };
}
