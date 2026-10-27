import React from "react";
import styles from "../../SettingsPage.module.css";
import { isTauri } from "../../../../tauri/api-config";
import { openConnectionSettings } from "../../../../tauri/connection-settings";

/**
 * Connection card, in the desktop and Android apps only: they ask for the
 * server address and Cloudflare Access token on first launch, and this
 * changes them. The web app is served by Nemesis itself.
 */
export const ConnectionSettings: React.FC = () => {
  if (!isTauri()) return null;

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Connection</h2>
      <p className={styles.cardSubtitle}>
        The server this app talks to, and the Cloudflare Access token it
        uses to get through. Stored on this device only.
      </p>
      <button
        type="button"
        className={styles.submitButton}
        onClick={() => openConnectionSettings()}
      >
        Connection settings
      </button>
    </section>
  );
};
