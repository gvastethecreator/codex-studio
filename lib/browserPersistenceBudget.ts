import type { Attachment } from '../types';

export const MAX_PERSISTED_INLINE_ATTACHMENT_BYTES = 512 * 1024;

export function filterPersistableInlineAttachments(attachments: Attachment[]) {
  return attachments.filter(
    (attachment) => attachment.dataUrl.length <= MAX_PERSISTED_INLINE_ATTACHMENT_BYTES,
  );
}
