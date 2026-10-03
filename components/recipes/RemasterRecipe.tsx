import React, { useCallback, useEffect, useMemo } from 'react';
import {
  SunLight as Sun,
  Camera,
  Palette,
  Tv as MonitorPlay,
  Fingerprint,
  Text as TextIcon,
} from 'iconoir-react';
import { RATIO_MAP } from '../../constants';
import type { AspectRatio, ImageGenerationConfig } from '../../types';
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
  style: getRecipeStringDefault(REMASTER_DEFAULTS, 'style', 'Archive Restoration'),
  lighting: getRecipeStringDefault(REMASTER_DEFAULTS, 'lighting', 'Preserve Lighting'),
  camera: getRecipeStringDefault(REMASTER_DEFAULTS, 'camera', 'Preserve Detail'),
  anatomy: getRecipeStringDefault(REMASTER_DEFAULTS, 'anatomy', 'Preserve Geometry and Identity'),
  text: getRecipeStringDefault(REMASTER_DEFAULTS, 'text', 'Keep Original'),
  color: getRecipeStringDefault(REMASTER_DEFAULTS, 'color', 'Preserve Colors'),
  fidelity: getRecipeNumberDefault(REMASTER_DEFAULTS, 'fidelity', 100),
};

type RemasterParams = typeof DEFAULT_PARAMS;

/** Reinterpret releases each preserve control to its correction counterpart. */
const REINTERPRET_PARAMS: Partial<RemasterParams> = {
  style: 'Realistic Reconstruction',
  lighting: 'Lighting Correction',
  camera: 'Texture Enhancement',
  anatomy: 'Fix Anatomy',
  color: 'Color Correction',
  fidelity: 35,
};

/** Sources whose ratio was already applied, so a later manual ratio survives remounts. */
const ratioAppliedSources = new Set<string>();

function nearestAspectRatio(width: number, height: number): AspectRatio {
  const target = Math.log(width / height);
  const distance = (ratio: AspectRatio) => Math.abs(Math.log(RATIO_MAP[ratio]) - target);
  return (Object.keys(RATIO_MAP) as AspectRatio[]).reduce((best, ratio) =>
    distance(ratio) < distance(best) ? ratio : best,
  );
}

function readRemasterParams(config: ImageGenerationConfig): RemasterParams {
  const stored = config.recipeId === 'remaster' ? (config.recipeParams ?? {}) : {};
  const text = (key: Exclude<keyof RemasterParams, 'fidelity'>) => {
    const value = stored[key];
    return typeof value === 'string' ? value : DEFAULT_PARAMS[key];
  };
  return {
    style: text('style'),
    lighting: text('lighting'),
    camera: text('camera'),
    anatomy: text('anatomy'),
    text: text('text'),
    color: text('color'),
    fidelity: typeof stored.fidelity === 'number' ? stored.fidelity : DEFAULT_PARAMS.fidelity,
  };
}

export const RemasterRecipe: React.FC<RemasterRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
}) => {
  const stored = readRemasterParams(config);
  const source = config.attachments[0];
  const sourceId = source?.id;
  const sourceRatio =
    source?.width && source.height ? nearestAspectRatio(source.width, source.height) : null;

  useEffect(() => {
    if (!sourceId || !sourceRatio || ratioAppliedSources.has(sourceId)) return;
    ratioAppliedSources.add(sourceId);
    updateConfig('aspectRatio', sourceRatio);
  }, [sourceId, sourceRatio, updateConfig]);

  const params = useMemo(
    () => ({
      style: stored.style,
      lighting: stored.lighting,
      camera: stored.camera,
      anatomy: stored.anatomy,
      text: stored.text,
      color: stored.color,
      fidelity: stored.fidelity,
    }),
    [
      stored.anatomy,
      stored.camera,
      stored.color,
      stored.fidelity,
      stored.lighting,
      stored.style,
      stored.text,
    ],
  );

  useRecipeContextRegistration(updateConfig, 'remaster', params);

  const setParams = useCallback(
    (patch: Partial<RemasterParams>) => updateConfig('recipeParams', { ...params, ...patch }),
    [params, updateConfig],
  );

  const BottomDock = useMemo(
    () => (
      <>
        <div className="create-tool-block">
          <div className="flex gap-2">
            <button
              type="button"
              className="studio-ghost-control px-3 py-2"
              onClick={() => setParams(DEFAULT_PARAMS)}
            >
              Restore safely
            </button>
            <button
              type="button"
              className="studio-ghost-control px-3 py-2"
              onClick={() => setParams(REINTERPRET_PARAMS)}
            >
              Reinterpret
            </button>
          </div>
          <p className="mt-2 text-xs text-[color:var(--wb-muted)]">
            {params.anatomy} · {params.text} · {params.lighting} · {params.color} · {params.camera}.
            These are instructions, not a guarantee of exact preservation.
          </p>
        </div>
        <div className="flex flex-col gap-2 px-6 border-r border-[color:var(--wb-line)] min-w-[240px]">
          <div className="flex justify-between text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-dim)]">
            <span>Creative Freedom</span>
            <span>Faithful to Original</span>
          </div>
          <label className="flex items-center justify-between gap-2 text-xs">
            Fidelity
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              aria-label="Fidelity value"
              value={params.fidelity}
              onChange={(event) =>
                setParams({
                  fidelity: Math.max(0, Math.min(100, Number(event.target.value) || 0)),
                })
              }
              className="w-16 rounded border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] p-1"
            />
          </label>
          <input
            type="range"
            min={FIDELITY_RANGE.min}
            max={FIDELITY_RANGE.max}
            step={FIDELITY_RANGE.step}
            value={params.fidelity}
            onChange={(e) => setParams({ fidelity: parseInt(e.target.value) })}
            aria-label="Fidelity"
            className="w-full h-1 bg-[color:var(--wb-bar)] rounded-full appearance-none cursor-pointer accent-accent-500"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center flex-1">
          <ControlDropdown
            title="Aesthetic"
            icon={<MonitorPlay width={14} height={14} />}
            label={params.style}
            options={CONTROL_OPTIONS.style}
            onSelect={(v) => setParams({ style: v })}
          />
        </div>
        <details className="recipe-advanced">
          <summary>Advanced corrections</summary>
          <div className="recipe-advanced-grid">
            {' '}
            <ControlDropdown
              title="Lighting"
              icon={<Sun width={14} height={14} />}
              label={params.lighting}
              options={CONTROL_OPTIONS.lighting}
              onSelect={(v) => setParams({ lighting: v })}
            />
            <ControlDropdown
              title="Correction"
              icon={<Fingerprint width={14} height={14} />}
              label={params.anatomy}
              options={CONTROL_OPTIONS.anatomy}
              onSelect={(v) => setParams({ anatomy: v })}
            />
            <ControlDropdown
              title="Text Handling"
              icon={<TextIcon width={14} height={14} />}
              label={params.text}
              options={CONTROL_OPTIONS.text}
              onSelect={(v) => setParams({ text: v })}
            />
            <ControlDropdown
              title="Color Grading"
              icon={<Palette width={14} height={14} />}
              label={params.color}
              options={CONTROL_OPTIONS.color}
              onSelect={(v) => setParams({ color: v })}
            />
            <ControlDropdown
              title="Lens Details"
              icon={<Camera width={14} height={14} />}
              label={params.camera}
              options={CONTROL_OPTIONS.camera}
              onSelect={(v) => setParams({ camera: v })}
            />
          </div>
        </details>
      </>
    ),
    [params, setParams],
  );

  return (
    <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock}>
      <RecipeResults />
    </RecipeLayout>
  );
};
