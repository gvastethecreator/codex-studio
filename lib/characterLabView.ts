import {
  CHARACTER_LAB_ACTIONS,
  CHARACTER_LAB_CATEGORIES,
  CHARACTER_LAB_GLOBAL_OPTIONS,
  CHARACTER_LAB_MODES,
  CHARACTER_LAB_OPTION_COUNTS,
  type CharacterLabAction,
  type CharacterLabModeId,
} from './characterLabCatalog.generated';
import {
  CHARACTER_LAB_ICON_ATLAS_CELL_SIZE,
  CHARACTER_LAB_ICON_ATLAS_URL,
  CHARACTER_LAB_ICON_FRAMES,
} from './characterLabIconAtlas.generated';
import {
  CHARACTER_LAB_OPTION_ICON_ATLAS_CELL_SIZE,
  CHARACTER_LAB_OPTION_ICON_ATLAS_HEIGHT,
  CHARACTER_LAB_OPTION_ICON_ATLAS_URL,
  CHARACTER_LAB_OPTION_ICON_ATLAS_WIDTH,
  CHARACTER_LAB_OPTION_ICON_FRAMES,
} from './characterLabOptionIconAtlas.generated';

export type {
  CharacterLabAction,
  CharacterLabActionCapability,
  CharacterLabMediaType,
  CharacterLabModeId,
} from './characterLabCatalog.generated';

export const characterLabModes = CHARACTER_LAB_MODES;
export const characterLabActions = CHARACTER_LAB_ACTIONS;
export const characterLabCategories = CHARACTER_LAB_CATEGORIES;
export const characterLabGlobalOptions = CHARACTER_LAB_GLOBAL_OPTIONS;
export const characterLabOptionCounts = CHARACTER_LAB_OPTION_COUNTS;

export const characterLabIconAtlas = {
  url: CHARACTER_LAB_ICON_ATLAS_URL,
  cellSize: CHARACTER_LAB_ICON_ATLAS_CELL_SIZE,
  frames: CHARACTER_LAB_ICON_FRAMES,
};

const iconFrames = Object.values(CHARACTER_LAB_ICON_FRAMES);

export const characterLabIconAtlasSize = {
  width: Math.max(...iconFrames.map((frame) => frame.x + frame.w)),
  height: Math.max(...iconFrames.map((frame) => frame.y + frame.h)),
};

export const characterLabOptionIconAtlas = {
  url: CHARACTER_LAB_OPTION_ICON_ATLAS_URL,
  cellSize: CHARACTER_LAB_OPTION_ICON_ATLAS_CELL_SIZE,
  width: CHARACTER_LAB_OPTION_ICON_ATLAS_WIDTH,
  height: CHARACTER_LAB_OPTION_ICON_ATLAS_HEIGHT,
  frames: CHARACTER_LAB_OPTION_ICON_FRAMES,
};

export function getCharacterLabIconFrame(id: string) {
  return CHARACTER_LAB_ICON_FRAMES[id as keyof typeof CHARACTER_LAB_ICON_FRAMES];
}

export function getCharacterLabOptionIconFrame(id: string) {
  return CHARACTER_LAB_OPTION_ICON_FRAMES[id as keyof typeof CHARACTER_LAB_OPTION_ICON_FRAMES];
}

export function getFirstReadyCharacterLabAction(mode?: CharacterLabModeId): CharacterLabAction {
  const ready = CHARACTER_LAB_ACTIONS.find((action) => action.capability === 'ready');
  if (!ready) {
    throw new Error('Character Lab catalog has no ready action.');
  }
  if (!mode) return ready;
  return (
    CHARACTER_LAB_ACTIONS.find((action) => action.mode === mode && action.capability === 'ready') ??
    CHARACTER_LAB_ACTIONS.find((action) => action.mode === mode) ??
    ready
  );
}
