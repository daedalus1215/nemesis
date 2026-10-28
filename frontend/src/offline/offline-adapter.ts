import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  isAccessDenied,
  isBackendUnavailable,
  isBackendUnreachable,
} from './offline-errors';
import { deriveOfflineResponse } from './offline-reads';
import type { OfflineStore } from './offline-store';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Store a successful GET as usual, but surface failures instead of
     * answering from the store — for background fetches that need to know
     * whether the backend actually answered.
     */
    noOfflineFallback?: boolean;
  }
}

/** Set on responses produced locally instead of by the backend. */
export const OFFLINE_RESPONSE_HEADER = 'x-nemesis-offline';

/** A change the app didn't send, because Nemesis already seemed unreachable. */
export const WRITE_REFUSED_OFFLINE =
  "You're offline, so this wasn't sent. Try again once Nemesis can be reached.";

/** A change sent to a Nemesis that didn't answer: it may have got through. */
export const WRITE_UNANSWERED =
  "Couldn't reach Nemesis, so this may or may not have gone through. Check before trying again.";

export type OfflineAdapterDeps = {
  /** The real network adapter. */
  send: AxiosAdapter;
  /**
   * Default timeout for reads with a non-blob responseType; an explicit
   * config.timeout wins. Writes get none: a transfer given up on halfway
   * might still go through.
   */
  readTimeoutMs?: number;
  store: OfflineStore;
  getUri: (config: InternalAxiosRequestConfig) => string;
  /** Reports whether each request that went to the network got an answer. */
  onReachabilityChange?: (reachable: boolean) => void;
  /**
   * Reports, for each request that got an answer, whether Cloudflare Access
   * turned it away (true) or let it through to the backend (false).
   */
  onAccessDeniedChange?: (denied: boolean) => void;
  /** Asks for a check on whether Nemesis is back, after refusing a write. */
  requestProbe?: () => void;
  /**
   * Bumped whenever the stored data is cleared or changes hands. An answer
   * to a request sent before then isn't stored, so a signed-out user's data
   * can't land back in the store after it was emptied.
   */
  generation?: () => number;
};

const synthesizeResponse = (
  config: InternalAxiosRequestConfig,
  data: string
): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders({ [OFFLINE_RESPONSE_HEADER]: '1' }),
  config,
});

const isJson = (data: string): boolean => {
  try {
    JSON.parse(data);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ridden out with stored data: an outage, rate limiting, or Cloudflare
 * Access rejecting the connection settings (until they're fixed). An
 * expired session isn't: the app signs out, as it does online.
 */
const shouldRideOut = (error: unknown): boolean =>
  isBackendUnavailable(error) || isAccessDenied(error);

/**
 * Wraps the network adapter so the app's screens keep working, read-only,
 * while Nemesis is unreachable. Ported from Omega's, without its outbox:
 * money and invoices change on the server, so nothing is queued to replay
 * later against balances that may have moved on.
 *
 * - GETs: every successful JSON response is stored, and replayed verbatim
 *   (pre-transformResponse, so callers can't tell the difference) when the
 *   backend can't be reached. The network is tried first, unless the last
 *   request found the backend unreachable: then a stored copy is returned
 *   straight away while the request goes out in the background. Details
 *   are also answered from a stored list that holds them, when that's newer
 *   (see offline-reads.ts).
 * - Everything else goes to the network. While the backend seems
 *   unreachable it's refused without sending, so it's certain nothing went
 *   out, and a check for the backend coming back is requested; one that's
 *   sent and gets no answer says it may have gone through.
 */
export const createOfflineAdapter = ({
  send: sendToNetwork,
  store,
  getUri,
  onReachabilityChange,
  onAccessDeniedChange,
  requestProbe,
  readTimeoutMs,
  generation = () => 0,
}: OfflineAdapterDeps): AxiosAdapter => {
  // Set while the last request to go out found the backend unreachable.
  // Reads that can be answered locally then are, instead of each waiting
  // out the connect timeout first: with no network at all (airplane mode on
  // Android), every attempt takes the full timeout.
  let backendUnreachable = false;
  // Meanwhile one read at a time still goes out, in the background, so the
  // app notices the backend coming back.
  let probing = false;

  const send: AxiosAdapter = async config => {
    try {
      const response = await sendToNetwork(config);
      backendUnreachable = false;
      onReachabilityChange?.(true);
      onAccessDeniedChange?.(false);
      return response;
    } catch (error) {
      if (!axios.isCancel(error)) {
        backendUnreachable = isBackendUnreachable(error);
        onReachabilityChange?.(!backendUnreachable);
        if (axios.isAxiosError(error) && error.response) {
          onAccessDeniedChange?.(isAccessDenied(error));
        }
      }
      throw error;
    }
  };

  const handleRead = async (
    config: InternalAxiosRequestConfig
  ): Promise<AxiosResponse> => {
    // Blob downloads run to completion: no default timeout. axios merges the
    // instance's `timeout: 0` default into every request, so "no explicit
    // timeout" shows up as 0 as often as undefined.
    if (
      config.responseType !== 'blob' &&
      readTimeoutMs !== undefined &&
      !config.timeout
    ) {
      config.timeout = readTimeoutMs;
    }
    const uri = getUri(config);

    const fetchAndStore = async () => {
      const sentIn = generation();
      const response = await send(config);
      // A captive portal's login page can come back as a 200 too.
      if (
        sentIn === generation() &&
        typeof response.data === 'string' &&
        isJson(response.data)
      ) {
        await store
          .putResponse(uri, response.data)
          .catch(err => console.warn('Could not store offline response:', err));
      }
      return response;
    };

    /** The newest of this request's stored copy and one derived from others. */
    const answerLocally = async (): Promise<AxiosResponse | undefined> => {
      const path = new URL(uri, 'http://offline.invalid').pathname;
      const [cached, derived] = await Promise.all([
        store.getResponse(uri),
        deriveOfflineResponse(path, {
          store,
          uri: p => getUri({ ...config, url: p, params: undefined }),
        }),
      ]);
      if (derived && (!cached || derived.storedAt > cached.storedAt)) {
        return synthesizeResponse(config, JSON.stringify(derived.body));
      }
      return cached && synthesizeResponse(config, cached.data);
    };

    if (backendUnreachable && !config.noOfflineFallback) {
      const local = await answerLocally();
      if (local) {
        if (!probing) {
          probing = true;
          void fetchAndStore()
            .catch(() => undefined)
            .finally(() => {
              probing = false;
            });
        }
        return local;
      }
    }

    try {
      return await fetchAndStore();
    } catch (error) {
      if (config.noOfflineFallback || !shouldRideOut(error)) {
        throw error;
      }
      const local = await answerLocally();
      if (!local) {
        throw error;
      }
      return local;
    }
  };

  const handleWrite = async (
    config: InternalAxiosRequestConfig
  ): Promise<AxiosResponse> => {
    if (backendUnreachable) {
      requestProbe?.();
      throw new AxiosError(WRITE_REFUSED_OFFLINE, AxiosError.ERR_NETWORK, config);
    }
    try {
      return await send(config);
    } catch (error) {
      // Pages show a failed request's own message when the server sent none.
      if (axios.isAxiosError(error) && isBackendUnreachable(error)) {
        error.message = WRITE_UNANSWERED;
      }
      throw error;
    }
  };

  return async config =>
    (config.method ?? 'get').toLowerCase() === 'get'
      ? handleRead(config)
      : handleWrite(config);
};
