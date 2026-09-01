function decodeBase64Url(value: string) {
  const padded =
    value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const parsed = JSON.parse(decodeBase64Url(parts[1])) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function readChatgptAccountId(accessToken: string): string | null {
  const claims = decodeJwtPayload(accessToken);
  const auth = claims?.['https://api.openai.com/auth'];
  if (!auth || typeof auth !== 'object') return null;
  const accountId = (auth as Record<string, unknown>).chatgpt_account_id;
  return typeof accountId === 'string' && accountId.trim() ? accountId.trim() : null;
}

export function readJwtAccountLabel(token: string | null | undefined): string | null {
  if (!token) return null;
  const claims = decodeJwtPayload(token);
  if (!claims) return null;
  for (const key of ['email', 'preferred_username', 'name', 'sub']) {
    const value = claims[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function readJwtExpiryMs(token: string | null | undefined): number | null {
  if (!token) return null;
  const claims = decodeJwtPayload(token);
  const exp = claims?.exp;
  return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null;
}
