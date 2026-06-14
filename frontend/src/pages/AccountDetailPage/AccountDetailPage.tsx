import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccountDetail } from "../../hooks/useAccountDetail";
import { useAccountBalance } from "../../hooks/useAccountBalance";
import { AppShell } from "../../components/AppShell/AppShell";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import api from "../../api/axios.interceptor";
import styles from "./AccountDetailPage.module.css";
import { TransactionHistorySection } from "./TransactionHistorySection/TransactionHistorySection";

export const AccountDetailPage: React.FC = () => {
  const { accountId: id } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const accountId = parseInt(id || "0");

  const {
    account,
    loading: accountLoading,
    error: accountError,
    refetch: refetchAccount,
  } = useAccountDetail(accountId);
  
  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useAccountBalance(accountId);

  if (!accountId) {
    return <ErrorMessage message="Invalid account ID" />;
  }

  const handleBack = () => {
    navigate("/accounts");
  };

  const handleSetDefault = async () => {
    try {
      await api.put(`/accounts/${accountId}/default`);
      await refetchAccount();
    } catch (err) {
      console.error("Failed to set default account:", err);
    }
  };

  const handleSendMoney = () => {
    navigate("/money");
  };

  const handleTransferFunds = () => {
    navigate("/accounts/transfer");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (accountLoading) {
    return (
      <AppShell selected="Accounts" title="Account">
        <div className={styles.loading}>Loading account details...</div>
      </AppShell>
    );
  }

  if (accountError) {
    return (
      <AppShell selected="Accounts" title="Account">
        <ErrorMessage message={`Error loading account: ${accountError}`} />
      </AppShell>
    );
  }

  if (!account) {
    return (
      <AppShell selected="Accounts" title="Account">
        <ErrorMessage message="Account not found" />
      </AppShell>
    );
  }

  return (
    <AppShell selected="Accounts" title="Account">
      <button className={styles.backLink} onClick={handleBack}>
        ← Back to accounts
      </button>

      <section className={styles.summaryCard}>
        <div className={styles.summaryTop}>
          <div>
            <div className={styles.accountName}>{account.name}</div>
            <div className={styles.accountType}>{account.accountType}</div>
          </div>
          {account.isDefault && (
            <span className={styles.defaultBadge}>Default</span>
          )}
        </div>
        <div className={styles.balanceAmount}>
          {balanceLoading
            ? "Loading..."
            : balanceError
              ? "Error"
              : formatCurrency(balance || 0)}
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={handleSendMoney}>
            Send Money
          </button>
          <button className={styles.actionButton} onClick={handleTransferFunds}>
            Transfer Funds
          </button>
          {!account.isDefault && (
            <button className={styles.actionButton} onClick={handleSetDefault}>
              Set as Default
            </button>
          )}
        </div>
      </section>

      <div className={styles.content}>
        <TransactionHistorySection key={account.id} account={account} />
      </div>
    </AppShell>
  );
};
