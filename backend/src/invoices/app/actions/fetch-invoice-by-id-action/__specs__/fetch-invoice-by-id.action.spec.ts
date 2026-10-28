import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FetchInvoiceByIdAction } from '../fetch-invoice-by-id.action';
import { FetchInvoiceByIdResponder } from '../fetch-invoice-by-id.responder';
import { FetchInvoiceByIdResponseDto } from '../fetch-invoice-by-id.response.dto';
import { InvoiceService } from '../../../../domain/services/invoice.service';
import { createMockInvoice } from '../../../../../shared/test/invoice-test-utils';

describe('FetchInvoiceByIdAction', () => {
  let target: FetchInvoiceByIdAction;
  let invoiceService: jest.Mocked<InvoiceService>;
  let responder: jest.Mocked<FetchInvoiceByIdResponder>;

  const userId = 10;
  const authUser = { userId, username: 'testuser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FetchInvoiceByIdAction],
      providers: [
        {
          provide: InvoiceService,
          useValue: { getInvoiceForUser: jest.fn() },
        },
        {
          provide: FetchInvoiceByIdResponder,
          useValue: { apply: jest.fn() },
        },
      ],
    }).compile();

    target = module.get<FetchInvoiceByIdAction>(FetchInvoiceByIdAction);
    invoiceService = module.get(InvoiceService);
    responder = module.get(FetchInvoiceByIdResponder);
  });

  describe('handle', () => {
    it("should return the invoice when it's the user's to see", async () => {
      // Arrange
      const mockInvoice = createMockInvoice({ id: 5 });
      const mockResponse = {
        invoice: { id: 5 },
        success: true,
      } as FetchInvoiceByIdResponseDto;
      invoiceService.getInvoiceForUser.mockResolvedValue(mockInvoice);
      responder.apply.mockReturnValue(mockResponse);

      // Act
      const result = await target.handle(5, authUser);

      // Assert
      expect(invoiceService.getInvoiceForUser).toHaveBeenCalledWith(5, userId);
      expect(responder.apply).toHaveBeenCalledWith(mockInvoice);
      expect(result).toEqual(mockResponse);
    });

    it("should 404 when the invoice is missing or isn't the user's", async () => {
      // Arrange
      invoiceService.getInvoiceForUser.mockResolvedValue(null);

      // Act & Assert
      await expect(target.handle(5, authUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(responder.apply).not.toHaveBeenCalled();
    });
  });
});
