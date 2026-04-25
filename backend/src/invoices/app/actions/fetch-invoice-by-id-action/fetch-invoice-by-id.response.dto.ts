export type FetchInvoiceByIdResponseDto = {
  invoice: InvoiceDto;
  success: boolean;
};

export type InvoiceDto = {
  id: number;
  issuerUserId: number;
  debtorUserId: number;
  total: number;
  balanceDue: number;
  status: string;
  issueDate: Date;
  dueDate: Date;
  description?: string;
};
