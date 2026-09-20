import { RecipeControls } from './RecipeWorkbenchContext';
import React, { useState, useMemo } from 'react';
import {
  IconRotateClockwise as RotateCw,
  IconArrowBarUp as ArrowUpFromLine,
  IconZoomIn as ZoomIn,
  IconCamera as Camera,
  IconEye as Eye,
  IconRotate3d as Move3d,
  IconLoader2 as Loader2,
  IconPointer as MousePointer2,
} from '@tabler/icons-react';
import type { ImageGenerationConfig } from '../../types';
import { useCameraViewport } from '../../hooks/useCameraViewport';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { createCameraRecipeParams } from '../../lib/recipeDerivedParams';
import { RecipeLayout } from './RecipeLayout';
import { QuickStartText } from './QuickStartText';
import { getRecipeModuleUiModel, getRecipeRange } from './recipeModuleUi';

interface CameraAnglesRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  isGenerating: boolean;
}

const { module: CAMERA_MODULE } = getRecipeModuleUiModel('camera');
const CAMERA_RANGES = {
  azimuth: getRecipeRange(CAMERA_MODULE, 'azimuth', { min: -180, max: 180, step: 1 }),
  elevation: getRecipeRange(CAMERA_MODULE, 'elevation', { min: -85, max: 85, step: 1 }),
  distance: getRecipeRange(CAMERA_MODULE, 'distance', { min: 20, max: 200, step: 1 }),
};

interface CameraAnglesInfoPanelProps {
  hPos: string;
  vPos: string;
  framing: string;
}

function CameraAnglesInfoPanel({ hPos, vPos, framing }: CameraAnglesInfoPanelProps) {
  return (
    <>
      {/* Output Stats */}
      <div className="shrink-0 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-cyan-500/10 rounded-[var(--wb-radius)]">
            <Eye size={14} className="text-[color:var(--wb-info)]" />
          </div>
          <div>
            <h3 className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)] tracking-normal">
              Virtual framing
            </h3>
            <p className="text-[length:var(--wbp-label)] text-[color:var(--wb-muted)] font-bold">
              Camera settings for the next image
            </p>
          </div>
        </div>
        <div className="p-3 bg-[color:var(--wb-well)] rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] space-y-2">
          <p className="text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-ink)] leading-relaxed">
            <span className="text-cyan-500">POS:</span> {hPos}
          </p>
          <p className="text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-ink)] leading-relaxed">
            <span className="text-pink-500">ANG:</span> {vPos}
          </p>
          <p className="text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-ink)] leading-relaxed">
            <span className="text-yellow-500">LENS:</span> {framing}
          </p>
        </div>
      </div>
    </>
  );
}

export const CameraAnglesRecipe: React.FC<CameraAnglesRecipeProps> = ({
  config,
  updateConfig,
  isGenerating,
}) => {
  const [isEstimating, setIsEstimating] = useState(false);

  const activeImage = config.attachments[0];
  const hasReference = !!activeImage;
  const {
    mountRef,
    viewportError,
    cameraState: { azimuth, elevation, distance },
    setAzimuth,
    setElevation,
    setDistance,
  } = useCameraViewport({
    aspectRatio: config.aspectRatio,
    initialState: config.recipeId === 'camera' ? (config.recipeParams ?? undefined) : undefined,
    referenceImageSrc: activeImage?.dataUrl ?? null,
  });

  const recipeParams = useMemo(
    () => createCameraRecipeParams({ azimuth, elevation, distance, hasReference }),
    [azimuth, distance, elevation, hasReference],
  );
  const { hPos, vPos, framing } = recipeParams;

  useRecipeContextRegistration(updateConfig, 'camera', recipeParams);

  const handleEstimateCamera = async () => {
    if (!activeImage || isEstimating) return;
    setIsEstimating(true);

    try {
      const image = new Image();
      image.src = activeImage.dataUrl;
      await image.decode();

      const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
      setAzimuth(ratio > 1.25 ? 25 : ratio < 0.8 ? -15 : 0);
      setElevation(image.naturalHeight > image.naturalWidth ? 8 : 0);
      setDistance(ratio > 1.6 ? 120 : ratio < 0.75 ? 85 : 100);
    } catch (error) {
      setAzimuth(0);
      setElevation(0);
      setDistance(100);
    } finally {
      setIsEstimating(false);
    }
  };

  const BottomDock = useMemo(
    () => (
      <div className="w-full flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-45 space-y-3">
          <div className="flex justify-between text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
            <div className="flex items-center gap-2">
              <RotateCw size={12} className="text-[color:var(--wb-info)]" /> Azimuth
            </div>
            <span className="text-[color:var(--wb-info)] font-mono">{Math.round(azimuth)}°</span>
          </div>
          <input
            type="range"
            min={CAMERA_RANGES.azimuth.min}
            max={CAMERA_RANGES.azimuth.max}
            step={CAMERA_RANGES.azimuth.step}
            value={azimuth}
            onChange={(e) => setAzimuth(parseInt(e.target.value))}
            aria-label="Azimuth"
            className="studio-range"
          />
        </div>

        <div className="flex-1 min-w-45 space-y-3">
          <div className="flex justify-between text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine size={12} className="text-[color:var(--wb-danger)]" /> Elevation
            </div>
            <span className="text-[color:var(--wb-danger)] font-mono">
              {Math.round(elevation)}°
            </span>
          </div>
          <input
            type="range"
            min={CAMERA_RANGES.elevation.min}
            max={CAMERA_RANGES.elevation.max}
            step={CAMERA_RANGES.elevation.step}
            value={elevation}
            onChange={(e) => setElevation(parseInt(e.target.value))}
            aria-label="Elevation"
            className="studio-range"
          />
        </div>

        <div className="flex-1 min-w-45 space-y-3">
          <div className="flex justify-between text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-muted)]">
            <div className="flex items-center gap-2">
              <ZoomIn size={12} className="text-[color:var(--wb-warning)]" /> Zoom
            </div>
            <span className="text-[color:var(--wb-warning)] font-mono">
              {Math.round(distance)}%
            </span>
          </div>
          <input
            type="range"
            min={CAMERA_RANGES.distance.min}
            max={CAMERA_RANGES.distance.max}
            step={CAMERA_RANGES.distance.step}
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            aria-label="Zoom"
            className="studio-range"
          />
        </div>
      </div>
    ),
    [azimuth, elevation, distance, setAzimuth, setElevation, setDistance],
  );

  return (
    <RecipeLayout
      editorLabel="Camera"
      isGenerating={isGenerating}
      bottomDock={BottomDock}
      className="flex min-h-0 flex-col"
    >
      <div className="custom-scrollbar flex h-full flex-col gap-4 overflow-y-auto lg:flex-row lg:gap-6 lg:overflow-hidden">
        {/* LEFT: THREE.JS VIEWPORT */}
        <div className="relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] shadow-2xl sm:rounded-[var(--wb-radius)] sm:min-h-100 lg:min-h-0">
          {/* Viewport Overlay Controls */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-well)] backdrop-blur-sm">
              <Move3d size={12} className="text-[color:var(--wb-info)]" />
              <span className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)] tracking-normal">
                Orbit & Zoom
              </span>
            </div>
            <div className="flex flex-col gap-1 text-[length:var(--wbp-label)] font-mono text-[color:var(--wb-muted)] bg-[color:var(--wb-well)] p-2 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)]">
              <span className="text-[color:var(--wb-info)]">AZ: {Math.round(azimuth)}°</span>
              <span className="text-[color:var(--wb-danger)]">EL: {Math.round(elevation)}°</span>
              <span className="text-[color:var(--wb-warning)]">DIST: {Math.round(distance)}%</span>
            </div>
          </div>

          {/* CANVAS CONTAINER */}
          <div ref={mountRef} className="flex-1 size-full relative cursor-move touch-none group">
            <div className="pip-viewport absolute right-3 top-3 z-30 hidden h-28 w-36 overflow-hidden rounded-[var(--wb-radius)] border-2 border-[color:var(--wb-line)] bg-[color:var(--wb-well)] shadow-2xl backdrop-blur-sm pointer-events-none sm:block lg:right-6 lg:top-6 lg:h-45 lg:w-60">
              <div className="absolute top-0 left-0 px-2 py-0.5 bg-[color:var(--wb-well)] text-[color:var(--wb-info)] text-[length:var(--wbp-label)] font-semibold tracking-normal">
                CAM VIEW
              </div>
            </div>

            {viewportError ? (
              <div
                role="status"
                className="absolute inset-0 z-40 grid place-items-center bg-[color:var(--wb-panel)] p-6 text-center text-sm text-[color:var(--wb-ink)]"
              >
                {viewportError}
              </div>
            ) : null}
            {/* Instruction Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-[var(--wb-radius)] bg-[color:var(--wb-well)] border border-[color:var(--wb-line)] backdrop-blur-sm text-[color:var(--wb-muted)] text-[length:var(--wbp-label)] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <MousePointer2 size={12} className="text-[color:var(--wb-ink)]" /> Drag to Orbit
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1.5">
                <ZoomIn size={12} className="text-[color:var(--wb-ink)]" /> Scroll to Zoom
              </span>
            </div>
          </div>
        </div>

        <RecipeControls>
          <div className="w-full flex min-h-0 shrink-0 flex-col gap-4">
            {hasReference && (
              <button type="button" onClick={handleEstimateCamera} disabled={isEstimating}>
                Fit camera to reference
              </button>
            )}
            <details>
              <summary>Virtual framing details</summary>
              <CameraAnglesInfoPanel hPos={hPos} vPos={vPos} framing={framing} />
            </details>
          </div>
        </RecipeControls>
      </div>
    </RecipeLayout>
  );
};
