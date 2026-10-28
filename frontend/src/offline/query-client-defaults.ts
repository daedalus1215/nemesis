import type { DefaultOptions } from '@tanstack/react-query';

/**
 * React Query's default networkMode ('online') holds queries back whenever
 * the webview reports no network. In the Tauri app the offline adapter
 * answers those requests from stored responses, so they must still run: a
 * held query leaves screens on their loading placeholders. Mutations run
 * too, and are refused by the adapter with a message saying why.
 */
export const offlineQueryDefaults: DefaultOptions = {
  queries: { networkMode: 'always' },
  mutations: { networkMode: 'always' },
};
