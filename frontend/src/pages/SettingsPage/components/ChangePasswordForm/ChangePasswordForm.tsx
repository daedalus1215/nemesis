import React, { useState } from "react";
import { useUpdatePassword } from "../../hooks/useUpdatePassword";
import styles from "../../SettingsPage.module.css";

// Mirrors the backend IsPasswordStrongValidator.
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

/**
 * Change-password card. The existing session is kept after a successful
 * change (the password is not part of the JWT).
 */
export const ChangePasswordForm: React.FC = () => {
  const { updatePassword, isUpdating, error } = useUpdatePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccess(null);

    if (!currentPassword) {
      setValidationError("Current password is required");
      return;
    }
    if (!PASSWORD_PATTERN.test(newPassword)) {
      setValidationError(
        "New password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("New password and confirmation do not match");
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword, confirmPassword);
      setSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // The API error is surfaced via the hook's `error`.
    }
  };

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Change Password</h2>
      <p className={styles.cardSubtitle}>
        Enter your current password and choose a new one. Your session stays
        active after the change.
      </p>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.label}>
            Current Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.input}
            autoComplete="current-password"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            New Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            autoComplete="new-password"
          />
          <p className={styles.helperText}>
            At least 8 characters, with an uppercase letter, a lowercase
            letter, a number, and a special character
          </p>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm New Password <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            autoComplete="new-password"
          />
        </div>
        {success && <div className={styles.successMessage}>{success}</div>}
        {validationError && (
          <div className={styles.errorMessage}>{validationError}</div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isUpdating}
        >
          {isUpdating ? "Saving…" : "Update Password"}
        </button>
      </form>
    </section>
  );
};
