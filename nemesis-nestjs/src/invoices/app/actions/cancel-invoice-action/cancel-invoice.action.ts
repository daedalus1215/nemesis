import { Controller, Param, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { InvoiceService } from '../../../domain/services/invoice.service';
import { CancelInvoiceResponseDto } from './cancel-invoice.response.dto';
import { CancelInvoiceResponder } from './cancel-invoice.responder';

@Controller('invoices')
export class CancelInvoiceAction {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly responder: CancelInvoiceResponder,
  ) {}

  @Post(':invoiceId/cancel')
  @ProtectedAction({
    tag: 'Invoice',
    summary: 'Cancel an invoice',
  })
  async handle(
    @Param('invoiceId') invoiceId: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<CancelInvoiceResponseDto> {
    return this.responder.apply(
      await this.invoiceService.cancelInvoice(Number(invoiceId), user.userId),
    );
  }
}
