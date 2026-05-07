import React from 'react';
import { Key, ExternalLink, ShieldCheck, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KeyPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKey: () => Promise<void>;
}

const KeyPopover: React.FC<KeyPopoverProps> = ({ isOpen, onClose, onSelectKey }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-full mb-3 right-0 w-72 bg-zinc-900 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl z-[100] origin-bottom-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-accent-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Credenciales Pro
              </span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Codex ImageGen usa tu sesion local de{' '}
              <span className="text-accent-400 font-bold">Codex/ChatGPT</span>. No requiere API key;
              el backend local supervisa codex app-server.
            </p>

            <button
              onClick={onSelectKey}
              className="w-full h-9 bg-accent-600 hover:bg-accent-500 text-white text-[9px] font-black tracking-widest uppercase rounded-lg transition-all active:scale-95 shadow-lg shadow-accent-900/20"
            >
              Verificar Sesion Local
            </button>

            <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 opacity-60">
                <ShieldCheck size={12} className="text-accent-500" />
                <span className="text-[8px] font-bold text-zinc-400 uppercase">
                  Gestion Local por Codex
                </span>
              </div>
              <a
                href="https://developers.openai.com/codex/app-server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-500 hover:text-white transition-colors"
              >
                Documentacion app-server <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-full right-4 w-3 h-3 bg-zinc-900 border-r border-b border-white/10 rotate-45 -translate-y-1.5"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyPopover;
