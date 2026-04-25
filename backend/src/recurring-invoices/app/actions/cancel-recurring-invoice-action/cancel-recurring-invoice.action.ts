import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  AuthUser,
  GetAuthUser,
} from '../../../../auth/app/decorators/get-auth-user.decorator';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceService } from '../../../domain/services/recurring-invoice.service';
import { CancelRecurringInvoiceResponseDto } from './cancel-recurring-invoice.response.dto';
import { CancelRecurringInvoiceResponder } from './cancel-recurring-invoice.responder';

@Controller('recurring-invoices')
export class CancelRecurringInvoiceAction {
  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly responder: CancelRecurringInvoiceResponder,
  ) {}

  @Post(':id/cancel')
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'Cancel a recurring invoice permanently',
  })
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<CancelRecurringInvoiceResponseDto> {
    const entity = await this.recurringInvoiceService.cancel(id, user.userId);
    return this.responder.apply(entity);
  }
}
