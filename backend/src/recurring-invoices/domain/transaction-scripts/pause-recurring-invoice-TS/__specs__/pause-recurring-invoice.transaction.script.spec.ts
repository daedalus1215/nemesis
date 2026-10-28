import { PauseRecurringInvoiceTransactionScript } from '../pause-recurring-invoice.transaction.script';
import {
  RecurringInvoice,
  RECURRING_INVOICE_STATUS,
} from '../../../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../../../infra/repositories/recurring-invoice.repository';

describe('PauseRecurringInvoiceTransactionScript', () => {
  let target: PauseRecurringInvoiceTransactionScript;
  let repository: jest.Mocked<
    Pick<RecurringInvoiceRepository, 'findById' | 'save'>
  >;

  const issuerUserId = 10;
  const otherUserId = 30;

  const createRecurringInvoice = (
    overrides?: Partial<RecurringInvoice>,
  ): RecurringInvoice =>
    ({
      id: 1,
      issuerUserId,
      debtorUserId: 20,
      status: RECURRING_INVOICE_STATUS.ACTIVE,
      nextRun: new Date(Date.now() + 86400000),
      ...overrides,
    }) as RecurringInvoice;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(async (entity: RecurringInvoice) => entity),
    };
    target = new PauseRecurringInvoiceTransactionScript(
      repository as unknown as RecurringInvoiceRepository,
    );
  });

  it('should pause it for its issuer', async () => {
    // Arrange
    repository.findById.mockResolvedValue(createRecurringInvoice());

    // Act
    const result = await target.execute(1, issuerUserId);

    // Assert
    expect(result.status).toBe(RECURRING_INVOICE_STATUS.PAUSED);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should refuse anyone else, and save nothing', async () => {
    // Arrange
    repository.findById.mockResolvedValue(createRecurringInvoice());

    // Act & Assert
    await expect(target.execute(1, otherUserId)).rejects.toThrow(
      'Unauthorized: Only the issuer can pause this recurring invoice',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("should refuse anyone else before saying what state it's in", async () => {
    // Arrange
    repository.findById.mockResolvedValue(
      createRecurringInvoice({ status: RECURRING_INVOICE_STATUS.PAUSED }),
    );

    // Act & Assert
    await expect(target.execute(1, otherUserId)).rejects.toThrow(
      'Unauthorized',
    );
    await expect(target.execute(1, issuerUserId)).rejects.toThrow(
      'Can only pause an active recurring invoice',
    );
  });

  it('should throw when it does not exist', async () => {
    // Arrange
    repository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(target.execute(1, issuerUserId)).rejects.toThrow(
      'Recurring invoice not found',
    );
  });
});
