import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { useUserProfile } from "./useUserProfile";
import { useFetchAccounts } from "./useFetchAccounts";
import { useAccountBalance } from "./useAccountBalance";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { useNavigate } from "react-router-dom";
import styles from "./AccountTransferPage.module.css";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import api from "../../api/axios.interceptor";

export const AccountTransferPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userDetails, loading: profileLoading, error: profileError } = useUserProfile();
  const { accounts, loading: accountsLoading, error: accountsError } = useFetchAccounts();
  const { getAccountBalance } = useAccountBalance();

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
  });
  const [accountBalances, setAccountBalances] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  // Load account balances when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0) {
      const loadBalances = async () => {
        const balances: { [key: number]: number } = {};
        for (const account of accounts) {
          try {
            balances[account.id] = await getAccountBalance(account.id);
          } catch (err) {
            console.error(`Failed to load balance for account ${account.id}:`, err);
            balances[account.id] = 0;
          }
        }
        setAccountBalances(balances);
      };
      loadBalances();
    }
  }, [accounts, getAccountBalance]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id.toString() === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const validateForm = (): string | null => {
    if (!formData.fromAccountId) {
      return 'Please select a source account';
    }
    if (!formData.toAccountId) {
      return 'Please select a destination account';
    }
    if (formData.fromAccountId === formData.toAccountId) {
      return 'Source and destination accounts must be different';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return 'Please enter a valid amount';
    }

    const fromAccountBalance = accountBalances[parseInt(formData.fromAccountId)] || 0;
    const transferAmount = parseFloat(formData.amount);

    if (transferAmount > fromAccountBalance) {
      return `Insufficient funds. Available balance: ${formatCurrency(fromAccountBalance)}`;
    }

    return null;
  };

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.post('/accounts/transfer-internal', {
        fromAccountId: parseInt(formData.fromAccountId),
        toAccountId: parseInt(formData.toAccountId),
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || undefined,
      });

      if (response.data.success) {
        setSuccess(`Transfer completed successfully! Transaction ID: ${response.data.transactionId}`);
        // Reset form
        setFormData({
          fromAccountId: '',
          toAccountId: '',
          amount: '',
          description: '',
        });
        // Refresh account balances
        if (accounts.length > 0) {
          const balances: { [key: number]: number } = {};
          for (const account of accounts) {
            try {
              balances[account.id] = await getAccountBalance(account.id);
            } catch (err) {
              console.error(`Failed to reload balance for account ${account.id}:`, err);
            }
          }
          setAccountBalances(balances);
        }
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'An error occurred during transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  if (profileLoading || accountsLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (profileError) {
    return <ErrorMessage message={`Error loading profile: ${profileError}`} />;
  }

  if (accountsError) {
    return <ErrorMessage message={`Error loading accounts: ${accountsError}`} />;
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={() => navigate("/accounts")}>
            ← Back
          </button>
          <div className={styles.pageTitle}>
          <div className={styles.titleText}>Internal Transfer</div>
          <div className={styles.subtitle}>
            Transfer funds between accounts
          </div>
        </div>
          <SignOutButton />
        </div>
      </div>


      <div className={styles.content}>
        <div className={styles.centerContent}>
          <div className={styles.transferCard}>
            {success && (
              <div className={styles.successMessage}>
                {success}
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="fromAccountId" className={styles.label}>
                  From Account <span className={styles.required}>*</span>
                </label>
                <select
                  id="fromAccountId"
                  name="fromAccountId"
                  value={formData.fromAccountId}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select source account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.accountType})
                      {accountBalances[account.id] !== undefined &&
                        ` - ${formatCurrency(accountBalances[account.id])}`
                      }
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="toAccountId" className={styles.label}>
                  To Account <span className={styles.required}>*</span>
                </label>
                <select
                  id="toAccountId"
                  name="toAccountId"
                  value={formData.toAccountId}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select destination account</option>
                  {accounts
                    .filter(account => account.id.toString() !== formData.fromAccountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.accountType})
                        {accountBalances[account.id] !== undefined &&
                          ` - ${formatCurrency(accountBalances[account.id])}`
                        }
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="amount" className={styles.label}>
                  Amount <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
                {formData.fromAccountId && accountBalances[parseInt(formData.fromAccountId)] !== undefined && (
                  <p className={styles.helperText}>
                    Available balance: {formatCurrency(accountBalances[parseInt(formData.fromAccountId)])}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Enter a description for this transfer..."
                  maxLength={200}
                />
                <p className={styles.helperText}>
                  Maximum 200 characters
                </p>
              </div>

              {formData.fromAccountId && formData.toAccountId && formData.amount && (
                <div className={styles.transferSummary}>
                  <div className={styles.summaryTitle}>Transfer Summary</div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>From:</span>
                    <span className={styles.summaryValue}>{getAccountName(formData.fromAccountId)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>To:</span>
                    <span className={styles.summaryValue}>{getAccountName(formData.toAccountId)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Amount:</span>
                    <span className={styles.summaryValue}>{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                  </div>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? 'Processing...' : 'Transfer Funds'}
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
        </div>
      </div>

      <BottomNavigation selected="Transfer" />
    </div>
  );
};
