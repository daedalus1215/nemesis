import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchRecurringInvoices } from "./useFetchRecurringInvoices";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
import { useFetchUsers } from "../../hooks/useFetchUsers";
import styles from "./RecurringInvoiceListPage.module.css";

type StatusFilter = "all" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

const formatSchedule = (intervalType: string, intervalCount: number): string => {
  const unit = intervalCount === 1 ? intervalType : `${intervalType}s`;
  return intervalCount === 1 ? `Every ${unit}` : `Every ${intervalCount} ${unit}`;
};

export const RecurringInvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { users } = useFetchUsers();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");

  const filterValue = statusFilter === "all" ? undefined : statusFilter;
  const { recurringInvoices, loading, error } = useFetchRecurringInvoices(filterValue);

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
    const foundUser = users.find((u) => u.id === userId);
    return foundUser ? foundUser.username : `User ${userId}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ACTIVE":
        return styles.statusActive;
      case "PAUSED":
        return styles.statusPaused;
      case "COMPLETED":
        return styles.statusCompleted;
      case "CANCELLED":
        return styles.statusCancelled;
      default:
        return "";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={() => navigate("/invoices")}>
            ← Back
          </button>
          <div className={styles.pageTitle}>
            <div className={styles.titleText}>Recurring Invoices</div>
            <div className={styles.subtitle}>Manage scheduled invoices</div>
          </div>
          <SignOutButton />
        </div>
        <div className={styles.actionButtons}>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/recurring-invoices/create")}
          >
            + New Schedule
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filterSection}>
          <div className={styles.filterButtons}>
            {(["ACTIVE", "all", "PAUSED", "COMPLETED", "CANCELLED"] as StatusFilter[]).map(
              (filter) => (
                <button
                  key={filter}
                  className={`${styles.filterButton} ${
                    statusFilter === filter ? styles.filterButtonActive : ""
                  }`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter === "all" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              )
            )}
          </div>
        </div>

        <div className={styles.listSection}>
          {loading ? (
            <div className={styles.loading}>Loading recurring invoices...</div>
          ) : error ? (
            <ErrorMessage message={`Error loading recurring invoices: ${error}`} />
          ) : recurringInvoices && recurringInvoices.length > 0 ? (
            <div className={styles.list}>
              {recurringInvoices.map((ri) => (
                <div
                  key={ri.id}
                  className={styles.card}
                  onClick={() => navigate(`/recurring-invoices/${ri.id}`)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardId}>{ri.recurringInvoiceId}</div>
                    <span className={styles.scheduleBadge}>
                      {formatSchedule(ri.intervalType, ri.intervalCount)}
                    </span>
                  </div>

                  <div className={styles.cardDetails}>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Amount:</span>
                      <span className={`${styles.detailValue} ${styles.amount}`}>
                        {formatCurrency(ri.amount)}
                      </span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Bill To:</span>
                      <span className={styles.detailValue}>
                        {getUserName(ri.debtorUserId)}
                      </span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Status:</span>
                      <span
                        className={`${styles.detailValue} ${styles.status} ${getStatusColor(ri.status)}`}
                      >
                        {ri.status.charAt(0) + ri.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className={styles.cardDetail}>
                      <span className={styles.detailLabel}>Next Run:</span>
                      <span className={styles.detailValue}>
                        {formatDate(ri.nextRun)}
                      </span>
                    </div>
                    {ri.description && (
                      <div className={styles.cardDetail}>
                        <span className={styles.detailLabel}>Description:</span>
                        <span className={styles.detailValue}>{ri.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noItems}>
              <div className={styles.noItemsTitle}>No recurring invoices found</div>
              <div className={styles.noItemsMessage}>
                {statusFilter === "all"
                  ? "You haven't set up any recurring invoices yet."
                  : `No ${statusFilter.toLowerCase()} recurring invoices.`}
              </div>
              {statusFilter !== "all" ? (
                <button
                  className={styles.clearFilterButton}
                  onClick={() => setStatusFilter("all")}
                >
                  Show All
                </button>
              ) : (
                <button
                  className={styles.createButton}
                  onClick={() => navigate("/recurring-invoices/create")}
                >
                  Create Your First Schedule
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
