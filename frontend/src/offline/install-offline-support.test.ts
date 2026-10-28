import 'fake-indexeddb/auto';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WRITE_REFUSED_OFFLINE } from './offline-adapter';
import {
  claimOfflineData,
  clearOfflineData,
  refreshOfflineData,
} from './offline-data';
import { createOfflineStore } from './offline-store';
import { installOfflineSupport } from './install-offline-support';
import { getSyncStatus } from './sync-status';

const BASE = 'https://nemesis.test';

let dbCounter = 0;
const freshStore = () => createOfflineStore(`install-offline-${++dbCounter}`);

/** A login token for user `sub`; only its payload is read. */
const tokenFor = (sub: string) =>
  `x.${btoa(JSON.stringify({ sub })).replace(/=+$/, '')}.x`;

const ok = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data: JSON.stringify(data),
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config,
});

const networkError = (config: InternalAxiosRequestConfig) =>
  new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);

const setup = (userId: string | null = '1') => {
  let token = userId === null ? null : tokenFor(userId);
  const store = freshStore();
  const send = vi.fn<AxiosAdapter>(async config => ok(config, { url: config.url }));
  const api = axios.create({ baseURL: BASE });
  const sync = installOfflineSupport(api, {
    store,
    send,
    schedule: false,
    token: () => token,
    prefetchSpacingMs: 0,
  });
  const signOut = () => {
    token = null;
    return clearOfflineData();
  };
  const signIn = async (id: string) => {
    await claimOfflineData(id);
    token = tokenFor(id);
  };
  return { api, store, send, sync, signIn, signOut };
};

afterEach(() => {
  vi.useRealTimers();
});

describe('installOfflineSupport', () => {
  it('shows what was last loaded once the server is gone', async () => {
    const { api, send } = setup();
    await api.get('/accounts');

    send.mockImplementation(async config => {
      throw networkError(config);
    });
    const offline = await api.get('/accounts');

    expect(offline.data).toEqual({ url: '/accounts' });
    expect(getSyncStatus().reachable).toBe(false);
  });

  it("keeps the same user's data at login, and deletes another's", async () => {
    const { api, store, signIn } = setup('1');
    await api.get('/accounts');

    await signIn('1');
    expect(await store.countResponses()).toBe(1);

    await signIn('2');
    expect(await store.countResponses()).toBe(0);
  });

  it("deletes everything at sign-out, answers already on their way included", async () => {
    const { api, store, send, signIn, signOut } = setup('1');
    let answer: (response: AxiosResponse) => void = () => {};
    send.mockImplementationOnce(
      config => new Promise(resolve => (answer = () => resolve(ok(config, {}))))
    );
    const late = api.get('/invoices');
    await vi.waitFor(() => expect(send).toHaveBeenCalled());

    await signOut();
    answer({} as AxiosResponse);
    await late;
    expect(await store.countResponses()).toBe(0);

    // Even the same user starts afresh.
    await store.putResponse(`${BASE}/stray`, '{}');
    await signIn('1');
    expect(await store.countResponses()).toBe(0);
  });

  it('refuses changes while the server is gone, and checks whether it is back', async () => {
    const { api, send } = setup();
    send.mockImplementationOnce(async config => {
      throw networkError(config);
    });
    await api.get('/accounts').catch(() => undefined);

    await expect(api.post('/accounts/transfer', {})).rejects.toThrow(
      WRITE_REFUSED_OFFLINE
    );
    await vi.waitFor(() =>
      expect(send).toHaveBeenLastCalledWith(
        expect.objectContaining({ url: '/healthz' })
      )
    );
    // The check got through, so the next change is sent.
    await expect(api.post('/accounts/transfer', {})).resolves.toMatchObject({
      status: 200,
    });
  });

  it('refreshes in the background once due, and records when', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(1_000_000);
    const { send, sync } = setup();

    await sync();
    expect(send).not.toHaveBeenCalled(); // the startup delay

    vi.setSystemTime(1_000_000 + 11_000);
    await sync();
    expect(send.mock.calls.map(([config]) => config.url)).toContain(
      '/recurring-invoices'
    );
    expect(getSyncStatus().refreshedAt).toBe(1_000_000 + 11_000);

    send.mockClear();
    await sync();
    expect(send).not.toHaveBeenCalled(); // not due again for 30 minutes
  });

  it('refreshes on request, but not when signed out', async () => {
    const { send, signOut } = setup();

    expect(await refreshOfflineData()).toBe('complete');
    expect(send).toHaveBeenCalled();

    await signOut();
    send.mockClear();
    expect(await refreshOfflineData()).toBe(undefined);
    expect(send).not.toHaveBeenCalled();
  });
});
