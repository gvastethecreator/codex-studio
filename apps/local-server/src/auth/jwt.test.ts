import { describe, expect, it } from 'vitest';

import {
  decodeJwtPayload,
  readChatgptAccountId,
  readJwtAccountLabel,
  readJwtExpiryMs,
} from './jwt';

function encodeJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

describe('subscription jwt claims', () => {
  it('reads ChatGPT account id, label, and expiry from a compact payload', () => {
    const token = encodeJwt({
      email: 'user@example.com',
      exp: 1_893_456_000,
      'https://api.openai.com/auth': { chatgpt_account_id: 'acct-9' },
    });
    expect(readChatgptAccountId(token)).toBe('acct-9');
    expect(readJwtAccountLabel(token)).toBe('user@example.com');
    expect(readJwtExpiryMs(token)).toBe(1_893_456_000_000);
  });

  it('returns null for malformed, truncated, or empty tokens', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('a.%%%')).toBeNull();
    expect(readChatgptAccountId('')).toBeNull();
    expect(readJwtAccountLabel(null)).toBeNull();
    expect(readJwtExpiryMs('header.eyJmb28iOiJiYXIifQ.sig')).toBeNull();
  });

  it('rejects claims that are unsafe for headers or dates', () => {
    const token = encodeJwt({
      exp: Number.MAX_SAFE_INTEGER,
      'https://api.openai.com/auth': { chatgpt_account_id: 'acct-9\r\ninjected' },
    });
    expect(readChatgptAccountId(token)).toBeNull();
    expect(readJwtExpiryMs(token)).toBeNull();
    expect(readJwtAccountLabel(encodeJwt({ email: '\u0000\r\n' }))).toBeNull();
  });
});
