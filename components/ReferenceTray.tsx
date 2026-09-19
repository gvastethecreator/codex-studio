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
  density?: 'default' | 'compact' | 'thumbs';
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const isCompact = density === 'compact';
  const isThumbs = density === 'thumbs';
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
            className={`reference-item${isThumbs ? ' is-thumb' : ''}`}
            key={attachment.id}
            title={`${attachment.name} · ${statusLabel}`}
          >
            <button
              type="button"
              className="reference-item-preview"
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
            {isThumbs ? (
              <button
                type="button"
                className="reference-item-remove"
                onClick={() => onRemove(attachment.id)}
                aria-label={`Remove ${attachment.name}`}
                title="Remove"
              >
                <X size={12} />
              </button>
            ) : (
              <div className="min-w-0 flex-1">
                <span className="reference-item-copy block truncate" title={attachment.name}>
                  {attachment.name}
                </span>
                <span className="reference-item-copy block text-xs text-[color:var(--wb-muted)]">
                  {statusLabel}
                </span>
                <div className="reference-item-actions flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onEdit(attachment)}
                    disabled={attachment.isProcessing}
                    aria-label={`Edit ${attachment.name}`}
                    title="Edit"
                    className="inline-flex size-7 items-center justify-center rounded-md text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
                  >
                    <Pencil size={14} />
                    {isCompact ? null : <span className="sr-only">Edit</span>}
                  </button>
                  <label className="relative inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]">
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
                    className="inline-flex size-7 items-center justify-center rounded-md text-[color:var(--wb-muted)] hover:bg-[color-mix(in_srgb,var(--wb-ink)_8%,transparent)] hover:text-[color:var(--wb-ink)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
