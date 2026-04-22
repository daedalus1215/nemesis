import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import { useAuth } from "../../auth/useAuth";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import { useFetchInvoiceById } from "./useFetchInvoiceById";
import api from "../../api/axios.interceptor";
import { CANCEL_INVOICE_URL } from "../../api/urls";
import styles from "./InvoiceDetailPage.module.css";

export const InvoiceDetailPage: React.FC = () => {
  const { invoiceId: id } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const invoiceId = parseInt(id || "0");
  
  const { invoice, loading: invoiceLoading, error: invoiceError, refetch: refetchInvoice } = useFetchInvoiceById(invoiceId);
  const { users } = useFetchUsers();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  if (!invoiceId) {
    return <ErrorMessage message="Invalid invoice ID" />;
  }

  if (invoiceLoading) {
    return <div className={styles.loading}>Loading invoice details...</div>;
  }

  if (invoiceError) {
    return <ErrorMessage message={`Error loading invoice: ${invoiceError}`} />;
  }

  if (!invoice) {
    return <ErrorMessage message="Invoice not found" />;
  }

  const isDebtor = invoice.debtorUserId === user.id;
  const isIssuer = invoice.issuerUserId === user.id;
  const canPay = isDebtor && invoice.status !== "paid" && invoice.balanceDue > 0;
  const canCancel = isIssuer && invoice.status !== "cancelled" && invoice.status !== "paid";

  const getUserName = (userId: number): string => {
    const foundUser = users.find((u) => u.id === userId);
    return foundUser ? foundUser.username : `User ${userId}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "draft":
        return styles.statusDraft;
      case "sent":
        return styles.statusSent;
      case "paid":
        return styles.statusPaid;
      case "overdue":
        return styles.statusOverdue;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  const handleBack = () => {
    navigate("/invoices");
  };

  const handlePayInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.post(`/invoices/${invoiceId}/pay`, {
        amount: invoice.balanceDue,
      });

      if (response.data.success) {
        setSuccess(`Invoice paid successfully! Transaction ID: ${response.data.transactionId || 'N/A'}`);
        // Refetch invoice to get updated status
        await refetchInvoice();
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'An error occurred while paying invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.post(CANCEL_INVOICE_URL(invoiceId));

      if (response.data.success) {
        setSuccess('Invoice cancelled successfully!');
        // Refetch invoice to get updated status
        await refetchInvoice();
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'An error occurred while cancelling invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
          <div className={styles.pageTitle}>
          <div className={styles.titleText}>Invoice #{invoice.id}</div>
          <div className={styles.subtitle}>
            {isIssuer ? "You issued this invoice" : "You owe this invoice"}
          </div>
        </div>
          <SignOutButton />
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

            <div className={styles.invoiceHeader}>
              <div className={styles.amountDisplay}>
                {formatCurrency(invoice.balanceDue)}
              </div>
              <div className={styles.statusBadge}>
                <span
                  className={`${styles.status} ${getStatusColor(invoice.status)}`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>

            <div className={styles.invoiceDetails}>
              <div className={styles.invoiceDetail}>
                <span className={styles.detailLabel}>Total Amount:</span>
                <span className={styles.detailValue}>
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div className={styles.invoiceDetail}>
                <span className={styles.detailLabel}>Balance Due:</span>
                <span className={`${styles.detailValue} ${styles.balanceDue}`}>
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
              <div className={styles.invoiceDetail}>
                <span className={styles.detailLabel}>
                  {isIssuer ? "Debtor:" : "Issuer:"}
                </span>
                <span className={styles.detailValue}>
                  {isIssuer
                    ? getUserName(invoice.debtorUserId)
                    : getUserName(invoice.issuerUserId)}
                </span>
              </div>
              <div className={styles.invoiceDetail}>
                      <span className={styles.detailLabel}>Description:</span>
                      <span className={styles.detailValue}>
                        {invoice.description}
                      </span>
                    </div>
              <div className={styles.invoiceDetail}>
                <span className={styles.detailLabel}>Issue Date:</span>
                <span className={styles.detailValue}>
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <div className={styles.invoiceDetail}>
                <span className={styles.detailLabel}>Due Date:</span>
                <span className={styles.detailValue}>
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
            </div>

            {canPay && (
              <div className={styles.paymentSection}>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentInfoRow}>
                    <span className={styles.paymentInfoLabel}>Payment Amount:</span>
                    <span className={styles.paymentInfoValue}>
                      {formatCurrency(invoice.balanceDue)}
                    </span>
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <span className={styles.paymentInfoLabel}>To:</span>
                    <span className={styles.paymentInfoValue}>
                      {getUserName(invoice.issuerUserId)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayInvoice}
                  disabled={loading}
                  className={styles.payButton}
                >
                  {loading ? 'Processing...' : `Pay ${formatCurrency(invoice.balanceDue)}`}
                </button>
              </div>
            )}

            {!canPay && (
              <div className={styles.cannotPayMessage}>
                {invoice.status === "paid"
                  ? "This invoice has already been paid."
                  : !isDebtor
                  ? "Only the debtor can pay this invoice."
                  : "This invoice cannot be paid."}
              </div>
            )}

            {canCancel && (
              <div className={styles.cancelSection}>
                <button
                  onClick={handleCancelInvoice}
                  disabled={loading}
                  className={styles.cancelButton}
                >
                  {loading ? 'Processing...' : 'Cancel Invoice'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation selected="Invoices" />
    </div>
  );
};

