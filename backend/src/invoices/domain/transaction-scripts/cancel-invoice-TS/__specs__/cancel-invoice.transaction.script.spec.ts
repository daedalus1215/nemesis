import { Test, TestingModule } from '@nestjs/testing';
import { CancelInvoiceTransactionScript } from '../cancel-invoice.transaction.script';
import { InvoiceRepository } from '../../../../infra/repositories/invoice.repository';
import { Invoice, INVOICE_STATUS } from '../../../entities/invoice.entity';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('CancelInvoiceTransactionScript', () => {
  let target: CancelInvoiceTransactionScript;
  let invoiceRepository: jest.Mocked<InvoiceRepository>;

  const invoiceId = 1;

  beforeEach(async () => {
    const mockInvoiceRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelInvoiceTransactionScript,
        { provide: InvoiceRepository, useValue: mockInvoiceRepository },
      ],
    }).compile();

    target = module.get<CancelInvoiceTransactionScript>(
      CancelInvoiceTransactionScript,
    );
    invoiceRepository = module.get(InvoiceRepository);
  });

  describe('execute', () => {
    it('should cancel a draft invoice', async () => {
      // Arrange
      const invoice = createMockInvoice({
        id: invoiceId,
        status: INVOICE_STATUS.DRAFT,
      });
      invoiceRepository.findById.mockResolvedValue(invoice);
      invoiceRepository.update.mockImplementation((inv) =>
        Promise.resolve(inv as Invoice),
      );

      // Act
      const result = await target.execute(invoiceId);

      // Assert
      expect(result.status).toBe(INVOICE_STATUS.CANCELLED);
      expect(result.balanceDue).toBe(0);
      expect(invoiceRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: INVOICE_STATUS.CANCELLED,
          balanceDue: 0,
        }),
      );
    });

    it('should throw when the invoice does not exist', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(target.execute(invoiceId)).rejects.toThrow(
        'Invoice not found',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the invoice is paid', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(
        createMockInvoice({ id: invoiceId, status: INVOICE_STATUS.PAID }),
      );

      // Act & Assert
      await expect(target.execute(invoiceId)).rejects.toThrow(
        'Only draft, sent, or overdue invoices can be cancelled',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when the invoice is already cancelled', async () => {
      // Arrange
      invoiceRepository.findById.mockResolvedValue(
        createMockInvoice({ id: invoiceId, status: INVOICE_STATUS.CANCELLED }),
      );

      // Act & Assert
      await expect(target.execute(invoiceId)).rejects.toThrow(
        'Only draft, sent, or overdue invoices can be cancelled',
      );
      expect(invoiceRepository.update).not.toHaveBeenCalled();
    });
  });
});
