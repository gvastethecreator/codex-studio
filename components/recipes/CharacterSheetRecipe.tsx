import React, { useMemo } from 'react';
import { LayoutLeft as Layout, Palette, Camera, UserScan as ScanFace } from 'iconoir-react';
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

type SheetParamKey = keyof typeof DEFAULT_PARAMS;

/** Framings each layout instruction can honor. Unlisted layouts accept any framing. */
const LAYOUT_SHOTS: Partial<Record<string, readonly string[]>> = {
  'Classic Turnaround': ['Full Body'],
  'Isometric Sheet': ['Full Body'],
  'Dynamic Sheet': ['Full Body', 'Knee Up'],
  'Expression Sheet': ['Portrait (Headshot)', 'Upper Body'],
};

function getShotOptions(layout: string) {
  const allowed = LAYOUT_SHOTS[layout];
  return allowed
    ? CONTROL_OPTIONS.shot.filter((shot) => allowed.includes(shot))
    : CONTROL_OPTIONS.shot;
}

function withCompatibleShot<T extends Record<SheetParamKey, string>>(params: T): T {
  const shots = getShotOptions(params.layout);
  return shots.includes(params.shot) ? params : { ...params, shot: shots[0] ?? params.shot };
}

/** Controls follow the config so restored jobs show their saved values. */
function readSheetParams(config: ImageGenerationConfig) {
  const saved = config.recipeId === 'character' ? (config.recipeParams ?? {}) : {};
  const read = (key: SheetParamKey) => {
    const value = saved[key];
    return typeof value === 'string' && value ? value : DEFAULT_PARAMS[key];
  };
  return withCompatibleShot({
    layout: read('layout'),
    style: read('style'),
    shot: read('shot'),
    focus: read('focus'),
  });
}

export const CharacterSheetRecipe: React.FC<CharacterSheetRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
}) => {
  const { layout, style, shot, focus } = readSheetParams(config);
  const hasReference = config.attachments.length > 0;
  const recipeParams = useMemo(
    () => ({ layout, style, shot, focus, hasReference }),
    [focus, layout, shot, style, hasReference],
  );

  useRecipeContextRegistration(updateConfig, 'character', recipeParams);

  const BottomDock = useMemo(() => {
    const select = (key: SheetParamKey) => (value: string) =>
      updateConfig('recipeParams', withCompatibleShot({ ...recipeParams, [key]: value }));
    return (
      <>
        <ControlDropdown
          title="Sheet Type"
          icon={<Layout width={14} height={14} />}
          label={recipeParams.layout}
          options={CONTROL_OPTIONS.layout}
          onSelect={select('layout')}
        />
        <div className="w-px h-8 bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] mx-1 hidden sm:block" />
        <ControlDropdown
          title="Framing"
          icon={<Camera width={14} height={14} />}
          label={recipeParams.shot}
          options={getShotOptions(recipeParams.layout)}
          onSelect={select('shot')}
        />
        <details className="recipe-advanced">
          <summary>Advanced appearance</summary>
          <div className="recipe-advanced-grid">
            {' '}
            <ControlDropdown
              title="Detail Focus"
              icon={<ScanFace width={14} height={14} />}
              label={recipeParams.focus}
              options={CONTROL_OPTIONS.focus}
              onSelect={select('focus')}
            />
            <div className="w-px h-8 bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] mx-1 hidden sm:block" />
            <ControlDropdown
              title="Art Style"
              icon={<Palette width={14} height={14} />}
              label={recipeParams.style}
              options={CONTROL_OPTIONS.style}
              onSelect={select('style')}
            />
          </div>
        </details>
      </>
    );
  }, [recipeParams, updateConfig]);

  return (
    <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock}>
      <RecipeResults />
    </RecipeLayout>
  );
};
