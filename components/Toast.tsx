
import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import type { ToastMessage } from '../hooks/useToasts';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const icons = {
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  info: <Info className="w-5 h-5 text-accent-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

const borderColors = {
  error: 'border-red-500/50',
  success: 'border-green-500/50',
  info: 'border-accent-500/50',
  warning: 'border-yellow-500/50',
};

const progressColors = {
  error: 'bg-red-500',
  success: 'bg-green-500',
  info: 'bg-accent-500',
  warning: 'bg-yellow-500',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || (toast.type === 'error' ? 25000 : 8000); // Errors last longer by default

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        onDismiss(toast.id);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [toast.id, onDismiss, duration]);

  return (
    <div
      className={`relative w-full max-w-md bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-5 border-l-4 ${borderColors[toast.type]} animate-in slide-in-from-top-4 fade-in-0 duration-300 overflow-hidden`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-grow flex flex-col justify-center min-h-[1.5rem]">
          <p className="text-base text-zinc-100 font-medium leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1.5 -mr-1.5 -mt-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-700/50">
        <div 
          className={`h-full ${progressColors[toast.type]} transition-all duration-75 ease-linear`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;
