import React from "react";
import { AppShell } from "../../components/AppShell/AppShell";
import { ChangeUsernameForm } from "./components/ChangeUsernameForm/ChangeUsernameForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm/ChangePasswordForm";
import { ThemeSettings } from "./components/ThemeSettings/ThemeSettings";
import styles from "./SettingsPage.module.css";

/**
 * Account settings: change username, change password, and the light/dark/
 * auto theme choice. Reachable from the sidebar (desktop) and the top-bar
 * avatar (all viewports).
 */
export const SettingsPage: React.FC = () => {
  return (
    <AppShell selected={null} title="Account Settings">
      <div className={styles.settingsContent}>
        <ChangeUsernameForm />
        <ChangePasswordForm />
        <ThemeSettings />
      </div>
    </AppShell>
  );
};
