const memory = new Map<string, unknown>();

function keyOf(key: IDBValidKey): string {
  if (typeof key === 'string') return `string:${key}`;
  if (typeof key === 'number') return `number:${key}`;
  if (key instanceof Date) return `date:${key.toISOString()}`;
  if (Array.isArray(key)) return `array:[${key.map(keyOf).join(',')}]`;

  const bytes =
    key instanceof ArrayBuffer
      ? new Uint8Array(key)
      : ArrayBuffer.isView(key)
        ? new Uint8Array(key.buffer, key.byteOffset, key.byteLength)
        : null;
  if (bytes)
    return `binary:${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  throw new TypeError('Unsupported IndexedDB key type.');
}

export async function get<T>(key: IDBValidKey): Promise<T | undefined> {
  return memory.get(keyOf(key)) as T | undefined;
}

export async function set(key: IDBValidKey, value: unknown): Promise<void> {
  memory.set(keyOf(key), value);
}

export async function del(key: IDBValidKey): Promise<void> {
  memory.delete(keyOf(key));
}

export async function clearAll(): Promise<void> {
  memory.clear();
}
