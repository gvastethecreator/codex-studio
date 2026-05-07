import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  duration?: number;
}

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};
