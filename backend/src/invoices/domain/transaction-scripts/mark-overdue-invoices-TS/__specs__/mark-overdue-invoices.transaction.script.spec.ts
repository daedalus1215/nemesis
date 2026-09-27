import { Test, TestingModule } from '@nestjs/testing';
import { MarkOverdueInvoicesTransactionScript } from '../mark-overdue-invoices.transaction.script';
import { InvoiceRepository } from '../../../../infra/repositories/invoice.repository';

describe('MarkOverdueInvoicesTransactionScript', () => {
  let target: MarkOverdueInvoicesTransactionScript;
  let invoiceRepository: jest.Mocked<InvoiceRepository>;

  beforeEach(async () => {
    const mockInvoiceRepository = {
      markOverdue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkOverdueInvoicesTransactionScript,
        { provide: InvoiceRepository, useValue: mockInvoiceRepository },
      ],
    }).compile();

    target = module.get<MarkOverdueInvoicesTransactionScript>(
      MarkOverdueInvoicesTransactionScript,
    );
    invoiceRepository = module.get(InvoiceRepository);
  });

  describe('execute', () => {
    it('should use local midnight as the due-date boundary', async () => {
      invoiceRepository.markOverdue.mockResolvedValue(0);

      await target.execute();

      expect(invoiceRepository.markOverdue).toHaveBeenCalledTimes(1);
      const boundary = invoiceRepository.markOverdue.mock
        .calls[0][0] as Date;
      expect(boundary.getHours()).toBe(0);
      expect(boundary.getMinutes()).toBe(0);
      expect(boundary.getSeconds()).toBe(0);
      expect(boundary.getMilliseconds()).toBe(0);
      // The boundary must be today's midnight (not earlier), i.e. within the
      // last 24 hours from now.
      expect(boundary.getTime()).toBeGreaterThan(Date.now() - 24 * 60 * 60 * 1000);
      expect(boundary.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return the number of flipped invoices', async () => {
      invoiceRepository.markOverdue.mockResolvedValue(3);

      const count = await target.execute();

      expect(count).toBe(3);
    });

    it('should return 0 when nothing needed flipping', async () => {
      invoiceRepository.markOverdue.mockResolvedValue(0);

      const count = await target.execute();

      expect(count).toBe(0);
    });
  });
});
