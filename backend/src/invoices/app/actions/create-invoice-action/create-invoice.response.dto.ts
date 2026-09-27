export type CreateInvoiceResponseDto = {
  invoiceId: number;
  debtorUserId: number;
  amount: number;
  description?: string;
  dueDate: string;
  issueDate: string;
  status: string;
  success: boolean;
};
