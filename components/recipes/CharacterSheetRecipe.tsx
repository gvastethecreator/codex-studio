import React, { useState, useMemo } from 'react';
import {
  IconLayout as Layout,
  IconPalette as Palette,
  IconCamera as Camera,
  IconUserScan as ScanFace,
} from '@tabler/icons-react';
import type { ImageGenerationConfig } from '../../types';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { RecipeLayout } from './RecipeLayout';
import { RecipeResults } from './RecipeWorkbenchContext';
import { ControlDropdown } from './RecipeUI';
import { getRecipeModuleUiModel, getRecipeOptions, getRecipeStringDefault } from './recipeModuleUi';

interface CharacterSheetRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  isGenerating: boolean;
}

const { module: CHARACTER_MODULE, defaults: CHARACTER_DEFAULTS } =
  getRecipeModuleUiModel('character');

const CONTROL_OPTIONS = {
  layout: getRecipeOptions(CHARACTER_MODULE, 'layout'),
  style: getRecipeOptions(CHARACTER_MODULE, 'style'),
  shot: getRecipeOptions(CHARACTER_MODULE, 'shot'),
  focus: getRecipeOptions(CHARACTER_MODULE, 'focus'),
};

const DEFAULT_PARAMS = {
  layout: getRecipeStringDefault(CHARACTER_DEFAULTS, 'layout', 'Classic Turnaround'),
  style: getRecipeStringDefault(CHARACTER_DEFAULTS, 'style', 'Preserve Source Style'),
  shot: getRecipeStringDefault(CHARACTER_DEFAULTS, 'shot', 'Full Body'),
  focus: getRecipeStringDefault(CHARACTER_DEFAULTS, 'focus', 'General Design'),
};

export const CharacterSheetRecipe: React.FC<CharacterSheetRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
}) => {
  const [params, setParams] = useState(
    () =>
      ({
        ...DEFAULT_PARAMS,
        ...(config.recipeId === 'character' ? config.recipeParams : {}),
      }) as typeof DEFAULT_PARAMS,
  );

  const activeImage = config.attachments[0];
  const hasReference = !!activeImage;
  const recipeParams = useMemo(
    () => ({
      layout: params.layout,
      style: params.style,
      shot: params.shot,
      focus: params.focus,
      hasReference,
    }),
    [params.focus, params.layout, params.shot, params.style, hasReference],
  );

  useRecipeContextRegistration(updateConfig, 'character', recipeParams);

  const BottomDock = useMemo(
    () => (
      <>
        <ControlDropdown
          title="Sheet Type"
          icon={<Layout size={14} />}
          label={params.layout}
          options={CONTROL_OPTIONS.layout}
          onSelect={(v) => setParams((p) => ({ ...p, layout: v }))}
          activeColor="indigo"
        />
        <div className="w-px h-8 bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] mx-1 hidden sm:block" />
        <ControlDropdown
          title="Framing"
          icon={<Camera size={14} />}
          label={params.shot}
          options={CONTROL_OPTIONS.shot}
          onSelect={(v) => setParams((p) => ({ ...p, shot: v }))}
          activeColor="indigo"
        />
        <details className="recipe-advanced">
          <summary>Advanced appearance</summary>
          <div className="recipe-advanced-grid">
            {' '}
            <ControlDropdown
              title="Detail Focus"
              icon={<ScanFace size={14} />}
              label={params.focus}
              options={CONTROL_OPTIONS.focus}
              onSelect={(v) => setParams((p) => ({ ...p, focus: v }))}
              activeColor="indigo"
            />
            <div className="w-px h-8 bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] mx-1 hidden sm:block" />
            <ControlDropdown
              title="Art Style"
              icon={<Palette size={14} />}
              label={params.style}
              options={CONTROL_OPTIONS.style}
              onSelect={(v) => setParams((p) => ({ ...p, style: v }))}
              activeColor="indigo"
            />
          </div>
        </details>
      </>
    ),
    [params, hasReference],
  );

  return (
    <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock}>
      <RecipeResults />
    </RecipeLayout>
  );
};
