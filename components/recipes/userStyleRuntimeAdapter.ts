import type { UserStylePreset } from '../../packages/shared/src';
import type { StyleRuntimePack, StyleRuntimePreset } from './styles/runtimeTypes';

export const USER_STYLE_PACK_ID = 'user_styles';
export const USER_STYLE_PACK_NAME = 'My Styles';
export const USER_STYLE_PACK_DESCRIPTION =
  'Local user-authored styles, saved blends, clones, and assisted drafts.';

export function userStylePresetToRuntimePreset(style: UserStylePreset): StyleRuntimePreset {
  return {
    id: style.id,
    name: style.name,
    category: style.category || 'Custom Styles',
    domain: style.domain ?? 'custom',
    createdAt: style.createdAt,
    updatedAt: style.updatedAt,
    negativePrompt: style.avoidRules.join(', '),
    style: {
      ...style.visualDna,
      creative_brief:
        typeof style.visualDna.creative_brief === 'string'
          ? style.visualDna.creative_brief
          : `${style.name} custom user style.`,
    },
    ui: {
      origin: 'user',
      tags: style.tags,
      supportedTasks: style.supportedTasks,
      source: style.source,
      createdAt: style.createdAt,
      updatedAt: style.updatedAt,
    },
  };
}

export function createUserStyleRuntimePack(styles: UserStylePreset[]): StyleRuntimePack {
  return {
    id: USER_STYLE_PACK_ID,
    name: USER_STYLE_PACK_NAME,
    description: USER_STYLE_PACK_DESCRIPTION,
    presets: styles.map(userStylePresetToRuntimePreset),
  };
}
