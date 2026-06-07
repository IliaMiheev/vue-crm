const DB_NAME = 'vue-crm';
const DB_VERSION = 1;
const STORE_NAME = 'key-value';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    });
  }

  return dbPromise;
}

function runTransaction<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = fn(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
        transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
      })
  );
}

export async function idbGet<T>(key: string): Promise<T | null> {
  const value = await runTransaction('readonly', (store) => store.get(key));
  return value === undefined ? null : (value as T);
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  await runTransaction('readwrite', (store) => store.put(value, key));
}

export async function idbRemove(key: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(key));
}

export async function migrateLocalStorageKey<T>(key: string): Promise<T | null> {
  const existing = await idbGet<T>(key);
  if (existing !== null) return existing;

  try {
    const legacy = localStorage.getItem(key);
    if (!legacy) return null;

    const parsed = JSON.parse(legacy) as T;
    await idbSet(key, parsed);
    localStorage.removeItem(key);
    return parsed;
  } catch {
    return null;
  }
}
