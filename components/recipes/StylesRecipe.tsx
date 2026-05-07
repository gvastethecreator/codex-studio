import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Palette,
  Upload,
  X,
  Layers,
  PenTool,
  Printer,
  Clapperboard,
  Briefcase,
  Archive,
  Check,
  Tv,
  Gamepad2,
  SmilePlus,
  BookOpen,
  Camera,
  Maximize2,
  RefreshCw,
  SlidersHorizontal,
  Copy,
  Search,
  Heart,
  ArrowUpDown,
  Filter,
  Star,
  Box,
  Sparkles,
  Building,
  Shirt,
  Wand2,
} from 'lucide-react';
import type {
  ImageGenerationConfig,
  GeneratedImageWithConfig,
  Attachment,
  AspectRatio,
} from '../../types';
import {
  STYLE_CATEGORY_IMAGES,
  STYLE_CATEGORY_PREVIEWS,
  STYLE_DEFAULT_IMAGES,
} from '../../lib/recipeAssetCatalog';
import { styleCategoryImageKey } from '../../lib/recipeAssetKeys';
import { STYLE_PACKS, StylePresetDef } from './stylesData';
import { RecipeLayout } from './RecipeLayout';
import Slider from '../ui/Slider';
import Tooltip from '../Tooltip';
import { FloatingTooltip } from '../ui/FloatingTooltip';

interface StylesRecipeProps {
  config: ImageGenerationConfig;
  updateConfig: <K extends keyof ImageGenerationConfig>(
    key: K,
    value: ImageGenerationConfig[K],
  ) => void;
  updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
  onFileSelect: (files: File[]) => void;
  onGenerate: (prompt?: string, configOverrides?: Partial<ImageGenerationConfig>) => void;
  isGenerating: boolean;
  images?: GeneratedImageWithConfig[];
  onOpenImage?: (image: GeneratedImageWithConfig) => void;
}

const FAVORITES_PACK_ID = 'favorites';

// Color mapping for each pack to give them distinct identities
const PACK_THEMES: Record<string, { color: string; bg: string; border: string; text: string }> = {
  [FAVORITES_PACK_ID]: {
    color: 'rose',
    bg: 'bg-rose-600',
    border: 'border-rose-600',
    text: 'text-rose-500',
  },
  pack_01: {
    color: 'cyan',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
  }, // Photography & Realism
  pack_02: {
    color: 'indigo',
    bg: 'bg-indigo-500',
    border: 'border-indigo-500',
    text: 'text-indigo-400',
  }, // Cinematic & Media
  pack_03: {
    color: 'rose',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    text: 'text-rose-400',
  }, // 3D & CGI Rendering
  pack_04: {
    color: 'fuchsia',
    bg: 'bg-fuchsia-500',
    border: 'border-fuchsia-500',
    text: 'text-fuchsia-400',
  }, // Illustration & Graphic Novel
  pack_05: {
    color: 'red',
    bg: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-red-500',
  }, // Anime & Manga Universes
  pack_06: {
    color: 'amber',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-400',
  }, // Essential Art Styles
  pack_07: {
    color: 'emerald',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
  }, // Architecture & Interior
  pack_08: {
    color: 'violet',
    bg: 'bg-violet-500',
    border: 'border-violet-500',
    text: 'text-violet-400',
  }, // Fashion & Costume
  pack_09: {
    color: 'lime',
    bg: 'bg-lime-500',
    border: 'border-lime-500',
    text: 'text-lime-400',
  }, // Texture & Materiality
  pack_10: {
    color: 'blue',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-400',
  }, // Abstract & Experimental
  pack_11: {
    color: 'orange',
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    text: 'text-orange-400',
  }, // Miscellaneous & Fun
};

import { RATIO_MAP } from '../../constants';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { startViewTransition } from '../../utils/transitionUtils';

const previewDataUrlCache = new Map<string, string>();

async function loadPreviewAttachment(previewUrl: string, preset: StylePresetDef) {
  let dataUrl = previewDataUrlCache.get(previewUrl);

  if (!dataUrl) {
    const response = await fetch(previewUrl);
    if (!response.ok) {
      throw new Error(`Unable to load style preview: ${response.status}`);
    }

    const blob = await response.blob();
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    previewDataUrlCache.set(previewUrl, dataUrl);
  }

  return {
    id: `style-preview-${preset.id}`,
    name: `${preset.category || 'Style Preview'} - reference.webp`,
    dataUrl,
    strength: 0.45,
  };
}

export const StylesRecipe: React.FC<StylesRecipeProps> = ({
  config,
  updateConfig,
  updateAttachment,
  onFileSelect,
  onGenerate,
  isGenerating,
  images = [],
  onOpenImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImage = config.attachments[0];
  const initializedImageId = useRef<string | null>(null);

  const [currentPackId, setCurrentPackId] = useState('pack_01');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [copiedStyleId, setCopiedStyleId] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // -- FILTERS & STATE --
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'az' | 'za'>('az');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useLocalStorage<string[]>('style-favorites', []);

  const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1, [config.aspectRatio]);

  // Style Influence (Default 80%)
  const [styleStrength, setStyleStrength] = useState(0.8);

  const toggleFavorite = (presetId: string) => {
    setFavorites((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId],
    );
  };

  // Force strength to 0.15 (15%) by default ONLY ONCE per new image
  useEffect(() => {
    if (activeImage && activeImage.id !== initializedImageId.current) {
      updateAttachment(activeImage.id, { strength: 0.15 });
      initializedImageId.current = activeImage.id;
    }
  }, [activeImage?.id, updateAttachment]);

  useEffect(() => {
    return () => updateConfig('recipeContext', '');
  }, [updateConfig]);

  useEffect(() => {
    return () => {
      updateConfig('recipeId', null);
      updateConfig('recipeParams', null);
      updateConfig('recipeContext', '');
    };
  }, [updateConfig]);

  useEffect(() => {
    if (config.recipeId !== 'styles' || !config.recipeParams) return;
    const presetId =
      typeof config.recipeParams.presetId === 'string' ? config.recipeParams.presetId : null;
    if (presetId) {
      setActivePresetId(presetId);
    }
  }, [config.recipeId, config.recipeParams]);

  const activePack = useMemo(() => {
    if (currentPackId === FAVORITES_PACK_ID) {
      return {
        id: FAVORITES_PACK_ID,
        name: 'Your Favorites',
        description: 'A curated collection of your most used styles.',
        presets: [], // Placeholder, populated in processedData
      };
    }
    return STYLE_PACKS.find((p) => p.id === currentPackId) || STYLE_PACKS[0];
  }, [currentPackId]);

  const activeTheme = PACK_THEMES[currentPackId] || PACK_THEMES['pack_01'];

  // Enhanced Grouping Logic with Search, Sort, and Favorites Bubbling
  const processedData = useMemo(() => {
    let rawPresets: StylePresetDef[] = [];

    if (currentPackId === FAVORITES_PACK_ID) {
      // Aggregate ALL favorites from ALL packs
      STYLE_PACKS.forEach((pack) => {
        pack.presets.forEach((p) => {
          if (favorites.includes(p.id)) {
            rawPresets.push(p);
          }
        });
      });
    } else {
      rawPresets = activePack.presets || [];
    }

    // 1. Filter by Search
    let filtered = rawPresets.filter((p) => {
      const search = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(search) ||
        p.style.aesthetic.toLowerCase().includes(search) ||
        p.category?.toLowerCase().includes(search)
      );
    });

    // 2. Filter by Favorites Only toggle (Only valid in non-favorite tabs)
    if (showFavoritesOnly && currentPackId !== FAVORITES_PACK_ID) {
      filtered = filtered.filter((p) => favorites.includes(p.id));
    }

    // 3. Sort Alphabetically
    filtered.sort((a, b) => {
      return sortOrder === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

    // 4. Grouping Logic
    const favs: StylePresetDef[] = [];
    const groups: Record<string, StylePresetDef[]> = {};

    if (currentPackId === FAVORITES_PACK_ID) {
      // In Favorites view, group by Category directly, no top-level "Pinned" section needed
      filtered.forEach((preset) => {
        const category = preset.category || 'General';
        if (!groups[category]) groups[category] = [];
        groups[category].push(preset);
      });
    } else {
      // In standard view, bubble Favorites to top
      const nonFavs: StylePresetDef[] = [];
      filtered.forEach((p) => {
        if (favorites.includes(p.id)) {
          favs.push(p);
        } else {
          nonFavs.push(p);
        }
      });

      nonFavs.forEach((preset) => {
        const category = preset.category || 'General';
        if (!groups[category]) groups[category] = [];
        groups[category].push(preset);
      });
    }

    return { favorites: favs, groups };
  }, [activePack, currentPackId, searchQuery, sortOrder, favorites, showFavoritesOnly]);

  const handleApplyStyle = async (preset: StylePresetDef) => {
    if (isGenerating) return;

    setActivePresetId(preset.id);

    const presetPackId = getPackIdForPreset(preset);
    const categoryBaseUrl = preset.category
      ? STYLE_CATEGORY_IMAGES[styleCategoryImageKey(presetPackId, preset.category)]
      : undefined;
    const fallbackPreviewUrl = preset.category
      ? categoryBaseUrl || STYLE_CATEGORY_PREVIEWS[preset.category]
      : undefined;
    const fallbackAttachment =
      !activeImage && fallbackPreviewUrl
        ? await loadPreviewAttachment(fallbackPreviewUrl, preset)
        : null;
    const effectiveImage = activeImage || fallbackAttachment;
    const fidelity = effectiveImage?.strength || 0.5;
    const intensity = styleStrength;
    const isPhotoPackFallback = ['pack_09', 'pack_10', 'pack_11'].includes(currentPackId);

    const presetNegative =
      preset.negativePrompt ||
      (isPhotoPackFallback
        ? 'illustration, drawing, painting, sketch, cartoon, anime, 2d, graphic, flat, vector, ink'
        : '');

    // --- SEMANTIC ABSTRACTION PROMPTING ---
    let roleInstruction = '';
    let compositionRule = '';

    if (!effectiveImage) {
      roleInstruction = `
        Synthesize the requested subject in the target style from scratch.
        Ensure the style's DNA is the primary driver of the visual output.
        Focus on creating a high-quality, coherent image that embodies the aesthetic.
      `;
      compositionRule = 'Create a balanced and aesthetically pleasing composition.';
    } else if (fallbackAttachment) {
      roleInstruction = `
        Use the provided pack/category base image as the baseline visual subject for this preset card.
        Preserve the broad subject, composition, and readable scene structure so the preset effect can be compared across cards.
        Re-render the image through the target style's visual DNA instead of merely displaying the reference.
      `;
      compositionRule =
        'Keep the pack/category base composition recognizable while replacing the surface treatment, lighting, camera behavior, texture, and atmosphere according to the target style.';
    } else if (fidelity <= 0.25) {
      roleInstruction = `
        Treat the input image as a ROUGH CONCEPT SKETCH only. 
        Identify the SUBJECT (e.g. 'A woman', 'A car'). 
        COMPLETELY DISCARD the original lighting, texture, and background. 
        RE-IMAGINE the subject in a new environment or pose that fits the target style.
        `;
      compositionRule = 'CHANGE the camera angle. CHANGE the lighting. DO NOT trace the input.';
    } else if (fidelity <= 0.55) {
      roleInstruction = `
        Use the input image as a STRONG REFERENCE for composition.
        Keep the main subject's pose, but completely REPLACE all surface details, textures, and lighting materials.
        `;
      compositionRule = 'Maintain the pose, but create new textures from scratch.';
    } else {
      roleInstruction = `
        Use the input image as the primary structural guide.
        Apply the requested style as a dense filter over the existing image structure.
        Preserve the original identity as closely as possible.
        `;
      compositionRule = 'Keep close to the input geometry.';
    }

    let styleEmphasis = '';
    if (intensity > 0.85) {
      styleEmphasis = `
        EXAGGERATE the style features. 
        If the style is rough, make it messy. 
        If the style is colorful, oversaturate it. 
        Push the aesthetic to its limit.
        `;
    }

    const styleRecipeParams = {
      presetId: preset.id,
      presetName: preset.name,
      mode: fallbackAttachment
        ? 'PACK_CATEGORY_BASE_STYLE_APPLICATION'
        : activeImage
          ? fidelity < 0.3
            ? 'CREATIVE_REIMAGINING'
            : 'STRUCTURAL_PRESERVATION'
          : 'DIRECT_STYLE_SYNTHESIS',
      roleInstruction: roleInstruction.trim(),
      compositionRule: compositionRule.trim(),
      styleEmphasis: styleEmphasis.trim(),
      aesthetic: preset.style.aesthetic,
      subjectTreatment: preset.style.subject_treatment || preset.style.form_and_line || 'Standard',
      colorTone: preset.style.color_and_tone || preset.style.color_palette || 'Standard',
      lightingShadow: preset.style.lighting_and_shadow || preset.style.lighting_setup || 'Standard',
      textureMaterial:
        preset.style.texture_and_material || preset.style.material_texture || 'Standard',
      cameraComposition:
        preset.style.camera_and_composition || preset.style.spatial_distortion || 'Standard',
      atmosphereMood: preset.style.atmosphere_and_mood || preset.style.atmosphere || 'Standard',
      renderingQuality:
        preset.style.rendering_and_quality || preset.style.render_quality || 'Standard',
    };

    onGenerate(undefined, {
      recipeId: 'styles',
      recipeParams: styleRecipeParams,
      recipeContext: '',
      attachments: fallbackAttachment ? [fallbackAttachment] : config.attachments,
      aspectRatio: fallbackAttachment ? '2:3' : config.aspectRatio,
      negativePrompt: config.negativePrompt
        ? `${config.negativePrompt}, ${presetNegative}`
        : presetNegative,
    });
  };

  const handleCopyStylePrompt = (e: React.MouseEvent, preset: StylePresetDef) => {
    e.stopPropagation();
    const promptText = `
**Style:** ${preset.name}
**Aesthetic:** ${preset.style.aesthetic}
**Subject:** ${preset.style.subject_treatment || preset.style.form_and_line || 'Standard'}
**Color:** ${preset.style.color_and_tone || preset.style.color_palette || 'Standard'}
**Lighting:** ${preset.style.lighting_and_shadow || preset.style.lighting_setup || 'Standard'}
**Texture:** ${preset.style.texture_and_material || preset.style.material_texture || 'Standard'}
**Camera:** ${preset.style.camera_and_composition || preset.style.spatial_distortion || 'Standard'}
**Mood:** ${preset.style.atmosphere_and_mood || preset.style.atmosphere || 'Standard'}
**Quality:** ${preset.style.rendering_and_quality || preset.style.render_quality || 'Standard'}
`.trim();
    navigator.clipboard.writeText(promptText);
    setCopiedStyleId(preset.id);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopiedStyleId(null), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
    if (files.length > 0) onFileSelect(files);
  };

  const getPackIcon = (id: string) => {
    const size = 18;
    switch (id) {
      case FAVORITES_PACK_ID:
        return <Heart size={size} fill="currentColor" />;
      case 'pack_01':
        return <Camera size={size} />;
      case 'pack_02':
        return <Clapperboard size={size} />;
      case 'pack_03':
        return <Box size={size} />;
      case 'pack_04':
        return <PenTool size={size} />;
      case 'pack_05':
        return <Sparkles size={size} />;
      case 'pack_06':
        return <Palette size={size} />;
      case 'pack_07':
        return <Building size={size} />;
      case 'pack_08':
        return <Shirt size={size} />;
      case 'pack_09':
        return <Layers size={size} />;
      case 'pack_10':
        return <Wand2 size={size} />;
      case 'pack_11':
        return <SmilePlus size={size} />;
      default:
        return <Layers size={size} />;
    }
  };

  const getResultImageForPreset = (presetName: string) => {
    if (!images) return null;
    const targetStyle = `TARGET STYLE: ${presetName.toUpperCase()}`;
    return (
      images
        .filter((img) => img.config.recipeContext?.includes(targetStyle))
        .sort((a, b) => b.createdAt - a.createdAt)[0] || null
    );
  };

  const getPackIdForPreset = (preset: StylePresetDef) => {
    if (currentPackId !== FAVORITES_PACK_ID) return currentPackId;
    return (
      STYLE_PACKS.find((pack) => pack.presets.some((candidate) => candidate.id === preset.id))
        ?.id || activePack.id
    );
  };

  const renderPresetCard = React.useCallback(
    (preset: StylePresetDef) => {
      const resultImage = getResultImageForPreset(preset.name);
      const defaultImage = STYLE_DEFAULT_IMAGES[preset.id];
      const presetPackId = getPackIdForPreset(preset);
      const categoryImage = preset.category
        ? STYLE_CATEGORY_IMAGES[styleCategoryImageKey(presetPackId, preset.category)]
        : undefined;
      const previewImage = preset.category
        ? categoryImage || STYLE_CATEGORY_PREVIEWS[preset.category]
        : undefined;
      const isActive = activePresetId === preset.id;
      const isCopied = copiedStyleId === preset.id;
      const isFavorite = favorites.includes(preset.id);

      return (
        <FloatingTooltip
          key={preset.id}
          delay={200}
          content={
            <div className="flex flex-col gap-2 w-64 text-left p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                Prompt Preview
              </div>
              <div className="text-[10px] text-zinc-300 leading-relaxed font-mono flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                {Object.entries(preset.style).map(([key, value]) => {
                  if (typeof value === 'object') return null;
                  return (
                    <div key={key}>
                      <span className="text-zinc-500 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                      {String(value)}
                    </div>
                  );
                })}
              </div>
            </div>
          }
        >
          <div
            className={`
                  group relative aspect-[3/4] rounded-xl overflow-hidden text-left transition-all duration-300 flex flex-col
                  ${
                    isActive
                      ? `ring-2 ring-offset-4 ring-offset-black ${activeTheme.border.replace('border', 'ring')} shadow-2xl scale-[1.02]`
                      : 'bg-zinc-900 border border-white/5 hover:border-white/10 hover:shadow-xl hover:-translate-y-1'
                  }
              `}
          >
            <div className="flex-1 relative overflow-hidden bg-black">
              {resultImage ? (
                <>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenImage) onOpenImage(resultImage);
                    }}
                    className="absolute inset-0 cursor-zoom-in group/image"
                  >
                    <img
                      src={resultImage.thumbnail || resultImage.src}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                      alt={preset.name}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                        <Maximize2 size={18} />
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyStyle(preset);
                        }}
                        className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg hover:bg-accent-600 text-white transition-colors border border-white/10 shadow-lg"
                        title="Regenerate Style"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : defaultImage ? (
                <button
                  onClick={() => handleApplyStyle(preset)}
                  disabled={isGenerating}
                  className="absolute inset-0 w-full h-full bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                >
                  <img
                    src={defaultImage}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={preset.name}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <div className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white border border-white/10 shadow-lg">
                      <RefreshCw size={14} />
                    </div>
                  </div>
                </button>
              ) : previewImage ? (
                <button
                  onClick={() => handleApplyStyle(preset)}
                  disabled={isGenerating}
                  className="absolute inset-0 w-full h-full bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                >
                  <img
                    src={previewImage}
                    className="w-full h-full object-cover opacity-75 saturate-[0.9] transition-all duration-700 group-hover:scale-110 group-hover:opacity-100 group-hover:saturate-100"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center bg-black/55 backdrop-blur-md border border-white/15 ${activeTheme.text} transition-transform duration-300 group-hover:scale-110 shadow-xl`}
                    >
                      <Palette size={24} />
                    </div>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                      Apply
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => handleApplyStyle(preset)}
                  disabled={isGenerating}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 ${activeTheme.text} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Palette size={24} />
                  </div>
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    Apply
                  </span>
                </button>
              )}

              <div className="absolute top-2 left-2 z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(preset.id);
                  }}
                  className={`p-1.5 rounded-full transition-all duration-300 ${isFavorite ? 'text-rose-500 bg-black/40' : 'text-zinc-600 hover:text-rose-400 bg-transparent hover:bg-black/40'}`}
                  title={isFavorite ? 'Unpin' : 'Pin to top'}
                >
                  <Heart
                    size={14}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    strokeWidth={isFavorite ? 0 : 2}
                  />
                </button>
              </div>
            </div>

            <div className="relative h-20 p-4 bg-zinc-900/90 backdrop-blur-md border-t border-white/5 flex flex-col justify-center text-left hover:bg-zinc-800 transition-colors z-20 group/label w-full">
              <div
                onClick={() => !isGenerating && handleApplyStyle(preset)}
                className={`flex-1 flex flex-col justify-center ${!isGenerating ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-tight truncate pr-8 transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover/label:text-white'}`}
                  >
                    {preset.name}
                  </span>
                  {resultImage && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shadow-[0_0_5px_rgba(var(--accent-500),0.8)]" />
                  )}
                </div>
                <span className="text-[9px] text-zinc-600 line-clamp-2 leading-relaxed group-hover/label:text-zinc-500 pr-6">
                  {preset.style.aesthetic}
                </span>
              </div>

              <div className="absolute bottom-2 right-2">
                <button
                  onClick={(e) => handleCopyStylePrompt(e, preset)}
                  className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
                  title="Copy Style Prompt"
                >
                  {isCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>

              {isActive && (
                <div
                  className={`absolute top-0 right-0 w-full h-0.5 ${activeTheme.bg} shadow-[0_0_10px_currentColor]`}
                />
              )}
            </div>
          </div>
        </FloatingTooltip>
      );
    },
    [
      activePresetId,
      copiedStyleId,
      favorites,
      activeTheme,
      images,
      onOpenImage,
      handleApplyStyle,
      toggleFavorite,
      handleCopyStylePrompt,
      isGenerating,
      activeImage,
    ],
  );

  return (
    <RecipeLayout isGenerating={isGenerating} className="flex h-full w-full">
      {/* LEFT: VISUAL CONTEXT PREVIEW */}
      <div className="w-[30%] 2xl:w-[25%] h-full flex flex-col p-6 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full flex flex-col gap-6 my-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                Reference
              </h2>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                Input Source
              </p>
            </div>
          </div>

          <div
            className="w-full relative group max-h-[40vh] flex-shrink-0"
            style={{ aspectRatio: ratioValue }}
          >
            {activeImage ? (
              <div className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/20">
                <img
                  src={activeImage.dataUrl}
                  className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity"
                  alt=""
                />
                <button
                  onClick={() => updateConfig('attachments', [])}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full rounded-3xl border-2 border-dashed border-white/5 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group overflow-hidden"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))}
                  className="hidden"
                  accept="image/*"
                />
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-white/20 transition-all shadow-2xl">
                  <Upload
                    size={24}
                    className="text-zinc-600 group-hover:text-white transition-colors"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-black text-zinc-500 group-hover:text-white uppercase tracking-tight transition-colors">
                    Upload or enter prompt
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* CONTROL SLIDERS */}
          {activeImage && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 space-y-6">
              <Slider
                icon={<SlidersHorizontal className="text-zinc-500 w-4 h-4" />}
                label="Source Influence"
                value={activeImage.strength}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateAttachment(activeImage.id, { strength: v })}
              />

              <Slider
                icon={<Palette className="text-zinc-500 w-4 h-4" />}
                label="Style Strength"
                value={styleStrength}
                min={0.1}
                max={1}
                step={0.05}
                onChange={setStyleStrength}
              />

              <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-600">
                <span>
                  {activeImage.strength < 0.3
                    ? 'Re-Imagine'
                    : activeImage.strength < 0.6
                      ? 'Remix'
                      : 'Filter'}
                </span>
                <span>{styleStrength > 0.8 ? 'Exaggerated' : 'Balanced'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: STYLE BROWSER */}
      <div className="flex-1 h-full flex flex-col bg-[#060606] relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />

        {/* Pack Tabs */}
        <div className="vt-recipe-tabs h-16 flex items-center px-6 border-b border-white/5 gap-2 overflow-x-auto custom-scrollbar bg-black/40 backdrop-blur-md z-20">
          {/* Favorites Tab */}
          <button
            onClick={() => {
              startViewTransition(() => {
                setCurrentPackId(FAVORITES_PACK_ID);
                setSearchQuery('');
              });
            }}
            className={`
                    h-9 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 relative overflow-hidden group flex-shrink-0
                    ${
                      currentPackId === FAVORITES_PACK_ID
                        ? `bg-rose-950 border border-rose-500/50 text-rose-400 shadow-lg`
                        : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-rose-400'
                    }
                `}
          >
            <Heart size={16} fill={currentPackId === FAVORITES_PACK_ID ? 'currentColor' : 'none'} />
            {currentPackId === FAVORITES_PACK_ID && (
              <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                Favorites
              </span>
            )}
          </button>

          {/* Standard Packs */}
          {STYLE_PACKS.map((pack) => {
            const isActive = currentPackId === pack.id;
            const theme = PACK_THEMES[pack.id] || PACK_THEMES['pack_01'];

            return (
              <button
                key={pack.id}
                onClick={() => {
                  startViewTransition(() => {
                    setCurrentPackId(pack.id);
                    setSearchQuery('');
                  });
                }}
                className={`
                            h-9 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 relative overflow-hidden group flex-shrink-0
                            ${
                              isActive
                                ? `bg-zinc-800 border border-white/10 text-white shadow-lg`
                                : 'bg-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
                            }
                        `}
              >
                <div className={`relative z-10 transition-colors ${isActive ? theme.text : ''}`}>
                  {getPackIcon(pack.id)}
                </div>

                {isActive && (
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {pack.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pack Header Info + Search Bar */}
        <div className="px-8 pt-6 pb-2 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h2
              className={`text-2xl font-black uppercase tracking-tighter mb-1 transition-colors duration-500 ${activeTheme.text}`}
            >
              {activePack.name}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {activePack.description}
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-2 p-1 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5 flex-1 min-w-[200px]">
              <Search size={14} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] text-white placeholder-zinc-600 w-full font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={12} className="text-zinc-500 hover:text-white" />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-white/5" />

            <button
              onClick={() => setSortOrder((prev) => (prev === 'az' ? 'za' : 'az'))}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              title={sortOrder === 'az' ? 'Sort A-Z' : 'Sort Z-A'}
            >
              <ArrowUpDown size={16} />
            </button>

            {currentPackId !== FAVORITES_PACK_ID && (
              <button
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${showFavoritesOnly ? 'text-rose-400 bg-rose-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                title="Filter Favorites in this Pack"
              >
                <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>

        {/* The Grid - Grouped by Category */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-12 pt-4">
          <div className="w-full pb-20 space-y-10">
            {/* FAVORITES SECTION (If any exist in current filter and not in favorites tab) */}
            {processedData.favorites.length > 0 && currentPackId !== FAVORITES_PACK_ID && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4 opacity-100 sticky top-0 backdrop-blur-xl py-2 z-10">
                  <div className="w-1 h-4 rounded-full bg-rose-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
                    Pinned / Favorites
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-rose-500/20 to-transparent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-5 gap-4">
                  {processedData.favorites.map(renderPresetCard)}
                </div>
              </div>
            )}

            {/* OTHER CATEGORIES */}
            {Object.entries(processedData.groups).map(([category, presets]) => (
              <div
                key={category}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3 mb-4 opacity-60 sticky top-0 backdrop-blur-xl py-2 z-10">
                  <div className={`w-1 h-4 rounded-full ${activeTheme.bg}`} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                    {category}
                  </h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-5 gap-4">
                  {(presets as StylePresetDef[]).map(renderPresetCard)}
                </div>
              </div>
            ))}

            {processedData.favorites.length === 0 &&
              Object.keys(processedData.groups).length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-4">
                  <Filter size={32} className="opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    No styles found matching criteria
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
};
