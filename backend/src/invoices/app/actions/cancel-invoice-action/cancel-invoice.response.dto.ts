export type CancelInvoiceResponseDto = {
  success: boolean;
  invoice: InvoiceDto;
};

export type InvoiceDto = {
  id: number;
  issuerUserId: number;
  debtorUserId: number;
  total: number;
  balanceDue: number;
  status: string;
  issueDate: string;
  dueDate: string;
  description?: string;
};
