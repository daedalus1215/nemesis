import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { jwtDecode } from 'jwt-decode';
import { createOfflineAdapter } from './offline-adapter';
import { registerOfflineData } from './offline-data';
import { createOfflineStore, type OfflineStore } from './offline-store';
import { prefetchNemesis, type PrefetchOutcome } from './prefetch';
import { startSyncScheduler } from './sync-scheduler';
import { getSyncStatus, updateSyncStatus } from './sync-status';

const TICK_INTERVAL_MS = 30_000;
const PREFETCH_INTERVAL_MS = 30 * 60_000;
// The screens opened at launch fetch (and store) their own data first.
const PREFETCH_STARTUP_DELAY_MS = 10_000;
const PREFETCH_RETRY_MS = 5 * 60_000;
// Tauri's fetch has a 10s connect timeout (configureApiForTauri), but a
// connection can stall after that with nothing to end it.
const READ_TIMEOUT_MS = 15_000;
// Stored answers nothing has refreshed in this long (an account since
// closed, a page of payments not opened again) are dropped.
const KEEP_UNREFRESHED_MS = 30 * 24 * 60 * 60_000;

/** Meta row naming the user the stored data belongs to. */
const OWNER_KEY = 'owner';
/** After sign-out: matches no user, so the next login empties the store. */
const SIGNED_OUT = '';
const REFRESHED_AT_KEY = 'refreshedAt';
const NEXT_PREFETCH_AT_KEY = 'nextPrefetchAt';

const NEXT_PREFETCH_AFTER: Record<PrefetchOutcome, number> = {
  complete: PREFETCH_INTERVAL_MS,
  failed: PREFETCH_INTERVAL_MS,
  throttled: PREFETCH_RETRY_MS,
  'access-denied': PREFETCH_RETRY_MS,
  // Once the user logs in again, or the server is back: refresh then.
  unauthorized: 0,
  unreachable: 0,
};

// axios' typings omit getAdapter's second argument, but the runtime needs the
// request config to resolve the fetch adapter against `config.env.fetch`
// (Tauri's Rust-side fetch) instead of the global fetch.
const resolveFetchAdapter = (config: InternalAxiosRequestConfig): AxiosAdapter =>
  (axios.getAdapter as (
    adapters: 'fetch',
    config: InternalAxiosRequestConfig
  ) => AxiosAdapter)('fetch', config);

const storedToken = () => localStorage.getItem('jwt_token');

type InstallOptions = {
  store?: OfflineStore;
  /** Start background refreshing; off in tests, which have no window. */
  schedule?: boolean;
  /** The real network adapter; defaults to axios' fetch adapter. */
  send?: AxiosAdapter;
  /** The login token, if signed in. */
  token?: () => string | null;
  /** Gap between the background refresh's requests; prefetch.ts's default. */
  prefetchSpacingMs?: number;
};

let stopPrevious: (() => void) | undefined;

/**
 * Makes the shared axios instance show stored data while Nemesis is
 * unreachable, and keeps that data fresh in the background (see
 * offline-adapter.ts and prefetch.ts). In the Tauri app it must run after
 * configureApiForTauri(), which installs the Rust-side fetch it sends
 * through. Safe to call again (new connection settings); the previous
 * install's background work is stopped. Returns one background pass (check
 * the server is back if it seemed gone, then refresh if due), for tests.
 */
export const installOfflineSupport = (
  api: AxiosInstance,
  {
    store = createOfflineStore(),
    schedule = true,
    send = config => resolveFetchAdapter(config)(config),
    token = storedToken,
    prefetchSpacingMs,
  }: InstallOptions = {}
): (() => Promise<void>) => {
  stopPrevious?.();
  stopPrevious = undefined;

  const hasSession = () => token() !== null;

  // Reads wait for the latest claim, so another user's stored data is never
  // served under this login.
  let claimed: Promise<unknown> = Promise.resolve();
  let generation = 0;

  const forget = async () => {
    generation++;
    await store.clear();
    updateSyncStatus({ refreshedAt: undefined });
  };

  const claim = (userId: string) => {
    const run = (async () => {
      await claimed;
      const owner = await store.getMeta<string>(OWNER_KEY);
      if (owner === userId) return;
      if (owner !== undefined) {
        await forget();
      }
      await store.setMeta(OWNER_KEY, userId);
    })();
    // A failed check mustn't block every request behind it.
    claimed = run.catch(error =>
      console.error('Could not check whose offline data this is:', error)
    );
    return run;
  };

  const clear = async () => {
    // Before waiting: answers already on their way mustn't be stored.
    generation++;
    await claimed;
    await forget();
    await store.setMeta(OWNER_KEY, SIGNED_OUT);
  };

  const userId = (() => {
    try {
      const current = token();
      return current === null ? undefined : String(jwtDecode(current).sub);
    } catch {
      return undefined;
    }
  })();
  if (userId !== undefined) {
    claim(userId).catch(() => undefined); // logged by the claim itself
  }

  // New connection settings get a fresh verdict.
  updateSyncStatus({ reachable: true, accessDenied: false });
  void store
    .getMeta<number>(REFRESHED_AT_KEY)
    .then(refreshedAt => updateSyncStatus({ refreshedAt }))
    .catch(() => undefined);

  // Refresh everything as soon as the server is back after an outage.
  let prefetchDueNow = false;
  let probing = false;
  // One request that's sure to reach the network, to see whether the server
  // is back; the answer arrives through the adapter's reachability report.
  const probe = async () => {
    if (probing) return;
    probing = true;
    try {
      await api.get('/healthz', { noOfflineFallback: true });
    } catch {
      // Reported by the adapter.
    } finally {
      probing = false;
    }
  };

  const offlineAdapter = createOfflineAdapter({
    send,
    readTimeoutMs: READ_TIMEOUT_MS,
    store,
    getUri: config => api.getUri(config),
    generation: () => generation,
    onReachabilityChange: reachable => {
      if (reachable && !getSyncStatus().reachable) {
        prefetchDueNow = true;
      }
      updateSyncStatus({ reachable });
    },
    onAccessDeniedChange: accessDenied => updateSyncStatus({ accessDenied }),
    requestProbe: () => void probe(),
  });
  api.defaults.adapter = async config => {
    await claimed;
    return offlineAdapter(config);
  };

  // The schedule is stored, so it holds across launches; nothing stored yet
  // (a new device) means due. The startup delay holds back even an overdue
  // run.
  const prefetchNotBefore = Date.now() + PREFETCH_STARTUP_DELAY_MS;
  let prefetching = false;
  const isPrefetchDue = async () => {
    const next = await store.getMeta<number>(NEXT_PREFETCH_AT_KEY);
    return next === undefined || Date.now() >= next;
  };

  const prefetch = async (): Promise<PrefetchOutcome> => {
    prefetching = true;
    prefetchDueNow = false;
    const startedIn = generation;
    try {
      const outcome = await prefetchNemesis({
        api,
        canContinue: () => hasSession() && generation === startedIn,
        spacingMs: prefetchSpacingMs,
      });
      if (generation !== startedIn) return outcome;
      const now = Date.now();
      if (outcome === 'complete') {
        await store.setMeta(REFRESHED_AT_KEY, now);
        updateSyncStatus({ refreshedAt: now });
        await store.deleteResponsesStoredBefore(now - KEEP_UNREFRESHED_MS);
      }
      await store.setMeta(
        NEXT_PREFETCH_AT_KEY,
        now + NEXT_PREFETCH_AFTER[outcome]
      );
      return outcome;
    } finally {
      prefetching = false;
    }
  };

  const sync = async () => {
    await claimed;
    if (!hasSession()) return;
    if (!getSyncStatus().reachable) {
      await probe();
      if (!getSyncStatus().reachable) return;
    }
    if (prefetching || Date.now() < prefetchNotBefore) return;
    if (!prefetchDueNow && !(await isPrefetchDue())) return;
    await prefetch();
  };

  registerOfflineData({
    claim,
    clear,
    refresh: async () => {
      await claimed;
      if (!hasSession() || prefetching) return undefined;
      return prefetch();
    },
  });

  let schedulerStop: (() => void) | undefined;
  if (schedule) {
    schedulerStop = startSyncScheduler({
      sync,
      canSync: hasSession,
      intervalMs: TICK_INTERVAL_MS,
    });
  }
  stopPrevious = () => {
    registerOfflineData(undefined);
    schedulerStop?.();
    schedulerStop = undefined;
  };

  return sync;
};
