import React, { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { useUserProfile } from "./useUserProfile";
import { AppShell } from "../../components/AppShell/AppShell";
import { useNavigate } from "react-router-dom";
import styles from "./CreateAccountPage.module.css";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import api from "../../api/axios.interceptor";

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Asset Account' },
  { value: 'LIABILITY', label: 'Liability Account' },
  { value: 'EQUITY', label: 'Equity Account' },
  { value: 'REVENUE', label: 'Revenue Account' },
  { value: 'EXPENSE', label: 'Expense Account' },
];

export const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userDetails, loading: profileLoading, error: profileError } = useUserProfile();
  
  const [formData, setFormData] = useState({
    name: '',
    accountType: 'ASSET',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/accounts', {
        name: formData.name.trim(),
        accountType: formData.accountType,
      });

      // Success - redirect back to accounts page
      navigate('/accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  if (profileLoading) {
    return <div className={styles.fullPageLoading}>Loading user details...</div>;
  }

  if (profileError) {
    return <ErrorMessage message={`Error loading profile: ${profileError}`} />;
  }

  if (!userDetails) {
    return null;
  }

  return (
    <AppShell selected="Accounts" title="New Account">
      <button className={styles.backLink} onClick={handleCancel}>
        ← Back to accounts
      </button>

      <div className={styles.formContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Account Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter account name"
              maxLength={50}
              required
            />
            <p className={styles.helperText}>Maximum 50 characters</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="accountType" className={styles.label}>
              Account Type
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              className={styles.select}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};
