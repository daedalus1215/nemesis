import React, { useEffect, useRef, useCallback } from "react";
import styles from "./TransactionHistorySection.module.css";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { useAccountTransactions } from "../useAccountTransactions";
import { AccountDetail } from "../../../hooks/useAccountDetail";

type TransactionHistorySectionProps = {
  account: AccountDetail;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
};

export const TransactionHistorySection: React.FC<
  TransactionHistorySectionProps
> = ({ account, scrollContainerRef: externalScrollRef }) => {
  const transactionsListRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAccountTransactions(account.id, 20);

  const loadMore = useCallback(() => {
    if (isLoadingMoreRef.current || !hasNextPage || transactionsLoading || isFetchingNextPage) {
      return;
    }
    
    isLoadingMoreRef.current = true;
    fetchNextPage();
  }, [hasNextPage, transactionsLoading, isFetchingNextPage, fetchNextPage]);

  // Reset loading ref when fetch completes
  useEffect(() => {
    if (!isFetchingNextPage) {
      isLoadingMoreRef.current = false;
    }
  }, [isFetchingNextPage]);

  // Scroll detection for infinite scroll
  useEffect(() => {
    const getScrollContainer = (): HTMLElement | null => {
      if (externalScrollRef?.current) {
        return externalScrollRef.current;
      }
      
      const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
        if (!element) return null;
        
        const style = window.getComputedStyle(element);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll' || 
            style.overflow === 'auto' || style.overflow === 'scroll') {
          return element;
        }
        
        return findScrollableParent(element.parentElement);
      };

      return findScrollableParent(transactionsListRef.current?.parentElement || null);
    };

    let scrollContainer: HTMLElement | null = null;
    let cleanup: (() => void) | null = null;

    const setupScrollListener = (container: HTMLElement) => {
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const threshold = 300;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            
            if (distanceFromBottom < threshold && hasNextPage && !isLoadingMoreRef.current && !transactionsLoading && !isFetchingNextPage) {
              loadMore();
            }
            
            ticking = false;
          });
          ticking = true;
        }
      };

      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    };

    scrollContainer = getScrollContainer();
    
    if (scrollContainer) {
      cleanup = setupScrollListener(scrollContainer);
    } else {
      const timeoutId = setTimeout(() => {
        const retryContainer = getScrollContainer();
        if (retryContainer) {
          cleanup = setupScrollListener(retryContainer);
        }
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        if (cleanup) cleanup();
      };
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [externalScrollRef, hasNextPage, transactionsLoading, isFetchingNextPage, loadMore]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (transactionsLoading && transactions.length === 0) {
    return <div className={styles.loading}>Loading transactions...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTransactionTypeIcon = (type: "INCOMING" | "OUTGOING") => {
    return type === "INCOMING" ? "↗️" : "↘️";
  };

  const getTransactionTypeClass = (type: "INCOMING" | "OUTGOING") => {
    return type === "INCOMING" ? styles.incoming : styles.outgoing;
  };

  return (
    <div className={styles.transactionsSection}>
      {transactionsError ? (
        <ErrorMessage
          message={`Error loading transactions: ${transactionsError}`}
        />
      ) : transactions && transactions.length > 0 ? (
        <div className={styles.transactionsList} ref={transactionsListRef}>
          {transactions.map((transaction) => (
            <div key={transaction.id} className={styles.transactionItem}>
              <div className={styles.transactionHeader}>
                <span className={styles.transactionType}>
                  {getTransactionTypeIcon(transaction.type)}
                </span>
                <span
                  className={`${styles.transactionAmount
                    } ${getTransactionTypeClass(transaction.type)}`}
                >
                  {transaction.type === "INCOMING" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>

              <div className={styles.transactionDetails}>
                <div className={styles.transactionDescription}>
                  {transaction.description || "Transfer"}
                </div>
                <div className={styles.transactionMeta}>
                  <span className={styles.transactionCategory}>
                    {transaction.category}
                  </span>
                  <span className={styles.transactionDate}>
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>
                <div className={styles.transactionStatus}>
                  Status: {transaction.status}
                </div>
              </div>
            </div>
          ))}
          {isFetchingNextPage && (
            <div className={styles.loadingMore}>
              Loading more transactions...
            </div>
          )}
          {!hasNextPage && transactions.length > 0 && (
            <div className={styles.noMoreTransactions}>
              No more transactions to load
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noTransactions}>
          <div className={styles.noTransactionsTitle}>No transactions yet</div>
          <div className={styles.noTransactionsMessage}>
            This account doesn't have any transactions yet. Start by sending
            money or transferring funds.
          </div>
        </div>
      )}
    </div>
  );
};
