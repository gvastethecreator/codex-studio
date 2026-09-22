import { useDialogFocus } from '../hooks/useDialogFocus';
import React from 'react';
import { AnimatePresence, MotionDiv } from '../lib/gsapMotion';
import {
  IconTrash as Trash2,
  IconRotate as RotateCcw,
  IconX as X,
  IconTrash as Trash,
  IconAlertCircle as AlertCircle,
} from '@tabler/icons-react';
import type { ArchivedImageGroup } from '../lib/studioCatalogTrashView';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trash: ArchivedImageGroup[];
  onRestore: (batchId: string) => void;
  onRestoreAll: () => void;
  onEmpty: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  trash,
  onRestore,
  onRestoreAll,
  onEmpty,
}) => {
  const dialogRef = useDialogFocus(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-8">
        <MotionDiv
          aria-label="Close archive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 studio-scrim backdrop-blur-md"
        />

        <MotionDiv
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Archive"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="studio-dialog relative flex h-full w-full max-w-4xl flex-col overflow-hidden sm:h-auto sm:max-h-[88vh] sm:rounded-[var(--wb-radius)]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-4 sm:items-center sm:p-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-[var(--wb-radius)] bg-red-500/10 p-2.5 text-[color:var(--wb-danger)]">
                <Trash2 size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold tracking-normal text-[color:var(--wb-ink)] sm:text-lg">
                  Archive
                </h2>
                <p className="text-[length:var(--wbp-label)] text-[color:var(--wb-muted)] font-bold tracking-normal">
                  {trash.length} image groups available to restore
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {trash.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={onRestoreAll}
                    className="flex items-center gap-2 rounded-[var(--wb-radius)] bg-accent-500/10 px-3 py-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-accent-400 transition-colors hover:bg-accent-500/20 sm:px-4 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Restore All</span>
                  </button>
                  <button
                    type="button"
                    onClick={onEmpty}
                    className="flex items-center gap-2 rounded-[var(--wb-radius)] bg-red-500/10 px-3 py-2 text-[length:var(--wbp-label)] font-semibold tracking-normal text-[color:var(--wb-danger)] transition-colors hover:bg-red-500/20 sm:px-4 cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Delete permanently</span>
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label="Close archive"
                onClick={onClose}
                className="p-2 rounded-[var(--wb-radius)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] text-[color:var(--wb-muted)] hover:text-[color:var(--wb-ink)] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {trash.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="size-16 rounded-full bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] flex items-center justify-center text-[color:var(--wb-dim)] mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-[color:var(--wb-muted)] font-bold tracking-normal text-sm mb-1">
                  Archive is empty
                </h3>
                <p className="text-[color:var(--wb-dim)] text-xs max-w-[240px]">
                  Images archived appear here until you restore or permanently delete them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {trash.map((group) => (
                  <div
                    key={group.id}
                    className="group flex flex-col gap-3 rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color-mix(in_srgb,var(--wb-ink)_6%,transparent)] p-3 transition-[background-color,border-color,box-shadow] hover:border-[color:var(--wb-border)] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                  >
                    <div className="size-20 rounded-[var(--wb-radius)] overflow-hidden bg-[color:var(--wb-well)] flex-shrink-0 border border-[color:var(--wb-line)]">
                      {group.thumbnail && (
                        <img
                          src={group.thumbnail}
                          className="size-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          alt=""
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[length:var(--wbp-label)] font-semibold text-[color:var(--wb-muted)] tracking-normal">
                          {new Date(group.createdAt).toLocaleString()}
                        </span>
                        <span className="size-1 rounded-full bg-[color:var(--wb-bar)]" />
                        <span className="text-[length:var(--wbp-label)] font-bold text-accent-500 tracking-normal">
                          {group.workspaceId || 'Default'}
                        </span>
                      </div>
                      <h4 className="text-xs text-[color:var(--wb-ink)] font-medium line-clamp-1 mb-2">
                        {group.prompt}
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[length:var(--wbp-label)] text-[color:var(--wb-muted)] font-bold">
                          <span className="size-1.5 rounded-full bg-[color:var(--wb-dim)]" />
                          {group.imageCount} Images
                        </div>
                        <div className="text-[length:var(--wbp-label)] text-[color:var(--wb-muted)] font-bold">
                          {group.model}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Restore batch ${group.id}`}
                      onClick={() => onRestore(group.id)}
                      className="flex h-11 w-full items-center justify-center rounded-[var(--wb-radius)] bg-accent-500/10 p-3 text-accent-400 transition-[color,background-color,transform] hover:bg-accent-500 hover:text-[color:var(--wb-ink)] active:scale-90 sm:w-auto cursor-pointer"
                      data-tooltip="Restore image group"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[color:var(--wb-well)] border-t border-[color:var(--wb-line)] flex items-center gap-3">
            <AlertCircle size={14} className="text-[color:var(--wb-dim)]" />
            <p className="text-[length:var(--wbp-label)] text-[color:var(--wb-dim)] font-bold tracking-normal">
              Restore images to return them to their workspace. Deleting permanently removes them.
            </p>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
};
