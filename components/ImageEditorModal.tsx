import { useDialogFocus } from '../hooks/useDialogFocus';
import {
  IconBrush as Brush,
  IconSparkles as Sparkles,
  IconTrash as Trash2,
  IconArrowBackUp as Undo,
  IconX as X,
} from '@tabler/icons-react';
import React, { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { isImageEditorApplyDisabled } from '../lib/grokImagineUiPolicy';
import type { Attachment } from '../types';
import ActionButton from './ui/ActionButton';
import Slider from './ui/Slider';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Attachment | null;
  onGenerate: (originalImage: Attachment, maskDataUrl: string, editPrompt: string) => void;
  isGenerating: boolean;
  notice?: string | null;
  requireMask?: boolean;
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
  notice?: string | null;
  requireMask?: boolean;
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
  notice,
  requireMask = true,
}: ImageEditorControlsPanelProps) {
  return (
    <div className="studio-inspector custom-scrollbar flex max-h-[44vh] w-full flex-col gap-5 overflow-y-auto bg-[color:var(--wb-panel)] p-4 sm:p-5 md:max-h-none md:w-80 md:gap-6 md:p-5">
      {notice ? (
        <p
          role="status"
          className="text-[11px] font-medium leading-relaxed text-[color:var(--wb-muted)]"
        >
          {notice}
        </p>
      ) : null}
      <div className="space-y-3 sm:space-y-4">
        <label
          htmlFor="image-editor-prompt"
          className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-muted)] tracking-normal"
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
          className="w-full min-h-24 max-h-44 bg-[color:var(--wb-well)] rounded-[var(--wb-radius)] p-4 text-[13px] font-bold leading-relaxed focus:bg-[color:color-mix(in_srgb,var(--wba-bg)_72%,#000)] transition-colors outline-none resize-none placeholder:text-[color:var(--wb-dim)] custom-scrollbar sm:min-h-40 sm:max-h-75 sm:p-5"
        />
      </div>

      <div className="space-y-5 sm:space-y-8">
        <Slider
          icon={<Brush className="size-4 text-[color:var(--wb-dim)]" />}
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
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-white/3 rounded-[var(--wb-radius)] text-[length:var(--wbp-label)] font-semibold tracking-normal hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] disabled:opacity-40 transition-[color,background-color,border-color,opacity,box-shadow,transform]"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-red-500/5 rounded-[var(--wb-radius)] text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)] hover:text-[color:var(--wb-danger)] hover:bg-red-500/10 transition-[color,background-color,border-color,opacity,box-shadow,transform]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <button
          type="button"
          aria-label="Generate image edit"
          onClick={onGenerate}
          disabled={isImageEditorApplyDisabled({
            isGenerating,
            editPrompt,
            historyIndex,
            requireMask,
          })}
          className="studio-primary-control w-full h-10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="size-4 border-2 border-[color:var(--wb-border)] border-t-[color:var(--wb-ink)] rounded-full animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {!isGenerating && <span>Generate edit</span>}
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
  notice,
  requireMask = true,
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.max(
        0,
        Math.min(
          (container.clientWidth - 48) / canvas.width,
          (container.clientHeight - 48) / canvas.height,
        ),
      );
      // Resize only the display. Changing bitmap dimensions would erase the mask.
      canvas.style.width = `${canvas.width * scale}px`;
      canvas.style.height = `${canvas.height * scale}px`;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isOpen]);

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
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

  const moveBrushCursor = useCallback((clientX: number, clientY: number) => {
    if (!brushCursorRef.current) return;
    brushCursorRef.current.style.left = `${clientX}px`;
    brushCursorRef.current.style.top = `${clientY}px`;
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    moveBrushCursor(e.clientX, e.clientY);
    isDrawingRef.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPointerPos(e);
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

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    moveBrushCursor(e.clientX, e.clientY);
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPointerPos(e);
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = canvasRef.current!.width / rect.width;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = brushSize * scale;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e?.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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

  const handleWindowPointerMove = useEffectEvent((event: PointerEvent) => {
    moveBrushCursor(event.clientX, event.clientY);
  });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      handleWindowPointerMove(e);
    };
    if (isOpen) window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isOpen]);

  const handleReset = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  }, [saveHistory]);

  const dialogRef = useDialogFocus(
    isOpen,
    handleClose,
    image ? `[aria-label="Edit ${CSS.escape(image.name)}"]` : undefined,
  );
  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label="Image editor"
      className="fixed inset-0 z-100 m-0 flex h-full w-full flex-col border-none bg-[color:var(--wba-bg)] p-0 backdrop-blur-3xl studio-image-editor"
    >
      <div className="studio-bar flex shrink-0 min-h-16 w-full items-center justify-between gap-3 border-b border-[color:var(--wb-line)] px-4 py-3 sm:h-20 sm:px-10 sm:py-0">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <div className="rounded-[var(--wb-radius)] bg-accent-500/10 p-2 sm:p-2.5">
            <Sparkles size={18} className="text-accent-400 sm:size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-semibold tracking-normal text-[color:var(--wb-ink)] sm:text-sm">
              {requireMask ? 'Precision Inpaint' : 'Prompt Edit'}
            </h2>
            <p className="hidden text-[length:var(--wbp-label)] text-[color:var(--wb-dim)] font-bold tracking-tight sm:block">
              {requireMask ? 'Edit masked area and regenerate' : 'Describe the change, then apply'}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close image editor"
          onClick={handleClose}
          className="rounded-[var(--wb-radius)] bg-[color:var(--wb-panel)] p-3 text-[color:var(--wb-dim)] shadow-xl transition-[background-color,color] hover:bg-[color:var(--wb-bar)] hover:text-[color:var(--wb-ink)]"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          className="relative flex min-h-[42vh] min-w-0 flex-1 items-center justify-center overflow-hidden bg-[color:var(--wb-canvas)] p-6"
          ref={containerRef}
        >
          {image && (
            <img
              src={image.dataUrl}
              alt=""
              className="absolute inset-6 object-contain pointer-events-none opacity-100"
              style={{
                width: 'calc(100% - 48px)',
                height: 'calc(100% - 48px)',
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
            className="relative z-10 cursor-none touch-none opacity-50 shadow-[0_0_100px_rgba(255,255,255,0.05)]"
          />
          <div
            ref={brushCursorRef}
            className="fixed pointer-events-none border border-[color:var(--wb-line)] shadow-2xl rounded-full mix-blend-difference z-110"
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
          notice={notice}
          requireMask={requireMask}
        />
      </div>
    </div>
  );
};
