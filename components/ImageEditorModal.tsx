import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Brush, Undo, Trash2 } from 'lucide-react';
import type { Attachment } from '../types';
import Slider from './ui/Slider';
import ActionButton from './ui/ActionButton';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Attachment | null;
  onGenerate: (originalImage: Attachment, maskDataUrl: string, editPrompt: string) => void;
  isGenerating: boolean;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  image,
  onGenerate,
  isGenerating,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const brushCursorRef = useRef<HTMLDivElement>(null);

  const [editPrompt, setEditPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  }, [editPrompt]);

  const setupCanvas = useCallback(() => {
    if (!image || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.dataUrl;
    img.onload = () => {
      const containerWidth = container.clientWidth - 48; // Padding
      const containerHeight = container.clientHeight - 48;
      const scale = Math.min(
        containerWidth / img.naturalWidth,
        containerHeight / img.naturalHeight,
      );

      const displayWidth = img.naturalWidth * scale;
      const displayHeight = img.naturalHeight * scale;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [image]);

  useEffect(() => {
    if (isOpen) {
      setupCanvas();
    } else {
      setHistory([]);
      setHistoryIndex(-1);
      setEditPrompt('');
    }
  }, [isOpen, setupCanvas]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length > 20) newHistory.shift();

    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      (brushSize * (canvasRef.current!.width / canvasRef.current!.getBoundingClientRect().width)) /
        2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getMousePos(e);
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = canvasRef.current!.width / rect.width;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = brushSize * scale;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  };

  const handleUndo = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      ctx.putImageData(history[newIndex], 0, 0);
    } else {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistoryIndex(-1);
    }
  };

  const handleGenerate = () => {
    if (!image || isGenerating || !canvasRef.current) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.fillStyle = 'black';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(canvasRef.current, 0, 0);

    onGenerate(image, tempCanvas.toDataURL('image/png'), editPrompt);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (brushCursorRef.current) {
        brushCursorRef.current.style.left = `${e.clientX}px`;
        brushCursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    if (isOpen) window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 bg-black/98 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500"
      onClick={onClose}
    >
      <div
        className="h-20 w-full flex items-center justify-between px-10 border-b border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-5">
          <div className="p-2.5 bg-accent-500/10 rounded-xl">
            <Sparkles size={20} className="text-accent-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-white">
              Precision Inpaint
            </h2>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
              Edit masked area and regenerate
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-3 bg-zinc-900/60 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-all shadow-xl"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="flex-1 flex flex-col md:flex-row min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-1 relative flex items-center justify-center p-8 bg-[#010101]"
          ref={containerRef}
        >
          {image && (
            <img
              src={image.dataUrl}
              alt=""
              className="absolute object-contain pointer-events-none opacity-30 grayscale"
              style={{
                width: canvasRef.current?.style.width,
                height: canvasRef.current?.style.height,
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="relative z-10 cursor-none touch-none opacity-90 mix-blend-screen shadow-[0_0_100px_rgba(255,255,255,0.05)]"
          />
          <div
            ref={brushCursorRef}
            className="fixed pointer-events-none border border-white/40 shadow-2xl rounded-full mix-blend-difference z-110"
            style={{ width: brushSize, height: brushSize, transform: `translate(-50%, -50%)` }}
          />
        </div>

        <div className="w-full md:w-96 bg-zinc-950 p-8 flex flex-col gap-10 shadow-[20px_0_60px_rgba(0,0,0,1)]">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
              Edit Prompt
            </label>
            <textarea
              ref={textareaRef}
              autoFocus
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Describe the changes..."
              className="w-full min-h-40 max-h-75 bg-black/40 rounded-2xl p-5 text-[13px] font-bold leading-relaxed focus:bg-black/60 transition-colors outline-none resize-none placeholder-zinc-800 custom-scrollbar"
            />
          </div>

          <div className="space-y-8">
            <Slider
              icon={<Brush className="size-4 text-zinc-600" />}
              label="Brush Size"
              value={brushSize}
              min={5}
              max={180}
              step={5}
              onChange={setBrushSize}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex < 0}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-white/3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 disabled:opacity-10 transition-all"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => {
                  const ctx = canvasRef.current?.getContext('2d');
                  if (ctx && canvasRef.current)
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  saveHistory();
                }}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-red-500/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-auto">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !editPrompt.trim() || historyIndex < 0}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-4 text-[12px] font-black tracking-[0.25em] uppercase transition-all active:scale-95 shadow-2xl
                        ${
                          isGenerating
                            ? 'bg-accent-500/10 text-accent-500/40'
                            : 'bg-accent-600 text-white hover:bg-accent-500 shadow-accent-950/40'
                        } disabled:opacity-20 disabled:pointer-events-none`}
            >
              {isGenerating ? (
                <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {!isGenerating && <span>Apply Edit</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
