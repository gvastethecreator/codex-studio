import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Grid3X3,
  Palette,
  PaintBucket,
  Eye,
  SeparatorHorizontal,
  Hash,
  ScanLine,
  Edit3,
  X,
  ChevronLeft,
} from 'lucide-react';
import type { ImageGenerationConfig, AspectRatio } from '../../types';
import { RATIO_MAP } from '../../constants';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown, MinimalColorPicker } from './RecipeUI';
import { getRecipeModuleUiModel, getRecipeOptions, getRecipeStringDefault } from './recipeModuleUi';

interface SpritesheetRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating?: boolean;
}

const { module: SPRITESHEET_MODULE, defaults: SPRITESHEET_DEFAULTS } =
  getRecipeModuleUiModel('spritesheet');

const CONTROL_OPTIONS = {
  view: getRecipeOptions(SPRITESHEET_MODULE, 'view'),
  style: getRecipeOptions(SPRITESHEET_MODULE, 'style'),
  grid: getRecipeOptions(SPRITESHEET_MODULE, 'grid'),
  background: getRecipeOptions(SPRITESHEET_MODULE, 'background'),
  dividers: getRecipeOptions(SPRITESHEET_MODULE, 'dividers'),
};

const DEFAULT_PARAMS = {
  view: getRecipeStringDefault(SPRITESHEET_DEFAULTS, 'view', 'Match Source'),
  style: getRecipeStringDefault(SPRITESHEET_DEFAULTS, 'style', 'Preserve Style'),
  grid: getRecipeStringDefault(SPRITESHEET_DEFAULTS, 'grid', '2x2'),
  background: getRecipeStringDefault(SPRITESHEET_DEFAULTS, 'background', 'Dark Grey'),
  dividers: getRecipeStringDefault(SPRITESHEET_DEFAULTS, 'dividers', 'No Dividers'),
};

export const SpritesheetRecipe: React.FC<SpritesheetRecipeProps> = ({
  config,
  updateConfig,
  onGenerate,
  isGenerating = false,
}) => {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const [customColor, setCustomColor] = useState('#3f3f46');
  const [cellPrompts, setCellPrompts] = useState<Record<number, string>>({});
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const cellInputRef = useRef<HTMLTextAreaElement>(null);
  const ratioValue = RATIO_MAP[config.aspectRatio] || 1;

  useEffect(() => {
    if (editingCell !== null && cellInputRef.current) cellInputRef.current.focus();
  }, [editingCell]);

  const [gridCols, gridRows] = useMemo(
    () => (params.grid.includes('Strip') ? [6, 1] : params.grid.split('x').map(Number)),
    [params.grid],
  );

  const recipeParams = useMemo(
    () => ({
      view: params.view,
      style: params.style,
      grid: params.grid,
      background: params.background,
      dividers: params.dividers,
      customColor,
      cellPrompts,
    }),
    [
      cellPrompts,
      customColor,
      params.background,
      params.dividers,
      params.grid,
      params.style,
      params.view,
    ],
  );

  useRecipeContextRegistration(updateConfig, 'spritesheet', recipeParams);

  const getDividerStyle = () => {
    switch (params.dividers) {
      case 'Red Lines':
        return 'bg-red-500';
      case 'Blue Lines':
        return 'bg-blue-500';
      case 'Black Lines':
        return 'bg-black';
      case 'White Lines':
        return 'bg-white';
      default:
        return 'bg-transparent';
    }
  };

  const getBackgroundClass = () => {
    if (params.background === 'Checkerboard')
      return 'bg-[linear-gradient(45deg,#27272a_25%,transparent_25%,transparent_75%,#27272a_75%,#27272a),linear-gradient(45deg,#27272a_25%,transparent_25%,transparent_75%,#27272a_75%,#27272a)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] bg-zinc-900';
    if (params.background.includes('Green')) return 'bg-[#00FF00]';
    if (params.background === 'White') return 'bg-white';
    if (params.background === 'Black') return 'bg-black';
    if (params.background === 'Dark Grey') return 'bg-zinc-800';
    return '';
  };

  const isLightBg = params.background === 'White' || params.background.includes('Green');

  const availWidthCSS = isSidebarOpen ? 'calc(100vw - 360px)' : 'calc(100vw - 48px)';
  const availHeightCSS = 'calc(100vh - 350px)'; // Account for dock

  const BottomDock = useMemo(
    () => (
      <>
        <ControlDropdown
          title="Perspective"
          icon={<Eye size={14} />}
          label={params.view}
          options={CONTROL_OPTIONS.view}
          onSelect={(v) => setParams((p) => ({ ...p, view: v }))}
          activeColor="emerald"
        />
        <ControlDropdown
          title="Render Style"
          icon={<Palette size={14} />}
          label={params.style}
          options={CONTROL_OPTIONS.style}
          onSelect={(v) => setParams((p) => ({ ...p, style: v }))}
          activeColor="emerald"
        />
        <ControlDropdown
          title="Layout"
          icon={<Grid3X3 size={14} />}
          label={params.grid}
          options={CONTROL_OPTIONS.grid}
          onSelect={(v) => setParams((p) => ({ ...p, grid: v }))}
          activeColor="emerald"
        />
        <ControlDropdown
          title="Background"
          icon={<PaintBucket size={14} />}
          label={params.background}
          options={CONTROL_OPTIONS.background}
          onSelect={(v) => setParams((p) => ({ ...p, background: v }))}
          activeColor="emerald"
        />
        {params.background === 'Custom' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">
              Hex
            </span>
            <MinimalColorPicker color={customColor} onChange={setCustomColor} />
          </div>
        )}
        <ControlDropdown
          title="Separation"
          icon={<SeparatorHorizontal size={14} />}
          label={params.dividers}
          options={CONTROL_OPTIONS.dividers}
          onSelect={(v) => setParams((p) => ({ ...p, dividers: v }))}
          activeColor="emerald"
        />
        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block" />
        <div className="px-2 hidden sm:block">
          <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">
            Status
          </div>
          <div className="text-[10px] font-bold text-white leading-none">Ready</div>
        </div>
      </>
    ),
    [params, customColor],
  );

  const hasDividers = params.dividers !== 'No Dividers';
  const gridContainerStyle = useMemo<React.CSSProperties>(
    () => ({
      aspectRatio: ratioValue,
      width: `min(${availWidthCSS}, ${availHeightCSS} * ${ratioValue})`,
      height: `min(${availHeightCSS}, ${availWidthCSS} / ${ratioValue})`,
      display: 'grid',
      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      gridTemplateRows: `repeat(${gridRows}, 1fr)`,
      gap: hasDividers ? '1px' : '0px',
      padding: hasDividers ? '1px' : '0px',
    }),
    [ratioValue, availWidthCSS, availHeightCSS, gridCols, gridRows, hasDividers],
  );

  return (
    <RecipeLayout
      isGenerating={!!isGenerating}
      bottomDock={BottomDock}
      className="p-6 pt-20 pb-48 flex items-center justify-center"
    >
      <div className="flex size-full gap-6 items-center justify-center relative">
        {/* CANVAS AREA */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-0 h-full">
          {/* Auto-Scaling Container */}
          <div
            className={`relative border-2 border-dashed transition-all duration-500 ease-out-expo overflow-hidden shadow-2xl bg-zinc-900/30
                        ${hasDividers ? getDividerStyle() : 'border-white/20'}
                    `}
            style={gridContainerStyle}
          >
            {Array.from({ length: gridCols * gridRows }).map((_, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCell(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    setEditingCell(i);
                  }
                }}
                role="button"
                tabIndex={0}
                onMouseEnter={() => setHoveredCell(i)}
                onMouseLeave={() => setHoveredCell(null)}
                style={{
                  backgroundColor: params.background === 'Custom' ? customColor : undefined,
                }}
                className={`relative flex items-center justify-center transition-all duration-200 cursor-text group min-w-0 min-h-0 overflow-hidden
                                ${getBackgroundClass()}
                                ${hoveredCell === i || editingCell === i ? 'ring-2 ring-emerald-400 z-10' : 'hover:ring-1 hover:ring-white/30'}
                            `}
              >
                {editingCell === i ? (
                  <div className="absolute inset-0 z-20 bg-zinc-900/95 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200">
                    <textarea
                      ref={cellInputRef}
                      value={cellPrompts[i] || ''}
                      onChange={(e) => setCellPrompts((prev) => ({ ...prev, [i]: e.target.value }))}
                      onBlur={() => setEditingCell(null)}
                      aria-label={`Cell ${i + 1} prompt`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setEditingCell(null);
                        }
                      }}
                      placeholder={`Cell ${i + 1}`}
                      className="size-full bg-transparent text-[10px] font-bold text-white resize-none outline-none placeholder-zinc-600 leading-tight"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 p-1 flex flex-col items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <span
                      className={`text-[10px] font-black mb-0.5 drop-shadow-md ${isLightBg ? 'text-black/50' : 'text-white/30'}`}
                    >
                      {i + 1}
                    </span>
                    {cellPrompts[i] && (
                      <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(var(--emerald-500),0.8)]" />
                    )}
                    {hoveredCell === i && !cellPrompts[i] && (
                      <Edit3 size={12} className={isLightBg ? 'text-black/30' : 'text-white/30'} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="absolute -bottom-12 bg-black/60 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg pointer-events-none">
            <ScanLine size={16} className="text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {config.aspectRatio} Canvas
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">
                {gridCols}x{gridRows} Grid • {params.dividers}
              </span>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div
          className={`
                flex-shrink-0 bg-black/40 border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-500 ease-out-expo relative
                ${isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 border-0 pointer-events-none'}
             `}
        >
          <div className="h-14 border-b border-white/5 flex items-center px-5 gap-2 bg-white/[0.02]">
            <Hash size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Edit Cells
            </span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto text-zinc-500 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {Array.from({ length: gridCols * gridRows }).map((_, i) => (
              <div
                key={i}
                onClick={() => setEditingCell(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setEditingCell(i);
                }}
                role="button"
                tabIndex={0}
                className={`group p-2.5 rounded-xl border transition-all duration-200 cursor-pointer
                                ${hoveredCell === i || editingCell === i ? 'bg-white/10 border-emerald-500/50 shadow-lg' : 'bg-black/20 border-white/5 hover:bg-white/5'}
                            `}
                onMouseEnter={() => setHoveredCell(i)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${hoveredCell === i || editingCell === i ? 'text-emerald-400' : 'text-zinc-600'}`}
                  >
                    Cell {i + 1}
                  </span>
                  {cellPrompts[i] && (
                    <div className="w-full text-right overflow-hidden">
                      <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded truncate inline-block max-w-full">
                        {cellPrompts[i]}
                      </span>
                    </div>
                  )}
                </div>
                {/* Only show input if directly editing from sidebar, otherwise just a display */}
                <div className="text-[10px] text-zinc-400 truncate h-4">
                  {cellPrompts[i] || 'Empty...'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 border border-white/10 rounded-l-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-lg"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>
    </RecipeLayout>
  );
};
