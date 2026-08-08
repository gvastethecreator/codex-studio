import React from 'react';
import { useToastList, useToastUi } from '../contexts/ToastUiContext';
import Toast from './Toast';

/**
 * Leaf toast list consumer. Subscribes to the toast store so toast appends do
 * not re-render WorkspaceProvider / useStudioShell.
 */
const ToastContainer: React.FC = () => {
  const { toasts } = useToastList();
  const { removeToast } = useToastUi();

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
