import 'fake-indexeddb/auto';
import {
  AxiosError,
  AxiosHeaders,
  CanceledError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { describe, expect, it, vi } from 'vitest';
import {
  createOfflineAdapter,
  OFFLINE_RESPONSE_HEADER,
  WRITE_REFUSED_OFFLINE,
  WRITE_UNANSWERED,
  type OfflineAdapterDeps,
} from './offline-adapter';
import { createOfflineStore } from './offline-store';

let dbCounter = 0;
const freshStore = () => createOfflineStore(`offline-adapter-${++dbCounter}`);

const BASE = 'https://nemesis.test';

const makeConfig = (
  url: string,
  method = 'get',
  extra: Partial<InternalAxiosRequestConfig> = {}
): InternalAxiosRequestConfig => ({
  url,
  method,
  headers: new AxiosHeaders(),
  ...extra,
});

const ok = (
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200
): AxiosResponse => ({
  data,
  status,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config,
});

const networkError = (config: InternalAxiosRequestConfig) =>
  new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);

// Defaults to the JSON body the backend sends with its errors.
const httpError = (
  config: InternalAxiosRequestConfig,
  status: number,
  body = JSON.stringify({ statusCode: status, message: 'Error' }),
  headers: Record<string, string> = {}
) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    undefined,
    { ...ok(config, body, status), headers: new AxiosHeaders(headers) }
  );

const setup = (deps: Partial<OfflineAdapterDeps> = {}) => {
  const send = vi.fn();
  const store = freshStore();
  const adapter = createOfflineAdapter({
    send,
    store,
    getUri: config => `${BASE}${config.url}`,
    ...deps,
  });
  return { send, store, adapter };
};

/** Makes the adapter see the backend as unreachable. */
const goOffline = async (
  { send, adapter }: ReturnType<typeof setup>,
  url = '/api/accounts'
) => {
  const config = makeConfig(url);
  send.mockRejectedValueOnce(networkError(config));
  await adapter(config).catch(() => undefined);
};

describe('createOfflineAdapter reads', () => {
  it('serves the last successful GET response when the backend is unreachable', async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts/detail/5');
    send.mockResolvedValueOnce(ok(config, '{"id":5,"name":"Fresh"}'));
    await adapter(config);

    send.mockRejectedValueOnce(networkError(config));
    const offline = await adapter(config);

    expect(offline.data).toBe('{"id":5,"name":"Fresh"}');
    expect(offline.status).toBe(200);
    expect((offline.headers as AxiosHeaders).get(OFFLINE_RESPONSE_HEADER)).toBe(
      '1'
    );
  });

  it('keys responses by full URI, including query params', async () => {
    const { send, adapter } = setup();
    const pending = makeConfig('/api/invoices?statuses=overdue,sent');
    const paid = makeConfig('/api/invoices?statuses=paid');
    send.mockResolvedValueOnce(ok(pending, '{"invoices":[]}'));
    await adapter(pending);

    send.mockRejectedValueOnce(networkError(paid));
    await expect(adapter(paid)).rejects.toThrow('Network Error');
  });

  it('rethrows when unreachable and nothing is stored', async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts/detail/9');
    send.mockRejectedValueOnce(networkError(config));

    await expect(adapter(config)).rejects.toThrow('Network Error');
  });

  it('treats Cloudflare origin errors as unreachable', async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts');
    send.mockResolvedValueOnce(ok(config, '"cached"'));
    await adapter(config);

    send.mockRejectedValueOnce(httpError(config, 522));
    expect((await adapter(config)).data).toBe('"cached"');
  });

  it("treats the proxy's plain-text 404 as unreachable", async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts');
    send.mockResolvedValueOnce(ok(config, '"cached"'));
    await adapter(config);

    send.mockRejectedValueOnce(httpError(config, 404, '404 page not found\n'));
    expect((await adapter(config)).data).toBe('"cached"');
  });

  it('rides out Cloudflare Access turning the device away', async () => {
    const onAccessDeniedChange = vi.fn();
    const { send, adapter } = setup({ onAccessDeniedChange });
    const config = makeConfig('/api/accounts');
    send.mockResolvedValueOnce(ok(config, '"cached"'));
    await adapter(config);

    send.mockRejectedValueOnce(
      httpError(config, 401, '', {
        'www-authenticate': 'Cloudflare-Access resource_metadata="x"',
      })
    );
    expect((await adapter(config)).data).toBe('"cached"');
    expect(onAccessDeniedChange.mock.calls).toEqual([[false], [true]]);
  });

  it('passes through errors the backend itself answered with, an expired session included', async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts');
    send.mockResolvedValueOnce(ok(config, '"cached"'));
    await adapter(config);

    send.mockRejectedValueOnce(httpError(config, 404));
    await expect(adapter(config)).rejects.toMatchObject({
      response: { status: 404 },
    });
    send.mockRejectedValueOnce(httpError(config, 401));
    await expect(adapter(config)).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("doesn't store what isn't JSON, like a captive portal's page", async () => {
    const { send, store, adapter } = setup();
    const config = makeConfig('/api/accounts');
    send.mockResolvedValueOnce(ok(config, '<html>Sign in to Wi-Fi</html>'));
    await adapter(config);
    send.mockResolvedValueOnce(ok(config, new Blob(['binary'])));
    await adapter(config);

    expect(await store.getResponse(`${BASE}/api/accounts`)).toBe(undefined);
  });

  it('surfaces failures for background fetches that ask to', async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts');
    send.mockResolvedValueOnce(ok(config, '"cached"'));
    await adapter(config);

    send.mockRejectedValueOnce(networkError(config));
    await expect(
      adapter({ ...config, noOfflineFallback: true })
    ).rejects.toThrow('Network Error');
  });

  it('gives reads a default timeout, but not writes', async () => {
    const { send, adapter } = setup({ readTimeoutMs: 15_000 });
    send.mockImplementation(async config => ok(config, '{}'));

    await adapter(makeConfig('/api/accounts', 'get', { timeout: 0 }));
    await adapter(makeConfig('/api/accounts', 'get', { timeout: 3_000 }));
    await adapter(makeConfig('/api/accounts/transfer', 'post', { timeout: 0 }));

    expect(send.mock.calls.map(([config]) => config.timeout)).toEqual([
      15_000, 3_000, 0,
    ]);
  });
});

describe('createOfflineAdapter details from stored lists', () => {
  const invoice = (id: number, status: string) => ({
    id,
    issuerUserId: 1,
    debtorUserId: 2,
    total: 10,
    balanceDue: 10,
    status,
  });

  it("answers an invoice that was never opened from the stored list", async () => {
    const { send, store, adapter } = setup();
    await store.putResponse(
      `${BASE}/api/invoices`,
      JSON.stringify({ invoices: [invoice(4, 'sent'), invoice(7, 'paid')] })
    );
    const config = makeConfig('/api/invoices/detail/7');
    send.mockRejectedValueOnce(networkError(config));

    expect(JSON.parse((await adapter(config)).data)).toEqual({
      invoice: invoice(7, 'paid'),
      success: true,
    });
  });

  it("answers a recurring invoice from the stored list", async () => {
    const { send, store, adapter } = setup();
    await store.putResponse(
      `${BASE}/api/recurring-invoices`,
      JSON.stringify({ recurringInvoices: [{ id: 3, status: 'ACTIVE' }] })
    );
    const config = makeConfig('/api/recurring-invoices/3');
    send.mockRejectedValueOnce(networkError(config));

    expect(JSON.parse((await adapter(config)).data)).toEqual({
      recurringInvoice: { id: 3, status: 'ACTIVE' },
      success: true,
    });
  });

  it('prefers whichever was stored last: the detail or the list', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      const { send, store, adapter } = setup();
      const detailUri = `${BASE}/api/invoices/detail/7`;
      vi.setSystemTime(1_000);
      await store.putResponse(
        detailUri,
        JSON.stringify({ invoice: invoice(7, 'sent'), success: true })
      );
      vi.setSystemTime(2_000);
      await store.putResponse(
        `${BASE}/api/invoices`,
        JSON.stringify({ invoices: [invoice(7, 'paid')] })
      );
      const config = makeConfig('/api/invoices/detail/7');
      send.mockRejectedValue(networkError(config));

      expect(JSON.parse((await adapter(config)).data).invoice.status).toBe(
        'paid'
      );

      vi.setSystemTime(3_000);
      await store.putResponse(
        detailUri,
        JSON.stringify({ invoice: invoice(7, 'cancelled'), success: true })
      );
      expect(JSON.parse((await adapter(config)).data).invoice.status).toBe(
        'cancelled'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("rethrows for an invoice the stored list doesn't have", async () => {
    const { send, store, adapter } = setup();
    await store.putResponse(
      `${BASE}/api/invoices`,
      JSON.stringify({ invoices: [invoice(4, 'sent')] })
    );
    const config = makeConfig('/api/invoices/detail/7');
    send.mockRejectedValueOnce(networkError(config));

    await expect(adapter(config)).rejects.toThrow('Network Error');
  });
});

describe('createOfflineAdapter writes', () => {
  it('sends them, and stores nothing', async () => {
    const { send, store, adapter } = setup();
    const config = makeConfig('/api/accounts/transfer', 'post');
    send.mockResolvedValueOnce(ok(config, '{"success":true}'));

    expect((await adapter(config)).data).toBe('{"success":true}');
    expect(send).toHaveBeenCalledWith(config);
    expect(await store.countResponses()).toBe(0);
  });

  it("says one that got no answer may have gone through", async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/invoices/4/pay', 'post');
    send.mockRejectedValueOnce(networkError(config));

    await expect(adapter(config)).rejects.toThrow(WRITE_UNANSWERED);
  });

  it("leaves the backend's own errors as they are", async () => {
    const { send, adapter } = setup();
    const config = makeConfig('/api/accounts/transfer', 'post');
    send.mockRejectedValueOnce(httpError(config, 400));

    await expect(adapter(config)).rejects.toMatchObject({
      message: 'Request failed with status code 400',
      response: { status: 400 },
    });
  });

  it("refuses them without sending while the backend seems unreachable, and asks for a check", async () => {
    const requestProbe = vi.fn();
    const context = setup({ requestProbe });
    await goOffline(context);
    context.send.mockClear();

    await expect(
      context.adapter(makeConfig('/api/accounts/transfer', 'post'))
    ).rejects.toThrow(WRITE_REFUSED_OFFLINE);
    expect(context.send).not.toHaveBeenCalled();
    expect(requestProbe).toHaveBeenCalledTimes(1);
  });

  it('sends them again once a request gets through', async () => {
    const context = setup();
    await goOffline(context);
    const read = makeConfig('/api/accounts');
    context.send.mockResolvedValueOnce(ok(read, '{}'));
    await context.adapter({ ...read, noOfflineFallback: true });

    const write = makeConfig('/api/accounts/transfer', 'post');
    context.send.mockResolvedValueOnce(ok(write, '{}'));
    await expect(context.adapter(write)).resolves.toMatchObject({ status: 200 });
  });
});

describe('createOfflineAdapter reachability', () => {
  it('reports whether requests reached the backend, ignoring cancellations', async () => {
    const onReachabilityChange = vi.fn();
    const { send, adapter } = setup({ onReachabilityChange });
    const config = makeConfig('/api/accounts/detail/5');

    send.mockRejectedValueOnce(networkError(config));
    await adapter(config).catch(() => undefined);
    send.mockRejectedValueOnce(httpError(config, 404));
    await adapter(config).catch(() => undefined);
    send.mockRejectedValueOnce(new CanceledError(undefined, undefined, config));
    await adapter(config).catch(() => undefined);
    send.mockResolvedValueOnce(ok(config, '{}'));
    await adapter(config);

    expect(onReachabilityChange.mock.calls).toEqual([[false], [true], [true]]);
  });

  it('answers reads locally once the backend is unreachable, still sending one at a time', async () => {
    const context = setup();
    const { send, store, adapter } = context;
    await store.putResponse(`${BASE}/api/accounts/detail/1`, '{"id":1}');
    await store.putResponse(`${BASE}/api/accounts/detail/2`, '{"id":2}');
    await goOffline(context, '/api/accounts/detail/1');

    // From here on requests hang, like connecting with no network at all.
    send.mockClear();
    send.mockImplementation(() => new Promise(() => {}));
    const second = await adapter(makeConfig('/api/accounts/detail/2'));
    await adapter(makeConfig('/api/accounts/detail/1'));

    expect(second.data).toBe('{"id":2}');
    // The first local answer sent a probe; the second didn't add another.
    expect(send).toHaveBeenCalledTimes(1);
  });
});
