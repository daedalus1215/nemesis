export type FetchAccountByIdResponseDto = {
  id: number;
  name: string;
  accountType: string;
  isDefault: boolean;
  createdAt: Date;
};
