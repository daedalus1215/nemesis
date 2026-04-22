export type FetchUserAccountsResponseDto = {
  accounts: UserAccountDto[];
  success: boolean;
};

export type UserAccountDto = {
  id: number;
  name: string;
  accountType: string;
  isDefault: boolean;
  createdAt: Date;
  balance: number;
};
