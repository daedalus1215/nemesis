import React from "react";
import { useAuth } from "../../auth/useAuth";
import { useUserProfile } from "./useUserProfile";
import { useUserBalance } from "./useUserBalance";
import { useUserAccounts } from "./useUserAccounts";
import { AppShell } from "../../components/AppShell/AppShell";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { TransferIcon } from "../../components/icons/TransferIcon";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userDetails, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useUserBalance();
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useUserAccounts();

  if (!user) {
    return null;
  }

  const handleTransferClick = () => {
    navigate("/money");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
    <AppShell selected="Home" title="Home">
      <section className={styles.balanceCard}>
        <div className={styles.balanceLabel}>Total Balance</div>
        <div className={styles.balanceAmount}>
          {balanceLoading
            ? "Loading..."
            : balanceError
              ? "Error"
              : formatCurrency(balance || 0)}
        </div>
        <div className={styles.lastUpdated}>
          Balance last updated at {formatTime()} ↻
        </div>
        <button className={styles.transferButton} onClick={handleTransferClick}>
          <TransferIcon />
          Transfer
        </button>
      </section>

      <section className={styles.accountsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>My Accounts</h2>
          {accounts && accounts.length > 0 && (
            <button className={styles.viewAllLink} onClick={() => navigate('/accounts')}>
              View all
            </button>
          )}
        </div>

        {accountsLoading ? (
          <div className={styles.accountsLoading}>Loading accounts...</div>
        ) : accountsError ? (
          <ErrorMessage message={`Error loading accounts: ${accountsError}`} />
        ) : accounts && accounts.length > 0 ? (
          <div className={styles.accountsGrid}>
            {accounts.map((account) => (
              <button
                key={account.id}
                className={styles.accountCard}
                onClick={() => navigate(`/accounts/detail/${account.id}`)}
              >
                <div className={styles.accountHeader}>
                  <span className={styles.accountName}>{account.name}</span>
                  {account.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>
                <div className={styles.accountBalance}>
                  {formatCurrency(account.balance)}
                </div>
                <div className={styles.accountDetails}>
                  <span className={styles.accountType}>{account.accountType}</span>
                  <span className={styles.accountDate}>
                    Created {new Date(account.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.noAccounts}>
            <p>No accounts found</p>
            <button
              className={styles.createAccountButton}
              onClick={() => navigate('/accounts/create')}
            >
              Create Your First Account
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
};
