const MAX_OAUTH_RESPONSE_BYTES = 64 * 1024;
const MAX_OAUTH_MESSAGE_LENGTH = 300;

function contentLength(response: Response) {
  const raw = response.headers.get('content-length');
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function readTextLimited(response: Response, maxBytes: number) {
  const declaredLength = contentLength(response);
  if (declaredLength !== null && declaredLength > maxBytes) {
    throw new Error('OAuth provider response exceeded the allowed size.');
  }
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error('OAuth provider response exceeded the allowed size.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function readOAuthJson(response: Response): Promise<Record<string, unknown>> {
  const text = await readTextLimited(response, MAX_OAUTH_RESPONSE_BYTES);
  if (!text) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function safeOAuthText(value: unknown, maxLength = MAX_OAUTH_MESSAGE_LENGTH) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
