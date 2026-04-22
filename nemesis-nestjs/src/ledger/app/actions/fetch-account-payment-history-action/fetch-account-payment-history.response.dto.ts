export type AccountInfoDto = {
  id: number;
  name: string;
  accountType: string;
};

export type AccountTransactionHistoryResponseDto = {
  transactions: any[];
  currentBalance: number;
  accountInfo: AccountInfoDto;
  success: boolean;
};
