import React from "react";
import { useAuth } from "../../auth/useAuth";
import { useUserProfile } from "./useUserProfile";
import { useUserBalance } from "./useUserBalance";
import { useUserAccounts } from "./useUserAccounts";
import { BottomNavigation } from "../../components/BottomNavigation/BottomNavigation";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage";
import { SignOutButton } from "../../components/SignOutButton/SignOutButton";
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

  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : "U";
  };


  if (profileLoading) {
    return <div className={styles.loading}>Loading user details...</div>;
  }

  if (profileError) {
    return <ErrorMessage message={`Error loading profile: ${profileError}`} />;
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <div className={styles.userGreeting}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {getInitials(userDetails.username)}
            </div>
            <div className={styles.greeting}>
              Hello, {userDetails.username}
            </div>
          </div>
          <SignOutButton />
        </div>

        <div className={styles.balanceSection}>
          <div className={styles.balanceLabel}>Total Balance</div>
          <div className={styles.balanceAmount}>
            {balanceLoading ?
              "Loading..." :
              balanceError ?
                "Error" :
                formatCurrency(balance || 0)
            }
          </div>
          <div className={styles.lastUpdated}>
            Balance last updated at {formatTime()} ↻
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={handleTransferClick}>
            <TransferIcon />
            Transfer
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.accountsSection}>
          <h3 className={styles.sectionTitle}>My Accounts</h3>

          {accountsLoading ? (
            <div className={styles.accountsLoading}>Loading accounts...</div>
          ) : accountsError ? (
            <ErrorMessage message={`Error loading accounts: ${accountsError}`} />
          ) : accounts && accounts.length > 0 ? (
            <div className={styles.accountsList}>
              {accounts.map((account) => (
                <div key={account.id} className={styles.accountCard}>
                  <div className={styles.accountHeader}>
                    <span className={styles.accountName}>{account.name} - {formatCurrency(account.balance)}</span>
                    {account.isDefault && (
                      <span className={styles.defaultBadge}>Default</span>
                    )}
                  </div>
                  <div className={styles.accountDetails}>
                    <span className={styles.accountType}>{account.accountType}</span>
                    <span className={styles.accountDate}>
                      Created {new Date(account.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              <button
                className={styles.addAccountButton}
                onClick={() => navigate('/accounts')}
              >
                View All Accounts
              </button>
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
        </div>
      </div>

      <BottomNavigation selected="Home" />
    </div>
  );
};
