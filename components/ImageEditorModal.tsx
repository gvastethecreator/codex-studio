import { Brush, Sparkles, Trash2, Undo, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Attachment } from '../types';
import ActionButton from './ui/ActionButton';
import Slider from './ui/Slider';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Attachment | null;
  onGenerate: (originalImage: Attachment, maskDataUrl: string, editPrompt: string) => void;
  isGenerating: boolean;
}

interface ImageEditorControlsPanelProps {
  editPrompt: string;
  onEditPromptChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  brushSize: number;
  onBrushSizeChange: (v: number) => void;
  historyIndex: number;
  isGenerating: boolean;
  onUndo: () => void;
  onReset: () => void;
  onGenerate: () => void;
}

function ImageEditorControlsPanel({
  editPrompt,
  onEditPromptChange,
  textareaRef,
  brushSize,
  onBrushSizeChange,
  historyIndex,
  isGenerating,
  onUndo,
  onReset,
  onGenerate,
}: ImageEditorControlsPanelProps) {
  return (
    <div className="w-full md:w-96 bg-zinc-950 p-8 flex flex-col gap-10 shadow-[20px_0_60px_rgba(0,0,0,1)]">
      <div className="space-y-4">
        <label
          htmlFor="image-editor-prompt"
          className="text-[10px] font-black text-zinc-700 uppercase tracking-widest"
        >
          Edit Prompt
        </label>
        <textarea
          id="image-editor-prompt"
          ref={textareaRef}
          value={editPrompt}
          onChange={(e) => onEditPromptChange(e.target.value)}
          placeholder="Describe the changes..."
          aria-label="Edit prompt"
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
          onChange={onBrushSizeChange}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={historyIndex < 0}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-white/3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 disabled:opacity-10 transition-all"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-red-500/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <button
          type="button"
          onClick={onGenerate}
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
  );
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
  const isDrawingRef = useRef(false);
  const historyRef = useRef<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const prevIsOpenRef = useRef(false);

  if (prevIsOpenRef.current && !isOpen) {
    prevIsOpenRef.current = false;
  }
  if (!prevIsOpenRef.current && isOpen) {
    prevIsOpenRef.current = true;
  }

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
      const containerWidth = container.clientWidth - 48;
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
    setupCanvas();
  }, [setupCanvas]);

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

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newHistory = historyRef.current.slice(0, historyIndex + 1);
    if (newHistory.length > 20) newHistory.shift();

    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    historyRef.current = newHistory;
    setHistoryIndex(newHistory.length - 1);
  }, [historyIndex]);

  const startDrawing = (e: React.MouseEvent) => {
    isDrawingRef.current = true;
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
    if (!isDrawingRef.current) return;
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
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveHistory();
    }
  };

  const handleUndo = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      ctx.putImageData(historyRef.current[newIndex], 0, 0);
    } else {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistoryIndex(-1);
    }
  };

  const handleClose = useCallback(() => {
    historyRef.current = [];
    setHistoryIndex(-1);
    setEditPrompt('');
    onClose();
  }, [onClose]);

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

  const handleReset = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  }, [saveHistory]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-100 m-0 flex h-full w-full flex-col border-none bg-black/98 p-0 backdrop-blur-3xl animate-in fade-in duration-500"
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
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
          onClick={handleClose}
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
            style={{
              width: brushSize,
              height: brushSize,
              transform: `translate(-50%, -50%)`,
            }}
          />
        </div>

        <ImageEditorControlsPanel
          editPrompt={editPrompt}
          onEditPromptChange={setEditPrompt}
          textareaRef={textareaRef}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          historyIndex={historyIndex}
          isGenerating={isGenerating}
          onUndo={handleUndo}
          onReset={handleReset}
          onGenerate={handleGenerate}
        />
      </div>
    </dialog>
  );
};
