import { Controller, Get, Param } from '@nestjs/common';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { InvoiceService } from '../../../domain/services/invoice.service';
import { FetchInvoiceByIdResponseDto } from './fetch-invoice-by-id.response.dto';
import { FetchInvoiceByIdResponder } from './fetch-invoice-by-id.responder';

@Controller('invoices')
export class FetchInvoiceByIdAction {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly responder: FetchInvoiceByIdResponder,
  ) {}

  @Get('/detail/:invoiceId')
  @ProtectedAction({
    tag: 'Invoice',
    summary: 'Get a single invoice by ID',
  })
  async handle(
    @Param('invoiceId') invoiceId: number,
  ): Promise<FetchInvoiceByIdResponseDto> {
    const invoice = await this.invoiceService.getInvoiceById(Number(invoiceId));

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return this.responder.apply(invoice);
  }
}
