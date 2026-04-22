import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceResponder } from '../create-invoice.responder';
import { CreateInvoiceRequestDto } from '../create-invoice.request.dto';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('CreateInvoiceResponder', () => {
  let target: CreateInvoiceResponder;

  const createMockRequestDto = (
    overrides?: Partial<CreateInvoiceRequestDto>,
  ): CreateInvoiceRequestDto => ({
    debtorUserId: 20,
    amount: 100.5,
    dueDate: '2024-02-15',
    description: 'Test invoice description',
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateInvoiceResponder],
    }).compile();

    target = module.get<CreateInvoiceResponder>(CreateInvoiceResponder);
  });

  describe('apply', () => {
    it('should map invoice and request DTO to response DTO', () => {
      // Arrange
      const invoice = createMockInvoice();
      const requestDto = createMockRequestDto();

      // Act
      const result = target.apply(invoice, requestDto);

      // Assert
      expect(result).toEqual({
        invoiceId: invoice.id,
        debtorUserId: invoice.debtorUserId,
        amount: invoice.total,
        description: requestDto.description,
        dueDate: '2024-02-15',
        issueDate: '2024-01-15',
        success: true,
      });
    });

    it('should format dates as YYYY-MM-DD', () => {
      // Arrange
      const invoice = createMockInvoice({
        issueDate: new Date('2024-03-20T10:30:00Z'),
        dueDate: new Date('2024-04-25T15:45:00Z'),
      });
      const requestDto = createMockRequestDto();

      // Act
      const result = target.apply(invoice, requestDto);

      // Assert
      expect(result.issueDate).toBe('2024-03-20');
      expect(result.dueDate).toBe('2024-04-25');
    });

    it('should include description when present in request DTO', () => {
      // Arrange
      const invoice = createMockInvoice();
      const requestDto = createMockRequestDto({
        description: 'Custom invoice description',
      });

      // Act
      const result = target.apply(invoice, requestDto);

      // Assert
      expect(result.description).toBe('Custom invoice description');
    });

    it('should allow undefined description', () => {
      // Arrange
      const invoice = createMockInvoice();
      const requestDto = createMockRequestDto({ description: undefined });

      // Act
      const result = target.apply(invoice, requestDto);

      // Assert
      expect(result.description).toBeUndefined();
    });

    it('should map all invoice fields correctly', () => {
      // Arrange
      const invoice = createMockInvoice({
        id: 999,
        issuerUserId: 100,
        debtorUserId: 200,
        total: 2500.75,
      });
      const requestDto = createMockRequestDto();

      // Act
      const result = target.apply(invoice, requestDto);

      // Assert
      expect(result.invoiceId).toBe(999);
      expect(result.debtorUserId).toBe(200);
      expect(result.amount).toBe(2500.75);
      expect(result.success).toBe(true);
    });

    it('should always set success to true', () => {
      // Arrange
      const invoice = createMockInvoice();
      const requestDto = createMockRequestDto();

      // Act
      const result = target.apply(invoice, requestDto);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
