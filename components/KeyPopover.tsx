import React from 'react';
import {
  IconKey as Key,
  IconExternalLink as ExternalLink,
  IconShieldCheck as ShieldCheck,
  IconX as X,
} from '@tabler/icons-react';
import { AnimatePresence, MotionDiv } from '../lib/gsapMotion';

interface KeyPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKey: () => Promise<void>;
}

const KeyPopover: React.FC<KeyPopoverProps> = ({ isOpen, onClose, onSelectKey }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-full right-0 z-100 mb-3 w-72 origin-bottom-right rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-[color:var(--wb-line)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-accent-400" />
              <span className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-ink)] tracking-normal">
                Local Session
              </span>
            </div>
            <button
              type="button"
              aria-label="Close local session help"
              onClick={onClose}
              className="text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-[length:var(--wbp-label)] text-[color:var(--wb-muted)] leading-relaxed">
              Codex ImageGen uses your local session of{' '}
              <span className="text-accent-400 font-bold">Codex/ChatGPT</span>. No API key required;
              the local backend supervises codex app-server.
            </p>

            <button
              type="button"
              onClick={onSelectKey}
              className="w-full h-9 bg-accent-600 hover:bg-accent-500 text-[color:var(--wb-ink)] text-[length:var(--wbp-label)] font-semibold tracking-normal rounded-[var(--wb-radius)] transition-[color,background-color,border-color,opacity,box-shadow,transform] active:scale-95 shadow-lg shadow-accent-900/20"
            >
              Verify Local Session
            </button>

            <div className="pt-2 border-t border-[color:var(--wb-line)] flex flex-col gap-2">
              <div className="flex items-center gap-2 opacity-60">
                <ShieldCheck size={12} className="text-accent-500" />
                <span className="text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-muted)]">
                  Local Management by Codex
                </span>
              </div>
              <a
                href="https://developers.openai.com/codex/app-server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[length:var(--wbp-label)] font-bold text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)] transition-colors"
              >
                app-server Documentation <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-full right-4 size-3 bg-[color:var(--wb-panel)] border-r border-b border-[color:var(--wb-line)] rotate-45 -translate-y-1.5"></div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default KeyPopover;
