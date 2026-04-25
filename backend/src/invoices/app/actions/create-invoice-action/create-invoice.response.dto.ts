export type CreateInvoiceResponseDto = {
  invoiceId: number;
  debtorUserId: number;
  amount: number;
  description?: string;
  dueDate: string;
  issueDate: string;
  success: boolean;
};
