import { Controller, Param, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { InvoiceService } from '../../../domain/services/invoice.service';
import { SendInvoiceResponseDto } from './send-invoice.response.dto';
import { SendInvoiceResponder } from './send-invoice.responder';

@Controller('invoices')
export class SendInvoiceAction {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly responder: SendInvoiceResponder,
  ) {}

  @Post(':invoiceId/send')
  @ProtectedAction({
    tag: 'Invoice',
    summary: 'Send a draft invoice',
  })
  async handle(
    @Param('invoiceId') invoiceId: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<SendInvoiceResponseDto> {
    return this.responder.apply(
      await this.invoiceService.sendInvoice(Number(invoiceId), user.userId),
    );
  }
}
