import React, { useState } from "react";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { MoneyDialPad } from "../MoneyPage/components/MoneyDialPad";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import api from "../../api/axios.interceptor";
import styles from "./SendInvoicePage.module.css";

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

export const SendInvoicePage: React.FC = () => {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users, loading: usersLoading, error: usersError } = useFetchUsers();
  
  const [formData, setFormData] = useState({
    debtorUserId: '',
    description: '',
    dueDate: '',
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
    if (!formData.debtorUserId) {
      return 'Please select a recipient';
    }
    if (!amount || parseFloat(amount) <= 0) {
      return 'Please enter a valid amount';
    }
    if (!formData.dueDate) {
      return 'Please select a due date';
    }
    
    // Parse the date string and normalize to local midnight for comparison
    // Split the date string and create a Date in local timezone
    const [year, month, day] = formData.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Allow today's date - reject only past dates
    if (dueDate < today) {
      return 'Due date must be today or in the future';
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

      const response = await api.post('/invoices', {
        debtorUserId: parseInt(formData.debtorUserId),
        amount: parseFloat(amount),
        description: formData.description.trim() || undefined,
        dueDate: formData.dueDate,
      });

      if (response.data.success) {
        setSuccess(`Invoice sent successfully! Invoice ID: ${response.data.invoiceId || 'N/A'}`);
        // Reset form
        setAmount("");
        setFormData({
          debtorUserId: '',
          description: '',
          dueDate: '',
        });
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'An error occurred while sending invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/accounts");
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

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
          <button className={styles.backButton} onClick={() => navigate("/accounts")}>
            ← Back
          </button>
          <SignOutButton />
        </div>

        <div className={styles.pageTitle}>
          <div className={styles.titleText}>Send Invoice</div>
          <div className={styles.subtitle}>
            Create and send an invoice
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.centerContent}>
          <div className={styles.invoiceCard}>
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
              <div className={styles.formGroup}>
                <label htmlFor="debtorUserId" className={styles.label}>
                  Bill To <span className={styles.required}>*</span>
                </label>
                <select
                  id="debtorUserId"
                  name="debtorUserId"
                  value={formData.debtorUserId}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select recipient</option>
                  {users
                    .filter(userOption => userOption.id !== user.id)
                    .map((userOption) => (
                      <option key={userOption.id} value={userOption.id}>
                        {userOption.username}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dueDate" className={styles.label}>
                  Due Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={styles.input}
                  min={today}
                  required
                />
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
                  placeholder="Add a description for this invoice..."
                  maxLength={200}
                />
                <p className={styles.helperText}>
                  Maximum 200 characters
                </p>
              </div>

              {formData.debtorUserId && amount && parseFloat(amount) > 0 && formData.dueDate && (
                <div className={styles.invoiceSummary}>
                  <div className={styles.summaryTitle}>Invoice Summary</div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Bill To:</span>
                    <span className={styles.summaryValue}>
                      {users.find(u => u.id.toString() === formData.debtorUserId)?.username || 'Unknown'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Amount:</span>
                    <span className={styles.summaryValue}>{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Due Date:</span>
                    <span className={styles.summaryValue}>
                      {new Date(formData.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading || !amount || amount === "0" || amount === "." || !formData.debtorUserId || !formData.dueDate}
                  className={styles.submitButton}
                >
                  {loading ? 'Sending...' : 'Send Invoice'}
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

      <BottomNavigation selected="Invoices" />
    </div>
  );
};