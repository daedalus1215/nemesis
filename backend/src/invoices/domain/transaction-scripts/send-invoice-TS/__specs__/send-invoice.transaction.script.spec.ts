import { Test, TestingModule } from '@nestjs/testing';
import { SendInvoiceTransactionScript } from '../send-invoice.transaction.script';
import { InvoiceRepository } from '../../../../infra/repositories/invoice.repository';
import { Invoice, INVOICE_STATUS } from '../../../entities/invoice.entity';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('SendInvoiceTransactionScript', () => {
  let target: SendInvoiceTransactionScript;
  let invoiceRepository: jest.Mocked<InvoiceRepository>;

  const issuerUserId = 10;
  const invoiceId = 1;

  // Due date 2 days from now (local midnight)
  const futureDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const draftInvoice = () =>
    createMockInvoice({
      id: invoiceId,
      issuerUserId,
      status: INVOICE_STATUS.DRAFT,
      dueDate: futureDueDate(),
    });

  beforeEach(async () => {
    const mockInvoiceRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendInvoiceTransactionScript,
        { provide: InvoiceRepository, useValue: mockInvoiceRepository },
      ],
    }).compile();

    target = module.get<SendInvoiceTransactionScript>(
      SendInvoiceTransactionScript,
    );
    invoiceRepository = module.get(InvoiceRepository);
  });

  describe('execute', () => {
    it('should send a draft invoice', async () => {
      // Arrange
      const invoice = draftInvoice();
      invoiceRepository.findById.mockResolvedValue(invoice);
      invoiceRepository.update.mockImplementation((inv) =>
        Promise.resolve(inv as Invoice),
      );

      // Act
      const result = await target.execute(invoiceId, issuerUserId);

      // Assert
      expect(result.status).toBe(INVOICE_STATUS.SENT);
      expect(invoiceRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: INVOICE_STATUS.SENT }),
      );
    });

    it('should throw when the invoice does not exist', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(target.execute(invoiceId, issuerUserId)).rejects.toThrow(
        'Invoice not found',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the caller is not the issuer', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(draftInvoice());

      // Act & Assert
      await expect(target.execute(invoiceId, 999)).rejects.toThrow(
        'Unauthorized: Only the issuer can send this invoice',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the invoice is not a draft', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(
        createMockInvoice({
          id: invoiceId,
          issuerUserId,
          status: INVOICE_STATUS.SENT,
          dueDate: futureDueDate(),
        }),
      );

      // Act & Assert
      await expect(target.execute(invoiceId, issuerUserId)).rejects.toThrow(
        'Only draft invoices can be sent',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the due date has passed', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(
        createMockInvoice({
          id: invoiceId,
          issuerUserId,
          status: INVOICE_STATUS.DRAFT,
          dueDate: new Date(Date.now() - 86400000),
        }),
      );

      // Act & Assert
      await expect(target.execute(invoiceId, issuerUserId)).rejects.toThrow(
        'Due date has passed',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    // The `date` column hydrates as a 'YYYY-MM-DD' string at runtime (the
    // entity type says Date, but Postgres returns text). Calendar-day
    // semantics must hold for that shape — a string-vs-Date relational
    // comparison degrades to NaN and never throws.
    it('should reject a lapsed draft when dueDate hydrates as a string', async () => {
      // Arrange
      const now = new Date();
      const todayStr = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');
      invoiceRepository.findById.mockResolvedValue(
        createMockInvoice({
          id: invoiceId,
          issuerUserId,
          status: INVOICE_STATUS.DRAFT,
          dueDate: todayStr as unknown as Date,
        }),
      );

      // Act & Assert
      await expect(target.execute(invoiceId, issuerUserId)).rejects.toThrow(
        'Due date has passed',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    it('should send a future-dated draft when dueDate hydrates as a string', async () => {
      // Arrange
      const future = new Date();
      future.setDate(future.getDate() + 1);
      const futureStr = [
        future.getFullYear(),
        String(future.getMonth() + 1).padStart(2, '0'),
        String(future.getDate()).padStart(2, '0'),
      ].join('-');
      invoiceRepository.findById.mockResolvedValue(
        createMockInvoice({
          id: invoiceId,
          issuerUserId,
          status: INVOICE_STATUS.DRAFT,
          dueDate: futureStr as unknown as Date,
        }),
      );

      // Act & Assert
      await target.execute(invoiceId, issuerUserId);
      expect(invoiceRepository.update).toHaveBeenCalledTimes(1);
    });
  });
});
