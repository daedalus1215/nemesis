import React, { useState } from "react";
import { AppShell } from "../../components/AppShell/AppShell";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { MoneyDialPad } from "../MoneyPage/components/MoneyDialPad";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import api from "../../api/axios.interceptor";
import styles from "./CreateRecurringInvoicePage.module.css";

const INTERVAL_OPTIONS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
] as const;

const DAY_OF_WEEK_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
] as const;

const getDisplayAmount = (amount: string) => {
  if (!amount || amount === ".") return "$0.00";
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
};

const formatScheduleLabel = (intervalType: string, intervalCount: string): string => {
  const count = parseInt(intervalCount) || 1;
  const unit = count === 1 ? intervalType : `${intervalType}s`;
  return count === 1 ? `Every ${unit}` : `Every ${count} ${unit}`;
};

export const CreateRecurringInvoicePage: React.FC = () => {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users, loading: usersLoading, error: usersError } = useFetchUsers();

  const [formData, setFormData] = useState({
    debtorUserId: "",
    intervalType: "month",
    intervalCount: "1",
    dayOfWeek: "",
    dayOfMonth: "",
    hour: "9",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!formData.debtorUserId) return "Please select a recipient";
    if (!amount || parseFloat(amount) <= 0) return "Please enter a valid amount";
    if (!formData.intervalType) return "Please select an interval";
    const count = parseInt(formData.intervalCount);
    if (!count || count < 1) return "Interval count must be at least 1";
    const hour = parseInt(formData.hour);
    if (isNaN(hour) || hour < 0 || hour > 23) return "Hour must be between 0 and 23";
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

      const payload: Record<string, unknown> = {
        debtorUserId: parseInt(formData.debtorUserId),
        amount: parseFloat(amount),
        intervalType: formData.intervalType,
        intervalCount: parseInt(formData.intervalCount),
        hour: parseInt(formData.hour),
        description: formData.description.trim() || undefined,
      };

      if (formData.intervalType === "week" && formData.dayOfWeek) {
        payload.dayOfWeek = parseInt(formData.dayOfWeek);
      }
      if (
        (formData.intervalType === "month" || formData.intervalType === "year") &&
        formData.dayOfMonth
      ) {
        payload.dayOfMonth = parseInt(formData.dayOfMonth);
      }

      const response = await api.post("/recurring-invoices", payload);

      if (response.data.success) {
        setSuccess(
          `Recurring invoice created! ID: ${response.data.recurringInvoiceId}. Next run: ${new Date(response.data.nextRun).toLocaleDateString()}`
        );
        setAmount("");
        setFormData({
          debtorUserId: "",
          intervalType: "month",
          intervalCount: "1",
          dayOfWeek: "",
          dayOfMonth: "",
          hour: "9",
          description: "",
        });
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
          (err as Error).message ||
          "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (usersLoading)
    return (
      <AppShell selected="Invoices" title="New Recurring Invoice">
        <div className={styles.loading}>Loading...</div>
      </AppShell>
    );
  if (usersError)
    return (
      <AppShell selected="Invoices" title="New Recurring Invoice">
        <ErrorMessage message={`Error loading users: ${usersError}`} />
      </AppShell>
    );

  const showDayOfWeek = formData.intervalType === "week";
  const showDayOfMonth =
    formData.intervalType === "month" || formData.intervalType === "year";
  const isFormValid =
    formData.debtorUserId && amount && parseFloat(amount) > 0 && formData.intervalType;

  return (
    <AppShell selected="Invoices" title="New Recurring Invoice">
      <div className={styles.centerContent}>
        <div className={styles.formHeader}>
          <button
            className={styles.backButton}
            onClick={() => navigate("/recurring-invoices")}
          >
            ← Back
          </button>
          <p className={styles.subtitle}>Set up automated invoice scheduling</p>
        </div>

        <div className={styles.formCard}>
          {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.amountDisplay}>{getDisplayAmount(amount)}</div>

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
                    .filter((u) => u.id !== user.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="intervalType" className={styles.label}>
                    Frequency <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="intervalType"
                    name="intervalType"
                    value={formData.intervalType}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    {INTERVAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="intervalCount" className={styles.label}>
                    Every N
                  </label>
                  <input
                    type="number"
                    id="intervalCount"
                    name="intervalCount"
                    value={formData.intervalCount}
                    onChange={handleInputChange}
                    className={styles.input}
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              {showDayOfWeek && (
                <div className={styles.formGroup}>
                  <label htmlFor="dayOfWeek" className={styles.label}>
                    Day of Week
                  </label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Any day</option>
                    {DAY_OF_WEEK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showDayOfMonth && (
                <div className={styles.formGroup}>
                  <label htmlFor="dayOfMonth" className={styles.label}>
                    Day of Month
                  </label>
                  <input
                    type="number"
                    id="dayOfMonth"
                    name="dayOfMonth"
                    value={formData.dayOfMonth}
                    onChange={handleInputChange}
                    className={styles.input}
                    min="0"
                    max="31"
                    placeholder="1-31 (0 = last day)"
                  />
                  <p className={styles.helperText}>0 = last day of month</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="hour" className={styles.label}>
                  Run at Hour (UTC)
                </label>
                <input
                  type="number"
                  id="hour"
                  name="hour"
                  value={formData.hour}
                  onChange={handleInputChange}
                  className={styles.input}
                  min="0"
                  max="23"
                />
                <p className={styles.helperText}>0-23, UTC time</p>
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
                  placeholder="e.g., Monthly rent payment..."
                  maxLength={200}
                />
                <p className={styles.helperText}>Maximum 200 characters</p>
              </div>

              {isFormValid && (
                <div className={styles.summary}>
                  <div className={styles.summaryTitle}>Schedule Summary</div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Bill To:</span>
                    <span className={styles.summaryValue}>
                      {users.find((u) => u.id.toString() === formData.debtorUserId)
                        ?.username || "Unknown"}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Amount:</span>
                    <span className={styles.summaryValue}>
                      {getDisplayAmount(amount)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Schedule:</span>
                    <span className={styles.summaryValue}>
                      {formatScheduleLabel(formData.intervalType, formData.intervalCount)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Run at:</span>
                    <span className={styles.summaryValue}>
                      {formData.hour}:00 UTC
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={styles.submitButton}
                >
                  {loading ? "Creating..." : "Create Schedule"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/recurring-invoices")}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>
      </div>
    </AppShell>
  );
};
