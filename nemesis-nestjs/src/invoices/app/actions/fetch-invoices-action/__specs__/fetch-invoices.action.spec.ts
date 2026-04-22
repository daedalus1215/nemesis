import { Test, TestingModule } from '@nestjs/testing';
import { FetchInvoicesAction } from '../fetch-invoices.action';
import { InvoiceService } from '../../../../domain/services/invoice.service';
import { FetchInvoicesResponder } from '../fetch-invoices.responder';
import {
  Invoice,
  INVOICE_STATUS,
} from '../../../../domain/entities/invoice.entity';
import { FetchInvoicesRequestDto } from '../fetch-invoices.request.dto';
import { FetchInvoicesResponseDto } from '../fetch-invoices.response.dto';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('FetchInvoicesAction', () => {
  let target: FetchInvoicesAction;
  let invoiceService: jest.Mocked<InvoiceService>;
  let responder: jest.Mocked<FetchInvoicesResponder>;

  const userId = 1;
  const authUser = { userId, username: 'testuser' };

  const createMockResponse = (): FetchInvoicesResponseDto => ({
    invoices: [],
    success: true,
  });

  beforeEach(async () => {
    const mockInvoiceService = {
      getInvoices: jest.fn(),
    };

    const mockResponder = {
      apply: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FetchInvoicesAction],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
        {
          provide: FetchInvoicesResponder,
          useValue: mockResponder,
        },
      ],
    }).compile();

    target = module.get<FetchInvoicesAction>(FetchInvoicesAction);
    invoiceService = module.get(InvoiceService);
    responder = module.get(FetchInvoicesResponder);
  });

  describe('handle', () => {
    it('should fetch invoices and return response DTO', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {};
      const mockInvoices = [createMockInvoice()];
      const mockResponse = createMockResponse();
      invoiceService.getInvoices.mockResolvedValue(mockInvoices);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      const result = await target.handle(authUser, query);

      // Assert
      expect(invoiceService.getInvoices).toHaveBeenCalledWith(
        userId,
        undefined,
      );
      expect(responder.apply).toHaveBeenCalledWith(mockInvoices);
      expect(result).toEqual(mockResponse);
    });

    it('should pass userId and statuses to service', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {
        statuses: [INVOICE_STATUS.SENT, INVOICE_STATUS.PAID],
      };
      const mockInvoices = [createMockInvoice()];
      const mockResponse = createMockResponse();
      invoiceService.getInvoices.mockResolvedValue(mockInvoices);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(authUser, query);

      // Assert
      expect(invoiceService.getInvoices).toHaveBeenCalledWith(
        userId,
        query.statuses,
      );
    });

    it('should pass empty array when no statuses provided', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {};
      const mockInvoices: Invoice[] = [];
      const mockResponse = createMockResponse();
      invoiceService.getInvoices.mockResolvedValue(mockInvoices);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(authUser, query);

      // Assert
      expect(invoiceService.getInvoices).toHaveBeenCalledWith(
        userId,
        undefined,
      );
      expect(responder.apply).toHaveBeenCalledWith([]);
    });

    it('should return empty invoices array when no invoices found', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {};
      const mockInvoices: Invoice[] = [];
      const mockResponse: FetchInvoicesResponseDto = {
        invoices: [],
        success: true,
      };
      invoiceService.getInvoices.mockResolvedValue(mockInvoices);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      const result = await target.handle(authUser, query);

      // Assert
      expect(result.invoices).toHaveLength(0);
      expect(result.success).toBe(true);
    });

    it('should handle multiple invoices', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {};
      const mockInvoices = [
        createMockInvoice({ id: 1 }),
        createMockInvoice({ id: 2 }),
        createMockInvoice({ id: 3 }),
      ];
      const mockResponse: FetchInvoicesResponseDto = {
        invoices: [],
        success: true,
      };
      invoiceService.getInvoices.mockResolvedValue(mockInvoices);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(authUser, query);

      // Assert
      expect(responder.apply).toHaveBeenCalledWith(mockInvoices);
      expect(mockInvoices).toHaveLength(3);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {};
      const error = new Error('Service error');
      invoiceService.getInvoices.mockRejectedValue(error);

      // Act & Assert
      await expect(target.handle(authUser, query)).rejects.toThrow(
        'Service error',
      );
      expect(responder.apply).not.toHaveBeenCalled();
    });

    it('should filter by single status', async () => {
      // Arrange
      const query: FetchInvoicesRequestDto = {
        statuses: [INVOICE_STATUS.PAID],
      };
      const mockInvoices = [createMockInvoice({ status: INVOICE_STATUS.PAID })];
      const mockResponse = createMockResponse();
      invoiceService.getInvoices.mockResolvedValue(mockInvoices);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(authUser, query);

      // Assert
      expect(invoiceService.getInvoices).toHaveBeenCalledWith(userId, [
        INVOICE_STATUS.PAID,
      ]);
    });
  });
});
