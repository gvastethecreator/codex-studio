const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
/** Stable JSON, key-order independent and array-order preserving. Reject rather than silently lose data. */
export function canonicalJson(value: unknown): string {
  const seen = new Set<object>();
  const visit = (v: unknown): string => {
    if (v === null) return 'null';
    if (typeof v === 'string' || typeof v === 'boolean') return JSON.stringify(v);
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) throw new Error('Non-finite number in canonical input.');
      return JSON.stringify(v);
    }
    if (typeof v !== 'object') throw new Error(`Unsupported canonical value: ${typeof v}`);
    if (seen.has(v)) throw new Error('Cyclic canonical input.');
    seen.add(v);
    try {
      if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++)
          if (!(i in v)) throw new Error('Sparse arrays are not supported.');
        return '[' + v.map(visit).join(',') + ']';
      }
      const proto = Object.getPrototypeOf(v);
      if (proto !== null && proto !== Object.prototype)
        throw new Error('Only plain JSON objects are supported.');
      if (Object.getOwnPropertySymbols(v).length) throw new Error('Symbol keys are not supported.');
      if (
        Object.values(Object.getOwnPropertyDescriptors(v)).some(
          (descriptor) => 'get' in descriptor || 'set' in descriptor,
        )
      )
        throw new Error('Accessors are not supported.');
      const object = v as Record<string, unknown>;
      const keys = Object.keys(object).sort();
      if (keys.some((key) => BAD_KEYS.has(key))) throw new Error('Forbidden object key.');
      return (
        '{' + keys.map((key) => JSON.stringify(key) + ':' + visit(object[key])).join(',') + '}'
      );
    } finally {
      seen.delete(v);
    }
  };
  return visit(value);
}
type SubtleCryptoLike = {
  digest(algorithm: string, data: Uint8Array): Promise<ArrayBuffer>;
};

export function utf8Bytes(text: string): Uint8Array {
  const Encoder = (globalThis as { TextEncoder?: new () => { encode(input: string): Uint8Array } })
    .TextEncoder;
  if (!Encoder) throw new Error('TextEncoder is required to hash style snapshots.');
  return new Encoder().encode(text);
}

export async function sha256(value: unknown): Promise<string> {
  const crypto = (globalThis as { crypto?: { subtle?: SubtleCryptoLike } }).crypto;
  if (!crypto?.subtle) throw new Error('Web Crypto is required to hash style snapshots.');
  const hash = await crypto.subtle.digest('SHA-256', utf8Bytes(canonicalJson(value)));
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
export function jsonClone<T>(value: T): T {
  return JSON.parse(canonicalJson(value)) as T;
}
