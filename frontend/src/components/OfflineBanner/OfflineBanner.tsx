import React from "react";
import { CloudOff } from "@mui/icons-material";
import { useSyncStatus } from "../../offline/sync-status";
import { describeRefreshedAt } from "../../offline/refreshed-at";
import { openConnectionSettings } from "../../tauri/connection-settings";
import styles from "./OfflineBanner.module.css";

/**
 * Says the screens are showing data stored on this device, in the desktop
 * and Android apps, while Nemesis can't be reached or Cloudflare Access
 * turns the device away (see src/offline). Never shows on the web, where
 * the offline layer isn't installed and the status stays reachable.
 */
export const OfflineBanner: React.FC = () => {
  const { reachable, accessDenied, refreshedAt } = useSyncStatus();
  if (reachable && !accessDenied) return null;

  const saved =
    refreshedAt === undefined
      ? "Showing what was last loaded on this device."
      : `Showing data saved on this device, last refreshed ${describeRefreshedAt(refreshedAt)}.`;

  return (
    <div className={styles.banner} role="status">
      <CloudOff fontSize="small" className={styles.icon} />
      <div className={styles.body}>
        <p className={styles.text}>
          <strong>
            {accessDenied
              ? "Cloudflare Access turned this device away."
              : "Can't reach Nemesis."}
          </strong>{" "}
          {saved} Changes need a connection.
        </p>
        {accessDenied && (
          <button
            type="button"
            className={styles.action}
            onClick={() => openConnectionSettings("access-denied")}
          >
            Connection settings
          </button>
        )}
      </div>
    </div>
  );
};
