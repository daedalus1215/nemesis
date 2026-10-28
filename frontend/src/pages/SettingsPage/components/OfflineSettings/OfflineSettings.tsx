import React, { useState } from "react";
import styles from "../../SettingsPage.module.css";
import { isTauri } from "../../../../tauri/api-config";
import { refreshOfflineData } from "../../../../offline/offline-data";
import type { PrefetchOutcome } from "../../../../offline/prefetch";
import { describeRefreshedAt } from "../../../../offline/refreshed-at";
import { useSyncStatus } from "../../../../offline/sync-status";

/** What a refresh came to, for the message under the button. */
const OUTCOMES: Record<PrefetchOutcome, { ok: boolean; message: string }> = {
  complete: { ok: true, message: "Everything on this device is up to date." },
  unreachable: { ok: false, message: "Couldn't reach Nemesis. It refreshes on its own once it can." },
  throttled: { ok: false, message: "Nemesis is busy. Try again in a few minutes." },
  unauthorized: { ok: false, message: "Your session has ended. Sign in again to refresh." },
  "access-denied": {
    ok: false,
    message: "Cloudflare Access turned this device away. Check the connection settings.",
  },
  failed: { ok: false, message: "Something went wrong. Try again later." },
};

/**
 * Offline card, in the desktop and Android apps only: they keep a copy of
 * what the screens show for when Nemesis can't be reached (src/offline).
 * Says when it was last refreshed, and refreshes it on request.
 */
export const OfflineSettings: React.FC = () => {
  const { refreshedAt } = useSyncStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isTauri()) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    setResult(null);
    try {
      const outcome = await refreshOfflineData();
      setResult(
        outcome === undefined
          ? { ok: true, message: "A refresh is already running." }
          : OUTCOMES[outcome]
      );
    } catch (err) {
      console.error("Offline refresh failed:", err);
      setResult(OUTCOMES.failed);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Offline</h2>
      <p className={styles.cardSubtitle}>
        This device keeps a copy of your accounts, balances and invoices, so
        you can look at them without a connection. Sending money and changing
        invoices always need one. Signing out deletes the copy.
      </p>
      <div className={styles.form}>
        <p className={styles.helperText}>
          {refreshedAt === undefined
            ? "Not refreshed yet."
            : `Last refreshed ${describeRefreshedAt(refreshedAt)}.`}
        </p>
        {result && (
          <div className={result.ok ? styles.successMessage : styles.errorMessage}>
            {result.message}
          </div>
        )}
        <button
          type="button"
          className={styles.submitButton}
          disabled={refreshing}
          onClick={() => void handleRefresh()}
        >
          {refreshing ? "Refreshing…" : "Refresh now"}
        </button>
      </div>
    </section>
  );
};
