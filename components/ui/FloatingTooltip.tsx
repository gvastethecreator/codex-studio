import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';
import { createPortal } from 'react-dom';

interface FloatingTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export const FloatingTooltip: React.FC<FloatingTooltipProps> = ({
  content,
  children,
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const tooltipNodeRef = useRef<HTMLDivElement | null>(null);

  const updateTooltipPosition = useCallback(() => {
    frameRef.current = null;
    const node = tooltipNodeRef.current;
    if (!node) return;

    const offset = 15;
    const { x, y } = positionRef.current;
    let nextX = x + offset;
    let nextY = y + offset;
    const width = node.offsetWidth;
    const height = node.offsetHeight;

    if (nextX + width > window.innerWidth - 10) {
      nextX = x - width - offset;
    }

    if (nextY + height > window.innerHeight - 10) {
      nextY = y - height - offset;
    }

    node.style.transform = `translate3d(${Math.max(10, nextX)}px, ${Math.max(10, nextY)}px, 0)`;
  }, []);

  const scheduleTooltipPosition = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(updateTooltipPosition);
  }, [updateTooltipPosition]);

  const setTooltipNode = useCallback(
    (node: HTMLDivElement | null) => {
      tooltipNodeRef.current = node;
      if (node) scheduleTooltipPosition();
    },
    [scheduleTooltipPosition],
  );

  const handleMouseEnter = (e: React.MouseEvent) => {
    positionRef.current = { x: e.clientX, y: e.clientY };
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      scheduleTooltipPosition();
    }, delay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    positionRef.current = { x: e.clientX, y: e.clientY };
    if (tooltipNodeRef.current) scheduleTooltipPosition();
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      const timeout = timeoutRef.current;
      if (timeout) clearTimeout(timeout);
      const frame = frameRef.current;
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="w-full h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isVisible && <TooltipPortal content={content} setNode={setTooltipNode} />}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

const TooltipPortal = ({
  content,
  setNode,
}: {
  content: React.ReactNode;
  setNode: (node: HTMLDivElement | null) => void;
}) => {
  return (
    <MotionDiv
      ref={setNode}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
      }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.15, ease: 'easeOut' },
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: 'translate3d(-9999px, -9999px, 0)',
        zIndex: 50,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
      className="rounded-[6px] border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
    >
      {content}
    </MotionDiv>
  );
};
