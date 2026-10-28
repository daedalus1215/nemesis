import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
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
    @GetAuthUser() user: AuthUser,
  ): Promise<FetchInvoiceByIdResponseDto> {
    const invoice = await this.invoiceService.getInvoiceForUser(
      Number(invoiceId),
      user.userId,
    );

    // Someone else's invoice is "not found" too: no hint that it exists.
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.responder.apply(invoice);
  }
}
