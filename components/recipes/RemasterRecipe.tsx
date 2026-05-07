import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  Sun,
  Camera,
  X,
  Palette,
  MonitorPlay,
  Fingerprint,
  Type as TextIcon,
} from 'lucide-react';
import type { Attachment, ImageGenerationConfig, AspectRatio } from '../../types';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown } from './RecipeUI';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';

interface RemasterRecipeProps {
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

const CONTROL_OPTIONS = {
  style: [
    'Reconstrucción Realista',
    'Renderizado Cinematográfico',
    'Arte Digital Pro',
    'Restauración de Archivo',
    'Película Analógica',
    'Detalle de Óleo',
  ],
  lighting: [
    'Corrección de Iluminación',
    'Luz Volumétrica',
    'Iluminación de Estudio',
    'Luz Natural',
    'Hora Dorada',
    'Contraste Dramático',
  ],
  camera: ['Enfoque Nítido', 'Profundidad de Campo', 'Aumento de Texturas', 'Gran Angular'],
  anatomy: ['Corregir Anatomía', 'Mejorar Rostros y Ojos', 'Corregir Manos', 'Detalle de Piel'],
  text: ['Mantener Original', 'Eliminar Textos', 'Reescribir Lógicamente'],
  color: [
    'Rango Dinámico Ampliado',
    'Colores Naturales',
    'Vibrancia Profunda',
    'Corrección de Color',
  ],
};

import { RATIO_MAP } from '../../constants';

export const RemasterRecipe: React.FC<RemasterRecipeProps> = ({
  config,
  updateConfig,
  updateAttachment,
  onFileSelect,
  onGenerate,
  isGenerating,
}) => {
  const [params, setParams] = useState({
    style: 'Reconstrucción Realista',
    lighting: 'Corrección de Iluminación',
    camera: 'Enfoque Nítido',
    anatomy: 'Corregir Anatomía',
    text: 'Reescribir Lógicamente',
    color: 'Rango Dinámico Ampliado',
    fidelity: 35,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImage = config.attachments[0];

  const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1, [config.aspectRatio]);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFileSelect(files);
  };

  const BottomDock = useMemo(
    () => (
      <>
        <div className="flex flex-col gap-2 px-6 border-r border-white/5 min-w-[240px]">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
            <span>Creative Freedom</span>
            <span>Faithful to Original</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params.fidelity}
            onChange={(e) => setParams((p) => ({ ...p, fidelity: parseInt(e.target.value) }))}
            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-accent-500"
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
      </>
    ),
    [params],
  );

  return (
    <RecipeLayout
      isGenerating={isGenerating}
      bottomDock={BottomDock}
      className="p-8 pt-20 pb-48 flex items-center justify-center"
    >
      <div
        className="relative shadow-2xl transition-all duration-500 ease-out-expo bg-zinc-900 border border-white/10 rounded-lg overflow-hidden group"
        style={{
          aspectRatio: ratioValue,
          width: `min(80vw, (100vh - 350px) * ${ratioValue})`,
          height: `min(100vh - 350px, 80vw / ${ratioValue})`,
        }}
      >
        {activeImage ? (
          <div className="w-full h-full relative">
            <img
              src={activeImage.dataUrl}
              alt="Original"
              className="w-full h-full object-contain opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                  Remaster Active
                </span>
              </div>
            </div>
            <button
              onClick={() => updateConfig('attachments', [])}
              className="absolute top-4 left-4 p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full border-2 border-dashed border-white/10 hover:border-accent-500/50 bg-white/[0.01] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))}
              className="hidden"
              accept="image/*"
            />
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all">
              <Upload size={24} className="text-zinc-600 group-hover:text-accent-400" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-zinc-500 group-hover:text-white uppercase tracking-tight">
                Cargar imagen o escribir un prompt
              </h3>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] mt-2">
                Formatos soportados: JPG, PNG, WEBP
              </p>
            </div>
          </div>
        )}
      </div>
    </RecipeLayout>
  );
};
