/**
 * Asynchronous IndexedDB storage engine for large dataset caching.
 * Bypasses the ~5MB limit of localStorage and prevents main-thread JSON freeze.
 */

const DB_NAME = "unaited_synapsis_idb_v1";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

// In-memory fallback for SSR / environments without indexedDB (e.g. unit tests without fake-indexeddb)
const memoryStore = new Map<string, any>();

function getIndexedDB(): IDBFactory | null {
  if (typeof window !== "undefined" && window.indexedDB) {
    return window.indexedDB;
  }
  return null;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  const idb = getIndexedDB();
  if (!idb) {
    return Promise.reject(new Error("IndexedDB is not supported in this environment"));
  }

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = idb.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error("Failed to open IndexedDB"));
      };
    } catch (err) {
      reject(err);
    }
  });

  return dbPromise;
}

export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    return new Promise<T | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result !== undefined ? (req.result as T) : null);
        };
        req.onerror = () => {
          resolve(memoryStore.has(key) ? (memoryStore.get(key) as T) : null);
        };
      } catch {
        resolve(memoryStore.has(key) ? (memoryStore.get(key) as T) : null);
      }
    });
  } catch {
    return memoryStore.has(key) ? (memoryStore.get(key) as T) : null;
  }
}

export async function idbSet<T = any>(key: string, value: T): Promise<void> {
  memoryStore.set(key, value);
  try {
    const db = await getDb();
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Fallback to memory store succeeded
  }
}

export async function idbRemove(key: string): Promise<void> {
  memoryStore.delete(key);
  try {
    const db = await getDb();
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Handled
  }
}

export async function idbClear(): Promise<void> {
  memoryStore.clear();
  try {
    const db = await getDb();
    return new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Handled
  }
}
