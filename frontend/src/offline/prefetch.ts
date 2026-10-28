import type { AxiosInstance } from 'axios';
import {
  isAccessDenied,
  isBackendUnavailable,
  isBackendUnreachable,
  isRateLimited,
} from './offline-errors';
import {
  INVOICE_STATUS_FILTERS,
  invoiceFilterQuery,
  invoiceListParams,
  statusesKey,
} from '../pages/InvoiceListPage/invoice-filters';
import {
  RECURRING_INVOICE_STATUS_FILTERS,
  recurringInvoiceListParams,
} from '../pages/RecurringInvoiceListPage/recurring-invoice-filters';
import {
  ACCOUNT_PAYMENTS_PAGE_SIZE,
  accountPaymentsParams,
} from '../pages/AccountDetailPage/useAccountTransactions';

/**
 * - `unreachable`: the server went away mid-run.
 * - `throttled`: something rate-limited a request.
 * - `unauthorized`: the login token was turned away, or the user signed out.
 * - `access-denied`: Cloudflare Access rejected the connection settings.
 * - `failed`: the server returned some other error.
 */
export type PrefetchOutcome =
  | 'complete'
  | 'unreachable'
  | 'throttled'
  | 'unauthorized'
  | 'access-denied'
  | 'failed';

export type PrefetchDeps = {
  /** Instance with the offline adapter installed, which stores responses. */
  api: AxiosInstance;
  /** Checked before each request: false stops the run (signed out). */
  canContinue?: () => boolean;
  /** Gap between requests. */
  spacingMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

type Request = { url: string; params?: Record<string, unknown> };

/** The user signed out mid-run: their session's requests stop. */
class SignedOut extends Error {}

// No rate limit on the backend, so the gap only keeps the run from
// competing with the screen the user is on.
const DEFAULT_SPACING_MS = 500;

// A request can stall on a dead connection with nothing to time it out. Give
// up on it so the run ends as unreachable and is retried, instead of every
// later run waiting behind it.
const REQUEST_TIMEOUT_MS = 30_000;

const defaultSleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/** What the home, accounts and invoice screens ask for besides accounts. */
const ACCOUNT_REQUESTS: Request[] = [
  { url: '/users/profile' },
  // Names for the invoice lists.
  { url: '/users' },
  { url: '/accounts/balance' },
];

/** An account's detail page: the account, its balance, its latest payments. */
const accountRequests = (accountId: number): Request[] => [
  { url: `/accounts/detail/${accountId}` },
  { url: `/accounts/${accountId}/balance` },
  {
    url: `/accounts/${accountId}/payments`,
    params: accountPaymentsParams(ACCOUNT_PAYMENTS_PAGE_SIZE, 0),
  },
];

/**
 * Every filter of both invoice lists, as the lists request them. The
 * unfiltered ones also answer for any invoice's detail (offline-reads.ts).
 */
const listRequests = (): Request[] => [
  ...INVOICE_STATUS_FILTERS.map(filter => {
    const { statuses, direction } = invoiceFilterQuery(filter);
    return {
      url: '/invoices',
      params: invoiceListParams(statusesKey(statuses), direction),
    };
  }),
  ...RECURRING_INVOICE_STATUS_FILTERS.map(filter => ({
    url: '/recurring-invoices',
    params: recurringInvoiceListParams(filter === 'all' ? undefined : filter),
  })),
];

/** Fatal to the run: no point asking for the rest. */
const isFatal = (error: unknown) =>
  isBackendUnavailable(error) ||
  isAccessDenied(error) ||
  (error as { response?: { status?: number } })?.response?.status === 401;

/**
 * Fetches what the app's screens show, so the offline adapter stores it as a
 * side effect of fetching it: the profile, users, balances, every account
 * with its detail, balance and first page of payments, and every filter of
 * the invoice and recurring invoice lists.
 *
 * Requests go one at a time, spaced out, and the run stops at the first sign
 * of trouble rather than pushing on. One endpoint answering with an error of
 * its own doesn't stop the rest.
 */
export const prefetchNemesis = async ({
  api,
  canContinue = () => true,
  spacingMs = DEFAULT_SPACING_MS,
  sleep = defaultSleep,
}: PrefetchDeps): Promise<PrefetchOutcome> => {
  let isFirstRequest = true;
  const get = async <T>({ url, params }: Request) => {
    if (!isFirstRequest) await sleep(spacingMs);
    isFirstRequest = false;
    if (!canContinue()) throw new SignedOut();
    // Surface failures rather than being handed a stored copy, so the run
    // can tell an outage or throttling from a real answer.
    const response = await api.get<T>(url, {
      params,
      noOfflineFallback: true,
      timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
  };
  const tryGet = async (request: Request) => {
    try {
      await get(request);
    } catch (error) {
      if (error instanceof SignedOut || isFatal(error)) throw error;
      console.warn(`Prefetching ${request.url} failed:`, error);
    }
  };

  try {
    const { accounts } = await get<{ accounts?: { id: number }[] }>({
      url: '/accounts',
    });
    for (const request of ACCOUNT_REQUESTS) {
      await tryGet(request);
    }
    for (const { id } of accounts ?? []) {
      for (const request of accountRequests(id)) {
        await tryGet(request);
      }
    }
    for (const request of listRequests()) {
      await tryGet(request);
    }
  } catch (error) {
    if (error instanceof SignedOut) return 'unauthorized';
    if (isRateLimited(error)) return 'throttled';
    if (isBackendUnreachable(error)) return 'unreachable';
    if (isAccessDenied(error)) return 'access-denied';
    if ((error as { response?: { status?: number } })?.response?.status === 401) {
      return 'unauthorized';
    }
    console.warn('Offline prefetch failed:', error);
    return 'failed';
  }
  return 'complete';
};
