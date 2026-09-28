import React, { useState } from "react";
import { useUpdateUsername } from "../../hooks/useUpdateUsername";
import styles from "../../SettingsPage.module.css";

/**
 * Change-username card. Requires the current password; on success the user
 * is signed out and sent to the login page (the JWT holds the old name).
 */
export const ChangeUsernameForm: React.FC = () => {
  const { updateUsername, isUpdating, error } = useUpdateUsername();
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmed = newUsername.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setValidationError("Username must be between 3 and 20 characters");
      return;
    }
    if (!currentPassword) {
      setValidationError("Current password is required");
      return;
    }

    try {
      await updateUsername(trimmed, currentPassword);
      // Success: the hook has logged out and navigated to /login.
    } catch {
      // The API error is surfaced via the hook's `error`.
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Change Username</h2>
      <p className={styles.cardSubtitle}>
        Your current password is required. After the change you will be
        signed out and asked to sign in with the new name.
      </p>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="newUsername" className={styles.label}>
            New Username <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className={styles.input}
            placeholder="3–20 characters"
            autoComplete="username"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="usernameCurrentPassword" className={styles.label}>
            Current Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="usernameCurrentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.input}
            autoComplete="current-password"
          />
        </div>
        {validationError && (
          <div className={styles.errorMessage}>{validationError}</div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isUpdating}
        >
          {isUpdating ? "Saving…" : "Update Username"}
        </button>
      </form>
    </section>
  );
};
