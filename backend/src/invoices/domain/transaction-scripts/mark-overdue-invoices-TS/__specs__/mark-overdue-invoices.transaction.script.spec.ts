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
    it('should use today\'s local calendar day as the due-date boundary', async () => {
      invoiceRepository.markOverdue.mockResolvedValue(0);

      await target.execute();

      expect(invoiceRepository.markOverdue).toHaveBeenCalledTimes(1);
      // The boundary is a 'YYYY-MM-DD' string — today in the *local*
      // calendar. A Date parameter would carry a timezone offset that
      // shifts the `date < ?` cutoff by a day.
      const boundary = invoiceRepository.markOverdue.mock
        .calls[0][0] as string;
      expect(boundary).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const now = new Date();
      expect(boundary).toBe(
        [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, '0'),
          String(now.getDate()).padStart(2, '0'),
        ].join('-'),
      );
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
