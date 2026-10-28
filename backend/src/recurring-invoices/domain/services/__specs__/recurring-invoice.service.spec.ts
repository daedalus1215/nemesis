import { Test, TestingModule } from '@nestjs/testing';
import { RecurringInvoiceService } from '../recurring-invoice.service';
import { CreateRecurringInvoiceTransactionScript } from '../../transaction-scripts/create-recurring-invoice-TS/create-recurring-invoice.transaction.script';
import { ActivateRecurringInvoiceTransactionScript } from '../../transaction-scripts/activate-recurring-invoice-TS/activate-recurring-invoice.transaction.script';
import { PauseRecurringInvoiceTransactionScript } from '../../transaction-scripts/pause-recurring-invoice-TS/pause-recurring-invoice.transaction.script';
import { CancelRecurringInvoiceTransactionScript } from '../../transaction-scripts/cancel-recurring-invoice-TS/cancel-recurring-invoice.transaction.script';
import { ExecuteScheduleTransactionScript } from '../../transaction-scripts/execute-schedule-TS/execute-schedule.transaction.script';
import { RecurringInvoiceRepository } from '../../../infra/repositories/recurring-invoice.repository';
import { RecurringInvoice } from '../../entities/recurring-invoice.entity';

describe('RecurringInvoiceService', () => {
  let target: RecurringInvoiceService;
  let repository: { findById: jest.Mock };
  let activateTS: { execute: jest.Mock };
  let pauseTS: { execute: jest.Mock };

  const issuerUserId = 10;
  const recurringInvoice = {
    id: 1,
    issuerUserId,
    debtorUserId: 20,
  } as RecurringInvoice;

  beforeEach(async () => {
    repository = { findById: jest.fn() };
    activateTS = { execute: jest.fn() };
    pauseTS = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringInvoiceService,
        { provide: CreateRecurringInvoiceTransactionScript, useValue: {} },
        {
          provide: ActivateRecurringInvoiceTransactionScript,
          useValue: activateTS,
        },
        { provide: PauseRecurringInvoiceTransactionScript, useValue: pauseTS },
        { provide: CancelRecurringInvoiceTransactionScript, useValue: {} },
        { provide: ExecuteScheduleTransactionScript, useValue: {} },
        { provide: RecurringInvoiceRepository, useValue: repository },
      ],
    }).compile();

    target = module.get(RecurringInvoiceService);
  });

  describe('get', () => {
    it('should return it to its issuer', async () => {
      // Arrange
      repository.findById.mockResolvedValue(recurringInvoice);

      // Act & Assert
      expect(await target.get(1, issuerUserId)).toBe(recurringInvoice);
    });

    it.each([
      ['its debtor', 20],
      ['anyone else', 30],
    ])('should return null to %s', async (_, userId) => {
      // Arrange
      repository.findById.mockResolvedValue(recurringInvoice);

      // Act & Assert
      expect(await target.get(1, userId)).toBeNull();
    });

    it('should return null when it does not exist', async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      expect(await target.get(1, issuerUserId)).toBeNull();
    });
  });

  it('should pass the user on to activate and pause', async () => {
    // Act
    await target.activate(1, issuerUserId);
    await target.pause(2, issuerUserId);

    // Assert
    expect(activateTS.execute).toHaveBeenCalledWith(1, issuerUserId);
    expect(pauseTS.execute).toHaveBeenCalledWith(2, issuerUserId);
  });
});
