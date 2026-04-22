import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchInvoices } from "./useFetchInvoices";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import { useAuth } from "../../auth/useAuth";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import styles from "./InvoiceListPage.module.css";

type InvoiceStatusFilter = "pending" | "all" | "draft" | "sent" | "paid" | "overdue" | "cancelled";

export const InvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useFetchUsers();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("pending");

  const statuses =
    statusFilter === "all"
      ? undefined
      : statusFilter === "sent"
      ? ["sent", "overdue"]
      : statusFilter === "pending"
      ? ["sent", "overdue"]
      : [statusFilter];

  const { invoices, loading, error } = useFetchInvoices(statuses);

  const handleBack = () => {
    navigate("/");
  };

  const handleSendInvoice = () => {
    navigate("/invoices/send");
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

  const getUserName = (userId: number): string => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username : `User ${userId}`;
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

  const getRoleBadge = (invoice: {
    issuerUserId: number;
    debtorUserId: number;
  }) => {
    if (!user) return null;
    const isIssuer = invoice.issuerUserId === user?.id;
    return (
      <span className={isIssuer ? styles.badgeIssuer : styles.badgeDebtor}>
        {isIssuer ? "Issued" : "Owed"}
      </span>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
          <div className={styles.pageTitle}>
          <div className={styles.titleText}>Invoices</div>
          <div className={styles.subtitle}>Manage your invoices</div>
        </div>
          <SignOutButton />
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={handleSendInvoice}>
            + Send Invoice
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterSection}>
          <div className={styles.filterButtons}>
            {(["pending", "all", "draft", "sent", "paid", "overdue", "cancelled"] as InvoiceStatusFilter[]).map(
              (filter) => (
                <button
                  key={filter}
                  className={`${styles.filterButton} ${
                    statusFilter === filter ? styles.filterButtonActive : ""
                  }`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter === "pending" ? "Pending" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        <div className={styles.invoicesSection}>
          {loading ? (
            <div className={styles.loading}>Loading invoices...</div>
          ) : error ? (
            <ErrorMessage message={`Error loading invoices: ${error}`} />
          ) : invoices && invoices.length > 0 ? (
            <div className={styles.invoicesList}>
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className={styles.invoiceCard}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.invoiceHeader}>
                    <div className={styles.invoiceId}>Invoice #{invoice.id}</div>
                    {getRoleBadge(invoice)}
                  </div>

                  <div className={styles.invoiceDetails}>
                    <div className={styles.invoiceDetail}>
                      <span className={styles.detailLabel}>Amount:</span>
                      <span className={`${styles.detailValue} ${styles.amount}`}>
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                    <div className={styles.invoiceDetail}>
                      <span className={styles.detailLabel}>Balance Due:</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(invoice.balanceDue)}
                      </span>
                    </div>
                    <div className={styles.invoiceDetail}>
                      <span className={styles.detailLabel}>Description:</span>
                      <span className={styles.detailValue}>
                        {invoice.description}
                      </span>
                    </div>
                    <div className={styles.invoiceDetail}>
                      <span className={styles.detailLabel}>Status:</span>
                      <span
                        className={`${styles.detailValue} ${styles.status} ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className={styles.invoiceDetail}>
                      <span className={styles.detailLabel}>
                        {invoice.issuerUserId === user?.id
                          ? "Debtor:"
                          : "Issuer:"}
                      </span>
                      <span className={styles.detailValue}>
                        {invoice.issuerUserId === user?.id
                          ? getUserName(invoice.debtorUserId)
                          : getUserName(invoice.issuerUserId)}
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
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noInvoices}>
              <div className={styles.noInvoicesTitle}>No invoices found</div>
              <div className={styles.noInvoicesMessage}>
                {statusFilter === "all"
                  ? "You don't have any invoices yet. Send your first invoice to get started."
                  : `You don't have any ${statusFilter} invoices.`}
              </div>
              {statusFilter !== "all" && (
                <button
                  className={styles.clearFilterButton}
                  onClick={() => setStatusFilter("all")}
                >
                  Show All Invoices
                </button>
              )}
              {statusFilter === "all" && (
                <button
                  className={styles.sendInvoiceButton}
                  onClick={handleSendInvoice}
                >
                  Send Your First Invoice
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation selected="Invoices" />
    </div>
  );
};

