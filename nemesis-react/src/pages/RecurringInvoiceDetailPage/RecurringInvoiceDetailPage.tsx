import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { useFetchRecurringInvoiceById } from "./useFetchRecurringInvoiceById";
import api from "../../api/axios.interceptor";
import {
  ACTIVATE_RECURRING_INVOICE_URL,
  PAUSE_RECURRING_INVOICE_URL,
  CANCEL_RECURRING_INVOICE_URL,
} from "../../api/urls";
import styles from "./RecurringInvoiceDetailPage.module.css";

const formatSchedule = (intervalType: string, intervalCount: number): string => {
  const unit = intervalCount === 1 ? intervalType : `${intervalType}s`;
  return intervalCount === 1 ? `Every ${unit}` : `Every ${intervalCount} ${unit}`;
};

export const RecurringInvoiceDetailPage: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = parseInt(idParam || "0");

  const {
    recurringInvoice: ri,
    loading: riLoading,
    error: riError,
    refetch,
  } = useFetchRecurringInvoiceById(id);
  const { users } = useFetchUsers();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!id) return <ErrorMessage message="Invalid recurring invoice ID" />;
  if (riLoading) return <div className={styles.loading}>Loading...</div>;
  if (riError) return <ErrorMessage message={`Error: ${riError}`} />;
  if (!ri) return <ErrorMessage message="Recurring invoice not found" />;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getUserName = (userId: number): string => {
    const found = users.find((u) => u.id === userId);
    return found ? found.username : `User ${userId}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ACTIVE": return styles.statusActive;
      case "PAUSED": return styles.statusPaused;
      case "COMPLETED": return styles.statusCompleted;
      case "CANCELLED": return styles.statusCancelled;
      default: return "";
    }
  };

  const canActivate = ri.status === "PAUSED";
  const canPause = ri.status === "ACTIVE";
  const canCancel = ri.status !== "CANCELLED";

  const handleAction = async (url: string, successMsg: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await api.post(url);
      if (response.data.success) {
        setSuccess(successMsg);
        await refetch();
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (err as Error).message ||
          "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={() => navigate("/recurring-invoices")}>
            ← Back
          </button>
          <div className={styles.pageTitle}>
            <div className={styles.titleText}>{ri.recurringInvoiceId}</div>
            <div className={styles.subtitle}>Recurring invoice details</div>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.centerContent}>
          <div className={styles.card}>
            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.cardHeader}>
              <div className={styles.amountDisplay}>{formatCurrency(ri.amount)}</div>
              <div className={styles.statusBadge}>
                <span className={`${styles.status} ${getStatusColor(ri.status)}`}>
                  {ri.status.charAt(0) + ri.status.slice(1).toLowerCase()}
                </span>
                <span className={styles.scheduleBadge}>
                  {formatSchedule(ri.intervalType, ri.intervalCount)}
                </span>
              </div>
            </div>

            {ri.lastError && (
              <div className={styles.errorBox}>
                <div className={styles.errorBoxLabel}>Last Error</div>
                <div className={styles.errorBoxValue}>{ri.lastError}</div>
              </div>
            )}

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Bill To:</span>
                <span className={styles.detailValue}>{getUserName(ri.debtorUserId)}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Issuer:</span>
                <span className={styles.detailValue}>{getUserName(ri.issuerUserId)}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Next Run:</span>
                <span className={styles.detailValue}>{formatDate(ri.nextRun)}</span>
              </div>
              {ri.lastRun && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Last Run:</span>
                  <span className={styles.detailValue}>{formatDate(ri.lastRun)}</span>
                </div>
              )}
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Run Hour:</span>
                <span className={styles.detailValue}>{ri.hour}:00 UTC</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Created:</span>
                <span className={styles.detailValue}>{formatDate(ri.createdAt)}</span>
              </div>
              {ri.description && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Description:</span>
                  <span className={styles.detailValue}>{ri.description}</span>
                </div>
              )}
            </div>

            <div className={styles.actionsSection}>
              {canActivate && (
                <button
                  onClick={() => handleAction(ACTIVATE_RECURRING_INVOICE_URL(ri.id), "Recurring invoice activated!")}
                  disabled={loading}
                  className={styles.activateButton}
                >
                  {loading ? "Processing..." : "Activate"}
                </button>
              )}

              {canPause && (
                <button
                  onClick={() => handleAction(PAUSE_RECURRING_INVOICE_URL(ri.id), "Recurring invoice paused.")}
                  disabled={loading}
                  className={styles.pauseButton}
                >
                  {loading ? "Processing..." : "Pause"}
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => handleAction(CANCEL_RECURRING_INVOICE_URL(ri.id), "Recurring invoice cancelled.")}
                  disabled={loading}
                  className={styles.cancelButton}
                >
                  {loading ? "Processing..." : "Cancel Schedule"}
                </button>
              )}
            </div>

            {ri.status === "CANCELLED" && (
              <div className={styles.infoMessage}>
                This recurring invoice has been cancelled and will no longer generate invoices.
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation selected="Invoices" />
    </div>
  );
};
