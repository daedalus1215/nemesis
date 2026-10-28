import { useSyncExternalStore } from 'react';

export type SyncStatus = {
  /** Whether the last request that reached the network got an answer. */
  reachable: boolean;
  /**
   * Cloudflare Access turned requests away: this device's connection
   * settings (service token) aren't accepted. Stored data keeps the screens
   * readable until they're fixed.
   */
  accessDenied: boolean;
  /** When the background refresh last completed, in ms; undefined if never. */
  refreshedAt: number | undefined;
};

// Deliberately free of IndexedDB/Tauri imports: the app shell reads this on
// every platform, and it just stays at the default wherever the offline
// layer isn't installed.
let status: SyncStatus = {
  reachable: true,
  accessDenied: false,
  refreshedAt: undefined,
};
const listeners = new Set<() => void>();

export const getSyncStatus = (): SyncStatus => status;

export const updateSyncStatus = (patch: Partial<SyncStatus>): void => {
  const next = { ...status, ...patch };
  if (
    (Object.keys(next) as (keyof SyncStatus)[]).every(
      key => next[key] === status[key]
    )
  ) {
    return;
  }
  status = next;
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useSyncStatus = (): SyncStatus =>
  useSyncExternalStore(subscribe, getSyncStatus);
