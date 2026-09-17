import React, { useState } from 'react';
import { IconPencil as Pencil, IconRefresh as Refresh, IconX as X } from '@tabler/icons-react';
import type { Attachment } from '../types';

export function ReferenceTray({
  attachments,
  onEdit,
  onRemove,
  onFiles,
  density = 'default',
}: {
  attachments: Attachment[];
  onEdit: (attachment: Attachment) => void;
  onRemove: (id: string) => void;
  onFiles: (files: File[], replaceId?: string) => void;
  density?: 'default' | 'compact';
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const isCompact = density === 'compact';
  return (
    <div className="reference-tray" aria-label="Image references">
      {attachments.map((attachment, index) => {
        const roleLabel = index === 0 ? 'Source image' : `Detail reference ${index}`;
        const statusLabel = attachment.isProcessing
          ? 'Uploading…'
          : failed.includes(attachment.id)
            ? 'Preview unavailable · replace this image'
            : roleLabel;
        return (
          <div
            className="reference-item"
            key={attachment.id}
            title={`${attachment.name} · ${statusLabel}`}
          >
            <button
              type="button"
              onClick={() => onEdit(attachment)}
              disabled={attachment.isProcessing}
              aria-label={`Edit ${attachment.name}`}
            >
              <img
                src={attachment.dataUrl}
                alt=""
                onError={() =>
                  setFailed((current) =>
                    current.includes(attachment.id) ? current : [...current, attachment.id],
                  )
                }
              />
            </button>
            <div className="min-w-0 flex-1">
              <span className="reference-item-copy block truncate" title={attachment.name}>
                {attachment.name}
              </span>
              <span className="reference-item-copy block text-xs text-zinc-400">{statusLabel}</span>
              <div className="reference-item-actions flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => onEdit(attachment)}
                  disabled={attachment.isProcessing}
                  aria-label={`Edit ${attachment.name}`}
                  title="Edit"
                  className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <Pencil size={14} />
                  {isCompact ? null : <span className="sr-only">Edit</span>}
                </button>
                <label className="relative inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white">
                  <Refresh size={14} aria-hidden="true" />
                  <input
                    type="file"
                    accept="image/*"
                    aria-label={`Replace ${attachment.name}`}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      onFiles([file], attachment.id);
                      event.target.value = '';
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  aria-label={`Remove ${attachment.name}`}
                  title="Remove"
                  className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
