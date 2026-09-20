const memory = new Map<string, unknown>();

function keyOf(key: IDBValidKey) {
  return String(key);
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
