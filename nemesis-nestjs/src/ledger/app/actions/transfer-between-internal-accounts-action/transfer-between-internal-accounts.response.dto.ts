export type TransferResponseDto = {
  transactionId: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  success: boolean;
};
