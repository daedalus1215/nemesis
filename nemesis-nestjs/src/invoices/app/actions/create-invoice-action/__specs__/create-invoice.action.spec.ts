import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceAction } from '../create-invoice.action';
import { InvoiceService } from '../../../../domain/services/invoice.service';
import { CreateInvoiceResponder } from '../create-invoice.responder';
import { CreateInvoiceRequestDto } from '../create-invoice.request.dto';
import { CreateInvoiceResponseDto } from '../create-invoice.response.dto';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('CreateInvoiceAction', () => {
  let target: CreateInvoiceAction;
  let invoiceService: jest.Mocked<InvoiceService>;
  let responder: jest.Mocked<CreateInvoiceResponder>;

  const userId = 1;
  const authUser = { userId, username: 'testuser' };

  const createValidDto = (
    overrides?: Partial<CreateInvoiceRequestDto>,
  ): CreateInvoiceRequestDto => ({
    debtorUserId: 2,
    amount: 100.5,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    description: 'Test invoice description',
    ...overrides,
  });

  const createMockResponse = (): CreateInvoiceResponseDto => ({
    invoiceId: 1,
    debtorUserId: 2,
    amount: 100.5,
    description: 'Test invoice description',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    success: true,
  });

  beforeEach(async () => {
    const mockInvoiceService = {
      createInvoice: jest.fn(),
    };

    const mockResponder = {
      apply: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateInvoiceAction],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
        {
          provide: CreateInvoiceResponder,
          useValue: mockResponder,
        },
      ],
    }).compile();

    target = module.get<CreateInvoiceAction>(CreateInvoiceAction);
    invoiceService = module.get(InvoiceService);
    responder = module.get(CreateInvoiceResponder);
  });

  describe('handle', () => {
    it('should create invoice and return response DTO', async () => {
      // Arrange
      const dto = createValidDto();
      const mockInvoice = createMockInvoice({
        issuerUserId: userId,
        debtorUserId: 2,
        total: 100.5,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 86400000),
      });
      const mockResponse = createMockResponse();
      invoiceService.createInvoice.mockResolvedValue(mockInvoice);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      const result = await target.handle(dto, authUser);

      // Assert
      expect(invoiceService.createInvoice).toHaveBeenCalledWith(dto, userId);
      expect(responder.apply).toHaveBeenCalledWith(mockInvoice, dto);
      expect(result).toEqual(mockResponse);
    });

    it('should pass correct userId to service', async () => {
      // Arrange
      const dto = createValidDto();
      const mockInvoice = createMockInvoice({
        issuerUserId: userId,
        debtorUserId: 2,
        total: 100.5,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 86400000),
      });
      const mockResponse = createMockResponse();
      invoiceService.createInvoice.mockResolvedValue(mockInvoice);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(dto, authUser);

      // Assert
      expect(invoiceService.createInvoice).toHaveBeenCalledWith(
        dto,
        authUser.userId,
      );
    });

    it('should pass invoice and DTO to responder', async () => {
      // Arrange
      const dto = createValidDto();
      const mockInvoice = createMockInvoice({
        issuerUserId: userId,
        debtorUserId: 2,
        total: 100.5,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 86400000),
      });
      const mockResponse = createMockResponse();
      invoiceService.createInvoice.mockResolvedValue(mockInvoice);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(dto, authUser);

      // Assert
      expect(responder.apply).toHaveBeenCalledWith(mockInvoice, dto);
    });

    it('should handle invoice without description', async () => {
      // Arrange
      const dto = createValidDto({ description: undefined });
      const mockInvoice = createMockInvoice({
        issuerUserId: userId,
        debtorUserId: 2,
        total: 100.5,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 86400000),
      });
      const mockResponse = createMockResponse();
      invoiceService.createInvoice.mockResolvedValue(mockInvoice);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      await target.handle(dto, authUser);

      // Assert
      expect(invoiceService.createInvoice).toHaveBeenCalledWith(dto, userId);
      expect(responder.apply).toHaveBeenCalledWith(mockInvoice, dto);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const dto = createValidDto();
      const error = new Error('Service error');
      invoiceService.createInvoice.mockRejectedValue(error);

      // Act & Assert
      await expect(target.handle(dto, authUser)).rejects.toThrow(
        'Service error',
      );
      expect(responder.apply).not.toHaveBeenCalled();
    });
  });
});
