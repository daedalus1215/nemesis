import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../invoice.service';
import { CreateInvoiceTransactionScript } from '../../transaction-scripts/create-invoice-TS/create-invoice.transaction.script';
import { FetchInvoicesTransactionScript } from '../../transaction-scripts/fetch-invoices-TS/fetch-invoices.transaction.script';
import { GetInvoiceByIdTransactionScript } from '../../transaction-scripts/get-invoice-by-id-TS/get-invoice-by-id.transaction.script';
import { UpdateInvoiceStatusTransactionScript } from '../../transaction-scripts/update-invoice-status-TS/update-invoice-status.transaction.script';
import { CancelInvoiceTransactionScript } from '../../transaction-scripts/cancel-invoice-TS/cancel-invoice.transaction.script';
import { PaymentAggregator } from '../../../../payments/domain/aggregators/payment.aggregator';
import { CreateInvoiceRequestDto } from '../../../app/actions/create-invoice-action/create-invoice.request.dto';
import {
  InvoiceStatusType,
  INVOICE_STATUS,
} from '../../entities/invoice.entity';
import { createMockInvoice } from '../../../../shared/test/invoice-test-utils';

describe('InvoiceService', () => {
  let target: InvoiceService;
  let createInvoiceTransactionScript: jest.Mocked<CreateInvoiceTransactionScript>;
  let fetchInvoicesTransactionScript: jest.Mocked<FetchInvoicesTransactionScript>;
  let getInvoiceByIdTransactionScript: jest.Mocked<GetInvoiceByIdTransactionScript>;
  let updateInvoiceStatusTransactionScript: jest.Mocked<UpdateInvoiceStatusTransactionScript>;

  const userId = 1;
  const invoiceId = 1;

  const createValidDto = (
    overrides?: Partial<CreateInvoiceRequestDto>,
  ): CreateInvoiceRequestDto => ({
    debtorUserId: 2,
    amount: 100.5,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    description: 'Test invoice description',
    ...overrides,
  });

  beforeEach(async () => {
    const mockCreateInvoiceTransactionScript = {
      execute: jest.fn(),
    };

    const mockFetchInvoicesTransactionScript = {
      execute: jest.fn(),
    };

    const mockGetInvoiceByIdTransactionScript = {
      execute: jest.fn(),
    };

    const mockUpdateInvoiceStatusTransactionScript = {
      execute: jest.fn(),
    };

    const mockCancelInvoiceTransactionScript = {
      execute: jest.fn(),
    };

    const mockPaymentAggregator = {
      hasPaymentApplications: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: CreateInvoiceTransactionScript,
          useValue: mockCreateInvoiceTransactionScript,
        },
        {
          provide: FetchInvoicesTransactionScript,
          useValue: mockFetchInvoicesTransactionScript,
        },
        {
          provide: GetInvoiceByIdTransactionScript,
          useValue: mockGetInvoiceByIdTransactionScript,
        },
        {
          provide: UpdateInvoiceStatusTransactionScript,
          useValue: mockUpdateInvoiceStatusTransactionScript,
        },
        {
          provide: CancelInvoiceTransactionScript,
          useValue: mockCancelInvoiceTransactionScript,
        },
        {
          provide: PaymentAggregator,
          useValue: mockPaymentAggregator,
        },
      ],
    }).compile();

    target = module.get<InvoiceService>(InvoiceService);
    createInvoiceTransactionScript = module.get(CreateInvoiceTransactionScript);
    fetchInvoicesTransactionScript = module.get(FetchInvoicesTransactionScript);
    getInvoiceByIdTransactionScript = module.get(
      GetInvoiceByIdTransactionScript,
    );
    updateInvoiceStatusTransactionScript = module.get(
      UpdateInvoiceStatusTransactionScript,
    );
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      // Arrange
      const dto = createValidDto();
      const mockInvoice = createMockInvoice({
        issuerUserId: userId,
        debtorUserId: dto.debtorUserId,
        total: dto.amount,
        balanceDue: dto.amount,
      });
      createInvoiceTransactionScript.execute.mockResolvedValue(mockInvoice);

      // Act
      const result = await target.createInvoice(dto, userId);

      // Assert
      expect(result).toEqual(mockInvoice);
      expect(createInvoiceTransactionScript.execute).toHaveBeenCalledWith(
        dto,
        userId,
      );
    });
  });

  describe('getInvoices', () => {
    it('should fetch invoices for a user', async () => {
      // Arrange
      const mockInvoices = [
        createMockInvoice({ issuerUserId: userId }),
        createMockInvoice({ issuerUserId: userId }),
      ];
      fetchInvoicesTransactionScript.execute.mockResolvedValue(mockInvoices);

      // Act
      const result = await target.getInvoices(userId);

      // Assert
      expect(result).toEqual(mockInvoices);
      expect(fetchInvoicesTransactionScript.execute).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });

    it('should fetch invoices with status filter', async () => {
      // Arrange
      const statuses: InvoiceStatusType[] = [
        INVOICE_STATUS.SENT,
        INVOICE_STATUS.PAID,
      ];
      const mockInvoices = [createMockInvoice({ status: INVOICE_STATUS.SENT })];
      fetchInvoicesTransactionScript.execute.mockResolvedValue(mockInvoices);

      // Act
      const result = await target.getInvoices(userId, statuses);

      // Assert
      expect(result).toEqual(mockInvoices);
      expect(fetchInvoicesTransactionScript.execute).toHaveBeenCalledWith(
        userId,
        statuses,
      );
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice when found', async () => {
      // Arrange
      const mockInvoice = createMockInvoice({ id: invoiceId });
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(mockInvoice);

      // Act
      const result = await target.getInvoiceById(invoiceId);

      // Assert
      expect(result).toEqual(mockInvoice);
      expect(getInvoiceByIdTransactionScript.execute).toHaveBeenCalledWith(
        invoiceId,
      );
    });

    it('should return null when invoice not found', async () => {
      // Arrange
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(null);

      // Act
      const result = await target.getInvoiceById(invoiceId);

      // Assert
      expect(result).toBeNull();
      expect(getInvoiceByIdTransactionScript.execute).toHaveBeenCalledWith(
        invoiceId,
      );
    });
  });

  describe('applyPaymentToInvoice', () => {
    it('should throw error when invoice not found', async () => {
      // Arrange
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(null);

      // Act & Assert
      await expect(target.applyPaymentToInvoice(invoiceId, 50)).rejects.toThrow(
        'Invoice not found',
      );
      expect(
        updateInvoiceStatusTransactionScript.execute,
      ).not.toHaveBeenCalled();
    });

    it('should throw error when payment amount exceeds balance due', async () => {
      // Arrange
      const mockInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 100,
      });
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(mockInvoice);

      // Act & Assert
      await expect(
        target.applyPaymentToInvoice(invoiceId, 150),
      ).rejects.toThrow('Payment amount (150) exceeds balance due (100)');
      expect(
        updateInvoiceStatusTransactionScript.execute,
      ).not.toHaveBeenCalled();
    });

    it('should update invoice status to PAID when balance reaches zero', async () => {
      // Arrange
      const paymentAmount = 100;
      const mockInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 100,
        status: INVOICE_STATUS.SENT,
      });
      const updatedInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 0,
        status: INVOICE_STATUS.PAID,
      });
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(mockInvoice);
      updateInvoiceStatusTransactionScript.execute.mockResolvedValue(
        updatedInvoice,
      );

      // Act
      const result = await target.applyPaymentToInvoice(
        invoiceId,
        paymentAmount,
      );

      // Assert
      expect(result).toEqual(updatedInvoice);
      expect(updateInvoiceStatusTransactionScript.execute).toHaveBeenCalledWith(
        invoiceId,
        0,
        INVOICE_STATUS.PAID,
      );
    });

    it('should keep current status when balance does not reach zero', async () => {
      // Arrange
      const paymentAmount = 50;
      const mockInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 100,
        status: INVOICE_STATUS.SENT,
      });
      const updatedInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 50,
        status: INVOICE_STATUS.SENT,
      });
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(mockInvoice);
      updateInvoiceStatusTransactionScript.execute.mockResolvedValue(
        updatedInvoice,
      );

      // Act
      const result = await target.applyPaymentToInvoice(
        invoiceId,
        paymentAmount,
      );

      // Assert
      expect(result).toEqual(updatedInvoice);
      expect(updateInvoiceStatusTransactionScript.execute).toHaveBeenCalledWith(
        invoiceId,
        50,
        INVOICE_STATUS.SENT,
      );
    });

    it('should apply partial payment correctly', async () => {
      // Arrange
      const paymentAmount = 30;
      const mockInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 100,
        status: INVOICE_STATUS.OVERDUE,
      });
      const updatedInvoice = createMockInvoice({
        id: invoiceId,
        balanceDue: 70,
        status: INVOICE_STATUS.OVERDUE,
      });
      getInvoiceByIdTransactionScript.execute.mockResolvedValue(mockInvoice);
      updateInvoiceStatusTransactionScript.execute.mockResolvedValue(
        updatedInvoice,
      );

      // Act
      const result = await target.applyPaymentToInvoice(
        invoiceId,
        paymentAmount,
      );

      // Assert
      expect(result).toEqual(updatedInvoice);
      expect(updateInvoiceStatusTransactionScript.execute).toHaveBeenCalledWith(
        invoiceId,
        70,
        INVOICE_STATUS.OVERDUE,
      );
    });
  });
});
