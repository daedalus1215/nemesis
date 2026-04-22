import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { InvoiceAppService } from '../../app-service/invoice.app.service';
import { PayInvoiceRequestDto } from './pay-invoice.request.dto';
import { PayInvoiceResponseDto } from './pay-invoice.response.dto';
import { PayInvoiceResponder } from './pay-invoice.responder';

@Controller('invoices')
export class PayInvoiceAction {
  constructor(
    private readonly invoiceAppService: InvoiceAppService,
    private readonly responder: PayInvoiceResponder,
  ) {}

  @Post(':invoiceId/pay')
  @ProtectedAction({
    tag: 'Invoice',
    summary: 'Pay an invoice (full or partial payment)',
  })
  async handle(
    @Param('invoiceId') invoiceId: number,
    @Body() dto: PayInvoiceRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<PayInvoiceResponseDto> {
    return this.responder.apply(
      await this.invoiceAppService.payInvoice(
        Number(invoiceId),
        dto.amount,
        user.userId,
      ),
    );
  }
}
