import type { PrefetchOutcome } from './prefetch';

// Deliberately free of IndexedDB/Tauri imports, like sync-status: login,
// sign-out and Settings call these on every platform, and they do nothing
// until install-offline-support.ts (the Tauri app only) registers itself.

export type OfflineData = {
  claim: (userId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<PrefetchOutcome | undefined>;
};

let installed: OfflineData | undefined;

export const registerOfflineData = (data: OfflineData | undefined): void => {
  installed = data;
};

/**
 * Ties the stored data to `userId`. Another user's is deleted first, since
 * it isn't theirs to see. Reads wait for it, so call it before storing the
 * new login token.
 */
export const claimOfflineData = (userId: string): Promise<void> =>
  installed?.claim(userId) ?? Promise.resolve();

/** Deletes everything stored for offline use (sign-out). */
export const clearOfflineData = (): Promise<void> =>
  installed?.clear() ?? Promise.resolve();

/**
 * Refreshes the stored data now rather than at the next scheduled run.
 * Undefined when it didn't run: no offline support, signed out, or a run
 * already going.
 */
export const refreshOfflineData = (): Promise<PrefetchOutcome | undefined> =>
  installed?.refresh() ?? Promise.resolve(undefined);
