
const DB_NAME = 'AIImageStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject('IndexedDB is not supported');
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
        dbPromise = null; // Reset promise on error
      };
    });
  }
  return dbPromise;
}

export async function get<T>(key: IDBValidKey): Promise<T | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function set(key: IDBValidKey, value: any): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getAllKeys(): Promise<IDBValidKey[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllEntries(): Promise<{ key: IDBValidKey, value: any }[]> {
  const db = await getDB();
  const keys = await getAllKeys();
  const entries: { key: IDBValidKey, value: any }[] = [];
  
  for (const key of keys) {
    const value = await get(key);
    entries.push({ key, value });
  }
  
  return entries;
}
