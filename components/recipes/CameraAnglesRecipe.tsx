import { RecipeControls } from './RecipeWorkbenchContext';
import React, { useState, useRef, useMemo } from 'react';
import {
  IconUpload as Upload,
  IconX as X,
  IconRotateClockwise as RotateCw,
  IconArrowBarUp as ArrowUpFromLine,
  IconZoomIn as ZoomIn,
  IconCamera as Camera,
  IconEye as Eye,
  IconRotate3d as Move3d,
  IconAdjustmentsHorizontal as SlidersHorizontal,
  IconLoader2 as Loader2,
  IconMaximize as Maximize2,
  IconPointer as MousePointer2,
} from '@tabler/icons-react';
import type { Attachment, ImageGenerationConfig, GeneratedImageWithConfig } from '../../types';
import { useCameraViewport } from '../../hooks/useCameraViewport';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { createCameraRecipeParams } from '../../lib/recipeDerivedParams';
import { hasRecipeIdentity } from '../../lib/recipeIdentity';
import { RecipeLayout } from './RecipeLayout';
import { QuickStartText } from './QuickStartText';
import { getRecipeModuleUiModel, getRecipeRange } from './recipeModuleUi';

interface CameraAnglesRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating: boolean;
  images: GeneratedImageWithConfig[];
  onSelectImage: (image: GeneratedImageWithConfig) => void;
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
  cameraImages: GeneratedImageWithConfig[];
  onSelectImage: (img: GeneratedImageWithConfig) => void;
}

function CameraAnglesInfoPanel({
  hPos,
  vPos,
  framing,
  cameraImages,
  onSelectImage,
}: CameraAnglesInfoPanelProps) {
  return (
    <>
      {/* Output Stats */}
      <div className="shrink-0 rounded-2xl border border-white/2 bg-zinc-900/40 p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Eye size={14} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
              Virtual framing
            </h3>
            <p className="text-[8px] text-zinc-500 font-bold uppercase">
              Camera settings for the next image
            </p>
          </div>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-white/2 space-y-2">
          <p className="text-[10px] font-bold text-zinc-300 leading-relaxed">
            <span className="text-cyan-500">POS:</span> {hPos}
          </p>
          <p className="text-[10px] font-bold text-zinc-300 leading-relaxed">
            <span className="text-pink-500">ANG:</span> {vPos}
          </p>
          <p className="text-[10px] font-bold text-zinc-300 leading-relaxed">
            <span className="text-yellow-500">LENS:</span> {framing}
          </p>
        </div>
      </div>

      {/* Workspace Gallery */}
      {cameraImages.length > 0 && (
        <div className="flex-1 min-h-0 bg-black/40 border border-white/2 rounded-2xl p-2 flex flex-col gap-2 overflow-hidden shadow-inner">
          <div className="flex shrink-0 items-center justify-between px-2">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              Workspace Gallery
            </span>
            <span className="text-[9px] font-bold text-zinc-600 uppercase">
              {cameraImages.length} Renders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-2 p-1 content-start">
            {cameraImages.map((img) => (
              <button
                type="button"
                aria-label={`Select camera image ${img.id}`}
                key={img.id}
                onClick={() => onSelectImage(img)}
                className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/2 hover:border-cyan-500/2 transition-[border-color,box-shadow] group shadow-sm hover:shadow-lg"
              >
                <img
                  src={img.thumbnail || img.src}
                  className="size-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  alt=""
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 size={16} className="text-white drop-shadow-md" />
                </div>
                {img.isFavorite && (
                  <div className="absolute top-1 right-1 size-2 bg-cyan-500 rounded-full shadow-lg" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export const CameraAnglesRecipe: React.FC<CameraAnglesRecipeProps> = ({
  config,
  updateConfig,
  onFileSelect,
  isGenerating,
  images,
  onSelectImage,
}) => {
  const [isEstimating, setIsEstimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImage = config.attachments[0];
  const hasReference = !!activeImage;
  const {
    mountRef,
    cameraState: { azimuth, elevation, distance },
    setAzimuth,
    setElevation,
    setDistance,
  } = useCameraViewport({
    aspectRatio: config.aspectRatio,
    initialState: config.recipeId === 'camera' ? (config.recipeParams ?? undefined) : undefined,
    referenceImageSrc: activeImage?.dataUrl ?? null,
  });

  // Calculate aspect ratio for the box
  const ratioValue = useMemo(() => {
    const [w, h] = config.aspectRatio.split(':').map(Number);
    return w / h;
  }, [config.aspectRatio]);

  // Find images generated by this recipe specifically
  const cameraImages = useMemo(() => {
    return images.filter((img) => hasRecipeIdentity(img.config, 'camera'));
  }, [images]);
  const recipeParams = useMemo(
    () => createCameraRecipeParams({ azimuth, elevation, distance, hasReference }),
    [azimuth, distance, elevation, hasReference],
  );
  const { hPos, vPos, framing } = recipeParams;

  useRecipeContextRegistration(updateConfig, 'camera', recipeParams);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFileSelect(files);
  };

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
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-2">
              <RotateCw size={12} className="text-cyan-400" /> Azimuth
            </div>
            <span className="text-cyan-400 font-mono">{Math.round(azimuth)}°</span>
          </div>
          <input
            type="range"
            min={CAMERA_RANGES.azimuth.min}
            max={CAMERA_RANGES.azimuth.max}
            step={CAMERA_RANGES.azimuth.step}
            value={azimuth}
            onChange={(e) => setAzimuth(parseInt(e.target.value))}
            aria-label="Azimuth"
            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
          />
        </div>

        <div className="flex-1 min-w-45 space-y-3">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-2">
              <ArrowUpFromLine size={12} className="text-pink-400" /> Elevation
            </div>
            <span className="text-pink-400 font-mono">{Math.round(elevation)}°</span>
          </div>
          <input
            type="range"
            min={CAMERA_RANGES.elevation.min}
            max={CAMERA_RANGES.elevation.max}
            step={CAMERA_RANGES.elevation.step}
            value={elevation}
            onChange={(e) => setElevation(parseInt(e.target.value))}
            aria-label="Elevation"
            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-pink-400 hover:accent-pink-300"
          />
        </div>

        <div className="flex-1 min-w-45 space-y-3">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-2">
              <ZoomIn size={12} className="text-yellow-400" /> Zoom
            </div>
            <span className="text-yellow-400 font-mono">{Math.round(distance)}%</span>
          </div>
          <input
            type="range"
            min={CAMERA_RANGES.distance.min}
            max={CAMERA_RANGES.distance.max}
            step={CAMERA_RANGES.distance.step}
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            aria-label="Zoom"
            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300"
          />
        </div>
      </div>
    ),
    [azimuth, elevation, distance, setAzimuth, setElevation, setDistance],
  );

  return (
    <RecipeLayout
      isGenerating={isGenerating}
      bottomDock={BottomDock}
      className="flex flex-col p-3 pb-[var(--studio-recipe-dock-space)] gap-4 sm:p-4 sm:pb-32 sm:gap-6"
    >
      <div className="custom-scrollbar flex h-full flex-col gap-4 overflow-y-auto lg:flex-row lg:gap-6 lg:overflow-hidden">
        {/* LEFT: THREE.JS VIEWPORT */}
        <div className="relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/2 shadow-2xl sm:rounded-3xl sm:min-h-100 lg:min-h-0">
          {/* Viewport Overlay Controls */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/2 bg-black/40 backdrop-blur-sm">
              <Move3d size={12} className="text-cyan-400" />
              <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                Orbit & Zoom
              </span>
            </div>
            <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-500 bg-black/40 p-2 rounded-lg border border-white/2">
              <span className="text-cyan-400">AZ: {Math.round(azimuth)}°</span>
              <span className="text-pink-400">EL: {Math.round(elevation)}°</span>
              <span className="text-yellow-400">DIST: {Math.round(distance)}%</span>
            </div>
          </div>

          {/* CANVAS CONTAINER */}
          <div ref={mountRef} className="flex-1 size-full relative cursor-move touch-none group">
            <div className="pip-viewport absolute right-3 top-3 z-30 hidden h-28 w-36 overflow-hidden rounded-lg border-2 border-white/2 bg-black/50 shadow-2xl backdrop-blur-sm pointer-events-none sm:block lg:right-6 lg:top-6 lg:h-45 lg:w-60">
              <div className="absolute top-0 left-0 px-2 py-0.5 bg-black/50 text-cyan-400 text-[8px] font-black uppercase tracking-widest">
                CAM VIEW
              </div>
            </div>

            {/* Instruction Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/40 border border-white/2 backdrop-blur-sm text-zinc-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <MousePointer2 size={12} className="text-white" /> Drag to Orbit
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1.5">
                <ZoomIn size={12} className="text-white" /> Scroll to Zoom
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
              <CameraAnglesInfoPanel
                hPos={hPos}
                vPos={vPos}
                framing={framing}
                cameraImages={cameraImages}
                onSelectImage={onSelectImage}
              />
            </details>
          </div>
        </RecipeControls>
      </div>
    </RecipeLayout>
  );
};
