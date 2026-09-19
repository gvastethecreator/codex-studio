import React, { useEffect } from 'react';
import { IconX as X } from '@tabler/icons-react';

import { useDialogFocus } from '../../hooks/useDialogFocus';

export interface CreatePromptExpandDialogProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const CreatePromptExpandDialog: React.FC<CreatePromptExpandDialogProps> = ({
  isOpen,
  value,
  onChange,
  onClose,
  onSave,
}) => {
  const dialogRef = useDialogFocus(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        onSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onSave]);

  if (!isOpen) return null;

  return (
    <div className="create-dialog-layer">
      <button
        type="button"
        className="create-dialog-backdrop"
        aria-label="Cancel expanded prompt"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-prompt-dialog-title"
        className="create-prompt-dialog"
      >
        <div className="create-dialog-header">
          <h2 className="create-dialog-title" id="create-prompt-dialog-title">
            Edit prompt
          </h2>
          <button
            type="button"
            className="create-icon-button"
            onClick={onClose}
            tabIndex={-1}
            aria-label="Cancel expanded prompt"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="create-dialog-body">
          <label className="sr-only" htmlFor="create-expanded-prompt">
            Full prompt
          </label>
          <textarea
            id="create-expanded-prompt"
            className="create-expanded-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="create-dialog-actions">
          <span className="create-character-count">{value.length.toLocaleString()} characters</span>
          <button type="button" className="create-dialog-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="create-dialog-button is-primary" onClick={onSave}>
            Save prompt
          </button>
        </div>
      </div>
    </div>
  );
};
