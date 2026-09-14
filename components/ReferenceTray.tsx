import React, { useState } from 'react';
import type { Attachment } from '../types';

export function ReferenceTray({
  attachments,
  onEdit,
  onRemove,
  onFiles,
}: {
  attachments: Attachment[];
  onEdit: (attachment: Attachment) => void;
  onRemove: (id: string) => void;
  onFiles: (files: File[], replaceId?: string) => void;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  return (
    <div className="reference-tray" aria-label="Image references">
      {attachments.map((attachment, index) => (
        <div className="reference-item" key={attachment.id}>
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
            <span className="block truncate" title={attachment.name}>
              {attachment.name}
            </span>
            <span className="block text-xs text-zinc-400">
              {attachment.isProcessing
                ? 'Uploading…'
                : failed.includes(attachment.id)
                  ? 'Preview unavailable · replace this image'
                  : index === 0
                    ? 'Source image'
                    : `Detail reference ${index}`}
            </span>
            <div className="flex gap-3 text-xs">
              <label className="cursor-pointer relative">
                Replace
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
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
