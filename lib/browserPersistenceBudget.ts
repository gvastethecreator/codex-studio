import type { Attachment } from '../types';

export const MAX_PERSISTED_INLINE_ATTACHMENT_BYTES = 512 * 1024;

function hasDurableAttachmentLocation(attachment: Attachment) {
  return Boolean(attachment.localPath?.trim() || attachment.sourceUrl?.trim());
}

export function isInlineImageDataUrl(value: string | null | undefined) {
  return /^data:image\/[^;]+;base64,/i.test(value?.trim() ?? '');
}

export function preparePersistableAttachments(attachments: Attachment[]) {
  let omittedInlineCount = 0;

  const persistableAttachments = attachments.flatMap((attachment) => {
    if (
      !isInlineImageDataUrl(attachment.dataUrl) ||
      attachment.dataUrl.length <= MAX_PERSISTED_INLINE_ATTACHMENT_BYTES
    ) {
      return [{ ...attachment }];
    }

    if (hasDurableAttachmentLocation(attachment)) {
      return [
        {
          ...attachment,
          dataUrl: attachment.sourceUrl?.trim() || '',
        },
      ];
    }

    omittedInlineCount += 1;
    return [];
  });

  return {
    attachments: persistableAttachments,
    omittedInlineCount,
  };
}

export function filterPersistableInlineAttachments(attachments: Attachment[]) {
  return preparePersistableAttachments(attachments).attachments;
}
