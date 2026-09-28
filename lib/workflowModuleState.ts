// Which optional workflow modules are on (ADR 0011). main.tsx registers them before React mounts so
// navigation, routing and chunk preloading can check a module synchronously. A change in
// Settings, Extensions takes effect after a reload.
import {
  findWorkflowModuleForRecipe,
  findWorkflowModuleForWorkflow,
  type WorkflowModuleId,
} from '../packages/shared/src/workflowModules';

const disabledModules = new Set<WorkflowModuleId>();

export function registerDisabledWorkflowModules(ids: readonly WorkflowModuleId[]) {
  disabledModules.clear();
  for (const id of ids) disabledModules.add(id);
}

/** False when the recipe belongs to a module that is turned off. Core recipes are always on. */
export function isRecipeEnabled(recipeId: string | null | undefined) {
  const workflowModule = findWorkflowModuleForRecipe(recipeId);
  return !workflowModule || !disabledModules.has(workflowModule.id);
}

/** Same check for navigation workflow ids, including recipe aliases. */
export function isWorkflowEnabled(workflowId: string | null | undefined) {
  const workflowModule = findWorkflowModuleForWorkflow(workflowId);
  return !workflowModule || !disabledModules.has(workflowModule.id);
}
