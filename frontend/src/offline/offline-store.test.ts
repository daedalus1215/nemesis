import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOfflineStore } from './offline-store';

let dbCounter = 0;
const freshStore = () => createOfflineStore(`offline-store-${++dbCounter}`);

afterEach(() => {
  vi.useRealTimers();
});

describe('createOfflineStore', () => {
  it('stores responses by URI, as received', async () => {
    const store = freshStore();
    await store.putResponse('https://nemesis.test/api/accounts', '{"a":1}');

    expect(await store.getJson('https://nemesis.test/api/accounts')).toEqual({
      a: 1,
    });
    expect(await store.getResponse('https://nemesis.test/api/other')).toBe(
      undefined
    );
    expect(await store.countResponses()).toBe(1);
  });

  it('drops only what nothing has refreshed since a time', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const store = freshStore();
    vi.setSystemTime(1_000);
    await store.putResponse('old', '{}');
    await store.putResponse('refreshed', '{}');
    vi.setSystemTime(5_000);
    await store.putResponse('refreshed', '{}');

    await store.deleteResponsesStoredBefore(2_000);

    expect(await store.getResponse('old')).toBe(undefined);
    expect(await store.getResponse('refreshed')).toBeDefined();
  });

  it('clears responses and meta together', async () => {
    const store = freshStore();
    await store.putResponse('uri', '{}');
    await store.setMeta('owner', '7');

    await store.clear();

    expect(await store.countResponses()).toBe(0);
    expect(await store.getMeta('owner')).toBe(undefined);
  });
});
