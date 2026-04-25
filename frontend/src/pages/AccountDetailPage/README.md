# AccountDetailPage

A detailed view page for individual accounts that displays account information, balance, and transaction history.

## Features

- **Account Information**: Shows account name, type, default status, and creation date
- **Real-time Balance**: Displays current account balance with automatic updates
- **Transaction History**: Lists all transactions for the account with pagination
- **Action Buttons**: Send Money, Transfer Funds, and Set as Default (if not already default)
- **Navigation**: Back button to return to AccountsPage

## Routing

The page is accessible at `/accounts/detail/:id` where `:id` is the account ID.

## Hooks Used

### Shared Hooks (hoisted to `/src/hooks/`)
- `useAccountDetail` - Fetches account information
- `useAccountBalance` - Fetches and caches account balance with auto-refresh

### Page-specific Hooks
- `useAccountTransactions` - Fetches transaction history with pagination

## Data Flow

1. **Account Details**: Fetched via `/accounts/:id` endpoint
2. **Balance**: Fetched via `/accounts/:id/balance` endpoint with 2-minute auto-refresh
3. **Transactions**: Fetched via `/accounts/:id/transactions` endpoint with pagination

## Transaction Display

Transactions are automatically categorized as:
- **INCOMING** (↗️): Money received into the account
- **OUTGOING** (↘️): Money sent from the account

Each transaction shows:
- Amount with color coding (green for incoming, red for outgoing)
- Description
- Category
- Date
- Status

## Styling

- Uses CSS modules for scoped styling
- Responsive design with mobile-first approach
- Gradient background header with glassmorphism effects
- Card-based layout for transactions
- Hover effects and smooth transitions

## Integration

- **AccountsPage**: Account cards are now clickable and navigate to this detail page
- **BottomNavigation**: Maintains "Accounts" as selected tab
- **Error Handling**: Graceful error states for failed API calls
- **Loading States**: Skeleton loading for better UX

## Future Enhancements

- Pagination controls for transactions
- Transaction filtering by date/amount/category
- Export transaction history
- Account settings/editing
- Transaction search functionality
