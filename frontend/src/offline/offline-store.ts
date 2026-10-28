import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// Never rename it: that would orphan the data already stored on devices.
const DEFAULT_DB_NAME = 'nemesis-offline';

export type CachedResponse = {
  /** Full URI (base URL + path + query) of the GET this answers. */
  uri: string;
  /** Body exactly as received, before axios' transformResponse runs. */
  data: string;
  storedAt: number;
};

interface OfflineSchema extends DBSchema {
  responses: { key: string; value: CachedResponse };
  /** Whose data this is, and when it was last refreshed. */
  meta: { key: string; value: { key: string; value: unknown } };
}

export type OfflineStore = {
  getResponse: (uri: string) => Promise<CachedResponse | undefined>;
  putResponse: (uri: string, data: string) => Promise<void>;
  getJson: <T>(uri: string) => Promise<T | undefined>;
  countResponses: () => Promise<number>;
  /** Drops responses nothing has refreshed since `time`, for pruning. */
  deleteResponsesStoredBefore: (time: number) => Promise<void>;
  getMeta: <T>(key: string) => Promise<T | undefined>;
  setMeta: (key: string, value: unknown) => Promise<void>;
  /**
   * Empties every store, meta included: on sign-out, or when the data
   * found at login belongs to another user.
   */
  clear: () => Promise<void>;
};

const STORE_NAMES = ['responses', 'meta'] as const;

const parseJson = <T>(data: string): T | undefined => {
  try {
    return JSON.parse(data) as T;
  } catch {
    return undefined;
  }
};

/**
 * What the app keeps on the device to show while Nemesis can't be reached:
 * the server's answers to GETs, by URI (see offline-adapter.ts). A slimmed
 * copy of Omega's store, which also queues writes; Nemesis doesn't.
 */
export const createOfflineStore = (
  dbName: string = DEFAULT_DB_NAME
): OfflineStore => {
  const dbPromise: Promise<IDBPDatabase<OfflineSchema>> = openDB<OfflineSchema>(
    dbName,
    1,
    {
      upgrade(database) {
        database.createObjectStore('responses', { keyPath: 'uri' });
        database.createObjectStore('meta', { keyPath: 'key' });
      },
    }
  );

  return {
    getResponse: async uri => (await dbPromise).get('responses', uri),
    putResponse: async (uri, data) => {
      await (await dbPromise).put('responses', {
        uri,
        data,
        storedAt: Date.now(),
      });
    },
    getJson: async <T>(uri: string): Promise<T | undefined> => {
      const cached = await (await dbPromise).get('responses', uri);
      return cached ? parseJson<T>(cached.data) : undefined;
    },
    countResponses: async () => (await dbPromise).count('responses'),
    deleteResponsesStoredBefore: async time => {
      const db = await dbPromise;
      const tx = db.transaction('responses', 'readwrite');
      for await (const cursor of tx.store.iterate()) {
        if (cursor.value.storedAt < time) {
          await cursor.delete();
        }
      }
      await tx.done;
    },
    getMeta: async <T>(key: string): Promise<T | undefined> =>
      ((await (await dbPromise).get('meta', key))?.value as T | undefined),
    setMeta: async (key, value) => {
      await (await dbPromise).put('meta', { key, value });
    },
    clear: async () => {
      const db = await dbPromise;
      const tx = db.transaction(STORE_NAMES, 'readwrite');
      await Promise.all([
        ...STORE_NAMES.map(name => tx.objectStore(name).clear()),
        tx.done,
      ]);
    },
  };
};
