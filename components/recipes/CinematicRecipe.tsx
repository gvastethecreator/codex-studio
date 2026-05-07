
import React, { useState, useRef, useMemo } from 'react';
import { Clapperboard, Video, Aperture, Film, X, Sun, Grid3X3, Clock, CloudRain, LayoutTemplate, RectangleHorizontal, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Attachment, ImageGenerationConfig, AspectRatio } from '../../types';
import { RecipeLayout } from './RecipeLayout';
import { ControlDropdown } from './RecipeUI';
import { useRecipeContextRegistration } from '../../hooks/useRecipeContextRegistration';

interface CinematicRecipeProps {
    config: ImageGenerationConfig;
    updateConfig: <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => void;
    updateAttachment: (id: string, newProps: Partial<Attachment>) => void;
    onFileSelect: (files: File[]) => void;
    onGenerate: (prompt?: string) => void;
    isGenerating: boolean;
}

const CONTROL_OPTIONS = {
    genre: ['Auto-Detect', 'Sci-Fi', 'Cyberpunk', 'Fantasy', 'Dark Fantasy', 'Horror', 'Thriller', 'Action', 'Adventure', 'Drama', 'Mystery', 'Noir', 'Western', 'Documentary', 'Historical'],
    tone: ['Auto-Detect', 'Cinematic', 'Teal & Orange', 'Noir', 'Vibrant', 'Muted', 'High Contrast', 'Ethereal', 'Gritty', 'Melancholic', 'Dreamy', 'Retro', 'Desaturated'],
    lighting: ['Auto-Detect', 'Soft Window', 'Neon', 'Practical', 'Rembrandt', 'Silhouette', 'Volumetric Fog', 'Studio', 'Hard Light'],
    time: ['Auto-Detect', 'Golden Hour', 'Blue Hour', 'High Noon', 'Midnight', 'Dawn', 'Dusk', 'Overcast'],
    weather: ['Auto-Detect', 'Clear', 'Rain', 'Heavy Rain', 'Fog', 'Mist', 'Snow', 'Blizzard', 'Dust Storm', 'Sandstorm', 'Haze'],
    movement: ['Auto-Detect', 'Steadycam', 'Handheld', 'Drone Flyover', 'Dolly Zoom', 'Trucking', 'Whip Pan', 'Static Tripod', 'Crane Shot', 'POV', 'Slow Motion', 'Orbit'],
    lens: ['Auto-Detect', 'Anamorphic', '35mm Standard', '50mm Portrait', '85mm Telephoto', '24mm Wide', '14mm Ultra-Wide', 'Macro', 'Tilt-Shift', 'Vintage Glass', '70mm IMAX'],
};

import { RATIO_MAP } from '../../constants';

const FRAME_COUNTS = [3, 6, 9];
const SHOT_TYPES = ['Auto', 'Extreme Wide', 'Wide', 'Full', 'Medium', 'Close-Up', 'Extreme Close-Up', 'POV', 'Over the Shoulder'];

export const CinematicRecipe: React.FC<CinematicRecipeProps> = ({
    config,
    updateConfig,
    updateAttachment,
    onFileSelect,
    onGenerate,
    isGenerating
}) => {
    const [params, setParams] = useState({
        frames: 9,
        genre: 'Auto-Detect',
        tone: 'Auto-Detect',
        lighting: 'Auto-Detect',
        time: 'Auto-Detect',
        weather: 'Auto-Detect',
        movement: 'Auto-Detect',
        lens: 'Auto-Detect',
        fx: 'Auto-Detect'
    });

    const [frameShots, setFrameShots] = useState<Record<number, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeImage = config.attachments[0];
    const ratioValue = useMemo(() => RATIO_MAP[config.aspectRatio] || 1.777, [config.aspectRatio]);

    const handleFrameChange = (count: number) => {
        setParams(p => ({ ...p, frames: count }));
    };

    const gridLayout = useMemo(() => {
        const isPortrait = ratioValue < 1;
        const frames = params.frames;

        if (frames === 3) return isPortrait ? { rows: 3, cols: 1 } : { rows: 1, cols: 3 };
        if (frames === 6) return isPortrait ? { rows: 3, cols: 2 } : { rows: 2, cols: 3 };
        return { rows: 3, cols: 3 };
    }, [params.frames, ratioValue]);

    const recipeParams = useMemo(() => ({
        frames: params.frames,
        rows: gridLayout.rows,
        cols: gridLayout.cols,
        aspectRatio: config.aspectRatio,
        frameShots,
        genre: params.genre,
        tone: params.tone,
        lighting: params.lighting,
        time: params.time,
        weather: params.weather,
        movement: params.movement,
        lens: params.lens,
    }), [
        config.aspectRatio,
        frameShots,
        gridLayout.cols,
        gridLayout.rows,
        params.frames,
        params.genre,
        params.lens,
        params.lighting,
        params.movement,
        params.time,
        params.tone,
        params.weather,
    ]);

    useRecipeContextRegistration(updateConfig, 'cinematic', recipeParams);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
        if (files.length > 0) onFileSelect(files);
    };

    const BottomDock = useMemo(() => (
        <>
            <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1">Layout</span>
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    {FRAME_COUNTS.map(count => (
                        <button
                            key={count}
                            onClick={() => handleFrameChange(count)}
                            className={`h-9 px-4 rounded-lg flex items-center gap-2 transition-all ${params.frames === count
                                    ? 'bg-rose-600 text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                        >
                            {count === 3 && <LayoutTemplate size={14} />}
                            {count === 6 && <RectangleHorizontal size={14} />}
                            {count === 9 && <Grid3X3 size={14} />}
                            <span className="text-[10px] font-black uppercase">{count} Scenes</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-10 w-px bg-white/10 mx-2 hidden xl:block" />

            <div className="flex items-center gap-3 flex-wrap justify-center">
                <ControlDropdown title="Time" icon={<Clock size={14} />} label={params.time} options={CONTROL_OPTIONS.time} onSelect={(v) => setParams(p => ({ ...p, time: v }))} activeColor="rose" />
                <ControlDropdown title="Weather" icon={<CloudRain size={14} />} label={params.weather} options={CONTROL_OPTIONS.weather} onSelect={(v) => setParams(p => ({ ...p, weather: v }))} activeColor="rose" />
                <ControlDropdown title="Lighting" icon={<Sun size={14} />} label={params.lighting} options={CONTROL_OPTIONS.lighting} onSelect={(v) => setParams(p => ({ ...p, lighting: v }))} activeColor="rose" />
            </div>

            <div className="h-10 w-px bg-white/10 mx-2 hidden xl:block" />

            <div className="flex items-center gap-3 flex-wrap justify-center">
                <ControlDropdown title="Genre" icon={<Film size={14} />} label={params.genre} options={CONTROL_OPTIONS.genre} onSelect={(v) => setParams(p => ({ ...p, genre: v }))} activeColor="rose" />
                <ControlDropdown title="Tone" icon={<Aperture size={14} />} label={params.tone} options={CONTROL_OPTIONS.tone} onSelect={(v) => setParams(p => ({ ...p, tone: v }))} activeColor="rose" />
                <ControlDropdown title="Camera" icon={<Video size={14} />} label={params.movement} options={CONTROL_OPTIONS.movement} onSelect={(v) => setParams(p => ({ ...p, movement: v }))} activeColor="rose" />
                <ControlDropdown title="Lens" icon={<Clapperboard size={14} />} label={params.lens} options={CONTROL_OPTIONS.lens} onSelect={(v) => setParams(p => ({ ...p, lens: v }))} activeColor="rose" />
            </div>
        </>
    ), [params, handleFrameChange]);

    return (
        <RecipeLayout isGenerating={isGenerating} bottomDock={BottomDock} className="p-6 pt-20 pb-48 flex items-center justify-center">
            <div
                className="relative shadow-2xl transition-all duration-500 ease-out-expo bg-zinc-900 border border-white/10 rounded-lg overflow-hidden group"
                style={{
                    aspectRatio: ratioValue,
                    width: `min(90vw, (100vh - 350px) * ${ratioValue})`,
                    height: `min(100vh - 350px, 90vw / ${ratioValue})`,
                }}
            >
                {activeImage && (
                    <img src={activeImage.dataUrl} alt="Ref" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none" />
                )}

                <div
                    className="absolute inset-0 grid gap-px bg-black/50 pointer-events-none transition-all duration-500"
                    style={{
                        gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`
                    }}
                >
                    {Array.from({ length: params.frames }).map((_, i) => (
                        <div key={i} className="relative bg-white/[0.02] backdrop-blur-[1px] flex flex-col items-center justify-center border border-white/5 group/cell pointer-events-auto">
                            <span className="text-[9px] font-black text-white/30 group-hover/cell:text-white/60 uppercase tracking-widest transition-colors mb-2">
                                {i === 0 ? 'START' : i === params.frames - 1 ? 'END' : `SCENE ${i + 1}`}
                            </span>
                            <select
                                value={frameShots[i] || 'Auto'}
                                onChange={(e) => setFrameShots(prev => ({ ...prev, [i]: e.target.value }))}
                                className="bg-black/50 text-white/70 hover:text-white text-[9px] font-bold uppercase tracking-wider border border-white/10 rounded px-2 py-1 outline-none focus:border-rose-500/50 appearance-none text-center cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                {SHOT_TYPES.map(shot => (
                                    <option key={shot} value={shot} className="bg-zinc-900 text-white">{shot}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                {!activeImage && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-white/5 transition-colors bg-white/[0.01]"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={handleDrop}
                    >
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileSelect(Array.from(e.target.files))} className="hidden" accept="image/*" />
                        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:border-rose-500/50 transition-all">
                            <Upload size={28} className="text-zinc-600 group-hover:text-rose-400 transition-colors" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Source Frame</h3>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase">Upload Shot or enter prompt</p>
                        </div>
                    </div>
                )}

                {activeImage && (
                    <button
                        onClick={() => updateConfig('attachments', [])}
                        className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/60 text-zinc-400 hover:text-white hover:bg-red-500 transition-all pointer-events-auto border border-white/10"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </RecipeLayout>
    );
};
