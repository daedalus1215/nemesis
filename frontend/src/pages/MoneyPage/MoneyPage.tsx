import React, { useState } from "react";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { MoneyDialPad } from "./components/MoneyDialPad";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import api from "../../api/axios.interceptor";
import styles from "./MoneyPage.module.css";
import { UserDropdown } from "../../forms/fields/UserDropdown/UserDropdown";

const getDisplayAmount = (amount: string) => {
  if (!amount || amount === ".") return "$0.00";
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const MoneyPage: React.FC = () => {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users, loading: usersLoading, error: usersError } = useFetchUsers();
  
  const [formData, setFormData] = useState({
    toUserId: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return null;
  }

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

  const validateForm = (): string | null => {
    if (!formData.toUserId) {
      return 'Please select a recipient';
    }
    if (!amount || parseFloat(amount) <= 0) {
      return 'Please enter a valid amount';
    }
    return null;
  };

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

      const response = await api.post('/accounts/transfer', {
        toUserId: parseInt(formData.toUserId),
        amount: parseFloat(amount),
        description: formData.note.trim() || undefined,
      });

      if (response.data.success) {
        setSuccess(`Payment sent successfully! Transaction ID: ${response.data.transactionId || 'N/A'}`);
        // Reset form
        setAmount("");
        setFormData({
          toUserId: '',
          note: '',
        });
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'An error occurred while sending payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (usersLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (usersError) {
    return <ErrorMessage message={`Error loading users: ${usersError}`} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            ← Back
          </button>
          <div className={styles.pageTitle}>
          <div className={styles.titleText}>Money</div>
          <div className={styles.subtitle}>
            Send and request money
          </div>
        </div>
          <SignOutButton />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.centerContent}>
          <div className={styles.moneyCard}>
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

            <div className={styles.amountDisplay}>
              {getDisplayAmount(amount)}
            </div>

            <MoneyDialPad amount={amount} setAmount={setAmount} />

            <form onSubmit={handleSubmit} className={styles.form}>
              <UserDropdown formData={formData} handleInputChange={handleInputChange} users={users} user={user} />

              <div className={styles.formGroup}>
                <label htmlFor="note" className={styles.label}>
                  Note (Optional)
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Add a note for this payment..."
                  maxLength={200}
                />
                <p className={styles.helperText}>
                  Maximum 200 characters
                </p>
              </div>

              {formData.toUserId && amount && parseFloat(amount) > 0 && (
                <div className={styles.transferSummary}>
                  <div className={styles.summaryTitle}>Payment Summary</div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>To:</span>
                    <span className={styles.summaryValue}>
                      {users.find(u => u.id.toString() === formData.toUserId)?.username || 'Unknown'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Amount:</span>
                    <span className={styles.summaryValue}>{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading || !amount || amount === "0" || amount === "." || !formData.toUserId}
                  className={styles.submitButton}
                >
                  {loading ? 'Processing...' : 'Send Payment'}
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

      <BottomNavigation selected="Send" />
    </div>
  );
};

export default MoneyPage;
