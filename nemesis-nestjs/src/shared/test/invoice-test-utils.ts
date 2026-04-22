import {
  Invoice,
  INVOICE_STATUS,
} from '../../invoices/domain/entities/invoice.entity';

export const createMockInvoice = (overrides?: Partial<Invoice>): Invoice => ({
  id: 1,
  issuerUserId: 10,
  debtorUserId: 20,
  total: 100.5,
  balanceDue: 100.5,
  status: INVOICE_STATUS.SENT,
  issueDate: new Date('2024-01-15'),
  dueDate: new Date('2024-02-15'),
  ...overrides,
});
