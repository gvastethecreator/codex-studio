import React, { useState, useMemo } from 'react';
import {
  IconSun as Sun,
  IconCamera as Camera,
  IconPalette as Palette,
  IconDeviceTv as MonitorPlay,
  IconFingerprint as Fingerprint,
  IconTypography as TextIcon,
} from '@tabler/icons-react';
import type { ImageGenerationConfig } from '../../types';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { RecipeLayout } from './RecipeLayout';
import { RecipeResults } from './RecipeWorkbenchContext';
import { ControlDropdown } from './RecipeUI';
import {
  getRecipeModuleUiModel,
  getRecipeNumberDefault,
  getRecipeOptions,
  getRecipeRange,
  getRecipeStringDefault,
} from './recipeModuleUi';

interface RemasterRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  isGenerating: boolean;
}

const { module: REMASTER_MODULE, defaults: REMASTER_DEFAULTS } = getRecipeModuleUiModel('remaster');

const CONTROL_OPTIONS = {
  style: getRecipeOptions(REMASTER_MODULE, 'style'),
  lighting: getRecipeOptions(REMASTER_MODULE, 'lighting'),
  camera: getRecipeOptions(REMASTER_MODULE, 'camera'),
  anatomy: getRecipeOptions(REMASTER_MODULE, 'anatomy'),
  text: getRecipeOptions(REMASTER_MODULE, 'text'),
  color: getRecipeOptions(REMASTER_MODULE, 'color'),
};

const FIDELITY_RANGE = getRecipeRange(REMASTER_MODULE, 'fidelity', { min: 0, max: 100, step: 1 });

const DEFAULT_PARAMS = {
  style: getRecipeStringDefault(REMASTER_DEFAULTS, 'style', 'Realistic Reconstruction'),
  lighting: getRecipeStringDefault(REMASTER_DEFAULTS, 'lighting', 'Lighting Correction'),
  camera: getRecipeStringDefault(REMASTER_DEFAULTS, 'camera', 'Sharp Focus'),
  anatomy: getRecipeStringDefault(REMASTER_DEFAULTS, 'anatomy', 'Fix Anatomy'),
  text: getRecipeStringDefault(REMASTER_DEFAULTS, 'text', 'Rewrite Logically'),
  color: getRecipeStringDefault(REMASTER_DEFAULTS, 'color', 'Expanded Dynamic Range'),
  fidelity: getRecipeNumberDefault(REMASTER_DEFAULTS, 'fidelity', 35),
};

export const RemasterRecipe: React.FC<RemasterRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
}) => {
  const [params, setParams] = useState(
    () =>
      ({
        ...DEFAULT_PARAMS,
        ...(config.recipeId === 'remaster' ? config.recipeParams : {}),
      }) as typeof DEFAULT_PARAMS,
  );

  const recipeParams = useMemo(
    () => ({
      style: params.style,
      lighting: params.lighting,
      camera: params.camera,
      anatomy: params.anatomy,
      text: params.text,
      color: params.color,
      fidelity: params.fidelity,
    }),
    [
      params.anatomy,
      params.camera,
      params.color,
      params.fidelity,
      params.lighting,
      params.style,
      params.text,
    ],
  );

  useRecipeContextRegistration(updateConfig, 'remaster', recipeParams);

  const BottomDock = useMemo(
    () => (
      <>
        <div className="flex flex-col gap-2 px-6 border-r border-[color:var(--wb-line)] min-w-[240px]">
          <div className="flex justify-between text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
            <span>Creative Freedom</span>
            <span>Faithful to Original</span>
          </div>
          <input
            type="range"
            min={FIDELITY_RANGE.min}
            max={FIDELITY_RANGE.max}
            step={FIDELITY_RANGE.step}
            value={params.fidelity}
            onChange={(e) => setParams((p) => ({ ...p, fidelity: parseInt(e.target.value) }))}
            aria-label="Fidelity"
            className="w-full h-1 bg-[color:var(--wb-bar)] rounded-full appearance-none cursor-pointer accent-accent-500"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center flex-1">
          <ControlDropdown
            title="Aesthetic"
            icon={<MonitorPlay size={14} />}
            label={params.style}
            options={CONTROL_OPTIONS.style}
            onSelect={(v) => setParams((p) => ({ ...p, style: v }))}
          />
        </div>
        <details className="recipe-advanced">
          <summary>Advanced corrections</summary>
          <div className="recipe-advanced-grid">
            {' '}
            <ControlDropdown
              title="Lighting"
              icon={<Sun size={14} />}
              label={params.lighting}
              options={CONTROL_OPTIONS.lighting}
              onSelect={(v) => setParams((p) => ({ ...p, lighting: v }))}
            />
            <ControlDropdown
              title="Correction"
              icon={<Fingerprint size={14} />}
              label={params.anatomy}
              options={CONTROL_OPTIONS.anatomy}
              onSelect={(v) => setParams((p) => ({ ...p, anatomy: v }))}
            />
            <ControlDropdown
              title="Text Handling"
              icon={<TextIcon size={14} />}
              label={params.text}
              options={CONTROL_OPTIONS.text}
              onSelect={(v) => setParams((p) => ({ ...p, text: v }))}
            />
            <ControlDropdown
              title="Color Grading"
              icon={<Palette size={14} />}
              label={params.color}
              options={CONTROL_OPTIONS.color}
              onSelect={(v) => setParams((p) => ({ ...p, color: v }))}
            />
            <ControlDropdown
              title="Lens Details"
              icon={<Camera size={14} />}
              label={params.camera}
              options={CONTROL_OPTIONS.camera}
              onSelect={(v) => setParams((p) => ({ ...p, camera: v }))}
            />
          </div>
        </details>
      </>
    ),
    [params],
  );

  return (
    <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock}>
      <RecipeResults />
    </RecipeLayout>
  );
};
