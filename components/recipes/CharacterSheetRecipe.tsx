import React, { useState, useRef, useMemo } from 'react';
import { Layout, Brush, Palette, X, Camera, ScanFace } from 'lucide-react';
import type { Attachment, ImageGenerationConfig } from '../../types';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown } from './RecipeUI';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';

interface CharacterSheetRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string) => void;
  isGenerating: boolean;
}

const LAYOUT_PROMPTS: Record<string, string> = {
  'Classic Turnaround':
    'a character turnaround reference sheet. Aim for 3 full-body views of the character in a neutral A-pose, arranged horizontally: 1. Front View 2. Side View (Left Profile) 3. Back View. Keep the head and feet visually aligned where possible.',
  'Isometric Sheet':
    'a full character sheet with multiple isometric views of the same character in a neutral A-pose. Aim for 4 views: 1. Front-Right Isometric 2. Front-Left Isometric 3. Back-Right Isometric 4. Back-Left Isometric. Prefer a clean 2x2 grid.',
  'Dynamic Sheet':
    'a dynamic character pose sheet. Aim for 3 views of the character: 1. A main, full-body dynamic action pose. 2. A close-up portrait with a neutral expression. 3. A three-quarter back view.',
  'Expression Sheet':
    'a facial expression sheet. Focus on the head and shoulders. Aim for 6 distinct emotional states (e.g., Neutral, Angry, Happy, Sad, Surprised, Combat-Ready) arranged in a readable 2x3 grid.',
  'Wireframe Sheet':
    'the character visualized as a 3D wireframe-style model, with the form suggested through polygon mesh lines and a visible grid pattern.',
  'Anatomy Sheet':
    "an anatomical reference sheet in the style of a medical or artist's illustration. Show a detailed view of the character's musculature and skeletal structure.",
  'Clothing Layers': "a character sheet showing an 'exploded view' of the character's clothing.",
};

const STYLE_OPTIONS = [
  'Preserve Source Style',
  'Concept Art (Digital)',
  'Anime (90s Retro)',
  'Anime (Painterly Fantasy)',
  'Anime (Modern Luminous)',
  'Comic Book (Western)',
  'Graphic Novel (Noir)',
  '3D Render (Feature Animation)',
  '3D Render (Next-Gen Engine)',
  'Fantasy Oil Painting',
  'Watercolor Illustration',
  'Pencil Sketch',
  'Technical Blueprint',
  'Vector Art (Flat)',
  'Pixel Art (High Bit)',
  'Cyberpunk Neon',
];
const SHOT_OPTIONS = ['Full Body', 'Knee Up', 'Upper Body', 'Portrait (Headshot)', 'Macro Details'];
const FOCUS_OPTIONS = [
  'General Design',
  'Facial Features',
  'Outfit & Cloth',
  'Anatomy/Muscle',
  'Weapons/Gear',
  'Hair & Accessories',
];

import { RATIO_MAP } from '../../constants';

export const CharacterSheetRecipe: React.FC<CharacterSheetRecipeProps> = ({
  config,
  updateConfig,
  onFileSelect,
  isGenerating,
}) => {
  const [params, setParams] = useState({
    layout: 'Classic Turnaround',
    style: 'Preserve Source Style',
    shot: 'Full Body',
    focus: 'General Design',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImage = config.attachments[0];
  const hasReference = !!activeImage;
  const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1.5, [config.aspectRatio]);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFileSelect(files);
  };

  const BottomDock = useMemo(
    () => (
      <>
        <ControlDropdown
          title="Sheet Type"
          icon={<Layout size={14} />}
          label={params.layout}
          options={Object.keys(LAYOUT_PROMPTS)}
          onSelect={(v) => setParams((p) => ({ ...p, layout: v }))}
          activeColor="indigo"
        />
        <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />
        <ControlDropdown
          title="Framing"
          icon={<Camera size={14} />}
          label={params.shot}
          options={SHOT_OPTIONS}
          onSelect={(v) => setParams((p) => ({ ...p, shot: v }))}
          activeColor="indigo"
        />
        <ControlDropdown
          title="Detail Focus"
          icon={<ScanFace size={14} />}
          label={params.focus}
          options={FOCUS_OPTIONS}
          onSelect={(v) => setParams((p) => ({ ...p, focus: v }))}
          activeColor="indigo"
        />
        <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />
        <ControlDropdown
          title="Art Style"
          icon={<Palette size={14} />}
          label={params.style}
          options={STYLE_OPTIONS}
          onSelect={(v) => setParams((p) => ({ ...p, style: v }))}
          activeColor="indigo"
        />

        <div className="px-3 hidden xl:block">
          <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">
            Mode
          </div>
          <div className="text-[10px] font-bold text-white leading-none">
            {hasReference ? 'Ref Active' : 'Txt Mode'}
          </div>
        </div>
      </>
    ),
    [params, hasReference],
  );

  return (
    <RecipeLayout
      isGenerating={isGenerating}
      bottomDock={BottomDock}
      className="p-6 md:p-12 pb-48 flex items-center justify-center"
    >
      {/* CENTER: Reference / Input Area */}
      <div className="relative w-full max-w-400 h-full flex flex-col items-center justify-center group">
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-3xl border bg-white/2 shadow-2xl transition-all duration-500`}
          style={{
            aspectRatio: ratioValue,
            width: `min(80vw, (100vh - 350px) * ${ratioValue})`,
            height: `min(100vh - 350px, 80vw / ${ratioValue})`,
            borderStyle: hasReference ? 'solid' : 'dashed',
            borderColor: hasReference ? 'rgb(var(--indigo-500) / 0.3)' : 'rgb(255 255 255 / 0.1)',
          }}
        >
          {hasReference ? (
            <>
              <img
                src={activeImage.dataUrl}
                alt="Reference"
                className="w-full h-full object-contain shadow-2xl"
              />
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[8px] font-black uppercase tracking-widest border border-indigo-500/30 rounded">
                  REF ACTIVE
                </span>
              </div>
              <button
                onClick={() => updateConfig('attachments', [])}
                className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-red-500/30"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-6 transition-colors hover:bg-white/1"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))}
                className="hidden"
                accept="image/*"
              />

              <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/50 transition-all shadow-2xl relative z-10">
                <Brush
                  size={32}
                  className="text-zinc-600 group-hover:text-indigo-400 transition-colors"
                />
              </div>
              <div className="text-center relative z-10">
                <h3 className="text-2xl font-black text-zinc-300 group-hover:text-white uppercase tracking-tight">
                  Character Source
                </h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-3 hover:text-white transition-colors">
                  Upload Reference or Describe below
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </RecipeLayout>
  );
};
