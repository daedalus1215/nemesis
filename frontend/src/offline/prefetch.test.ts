import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { prefetchNemesis } from './prefetch';

const BASE = 'https://nemesis.test';

const respond = (
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): AxiosResponse => ({
  data: JSON.stringify(data),
  status,
  statusText: '',
  headers: new AxiosHeaders(headers),
  config,
});

const failWith = (
  config: InternalAxiosRequestConfig,
  status: number,
  headers: Record<string, string> = {}
) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    undefined,
    respond(config, { statusCode: status }, status, headers)
  );

/**
 * An api whose server has accounts 1 and 2; `fail` can turn any request
 * (by path and query) into an error instead.
 */
const setup = (
  fail?: (uri: string, config: InternalAxiosRequestConfig) => Error | undefined
) => {
  const requested: string[] = [];
  const api = axios.create({ baseURL: BASE });
  api.defaults.adapter = async config => {
    const uri = api.getUri(config).slice(BASE.length);
    requested.push(uri);
    const error = fail?.(uri, config);
    if (error) throw error;
    return respond(
      config,
      uri === '/accounts' ? { accounts: [{ id: 1 }, { id: 2 }] } : {}
    );
  };
  const run = (deps: Partial<Parameters<typeof prefetchNemesis>[0]> = {}) =>
    prefetchNemesis({ api, sleep: async () => {}, ...deps });
  return { requested, run };
};

describe('prefetchNemesis', () => {
  it('asks for what each screen asks for, exactly as it asks', async () => {
    const { requested, run } = setup();

    expect(await run()).toBe('complete');
    expect(requested).toEqual([
      '/accounts',
      '/users/profile',
      '/users',
      '/accounts/balance',
      '/accounts/detail/1',
      '/accounts/1/balance',
      '/accounts/1/payments?limit=20&offset=0',
      '/accounts/detail/2',
      '/accounts/2/balance',
      '/accounts/2/payments?limit=20&offset=0',
      // The invoice list's filters, in button order.
      '/invoices?statuses=overdue,sent',
      '/invoices',
      '/invoices?statuses=draft',
      '/invoices?statuses=cancelled,overdue,paid,sent&direction=issued',
      '/invoices?statuses=cancelled,overdue,paid,sent&direction=received',
      '/invoices?statuses=paid',
      '/invoices?statuses=overdue',
      '/invoices?statuses=cancelled',
      '/recurring-invoices?status=ACTIVE',
      '/recurring-invoices',
      '/recurring-invoices?status=PAUSED',
      '/recurring-invoices?status=COMPLETED',
      '/recurring-invoices?status=CANCELLED',
    ]);
  });

  it("carries on past one endpoint's own error", async () => {
    const { requested, run } = setup((uri, config) =>
      uri === '/users' ? failWith(config, 404) : undefined
    );

    expect(await run()).toBe('complete');
    expect(requested).toContain('/recurring-invoices?status=CANCELLED');
  });

  it('stops as soon as the server is unreachable', async () => {
    const { requested, run } = setup((uri, config) =>
      uri === '/accounts/balance'
        ? new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
        : undefined
    );

    expect(await run()).toBe('unreachable');
    expect(requested[requested.length - 1]).toBe('/accounts/balance');
  });

  it.each([
    ['throttled', 429, {}],
    ['unauthorized', 401, {}],
    [
      'access-denied',
      401,
      { 'www-authenticate': 'Cloudflare-Access resource_metadata="x"' },
    ],
  ] as const)('reports %s and stops', async (outcome, status, headers) => {
    const { requested, run } = setup((uri, config) =>
      uri === '/users/profile' ? failWith(config, status, headers) : undefined
    );

    expect(await run()).toBe(outcome);
    expect(requested).toEqual(['/accounts', '/users/profile']);
  });

  it('stops when the user signs out mid-run', async () => {
    const { requested, run } = setup();
    const canContinue = vi.fn(() => requested.length < 3);

    expect(await run({ canContinue })).toBe('unauthorized');
    expect(requested).toHaveLength(3);
  });
});
