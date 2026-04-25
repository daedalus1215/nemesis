import { Test, TestingModule } from '@nestjs/testing';
import { FetchInvoicesResponder } from '../fetch-invoices.responder';
import {
  Invoice,
  INVOICE_STATUS,
} from '../../../../domain/entities/invoice.entity';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('FetchInvoicesResponder', () => {
  let target: FetchInvoicesResponder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FetchInvoicesResponder],
    }).compile();

    target = module.get<FetchInvoicesResponder>(FetchInvoicesResponder);
  });

  describe('apply', () => {
    it('should map empty array to response with empty invoices array', () => {
      // Arrange
      const invoices: Invoice[] = [];

      // Act
      const result = target.apply(invoices);

      // Assert
      expect(result).toEqual({
        invoices: [],
        success: true,
      });
    });

    it('should map single invoice to response DTO', () => {
      // Arrange
      const invoice = createMockInvoice();

      // Act
      const result = target.apply([invoice]);

      // Assert
      expect(result.invoices).toHaveLength(1);
      expect(result.invoices[0]).toEqual({
        id: invoice.id,
        issuerUserId: invoice.issuerUserId,
        debtorUserId: invoice.debtorUserId,
        total: Number(invoice.total),
        balanceDue: Number(invoice.balanceDue),
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        description: invoice.description,
      });
      expect(result.success).toBe(true);
    });

    it('should map multiple invoices to response DTO', () => {
      // Arrange
      const invoice1 = createMockInvoice({ id: 1, total: 100.5 });
      const invoice2 = createMockInvoice({ id: 2, total: 200.75 });
      const invoice3 = createMockInvoice({ id: 3, total: 300.25 });

      // Act
      const result = target.apply([invoice1, invoice2, invoice3]);

      // Assert
      expect(result.invoices).toHaveLength(3);
      expect(result.invoices[0].id).toBe(1);
      expect(result.invoices[1].id).toBe(2);
      expect(result.invoices[2].id).toBe(3);
      expect(result.success).toBe(true);
    });

    it('should ensure total and balanceDue are numbers', () => {
      // Arrange
      const invoice = createMockInvoice({
        total: 100.5,
        balanceDue: 50.25,
      });

      // Act
      const result = target.apply([invoice]);

      // Assert
      expect(result.invoices[0].total).toBe(100.5);
      expect(result.invoices[0].balanceDue).toBe(50.25);
      expect(typeof result.invoices[0].total).toBe('number');
      expect(typeof result.invoices[0].balanceDue).toBe('number');
    });

    it('should preserve all invoice statuses', () => {
      // Arrange
      const invoices = [
        createMockInvoice({ id: 1, status: INVOICE_STATUS.DRAFT }),
        createMockInvoice({ id: 2, status: INVOICE_STATUS.SENT }),
        createMockInvoice({ id: 3, status: INVOICE_STATUS.PAID }),
        createMockInvoice({ id: 4, status: INVOICE_STATUS.OVERDUE }),
      ];

      // Act
      const result = target.apply(invoices);

      // Assert
      expect(result.invoices[0].status).toBe(INVOICE_STATUS.DRAFT);
      expect(result.invoices[1].status).toBe(INVOICE_STATUS.SENT);
      expect(result.invoices[2].status).toBe(INVOICE_STATUS.PAID);
      expect(result.invoices[3].status).toBe(INVOICE_STATUS.OVERDUE);
    });

    it('should preserve dates as Date objects', () => {
      // Arrange
      const issueDate = new Date('2024-01-15');
      const dueDate = new Date('2024-02-20');
      const invoice = createMockInvoice({ issueDate, dueDate });

      // Act
      const result = target.apply([invoice]);

      // Assert
      expect(result.invoices[0].issueDate).toBe(issueDate);
      expect(result.invoices[0].dueDate).toBe(dueDate);
      expect(result.invoices[0].issueDate instanceof Date).toBe(true);
      expect(result.invoices[0].dueDate instanceof Date).toBe(true);
    });

    it('should always set success to true', () => {
      // Arrange
      const invoices = [createMockInvoice()];

      // Act
      const result = target.apply(invoices);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should map description when present', () => {
      // Arrange
      const description = 'Test invoice description';
      const invoice = createMockInvoice({ description });

      // Act
      const result = target.apply([invoice]);

      // Assert
      expect(result.invoices[0].description).toBe(description);
    });

    it('should map undefined description when not present', () => {
      // Arrange
      const invoice = createMockInvoice({ description: undefined });

      // Act
      const result = target.apply([invoice]);

      // Assert
      expect(result.invoices[0].description).toBeUndefined();
    });
  });
});
