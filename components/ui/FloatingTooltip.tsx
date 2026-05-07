import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
            {isVisible && <TooltipPortal content={content} position={position} />}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

const TooltipPortal = ({
  content,
  position,
}: {
  content: React.ReactNode;
  position: { x: number; y: number };
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x: position.x + 15, y: position.y + 15 });

  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      let newX = position.x + 15;
      let newY = position.y + 15;

      // Check right edge
      if (newX + rect.width > window.innerWidth - 10) {
        newX = position.x - rect.width - 15;
      }

      // Check bottom edge
      if (newY + rect.height > window.innerHeight - 10) {
        newY = position.y - rect.height - 15;
      }

      setAdjustedPos({ x: newX, y: newY });
    }
  }, [position]);

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.95, x: adjustedPos.x, y: adjustedPos.y }}
      animate={{
        opacity: 1,
        scale: 1,
        x: adjustedPos.x,
        y: adjustedPos.y,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.15, ease: 'easeOut' },
        scale: { duration: 0.15, ease: 'easeOut' },
        x: { type: 'spring', damping: 25, stiffness: 300 },
        y: { type: 'spring', damping: 25, stiffness: 300 },
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
      className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
    >
      {content}
    </motion.div>
  );
};
