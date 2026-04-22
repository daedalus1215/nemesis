export type TransferBetweenExternalAccountsResponseDto = {
  transactionId: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  success: boolean;
};
