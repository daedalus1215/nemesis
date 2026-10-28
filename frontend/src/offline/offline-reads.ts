import type { OfflineStore } from './offline-store';

export type OfflineReadContext = {
  store: OfflineStore;
  /** Full URI for an API path, matching how GET responses are keyed. */
  uri: (path: string) => string;
};

/** An answer made up from a stored response, and when that was stored. */
export type DerivedResponse = { body: unknown; storedAt: number };

/**
 * A detail endpoint whose entity is also in a list endpoint's answer, mapped
 * the same way by the backend's responders. Offline, the stored list (the
 * prefetch keeps the unfiltered one) answers for any of its entities, opened
 * before or not.
 */
type DetailFromList = {
  /** Path below the base URL; the first group is the entity's id. */
  pattern: RegExp;
  list: string;
  listKey: string;
  itemKey: string;
};

const DETAILS_FROM_LISTS: DetailFromList[] = [
  {
    // FetchInvoiceByIdResponder and FetchInvoicesResponder.
    pattern: /^\/api\/invoices\/detail\/(\d+)$/,
    list: '/api/invoices',
    listKey: 'invoices',
    itemKey: 'invoice',
  },
  {
    // GetRecurringInvoiceResponder and ListRecurringInvoicesResponder.
    pattern: /^\/api\/recurring-invoices\/(\d+)$/,
    list: '/api/recurring-invoices',
    listKey: 'recurringInvoices',
    itemKey: 'recurringInvoice',
  },
];

/**
 * Answers a GET from other stored responses that cover it, for when its own
 * stored copy is missing or older. Undefined when nothing stored covers it.
 */
export const deriveOfflineResponse = async (
  path: string,
  { store, uri }: OfflineReadContext
): Promise<DerivedResponse | undefined> => {
  for (const route of DETAILS_FROM_LISTS) {
    const match = route.pattern.exec(path);
    if (!match) continue;
    const id = Number(match[1]);
    const stored = await store.getResponse(uri(route.list));
    if (!stored) return undefined;
    let items: unknown;
    try {
      items = (JSON.parse(stored.data) as Record<string, unknown>)?.[
        route.listKey
      ];
    } catch {
      return undefined;
    }
    const item = Array.isArray(items)
      ? items.find(
          candidate =>
            (candidate as { id?: unknown } | null)?.id === id
        )
      : undefined;
    return item === undefined
      ? undefined
      : {
          body: { [route.itemKey]: item, success: true },
          storedAt: stored.storedAt,
        };
  }
  return undefined;
};
